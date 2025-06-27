import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export type ContentTab = 'trending' | 'recent' | 'following';

export interface ContentItem {
	id: number;
	title: string;
	slug: string;
	userId: string;
	prefixId: number | null;
	isSticky: boolean;
	isLocked: boolean;
	isHidden: boolean;
	viewCount: number;
	postCount: number;
	firstPostLikeCount: number;
	lastPostAt: string | null;
	createdAt: string;
	updatedAt: string | null;
	isSolved: boolean;
	solvingPostId: number | null;
	user: {
		id: string;
		username: string;
		avatarUrl: string | null;
		activeAvatarUrl: string | null;
		role: string;
	};
	category: {
		id: number;
		name: string;
		slug: string;
	};
	tags: any[];
	canEdit: boolean;
	canDelete: boolean;
}

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
	forumId?: number;
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

			const response = await fetch(`/api/content?${searchParams.toString()}`);

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
export function useForumContent(forumId: number, initialTab: ContentTab = 'recent') {
	return useContent({ forumId, initialTab });
}
