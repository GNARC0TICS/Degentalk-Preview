import type { UserId, WalletId, BadgeId, FrameId, TitleId } from './ids.js';

/**
 * THE User Type
 * One type. Everywhere. No exceptions.
 */
export interface User {
  // Core identity
  id: UserId;
  username: string;
  email: string;
  role: 'user' | 'moderator' | 'admin' | 'owner';
  
  // Profile
  displayName?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
  signature?: string;
  
  // Gamification
  xp: number;
  level: number;
  reputation: number;
  
  // Admin flags
  isAdmin?: boolean;
  
  // Wallet
  walletId?: WalletId;
  dgtBalance: number;
  totalTipped: number;
  totalReceived: number;
  
  // Status
  emailVerified: boolean;
  phoneVerified?: boolean;
  isActive: boolean;
  isBanned: boolean;
  isVerified: boolean; // Blue check
  
  // Timestamps
  createdAt: Date | string;
  lastSeen: Date | string;
  joinedAt: Date | string;
  
  // Cosmetics
  activeFrameId?: FrameId;
  activeBadgeId?: BadgeId;
  activeTitleId?: TitleId;
  
  // Stats (computed by API)
  stats?: {
    posts: number;
    threads: number;
    likes: number;
    tips: number;
  };
  
  // Social
  social?: {
    website?: string;
    github?: string;
    twitter?: string;
    discord?: string;
  };
  
  // Computed flags
  isAdmin?: boolean;
  isModerator?: boolean;
  isOnline?: boolean;
}

// Simple DTOs for specific contexts
export type UserSummary = Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl' | 'level'>;
export type PublicUser = Omit<User, 'email' | 'emailVerified' | 'phoneVerified'>;

// That's it. No more types.
