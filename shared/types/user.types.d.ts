import type { UserId, WalletId, BadgeId, FrameId, TitleId } from './ids.js';
/**
 * THE User Type
 * One type. Everywhere. No exceptions.
 */
export interface User {
    id: UserId;
    username: string;
    email: string;
    role: 'user' | 'moderator' | 'admin' | 'owner';
    displayName?: string;
    avatarUrl?: string;
    activeAvatarUrl?: string;
    bannerUrl?: string;
    bio?: string;
    signature?: string;
    xp: number;
    level: number;
    reputation: number;
    walletId?: WalletId;
    dgtBalance: number;
    totalTipped: number;
    totalReceived: number;
    emailVerified: boolean;
    phoneVerified?: boolean;
    isActive: boolean;
    isBanned: boolean;
    isVerified: boolean;
    createdAt: Date | string;
    lastSeen: Date | string;
    joinedAt: Date | string;
    activeFrameId?: FrameId;
    activeBadgeId?: BadgeId;
    activeTitleId?: TitleId;
    stats?: {
        posts: number;
        threads: number;
        likes: number;
        tips: number;
    };
    forumStats?: {
        level: number;
        xp: number;
        reputation: number;
        totalPosts: number;
        totalThreads: number;
        totalLikes: number;
        totalTips: number;
    };
    social?: {
        website?: string;
        github?: string;
        twitter?: string;
        discord?: string;
    };
    isAdmin?: boolean;
    isModerator?: boolean;
    isOnline?: boolean;
}
export type UserSummary = Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl' | 'level'>;
export type PublicUser = Omit<User, 'email' | 'emailVerified' | 'phoneVerified'>;
