import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export type ContentTab = 'trending' | 'recent' | 'following' | 'hot' | 'announcements' | 'my-threads' | 'mentions';

import type { Thread } from '@shared/types/thread.types';
import type { ForumId } from '@shared/types/ids';

export interface ContentResponse {
	items: Thread[];
	meta: {
		hasMore: boolean;
		total: number;
		page: number;
	};
}

export interface UseContentParams {
	tab?: ContentTab;
	forumId?: ForumId;
	initialTab?: ContentTab;
	filters?: ContentFilters;
}

export interface ContentFilters {
	timeRange?: 'hour' | 'day' | 'week' | 'month' | 'all';
	showFollowedOnly?: boolean;
	hideReadThreads?: boolean;
	sortBy?: 'latest' | 'replies' | 'tips' | 'views';
}

/**
 * React Query hook for fetching tab-based content
 * Reusable for both home page and forum-specific content
 */
export function useContent(params: UseContentParams = {}) {
	const [activeTab, setActiveTab] = useState<ContentTab>(
		params.initialTab || params.tab || 'trending'
	);

	const { data, isLoading, error, refetch, isFetching } = useQuery<ContentResponse>({
		queryKey: ['content', activeTab, params.forumId || 'all', params.filters],
		queryFn: async (): Promise<ContentResponse> => {
			// Handle mentions tab separately
			if (activeTab === 'mentions') {
				// Import the mentions hook dynamically to avoid circular dependencies
				const { useContentMentions } = await import('./use-content-mentions');
				// This is a workaround - we'll handle mentions differently in content-area.tsx
				return { items: [], meta: { hasMore: false, total: 0, page: 1 } };
			}

			const searchParams = new URLSearchParams({
				tab: activeTab,
				page: '1',
				limit: '20'
			});

			if (params.forumId) {
				searchParams.append('forumId', params.forumId.toString());
			}

			// Add filter params
			if (params.filters) {
				if (params.filters.timeRange) {
					searchParams.append('timeRange', params.filters.timeRange);
				}
				if (params.filters.showFollowedOnly) {
					searchParams.append('followedOnly', 'true');
				}
				if (params.filters.hideReadThreads) {
					searchParams.append('hideRead', 'true');
				}
				if (params.filters.sortBy) {
					searchParams.append('sort', params.filters.sortBy);
				}
			}

			const response = await fetch(`/api/forums/content?${searchParams.toString()}`);

			if (!response.ok) {
				throw new Error(`Failed to fetch content: ${response.statusText}`);
			}

			const result = await response.json();
			// Handle the API response format {success: true, data: {...}}
			return result.data || result;
		},
		staleTime: 30 * 1000, // 30 seconds
		refetchInterval: 60 * 1000, // 1 minute auto-refresh
		retry: (failureCount, error: any) => {
			// Don't retry auth errors
			if (error?.message?.includes('401') || error?.message?.includes('Authentication')) {
				return false;
			}
			return failureCount < 2;
		}
	});

	const switchTab = (newTab: ContentTab) => {
		setActiveTab(newTab);
	};

	return {
		// Data
		items: data?.items || [],
		meta: data?.meta || { hasMore: false, total: 0, page: 1 },

		// State
		activeTab,
		isLoading,
		error,
		isFetching,

		// Actions
		switchTab,
		refetch
	};
}

/**
 * Hook specifically for home page content (no forumId)
 */
export function useHomeContent(initialTab: ContentTab = 'trending') {
	return useContent({ initialTab });
}

/**
 * Hook specifically for forum content (with forumId)
 */
export function useForumContent(forumId: ForumId, initialTab: ContentTab = 'recent') {
	return useContent({ forumId, initialTab });
}
