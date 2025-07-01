import { userService } from '@server/src/core/services/user.service';
/**
 * Post Routes
 *
 * QUALITY IMPROVEMENT: Extracted from forum.routes.ts god object
 * Handles post-specific API endpoints with proper separation of concerns
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { isAuthenticated as requireAuth } from '../../auth/middleware/auth.middleware';
import { postService } from '../services/post.service';
import { logger } from '@server/src/core/logger';
import {
	requirePostEditPermission,
	requirePostDeletePermission
} from '../services/permissions.service';
import { asyncHandler } from '@server/src/core/errors';
import type { ThreadId, PostId, UserId } from '@/db/types';

const router = Router();

// Validation schemas
const createPostSchema = z.object({
	threadId: z.string().uuid('Invalid threadId format'),
	content: z.string().min(1),
	replyToPostId: z.string().uuid('Invalid postId format').optional().nullable(),
	editorState: z.any().optional()
});

const updatePostSchema = z.object({
	content: z.string().min(1),
	editorState: z.any().optional(),
	editReason: z.string().optional()
});

const postReactionSchema = z.object({
	reactionType: z.enum(['like', 'dislike'])
});

const tipPostSchema = z.object({
	amount: z.number().positive().min(0.000001)
});

// Create new post (reply)
router.post(
	'/',
	requireAuth,
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const validatedData = createPostSchema.parse(req.body);
			const userId = (userService.getUserFromRequest(req) as any)?.id;

			if (!userId) {
				return res.status(401).json({
					success: false,
					error: 'User not authenticated'
				});
			}

			const newPost = await postService.createPost({
				content: validatedData.content,
				threadId: validatedData.threadId,
				userId: userId,
				replyToPostId: validatedData.replyToPostId
			});

			res.status(201).json({
				success: true,
				data: newPost
			});
		} catch (error) {
			logger.error('PostRoutes', 'Error in POST /posts', { error });

			if (error instanceof z.ZodError) {
				return res.status(400).json({
					success: false,
					error: 'Invalid input data',
					details: error.errors
				});
			}

			res.status(500).json({
				success: false,
				error: 'Failed to create post'
			});
		}
	})
);

// Update post
router.put(
	'/:id',
	requireAuth,
	requirePostEditPermission,
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const postId = req.params.id as PostId;
			const validatedData = updatePostSchema.parse(req.body);
			const userId = (userService.getUserFromRequest(req) as any)?.id;

			const updatedPost = await postService.updatePost(postId, {
				content: validatedData.content
			});

			res.json({
				success: true,
				data: updatedPost
			});
		} catch (error) {
			logger.error('PostRoutes', 'Error in PUT /posts/:id', { error });

			if (error instanceof z.ZodError) {
				return res.status(400).json({
					success: false,
					error: 'Invalid input data',
					details: error.errors
				});
			}

			res.status(500).json({
				success: false,
				error: 'Failed to update post'
			});
		}
	})
);

// Delete post
router.delete(
	'/:id',
	requireAuth,
	requirePostDeletePermission,
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const postId = req.params.id as PostId;
			const userId = (userService.getUserFromRequest(req) as any)?.id;

			await postService.deletePost(postId);

			res.json({
				success: true,
				message: 'Post deleted successfully'
			});
		} catch (error) {
			logger.error('PostRoutes', 'Error in DELETE /posts/:id', { error });
			res.status(500).json({
				success: false,
				error: 'Failed to delete post'
			});
		}
	})
);

// React to post (like/dislike)
router.post(
	'/:postId/react',
	requireAuth,
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const postId = req.params.postId as PostId;
			const validatedData = postReactionSchema.parse(req.body);
			const userId = (userService.getUserFromRequest(req) as any)?.id;

			if (!userId) {
				return res.status(401).json({
					success: false,
					error: 'User not authenticated'
				});
			}

			if (validatedData.reactionType === 'like') {
				await postService.likePost(postId, userId);
			} else {
				await postService.unlikePost(postId, userId);
			}

			res.json({
				success: true,
				message: 'Reaction updated successfully'
			});
		} catch (error) {
			logger.error('PostRoutes', 'Error in POST /posts/:postId/react', { error });

			if (error instanceof z.ZodError) {
				return res.status(400).json({
					success: false,
					error: 'Invalid input data',
					details: error.errors
				});
			}

			res.status(500).json({
				success: false,
				error: 'Failed to update reaction'
			});
		}
	})
);

// Tip post
router.post(
	'/:postId/tip',
	requireAuth,
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const postId = req.params.postId as PostId;
			const validatedData = tipPostSchema.parse(req.body);
			const userId = (userService.getUserFromRequest(req) as any)?.id;

			if (!userId) {
				return res.status(401).json({
					success: false,
					error: 'User not authenticated'
				});
			}

			// TODO: Implement tipping logic with DGT service integration

			res.json({
				success: true,
				message: 'Post tipped successfully'
			});
		} catch (error) {
			logger.error('PostRoutes', 'Error in POST /posts/:postId/tip', { error });

			if (error instanceof z.ZodError) {
				return res.status(400).json({
					success: false,
					error: 'Invalid input data',
					details: error.errors
				});
			}

			res.status(500).json({
				success: false,
				error: 'Failed to tip post'
			});
		}
	})
);

// Get post replies
router.get(
	'/:postId/replies',
	asyncHandler(async (req: Request, res: Response) => {
		try {
			const postId = req.params.postId as PostId;

			const replies = await postService.getPostReplies(postId);

			res.json({
				success: true,
				data: replies
			});
		} catch (error) {
			logger.error('PostRoutes', 'Error in GET /posts/:postId/replies', { error });
			res.status(500).json({
				success: false,
				error: 'Failed to fetch post replies'
			});
		}
	})
);

export default router;
