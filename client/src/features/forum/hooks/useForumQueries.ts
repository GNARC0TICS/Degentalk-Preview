/**
 * Forum Query Hooks
 *
 * Provides React Query hooks for forum data fetching and mutations.
 * These hooks wrap the forumApi service with proper caching and loading/error states.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { forumApi } from '../services/forumApi';
import type { ThreadSearchParams as OriginalThreadSearchParams } from '../services/forumApi';
import { toast } from 'sonner';
import type { Tag } from '@/types/forum';
import type { ForumTag } from '@/types/compat/forum';
import type { ThreadPrefix } from '@/types/compat/forum';
import { useEffect } from 'react';
import type { ForumId, TagId, ContentId, PrefixId, ThreadId, PostId } from '@shared/types/ids';

// Utility for common cache invalidation patterns
const invalidatePostQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
	queryClient.invalidateQueries({
		predicate: (query) =>
			typeof query.queryKey[0] === 'string' &&
			query.queryKey[0].includes('/api/forum/threads/') &&
			query.queryKey[0].includes('/posts')
	});
};

// Utility for standardized error handling
const createErrorHandler = (action: string) => (error: unknown) => {
	toast.error(`Failed to ${action}`, {
		description: error instanceof Error ? error.message : 'Please try again later'
	});
};

// Extend ThreadSearchParams to match API and add hook-specific fields
export type ThreadSearchParams = OriginalThreadSearchParams & {
	forumSlug?: string;
	solved?: boolean;
	bookmarked?: boolean;
	mine?: boolean;
	replied?: boolean;
	q?: string;
	tags?: string[];
};

/**
 * Threads
 */
export const useThreads = (params?: ThreadSearchParams, enabled: boolean = true) => {
	return useQuery({
		queryKey: ['/api/forum/threads', params],
		queryFn: async () => {
			if (!enabled && !params?.forumSlug && !params?.structureId) {
				return {
					threads: [],
					pagination: {
						page: 1,
						limit: params?.limit || 10,
						totalThreads: 0,
						totalPages: 0
					}
				};
			}
			try {
				return await forumApi.searchThreads(params || {});
			} catch (error) {
				// Silent error handling - return empty result for graceful degradation
				return {
					threads: [],
					pagination: {
						page: 1,
						limit: params?.limit || 10,
						totalThreads: 0,
						totalPages: 0
					}
				};
			}
		},
		enabled: enabled,
		retry: 2,
		refetchOnMount: true,
		refetchOnWindowFocus: false
	});
};

export const useThread = (slugOrId: string | number | undefined) => {
	return useQuery({
		queryKey: [`/api/forum/threads/${slugOrId}`],
		queryFn: async () => {
			if (!slugOrId) throw new Error('Thread ID or slug is required');
			return await forumApi.getThread(slugOrId);
		},
		enabled: !!slugOrId,
		retry: 1 // Only retry once for specific thread
	});
};

// NEW: Define ThreadCreateParams to include forumSlug
export interface CreateThreadParams {
	title: string;
	content: string;
	structureId: string;
	forumSlug?: string; // Optional, not used by API but handy for cache keys / XP logic
	prefixId?: PrefixId;
	tags?: string[];
	editorState?: Record<string, unknown>;
	// Add any other parameters the API expects for thread creation
}

export const useCreateThread = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateThreadParams) => {
			const { forumSlug, ...apiData } = data;
			return forumApi.createThread({
				...apiData,
				tagIds: data.tags
			});
		},
		onSuccess: async (_, variables) => {
			// Invalidate queries that list threads, potentially per-forum if keys are specific
			queryClient.invalidateQueries({
				queryKey: ['/api/forum/threads', { forumSlug: variables.forumSlug }]
			});
			queryClient.invalidateQueries({ queryKey: ['/api/forum/threads'] }); // General invalidation

			// Invalidate forum structure if thread counts are displayed there
			queryClient.invalidateQueries({ queryKey: ['forumStructure'] });
			if (variables.forumSlug) {
				queryClient.invalidateQueries({ queryKey: [`/api/forums/${variables.forumSlug}`] }); // If there's a specific forum data query
			}

			toast.success('Thread created successfully!');

			// XP & DGT rewards are now handled server-side to prevent client-side forging.
		},
		onError: createErrorHandler('create thread')
	});
};

export const useUpdateThread = (threadId: ThreadId | undefined) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Parameters<typeof forumApi.updateThread>[1]) =>
			forumApi.updateThread(threadId!, data),
		onSuccess: () => {
			if (threadId) {
				queryClient.invalidateQueries({ queryKey: [`/api/forum/threads/${threadId}`] });
				queryClient.invalidateQueries({ queryKey: ['/api/forum/threads'] });
			}
			toast.success('Thread updated successfully');
		},
		onError: createErrorHandler('update thread')
	});
};

export const useDeleteThread = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: forumApi.deleteThread,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/forum/threads'] });
			queryClient.invalidateQueries({ queryKey: ['forumStructure'] });
			toast.success('Thread deleted successfully');
		},
		onError: createErrorHandler('delete thread')
	});
};

/**
 * Thread Solving Mutations
 */
export const useSolveThread = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ threadId, postId }: { threadId: ThreadId; postId?: PostId }) =>
			forumApi.solveThread(threadId, postId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: [`/api/forum/threads/${variables.threadId}`] });
			queryClient.invalidateQueries({ queryKey: ['/api/forum/threads'] });
			toast.success('Thread marked as solved');
		},
		onError: createErrorHandler('mark thread as solved')
	});
};

export const useUnsolveThread = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (threadId: ThreadId) => forumApi.unsolveThread(threadId),
		onSuccess: (_, threadId) => {
			queryClient.invalidateQueries({ queryKey: [`/api/forum/threads/${threadId}`] });
			queryClient.invalidateQueries({ queryKey: ['/api/forum/threads'] });
			toast.success('Thread marked as unsolved');
		},
		onError: createErrorHandler('unmark thread as solved')
	});
};

/**
 * Posts
 */
export const usePosts = (
	threadId: ThreadId | undefined,
	params?: { page?: number; limit?: number }
) => {
	return useQuery({
		queryKey: [`/api/forum/threads/${threadId}/posts`, params],
		queryFn: () =>
			threadId ? forumApi.getPosts(threadId, params) : Promise.reject('Thread ID is required'),
		enabled: !!threadId
	});
};

export const useCreatePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: forumApi.createPost,
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: [`/api/forum/threads/${variables.threadId}/posts`]
			});
			queryClient.invalidateQueries({ queryKey: [`/api/forum/threads/${variables.threadId}`] });
			toast.success('Reply posted successfully');
		},
		onError: createErrorHandler('post reply')
	});
};

export const useUpdatePost = (postId: PostId | undefined) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Parameters<typeof forumApi.updatePost>[1]) =>
			forumApi.updatePost(postId!, data),
		onSuccess: () => {
			invalidatePostQueries(queryClient);
			toast.success('Post updated successfully');
		},
		onError: createErrorHandler('update post')
	});
};

export const useDeletePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: forumApi.deletePost,
		onSuccess: () => {
			invalidatePostQueries(queryClient);
			toast.success('Post deleted successfully');
		},
		onError: createErrorHandler('delete post')
	});
};

/**
 * Post Reactions
 */
export const useReactToPost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ postId, reactionType }: { postId: PostId; reactionType: 'like' | 'dislike' }) =>
			forumApi.reactToPost(postId, reactionType),
		onSuccess: () => {
			invalidatePostQueries(queryClient);
		},
		onError: createErrorHandler('update reaction')
	});
};

// Legacy hooks for backward compatibility - can be removed after components are updated
export const useLikePost = () => {
	const reactToPost = useReactToPost();
	return {
		...reactToPost,
		mutate: (postId: PostId) => reactToPost.mutate({ postId, reactionType: 'like' })
	};
};

export const useUnlikePost = () => {
	const reactToPost = useReactToPost();
	return {
		...reactToPost,
		mutate: (postId: PostId) => reactToPost.mutate({ postId, reactionType: 'dislike' })
	};
};

export const useTipPost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ postId, amount }: { postId: PostId; amount: number }) =>
			forumApi.tipPost(postId, amount),
		onSuccess: () => {
			invalidatePostQueries(queryClient);
			queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
			toast.success('Tip sent successfully');
		},
		onError: createErrorHandler('send tip')
	});
};

/**
 * Bookmarks
 */
export const useBookmarkThread = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: forumApi.bookmarkThread,
		onSuccess: (_, threadId) => {
			queryClient.invalidateQueries({ queryKey: [`/api/forum/threads/${threadId}`] });
			queryClient.invalidateQueries({ queryKey: ['/api/forum/bookmarks'] });
			toast.success('Thread bookmarked');
		},
		onError: createErrorHandler('bookmark thread')
	});
};

export const useRemoveBookmark = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: forumApi.removeBookmark,
		onSuccess: (_, threadId) => {
			queryClient.invalidateQueries({ queryKey: [`/api/forum/threads/${threadId}`] });
			queryClient.invalidateQueries({ queryKey: ['/api/forum/bookmarks'] });
			toast.success('Bookmark removed');
		},
		onError: createErrorHandler('remove bookmark')
	});
};

export const useUserBookmarks = () => {
	return useQuery({
		queryKey: ['/api/forum/bookmarks'],
		queryFn: forumApi.getUserBookmarks
	});
};

/**
 * Tags -- NEW Hooks
 */
export const useTags = () => {
	return useQuery<ForumTag[], Error>({
		queryKey: ['/api/forum/tags'],
		queryFn: forumApi.getTags,
		staleTime: 5 * 60 * 1000 // 5 minutes, tags don't change too frequently
	});
};

export const useAddTagToThread = () => {
	const queryClient = useQueryClient();
	return useMutation<ForumTag, Error, { threadId: ThreadId; tagId: TagId }>({
		mutationFn: ({ threadId, tagId }) => forumApi.addTagToThread(threadId, tagId),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: [`/api/forum/threads/${variables.threadId}`] });
			queryClient.invalidateQueries({ queryKey: ['/api/forum/threads'] });
			toast.success(`Tag "${data.name}" added to thread.`);
		},
		onError: createErrorHandler('add tag')
	});
};

export const useRemoveTagFromThread = () => {
	const queryClient = useQueryClient();
	return useMutation<void, Error, { threadId: ThreadId; tagId: TagId }>({
		mutationFn: ({ threadId, tagId }) => forumApi.removeTagFromThread(threadId, tagId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: [`/api/forum/threads/${variables.threadId}`] });
			queryClient.invalidateQueries({ queryKey: ['/api/forum/threads'] });
			toast.success(`Tag removed from thread.`);
		},
		onError: createErrorHandler('remove tag')
	});
};

// NOTE: useThreadsByTag removed - use unified thread search with tag filters instead

// ------------ Prefix Hooks ------------

// Primary unified hook
export const usePrefixes = (params?: { forumId?: ForumId }) => {
	const queryClient = useQueryClient();
	const forumId = params?.forumId;

	const queryKey = ['/api/forum/prefixes', { forumId }];

	const result = useQuery<ThreadPrefix[], Error>({
		queryKey,
		queryFn: () => forumApi.getPrefixes(forumId),
		staleTime: 1000 * 60 * 5,
		enabled: forumId !== undefined
	});

	// Ensure fresh data if forum changes
	useEffect(() => {
		if (forumId !== undefined) {
			queryClient.invalidateQueries({ queryKey: ['/api/forum/prefixes', { forumId }] });
		}
	}, [forumId, queryClient]);

	return result;
};

// Hook aliases for consistency
export const useForumTags = useTags;

export const usePostUpdate = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			postId,
			content,
			editorState
		}: {
			postId: PostId;
			content: string;
			editorState?: Record<string, unknown>;
		}) => forumApi.updatePost(postId, { content, editorState }),

		// When the mutation is successful, update the post in the cache
		onSuccess: () => {
			// Invalidate affected queries to make sure data is fresh
			queryClient.invalidateQueries({ queryKey: ['thread'] });

			// Show success toast
			toast.success('Post updated successfully');
		},

		// Handle errors
		onError: createErrorHandler('update post')
	});
};

export const useReportPost = () => {
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
