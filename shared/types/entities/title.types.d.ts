/**
 * Canonical Title type definition
 * Single source of truth for Title entity across the platform
 */
import type { TitleId, UserId } from '../ids.js';
/**
 * Title unlock requirements
 */
export interface UnlockRequirements {
    level?: number;
    roleIds?: number[];
    achievementIds?: string[];
    customCondition?: string;
    questIds?: string[];
}
/**
 * Base Title interface matching database schema
 */
export interface Title {
    id: TitleId;
    name: string;
    description?: string | null;
    iconUrl?: string | null;
    emoji?: string | null;
    fontFamily?: string | null;
    fontSize?: number | null;
    fontWeight?: string | null;
    textColor?: string | null;
    backgroundColor?: string | null;
    borderColor?: string | null;
    borderWidth?: number | null;
    borderStyle?: string | null;
    borderRadius?: number | null;
    glowColor?: string | null;
    glowIntensity?: number | null;
    shadowColor?: string | null;
    shadowBlur?: number | null;
    shadowOffsetX?: number | null;
    shadowOffsetY?: number | null;
    gradientStart?: string | null;
    gradientEnd?: string | null;
    gradientDirection?: string | null;
    animation?: string | null;
    animationDuration?: number | null;
    effects?: string[];
    category: 'level' | 'role' | 'achievement' | 'shop' | 'event' | 'special';
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
    unlockType: 'level' | 'role' | 'achievement' | 'purchase' | 'manual';
    unlockRequirements?: UnlockRequirements;
    roleId?: string | null;
    minLevel?: number | null;
    isShopItem?: boolean;
    isUnlockable?: boolean;
    unlockConditions?: Record<string, any> | null;
    shopPrice?: number | null;
    shopCurrency?: 'DGT' | 'XP' | 'USD' | null;
    isActive?: boolean;
    startDate?: string | null;
    endDate?: string | null;
    maxSupply?: number | null;
    currentSupply?: number;
    sortOrder?: number;
    createdAt: string;
    updatedAt?: string;
}
/**
 * Title creation/update DTO
 */
export interface TitleFormData {
    name: string;
    description?: string;
    iconUrl?: string;
    rarity?: string;
    emoji?: string;
    textColor?: string;
    backgroundColor?: string;
    borderColor?: string;
    roleId?: string;
    isShopItem?: boolean;
    shopPrice?: number;
    shopCurrency?: string;
}
/**
 * Title with usage stats
 */
export interface TitleWithStats extends Title {
    userCount: number;
    isActive: boolean;
}
/**
 * User's owned title relationship
 */
export interface UserTitle {
    userId: UserId;
    titleId: TitleId;
    title?: Title;
    awardedAt: string;
    awardedBy?: UserId;
    awardReason?: string;
    expiresAt?: string | null;
    isEquipped?: boolean;
}
/**
 * Title grant history/audit log entry
 */
export interface TitleHistoryEntry {
    id: string;
    userId: UserId;
    titleId: TitleId;
    action: 'granted' | 'revoked' | 'expired';
    actionBy?: UserId;
    reason?: string;
    metadata?: Record<string, any>;
    createdAt: string;
}
/**
 * Admin-specific Title type with additional properties
 */
export interface AdminTitle extends Title {
    internalNotes?: string;
    createdBy?: UserId;
    usageStats?: {
        totalUsers: number;
        activeUsers: number;
        purchaseCount: number;
        revenue: number;
    };
}
