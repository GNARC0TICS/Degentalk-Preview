/**
 * Admin Type Definitions
 * Comprehensive types for admin components and operations
 */

import type { UserId } from '@shared/types/ids';

// Base User Interface
export interface User {
	id: string;
	username: string;
	email: string;
	role: string;
	status: 'active' | 'suspended' | 'banned' | 'pending';
	createdAt: string;
	updatedAt: string;
	permissions?: string[];
	lastLoginAt?: string;
	profileData?: {
		bio?: string;
		avatarUrl?: string;
		activeAvatarUrl?: string;
	};
}

// User Form Data Interface
export interface UserFormData {
	username: string;
	email: string;
	role: string;
	status: 'active' | 'suspended' | 'banned' | 'pending';
	permissions: string[];
	password?: string; // Only for new users
	profileData?: {
		bio?: string;
		avatarUrl?: string;
	};
}

// Role Management
export interface Role {
	id: string;
	name: string;
	description?: string;
	permissions: string[];
	isSystemRole: boolean;
	createdAt: string;
	updatedAt: string;
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
	unlocks?: LevelUnlocks;
}

export interface LevelUnlocks {
	titles?: string[];
	badges?: string[];
	frames?: string[];
	perks?: string[];
	features?: string[];
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
	metadata?: Record<string, unknown>;
}

export interface AchievementReward {
	type: 'xp' | 'dgt' | 'title' | 'badge' | 'frame';
	value: number | string;
	metadata?: Record<string, unknown>;
}

// API Response Wrappers
export interface AdminApiResponse<T> {
	success: boolean;
	data: T;
	message?: string;
	errors?: string[];
	metadata?: {
		pagination?: {
			page: number;
			limit: number;
			total: number;
			totalPages: number;
		};
		timestamp: string;
	};
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
	dependencies?: string[];
	version: string;
}

export interface ModuleSettings {
	[key: string]: string | number | boolean | Record<string, unknown>;
}

// Bulk Operations
export interface BulkOperationRequest {
	operation: 'delete' | 'update' | 'suspend' | 'ban' | 'activate';
	targets: string[];
	data?: Record<string, unknown>;
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
