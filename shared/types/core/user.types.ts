import type { UserId, WalletId } from '@shared/types';
import type { UserRole } from '@db/schema/core/enums';

// UserLevel is a numeric value, not an enum
export type UserLevel = number;

/**
 * Core User Domain Types
 * 
 * These types represent the user entity and its related data structures
 * across the application. They ensure type safety and consistency.
 */

export interface User {
  id: UserId;
  username: string;
  email: string;
  emailVerified: boolean;
  role: UserRole;
  level: number;
  xp: number;
  dgt: number;
  clout: number;
  createdAt: Date;
  updatedAt: Date;
  bannedUntil: Date | null;
  profilePictureUrl: string | null;
  bio: string | null;
  lastActiveAt: Date;
  settings: UserSettings;
  stats: UserStats;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  display: DisplaySettings;
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    digest: 'none' | 'daily' | 'weekly';
    mentions: boolean;
    replies: boolean;
    tips: boolean;
  };
  push: {
    enabled: boolean;
    mentions: boolean;
    replies: boolean;
    tips: boolean;
  };
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showLevel: boolean;
  showStats: boolean;
  allowMessages: boolean;
  allowFriendRequests: boolean;
}

export interface DisplaySettings {
  language: string;
  timezone: string;
  dateFormat: 'relative' | 'absolute';
  showSignatures: boolean;
  postsPerPage: number;
}

export interface UserStats {
  postCount: number;
  threadCount: number;
  tipsSent: number;
  tipsReceived: number;
  reputation: number;
  dailyStreak: number;
  bestStreak: number;
  achievementCount: number;
  lastPostAt: Date | null;
  joinedAt: Date;
}

export interface UserProfile extends Pick<User, 'id' | 'username' | 'level' | 'role' | 'profilePictureUrl' | 'bio'> {
  displayName: string;
  badges: UserBadge[];
  title: UserTitle | null;
  frame: UserFrame | null;
  isOnline: boolean;
  lastSeen: Date;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  unlockedAt: Date;
}

export interface UserTitle {
  id: string;
  text: string;
  color: string;
  effects?: {
    glow?: boolean;
    animate?: boolean;
    gradient?: string[];
  };
}

export interface UserFrame {
  id: string;
  name: string;
  previewUrl: string;
  cssClass: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
}

export interface UserWallet {
  id: WalletId;
  userId: UserId;
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  totalSpent: number;
  totalWithdrawn: number;
  lastWithdrawalAt: Date | null;
  withdrawalAddress: string | null;
  isLocked: boolean;
  lockedUntil: Date | null;
}

export interface UserAchievement {
  achievementId: string;
  userId: UserId;
  unlockedAt: Date;
  progress: number;
  isCompleted: boolean;
  claimedRewards: boolean;
}

export interface UserInventory {
  userId: UserId;
  items: InventoryItem[];
  capacity: number;
  used: number;
}

export interface InventoryItem {
  id: string;
  itemId: string;
  quantity: number;
  acquiredAt: Date;
  source: 'purchase' | 'reward' | 'gift' | 'achievement';
}

// User-related request/response types
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  referralCode?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  bio?: string;
  profilePictureUrl?: string;
  settings?: Partial<UserSettings>;
}

export interface UserSearchParams {
  query?: string;
  role?: UserRole;
  minLevel?: number;
  maxLevel?: number;
  isOnline?: boolean;
  sortBy?: 'username' | 'level' | 'xp' | 'createdAt' | 'lastActiveAt';
  sortOrder?: 'asc' | 'desc';
}

// Type guards
export function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'username' in value &&
    'email' in value &&
    'role' in value &&
    'level' in value &&
    'settings' in value &&
    'stats' in value
  );
}

export function isUserProfile(value: unknown): value is UserProfile {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'username' in value &&
    'displayName' in value &&
    'badges' in value &&
    Array.isArray((value as UserProfile).badges)
  );
}

export function isUserAchievement(value: unknown): value is UserAchievement {
  return (
    typeof value === 'object' &&
    value !== null &&
    'achievementId' in value &&
    'userId' in value &&
    'unlockedAt' in value &&
    typeof (value as UserAchievement).progress === 'number' &&
    typeof (value as UserAchievement).isCompleted === 'boolean'
  );
}

export function isInventoryItem(value: unknown): value is InventoryItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'itemId' in value &&
    'quantity' in value &&
    'acquiredAt' in value &&
    'source' in value &&
    typeof (value as InventoryItem).quantity === 'number'
  );
}

export function isUserInventory(value: unknown): value is UserInventory {
  return (
    typeof value === 'object' &&
    value !== null &&
    'userId' in value &&
    'items' in value &&
    'capacity' in value &&
    'used' in value &&
    Array.isArray((value as UserInventory).items) &&
    typeof (value as UserInventory).capacity === 'number'
  );
}

// Utility types
export type UserWithWallet = User & { wallet: UserWallet };
export type UserWithStats = User & { stats: UserStats };
export type PublicUser = Omit<User, 'email' | 'emailVerified' | 'settings'>;
export type UserSummary = Pick<User, 'id' | 'username' | 'level' | 'profilePictureUrl'>;