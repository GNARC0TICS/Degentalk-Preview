import { eventLogService } from './event-log.service';
import { emitEventLogCreated } from '../../notifications/event-notification-listener';
/**
 * Helper service for logging events throughout the application
 * This provides a simple interface for other services to log events
 */
export class EventLoggerService {
    /**
     * Log a user event
     */
    async logUserEvent(userId, eventType, meta = {}, relatedId) {
        const result = await eventLogService.createEventLog({
            userId,
            eventType,
            meta,
            relatedId
        });
        // Fetch the complete event log to emit
        const eventLog = await eventLogService.getEventLogById(result.id);
        if (eventLog) {
            // Emit event for notification generation
            emitEventLogCreated(eventLog);
        }
        return result;
    }
    /**
     * Log a thread creation event
     */
    async logThreadCreated(userId, threadId, meta = {}) {
        return this.logUserEvent(userId, 'thread_created', {
            threadId,
            ...meta
        }, threadId);
    }
    /**
     * Log a post creation event
     */
    async logPostCreated(userId, postId, threadId, meta = {}) {
        return this.logUserEvent(userId, 'post_created', {
            postId,
            threadId,
            ...meta
        }, postId);
    }
    /**
     * Log a level up event
     */
    async logLevelUp(userId, oldLevel, newLevel, meta = {}) {
        return this.logUserEvent(userId, 'level_up', {
            oldLevel,
            newLevel,
            ...meta
        });
    }
    /**
     * Log a badge earned event
     */
    async logBadgeEarned(userId, badgeId, badgeName, meta = {}) {
        return this.logUserEvent(userId, 'badge_earned', {
            badgeId,
            badgeName,
            ...meta
        }, badgeId);
    }
    /**
     * Log a tip sent event
     */
    async logTipSent(senderId, recipientId, amount, transactionId, meta = {}) {
        return this.logUserEvent(senderId, 'tip_sent', {
            recipientId,
            amount,
            transactionId,
            ...meta
        }, transactionId);
    }
    /**
     * Log a tip received event
     */
    async logTipReceived(recipientId, senderId, amount, transactionId, meta = {}) {
        return this.logUserEvent(recipientId, 'tip_received', {
            senderId,
            amount,
            transactionId,
            ...meta
        }, transactionId);
    }
    /**
     * Log a rain claimed event
     */
    async logRainClaimed(userId, rainId, amount, meta = {}) {
        return this.logUserEvent(userId, 'rain_claimed', {
            rainId,
            amount,
            ...meta
        }, rainId);
    }
    /**
     * Log a cosmetic unlocked event
     */
    async logCosmeticUnlocked(userId, cosmeticId, cosmeticType, cosmeticName, meta = {}) {
        return this.logUserEvent(userId, 'cosmetic_unlocked', {
            cosmeticId,
            cosmeticType,
            cosmeticName,
            ...meta
        }, cosmeticId);
    }
    /**
     * Log an XP earned event
     */
    async logXpEarned(userId, amount, source, meta = {}) {
        return this.logUserEvent(userId, 'xp_earned', {
            amount,
            source,
            ...meta
        });
    }
    /**
     * Log a referral completed event
     */
    async logReferralCompleted(userId, referrerId, referralId, meta = {}) {
        return this.logUserEvent(userId, 'referral_completed', {
            referrerId,
            referralId,
            ...meta
        }, referralId);
    }
    /**
     * Log a product purchased event
     */
    async logProductPurchased(userId, productId, productName, price, orderId, meta = {}) {
        return this.logUserEvent(userId, 'product_purchased', {
            productId,
            productName,
            price,
            orderId,
            ...meta
        }, orderId);
    }
    /**
     * Log a mission completed event
     */
    async logMissionCompleted(userId, missionId, missionName, rewards, meta = {}) {
        return this.logUserEvent(userId, 'mission_completed', {
            missionId,
            missionName,
            rewards,
            ...meta
        }, missionId);
    }
    /**
     * Log an airdrop claimed event
     */
    async logAirdropClaimed(userId, airdropId, amount, meta = {}) {
        return this.logUserEvent(userId, 'airdrop_claimed', {
            airdropId,
            amount,
            ...meta
        }, airdropId);
    }
}
export const eventLogger = new EventLoggerService();
