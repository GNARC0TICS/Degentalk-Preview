/**
 * Forum Query Hooks
 *
 * Provides React Query hooks for forum data fetching and mutations.
 * These hooks wrap the forumApi service with proper caching and loading/error states.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { forumApi } from '../services/forumApi';
import type { NestedForumCategory, ThreadSearchParams } from '../services/forumApi';
import { toast } from 'sonner';
import type { Tag, ThreadPrefix, ForumCategoryWithStats, ThreadWithUser } from '@/types/forum';
import { useEffect } from 'react';
import { apiRequest, apiPost, apiPut, apiDelete } from '@/lib/api-request';

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
		queryFn: forumApi.getCategoriesWithStats,
		staleTime: 1 * 60 * 1000 // 1 minute (stats are more dynamic)
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
			if (!enabled && params?.categoryId === undefined) {
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

export const useCreateThread = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Parameters<typeof forumApi.createThread>[0]) => forumApi.createThread(data),
		onSuccess: async (createdThreadData: ThreadWithUser, variables) => {
			queryClient.invalidateQueries({ queryKey: ['/api/threads'] });
			queryClient.invalidateQueries({ queryKey: ['/api/categories'] });

			toast.success('Thread created successfully!');

			const threadId = createdThreadData.id;
			const userId = createdThreadData.userId;

			if (userId && threadId) {
				// --- XP Award ---
				try {
					const xpResponse = await apiPost<{ xpAwarded: number }>('/api/xp/award-action', {
						userId,
						action: 'create_thread',
						entityId: threadId
					});

					if (xpResponse && xpResponse.xpAwarded > 0) {
						setTimeout(() => toast.info(`+${xpResponse.xpAwarded} XP for creating a thread!`), 300);
					}
					queryClient.invalidateQueries({ queryKey: ['/api/users/profile', userId] });
					queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
				} catch (error) {
					console.error('Failed to award XP for thread creation:', error);
					// Non-critical error, so don't show a blocking toast, but log it.
					// toast.error("Error awarding XP", { description: "Your thread was created, but there was an issue awarding XP." });
				}

				// --- DGT Award ---
				try {
					// TODO: Fetch DGT_REWARD_CREATE_THREAD from env/config
					const dgtAmountToAward = 5; // Placeholder DGT amount

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
								context: 'create_thread' // Consistent with your backend plan
							}
						);

						if (dgtResponse && dgtResponse.dgtAwarded > 0) {
							setTimeout(() => toast.info(`+${dgtResponse.dgtAwarded} DGT awarded!`), 600);
						}
						queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
					}
				} catch (error) {
					console.error('Failed to award DGT for thread creation:', error);
					// Non-critical error
					// toast.error("Error awarding DGT", { description: "Your thread was created, but there was an issue awarding DGT." });
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

/**
 * Prefixes -- NEW Hook
 */
export const usePrefixesByCategory = (categoryId?: number) => {
	const queryClient = useQueryClient();

	// Create a query key that depends on the categoryId
	const queryKey = categoryId ? ['/api/forum/prefixes', { categoryId }] : ['/api/forum/prefixes'];

	// Use React Query to fetch prefixes
	const result = useQuery<ThreadPrefix[], Error>({
		queryKey,
		queryFn: () => forumApi.getPrefixes(categoryId),
		// Always ensure we have fresh prefix data when category changes
		staleTime: 1000 * 60 * 5 // 5 minutes
	});

	// Whenever categoryId changes, invalidate the prefixes query
	useEffect(() => {
		if (categoryId !== undefined) {
			// Invalidate any previous prefix queries to ensure fresh data
			queryClient.invalidateQueries({ queryKey: ['/api/forum/prefixes'] });
		}
	}, [categoryId, queryClient]);

	return result;
};

// Hook to fetch forum categories with statistics
export const useForumCategories = useCategoriesWithStats;

// Hook to fetch a specific category by slug
export const useForumCategory = useCategory;

// Hook to fetch thread prefixes, optionally filtered by category
export const useThreadPrefixes = (categoryId?: number) => {
	return useQuery<ThreadPrefix[]>({
		queryKey: ['threadPrefixes', categoryId],
		queryFn: () => forumApi.getPrefixes(categoryId),
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: categoryId !== undefined
	});
};

// Hook to fetch forum tags
export const useForumTags = useTags;

/**
 * Post Update Hook
 *
 * Provides a mutation hook for updating posts with optimistic UI updates.
 */
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
