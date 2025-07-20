import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/utils/api-request';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { createSafeWebSocket } from '@/utils/safeWebSocket';
import type { TitleId, BadgeId, LevelId } from '@shared/types/ids';

export interface Level {
	level: number;
	minXp: number;
	name?: string;
	rewardDgt?: number;
	rewardTitleId?: TitleId;
	rewardBadgeId?: BadgeId;
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
	pendingRewards?: {
		title?: string;
		badge?: {
			name: string;
			imageUrl: string;
		};
		dgt?: number;
	};
	
	// Additional properties expected by components
	level: number; // Alias for currentLevel
	currentLevelXP: number; // XP at current level
	nextLevelXP: number | null; // XP needed for next level
	progressToNextLevel: number; // Progress percentage to next level
	badges?: UserBadge[]; // User badges
	titles?: UserTitle[]; // Available titles
	equippedTitle?: string; // Currently equipped title
}

export interface UserTitle {
	id: TitleId;
	name: string;
	description?: string;
	iconUrl?: string;
	rarity: string;
	isEquipped: boolean;
	awardedAt: string;
}

export interface UserBadge {
	id: BadgeId;
	name: string;
	description?: string;
	iconUrl: string;
	rarity: string;
	awardedAt: string;
}

export interface XpAdjustmentEntry {
	id: LevelId;
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
	pendingRewards: UserXP['pendingRewards'];
	titles: UserTitle[];
	badges: UserBadge[];
	xpHistory: XpAdjustmentEntry[];
	isLoading: boolean;
	error: Error | null;
	equipTitle: (title: UserTitle) => void;
} {
	// Changed to string
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

			return apiRequest<UserXP>({ url: endpoint, method: 'GET' });
		}
	});

	// Fetch user titles
	const { data: titles = [] } = useQuery({
		queryKey: ['xp-titles', userId],
		queryFn: async (): Promise<UserTitle[]> => {
			const endpoint = userId ? `/api/xp/users/${userId}/titles` : '/api/xp/me/titles';

			return apiRequest<UserTitle[]>({ url: endpoint, method: 'GET' });
		},
		enabled: !!xpData
	});

	// Fetch user badges
	const { data: badges = [] } = useQuery({
		queryKey: ['xp-badges', userId],
		queryFn: async (): Promise<UserBadge[]> => {
			const endpoint = userId ? `/api/xp/users/${userId}/badges` : '/api/xp/me/badges';

			return apiRequest<UserBadge[]>({ url: endpoint, method: 'GET' });
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

			return apiRequest<XpAdjustmentEntry[]>({ url: endpoint, method: 'GET' });
		},
		enabled: !!xpData
	});

	// Equip a title mutation
	const equipTitleMutation = useMutation({
		mutationFn: async (title: UserTitle) => {
			return apiRequest({ method: 'POST', url: '/api/xp/me/titles/equip', data: { titleId: title.id } });
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

	const [pendingRewards, setPendingRewards] = useState<UserXP['pendingRewards']>(undefined);

	// WebSocket: listen for XP reward events
	useEffect(() => {
		if (!xpData) return;
		// Attempt to connect – safe in prod only
		const socket = createSafeWebSocket({
			path: `/ws/xp?userId=${xpData.userId}`,
			onMessage: (msg: any) => {
				if (!msg || typeof msg !== 'object') return;
				if (msg.type === 'xp_reward') {
					// Assume payload: { delta: number, newLevel?: number, rewards?: { title?, badge?, dgt? } }
					if (msg.rewards) {
						setPendingRewards(msg.rewards);
					}
					// Refresh XP query to reflect new totals
					queryClient.invalidateQueries({ queryKey: ['xp', userId] });
				}
			}
		});

		return () => {
			if (socket) socket.close();
		};
	}, [xpData, userId, queryClient]);

	return {
		xpData: xpData ? { ...xpData, pendingRewards } : undefined,
		pendingRewards,
		titles,
		badges,
		xpHistory,
		isLoading: isLoading || isHistoryLoading,
		error,
		equipTitle: (title: UserTitle) => equipTitleMutation.mutate(title)
	};
}
