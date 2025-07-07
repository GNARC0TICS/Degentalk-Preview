/**
 * Auth Helper Utilities
 * Centralizes authentication-related helper functions
 */

import type { Request } from 'express';
import type { UserId } from '@shared/types/ids';

export interface AuthenticatedUser {
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
 * Replaces direct req.user access for better type safety
 * 
 * @param req Express request object
 * @returns Authenticated user or null if not authenticated
 */
export function getAuthenticatedUser(req: Request): AuthenticatedUser | null {
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
export function requireAuthenticatedUser(req: Request): AuthenticatedUser {
  const user = getAuthenticatedUser(req);
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user;
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(user: AuthenticatedUser | null): boolean {
  return user?.role === 'admin' || user?.role === 'owner';
}

/**
 * Check if user has moderator or higher privileges  
 */
export function isModerator(user: AuthenticatedUser | null): boolean {
  return user?.role === 'moderator' || isAdmin(user);
}

/**
 * Check if user owns the resource (user ID matches)
 */
export function isOwner(user: AuthenticatedUser | null, resourceUserId: UserId): boolean {
  return user?.id === resourceUserId;
}

/**
 * Check if user can access resource (admin, moderator, or owner)
 */
export function canAccessResource(user: AuthenticatedUser | null, resourceUserId: UserId): boolean {
  return isModerator(user) || isOwner(user, resourceUserId);
}