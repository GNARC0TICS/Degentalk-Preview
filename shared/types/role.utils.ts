/**
 * Role-based permission utilities
 */

import type { Role } from './role.types.js';
import { hasRoleAtLeast, isRole } from './role.types.js';

/**
 * Permission checks for specific capabilities
 */
export const canModerateShoutbox = (role: Role): boolean =>
	['shoutbox_mod', 'moderator', 'admin', 'super_admin'].includes(role);

export const canAccessAdminPanel = (role: Role): boolean => 
	hasRoleAtLeast(role, 'admin');

export const canModerateContent = (role: Role): boolean =>
	['content_mod', 'moderator', 'admin', 'super_admin'].includes(role);

export const canModerateMarket = (role: Role): boolean =>
	['market_mod', 'moderator', 'admin', 'super_admin'].includes(role);

/**
 * Legacy compatibility functions
 */
export const isAdmin = (role: Role): boolean => 
	hasRoleAtLeast(role, 'admin');

export const isSuperAdmin = (role: Role): boolean => 
	isRole(role, 'super_admin');

export const isModerator = (role: Role): boolean => 
	hasRoleAtLeast(role, 'moderator');

export const isAdminOrModerator = (role: Role): boolean => 
	hasRoleAtLeast(role, 'moderator');

/**
 * Get all role-based permissions for a user
 */
export const getUserPermissions = (role: Role) => ({
	isAdmin: isAdmin(role),
	isSuperAdmin: isSuperAdmin(role),
	isModerator: isModerator(role),
	canAccessAdminPanel: canAccessAdminPanel(role),
	isAdminOrModerator: isAdminOrModerator(role),
	canModerateShoutbox: canModerateShoutbox(role),
	canModerateContent: canModerateContent(role),
	canModerateMarket: canModerateMarket(role)
});

/**
 * Legacy export for backward compatibility
 */
export const hasRoleOrHigher = hasRoleAtLeast;