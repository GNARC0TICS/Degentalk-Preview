import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { userService } from '@core/services/user.service';
import { z } from 'zod';
import { db } from '@db';
import { moderatorNotes, moderatorNoteTypeEnum } from '@schema';
import { eq, and, desc } from 'drizzle-orm';
import { isAdminOrModerator } from '../../../auth/middleware/auth.middleware';
import { getUserIdFromRequest } from '@server-utils/auth';
import { logger } from '@core/logger';
import type { EntityId } from '@shared/types/ids';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

const router: RouterType = Router();

// Validation schemas
const createModeratorNoteSchema = z.object({
	type: z.enum(['thread', 'post', 'user']),
	itemId: z.union([z.string(), z.number()]).transform(String),
	note: z.string().min(1).max(1000)
});

const getModeratorNotesSchema = z.object({
	type: z.enum(['thread', 'post', 'user']),
	itemId: z.union([z.string(), z.number()]).transform(String)
});

// Create a new moderator note
router.post('/', isAdminOrModerator, async (req, res) => {
	try {
		const validatedData = createModeratorNoteSchema.parse(req.body);
		const userId = getUserIdFromRequest(req);

		if (!userId) {
			return sendErrorResponse(res, 'Unauthorized', 401);
		}

		const [note] = await db
			.insert(moderatorNotes)
			.values({
				...validatedData,
				createdBy: userId
			})
			.returning();

		logger.info('ModeratorNotes', 'Created moderator note', {
			noteId: note.id,
			type: note.type,
			itemId: note.itemId,
			createdBy: userId
		});

		sendSuccessResponse(res, note);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return sendErrorResponse(res, 'Invalid request data', 400);
		}

		logger.error('ModeratorNotes', 'Error creating moderator note', {
			error,
			body: req.body
		});

		sendErrorResponse(res, 'Internal server error', 500);
	}
});

// Get moderator notes for a specific item
router.get('/', isAdminOrModerator, async (req, res) => {
	try {
		const validatedQuery = getModeratorNotesSchema.parse(req.query);

		const notes = await db
			.select()
			.from(moderatorNotes)
			.where(
				and(
					eq(moderatorNotes.type, validatedQuery.type as any),
					eq(moderatorNotes.itemId, validatedQuery.itemId)
				)
			)
			.orderBy(desc(moderatorNotes.createdAt));

		sendSuccessResponse(res, notes);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return sendErrorResponse(res, 'Invalid query parameters', 400);
		}

		logger.error('ModeratorNotes', 'Error fetching moderator notes', {
			error,
			query: req.query
		});

		sendErrorResponse(res, 'Internal server error', 500);
	}
});

// Delete a moderator note (admin only)
router.delete('/:id', isAdminOrModerator, async (req, res) => {
	try {
		const noteId = req.params.id as EntityId;
		const userId = getUserIdFromRequest(req);

		// Check if note exists and user can delete it
		const [existingNote] = await db
			.select()
			.from(moderatorNotes)
			.where(eq(moderatorNotes.id, noteId))
			.limit(1);

		if (!existingNote) {
			return sendErrorResponse(res, 'Note not found', 404);
		}

		// Only allow deletion by the creator or admins
		const isAdmin = userService.getUserFromRequest(req)?.role === 'admin';
		if (existingNote.createdBy !== userId && !isAdmin) {
			return sendErrorResponse(res, 'You can only delete your own notes', 403);
		}

		await db.delete(moderatorNotes).where(eq(moderatorNotes.id, noteId));

		logger.info('ModeratorNotes', 'Deleted moderator note', {
			noteId,
			deletedBy: userId
		});

		sendSuccessResponse(res, null);
	} catch (error) {
		logger.error('ModeratorNotes', 'Error deleting moderator note', {
			error,
			noteId: req.params.id
		});

		sendErrorResponse(res, 'Internal server error', 500);
	}
});

export default router;
