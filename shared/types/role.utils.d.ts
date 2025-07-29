/**
 * Role-based permission utilities
 */
import type { Role } from './role.types.js';
import { hasRoleAtLeast } from './role.types.js';
/**
 * Permission checks for specific capabilities
 */
export declare const canModerateShoutbox: (role: Role) => boolean;
export declare const canAccessAdminPanel: (role: Role) => boolean;
export declare const canModerateContent: (role: Role) => boolean;
export declare const canModerateMarket: (role: Role) => boolean;
/**
 * Legacy compatibility functions
 */
export declare const isAdmin: (role: Role) => boolean;
export declare const isSuperAdmin: (role: Role) => boolean;
export declare const isModerator: (role: Role) => boolean;
export declare const isAdminOrModerator: (role: Role) => boolean;
/**
 * Get all role-based permissions for a user
 */
export declare const getUserPermissions: (role: Role) => {
    isAdmin: boolean;
    isSuperAdmin: boolean;
    isModerator: boolean;
    canAccessAdminPanel: boolean;
    isAdminOrModerator: boolean;
    canModerateShoutbox: boolean;
    canModerateContent: boolean;
    canModerateMarket: boolean;
};
/**
 * Legacy export for backward compatibility
 */
export declare const hasRoleOrHigher: typeof hasRoleAtLeast;
