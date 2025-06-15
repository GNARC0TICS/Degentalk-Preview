/**
 * Forum Query Hooks
 *
 * Provides React Query hooks for forum data fetching and mutations.
 * These hooks wrap the forumApi service with proper caching and loading/error states.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { forumApi } from '../services/forumApi';
import type { NestedForumCategory, ThreadSearchParams as OriginalThreadSearchParams } from '../services/forumApi';
import { toast } from 'sonner';
import type { Tag } from '@/types/forum';
import type { ThreadPrefix, ForumCategoryWithStats, ThreadWithUser } from '@db_types/forum.types';
import { useEffect } from 'react';
import { apiRequest, apiPost, apiPut, apiDelete } from '@/lib/api-request';

// Extend ThreadSearchParams to explicitly include forumSlug for clarity in this hook
export type ThreadSearchParams = OriginalThreadSearchParams & {
	forumSlug?: string;
};

/**
 * Categories
 */
export const useCategories = () => {
	return useQuery({
		queryKey: ['/api/categories'],
		queryFn: forumApi.getCategories,
		staleTime: 5 * 60 * 1000 // 5 minutes
	});
};

/**
 * Hierarchical Categories -- NEW
 */
export const useFetchForumCategoriesTree = () => {
	return useQuery<NestedForumCategory[], Error>({
		queryKey: ['forumCategoriesTree'],
		queryFn: forumApi.getCategoriesTree,
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 2, // Retry failed requests 2 times
		refetchOnMount: true, // Refetch when component mounts
		refetchOnWindowFocus: false // Don't refetch when window gains focus
	});
};

export const useCategoriesWithStats = () => {
	return useQuery({
		queryKey: ['/api/categories', 'with-stats'],
		queryFn: forumApi.getCategories,
		staleTime: 60 * 1000,
	});
};

export const useCategory = (slug: string | undefined) => {
	return useQuery({
		queryKey: [`/api/categories/${slug}`],
		queryFn: () => forumApi.getCategoryBySlug(slug!),
		enabled: !!slug,
		staleTime: 5 * 60 * 1000 // 5 minutes
	});
};

/**
 * Threads
 */
export const useThreads = (params?: ThreadSearchParams, enabled: boolean = true) => {
	return useQuery({
		queryKey: ['/api/threads', params],
		queryFn: async () => {
			if (!enabled && !params?.forumSlug && !params?.categoryId) {
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
				console.error('Error fetching threads:', error);
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
		queryKey: [`/api/threads/${slugOrId}`],
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
	categoryId: number;
	forumSlug?: string; // Optional, not used by API but handy for cache keys / XP logic
	prefixId?: number;
	tags?: string[];
	editorState?: any;
	// Add any other parameters the API expects for thread creation
}

export const useCreateThread = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateThreadParams) => forumApi.createThread(data), // forumApi.createThread needs to accept this new param type
		onSuccess: async (createdThreadData: ThreadWithUser, variables) => {
			// Invalidate queries that list threads, potentially per-forum if keys are specific
			queryClient.invalidateQueries({ queryKey: ['/api/threads', { forumSlug: variables.forumSlug }] });
			queryClient.invalidateQueries({ queryKey: ['/api/threads'] }); // General invalidation
			
			// Invalidate categories/forum structure if thread counts are displayed there
			// This might need to be more specific if using forumMap on client, 
			// but if any part relies on API for counts, invalidate it.
			queryClient.invalidateQueries({ queryKey: ['forumCategoriesTree'] });
			queryClient.invalidateQueries({ queryKey: ['/api/categories', 'with-stats'] });
			if (variables.forumSlug) {
				queryClient.invalidateQueries({ queryKey: [`/api/forums/${variables.forumSlug}`] }); // If there's a specific forum data query
			}

			toast.success('Thread created successfully!');

			const threadId = createdThreadData.id;
			const userId = createdThreadData.userId;

			if (userId && threadId && variables.forumSlug) {
				// --- XP Award ---
				// Pass forumSlug to XP award if rules are checked backend by forumSlug
				try {
					const xpResponse = await apiPost<{ xpAwarded: number }>('/api/xp/award-action', {
						userId,
						action: 'create_thread',
						entityId: threadId,
						contextData: { forumSlug: variables.forumSlug } // Pass forumSlug for context
					});

					if (xpResponse && xpResponse.xpAwarded > 0) {
						setTimeout(() => toast.info(`+${xpResponse.xpAwarded} XP for creating a thread!`), 300);
					}
					queryClient.invalidateQueries({ queryKey: ['/api/users/profile', userId] });
					queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
				} catch (error) {
					console.error('Failed to award XP for thread creation:', error);
				}

				// --- DGT Award ---
				try {
					const dgtAmountToAward = 5; // This should ideally come from forum rules in forumMap or backend config
					if (dgtAmountToAward > 0) {
						const dgtResponse = await apiPost<{ dgtAwarded: number }>(
							'/api/economy/transactions/create',
							{
								userId,
								currency: 'DGT',
								type: 'reward',
								amount: dgtAmountToAward,
								reason: 'Thread creation reward',
								relatedEntityId: threadId,
								context: 'create_thread',
								contextData: { forumSlug: variables.forumSlug } // Pass forumSlug for context
							}
						);
						if (dgtResponse && dgtResponse.dgtAwarded > 0) {
							setTimeout(() => toast.info(`+${dgtResponse.dgtAwarded} DGT awarded!`), 600);
						}
						queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
					}
				} catch (error) {
					console.error('Failed to award DGT for thread creation:', error);
				}
			}
		},
		onError: (error) => {
			toast.error('Failed to create thread', {
				description: error instanceof Error ? error.message : 'Please try again later'
			});
		}
	});
};

export const useUpdateThread = (threadId: number | undefined) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Parameters<typeof forumApi.updateThread>[1]) =>
			forumApi.updateThread(threadId!, data),
		onSuccess: () => {
			if (threadId) {
				queryClient.invalidateQueries({ queryKey: [`/api/threads/${threadId}`] });
				queryClient.invalidateQueries({ queryKey: ['/api/threads'] });
			}
			toast.success('Thread updated successfully');
		},
		onError: (error) => {
			toast.error('Failed to update thread', {
				description: error instanceof Error ? error.message : 'Please try again later'
			});
		}
	});
};

export const useDeleteThread = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: forumApi.deleteThread,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/threads'] });
			queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
			toast.success('Thread deleted successfully');
		},
		onError: (error) => {
			toast.error('Failed to delete thread', {
				description: error instanceof Error ? error.message : 'Please try again later'
			});
		}
	});
};

/**
 * Thread Solving Mutations
 */
export const useSolveThread = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ threadId, postId }: { threadId: number; postId?: number }) =>
			forumApi.solveThread(threadId, postId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: [`/api/threads/${variables.threadId}`] });
			queryClient.invalidateQueries({ queryKey: ['/api/threads'] });
			toast.success('Thread marked as solved');
		},
		onError: (error) => {
			toast.error('Failed to mark thread as solved', {
				description: error instanceof Error ? error.message : 'Please try again later'
			});
		}
	});
};

export const useUnsolveThread = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (threadId: number) => forumApi.unsolveThread(threadId),
		onSuccess: (_, threadId) => {
			queryClient.invalidateQueries({ queryKey: [`/api/threads/${threadId}`] });
			queryClient.invalidateQueries({ queryKey: ['/api/threads'] });
			toast.success('Thread marked as unsolved');
		},
		onError: (error) => {
			toast.error('Failed to unmark thread as solved', {
				description: error instanceof Error ? error.message : 'Please try again later'
			});
		}
	});
};

/**
 * Posts
 */
export const usePosts = (
	threadId: number | undefined,
	params?: { page?: number; limit?: number }
) => {
	return useQuery({
		queryKey: [`/api/threads/${threadId}/posts`, params],
		queryFn: () =>
			threadId ? forumApi.getPosts(threadId, params) : Promise.reject('Thread ID is required'),
		enabled: !!threadId
	});
};

export const useCreatePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: forumApi.createPost,
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: [`/api/threads/${variables.threadId}/posts`] });
			queryClient.invalidateQueries({ queryKey: [`/api/threads/${variables.threadId}`] });
			toast.success('Reply posted successfully');
		},
		onError: (error) => {
			toast.error('Failed to post reply', {
				description: error instanceof Error ? error.message : 'Please try again later'
			});
		}
	});
};

export const useUpdatePost = (postId: number | undefined) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Parameters<typeof forumApi.updatePost>[1]) =>
			forumApi.updatePost(postId!, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				predicate: (query) =>
					typeof query.queryKey[0] === 'string' &&
					query.queryKey[0].includes('/api/threads/') &&
					query.queryKey[0].includes('/posts')
			});
			toast.success('Post updated successfully');
		},
		onError: (error) => {
			toast.error('Failed to update post', {
				description: error instanceof Error ? error.message : 'Please try again later'
			});
		}
	});
};

export const useDeletePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: forumApi.deletePost,
		onSuccess: () => {
			queryClient.invalidateQueries({
				predicate: (query) =>
					typeof query.queryKey[0] === 'string' &&
					query.queryKey[0].includes('/api/threads/') &&
					query.queryKey[0].includes('/posts')
			});
			toast.success('Post deleted successfully');
		},
		onError: (error) => {
			toast.error('Failed to delete post', {
				description: error instanceof Error ? error.message : 'Please try again later'
			});
		}
	});
};

/**
 * Post Reactions
 */
export const useLikePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: forumApi.likePost,
		onSuccess: (_, postId) => {
			queryClient.invalidateQueries({
				predicate: (query) =>
					typeof query.queryKey[0] === 'string' &&
					query.queryKey[0].includes('/api/threads/') &&
					query.queryKey[0].includes('/posts')
			});
		},
		onError: (error) => {
			toast.error('Failed to like post', {
				description: error instanceof Error ? error.message : 'Please try again later'
			});
		}
	});
};

export const useUnlikePost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: forumApi.unlikePost,
		onSuccess: (_, postId) => {
			queryClient.invalidateQueries({
				predicate: (query) =>
					typeof query.queryKey[0] === 'string' &&
					query.queryKey[0].includes('/api/threads/') &&
					query.queryKey[0].includes('/posts')
			});
		},
		onError: (error) => {
			toast.error('Failed to unlike post', {
				description: error instanceof Error ? error.message : 'Please try again later'
			});
		}
	});
};

export const useTipPost = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ postId, amount }: { postId: number; amount: number }) =>
			forumApi.tipPost(postId, amount),
		onSuccess: (_, { postId }) => {
			queryClient.invalidateQueries({
				predicate: (query) =>
					typeof query.queryKey[0] === 'string' &&
					query.queryKey[0].includes('/api/threads/') &&
					query.queryKey[0].includes('/posts')
			});
			queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
			toast.success('Tip sent successfully');
		},
		onError: (error) => {
			toast.error('Failed to send tip', {
				description: error instanceof Error ? error.message : 'Please try again later'
			});
		}
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
			queryClient.invalidateQueries({ queryKey: [`/api/threads/${threadId}`] });
			queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
			toast.success('Thread bookmarked');
		},
		onError: (error) => {
			toast.error('Failed to bookmark thread', {
				description: error instanceof Error ? error.message : 'Please try again later'
			});
		}
	});
};

export const useRemoveBookmark = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: forumApi.removeBookmark,
		onSuccess: (_, threadId) => {
			queryClient.invalidateQueries({ queryKey: [`/api/threads/${threadId}`] });
			queryClient.invalidateQueries({ queryKey: ['/api/bookmarks'] });
			toast.success('Bookmark removed');
		},
		onError: (error) => {
			toast.error('Failed to remove bookmark', {
				description: error instanceof Error ? error.message : 'Please try again later'
			});
		}
	});
};

export const useUserBookmarks = () => {
	return useQuery({
		queryKey: ['/api/bookmarks'],
		queryFn: forumApi.getUserBookmarks
	});
};

/**
 * Tags -- NEW Hooks
 */
export const useTags = () => {
	return useQuery<Tag[], Error>({
		queryKey: ['/api/forum/tags'],
		queryFn: forumApi.getTags,
		staleTime: 5 * 60 * 1000 // 5 minutes, tags don't change too frequently
	});
};

export const useAddTagToThread = () => {
	const queryClient = useQueryClient();
	return useMutation<Tag, Error, { threadId: number; tagId: number }>({
		mutationFn: ({ threadId, tagId }) => forumApi.addTagToThread(threadId, tagId),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: [`/api/threads/${variables.threadId}`] });
			queryClient.invalidateQueries({ queryKey: ['/api/threads'] });
			toast.success(`Tag "${data.name}" added to thread.`);
		},
		onError: (error) => {
			toast.error('Failed to add tag', {
				description: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	});
};

export const useRemoveTagFromThread = () => {
	const queryClient = useQueryClient();
	return useMutation<void, Error, { threadId: number; tagId: number }>({
		mutationFn: ({ threadId, tagId }) => forumApi.removeTagFromThread(threadId, tagId),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: [`/api/threads/${variables.threadId}`] });
			queryClient.invalidateQueries({ queryKey: ['/api/threads'] });
			toast.success(`Tag removed from thread.`);
		},
		onError: (error) => {
			toast.error('Failed to remove tag', {
				description: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	});
};

// Optional: Hook for fetching threads by tag slug
export const useThreadsByTag = (
	tagSlug: string | undefined,
	params?: { page?: number; limit?: number; sortBy?: 'latest' | 'hot' | 'staked' }
) => {
	return useQuery({
		queryKey: [`/api/forum/tags/${tagSlug}/threads`, params],
		queryFn: () =>
			tagSlug ? forumApi.getThreadsByTag(tagSlug, params) : Promise.reject('Tag slug is required'),
		enabled: !!tagSlug
	});
};

// ------------ Prefix Hooks ------------

// Primary unified hook
export const usePrefixes = (params?: { categoryId?: number }) => {
	const queryClient = useQueryClient();
	const categoryId = params?.categoryId;

	const queryKey = ['/api/forum/prefixes', { categoryId }];

	const result = useQuery<ThreadPrefix[], Error>({
		queryKey,
		queryFn: () => forumApi.getPrefixes(categoryId),
		staleTime: 1000 * 60 * 5,
		enabled: typeof categoryId === 'number',
	});

	// Ensure fresh data if category changes
	useEffect(() => {
		if (typeof categoryId === 'number') {
			queryClient.invalidateQueries({ queryKey: ['/api/forum/prefixes', { categoryId }] });
		}
	}, [categoryId, queryClient]);

	return result;
};

/**
 * @deprecated  Use usePrefixes({ categoryId }) instead. This wrapper keeps backward compatibility during migration.
 */
export const useForumPrefixes = (forumSlug?: string, categoryId?: number) => {
	// NOTE: forumSlug parameter is ignored; provide categoryId if available.
	return usePrefixes({ categoryId });
};

export const useThreadPrefixes = useForumPrefixes;

/**
 * @deprecated Back-compat alias.
 */
export const useForumPrefixesAlias = useForumPrefixes;
export const useThreadPrefixesAlias = useThreadPrefixes;

// Hook to fetch forum categories, category and tags remain the same
export const useForumCategories = useCategoriesWithStats;
export const useForumCategory = useCategory;
export const useForumTags = useTags;

export const usePostUpdate = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			postId,
			content,
			editorState
		}: {
			postId: number;
			content: string;
			editorState?: any;
		}) => forumApi.updatePost(postId, { content, editorState }),

		// When the mutation is successful, update the post in the cache
		onSuccess: (response, variables) => {
			// Invalidate affected queries to make sure data is fresh
			queryClient.invalidateQueries({ queryKey: ['thread'] });

			// Show success toast
			toast.success('Post updated successfully');
		},

		// Handle errors
		onError: (error) => {
			console.error('Error updating post:', error);
			toast.error('Failed to update post. Please try again.');
		}
	});
};
