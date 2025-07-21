/**
 * Canonical Title type definition
 * Single source of truth for Title entity across the platform
 */

import type { TitleId, RoleId } from '../ids.js';

/**
 * Base Title interface matching database schema
 */
export interface Title {
	id: TitleId;
	name: string;
	description?: string | null;
	iconUrl?: string | null;
	rarity?: string | null;
	
	// Enhanced customization
	emoji?: string | null;
	fontFamily?: string | null;
	fontSize?: number | null;
	fontWeight?: string | null;
	textColor?: string | null;
	backgroundColor?: string | null;
	borderColor?: string | null;
	borderWidth?: number | null;
	borderStyle?: string | null;
	borderRadius?: number | null;
	glowColor?: string | null;
	glowIntensity?: number | null;
	shadowColor?: string | null;
	shadowBlur?: number | null;
	shadowOffsetX?: number | null;
	shadowOffsetY?: number | null;
	gradientStart?: string | null;
	gradientEnd?: string | null;
	gradientDirection?: string | null;
	animation?: string | null;
	animationDuration?: number | null;
	
	// Role binding - note: string in DB, not UUID
	roleId?: string | null;
	
	// Shop & unlock metadata
	isShopItem?: boolean;
	isUnlockable?: boolean;
	unlockConditions?: Record<string, any> | null;
	shopPrice?: number | null;
	shopCurrency?: string | null;
	
	// Timestamp
	createdAt: string;
}

/**
 * Title creation/update DTO
 */
export interface TitleFormData {
	name: string;
	description?: string;
	iconUrl?: string;
	rarity?: string;
	emoji?: string;
	textColor?: string;
	backgroundColor?: string;
	borderColor?: string;
	roleId?: string;
	isShopItem?: boolean;
	shopPrice?: number;
	shopCurrency?: string;
}

/**
 * Title with usage stats
 */
export interface TitleWithStats extends Title {
	userCount: number;
	isActive: boolean;
}

/**
 * Admin-specific Title type with additional properties
 */
export interface AdminTitle extends Title {
	// Additional admin-only properties
	internalNotes?: string;
	createdBy?: string;
	updatedAt?: string;
	usageStats?: {
		totalUsers: number;
		activeUsers: number;
		purchaseCount: number;
		revenue: number;
	};
}