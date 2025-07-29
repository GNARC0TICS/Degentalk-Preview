/**
 * Core XP Service
 *
 * Central service for managing user XP, levels, and related functionality.
 * This service is used by both admin and public-facing features.
 */
import type { UserId } from '@shared/types/ids';
import { XP_ACTION } from './xp-actions';
import type { AdminId, ForumId } from '@shared/types/ids';
export declare class XpService {
    private userRepository;
    /**
     * Update a user's XP and handle level recalculation
     *
     * @param userId - User ID to update
     * @param amount - Amount to add, subtract, or set
     * @param adjustmentType - How to modify XP ('add', 'subtract', or 'set')
     * @param options - Additional options
     * @returns Object with old and new XP values and level information
     */
    updateUserXp(userId: UserId, amount: number, adjustmentType?: 'add' | 'subtract' | 'set', options?: {
        reason?: string;
        adminId?: AdminId;
        logAdjustment?: boolean;
        skipLevelCheck?: boolean;
        skipTriggers?: boolean;
    }): Promise<{
        userId: UserId;
        oldXp: number;
        newXp: number;
        xpChange: number;
        oldLevel: any;
        newLevel: number;
        levelChanged: any;
    }>;
    /**
     * Log an XP adjustment for auditing purposes
     */
    private logXpAdjustment;
    /**
     * Get level information for a specific level
     */
    getLevel(levelNumber: number): Promise<any>;
    /**
     * Get all levels in ascending order
     */
    getAllLevels(): Promise<any>;
    /**
     * Get user XP information
     */
    getUserXpInfo(userId: UserId): Promise<{
        userId: any;
        username: any;
        currentXp: any;
        currentLevel: any;
        currentLevelData: any;
        nextLevel: any;
        nextLevelData: any;
        xpForNextLevel: number;
        progress: number;
    }>;
    /**
     * Award XP to a user for completing an action
     *
     * @param userId User ID to award XP to
     * @param action The action that grants XP
     * @param metadata Optional metadata about the action
     * @returns Result of the XP update operation
     */
    awardXp(userId: UserId, action: XP_ACTION, metadata?: any): Promise<{
        userId: UserId;
        oldXp: number;
        newXp: number;
        xpChange: number;
        oldLevel: any;
        newLevel: number;
        levelChanged: any;
    } | undefined>;
    /**
     * Award XP to a user for completing an action with forum context
     *
     * @param userId User ID to award XP to
     * @param action The action that grants XP
     * @param metadata Optional metadata about the action
     * @param forumId Optional forum ID for forum-specific multipliers
     * @returns Result of the XP update operation
     */
    awardXpWithContext(userId: UserId, action: XP_ACTION, metadata?: any, forumId?: ForumId): Promise<{
        userId: UserId;
        oldXp: number;
        newXp: number;
        xpChange: number;
        oldLevel: any;
        newLevel: number;
        levelChanged: any;
    } | undefined>;
    /**
     * Check if a user can receive XP for a given action based on limits (daily max, cooldown)
     */
    private checkActionLimits;
    /**
     * Update action limits for a user after an XP award
     */
    private updateActionLimits;
    /**
     * Log an XP action for auditing and limit tracking
     */
    private logXpAction;
    /**
     * Get action limits for a user
     *
     * @param userId User ID
     * @param action The action key
     * @returns Object with limit information or null if no limits
     */
    getActionLimitsForUser(userId: UserId, action: XP_ACTION): Promise<{
        dailyLimit: number | null;
        dailyCount: number;
        isOnCooldown: boolean;
        cooldownSeconds: number | null;
        cooldownRemaining: number;
        timeSinceLastAward: number | null;
        canReceive: boolean;
    } | null>;
    /**
     * Get the effective XP multiplier for a user based on their roles.
     * If the user has multiple roles, the highest multiplier is applied.
     * If the user has no roles with a multiplier > 0, a default of 1 is returned.
     */
    private getUserRoleMultiplier;
    /**
     * Get the XP multiplier for a specific forum
     */
    private getForumMultiplier;
}
export declare const xpService: XpService;
