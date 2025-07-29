import type { InsertEventLog } from '@schema/system/event_logs';
/**
 * Helper service for logging events throughout the application
 * This provides a simple interface for other services to log events
 */
export declare class EventLoggerService {
    /**
     * Log a user event
     */
    logUserEvent(userId: string, eventType: InsertEventLog['eventType'], meta?: Record<string, any>, relatedId?: string): Promise<{
        id: string;
    }>;
    /**
     * Log a thread creation event
     */
    logThreadCreated(userId: string, threadId: string, meta?: Record<string, any>): Promise<{
        id: string;
    }>;
    /**
     * Log a post creation event
     */
    logPostCreated(userId: string, postId: string, threadId: string, meta?: Record<string, any>): Promise<{
        id: string;
    }>;
    /**
     * Log a level up event
     */
    logLevelUp(userId: string, oldLevel: number, newLevel: number, meta?: Record<string, any>): Promise<{
        id: string;
    }>;
    /**
     * Log a badge earned event
     */
    logBadgeEarned(userId: string, badgeId: string, badgeName: string, meta?: Record<string, any>): Promise<{
        id: string;
    }>;
    /**
     * Log a tip sent event
     */
    logTipSent(senderId: string, recipientId: string, amount: number, transactionId: string, meta?: Record<string, any>): Promise<{
        id: string;
    }>;
    /**
     * Log a tip received event
     */
    logTipReceived(recipientId: string, senderId: string, amount: number, transactionId: string, meta?: Record<string, any>): Promise<{
        id: string;
    }>;
    /**
     * Log a rain claimed event
     */
    logRainClaimed(userId: string, rainId: string, amount: number, meta?: Record<string, any>): Promise<{
        id: string;
    }>;
    /**
     * Log a cosmetic unlocked event
     */
    logCosmeticUnlocked(userId: string, cosmeticId: string, cosmeticType: string, cosmeticName: string, meta?: Record<string, any>): Promise<{
        id: string;
    }>;
    /**
     * Log an XP earned event
     */
    logXpEarned(userId: string, amount: number, source: string, meta?: Record<string, any>): Promise<{
        id: string;
    }>;
    /**
     * Log a referral completed event
     */
    logReferralCompleted(userId: string, referrerId: string, referralId: string, meta?: Record<string, any>): Promise<{
        id: string;
    }>;
    /**
     * Log a product purchased event
     */
    logProductPurchased(userId: string, productId: string, productName: string, price: number, orderId: string, meta?: Record<string, any>): Promise<{
        id: string;
    }>;
    /**
     * Log a mission completed event
     */
    logMissionCompleted(userId: string, missionId: string, missionName: string, rewards: Record<string, any>, meta?: Record<string, any>): Promise<{
        id: string;
    }>;
    /**
     * Log an airdrop claimed event
     */
    logAirdropClaimed(userId: string, airdropId: string, amount: number, meta?: Record<string, any>): Promise<{
        id: string;
    }>;
}
export declare const eventLogger: EventLoggerService;
