import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { MissionId, UserId } from '@shared/types';

// Types for missions
export interface Mission {
	id: MissionId;
	title: string;
	description: string;
	type: string;
	requiredAction: string;
	requiredCount: number;
	xpReward: number;
	dgtReward?: number;
	badgeReward?: string;
	icon?: string;
	isDaily: boolean;
	isWeekly: boolean;
	expiresAt: string;
	isActive: boolean;
	minLevel: number;
	sortOrder: number;
}

export interface MissionProgress {
	id: MissionId;
	userId: UserId;
	missionId: MissionId;
	currentCount: number;
	isCompleted: boolean;
	isRewardClaimed: boolean;
	updatedAt: string;
	completedAt?: string;
	claimedAt?: string;
	mission: Mission;
}

export interface MissionReward {
	xp?: number;
	dgt?: number;
	badge?: string;
}

interface MissionWithProgressData extends Mission {
	progress: {
		currentCount: number;
		isCompleted: boolean;
		isRewardClaimed: boolean;
		completedAt?: string;
		claimedAt?: string;
	};
}

/**
 * Hook for interacting with missions
 */
export function useMissions() {
	const { user } = useAuth();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	// Get active missions
	const {
		data: activeMissions,
		isLoading: missionsLoading,
		isError: missionsError,
		error: missionsErrorData
	} = useQuery<Mission[]>({
		queryKey: ['activeMissions'],
		queryFn: async () => {
			return apiRequest({ url: '/api/missions/active', method: 'GET' });
		},
		enabled: !!user?.id,
		refetchInterval: 60 * 1000 // Refresh every minute in case there are changes
	});

	// Get user's mission progress
	const {
		data: missionProgress,
		isLoading: progressLoading,
		isError: progressError,
		error: progressErrorData
	} = useQuery<MissionProgress[]>({
		queryKey: ['missionProgress'],
		queryFn: async () => {
			return apiRequest({ url: '/api/missions/progress', method: 'GET' });
		},
		enabled: !!user?.id,
		refetchInterval: 30 * 1000 // Refresh every 30 seconds to update progress in real-time
	});

	// Claim mission reward mutation
	const claimRewardMutation = useMutation<
		{ success: boolean; message: string; rewards: MissionReward },
		unknown,
		MissionId
	>({
		mutationFn: async (missionId: MissionId) => {
			return apiRequest({ url: `/api/missions/claim/${missionId}`, method: 'POST' });
		},
		onSuccess: (
			data: { success: boolean; message: string; rewards: MissionReward },
			missionId: MissionId
		) => {
			// Show success toast with reward details
			const xpText = data.rewards.xp ? `${data.rewards.xp} XP` : '';
			const dgtText = data.rewards.dgt ? `${data.rewards.dgt} DGT` : '';
			const badgeText = data.rewards.badge ? `"${data.rewards.badge}" badge` : '';

			const rewards = [xpText, dgtText, badgeText].filter(Boolean).join(', ');

			toast({
				title: 'Mission Completed!',
				description: `You've received ${rewards}`,
				variant: 'default' // Changed from "success"
			});

			// Invalidate relevant queries
			queryClient.invalidateQueries({ queryKey: ['missionProgress'] });
			queryClient.invalidateQueries({ queryKey: ['userProfile'] });
			if (data.rewards.dgt) {
				queryClient.invalidateQueries({ queryKey: ['walletBalance'] });
			}
		},
		onError: (error: any) => {
			toast({
				title: 'Error',
				description: `Failed to claim reward: ${error?.message || 'Unknown error'}`,
				variant: 'destructive'
			});
		}
	});

	// Get combined mission data with progress
	let missionsWithProgress: MissionWithProgressData[] = []; // Initialize as an empty array
	if (Array.isArray(missionProgress)) {
		missionsWithProgress = missionProgress.map(
			(progress: MissionProgress): MissionWithProgressData => ({
				...progress.mission,
				progress: {
					currentCount: progress.currentCount,
					isCompleted: progress.isCompleted,
					isRewardClaimed: progress.isRewardClaimed,
					completedAt: progress.completedAt,
					claimedAt: progress.claimedAt
				}
			})
		);
	}

	// Helper function to get mission types
	const getMissionTypes = () => {
		if (!Array.isArray(missionsWithProgress)) return [];

		const types = missionsWithProgress.reduce<string[]>(
			(acc: string[], mission: (typeof missionsWithProgress)[0]) => {
				if (mission && mission.type && !acc.includes(mission.type)) {
					acc.push(mission.type);
				}
				return acc;
			},
			[]
		);

		return types;
	};

	// Helper function to get formatted expiration time
	const getExpirationTime = (mission: Mission) => {
		if (!mission.expiresAt) return null;

		const expireDate = new Date(mission.expiresAt);
		const now = new Date();
		const diff = expireDate.getTime() - now.getTime();

		// If expired, return null
		if (diff <= 0) return null;

		// Format as hours:minutes if less than a day
		if (diff < 24 * 60 * 60 * 1000) {
			const hours = Math.floor(diff / (60 * 60 * 1000));
			const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
			return `${hours}h ${minutes}m`;
		}

		// Format as days otherwise
		const days = Math.floor(diff / (24 * 60 * 60 * 1000));
		return `${days} day${days > 1 ? 's' : ''}`;
	};

	return {
		// Data
		missions: activeMissions,
		progress: missionProgress,
		missionsWithProgress,

		// Loading states
		isLoading: missionsLoading || progressLoading,
		isError: missionsError || progressError,
		error: missionsErrorData || progressErrorData,

		// Actions
		claimReward: (missionId: MissionId) => claimRewardMutation.mutate(missionId),
		isClaimingReward: claimRewardMutation.isPending,

		// Helper functions
		getMissionTypes,
		getExpirationTime,

		// Filter missions by type
		getDailyMissions: () =>
			Array.isArray(missionsWithProgress)
				? missionsWithProgress.filter((m: (typeof missionsWithProgress)[0]) => m.isDaily)
				: [],
		getWeeklyMissions: () =>
			Array.isArray(missionsWithProgress)
				? missionsWithProgress.filter((m: (typeof missionsWithProgress)[0]) => m.isWeekly)
				: []
	};
}
