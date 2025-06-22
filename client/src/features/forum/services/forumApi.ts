/**
 * Forum API Service
 *
 * Centralizes all forum-related API calls to provide a single point
 * of interaction with the forum backend endpoints.
 */

// TODO: @syncSchema Update based on recent changes in schema.ts: ForumCategory now has 'color' and 'icon' fields.
import { apiRequest } from '@/lib/queryClient';
import type { ForumCategory } from '@schema';
import type {
	ForumCategoryWithStats,
	ThreadWithUser,
	PostWithUser,
	ForumTag,
	ThreadPrefix,
	ThreadWithPostsAndUser // Added import
} from '@db_types/forum.types';

// Define the nested category type extending ForumCategory
export interface NestedForumCategory extends ForumCategory {
	children?: NestedForumCategory[];
}

export interface ThreadSearchParams {
	categoryId?: number;
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
}

export const forumApi = {
	/**
	 * Categories
	 */
	getCategories: async (): Promise<ForumCategoryWithStats[]> => {
		const directArrayResponse = await apiRequest<ForumCategoryWithStats[]>({
			url: '/api/forum/categories',
			method: 'GET'
		});
		return directArrayResponse;
	},

	getCategoryBySlug: async (slug: string): Promise<ForumCategoryWithStats> => {
		const directItemResponse = await apiRequest<ForumCategoryWithStats>({
			url: `/api/forum/categories/${slug}`,
			method: 'GET'
		});
		return directItemResponse;
	},

	getForumBySlug: async (
		slug: string
	): Promise<{
		forum: ForumCategoryWithStats;
	}> => {
		const directResponse = await apiRequest<{
			forum: ForumCategoryWithStats;
		}>({
			url: `/api/forum/forums/${slug}`,
			method: 'GET'
		});
		return directResponse;
	},

	getForumBySlugWithTopics: async (
		slug: string
	): Promise<{
		forum: ForumCategoryWithStats;
		topics: ForumCategoryWithStats[];
	}> => {
		const directResponse = await apiRequest<{
			forum: ForumCategoryWithStats;
			topics: ForumCategoryWithStats[];
		}>({
			url: `/api/forum/forums/${slug}/topics`,
			method: 'GET'
		});
		return directResponse;
	},

	getCategoryById: async (id: number): Promise<ForumCategoryWithStats> => {
		const directItemResponse = await apiRequest<ForumCategoryWithStats>({
			url: `/api/forum/category/${id}`,
			method: 'GET'
		});
		return directItemResponse;
	},

	/**
	 * Hierarchical Categories
	 */
	getCategoriesTree: async (): Promise<NestedForumCategory[]> => {
		const directArrayResponse = await apiRequest<NestedForumCategory[]>({
			url: '/api/forum/categories/tree',
			method: 'GET'
		});
		return directArrayResponse;
	},

	/**
	 * Threads
	 */
	searchThreads: async (params: ThreadSearchParams): Promise<ThreadSearchResult> => {
		// Convert params to string values for API request
		const apiParams: Record<string, string> = {};

		if (params.categoryId !== undefined) {
			apiParams.categoryId = String(params.categoryId);
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

		const directResult = await apiRequest<ThreadSearchResult>({
			url: '/api/forum/threads/search',
			method: 'GET',
			params: apiParams
		});

		return directResult;
	},

	getThread: async (
		slugOrId: string | number,
		params?: { page?: number; limit?: number }
	): Promise<ThreadWithPostsAndUser> => {
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

		const directResult = await apiRequest<ThreadWithPostsAndUser>({
			url,
			method: 'GET',
			params: Object.keys(queryParams).length > 0 ? queryParams : undefined
		});
		return directResult;
	},

	createThread: async (data: {
		title: string;
		categoryId: number;
		content: string;
		prefixId?: number;
		editorState?: any;
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
			categoryId?: number;
			prefixId?: number;
			isLocked?: boolean;
			isSticky?: boolean;
			tagIds?: number[];
		}
	): Promise<ThreadWithUser> => {
		const directResult = await apiRequest<ThreadWithUser>({
			url: `/api/threads/${threadId}`,
			method: 'PATCH',
			data
		});
		return directResult;
	},

	deleteThread: async (threadId: number): Promise<{ success: true }> => {
		const directResult = await apiRequest<{ success: true }>({
			url: `/api/threads/${threadId}`,
			method: 'DELETE'
		});
		return directResult;
	},

	/**
	 * Solved/Unsolved Thread Actions
	 */
	solveThread: async (threadId: number, postId?: number): Promise<ThreadWithUser> => {
		const directResult = await apiRequest<ThreadWithUser>({
			url: `/api/threads/${threadId}/solve`,
			method: 'POST',
			data: { postId }
		});
		return directResult;
	},

	unsolveThread: async (threadId: number): Promise<ThreadWithUser> => {
		const directResult = await apiRequest<ThreadWithUser>({
			url: `/api/threads/${threadId}/unsolve`,
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

	addTagToThread: async (threadId: number, tagId: number): Promise<ForumTag> => {
		const directResult = await apiRequest<ForumTag>({
			url: `/api/forum/threads/${threadId}/tags`,
			method: 'POST',
			data: { tagId }
		});
		return directResult;
	},

	removeTagFromThread: async (threadId: number, tagId: number): Promise<void> => {
		// For void responses, apiRequest returns {}, which is compatible with Promise<void>
		// Assuming the server returns 204 No Content and apiRequest handles it gracefully by returning {}
		await apiRequest<void>({
			url: `/api/forum/threads/${threadId}/tags/${tagId}`,
			method: 'DELETE'
		});
		// No explicit return needed for void, or can return the result of apiRequest if it's truly void-like
	},

	getThreadsByTag: async (
		tagSlug: string,
		params?: {
			page?: number;
			limit?: number;
			sortBy?: 'latest' | 'hot' | 'staked' | 'popular' | 'recent';
		}
	): Promise<ThreadSearchResult> => {
		const directResult = await apiRequest<ThreadSearchResult>({
			url: `/api/forum/tags/${tagSlug}/threads`,
			method: 'GET',
			params: params as Record<string, string>
		});
		return directResult;
	},

	/**
	 * Prefixes
	 */
	getPrefixes: async (categoryId?: number): Promise<ThreadPrefix[]> => {
		const params = categoryId ? { categoryId: String(categoryId) } : undefined; // Ensure categoryId is string for params
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
		const directResult = await apiRequest<{
			posts: PostWithUser[];
			pagination: {
				page: number;
				limit: number;
				totalPosts: number;
				totalPages: number;
			};
		}>({
			url: `/api/threads/${threadId}/posts`,
			method: 'GET',
			params: params as Record<string, string>
		});
		return directResult;
	},

	createPost: async (data: {
		threadId: number;
		content: string;
		replyToPostId?: number;
		editorState?: any;
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
			editorState?: any;
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
			url: `/api/posts/${postId}`,
			method: 'DELETE'
		});
		return directResult;
	},

	/**
	 * Reactions
	 */
	likePost: async (postId: number): Promise<{ success: true; liked: boolean }> => {
		const directResult = await apiRequest<{ success: true; liked: boolean }>({
			url: `/api/posts/${postId}/like`,
			method: 'POST'
		});
		return directResult;
	},

	unlikePost: async (postId: number): Promise<{ success: true; liked: boolean }> => {
		const directResult = await apiRequest<{ success: true; liked: boolean }>({
			url: `/api/posts/${postId}/like`, // Endpoint for unlike is DELETE to the same URL
			method: 'DELETE'
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
			url: `/api/posts/${postId}/tip`,
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
			url: '/api/bookmarks',
			method: 'POST',
			data: { threadId }
		});
		return directResult;
	},

	removeBookmark: async (threadId: number): Promise<{ success: true }> => {
		const directResult = await apiRequest<{ success: true }>({
			url: `/api/bookmarks/${threadId}`,
			method: 'DELETE'
		});
		return directResult;
	},

	getUserBookmarks: async (): Promise<{ threads: ThreadWithUser[] }> => {
		const directResult = await apiRequest<{ threads: ThreadWithUser[] }>({
			url: '/api/bookmarks',
			method: 'GET'
		});
		return directResult;
	},

	/**
	 * Rules
	 */
	getForumRules: async (): Promise<any[]> => {
		// This endpoint correctly returns { data: rules, count: rules.length }
		// So, this method is an exception and should remain as is.
		const response = await apiRequest<{ data: any[] }>({
			url: '/api/forum/rules',
			method: 'GET'
		});
		return response.data;
	},

	getUserAgreements: async (): Promise<any> => {
		// Server returns the agreement object directly
		const directResponse = await apiRequest<any>({
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
		contentId: number;
		reason: string;
		details?: string;
	}): Promise<{ success: true; message: string; reportId: number }> => {
		const directResult = await apiRequest<{ success: true; message: string; reportId: number }>({
			url: '/api/forum/reports',
			method: 'POST',
			data
		});
		return directResult;
	}
};

export default forumApi;
