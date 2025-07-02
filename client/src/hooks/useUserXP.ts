import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { UserId } from '@/types/ids';

export type UserXPData = {
	userId: UserId;
	username: string;
	currentXp: number;
	currentLevel: number;
	nextLevel: number | null;
	xpForNextLevel: number | null;
	progress: number;
	currentLevelData?: {
		level: number;
		minXp: number;
		name?: string;
		rewardDgt?: number;
	};
	nextLevelData?: {
		level: number;
		minXp: number;
		name?: string;
		rewardDgt?: number;
	} | null;
};

/**
 * Custom hook for fetching a user's XP and level data
 * Using domain-based endpoints from the XP domain service
 *
 * @param userId Optional user ID. If not provided, fetches the current user's data
 * @returns User XP data and loading state
 */
export function useUserXP(userId?: UserId) {
	const { toast } = useToast();

	// Use the new domain-based endpoints
	const endpoint = userId ? `/api/xp/users/${userId}/info` : '/api/xp/me/info';

	const { data, isLoading, error, refetch } = useQuery<UserXPData>({
		queryKey: [`user-xp-${userId || 'me'}`],
		queryFn: async () => {
			try {
				const response = await apiRequest(endpoint);

				if (!response) {
					throw new Error('Failed to fetch XP data');
				}

				// Response already has the right format from the new domain API
				return response;
			} catch (err) {
				toast({
					title: 'Error',
					description: 'Failed to load XP data',
					variant: 'destructive'
				});
				throw err;
			}
		},
		// Only refetch when explicitly requested
		refetchOnWindowFocus: false,
		// Fallback for unauthenticated users or errors
		placeholderData: {
			userId: 'guest' as UserId,
			username: 'Guest',
			currentXp: 0,
			currentLevel: 1,
			nextLevel: 2,
			xpForNextLevel: 100,
			progress: 0,
			currentLevelData: {
				level: 1,
				minXp: 0,
				name: 'Newcomer'
			},
			nextLevelData: {
				level: 2,
				minXp: 100,
				name: 'Beginner'
			}
		}
	});

	return {
		data,
		isLoading,
		error,
		refetch
	};
}
