/**
 * useGamification Hook
 *
 * Main hook for accessing user gamification data including:
 * - Level progression and XP tracking
 * - Achievement progress and unlocks
 * - Mission status and rewards
 * - Leaderboard rankings
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamificationApi } from '@/features/gamification/services/gamification-api.service';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { MissionId } from '@shared/types/ids';
import { toId } from '@shared/types/index';

export function useGamification() {
	const { user } = useAuth();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	// User progression data
	const { data: progression, isLoading: progressionLoading } = useQuery({
		queryKey: ['/api/gamification/progression/me'],
		queryFn: () => gamificationApi.getUserProgression(),
		enabled: !!user,
		staleTime: 1000 * 60 * 5, // 5 minutes
		refetchInterval: 1000 * 60 * 5 // Refetch every 5 minutes
	});

	// User achievements
	const { data: achievementProgress, isLoading: achievementsLoading } = useQuery({
		queryKey: ['/api/gamification/achievements/my-progress'],
		queryFn: () => gamificationApi.getUserAchievementProgress(),
		enabled: !!user,
		staleTime: 1000 * 60 * 5
	});

	// User achievement stats
	const { data: achievementStats } = useQuery({
		queryKey: ['/api/gamification/achievements/my-stats'],
		queryFn: () => gamificationApi.getUserAchievementStats(),
		enabled: !!user,
		staleTime: 1000 * 60 * 5
	});

	// User missions
	const { data: missionProgress, isLoading: missionsLoading } = useQuery({
		queryKey: ['/api/gamification/missions/my-progress'],
		queryFn: () => gamificationApi.getUserMissionProgress(),
		enabled: !!user,
		staleTime: 1000 * 60 * 2, // 2 minutes (missions update more frequently)
		refetchInterval: 1000 * 60 * 2
	});

	// Leaderboard data
	const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
		queryKey: ['/api/gamification/leaderboard', 'xp', 50, 0],
		queryFn: () => gamificationApi.getLeaderboard('xp', 50, 0),
		staleTime: 1000 * 60 * 10 // 10 minutes
	});

	// Claim mission reward mutation
	const claimMissionReward = useMutation({
		mutationFn: (missionId: string) => gamificationApi.claimMissionReward(toId<'MissionId'>(missionId)),
		onSuccess: (data) => {
			// Invalidate relevant queries
			queryClient.invalidateQueries({ queryKey: ['/api/gamification/missions'] });
			queryClient.invalidateQueries({ queryKey: ['/api/gamification/progression'] });
			queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });

			// Show reward toast
			const rewards = [];
			if (data.data.xp) rewards.push(`+${data.data.xp} XP`);
			if (data.data.dgt) rewards.push(`+${data.data.dgt} DGT`);
			if (data.data.badge) rewards.push(`New Badge: ${data.data.badge}`);

			toast({
				title: 'Mission Complete! 🎉',
				description: rewards.join(' • '),
				duration: 5000
			});
		},
		onError: (error: any) => {
			toast({
				title: 'Failed to claim reward',
				description: error.message || 'Please try again later',
				variant: 'destructive'
			});
		}
	});

	// Check for new achievements after an action
	const checkAchievements = useMutation({
		mutationFn: ({
			actionType,
			metadata
		}: {
			actionType: string;
			metadata?: Record<string, unknown>;
		}) => gamificationApi.checkAndAwardAchievements(user!.id, actionType, metadata),
		onSuccess: (data) => {
			// Invalidate achievement queries
			queryClient.invalidateQueries({ queryKey: ['/api/gamification/achievements'] });
			queryClient.invalidateQueries({ queryKey: ['/api/gamification/progression'] });

			// Show achievement unlocked toast for each achievement
			data.data.awarded.forEach((achievement) => {
				toast({
					title: '🏆 Achievement Unlocked!',
					description: `${achievement.name} - ${achievement.description} (+${achievement.rewardXp} XP)`,
					duration: 7000
				});
			});
		}
	});

	// Update mission progress
	const updateMissionProgress = useMutation({
		mutationFn: ({
			actionType,
			metadata
		}: {
			actionType: string;
			metadata?: Record<string, unknown>;
		}) => gamificationApi.updateMissionProgress(user!.id, actionType, metadata),
		onSuccess: () => {
			// Silently update mission progress
			queryClient.invalidateQueries({ queryKey: ['/api/gamification/missions'] });
		}
	});

	// Helper functions
	const getProgressToNextLevel = () => {
		if (!progression?.data) return { current: 0, required: 100, percentage: 0 };

		const { currentXp, xpForNextLevel, progressPercentage } = progression.data;
		return {
			current: currentXp,
			required: xpForNextLevel,
			percentage: progressPercentage
		};
	};

	const getAchievementsByCategory = () => {
		if (!achievementProgress?.data) return {};

		const grouped: Record<string, typeof achievementProgress.data.all> = {};
		achievementProgress.data.all.forEach((userAchievement) => {
			const category = userAchievement.achievement.category;
			if (!grouped[category]) grouped[category] = [];
			grouped[category].push(userAchievement);
		});

		return grouped;
	};

	const getClaimableMissions = () => {
		if (!missionProgress?.data) return [];
		return missionProgress.data.readyToClaim;
	};

	const getUserRank = () => {
		if (!progression?.data) return null;
		return {
			current: progression.data.rank,
			total: leaderboard?.data?.length || 0
		};
	};

	return {
		// Data
		progression: progression?.data,
		achievements: achievementProgress?.data,
		achievementStats: achievementStats?.data,
		missions: missionProgress?.data,
		leaderboard: leaderboard?.data,

		// Loading states
		isLoading: progressionLoading || achievementsLoading || missionsLoading,
		progressionLoading,
		achievementsLoading,
		missionsLoading,
		leaderboardLoading,

		// Actions
		claimMissionReward: claimMissionReward.mutate,
		checkAchievements: checkAchievements.mutate,
		updateMissionProgress: updateMissionProgress.mutate,

		// Helper functions
		getProgressToNextLevel,
		getAchievementsByCategory,
		getClaimableMissions,
		getUserRank,

		// Mutation states
		isClaimingReward: claimMissionReward.isPending,
		isCheckingAchievements: checkAchievements.isPending
	};
}
