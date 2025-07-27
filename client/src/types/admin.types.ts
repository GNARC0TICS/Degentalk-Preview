/**
 * Admin Type Definitions
 * Comprehensive types for admin components and operations
 */

import type { UserId, RoleId } from '@shared/types/ids';

// Re-export canonical types
export type { RoleEntity as Role, RoleFormData, RoleWithUsers } from '@shared/types/entities';
export type { User, PublicUser, AuthenticatedUser, UserRole } from '@shared/types/entities';
export type { Title, TitleFormData, TitleWithStats, AdminTitle } from '@shared/types/entities';

// Admin-specific user interface (extends canonical User)
export interface AdminUser {
	id: UserId;
	username: string;
	email: string;
	role: string;
	status: 'active' | 'suspended' | 'banned' | 'pending';
	createdAt: string;
	updatedAt: string;
	permissions?: string[] | undefined;
	lastLoginAt?: string;
	profileData?:
		| {
				bio?: string;
				avatarUrl?: string;
				activeAvatarUrl?: string;
		  }
		| undefined;
	// Additional fields for admin view
	posts?: number;
	threads?: number;
}

// User Form Data Interface
export interface UserFormData {
	username: string;
	email: string;
	role: string;
	status: 'active' | 'suspended' | 'banned' | 'pending';
	permissions: string[];
	password?: string; // Only for new users
	profileData?:
		| {
				bio?: string;
				avatarUrl?: string;
		  }
		| undefined;
}

// Permission Definition
export interface Permission {
	id: string;
	name: string;
	description: string;
	category: 'user' | 'content' | 'system' | 'financial' | 'moderation';
	isSystemPermission: boolean;
}

// Economy Configuration
export interface EconomyConfig {
	dgtPrice: number;
	xpMultipliers: Record<string, number>;
	rewardRates: {
		postReward: number;
		threadReward: number;
		likeReward: number;
		tipReward: number;
	};
	limits: {
		maxDgtTransfer: number;
		dailyXpCap: number;
		maxWalletBalance: number;
		minWithdrawal: number;
	};
	fees: {
		withdrawalFee: number;
		transferFee: number;
	};
}

// Level System
export interface LevelData {
	id: UserId;
	level: number;
	name: string;
	xpRequired: number;
	color?: string;
	icon?: string;
	unlocks?: LevelUnlocks | undefined;
}

export interface LevelUnlocks {
	titles?: string[] | undefined;
	badges?: string[] | undefined;
	frames?: string[] | undefined;
	perks?: string[] | undefined;
	features?: string[] | undefined;
}

// Achievement System
export interface Achievement {
	id: string;
	name: string;
	description: string;
	category: string;
	rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
	requirements: AchievementRequirement[];
	rewards: AchievementReward[];
	isActive: boolean;
	icon?: string;
	color?: string;
}

export interface AchievementRequirement {
	type: 'posts' | 'likes' | 'threads' | 'tips' | 'login_streak' | 'custom';
	value: number;
	operator: 'gte' | 'lte' | 'eq';
	metadata?: Record<string, unknown> | undefined;
}

export interface AchievementReward {
	type: 'xp' | 'dgt' | 'title' | 'badge' | 'frame';
	value: number | string;
	metadata?: Record<string, unknown> | undefined;
}

// API Response Wrappers
export interface AdminApiResponse<T> {
	success: boolean;
	data: T;
	message?: string;
	errors?: string[] | undefined;
	metadata?:
		| {
				pagination?:
					| {
							page: number;
							limit: number;
							total: number;
							totalPages: number;
					  }
					| undefined;
				timestamp: string;
		  }
		| undefined;
}

// Module System
export interface AdminModule {
	id: string;
	name: string;
	description: string;
	category: 'users' | 'content' | 'economy' | 'system' | 'analytics';
	enabled: boolean;
	permissions: string[];
	settings: ModuleSettings;
	dependencies?: string[] | undefined;
	version: string;
}

export interface ModuleSettings {
	[key: string]: string | number | boolean | Record<string, unknown>;
}

// Bulk Operations
export interface BulkOperationRequest {
	operation: 'delete' | 'update' | 'suspend' | 'ban' | 'activate';
	targets: string[];
	data?: Record<string, unknown> | undefined;
	reason?: string;
}

export interface BulkOperationResult {
	success: number;
	failed: number;
	errors: Array<{
		target: string;
		error: string;
	}>;
}

// Activity Logs
export interface AdminActivityLog {
	id: string;
	adminId: string;
	action: string;
	targetType: 'user' | 'post' | 'thread' | 'config' | 'system';
	targetId?: string;
	details: Record<string, unknown>;
	ipAddress: string;
	userAgent: string;
	createdAt: string;
}

// Settings type for admin services
export type SettingValue = string | number | boolean | Record<string, unknown>;

// Achievement data type for admin services
export interface AchievementData {
	name: string;
	description: string;
	category: string;
	rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
	requirements: AchievementRequirement[];
	rewards: AchievementReward[];
	isActive: boolean;
	icon?: string;
	color?: string;
}
