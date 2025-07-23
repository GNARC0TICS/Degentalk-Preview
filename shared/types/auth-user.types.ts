/**
 * Unified Auth User Type
 * 
 * This is the single source of truth for the authenticated user object
 * Used by the auth system throughout the application
 */

import type { UserId, FrameId, WalletId, BadgeId, TitleId } from './ids';

/**
 * User roles as string literals for type safety
 */
export type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin';

/**
 * The unified User type used by the auth system
 * This combines all the properties needed across the application
 */
export interface AuthUser {
  // Core identity
  id: UserId;
  username: string;
  email: string;
  
  // Profile
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  signature: string | null;
  
  // Role & permissions
  role: UserRole;
  
  // Forum stats
  level: number;
  xp: number;
  reputation: number;
  clout: number;
  
  // Wallet
  walletId?: WalletId | string; // Support both branded and string for compatibility
  walletAddress?: string;
  dgtBalance: number;
  
  // Social links
  website: string | null;
  github: string | null;
  twitter: string | null;
  discord: string | null;
  
  // Cosmetics
  activeFrameId: FrameId | null;
  avatarFrameId: FrameId | null; // Legacy alias for activeFrameId
  activeBadgeId?: BadgeId | null;
  activeTitleId?: TitleId | null;
  
  // Status flags
  isActive: boolean;
  isVerified: boolean;
  isBanned: boolean;
  isVIP: boolean; // VIP status for special features
  isVip?: boolean; // Legacy alias for isVIP
  
  // Computed role flags (derived from role)
  isAdmin: boolean;
  isModerator: boolean;
  isSuperAdmin?: boolean;
  
  // Timestamps
  createdAt: string;
  lastActiveAt: string | null;
  
  // Extension data
  pluginData: Record<string, any> | null;
}

/**
 * Type guard to check if a user has a specific role
 */
export function hasRole(user: AuthUser, role: UserRole): boolean {
  return user.role === role;
}

/**
 * Type guard to check if user is admin or higher
 */
export function isAdminOrHigher(user: AuthUser): boolean {
  return user.role === 'admin' || user.role === 'super_admin';
}

/**
 * Type guard to check if user is moderator or higher
 */
export function isModeratorOrHigher(user: AuthUser): boolean {
  return user.role === 'moderator' || user.role === 'admin' || user.role === 'super_admin';
}