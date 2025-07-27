import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/utils/api-request';

export interface FollowUser {
	id: string;
	username: string;
	avatarUrl?: string | null;
	activeAvatarUrl?: string | null;
	level?: number | null;
	role?: string | null;
	reputation?: number | null;
	followedAt: string;
}

interface UseFollowingResult {
	users: FollowUser[];
	isLoading: boolean;
	error: Error | null;
}

/**
 * Fetches list of users that the given userId is following (Whale-Watch "following" list).
 * @param userId target profile user id (uuid string)
 */
export function useFollowing(userId: string): UseFollowingResult {
	const { data, isLoading, error } = useQuery<{ following: FollowUser[] } | undefined, Error>({
		queryKey: ['following', userId],
		queryFn: async () => {
			if (!userId) return undefined;
			return apiRequest({ url: `/api/users/${userId}/following?page=1&limit=40`, method: 'GET' });
		},
		enabled: Boolean(userId)
	});

	return {
		users: data?.following ?? [],
		isLoading,
		error: error ?? null
	};
}
