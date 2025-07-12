import type { Request, Response } from 'express';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';
import { getAuthenticatedUser } from '@core/utils/auth.helpers';
import { postService } from '@server/domains/forum/services/post.service';
import { ForumTransformer } from '@server/domains/forum/transformers/forum.transformer';
import type { PostId, UserId } from '@shared/types/ids';

class PostController {
	async createPost(req: Request, res: Response) {
		const user = getAuthenticatedUser(req);
		const newPost = await postService.createPost({
			...req.body,
			userId: user?.id as UserId,
		});

		const transformedPost = ForumTransformer.toAuthenticatedPost(newPost, user);
		return sendSuccessResponse(res, transformedPost, 201);
	}

	async updatePost(req: Request, res: Response) {
		const { id } = req.params as { id: PostId };
		const user = getAuthenticatedUser(req);
		const updatedPost = await postService.updatePost(id, req.body);
		
		const transformedPost = ForumTransformer.toAuthenticatedPost(updatedPost, user);
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
		
		// TODO: Implement tipping logic with DGT service integration
		await postService.tipPost(postId, userId, amount);

		return sendSuccessResponse(res, null, 'Post tipped successfully');
	}

	async getPostReplies(req: Request, res: Response) {
		const { postId } = req.params as { postId: PostId };
		const replies = await postService.getPostReplies(postId);
		const user = getAuthenticatedUser(req);
		const transformedReplies = replies.map(reply =>
			user
				? ForumTransformer.toAuthenticatedPost(reply, user)
				: ForumTransformer.toPublicPost(reply)
		);
		return sendSuccessResponse(res, transformedReplies);
	}
}

export const postController = new PostController(); 