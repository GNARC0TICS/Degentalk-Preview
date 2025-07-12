import { eventLogService } from './event-log.service';
import type { InsertEventLog } from '@schema/system/event_logs';
import { emitEventLogCreated } from '../../notifications/event-notification-listener';

/**
 * Helper service for logging events throughout the application
 * This provides a simple interface for other services to log events
 */
export class EventLoggerService {
	/**
	 * Log a user event
	 */
	async logUserEvent(
		userId: string,
		eventType: InsertEventLog['eventType'],
		meta: Record<string, any> = {},
		relatedId?: string
	): Promise<{ id: string }> {
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
	async logThreadCreated(userId: string, threadId: string, meta: Record<string, any> = {}) {
		return this.logUserEvent(
			userId,
			'thread_created',
			{
				threadId,
				...meta
			},
			threadId
		);
	}

	/**
	 * Log a post creation event
	 */
	async logPostCreated(
		userId: string,
		postId: string,
		threadId: string,
		meta: Record<string, any> = {}
	) {
		return this.logUserEvent(
			userId,
			'post_created',
			{
				postId,
				threadId,
				...meta
			},
			postId
		);
	}

	/**
	 * Log a level up event
	 */
	async logLevelUp(
		userId: string,
		oldLevel: number,
		newLevel: number,
		meta: Record<string, any> = {}
	) {
		return this.logUserEvent(userId, 'level_up', {
			oldLevel,
			newLevel,
			...meta
		});
	}

	/**
	 * Log a badge earned event
	 */
	async logBadgeEarned(
		userId: string,
		badgeId: string,
		badgeName: string,
		meta: Record<string, any> = {}
	) {
		return this.logUserEvent(
			userId,
			'badge_earned',
			{
				badgeId,
				badgeName,
				...meta
			},
			badgeId
		);
	}

	/**
	 * Log a tip sent event
	 */
	async logTipSent(
		senderId: string,
		recipientId: string,
		amount: number,
		transactionId: string,
		meta: Record<string, any> = {}
	) {
		return this.logUserEvent(
			senderId,
			'tip_sent',
			{
				recipientId,
				amount,
				transactionId,
				...meta
			},
			transactionId
		);
	}

	/**
	 * Log a tip received event
	 */
	async logTipReceived(
		recipientId: string,
		senderId: string,
		amount: number,
		transactionId: string,
		meta: Record<string, any> = {}
	) {
		return this.logUserEvent(
			recipientId,
			'tip_received',
			{
				senderId,
				amount,
				transactionId,
				...meta
			},
			transactionId
		);
	}

	/**
	 * Log a rain claimed event
	 */
	async logRainClaimed(
		userId: string,
		rainId: string,
		amount: number,
		meta: Record<string, any> = {}
	) {
		return this.logUserEvent(
			userId,
			'rain_claimed',
			{
				rainId,
				amount,
				...meta
			},
			rainId
		);
	}

	/**
	 * Log a cosmetic unlocked event
	 */
	async logCosmeticUnlocked(
		userId: string,
		cosmeticId: string,
		cosmeticType: string,
		cosmeticName: string,
		meta: Record<string, any> = {}
	) {
		return this.logUserEvent(
			userId,
			'cosmetic_unlocked',
			{
				cosmeticId,
				cosmeticType,
				cosmeticName,
				...meta
			},
			cosmeticId
		);
	}

	/**
	 * Log an XP earned event
	 */
	async logXpEarned(
		userId: string,
		amount: number,
		source: string,
		meta: Record<string, any> = {}
	) {
		return this.logUserEvent(userId, 'xp_earned', {
			amount,
			source,
			...meta
		});
	}

	/**
	 * Log a referral completed event
	 */
	async logReferralCompleted(
		userId: string,
		referrerId: string,
		referralId: string,
		meta: Record<string, any> = {}
	) {
		return this.logUserEvent(
			userId,
			'referral_completed',
			{
				referrerId,
				referralId,
				...meta
			},
			referralId
		);
	}

	/**
	 * Log a product purchased event
	 */
	async logProductPurchased(
		userId: string,
		productId: string,
		productName: string,
		price: number,
		orderId: string,
		meta: Record<string, any> = {}
	) {
		return this.logUserEvent(
			userId,
			'product_purchased',
			{
				productId,
				productName,
				price,
				orderId,
				...meta
			},
			orderId
		);
	}

	/**
	 * Log a mission completed event
	 */
	async logMissionCompleted(
		userId: string,
		missionId: string,
		missionName: string,
		rewards: Record<string, any>,
		meta: Record<string, any> = {}
	) {
		return this.logUserEvent(
			userId,
			'mission_completed',
			{
				missionId,
				missionName,
				rewards,
				...meta
			},
			missionId
		);
	}

	/**
	 * Log an airdrop claimed event
	 */
	async logAirdropClaimed(
		userId: string,
		airdropId: string,
		amount: number,
		meta: Record<string, any> = {}
	) {
		return this.logUserEvent(
			userId,
			'airdrop_claimed',
			{
				airdropId,
				amount,
				...meta
			},
			airdropId
		);
	}
}

export const eventLogger = new EventLoggerService();
