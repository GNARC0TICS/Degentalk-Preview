/**
 * Auth Helper Utilities
 * Centralizes authentication-related helper functions
 */
import type { Request } from 'express';
import type { UserId } from '@shared/types/ids';
export interface User {
    id: UserId;
    username: string;
    email: string;
    role: 'user' | 'moderator' | 'admin' | 'owner';
    emailVerified: boolean;
    createdAt: Date;
    lastSeen?: Date;
}
/**
 * Safely extract authenticated user from request
 * Replaces direct request user access for better type safety
 *
 * @param req Express request object
 * @returns Authenticated user or null if not authenticated
 */
export declare function getUser(req: Request): User | null;
/**
 * Assert that user is authenticated (throws if not)
 * Use for endpoints that require authentication
 *
 * @param req Express request object
 * @returns Authenticated user (guaranteed non-null)
 * @throws Error if user is not authenticated
 */
export declare function requireUser(req: Request): User;
/**
 * Check if user has admin privileges
 */
export declare function isAdmin(user: User | null): boolean;
/**
 * Check if user has moderator or higher privileges
 */
export declare function isModerator(user: User | null): boolean;
/**
 * Check if user owns the resource (user ID matches)
 */
export declare function isOwner(user: User | null, resourceUserId: UserId): boolean;
/**
 * Check if user can access resource (admin, moderator, or owner)
 */
export declare function canAccessResource(user: User | null, resourceUserId: UserId): boolean;
/**
 * Get user ID from request
 * Convenience function for routes that only need the user ID
 *
 * @param req Express request object
 * @returns User ID or undefined if not authenticated
 */
export declare function getUserIdFromRequest(req: Request): UserId | undefined;
