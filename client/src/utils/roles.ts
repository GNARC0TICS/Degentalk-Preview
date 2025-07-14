/**
 * Centralized role utilities with hierarchical permission checking
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

export const hasRoleAtLeast = (userRole: Role, requiredRole: Role) =>
	roleHierarchy[userRole] >= roleHierarchy[requiredRole];

export const isRole = (userRole: Role, target: Role) => userRole === target;

export const canModerateShoutbox = (role: Role) =>
	['shoutbox_mod', 'moderator', 'admin', 'super_admin'].includes(role);

export const canAccessAdminPanel = (role: Role) => hasRoleAtLeast(role, 'admin');

// Legacy compatibility functions (will be refactored out)
export const isAdmin = (role: Role) => hasRoleAtLeast(role, 'admin');

export const isSuperAdmin = (role: Role) => isRole(role, 'super_admin');

export const isModerator = (role: Role) => hasRoleAtLeast(role, 'moderator');

export const isAdminOrModerator = (role: Role) => hasRoleAtLeast(role, 'moderator');

/**
 * Get all role-based permissions for a user
 */
export const getUserPermissions = (role: Role) => ({
	isAdmin: isAdmin(role),
	isSuperAdmin: isSuperAdmin(role),
	isModerator: isModerator(role),
	canAccessAdminPanel: canAccessAdminPanel(role),
	isAdminOrModerator: isAdminOrModerator(role),
	canModerateShoutbox: canModerateShoutbox(role)
});

// Legacy export for backward compatibility
export const hasRoleOrHigher = hasRoleAtLeast;
