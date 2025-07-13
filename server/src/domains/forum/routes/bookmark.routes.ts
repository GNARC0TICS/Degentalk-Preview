import { userService } from '@core/services/user.service';
/**
 * Bookmark Routes
 *
 * QUALITY IMPROVEMENT: Extracted from forum.routes.ts god object
 * Handles bookmark-specific API endpoints with proper separation of concerns
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '@db';
import { userThreadBookmarks } from '@schema';
import { eq, and } from 'drizzle-orm';
import { isAuthenticated as requireAuth } from '../../auth/middleware/auth.middleware';
import { logger } from '@core/logger';
import { asyncHandler } from '@core/errors';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

const router = Router();

// Validation schemas
const createBookmarkSchema = z.object({
	threadId: z.string().uuid('Invalid threadId format')
});

// Create bookmark
router.post(
	'/',
	requireAuth,
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const validatedData = createBookmarkSchema.parse(req.body);
			const userId = (userService.getUserFromRequest(req) as any)?.id;

			if (!userId) {
				return sendErrorResponse(res, 'User not authenticated', 401);
			}

			// Check if bookmark already exists
			const existingBookmark = await db
				.select()
				.from(userThreadBookmarks)
				.where(
					and(
						eq(userThreadBookmarks.userId, userId),
						eq(userThreadBookmarks.threadId, validatedData.threadId)
					)
				)
				.limit(1);

			if (existingBookmark.length > 0) {
				return sendErrorResponse(res, 'Thread already bookmarked', 409);
			}

			// Create bookmark
			await db.insert(userThreadBookmarks).values({
				userId,
				threadId: validatedData.threadId,
				createdAt: new Date()
			});

			res.status(201);
			sendSuccessResponse(res, null, 'Thread bookmarked successfully');
		} catch (error) {
			logger.error('BookmarkRoutes', 'Error in POST /bookmarks', { error });

			if (error instanceof z.ZodError) {
				return sendErrorResponse(res, 'Invalid input data', 400);
			}

			return sendErrorResponse(res, 'Failed to create bookmark', 500);
		}
	})
);

// Delete bookmark
router.delete(
	'/:threadId',
	requireAuth,
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const threadId = req.params.threadId; // Note: Consider adding ThreadId type if needed
			const userId = (userService.getUserFromRequest(req) as any)?.id;

			if (!userId) {
				return sendErrorResponse(res, 'User not authenticated', 401);
			}

			const result = await db
				.delete(userThreadBookmarks)
				.where(
					and(eq(userThreadBookmarks.userId, userId), eq(userThreadBookmarks.threadId, threadId))
				);

			sendSuccessResponse(res, null, 'Bookmark removed successfully');
		} catch (error) {
			logger.error('BookmarkRoutes', 'Error in DELETE /bookmarks/:threadId', { error });
			return sendErrorResponse(res, 'Failed to remove bookmark', 500);
		}
	})
);

// Get user bookmarks
router.get(
	'/',
	requireAuth,
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const userId = (userService.getUserFromRequest(req) as any)?.id;
			const page = parseInt(req.query.page as string) || 1;
			const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
			const offset = (page - 1) * limit;

			if (!userId) {
				return sendErrorResponse(res, 'User not authenticated', 401);
			}

			const bookmarks = await db
				.select()
				.from(userThreadBookmarks)
				.where(eq(userThreadBookmarks.userId, userId))
				.limit(limit)
				.offset(offset)
				.orderBy(userThreadBookmarks.createdAt);

			// TODO: Join with threads table to get thread details
			// Note: Raw bookmarks data returned as this is just bookmark metadata
			// If/when we add thread details, we'll need to transform the thread data

			sendSuccessResponse(res, {
				bookmarks,
				pagination: {
					page,
					limit,
					offset
				}
			});
		} catch (error) {
			logger.error('BookmarkRoutes', 'Error in GET /bookmarks', { error });
			return sendErrorResponse(res, 'Failed to fetch bookmarks', 500);
		}
	})
);

export default router;
