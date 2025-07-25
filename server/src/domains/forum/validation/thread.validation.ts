import { z } from 'zod';
import { threadId, postId } from '@shared/validation/common.schemas';

const createThreadSchema = z.object({
	body: z.object({
		title: z
			.string()
			.min(3, 'Title must be at least 3 characters')
			.max(200, 'Title cannot exceed 200 characters'),
		content: z.string().min(1, 'Content is required'),
		forumSlug: z.string().min(1, 'Forum slug is required'),
		tags: z.array(z.string().max(50)).optional(),
		isLocked: z.boolean().optional(),
		isPinned: z.boolean().optional(),
		prefix: z.string().max(20).optional()
	})
});

const updateThreadSolvedSchema = z.object({
	body: z.object({
		solvingPostId: postId.optional().nullable()
	}),
	params: z.object({
		threadId: threadId
	})
});

const addTagsSchema = z.object({
	body: z.object({
		tags: z
			.array(z.string().min(1).max(50))
			.min(1, 'At least one tag is required')
			.max(10, 'Cannot add more than 10 tags at a time')
	}),
	params: z.object({
		threadId: threadId
	})
});

const threadParams = z.object({
	params: z.object({
		threadId: threadId
	})
});

const tagParams = z.object({
	params: z.object({
		threadId: threadId,
		tagId: z.string().uuid()
	})
});

export const threadValidation = {
	createThread: createThreadSchema,
	updateThreadSolved: updateThreadSolvedSchema,
	addTags: addTagsSchema,
	threadParams,
	tagParams
};
