import { useQuery } from '@tanstack/react-query';
import { activityApi } from '@/features/activity/services/activityApi';
import { useAuth } from '@/hooks/use-auth';
import type { EventLogFilters } from '@/features/activity/types/activity.types';
import { toUserId } from '@shared/utils/id';

/**
 * Hook for fetching and managing user activity feed
 */
export const useActivityFeed = (filters?: EventLogFilters) => {
	const { user } = useAuth();

	const userId = user?.id;

	const { data, isLoading, isError, error, refetch } = useQuery({
		queryKey: ['activityFeed', userId, filters],
		queryFn: () => {
			if (!userId) {
				throw new Error('User ID is required');
			}

			return activityApi.getCurrentUserEventLogs(toUserId(userId), filters);
		},
		enabled: !!userId,
		placeholderData: (previousData) => previousData
	});

	return {
		activityFeed: data,
		isLoading,
		isError,
		error,
		refetch
	};
};

/**
 * Hook for fetching and managing admin activity feed for all users
 */
export const useAdminActivityFeed = (filters?: EventLogFilters) => {
	const { data, isLoading, isError, error, refetch } = useQuery({
		queryKey: ['adminActivityFeed', filters],
		queryFn: () => activityApi.getAllEventLogs(filters),
		placeholderData: (previousData) => previousData
	});

	return {
		activityFeed: data,
		isLoading,
		isError,
		error,
		refetch
	};
};

/**
 * Hook for fetching and managing admin activity feed for a specific user
 */
export const useUserActivityFeed = (userId: string, filters?: EventLogFilters) => {
	const { data, isLoading, isError, error, refetch } = useQuery({
		queryKey: ['userActivityFeed', userId, filters],
		queryFn: () => {
			if (!userId) {
				throw new Error('User ID is required');
			}
			return activityApi.getUserEventLogs(toUserId(userId), filters);
		},
		enabled: !!userId,
		placeholderData: (previousData) => previousData
	});

	return {
		activityFeed: data,
		isLoading,
		isError,
		error,
		refetch
	};
};
