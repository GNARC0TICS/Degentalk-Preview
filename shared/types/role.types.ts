/**
 * Unified Role Types
 * 
 * This is the single source of truth for all role definitions across the platform.
 * All workspaces (client, server, db) must import from this file.
 */

/**
 * Core platform roles with hierarchical permissions
 */
export type Role =
	| 'user'
	| 'super_admin'
	| 'admin'
	| 'moderator'
	| 'dev'
	| 'shoutbox_mod'
	| 'content_mod'
	| 'market_mod';

/**
 * Simplified role union for components that only need basic roles
 */
export type BasicRole = 'user' | 'moderator' | 'admin';

/**
 * Role hierarchy values (higher number = more permissions)
 */
export const roleHierarchy: Record<Role, number> = {
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
export const roleAliases: Record<string, Role> = {
	'mod': 'moderator',
	'superadmin': 'super_admin',
	'super-admin': 'super_admin'
};

/**
 * Get the canonical role name, handling aliases
 */
export function getCanonicalRole(role: string): Role {
	return roleAliases[role] || (role as Role);
}

/**
 * Check if user has at least the required role level
 */
export function hasRoleAtLeast(userRole: Role, requiredRole: Role): boolean {
	return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Check if user has exact role
 */
export function isRole(userRole: Role, targetRole: Role): boolean {
	return userRole === targetRole;
}

/**
 * Type guard to check if a string is a valid Role
 */
export function isValidRole(role: string): role is Role {
	return role in roleHierarchy;
}

/**
 * Export all role-related utilities
 */
export * from './role.utils.js';