import { userService } from '@server/src/core/services/user.service';
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
import { logger } from '@server/src/core/logger';
import { asyncHandler } from '@server/src/core/errors';

const router = Router();

// Validation schemas
const createBookmarkSchema = z.object({
	threadId: z.number().int().positive()
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
				return res.status(401).json({
					success: false,
					error: 'User not authenticated'
				});
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
				return res.status(409).json({
					success: false,
					error: 'Thread already bookmarked'
				});
			}

			// Create bookmark
			await db.insert(userThreadBookmarks).values({
				userId,
				threadId: validatedData.threadId,
				createdAt: new Date()
			});

			res.status(201).json({
				success: true,
				message: 'Thread bookmarked successfully'
			});
		} catch (error) {
			logger.error('BookmarkRoutes', 'Error in POST /bookmarks', { error });

			if (error instanceof z.ZodError) {
				return res.status(400).json({
					success: false,
					error: 'Invalid input data',
					details: error.errors
				});
			}

			res.status(500).json({
				success: false,
				error: 'Failed to create bookmark'
			});
		}
	})
);

// Delete bookmark
router.delete(
	'/:threadId',
	requireAuth,
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const threadId = parseInt(req.params.threadId);
			const userId = (userService.getUserFromRequest(req) as any)?.id;

			if (!userId) {
				return res.status(401).json({
					success: false,
					error: 'User not authenticated'
				});
			}

			const result = await db
				.delete(userThreadBookmarks)
				.where(
					and(eq(userThreadBookmarks.userId, userId), eq(userThreadBookmarks.threadId, threadId))
				);

			res.json({
				success: true,
				message: 'Bookmark removed successfully'
			});
		} catch (error) {
			logger.error('BookmarkRoutes', 'Error in DELETE /bookmarks/:threadId', { error });
			res.status(500).json({
				success: false,
				error: 'Failed to remove bookmark'
			});
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
				return res.status(401).json({
					success: false,
					error: 'User not authenticated'
				});
			}

			const bookmarks = await db
				.select()
				.from(userThreadBookmarks)
				.where(eq(userThreadBookmarks.userId, userId))
				.limit(limit)
				.offset(offset)
				.orderBy(userThreadBookmarks.createdAt);

			// TODO: Join with threads table to get thread details

			res.json({
				success: true,
				data: bookmarks,
				pagination: {
					page,
					limit,
					offset
				}
			});
		} catch (error) {
			logger.error('BookmarkRoutes', 'Error in GET /bookmarks', { error });
			res.status(500).json({
				success: false,
				error: 'Failed to fetch bookmarks'
			});
		}
	})
);

export default router;
