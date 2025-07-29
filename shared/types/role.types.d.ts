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
export type RoleName = 'user' | 'super_admin' | 'admin' | 'moderator' | 'dev' | 'shoutbox_mod' | 'content_mod' | 'market_mod';
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
export declare const roleHierarchy: Record<RoleName, number>;
/**
 * Maps legacy role names to current role names
 * Used for migration and backward compatibility
 */
export declare const roleAliases: Record<string, RoleName>;
/**
 * Get the canonical role name, handling aliases
 */
export declare function getCanonicalRole(role: string): RoleName;
/**
 * Check if user has at least the required role level
 */
export declare function hasRoleAtLeast(userRole: RoleName, requiredRole: RoleName): boolean;
/**
 * Check if user has exact role
 */
export declare function isRole(userRole: RoleName, targetRole: RoleName): boolean;
/**
 * Type guard to check if a string is a valid Role
 */
export declare function isValidRole(role: string): role is RoleName;
/**
 * Base Role entity interface matching database schema
 */
export interface RoleEntity {
    id: RoleId;
    name: string;
    slug: string;
    rank: number;
    description?: string | null;
    badgeImage?: string | null;
    textColor?: string | null;
    backgroundColor?: string | null;
    isStaff: boolean;
    isModerator: boolean;
    isAdmin: boolean;
    permissions: string[] | Record<string, any>;
    xpMultiplier: number;
    createdAt: string;
    updatedAt: string;
    pluginData?: Record<string, any>;
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
