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
  activeAvatarUrl?: string; // Current avatar with frame applied
  bannerUrl?: string;
  bio?: string;
  signature?: string;
  
  // Gamification
  xp: number;
  level: number;
  reputation: number;
  
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
  updatedAt?: Date | string;
  lastSeen: Date | string;
  joinedAt: Date | string;
  lastLoginAt?: Date | string;
  
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
  
  // Forum-specific stats (for compatibility)
  forumStats?: {
    level: number;
    xp: number;
    reputation: number;
    totalPosts: number;
    totalThreads: number;
    totalLikes: number;
    totalTips: number;
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
  
  // Legacy/compatibility properties
  profileImage?: string; // Alias for avatarUrl
  avatar?: string; // Alias for avatarUrl
  
  // Additional properties
  permissions?: string[];
  pluginData?: Record<string, any>;
  settings?: UserSettings;
  preferences?: UserPreferences;
}

// User settings type
export interface UserSettings {
  // Add specific settings as needed
  notifications?: boolean;
  darkMode?: boolean;
  language?: string;
}

// User preferences type  
export interface UserPreferences {
  // Add specific preferences as needed
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}

// Simple DTOs for specific contexts
export type UserSummary = Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl' | 'level'>;
export type PublicUser = Omit<User, 'email' | 'emailVerified' | 'phoneVerified'>;

// That's it. No more types.
