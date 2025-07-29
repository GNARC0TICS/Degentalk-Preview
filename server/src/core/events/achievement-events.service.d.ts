/**
 * Achievement Event Emitter Service
 *
 * Central event emission system for triggering achievement processing.
 * Integrates with existing forum events to track user behavior.
 */
import type { AchievementEventType } from '@schema';
export declare class AchievementEventEmitter {
    /**
     * Core event emission method
     */
    private static emit;
    /**
     * Forum participation events
     */
    static emitPostCreated(userId: string, postData: any): Promise<void>;
    static emitThreadCreated(userId: string, threadData: any): Promise<void>;
    static emitUserLogin(userId: string): Promise<void>;
    /**
     * Social interaction events
     */
    static emitTipSent(fromUserId: string, toUserId: string, tipData: any): Promise<void>;
    static emitShoutboxMessage(userId: string, messageData: any): Promise<void>;
    static emitLikeGiven(userId: string, likeData: any): Promise<void>;
    static emitLikeReceived(userId: string, likeData: any): Promise<void>;
    static emitUserMentioned(userId: string, mentionData: any): Promise<void>;
    /**
     * Degen culture specific events
     */
    static emitWalletLoss(userId: string, lossData: any): Promise<void>;
    static emitThreadNecromancy(userId: string, threadData: any): Promise<void>;
    static emitCrashSentiment(userId: string, sentimentData: any): Promise<void>;
    static emitDiamondHands(userId: string, holdData: any): Promise<void>;
    static emitPaperHands(userId: string, sellData: any): Promise<void>;
    static emitMarketPrediction(userId: string, predictionData: any): Promise<void>;
    /**
     * Moderation and special events
     */
    static emitThreadLocked(userId: string, threadData: any): Promise<void>;
    static emitDailyStreak(userId: string, streakData: any): Promise<void>;
    /**
     * Custom event for flexible achievement triggers
     */
    static emitCustomEvent(eventType: string, userId: string, eventData: any): Promise<void>;
    /**
     * Batch event emission for performance
     */
    static emitBatch(events: Array<{
        eventType: AchievementEventType;
        userId: string;
        eventData: any;
    }>): Promise<void>;
}
