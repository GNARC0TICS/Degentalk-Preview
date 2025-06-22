import { Router } from 'express';
import { z } from 'zod';
import { db } from '@db';
import { moderatorNotes, moderatorNoteTypeEnum } from '@schema';
import { eq, and, desc } from 'drizzle-orm';
import { isAdminOrModerator } from '../../../auth/middleware/auth.middleware';
import { getUserIdFromRequest } from '@server-utils/auth';
import { logger } from '@server-core/logger';

const router = Router();

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
			return res.status(401).json({ error: 'Unauthorized' });
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

		res.status(201).json(note);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({
				error: 'Invalid request data',
				details: error.flatten()
			});
		}

		logger.error('ModeratorNotes', 'Error creating moderator note', {
			error,
			body: req.body
		});

		res.status(500).json({ error: 'Internal server error' });
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

		res.json(notes);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({
				error: 'Invalid query parameters',
				details: error.flatten()
			});
		}

		logger.error('ModeratorNotes', 'Error fetching moderator notes', {
			error,
			query: req.query
		});

		res.status(500).json({ error: 'Internal server error' });
	}
});

// Delete a moderator note (admin only)
router.delete('/:id', isAdminOrModerator, async (req, res) => {
	try {
		const noteId = parseInt(req.params.id);
		const userId = getUserIdFromRequest(req);

		if (isNaN(noteId)) {
			return res.status(400).json({ error: 'Invalid note ID' });
		}

		// Check if note exists and user can delete it
		const [existingNote] = await db
			.select()
			.from(moderatorNotes)
			.where(eq(moderatorNotes.id, noteId))
			.limit(1);

		if (!existingNote) {
			return res.status(404).json({ error: 'Note not found' });
		}

		// Only allow deletion by the creator or admins
		const isAdmin = req.user?.role === 'admin';
		if (existingNote.createdBy !== userId && !isAdmin) {
			return res.status(403).json({ error: 'You can only delete your own notes' });
		}

		await db.delete(moderatorNotes).where(eq(moderatorNotes.id, noteId));

		logger.info('ModeratorNotes', 'Deleted moderator note', {
			noteId,
			deletedBy: userId
		});

		res.status(204).send();
	} catch (error) {
		logger.error('ModeratorNotes', 'Error deleting moderator note', {
			error,
			noteId: req.params.id
		});

		res.status(500).json({ error: 'Internal server error' });
	}
});

export default router;