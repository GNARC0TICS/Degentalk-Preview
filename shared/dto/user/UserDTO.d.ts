import type { UserId } from '../../types/ids.js';
import type { UserRole } from '@db/schema/core/enums';
/**
 * User DTOs for API responses
 * These are the types that cross the API boundary
 */
export interface PublicUserDTO {
    id: UserId;
    username: string;
    displayName?: string;
    avatarUrl?: string | null;
    role: UserRole;
    isOnline: boolean;
    lastSeen?: Date;
    createdAt: Date;
    stats?: {
        postCount: number;
        threadCount: number;
        reputation: number;
    };
}
export interface UserSelfDTO extends PublicUserDTO {
    email: string;
    emailVerified: boolean;
    totalXp: number;
    preferences: {
        theme: 'light' | 'dark' | 'auto';
        language: string;
        timezone: string;
        emailNotifications: boolean;
        pushNotifications: boolean;
        marketingEmails: boolean;
        display: {
            theme: string;
            fontSize: string;
            threadDisplayMode: string;
            reducedMotion: boolean;
            hideNsfw: boolean;
            showMatureContent: boolean;
            showOfflineUsers: boolean;
        };
    };
    notifications: {
        mentions: boolean;
        replies: boolean;
        tips: boolean;
        achievements: boolean;
        moderation: boolean;
    };
    privacy: {
        profileVisibility: 'public' | 'members' | 'friends' | 'private';
        onlineStatus: boolean;
        lastSeen: boolean;
        emailVisible: boolean;
        allowDirectMessages: 'all' | 'friends' | 'none';
    };
}
export interface UserProfileDTO {
    id: UserId;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    role: UserRole;
    level: number;
    bio?: string | null;
    isOnline: boolean;
    lastSeen: Date;
    reputation: number;
    totalXp: number;
    levelConfig?: {
        level: number;
        name: string;
        minXp: number;
        maxXp: number;
        color: string;
    };
    badges: Array<{
        id: string;
        name: string;
        description: string;
        imageUrl: string;
        rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
    }>;
    title?: {
        id: string;
        text: string;
        color: string;
    } | null;
    frame?: {
        id: string;
        name: string;
        imageUrl: string;
        rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
    } | null;
}
export interface AdminUserDetailDTO extends UserSelfDTO {
    ipAddressHash?: string;
    registrationIp?: string;
    lastLoginIp?: string;
    moderationNotes?: string;
    internalNotes?: string;
    riskScore?: number;
    warnings: Array<{
        id: string;
        reason: string;
        issuedBy: UserId;
        issuedAt: Date;
        expiresAt?: Date;
    }>;
    suspensions: Array<{
        id: string;
        reason: string;
        issuedBy: UserId;
        issuedAt: Date;
        expiresAt: Date;
        appealable: boolean;
    }>;
}
