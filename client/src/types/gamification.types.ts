/**
 * Gamification System Type Definitions
 * Types for XP, achievements, missions, and gamified content
 */

import type { UserId } from '@shared/types/ids';
import type { StandardApiResponse } from './core.types.ts';

// Achievement System
export interface Achievement {
	id: string;
	name: string;
	description: string;
	category: 'forum' | 'social' | 'economy' | 'milestone' | 'special';
	rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
	icon?: string;
	color?: string;
	isActive: boolean;
	requirements: AchievementRequirement[];
	rewards: AchievementReward[];
	createdAt: string;
	updatedAt: string;
}

export interface AchievementRequirement {
	type: 'count' | 'threshold' | 'streak' | 'composite' | 'custom';
	action: string;
	target: number;
	timeframe?: 'daily' | 'weekly' | 'monthly' | 'lifetime' | 'session' | undefined;
	conditions?: Record<string, unknown> | undefined;
	operator?: 'gte' | 'lte' | 'eq' | 'between' | undefined;
}

export interface AchievementReward {
	type: 'xp' | 'dgt' | 'title' | 'badge' | 'frame' | 'permission';
	value: number | string;
	quantity?: number | undefined;
	metadata?: Record<string, unknown> | undefined;
}

export interface UserAchievement {
	id: string;
	userId: string;
	achievementId: string;
	achievedAt: string;
	progress?: AchievementProgress | undefined;
	achievement?: Achievement | undefined;
}

export interface AchievementProgress {
	current: number;
	target: number;
	percentage: number;
	completedRequirements: string[];
	lastUpdated: string;
}

// XP and Leveling System
export interface XPAction {
	id: string;
	action: string;
	baseXP: number;
	multiplier: number;
	cooldown?: number | undefined;
	category: 'forum' | 'social' | 'economy' | 'special';
	isActive: boolean;
	conditions?: XPCondition[] | undefined;
}

export interface XPCondition {
	type: 'user_level' | 'forum_access' | 'time_based' | 'custom';
	operator: 'gte' | 'lte' | 'eq' | 'in';
	value: number | string | string[];
	message?: string;
}

export interface XPLog {
	id: string;
	userId: string;
	action: string;
	xpAwarded: number;
	multiplier: number;
	source: string;
	metadata?: Record<string, unknown> | undefined;
	createdAt: string;
}

export interface UserLevel {
	id: UserId;
	level: number;
	name: string;
	xpRequired: number;
	xpToNext?: number;
	color?: string;
	icon?: string;
	unlocks?: LevelUnlocks;
	privileges?: string[];
}

export interface LevelUnlocks {
	titles?: string[];
	badges?: string[];
	frames?: string[];
	permissions?: string[];
	features?: string[];
	limits?: Record<string, number>;
}

// Mission System
export interface Mission {
	id: string;
	name: string;
	description: string;
	type: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'special';
	category: 'forum' | 'social' | 'economy' | 'exploration';
	objectives: MissionObjective[];
	rewards: MissionReward[];
	startDate?: string;
	endDate?: string;
	isActive: boolean;
	repeatable: boolean;
	prerequisites?: string[];
}

export interface MissionObjective {
	id: string;
	description: string;
	type: 'count' | 'visit' | 'interact' | 'achieve' | 'custom';
	target: number;
	action: string;
	metadata?: Record<string, unknown> | undefined;
}

export interface MissionProgress {
	id: string;
	userId: string;
	missionId: string;
	status: 'active' | 'completed' | 'failed' | 'expired';
	objectives: ObjectiveProgress[];
	startedAt: string;
	completedAt?: string;
	rewards?: MissionReward[];
}

export interface ObjectiveProgress {
	objectiveId: string;
	current: number;
	target: number;
	completed: boolean;
	completedAt?: string;
}

export interface MissionReward {
	type: 'xp' | 'dgt' | 'item' | 'title' | 'badge';
	value: number | string;
	quantity?: number | undefined;
	metadata?: Record<string, unknown> | undefined;
}

// Leaderboards
export interface LeaderboardEntry {
	rank: number;
	userId: string;
	username: string;
	value: number;
	change?: number; // Position change from previous period
	user?: {
		avatarUrl?: string;
		level?: number;
		title?: string;
	};
}

export interface Leaderboard {
	id: string;
	name: string;
	type: 'xp' | 'posts' | 'likes' | 'tips' | 'custom';
	period: 'daily' | 'weekly' | 'monthly' | 'all_time';
	entries: LeaderboardEntry[];
	lastUpdated: string;
	totalEntries: number;
}

// Gamification Dashboard
export interface GamificationOverview {
	totalUsers: number;
	activeToday: number;
	levelUpsToday: number;
	achievementsEarned: number;
	missionsCompleted: number;
	totalXpAwarded: number;
	topActions: {
		action: string;
		count: number;
		xpAwarded: number;
	}[];
	recentAchievements: UserAchievement[];
	leaderboards: Leaderboard[];
}

export interface UserGamificationStats {
	level: UserLevel;
	totalXP: number;
	xpToNext: number;
	achievements: UserAchievement[];
	activeMissions: MissionProgress[];
	recentXPLogs: XPLog[];
	rank?: {
		xp: number;
		posts: number;
		likes: number;
	};
}

// API Response Types
export type AchievementListResponse = StandardApiResponse<Achievement[]>;
export type UserAchievementResponse = StandardApiResponse<UserAchievement[]>;
export type MissionListResponse = StandardApiResponse<Mission[]>;
export type MissionProgressResponse = StandardApiResponse<MissionProgress[]>;
export type LeaderboardResponse = StandardApiResponse<Leaderboard>;
export type GamificationOverviewResponse = StandardApiResponse<GamificationOverview>;
export type UserStatsResponse = StandardApiResponse<UserGamificationStats>;

// Form and Request Types
export interface CreateAchievementRequest {
	name: string;
	description: string;
	category: Achievement['category'];
	rarity: Achievement['rarity'];
	requirements: Omit<AchievementRequirement, 'id'>[];
	rewards: Omit<AchievementReward, 'id'>[];
	icon?: string;
	color?: string;
}

export interface UpdateAchievementRequest extends Partial<CreateAchievementRequest> {
	id: string;
	isActive?: boolean;
}

export interface CreateMissionRequest {
	name: string;
	description: string;
	type: Mission['type'];
	category: Mission['category'];
	objectives: Omit<MissionObjective, 'id'>[];
	rewards: MissionReward[];
	startDate?: string;
	endDate?: string;
	repeatable?: boolean;
	prerequisites?: string[];
}
