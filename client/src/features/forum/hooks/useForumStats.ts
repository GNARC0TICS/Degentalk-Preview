import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface ForumMetrics {
	totalThreads: number;
	totalPosts: number;
	onlineUsers: number;
	todaysActivity: number;
}

export const useForumMetrics = (structureId?: number) => {
	return useQuery<ForumMetrics>({
		queryKey: ['/api/forum/metrics', { structureId }],
		queryFn: async () => {
			// This would typically fetch from an API endpoint
			// For now, returning mock data
			return {
				totalThreads: 1337,
				totalPosts: 42069,
				onlineUsers: 420,
				todaysActivity: 69
			};
		},
		staleTime: 60000, // 1 minute
		refetchInterval: 60000 // Auto-refresh every minute
	});
};

export interface HotThread {
	id: string;
	title: string;
	slug: string;
	replyCount: number;
	viewCount: number;
	lastActivityAt: string;
	forumName: string;
	forumSlug: string;
	authorUsername: string;
	isPinned?: boolean;
	isHot?: boolean;
}

export const useHotThreads = (params?: { limit?: number; structureId?: number }) => {
	const limit = params?.limit || 5;

	return useQuery<HotThread[]>({
		queryKey: ['/api/forum/hot-threads', params],
		queryFn: async () => {
			const response = await apiRequest<{ threads: HotThread[] }>({
				url: '/api/forum/threads',
				params: {
					sort: 'hot',
					limit,
					structureId: params?.structureId
				}
			});
			return response.threads || [];
		},
		staleTime: 60000, // 1 minute
		refetchInterval: 60000 // Auto-refresh every minute
	});
};
