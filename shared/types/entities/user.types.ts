/**
 * Canonical User type definition
 * Single source of truth for User entity across the platform
 */

import type { UserId, RoleId, TitleId, BadgeId, FrameId, PostId } from '../ids.js';

/**
 * User role enum - matches database enum
 */
export type UserRole = 'user' | 'moderator' | 'admin' | 'super-admin' | 'developer';

/**
 * Base User interface matching database schema
 */
export interface User {
	id: UserId;
	username: string;
	email: string;
	bio?: string | null;
	signature?: string | null;
	
	// Avatar & profile
	avatarUrl?: string | null;
	activeAvatarUrl?: string | null;
	profileBannerUrl?: string | null;
	activeFrameId?: FrameId | null;
	avatarFrameId?: FrameId | null;
	
	// Role & permissions
	primaryRoleId?: RoleId | null;
	role: UserRole;
	
	// Social handles
	discordHandle?: string | null;
	twitterHandle?: string | null;
	telegramHandle?: string | null;
	ethAddress?: string | null;
	solAddress?: string | null;
	btcAddress?: string | null;
	
	// Settings & preferences
	lastActiveAt?: string | null;
	isOnline: boolean;
	locationDisplay?: string | null;
	isEmailVerified: boolean;
	isKycVerified: boolean;
	canReceiveTips: boolean;
	showActivity: boolean;
	receiveNewsletter: boolean;
	allowPms: boolean;
	notifyOnQuote: boolean;
	notifyOnReply: boolean;
	notifyOnMention: boolean;
	
	// Forum stats
	postCount: number;
	threadCount: number;
	lastPostId?: PostId | null;
	
	// Economy stats
	xp: number;
	level: number;
	prestige: number;
	
	// Titles & badges
	primaryTitleId?: TitleId | null;
	primaryBadgeId?: BadgeId | null;
	
	// Status
	isBanned: boolean;
	isSuspended: boolean;
	isMuted: boolean;
	isDeleted: boolean;
	
	// Timestamps
	createdAt: string;
	updatedAt: string;
	
	// Extensibility
	pluginData?: Record<string, any>;
}

/**
 * Public user profile - safe to expose to other users
 */
export interface PublicUser {
	id: UserId;
	username: string;
	bio?: string | null;
	signature?: string | null;
	avatarUrl?: string | null;
	activeAvatarUrl?: string | null;
	profileBannerUrl?: string | null;
	role: UserRole;
	primaryRoleId?: RoleId | null;
	isOnline: boolean;
	locationDisplay?: string | null;
	postCount: number;
	threadCount: number;
	xp: number;
	level: number;
	prestige: number;
	primaryTitleId?: TitleId | null;
	primaryBadgeId?: BadgeId | null;
	createdAt: string;
	lastActiveAt?: string | null;
}

/**
 * Authenticated user - includes private data for the logged-in user
 */
export interface AuthenticatedUser extends User {
	emailHash?: string; // For gravatar
	unreadNotifications: number;
	unreadMessages: number;
	walletBalance?: {
		dgt: number;
		usd: number;
	};
}