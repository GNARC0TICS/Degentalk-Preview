/**
 * Forum Mutation Hooks
 *
 * Centralized location for all forum-related mutations.
 * Grouped by action type for easy discovery and maintenance.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { forumApi } from '../services/forumApi';
import { apiPost } from '@utils/api-request';
import type { PostWithUser } from '@/types/compat/forum';
import type { EntityId, ContentId, ThreadId, PostId, UserId } from '@shared/types/ids';

// Utility for standardized error handling
const createErrorHandler = (action: string) => (error: unknown) => {
	toast.error(`Failed to ${action}`, {
		description: error instanceof Error ? error.message : 'Please try again later'
	});
};

/**
 * Quote Post Mutation
 * Creates a new post with quoted content
 */
export const useQuotePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			threadId,
			quotedContent,
			replyContent,
			replyToPostId
		}: {
			threadId: ThreadId;
			quotedContent: string;
			replyContent: string;
			replyToPostId?: PostId;
		}) => {
			const fullContent = quotedContent + replyContent;
			return forumApi.createPost({
				threadId,
				content: fullContent,
				replyToPostId
			});
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: [`/api/threads/${variables.threadId}/posts`] });
			queryClient.invalidateQueries({ queryKey: [`/api/threads/${variables.threadId}`] });
			toast.success('Reply posted successfully');
		},
		onError: createErrorHandler('post reply')
	});
};

/**
 * Report Content Mutation
 * Reports a post, thread, or message
 */
export const useReportContent = () => {
	return useMutation({
		mutationFn: (data: {
			contentType: 'post' | 'thread' | 'message';
			contentId: ContentId;
			reason: string;
			details?: string;
		}) => forumApi.reportPost(data),
		onSuccess: () => {
			toast.success(
				'Report submitted successfully. Thank you for helping keep our community safe!'
			);
		},
		onError: createErrorHandler('submit report')
	});
};

/**
 * Award XP for Thread/Post Actions
 * Used after successful content creation
 */
export const useAwardForumXP = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			userId,
			action,
			entityId,
			forumSlug
		}: {
			userId: UserId;
			action: 'create_thread' | 'create_post';
			entityId: EntityId;
			forumSlug?: string;
		}) => {
			return apiPost<{ xpAwarded: number }>('/api/xp/award-action', {
				userId,
				action,
				entityId,
				contextData: { forumSlug }
			});
		},
		onSuccess: (data, variables) => {
			if (data && data.xpAwarded > 0) {
				toast.info(`+${data.xpAwarded} XP awarded!`);
			}
			queryClient.invalidateQueries({ queryKey: ['/api/users/profile', variables.userId] });
			queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
		},
		onError: () => {
			// Silent failure - don't show error to user for XP awards
		}
	});
};

/**
 * Award DGT for Thread/Post Actions
 * Used after successful content creation
 */
export const useAwardForumDGT = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			userId,
			amount,
			reason,
			entityId,
			context,
			forumSlug
		}: {
			userId: UserId;
			amount: number;
			reason: string;
			entityId: EntityId;
			context: 'create_thread' | 'create_post';
			forumSlug?: string;
		}) => {
			return apiPost<{ dgtAwarded: number }>('/api/economy/transactions/create', {
				userId,
				currency: 'DGT',
				type: 'reward',
				amount,
				reason,
				relatedEntityId: entityId,
				context,
				contextData: { forumSlug }
			});
		},
		onSuccess: (data) => {
			if (data && data.dgtAwarded > 0) {
				toast.info(`+${data.dgtAwarded} DGT awarded!`);
			}
			queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
		},
		onError: () => {
			// Silent failure - don't show error to user for DGT awards
		}
	});
};

// Re-export commonly used mutations from useForumQueries.ts to maintain backward compatibility
export {
	useLikePost,
	useUnlikePost,
	useTipPost,
	useCreatePost,
	useUpdatePost,
	useDeletePost,
	useSolveThread,
	useUnsolveThread,
	useBookmarkThread,
	useRemoveBookmark
} from './useForumQueries';
