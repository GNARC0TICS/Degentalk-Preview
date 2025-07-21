/**
 * Canonical Role type definition
 * Single source of truth for Role entity across the platform
 */

import type { RoleId, UserId } from '../ids.js';

/**
 * Base Role interface matching database schema
 */
export interface Role {
	id: RoleId;
	name: string;
	slug: string;
	rank: number;
	description?: string | null;
	
	// Visual properties
	badgeImage?: string | null;
	textColor?: string | null;
	backgroundColor?: string | null;
	
	// Permission flags
	isStaff: boolean;
	isModerator: boolean;
	isAdmin: boolean;
	
	// Permissions - can be array or object depending on usage
	permissions: string[] | Record<string, any>;
	
	// XP modifier
	xpMultiplier: number;
	
	// Timestamps
	createdAt: string;
	updatedAt: string;
	
	// Extensibility
	pluginData?: Record<string, any>;
	
	// Computed/UI properties (not in DB)
	isSystemRole?: boolean;
}

/**
 * Role creation/update DTO
 */
export interface RoleFormData {
	name: string;
	slug: string;
	rank: number;
	description?: string;
	badgeImage?: string;
	textColor?: string;
	backgroundColor?: string;
	isStaff?: boolean;
	isModerator?: boolean;
	isAdmin?: boolean;
	permissions?: string[];
	xpMultiplier?: number;
}

/**
 * Role with user associations
 */
export interface RoleWithUsers extends Role {
	userCount: number;
	users?: Array<{
		id: UserId;
		username: string;
		avatarUrl?: string;
	}>;
}