import { userService } from '@server/src/core/services/user.service';
/**
 * Content Routes
 *
 * Provides unified content feed endpoints for homepage and forum pages
 * Supports trending, recent, and following tabs
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { logger } from '../../../core/logger';
import { isAuthenticatedOptional } from '../../auth/middleware/auth.middleware';
import { threadService } from '../services/thread.service';
import { asyncHandler } from '@server/src/core/errors';
import type { ForumId } from '@shared/types/ids';
import { ForumTransformer } from '../transformers/forum.transformer';

const router = Router();

interface ContentQuery {
	tab: 'trending' | 'recent' | 'following';
	page?: number;
	limit?: number;
	forumId?: ForumId;
}

router.get(
	'/',
	isAuthenticatedOptional,
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const {
				tab = 'trending',
				page = 1,
				limit = 20,
				forumId
			} = req.query as unknown as ContentQuery;

			const pageNum = Math.max(1, Number(page) || 1);
			const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

			// Map content tabs to thread service sort types
			let sortBy: 'trending' | 'newest' | 'oldest' | 'mostReplies' | 'mostViews' = 'newest';
			switch (tab) {
				case 'trending':
					sortBy = 'trending';
					break;
				case 'recent':
					sortBy = 'newest';
					break;
				case 'following':
					// TODO: Add following support in ThreadService
					sortBy = 'newest';
					break;
			}

			// Use unified thread service
			const result = await threadService.searchThreads({
				structureId: forumId ? forumId : undefined,
				page: pageNum,
				limit: limitNum,
				sortBy,
				status: 'active',
				followingUserId: tab === 'following' ? userService.getUserFromRequest(req)?.id : undefined
			});

			// Get user context for permissions and personalization
			const requestingUser = userService.getUserFromRequest(req);
			
			// Transform threads using ForumTransformer based on user context
			const transformedThreads = result.threads.map(thread => {
				return requestingUser ? 
					ForumTransformer.toSlimThread(thread) :
					ForumTransformer.toPublicThread(thread);
			});

			// Return unified ThreadDisplay format (includes zone data)
			res.json({
				items: transformedThreads,
				meta: {
					hasMore: result.page < result.totalPages,
					total: result.total,
					page: result.page
				}
			});
		} catch (error) {
			logger.error('ContentRoutes', 'Error fetching content', { error });
			res.status(500).json({ error: 'Failed to fetch content' });
		}
	})
);

export default router;
