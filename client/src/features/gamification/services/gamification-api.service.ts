/**
 * Gamification API Service
 *
 * Centralized API client for all gamification features:
 * - Leveling and progression
 * - Achievements and rewards
 * - Missions and daily tasks
 * - Leaderboards and rankings
 * - Analytics and statistics
 */

import { apiRequest } from '@/utils/api-request';
import type { UserId, AchievementId, MissionId, TitleId, BadgeId } from '@shared/types/ids';

// Types for API responses
export interface LevelInfo {
	level: number;
	name: string;
	minXp: number;
	nextLevelXp?: number | undefined;
	iconUrl?: string;
	rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
	frameUrl?: string;
	colorTheme?: string;
	animationEffect?: string;
	unlocks?: Record<string, any> | undefined;
	rewards?:
		| {
				dgt?: number | undefined;
				titleId?: TitleId | undefined;
				badgeId?: BadgeId | undefined;
		  }
		| undefined;
}

export interface UserProgression {
	userId: UserId;
	username: string;
	currentLevel: number;
	currentXp: number;
	totalXp: number;
	xpForNextLevel: number;
	progressPercentage: number;
	levelInfo: LevelInfo;
	nextLevelInfo?: Partial<LevelInfo> | undefined;
	recentLevelUps: number;
	weeklyXpGain: number;
	rank: number;
	achievements: {
		total: number;
		recent: Achievement[];
	};
	missions: {
		completed: number;
		available: number;
		streak: number;
	};
}

export interface Achievement {
	id: AchievementId;
	name: string;
	description: string;
	iconUrl?: string;
	rewardXp: number;
	rewardPoints?: number | undefined;
	requirement: {
		type: 'count' | 'threshold' | 'streak' | 'composite';
		action: string;
		target: number;
		timeframe?: 'daily' | 'weekly' | 'monthly' | 'lifetime' | undefined;
		conditions?: Record<string, any> | undefined;
	};
	isActive: boolean;
	rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
	category: string;
}

export interface UserAchievement {
	userId: UserId;
	achievementId: AchievementId;
	currentProgress: number;
	isCompleted: boolean;
	earnedAt?: string;
	progressPercentage: number;
	achievement: Achievement;
}

export interface Mission {
	id: MissionId;
	title: string;
	description: string;
	type: string;
	requiredAction: string;
	requiredCount: number;
	xpReward: number;
	dgtReward?: number | undefined;
	badgeReward?: string;
	icon?: string;
	isDaily: boolean;
	isWeekly: boolean;
	isActive: boolean;
	minLevel: number;
	sortOrder: number;
	expiresAt?: string;
}

export interface MissionProgress {
	id: string;
	userId: UserId;
	missionId: MissionId;
	currentCount: number;
	isCompleted: boolean;
	isRewardClaimed: boolean;
	completedAt?: string;
	mission: Mission;
}

export interface LeaderboardEntry {
	userId: UserId;
	username: string;
	level: number;
	totalXp: number;
	weeklyXp?: number;
	rank: number;
	trend?: 'up' | 'down' | 'stable';
}

export interface GamificationStats {
	totalAchievements: number;
	completedAchievements: number;
	completionRate: number;
	totalRewardXp: number;
	totalRewardPoints: number;
	recentEarned: UserAchievement[];
	categories: Record<
		string,
		{
			total: number;
			completed: number;
			rate: number;
		}
	>;
}

export interface GamificationDashboard {
	overview: {
		totalUsers: number;
		activeToday: number;
		levelUpsToday: number;
		achievementsEarned: number;
		missionsCompleted: number;
		totalXpAwarded: number;
	};
	progression: any;
	achievements: any;
	missions: any;
	engagement: any;
	topPerformers: LeaderboardEntry[];
}

// API client class
export class GamificationApiService {
	private baseUrl = '/api/gamification';

	// Leveling & Progression
	async getAllLevels() {
		return apiRequest<{ success: boolean; data: LevelInfo[] }>({
			url: `${this.baseUrl}/levels`,
			method: 'GET'
		});
	}

	async getLevel(level: number) {
		return apiRequest<{ success: boolean; data: LevelInfo }>({
			url: `${this.baseUrl}/levels/${level}`,
			method: 'GET'
		});
	}

	async getUserProgression(userId?: UserId) {
		const endpoint = userId
			? `${this.baseUrl}/progression/${userId}`
			: `${this.baseUrl}/progression/me`;
		return apiRequest<{ success: boolean; data: UserProgression }>({
			url: endpoint,
			method: 'GET'
		});
	}

	async getLeaderboard(type: 'level' | 'xp' | 'weekly' | 'monthly' = 'xp', limit = 50, offset = 0) {
		return apiRequest<{ success: boolean; data: LeaderboardEntry[] }>({
			url: `${this.baseUrl}/leaderboard`,
			method: 'GET',
			params: { type: type.toString(), limit: limit.toString(), offset: offset.toString() }
		});
	}

	// Achievements
	async getAllAchievements(activeOnly = true) {
		return apiRequest<{
			success: boolean;
			data: {
				achievements: Achievement[];
				grouped: Record<string, Achievement[]>;
				stats: any;
			};
		}>({
			url: `${this.baseUrl}/achievements`,
			method: 'GET',
			params: { active: activeOnly.toString() }
		});
	}

	async getUserAchievementStats(userId?: UserId) {
		const endpoint = userId
			? `${this.baseUrl}/achievements/user/${userId}`
			: `${this.baseUrl}/achievements/my-stats`;
		return apiRequest<{ success: boolean; data: GamificationStats }>({
			url: endpoint,
			method: 'GET'
		});
	}

	async getUserAchievementProgress(userId?: UserId, achievementIds?: AchievementId[]) {
		const endpoint = userId
			? `${this.baseUrl}/achievements/progress/${userId}`
			: `${this.baseUrl}/achievements/my-progress`;
		return apiRequest<{
			success: boolean;
			data: {
				all: UserAchievement[];
				completed: UserAchievement[];
				inProgress: UserAchievement[];
				notStarted: UserAchievement[];
				stats: any;
			};
		}>({
			url: endpoint,
			method: 'GET',
			params: achievementIds ? { achievementIds: achievementIds.join(',') } : undefined
		});
	}

	async checkAndAwardAchievements(userId: UserId, actionType: string, metadata?: any) {
		return apiRequest<{
			success: boolean;
			data: {
				awarded: Achievement[];
				count: number;
			};
			message: string;
		}>({
			url: `${this.baseUrl}/achievements/check`,
			method: 'POST',
			data: { userId, actionType, metadata }
		});
	}

	// Missions
	async getAllMissions(userLevel?: number, activeOnly = true) {
		return apiRequest<{
			success: boolean;
			data: {
				missions: Mission[];
				grouped: {
					daily: Mission[];
					weekly: Mission[];
					other: Mission[];
				};
				stats: any;
			};
		}>({
			url: `${this.baseUrl}/missions`,
			method: 'GET',
			params: {
				...(userLevel !== undefined && { userLevel: userLevel.toString() }),
				activeOnly: activeOnly.toString()
			}
		});
	}

	async getUserMissionProgress(userId?: UserId) {
		const endpoint = userId
			? `${this.baseUrl}/missions/user/${userId}`
			: `${this.baseUrl}/missions/my-progress`;
		return apiRequest<{
			success: boolean;
			data: {
				all: MissionProgress[];
				completed: MissionProgress[];
				readyToClaim: MissionProgress[];
				inProgress: MissionProgress[];
				notStarted: Mission[];
				claimed: MissionProgress[];
				stats: any;
			};
		}>({
			url: endpoint,
			method: 'GET'
		});
	}

	async claimMissionReward(missionId: MissionId) {
		return apiRequest<{
			success: boolean;
			data: {
				xp?: number;
				dgt?: number;
				badge?: string;
			};
			message: string;
		}>({
			url: `${this.baseUrl}/missions/claim`,
			method: 'POST',
			data: { missionId }
		});
	}

	async updateMissionProgress(userId: UserId, actionType: string, metadata?: any) {
		return apiRequest<{ success: boolean; message: string }>({
			url: `${this.baseUrl}/missions/update-progress`,
			method: 'POST',
			data: { userId, actionType, metadata }
		});
	}

	// Analytics
	async getPublicOverview() {
		return apiRequest<{ success: boolean; data: any }>({
			url: `${this.baseUrl}/analytics/overview`,
			method: 'GET'
		});
	}

	async getDashboard(timeframe: 'day' | 'week' | 'month' = 'week') {
		return apiRequest<{ success: boolean; data: GamificationDashboard }>({
			url: `${this.baseUrl}/analytics/dashboard`,
			method: 'GET',
			params: { timeframe }
		});
	}

	async getSystemHealth() {
		return apiRequest<{ success: boolean; data: any; status: string }>({
			url: `${this.baseUrl}/analytics/health`,
			method: 'GET'
		});
	}

	// Health Check
	async checkHealth() {
		return apiRequest<{
			success: boolean;
			service: string;
			features: Record<string, string>;
			timestamp: string;
		}>({
			url: `${this.baseUrl}/health`,
			method: 'GET'
		});
	}
}

// Export singleton instance
export const gamificationApi = new GamificationApiService();
