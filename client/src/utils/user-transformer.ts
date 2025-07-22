/**
 * User Transformer Utilities
 * 
 * Transforms basic User objects into CanonicalUser format with all required fields
 * This provides a migration path from basic auth to full user profiles
 */

import type { User } from '@/hooks/use-auth';
import type { CanonicalUser } from '@/types/canonical.types';
import type { BasicRole } from '@shared/types/index';

/**
 * Transform a basic User into a CanonicalUser with sensible defaults
 * This allows gradual migration while the API is enhanced
 */
export function toCanonicalUser(user: User): CanonicalUser {
  return {
    id: user.id,
    username: user.username,
    displayName: user.username, // Default to username
    avatarUrl: user.avatarUrl,
    activeAvatarUrl: user.avatarUrl, // Default to regular avatar
    role: user.role as BasicRole,
    
    // Forum stats - these should come from API eventually
    forumStats: {
      level: user.level || 1,
      xp: user.xp || 0,
      reputation: user.reputation || 0,
      totalPosts: 0, // TODO: Fetch from API
      totalThreads: 0, // TODO: Fetch from API
      totalLikes: 0, // TODO: Fetch from API
      totalTips: 0, // TODO: Fetch from API
    },
    
    // Status indicators
    isOnline: true, // User is online if they're authenticated
    lastSeenAt: user.lastActiveAt || new Date().toISOString(),
    joinedAt: user.createdAt,
    
    // Role helpers
    isAdmin: user.isAdmin,
    isModerator: user.isModerator,
    isVerified: user.isVerified,
    isBanned: user.isBanned,
    
    // Add signature if available
    signature: user.signature,
  };
}

/**
 * Type guard to check if a user object is already canonical
 */
export function isCanonicalUser(user: User | CanonicalUser): user is CanonicalUser {
  return 'forumStats' in user && 'isOnline' in user && 'joinedAt' in user;
}

/**
 * Ensure we have a CanonicalUser, transforming if necessary
 */
export function ensureCanonicalUser(user: User | CanonicalUser | null): CanonicalUser | null {
  if (!user) return null;
  
  if (isCanonicalUser(user)) {
    return user;
  }
  
  return toCanonicalUser(user);
}