/**
 * Unified Role Types
 * 
 * This is the single source of truth for all role definitions across the platform.
 * All workspaces (client, server, db) must import from this file.
 */

import type { RoleId, UserId } from './ids.js';

/**
 * Core platform roles with hierarchical permissions
 * This is the string union type for role names
 */
export type RoleName =
	| 'user'
	| 'super_admin'
	| 'admin'
	| 'moderator'
	| 'dev'
	| 'shoutbox_mod'
	| 'content_mod'
	| 'market_mod';

/**
 * Legacy alias - will be removed in future
 * @deprecated Use RoleName instead
 */
export type Role = RoleName;

/**
 * Simplified role union for components that only need basic roles
 */
export type BasicRole = 'user' | 'moderator' | 'admin' | 'owner';

/**
 * Role hierarchy values (higher number = more permissions)
 */
export const roleHierarchy: Record<RoleName, number> = {
	super_admin: 100,
	admin: 80,
	moderator: 60,
	dev: 50,
	content_mod: 40,
	market_mod: 40,
	shoutbox_mod: 30,
	user: 0
};

/**
 * Maps legacy role names to current role names
 * Used for migration and backward compatibility
 */
export const roleAliases: Record<string, RoleName> = {
	'mod': 'moderator',
	'superadmin': 'super_admin',
	'super-admin': 'super_admin'
};

/**
 * Get the canonical role name, handling aliases
 */
export function getCanonicalRole(role: string): RoleName {
	return roleAliases[role] || (role as RoleName);
}

/**
 * Check if user has at least the required role level
 */
export function hasRoleAtLeast(userRole: RoleName, requiredRole: RoleName): boolean {
	return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Check if user has exact role
 */
export function isRole(userRole: RoleName, targetRole: RoleName): boolean {
	return userRole === targetRole;
}

/**
 * Type guard to check if a string is a valid Role
 */
export function isValidRole(role: string): role is RoleName {
	return role in roleHierarchy;
}

/**
 * Base Role entity interface matching database schema
 */
export interface RoleEntity {
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
export interface RoleWithUsers extends RoleEntity {
	userCount: number;
	users?: Array<{
		id: UserId;
		username: string;
		avatarUrl?: string;
	}>;
}

/**
 * Export all role-related utilities
 */
export * from './role.utils.js';