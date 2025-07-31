/**
 * XP Event Handlers
 *
 * Centralized event handlers for XP-related actions in the system.
 * This separates event logic from service logic for better modularity.
 */
import type { UserId } from '@shared/types/ids';
import { XpGainEvent, XpLossEvent, LevelUpEvent } from '../xp.events';
export { XpGainEvent, XpLossEvent, LevelUpEvent };
/**
 * Handle XP award event
 * Central function to process XP gain and trigger appropriate side effects
 */
export declare function handleXpAward(userId: UserId, amount: number, source: string, reason?: string): Promise<{
    oldXp: number;
    newXp: number;
    oldLevel: number;
    newLevel: number;
    leveledUp: boolean;
}>;
/**
 * Handle user level up
 * Process rewards and notifications when a user levels up
 */
export declare function handleLevelUp(tx: any, // Transaction context
userId: UserId, oldLevel: number, newLevel: number, username?: string): Promise<{
    rewards: {
        dgt?: number;
        title?: string;
        badge?: string;
    };
}>;
/**
 * Handle XP loss
 * Process logic when a user loses XP (admin adjustment, penalty, etc.)
 */
export declare function handleXpLoss(userId: UserId, amount: number, reason: string): Promise<{
    oldXp: number;
    newXp: number;
    levelChanged: boolean;
    newLevel: number;
}>;
