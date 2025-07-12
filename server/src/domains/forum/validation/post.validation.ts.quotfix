import { z } from 'zod';
import { threadId, postId } from '@shared/validation/common.schemas';

const createPostSchema = z.object({
	body: z.object({
		threadId: threadId,
		content: z.string().min(1, 'Content is required'),
		replyToPostId: postId.optional().nullable(),
		editorState: z.any().optional() // Allow any for now, can be tightened later
	})
});

const updatePostSchema = z.object({
	body: z.object({
		content: z.string().min(1, 'Content is required'),
		editorState: z.any().optional(),
		editReason: z.string().max(200).optional()
	}),
	params: z.object({
		id: postId
	})
});

const postParams = z.object({
	params: z.object({
		postId: postId
	})
});

const postReactionSchema = z.object({
	body: z.object({
		reactionType: z.enum(['like', 'dislike'])
	})
});

const tipPostSchema = z.object({
	body: z.object({
		amount: z.number().positive('Tip amount must be positive').min(0.000001)
	})
});

export const postValidation = {
	createPost: createPostSchema,
	updatePost: updatePostSchema,
	postParams,
	postReaction: postReactionSchema,
	tipPost: tipPostSchema
}; 