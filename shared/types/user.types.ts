/**
 * Shared User Type Definitions
 * 
 * This module defines the canonical user types used across both client and server
 * All user-related types should be imported from here to ensure consistency
 */

import type { Id } from './ids.js';
import type { BasicRole } from './index.js';

/**
 * @deprecated Use CanonicalUser for UI/display or AuthenticatedUser for auth/security
 * Migration: Server code should use AuthenticatedUser, client code should use CanonicalUser
 * See /docs/USER_MODEL_CONTRACT.md for migration guide
 */
export interface User {
  id: Id<'UserId'>;
  username: string;
  email: string;
  role: string | BasicRole;
  createdAt: string;
  isActive?: boolean;
  isVerified?: boolean;
  isBanned?: boolean;
}

/**
 * Enterprise-grade Canonical User type
 * The single source of truth for user profiles across the platform
 */
export interface CanonicalUser {
  // Core identity
  id: Id<'UserId'>;
  username: string;
  displayName?: string;
  email?: string;
  
  // Profile data
  avatarUrl?: string;
  activeAvatarUrl?: string; // With frame applied
  bannerUrl?: string;
  bio?: string;
  signature?: string;
  
  // Role & permissions
  role: BasicRole;
  permissions?: string[];
  
  // Forum statistics
  forumStats: {
    level: number;
    xp: number;
    reputation: number;
    clout?: number;
    totalPosts: number;
    totalThreads: number;
    totalLikes: number;
    totalTips: number;
  };
  
  // Economic data
  wallet?: {
    id: Id<'WalletId'>;
    address?: string;
    dgtBalance: number;
    usdBalance?: number;
  };
  
  // Social profiles
  social?: {
    website?: string;
    github?: string;
    twitter?: string;
    discord?: string;
  };
  
  // Status indicators
  isOnline: boolean;
  lastSeenAt?: string;
  joinedAt: string;
  
  // Flags
  isAdmin: boolean;
  isModerator: boolean;
  isVerified: boolean;
  isBanned: boolean;
  isShadowbanned?: boolean;
  
  // Cosmetics
  activeFrameId?: Id<'FrameId'>;
  activeBadgeId?: Id<'BadgeId'>;
  activeTitleId?: Id<'TitleId'>;
  
  // Plugin/integration data
  pluginData?: Record<string, any>;
}

/**
 * Partial user for lists and minimal contexts
 */
export interface UserSummary {
  id: Id<'UserId'>;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  role: BasicRole;
  level: number;
  isVerified: boolean;
}

/**
 * User creation payload
 */
export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  referralCode?: string;
}

/**
 * User update payload
 */
export interface UpdateUserPayload {
  displayName?: string;
  bio?: string;
  signature?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  social?: {
    website?: string;
    github?: string;
    twitter?: string;
    discord?: string;
  };
}