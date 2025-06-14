import { useQuery } from '@tanstack/react-query';
import { activityApi, EventLogFilters } from '../services/activityApi';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook for fetching and managing user activity feed
 */
export const useActivityFeed = (filters?: EventLogFilters) => {
  const { user } = useAuth();
  
  const userId = user?.id;
  
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['activityFeed', userId, filters],
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      return activityApi.getCurrentUserEventLogs(userId, filters);
    },
    enabled: !!userId,
    keepPreviousData: true
  });
  
  return {
    activityFeed: data?.data,
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
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['adminActivityFeed', filters],
    queryFn: () => activityApi.getAllEventLogs(filters),
    keepPreviousData: true
  });
  
  return {
    activityFeed: data?.data,
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
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['userActivityFeed', userId, filters],
    queryFn: () => activityApi.getUserEventLogs(userId, filters),
    enabled: !!userId,
    keepPreviousData: true
  });
  
  return {
    activityFeed: data?.data,
    isLoading,
    isError,
    error,
    refetch
  };
}; 