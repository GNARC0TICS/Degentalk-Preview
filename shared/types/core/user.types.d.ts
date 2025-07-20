import type { UserId, WalletId } from '../ids.js';
import type { UserRole } from '@db/schema/core/enums';
export type UserLevel = number;
export interface LevelConfig {
    level: number;
    name: string;
    minXp: number;
    maxXp: number;
    color: string;
}
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
    isVerified?: boolean;
    isBanned?: boolean;
    roles?: string[];
    isAdmin?: boolean;
    isModerator?: boolean;
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
    theme: string;
    fontSize: string;
    threadDisplayMode: string;
    reducedMotion: boolean;
    hideNsfw: boolean;
    showMatureContent: boolean;
    showOfflineUsers: boolean;
}
export interface UserStats {
    postCount: number;
    threadCount: number;
    tipsSent: number;
    tipsReceived: number;
    reputation: number;
    totalXp: number;
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
    levelConfig?: LevelConfig;
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
export declare function isUser(value: unknown): value is User;
export declare function isUserProfile(value: unknown): value is UserProfile;
export declare function isUserAchievement(value: unknown): value is UserAchievement;
export declare function isInventoryItem(value: unknown): value is InventoryItem;
export declare function isUserInventory(value: unknown): value is UserInventory;
export type UserWithWallet = User & {
    wallet: UserWallet;
};
export type UserWithStats = User & {
    stats: UserStats;
};
export type PublicUser = Omit<User, 'email' | 'emailVerified' | 'settings'>;
export type AuthenticatedUserSelf = User;
export type AdminUserDetail = User & {
    adminNotes?: string;
    internalFlags?: string[];
};
export type UserSummary = Pick<User, 'id' | 'username' | 'level' | 'profilePictureUrl'>;
