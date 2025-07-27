import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/utils/api-request';

export interface ExtendedProfileStats {
	// Core profile data
	id: string;
	username: string;
	avatarUrl: string | null;
	bio: string | null;
	level: number;
	xp: number;
	nextLevelXp: number;
	joinedAt: string;

	// Reputation & trust
	reputation: number;
	reputation: number;
	dailyXpGained: number;
	lastXpGainDate: string | null;

	// Activity metrics
	totalPosts: number;
	totalThreads: number;
	totalLikes: number;
	totalTips: number;
	threadViewCount: number;
	posterRank: number | null;
	tipperRank: number | null;
	likerRank: number | null;

	// Wallet & economy
	dgtBalance: number;
	walletBalanceUSDT: number;
	walletPendingWithdrawals: number;
	dgtPoints: number;

	// Social graph
	followersCount: number;
	followingCount: number;
	friendsCount: number;
	friendRequestsSent: number;
	friendRequestsReceived: number;

	// Subscriptions & roles
	activeSubscription: {
		type: string;
		status: string;
		endDate: string | null;
		pricePaid: string;
	} | null;
	primaryRole: {
		name: string;
		badgeImage: string | null;
		textColor: string | null;
		xpMultiplier: number;
	} | null;
	isStaff: boolean;
	isModerator: boolean;
	isAdmin: boolean;

	// Referrals & progression
	referralLevel: number;
	referralsCount: number;

	// Path XP removed - using linear XP system only

	// Account security
	lastSeenAt: string | null;
	lastLogin: string | null;
}

export function useProfileStats(username: string) {
	return useQuery<ExtendedProfileStats>({
		queryKey: ['profile-stats', username],
		queryFn: async () => {
			if (!username) throw new Error('Username required');

			return apiRequest<ExtendedProfileStats>({
				url: `/api/profile/${username}/stats`,
				method: 'GET'
			});
		},
		enabled: !!username,
		staleTime: 30000, // Cache for 30 seconds
		gcTime: 5 * 60 * 1000 // Keep in cache for 5 minutes
	});
}

// Hook for basic profile data (existing functionality)
export function useProfile(username: string) {
	return useQuery({
		queryKey: ['profile', username],
		queryFn: async () => {
			if (!username) throw new Error('Username required');

			const res = await fetch(`/api/profile/${username}`);
			if (!res.ok) throw new Error('Failed to fetch profile');
			return res.json();
		},
		enabled: !!username,
		staleTime: 30000,
		gcTime: 5 * 60 * 1000
	});
}

// Helper hook to check if stats are available
export function useProfileStatsAvailable(username: string) {
	const { data, isLoading, isError } = useProfileStats(username);

	return {
		hasExtendedStats: !isLoading && !isError && !!data,
		extendedStats: data,
		isLoading,
		isError
	};
}
