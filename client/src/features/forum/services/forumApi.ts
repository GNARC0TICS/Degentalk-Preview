/**
 * Forum API Service
 *
 * Centralizes all forum-related API calls to provide a single point
 * of interaction with the forum backend endpoints.
 */

import { apiRequest } from '@/lib/api-request';
import type {
	ThreadWithUser,
	PostWithUser,
	ForumTag,
	ThreadPrefix,
	ThreadWithPostsAndUser
} from '@/types/compat/forum';
import type { ApiErrorData } from '@/types/core.types';
import type { ReportId, ForumId, TagId, ContentId, PrefixId } from '@/db/types';

export interface ThreadSearchParams {
	structureId?: number;
	prefix?: string;
	tag?: string;
	page?: number;
	limit?: number;
	sortBy?: 'latest' | 'hot' | 'staked' | 'popular' | 'recent';
	search?: string;
}

export interface ThreadSearchResult {
	threads: ThreadWithUser[];
	pagination: {
		page: number;
		limit: number;
		totalThreads: number;
		totalPages: number;
	};
	isRestricted?: boolean;
}

export const forumApi = {
	/**
	 * Threads
	 */
	searchThreads: async (params: ThreadSearchParams): Promise<ThreadSearchResult> => {
		// Convert params to string values for API request
		const apiParams: Record<string, string> = {};

		if (params.structureId !== undefined) {
			apiParams.structureId = String(params.structureId);
		}

		if (params.prefix) {
			apiParams.prefix = params.prefix;
		}

		if (params.tag) {
			apiParams.tag = params.tag;
		}

		if (params.page !== undefined) {
			apiParams.page = String(params.page);
		}

		if (params.limit !== undefined) {
			apiParams.limit = String(params.limit);
		}

		if (params.sortBy) {
			apiParams.sortBy = params.sortBy;
		}

		if (params.search) {
			apiParams.search = params.search;
		}

		try {
			const directResult = await apiRequest<ThreadSearchResult>({
				url: '/api/forum/threads/search',
				method: 'GET',
				params: apiParams
			});
			return directResult;
		} catch (err: ApiErrorData) {
			if ([401, 403].includes(err?.response?.status)) {
				return {
					threads: [],
					pagination: {
						page: params.page ?? 1,
						limit: params.limit ?? 10,
						totalThreads: 0,
						totalPages: 0
					},
					isRestricted: true
				};
			}
			throw err;
		}
	},

	getThread: async (
		slugOrId: string | number,
		params?: { page?: number; limit?: number }
	): Promise<ThreadWithPostsAndUser | null> => {
		const isSlug = typeof slugOrId === 'string' && isNaN(Number(slugOrId));
		const url = isSlug ? `/api/forum/threads/slug/${slugOrId}` : `/api/forum/threads/${slugOrId}`;

		// Convert params to string for apiRequest if they exist
		const queryParams: Record<string, string> = {};
		if (params?.page !== undefined) {
			queryParams.page = String(params.page);
		}
		if (params?.limit !== undefined) {
			queryParams.limit = String(params.limit);
		}

		try {
			const response = await apiRequest<ThreadWithPostsAndUser>({
				url,
				method: 'GET',
				params: Object.keys(queryParams).length > 0 ? queryParams : undefined
			});

			// Standardised wrapper → apiRequest has already unwrapped `.data` for us.
			// 1) If backend already returns { thread: {...}, posts?: [...] }, use as-is.
			if (response && typeof response === 'object' && 'thread' in response) {
				return response as ThreadWithPostsAndUser;
			}

			// 2) If backend returned the raw thread object, normalise into { thread: obj }
			return { thread: response } as unknown as ThreadWithPostsAndUser;
		} catch (err: ApiErrorData) {
			if ([401, 403].includes(err?.response?.status)) {
				return null; // caller handles restricted access
			}
			throw err;
		}
	},

	createThread: async (data: {
		title: string;
		structureId: number;
		content: string;
		prefixId?: PrefixId;
		editorState?: Record<string, unknown>;
		tagIds?: number[];
	}): Promise<ThreadWithUser> => {
		const directResult = await apiRequest<ThreadWithUser>({
			url: '/api/forum/threads',
			method: 'POST',
			data
		});
		return directResult;
	},

	updateThread: async (
		threadId: number,
		data: {
			title?: string;
			structureId?: number;
			prefixId?: PrefixId;
			isLocked?: boolean;
			isSticky?: boolean;
			tagIds?: number[];
		}
	): Promise<ThreadWithUser> => {
		const directResult = await apiRequest<ThreadWithUser>({
			url: `/api/forum/threads/${threadId}`,
			method: 'PATCH',
			data
		});
		return directResult;
	},

	deleteThread: async (threadId: number): Promise<{ success: true }> => {
		const directResult = await apiRequest<{ success: true }>({
			url: `/api/forum/threads/${threadId}`,
			method: 'DELETE'
		});
		return directResult;
	},

	/**
	 * Solved/Unsolved Thread Actions
	 */
	solveThread: async (threadId: number, postId?: number): Promise<ThreadWithUser> => {
		const directResult = await apiRequest<ThreadWithUser>({
			url: `/api/forum/threads/${threadId}/solve`,
			method: 'POST',
			data: { postId }
		});
		return directResult;
	},

	unsolveThread: async (threadId: number): Promise<ThreadWithUser> => {
		const directResult = await apiRequest<ThreadWithUser>({
			url: `/api/forum/threads/${threadId}/unsolve`,
			method: 'POST'
		});
		return directResult;
	},

	/**
	 * Tags
	 */
	getTags: async (): Promise<ForumTag[]> => {
		const directResult = await apiRequest<ForumTag[]>({
			url: '/api/forum/tags',
			method: 'GET'
		});
		return directResult;
	},

	addTagToThread: async (threadId: number, tagId: TagId): Promise<ForumTag> => {
		const directResult = await apiRequest<ForumTag>({
			url: `/api/forum/threads/${threadId}/tags`,
			method: 'POST',
			data: { tagId }
		});
		return directResult;
	},

	removeTagFromThread: async (threadId: number, tagId: TagId): Promise<void> => {
		// For void responses, apiRequest returns {}, which is compatible with Promise<void>
		// Assuming the server returns 204 No Content and apiRequest handles it gracefully by returning {}
		await apiRequest<void>({
			url: `/api/forum/threads/${threadId}/tags/${tagId}`,
			method: 'DELETE'
		});
		// No explicit return needed for void, or can return the result of apiRequest if it's truly void-like
	},

	// NOTE: getThreadsByTag removed - use unified searchThreads with tag filter instead

	/**
	 * Prefixes
	 */
	getPrefixes: async (forumId?: ForumId): Promise<ThreadPrefix[]> => {
		const params = forumId ? { forumId: String(forumId) } : undefined; // Ensure forumId is string for params
		const directResult = await apiRequest<ThreadPrefix[]>({
			url: '/api/forum/prefixes',
			method: 'GET',
			params: params
		});
		return directResult;
	},

	/**
	 * Posts (Replies)
	 */
	getPosts: async (
		threadId: number,
		params?: {
			page?: number;
			limit?: number;
		}
	): Promise<{
		posts: PostWithUser[];
		pagination: {
			page: number;
			limit: number;
			totalPosts: number;
			totalPages: number;
		};
	}> => {
		const response = await apiRequest<{
			posts: PostWithUser[];
			pagination: {
				page: number;
				limit: number;
				totalPosts: number;
				totalPages: number;
			};
		}>({
			url: `/api/forum/threads/${threadId}/posts`,
			method: 'GET',
			params: params as Record<string, string>
		});

		// Backend returns { success: true, data: { posts: ..., pagination: ... } }
		// Frontend expects { posts: ..., pagination: ... }
		if (response && typeof response === 'object' && 'data' in response && response.success) {
			return response.data;
		}

		// Fallback for direct data response
		return response;
	},

	createPost: async (data: {
		threadId: number;
		content: string;
		replyToPostId?: number;
		editorState?: Record<string, unknown>;
	}): Promise<PostWithUser> => {
		const directResult = await apiRequest<PostWithUser>({
			url: '/api/forum/posts',
			method: 'POST',
			data
		});
		return directResult;
	},

	updatePost: async (
		postId: number,
		data: {
			content: string;
			editorState?: Record<string, unknown>;
		}
	): Promise<{
		message: string;
		post: PostWithUser;
	}> => {
		const directResult = await apiRequest<{
			message: string;
			post: PostWithUser;
		}>({
			url: `/api/forum/posts/${postId}`,
			method: 'PUT',
			data
		});
		return directResult;
	},

	deletePost: async (postId: number): Promise<{ success: true }> => {
		const directResult = await apiRequest<{ success: true }>({
			url: `/api/forum/posts/${postId}`,
			method: 'DELETE'
		});
		return directResult;
	},

	/**
	 * Reactions
	 */
	reactToPost: async (
		postId: number,
		reactionType: 'like' | 'dislike'
	): Promise<{ success: true; message: string }> => {
		const directResult = await apiRequest<{ success: true; message: string }>({
			url: `/api/forum/posts/${postId}/react`,
			method: 'POST',
			data: { reactionType }
		});
		return directResult;
	},

	tipPost: async (
		postId: number,
		amount: number
	): Promise<{
		success: true;
		tip: {
			amount: number;
			burnAmount: number;
			payoutAmount: number;
		};
	}> => {
		const directResult = await apiRequest<{
			success: true;
			tip: {
				amount: number;
				burnAmount: number;
				payoutAmount: number;
			};
		}>({
			url: `/api/forum/posts/${postId}/tip`,
			method: 'POST',
			data: { amount }
		});
		return directResult;
	},

	/**
	 * Bookmarks
	 */
	bookmarkThread: async (threadId: number): Promise<{ success: true }> => {
		const directResult = await apiRequest<{ success: true }>({
			url: '/api/forum/bookmarks',
			method: 'POST',
			data: { threadId }
		});
		return directResult;
	},

	removeBookmark: async (threadId: number): Promise<{ success: true }> => {
		const directResult = await apiRequest<{ success: true }>({
			url: `/api/forum/bookmarks/${threadId}`,
			method: 'DELETE'
		});
		return directResult;
	},

	getUserBookmarks: async (): Promise<{ threads: ThreadWithUser[] }> => {
		const directResult = await apiRequest<{ threads: ThreadWithUser[] }>({
			url: '/api/forum/bookmarks',
			method: 'GET'
		});
		return directResult;
	},

	/**
	 * Rules
	 */
	getForumRules: async (): Promise<Record<string, unknown>[]> => {
		// This endpoint correctly returns { data: rules, count: rules.length }
		// So, this method is an exception and should remain as is.
		const response = await apiRequest<{ data: Record<string, unknown>[] }>({
			url: '/api/forum/rules',
			method: 'GET'
		});
		return response.data;
	},

	getUserAgreements: async (): Promise<Record<string, unknown>> => {
		// Server returns the agreement object directly
		const directResponse = await apiRequest<Record<string, unknown>>({
			url: '/api/forum/rules/user-agreements',
			method: 'GET'
		});
		return directResponse;
	},

	agreeToRules: async (ruleIds: number[]): Promise<{ success: boolean }> => {
		// Server returns { success: true, ... } directly
		const directResponse = await apiRequest<{ success: boolean }>({
			url: '/api/forum/rules/agree',
			method: 'POST',
			data: { ruleIds }
		});
		return directResponse;
	},

	/**
	 * Reports
	 */
	reportPost: async (data: {
		contentType: 'post' | 'thread' | 'message';
		contentId: ContentId;
		reason: string;
		details?: string;
	}): Promise<{ success: true; message: string; reportId: ReportId }> => {
		const directResult = await apiRequest<{ success: true; message: string; reportId: ReportId }>({
			url: '/api/forum/reports',
			method: 'POST',
			data
		});
		return directResult;
	}
};

export default forumApi;
