/**
 * Achievement Event Emitter Service
 *
 * Central event emission system for triggering achievement processing.
 * Integrates with existing forum events to track user behavior.
 */

import { db } from '@db';
import { achievementEvents } from '@schema';
import { logger } from '../logger';
import type { AchievementEventType } from '@schema';

export class AchievementEventEmitter {
	/**
	 * Core event emission method
	 */
	private static async emit(
		eventType: AchievementEventType,
		userId: string,
		eventData: any = {}
	): Promise<void> {
		try {
			await db.insert(achievementEvents).values({
				userId,
				eventType,
				eventData: {
					...eventData,
					timestamp: new Date().toISOString(),
					source: 'achievement_emitter'
				}
			});

			logger.info('ACHIEVEMENT_EVENT', `Emitted ${eventType} for user ${userId}`, {
				eventType,
				userId,
				dataKeys: Object.keys(eventData)
			});
		} catch (error) {
			logger.error('ACHIEVEMENT_EVENT', `Failed to emit ${eventType} event`, {
				eventType,
				userId,
				error: error instanceof Error ? error.message : String(error)
			});
		}
	}

	/**
	 * Forum participation events
	 */
	static async emitPostCreated(userId: string, postData: any): Promise<void> {
		await this.emit('post_created', userId, {
			postId: postData.id,
			threadId: postData.threadId,
			forumId: postData.forum?.id,
			contentLength: postData.content?.length || 0,
			hasLinks: postData.content ? /https?:\/\//.test(postData.content) : false,
			timestamp: postData.createdAt
		});
	}

	static async emitThreadCreated(userId: string, threadData: any): Promise<void> {
		await this.emit('thread_created', userId, {
			threadId: threadData.id,
			forumId: threadData.forumId,
			title: threadData.title,
			hasPolls: !!threadData.polls?.length,
			tags: threadData.tags || [],
			timestamp: threadData.createdAt
		});
	}

	static async emitUserLogin(userId: string): Promise<void> {
		await this.emit('user_login', userId, {
			timestamp: new Date().toISOString(),
			loginType: 'standard'
		});
	}

	/**
	 * Social interaction events
	 */
	static async emitTipSent(fromUserId: string, toUserId: string, tipData: any): Promise<void> {
		await this.emit('tip_sent', fromUserId, {
			recipientId: toUserId,
			amount: tipData.amount,
			currency: tipData.currency || 'DGT',
			postId: tipData.postId,
			reason: tipData.reason
		});

		await this.emit('tip_received', toUserId, {
			senderId: fromUserId,
			amount: tipData.amount,
			currency: tipData.currency || 'DGT',
			postId: tipData.postId,
			reason: tipData.reason
		});
	}

	static async emitShoutboxMessage(userId: string, messageData: any): Promise<void> {
		await this.emit('shoutbox_message', userId, {
			messageId: messageData.id,
			contentLength: messageData.content?.length || 0,
			mentions: messageData.mentions || [],
			isCommand: messageData.content?.startsWith('/') || false
		});
	}

	static async emitLikeGiven(userId: string, likeData: any): Promise<void> {
		await this.emit('like_given', userId, {
			postId: likeData.postId,
			recipientId: likeData.postAuthorId,
			threadId: likeData.threadId
		});
	}

	static async emitLikeReceived(userId: string, likeData: any): Promise<void> {
		await this.emit('like_received', userId, {
			postId: likeData.postId,
			senderId: likeData.likerId,
			threadId: likeData.threadId
		});
	}

	static async emitUserMentioned(userId: string, mentionData: any): Promise<void> {
		await this.emit('user_mentioned', userId, {
			postId: mentionData.postId,
			threadId: mentionData.threadId,
			mentionedById: mentionData.mentionedById,
			context: mentionData.context
		});
	}

	/**
	 * Degen culture specific events
	 */
	static async emitWalletLoss(userId: string, lossData: any): Promise<void> {
		await this.emit('wallet_loss', userId, {
			lossAmount: lossData.amount,
			lossPercentage: lossData.percentage,
			currency: lossData.currency,
			transactionId: lossData.transactionId,
			reason: lossData.reason || 'trade_loss'
		});
	}

	static async emitThreadNecromancy(userId: string, threadData: any): Promise<void> {
		const threadAge = Date.now() - new Date(threadData.createdAt).getTime();
		const daysOld = Math.floor(threadAge / (1000 * 60 * 60 * 24));

		await this.emit('thread_necromancy', userId, {
			threadId: threadData.id,
			threadAge: daysOld,
			originalAuthorId: threadData.authorId,
			lastActivityDate: threadData.lastActivityAt,
			postId: threadData.revivingPostId
		});
	}

	static async emitCrashSentiment(userId: string, sentimentData: any): Promise<void> {
		await this.emit('crash_sentiment', userId, {
			postId: sentimentData.postId,
			keywords: sentimentData.detectedKeywords,
			sentiment: sentimentData.sentiment,
			marketCondition: sentimentData.marketCondition,
			confidence: sentimentData.confidence
		});
	}

	static async emitDiamondHands(userId: string, holdData: any): Promise<void> {
		await this.emit('diamond_hands', userId, {
			holdDuration: holdData.holdDuration,
			maxDrawdown: holdData.maxDrawdown,
			currency: holdData.currency,
			finalReturn: holdData.finalReturn,
			steadfast: true
		});
	}

	static async emitPaperHands(userId: string, sellData: any): Promise<void> {
		await this.emit('paper_hands', userId, {
			sellReason: sellData.reason,
			timingScore: sellData.timingScore,
			currency: sellData.currency,
			panicSell: sellData.isPanic || false
		});
	}

	static async emitMarketPrediction(userId: string, predictionData: any): Promise<void> {
		await this.emit('market_prediction', userId, {
			predictionId: predictionData.id,
			accuracy: predictionData.accuracy,
			timeframe: predictionData.timeframe,
			asset: predictionData.asset,
			confidence: predictionData.confidence,
			outcome: predictionData.outcome
		});
	}

	/**
	 * Moderation and special events
	 */
	static async emitThreadLocked(userId: string, threadData: any): Promise<void> {
		await this.emit('thread_locked', userId, {
			threadId: threadData.id,
			reason: threadData.lockReason,
			moderatorId: threadData.lockedById,
			wasAuthor: threadData.authorId === userId
		});
	}

	static async emitDailyStreak(userId: string, streakData: any): Promise<void> {
		await this.emit('daily_streak', userId, {
			streakLength: streakData.days,
			streakType: streakData.type, // login, posting, etc
			milestone: streakData.milestone || false
		});
	}

	/**
	 * Custom event for flexible achievement triggers
	 */
	static async emitCustomEvent(eventType: string, userId: string, eventData: any): Promise<void> {
		await this.emit('custom_event', userId, {
			customEventType: eventType,
			...eventData
		});
	}

	/**
	 * Batch event emission for performance
	 */
	static async emitBatch(
		events: Array<{
			eventType: AchievementEventType;
			userId: string;
			eventData: any;
		}>
	): Promise<void> {
		try {
			const eventRows = events.map((event) => ({
				userId: event.userId,
				eventType: event.eventType,
				eventData: {
					...event.eventData,
					timestamp: new Date().toISOString(),
					source: 'achievement_emitter_batch'
				}
			}));

			await db.insert(achievementEvents).values(eventRows);

			logger.info('ACHIEVEMENT_EVENT', `Batch emitted ${events.length} events`, {
				eventCount: events.length,
				eventTypes: [...new Set(events.map((e) => e.eventType))]
			});
		} catch (error) {
			logger.error('ACHIEVEMENT_EVENT', 'Failed to emit batch events', {
				eventCount: events.length,
				error: error instanceof Error ? error.message : String(error)
			});
		}
	}
}
