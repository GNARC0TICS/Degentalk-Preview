import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@app/utils/api-request';
import type { User } from '@shared/types/entities';

export function useUserByUsername(username?: string) {
  return useQuery<User | null>({
    queryKey: ['user', 'by-username', username],
    queryFn: async () => {
      if (!username) return null;
      
      try {
        const response = await apiRequest<User>({
          url: `/api/users?username=${encodeURIComponent(username)}`,
          method: 'GET'
        });
        return response;
      } catch (error) {
        // Return null for 404 (user not found) rather than throwing
        if ((error as any)?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: Boolean(username),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 (user not found)
      if ((error as any)?.status === 404) {
        return false;
      }
      return failureCount < 2;
    }
  });
}