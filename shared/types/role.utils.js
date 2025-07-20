/**
 * Role-based permission utilities
 */
import { hasRoleAtLeast, isRole } from './role.types.js';
/**
 * Permission checks for specific capabilities
 */
export const canModerateShoutbox = (role) => ['shoutbox_mod', 'moderator', 'admin', 'super_admin'].includes(role);
export const canAccessAdminPanel = (role) => hasRoleAtLeast(role, 'admin');
export const canModerateContent = (role) => ['content_mod', 'moderator', 'admin', 'super_admin'].includes(role);
export const canModerateMarket = (role) => ['market_mod', 'moderator', 'admin', 'super_admin'].includes(role);
/**
 * Legacy compatibility functions
 */
export const isAdmin = (role) => hasRoleAtLeast(role, 'admin');
export const isSuperAdmin = (role) => isRole(role, 'super_admin');
export const isModerator = (role) => hasRoleAtLeast(role, 'moderator');
export const isAdminOrModerator = (role) => hasRoleAtLeast(role, 'moderator');
/**
 * Get all role-based permissions for a user
 */
export const getUserPermissions = (role) => ({
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
