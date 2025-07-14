import type { Request, Response } from 'express';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';
import { getAuthenticatedUser } from '@core/utils/auth.helpers';
import { postService } from '@server/domains/forum/services/post.service';
import { PostTransformer } from '@server/domains/forum/transformers/post.transformer';
import type { PostId, UserId } from '@shared/types/ids';

class PostController {
	async createPost(req: Request, res: Response) {
		const user = getAuthenticatedUser(req);
		const newPost = await postService.createPost({
			...req.body,
			userId: user?.id as UserId
		});

		const transformedPost = PostTransformer.toAuthenticated(newPost, user);
		return sendSuccessResponse(res, transformedPost, 201);
	}

	async updatePost(req: Request, res: Response) {
		const { id } = req.params as { id: PostId };
		const user = getAuthenticatedUser(req);
		const updatedPost = await postService.updatePost(id, req.body);

		const transformedPost = PostTransformer.toAuthenticated(updatedPost, user);
		return sendSuccessResponse(res, transformedPost);
	}

	async deletePost(req: Request, res: Response) {
		const { id } = req.params as { id: PostId };
		await postService.deletePost(id);
		return sendSuccessResponse(res, null, 'Post deleted successfully');
	}

	async handleReaction(req: Request, res: Response) {
		const { postId } = req.params as { postId: PostId };
		const { reactionType } = req.body;
		const user = getAuthenticatedUser(req);
		const userId = user?.id as UserId;

		if (reactionType === 'like') {
			await postService.likePost(postId, userId);
		} else {
			await postService.unlikePost(postId, userId);
		}

		return sendSuccessResponse(res, null, 'Reaction updated successfully');
	}

	async tipPost(req: Request, res: Response) {
		const { postId } = req.params as { postId: PostId };
		const { amount } = req.body;
		const user = getAuthenticatedUser(req);
		const userId = user?.id as UserId;

		try {
			await postService.tipPost(postId, userId, amount);
			
			return sendSuccessResponse(res, {
				postId,
				amount,
				message: 'Post tipped successfully and XP awarded'
			});
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to tip post';
			return sendErrorResponse(res, errorMessage, 400);
		}
	}

	async getPostReplies(req: Request, res: Response) {
		const { postId } = req.params as { postId: PostId };
		const replies = await postService.getPostReplies(postId);
		const user = getAuthenticatedUser(req);
		const transformedReplies = replies.map((reply) =>
			user
				? PostTransformer.toAuthenticated(reply, user)
				: PostTransformer.toPublic(reply)
		);
		return sendSuccessResponse(res, transformedReplies);
	}
}

export const postController = new PostController();
