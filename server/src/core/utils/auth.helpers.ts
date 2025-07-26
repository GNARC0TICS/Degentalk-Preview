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
export function getUser(req: Request): User | null {
	return (req as any).user || null;
}

/**
 * Assert that user is authenticated (throws if not)
 * Use for endpoints that require authentication
 *
 * @param req Express request object
 * @returns Authenticated user (guaranteed non-null)
 * @throws Error if user is not authenticated
 */
export function requireUser(req: Request): User {
	const user = getUser(req);
	if (!user) {
		throw new Error('User not authenticated');
	}
	return user;
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(user: User | null): boolean {
	return user?.role === 'admin' || user?.role === 'owner';
}

/**
 * Check if user has moderator or higher privileges
 */
export function isModerator(user: User | null): boolean {
	return user?.role === 'moderator' || isAdmin(user);
}

/**
 * Check if user owns the resource (user ID matches)
 */
export function isOwner(user: User | null, resourceUserId: UserId): boolean {
	return user?.id === resourceUserId;
}

/**
 * Check if user can access resource (admin, moderator, or owner)
 */
export function canAccessResource(user: User | null, resourceUserId: UserId): boolean {
	return isModerator(user) || isOwner(user, resourceUserId);
}

/**
 * Get user ID from request
 * Convenience function for routes that only need the user ID
 * 
 * @param req Express request object
 * @returns User ID or undefined if not authenticated
 */
export function getUserIdFromRequest(req: Request): UserId | undefined {
	const user = getUser(req);
	return user?.id;
}
