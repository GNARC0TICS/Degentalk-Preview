/**
 * Unified Role Types
 *
 * This is the single source of truth for all role definitions across the platform.
 * All workspaces (client, server, db) must import from this file.
 */
/**
 * Role hierarchy values (higher number = more permissions)
 */
export const roleHierarchy = {
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
export const roleAliases = {
    'mod': 'moderator',
    'superadmin': 'super_admin',
    'super-admin': 'super_admin'
};
/**
 * Get the canonical role name, handling aliases
 */
export function getCanonicalRole(role) {
    return roleAliases[role] || role;
}
/**
 * Check if user has at least the required role level
 */
export function hasRoleAtLeast(userRole, requiredRole) {
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
/**
 * Check if user has exact role
 */
export function isRole(userRole, targetRole) {
    return userRole === targetRole;
}
/**
 * Type guard to check if a string is a valid Role
 */
export function isValidRole(role) {
    return role in roleHierarchy;
}
/**
 * Export all role-related utilities
 */
export * from './role.utils.js';
