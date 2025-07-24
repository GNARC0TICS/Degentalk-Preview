import { useQuery } from '@tanstack/react-query';
import type { ActiveUser } from '@app/components/users/ActiveMembersWidget';
import { getActiveUsers } from '../services';

/**
 * Hook to fetch active users on the platform
 *
 * @param options Configuration options for the query
 * @returns Query result with active users data
 */
export function useActiveUsers(options?: { limit?: number; enabled?: boolean }) {
	const { limit = 5, enabled = true } = options || {};

	return useQuery<ActiveUser[]>({
		queryKey: ['activeUsers', { limit }],
		queryFn: () => getActiveUsers(limit),
		enabled,
		staleTime: 1000 * 60, // 1 minute
		refetchInterval: 1000 * 60 * 3 // Refresh every 3 minutes
	});
}

export default useActiveUsers;
