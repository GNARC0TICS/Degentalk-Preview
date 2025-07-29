/**
 * XP Events
 *
 * Event classes for XP-related events in the system
 * These are used for triggering notifications and other actions when XP changes occur
 */
import type { UserId } from '@shared/types/ids';
/**
 * Event emitted when a user gains XP
 */
export declare class XpGainEvent {
    userId: UserId;
    amount: number;
    source: string;
    metadata?: any;
    constructor(userId: UserId, amount: number, source: string, metadata?: any);
}
/**
 * Event emitted when a user loses XP
 */
export declare class XpLossEvent {
    userId: UserId;
    amount: number;
    reason: string;
    metadata?: any;
    constructor(userId: UserId, amount: number, reason: string, metadata?: any);
}
/**
 * Event emitted when a user levels up
 */
export declare class LevelUpEvent {
    userId: UserId;
    oldLevel: number;
    newLevel: number;
    newXp: number;
    metadata?: any;
    constructor(userId: UserId, oldLevel: number, newLevel: number, newXp: number, metadata?: any);
}
