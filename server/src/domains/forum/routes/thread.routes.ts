import { userService } from '@server/src/core/services/user.service';
/**
 * Thread Routes
 *
 * QUALITY IMPROVEMENT: Extracted from forum.routes.ts god object
 * Handles thread-specific API endpoints with proper separation of concerns
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import {
	isAuthenticated as requireAuth,
	isAdminOrModerator
} from '../../auth/middleware/auth.middleware';
import {
	requireThreadSolvePermission,
	requireThreadTagPermission
} from '../services/permissions.service';
import { forumController } from '../forum.controller';
import { threadService } from '../services/thread.service';
import { postService } from '../services/post.service';
import { logger } from '@server/src/core/logger';
import { asyncHandler } from '@server/src/core/errors';
import type { ThreadId, PostId, StructureId } from '@shared/types/ids';
import { ForumTransformer } from '../transformers/forum.transformer';

const router = Router();

// Validation schemas
const createThreadSchema = z.object({
	title: z.string().min(1).max(200),
	content: z.string().min(1),
	structureId: z.string().uuid('Invalid structureId format'),
	tags: z.array(z.string()).optional(),
	isLocked: z.boolean().optional(),
	isPinned: z.boolean().optional(),
	prefix: z.string().optional()
});

const updateThreadSolvedSchema = z.object({
	solvingPostId: z.string().uuid('Invalid postId format').optional().nullable()
});

const addTagsSchema = z.object({
	tags: z.array(z.string().min(1)).min(1).max(10)
});

// Thread search and listing
router.get('/search', forumController.searchThreads);

router.get(
	'/',
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const page = parseInt(req.query.page as string) || 1;
			const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
			const structureId = req.query.structureId
				? (req.query.structureId as StructureId)
				: undefined;
			const sortBy = (req.query.sortBy as string) || 'newest';
			const search = req.query.search as string;

			// Log search parameters for debugging
			logger.debug('ThreadRoutes', 'Searching threads with parameters', {
				structureId,
				page,
				limit,
				sortBy,
				search
			});

			const result = await threadService.searchThreads({
				structureId,
				page,
				limit,
				sortBy: sortBy as any,
				search
			});

			// Get user context for permissions and personalization
			const requestingUser = userService.getUserFromRequest(req);
			
			// Transform threads using ForumTransformer based on user context
			const transformedThreads = result.threads.map(thread => {
				if (requestingUser) {
					return ForumTransformer.toSlimThread(thread);
				} else {
					return ForumTransformer.toPublicThread(thread);
				}
			});

			logger.debug('ThreadRoutes', 'Thread search results', {
				threadCount: transformedThreads.length,
				total: result.total,
				page: result.page,
				totalPages: result.totalPages
			});

			res.json({
				success: true,
				data: {
					threads: transformedThreads,
					pagination: {
						page,
						limit: limit,
						totalThreads: result.total,
						totalPages: result.totalPages
					}
				}
			});
		} catch (error) {
			logger.error('ThreadRoutes', 'Error in GET /threads', {
				error: error.message,
				stack: error.stack,
				query: req.query
			});
			res.status(500).json({
				success: false,
				error: 'Failed to fetch threads',
				details: error.message
			});
		}
	})
);

// Get thread by ID
router.get(
	'/:id',
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const threadId = req.params.id as ThreadId;
			const thread = await threadService.getThreadById(threadId);

			if (!thread) {
				return res.status(404).json({
					success: false,
					error: 'Thread not found'
				});
			}

			// Get user context for permissions and personalization
			const requestingUser = userService.getUserFromRequest(req);
			
			// Transform thread using ForumTransformer based on user context
			const transformedThread = requestingUser ? 
				ForumTransformer.toAuthenticatedThread(thread, requestingUser) :
				ForumTransformer.toPublicThread(thread);

			res.json({
				success: true,
				data: transformedThread
			});
		} catch (error) {
			logger.error('ThreadRoutes', 'Error in GET /threads/:id', { error });
			res.status(500).json({
				success: false,
				error: 'Failed to fetch thread'
			});
		}
	})
);

// Get thread by slug
router.get(
	'/slug/:slug',
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const slug = req.params.slug;
			const thread = await threadService.getThreadBySlug(slug);

			if (!thread) {
				return res.status(404).json({
					success: false,
					error: 'Thread not found'
				});
			}

			// Increment view count
			await threadService.incrementViewCount(thread.id);

			// Get user context for permissions and personalization
			const requestingUser = userService.getUserFromRequest(req);
			
			// Transform thread using ForumTransformer based on user context
			const transformedThread = requestingUser ? 
				ForumTransformer.toAuthenticatedThread(thread, requestingUser) :
				ForumTransformer.toPublicThread(thread);

			res.json({
				success: true,
				data: transformedThread
			});
		} catch (error) {
			logger.error('ThreadRoutes', 'Error in GET /threads/slug/:slug', { error });
			res.status(500).json({
				success: false,
				error: 'Failed to fetch thread'
			});
		}
	})
);

// Create new thread
router.post(
	'/',
	requireAuth,
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const validatedData = createThreadSchema.parse(req.body);
			const userId = (userService.getUserFromRequest(req) as any)?.id;

			if (!userId) {
				return res.status(401).json({
					success: false,
					error: 'User not authenticated'
				});
			}

			const newThread = await threadService.createThread({
				...validatedData,
				userId: userId
			});

			res.status(201).json({
				success: true,
				data: newThread
			});
		} catch (error) {
			logger.error('ThreadRoutes', 'Error in POST /threads', { error });

			if (error instanceof z.ZodError) {
				return res.status(400).json({
					success: false,
					error: 'Invalid input data',
					details: error.errors
				});
			}

			res.status(500).json({
				success: false,
				error: 'Failed to create thread'
			});
		}
	})
);

// Update thread solved status
router.put(
	'/:threadId/solve',
	requireAuth,
	requireThreadSolvePermission,
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const threadId = req.params.threadId as ThreadId;
			const validatedData = updateThreadSolvedSchema.parse(req.body);
			const userId = (userService.getUserFromRequest(req) as any)?.id;

			const updatedThread = await threadService.updateThreadSolvedStatus({
				threadId,
				solvingPostId: validatedData.solvingPostId
			});

			if (!updatedThread) {
				return res.status(404).json({
					success: false,
					error: 'Thread not found'
				});
			}

			res.json({
				success: true,
				data: updatedThread
			});
		} catch (error) {
			logger.error('ThreadRoutes', 'Error in PUT /threads/:threadId/solve', { error });

			if (error instanceof z.ZodError) {
				return res.status(400).json({
					success: false,
					error: 'Invalid input data',
					details: error.errors
				});
			}

			res.status(500).json({
				success: false,
				error: 'Failed to update thread'
			});
		}
	})
);

// Add tags to thread
router.post(
	'/:threadId/tags',
	requireAuth,
	requireThreadTagPermission,
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const threadId = req.params.threadId as ThreadId;
			const validatedData = addTagsSchema.parse(req.body);
			const userId = (userService.getUserFromRequest(req) as any)?.id;

			// Permission check is handled by middleware
			// TODO: Implement tag addition logic

			res.json({
				success: true,
				message: 'Tags added successfully'
			});
		} catch (error) {
			logger.error('ThreadRoutes', 'Error in POST /threads/:threadId/tags', { error });

			if (error instanceof z.ZodError) {
				return res.status(400).json({
					success: false,
					error: 'Invalid input data',
					details: error.errors
				});
			}

			res.status(500).json({
				success: false,
				error: 'Failed to add tags'
			});
		}
	})
);

// Remove tag from thread
router.delete(
	'/:threadId/tags/:tagId',
	requireAuth,
	requireThreadTagPermission,
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const threadId = req.params.threadId as ThreadId;
			const tagId = req.params.tagId; // TagId conversion TODO if needed

			// TODO: Implement tag removal logic

			res.json({
				success: true,
				message: 'Tag removed successfully'
			});
		} catch (error) {
			logger.error('ThreadRoutes', 'Error in DELETE /threads/:threadId/tags/:tagId', { error });
			res.status(500).json({
				success: false,
				error: 'Failed to remove tag'
			});
		}
	})
);

// Get posts for a thread
router.get(
	'/:threadId/posts',
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const threadId = req.params.threadId as ThreadId;
			const page = parseInt(req.query.page as string) || 1;
			const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
			const sortBy = (req.query.sortBy as string) || 'oldest';

			if (!threadId) {
				return res.status(400).json({
					success: false,
					error: 'Invalid thread ID'
				});
			}

			const result = await postService.getPostsByThread({
				threadId,
				page,
				limit,
				sortBy: sortBy as any
			});

			// Get user context for permissions and personalization
			const requestingUser = userService.getUserFromRequest(req);
			
			// Transform posts using ForumTransformer based on user context
			const transformedPosts = result.posts.map(post => {
				return requestingUser ? 
					ForumTransformer.toAuthenticatedPost(post, requestingUser) :
					ForumTransformer.toPublicPost(post);
			});

			res.json({
				success: true,
				data: {
					posts: transformedPosts,
					pagination: {
						page: result.page,
						limit,
						totalPosts: result.total,
						totalPages: result.totalPages
					}
				}
			});
		} catch (error) {
			logger.error('ThreadRoutes', 'Error in GET /threads/:threadId/posts', {
				error: error.message,
				stack: error.stack,
				threadId: req.params.threadId
			});
			res.status(500).json({
				success: false,
				error: 'Failed to fetch thread posts'
			});
		}
	})
);

// Get thread tags
router.get(
	'/:threadId/tags',
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const threadId = req.params.threadId as ThreadId;

			// TODO: Implement get thread tags logic

			res.json({
				success: true,
				data: []
			});
		} catch (error) {
			logger.error('ThreadRoutes', 'Error in GET /threads/:threadId/tags', { error });
			res.status(500).json({
				success: false,
				error: 'Failed to fetch thread tags'
			});
		}
	})
);

export default router;
