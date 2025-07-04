import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export type ContentTab = 'trending' | 'recent' | 'following';

// Use unified ThreadDisplay type instead of custom ContentItem
import type { ThreadDisplay } from '@/types/thread.types';
import type { ForumId } from '@shared/types';

export type ContentItem = ThreadDisplay;

export interface ContentResponse {
	items: ContentItem[];
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
		queryKey: ['content', activeTab, params.forumId || 'all'],
		queryFn: async () => {
			const searchParams = new URLSearchParams({
				tab: activeTab,
				page: '1',
				limit: '20'
			});

			if (params.forumId) {
				searchParams.append('forumId', params.forumId.toString());
			}

			const response = await fetch(`/api/forum/content?${searchParams.toString()}`);

			if (!response.ok) {
				throw new Error(`Failed to fetch content: ${response.statusText}`);
			}

			return response.json();
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
