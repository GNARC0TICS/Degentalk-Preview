import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from 'sonner';

export interface Level {
	level: number;
	minXp: number;
	name?: string;
	rewardDgt?: number;
	rewardTitleId?: number;
	rewardBadgeId?: number;
}

export interface UserXP {
	userId: string; // Changed to string
	username: string;
	currentXp: number;
	currentLevel: number;
	currentLevelData: Level;
	nextLevel: number | null;
	nextLevelData: Level | null;
	xpForNextLevel: number | null;
	progress: number;
}

export interface UserTitle {
	id: number;
	name: string;
	description?: string;
	iconUrl?: string;
	rarity: string;
	isEquipped: boolean;
	awardedAt: string;
}

export interface UserBadge {
	id: number;
	name: string;
	description?: string;
	iconUrl: string;
	rarity: string;
	awardedAt: string;
}

export interface XpAdjustmentEntry {
	id: number;
	userId: string; // Changed to string
	adminId: string; // Changed to string, as it's a user ID
	adminUsername?: string;
	adjustmentType: string;
	amount: number;
	reason: string;
	oldXp: number;
	newXp: number;
	createdAt: string;
}

/**
 * Hook to fetch and manage user XP data
 * Uses domain-based endpoints from the XP domain service
 *
 * @param userId - User ID to fetch XP data for (optional, defaults to current user)
 */
export function useXP(userId?: string): {
	xpData: UserXP | undefined;
	titles: UserTitle[];
	badges: UserBadge[];
	xpHistory: XpAdjustmentEntry[];
	isLoading: boolean;
	error: Error | null;
	equipTitle: (titleId: number) => void;
} { // Changed to string
	const queryClient = useQueryClient();

	// Fetch user XP data
	const {
		data: xpData,
		isLoading,
		error
	} = useQuery({
		queryKey: ['xp', userId],
		queryFn: async (): Promise<UserXP> => {
			const endpoint = userId ? `/api/xp/users/${userId}/info` : '/api/xp/me/info';

			return apiRequest({ url: endpoint });
		}
	});

	// Fetch user titles
	const { data: titles = [] } = useQuery({
		queryKey: ['xp-titles', userId],
		queryFn: async (): Promise<UserTitle[]> => {
			const endpoint = userId ? `/api/xp/users/${userId}/titles` : '/api/xp/me/titles';

			return apiRequest({ url: endpoint });
		},
		enabled: !!xpData
	});

	// Fetch user badges
	const { data: badges = [] } = useQuery({
		queryKey: ['xp-badges', userId],
		queryFn: async (): Promise<UserBadge[]> => {
			const endpoint = userId ? `/api/xp/users/${userId}/badges` : '/api/xp/me/badges';

			return apiRequest({ url: endpoint });
		},
		enabled: !!xpData
	});

	// Fetch XP history (for admins or viewing own history)
	const { data: xpHistory = [], isLoading: isHistoryLoading } = useQuery({
		queryKey: ['xp-history', userId],
		queryFn: async (): Promise<XpAdjustmentEntry[]> => {
			const endpoint = userId
				? `/api/xp/adjustments/history/${userId}`
				: '/api/xp/me/adjustments/history';

			return apiRequest({ url: endpoint });
		},
		enabled: !!xpData
	});

	// Equip a title mutation
	const equipTitle = useMutation({
		mutationFn: async (titleId: number) => {
			return apiRequest({ method: 'POST', url: '/api/xp/me/titles/equip', data: { titleId } });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['xp', userId] });
			queryClient.invalidateQueries({ queryKey: ['xp-titles', userId] });
			toast.success('Title equipped successfully');
		},
		onError: (error: Error) => {
			toast.error('Failed to equip title: ' + (error.message || 'Unknown error'));
		}
	});

	return {
		xpData,
		titles,
		badges,
		xpHistory,
		isLoading: isLoading || isHistoryLoading,
		error,
		equipTitle: (titleId: number) => equipTitle.mutate(titleId)
	};
}
