/**
 * Unified Role Types
 *
 * This is the single source of truth for all role definitions across the platform.
 * All workspaces (client, server, db) must import from this file.
 */
/**
 * Core platform roles with hierarchical permissions
 */
export type Role = 'user' | 'super_admin' | 'admin' | 'moderator' | 'dev' | 'shoutbox_mod' | 'content_mod' | 'market_mod';
/**
 * Simplified role union for components that only need basic roles
 */
export type BasicRole = 'user' | 'moderator' | 'admin';
/**
 * Role hierarchy values (higher number = more permissions)
 */
export declare const roleHierarchy: Record<Role, number>;
/**
 * Maps legacy role names to current role names
 * Used for migration and backward compatibility
 */
export declare const roleAliases: Record<string, Role>;
/**
 * Get the canonical role name, handling aliases
 */
export declare function getCanonicalRole(role: string): Role;
/**
 * Check if user has at least the required role level
 */
export declare function hasRoleAtLeast(userRole: Role, requiredRole: Role): boolean;
/**
 * Check if user has exact role
 */
export declare function isRole(userRole: Role, targetRole: Role): boolean;
/**
 * Type guard to check if a string is a valid Role
 */
export declare function isValidRole(role: string): role is Role;
/**
 * Export all role-related utilities
 */
export * from './role.utils.js';
