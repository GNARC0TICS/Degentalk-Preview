/**
 * Degen Achievement Evaluators
 *
 * Custom evaluators for culturally-specific "degen" achievements that require
 * complex logic beyond simple counting or thresholds.
 */

import { db } from '@degentalk/db';
import { eq, and, count, desc, sql, gte, lte, between } from 'drizzle-orm';
import { achievementEvents, users } from '@schema';
import { logger } from '@core/logger';
import type { AchievementEventType } from '@schema';

export interface EvaluatorConfig {
	[key: string]: any;
}

export class DegenAchievementEvaluators {
	/**
	 * Check if this evaluator can handle a specific achievement
	 */
	canHandle(evaluator: string, eventType?: AchievementEventType): boolean {
		const handlers = [
			'check_wallet_loss',
			'check_diamond_hands',
			'check_paper_hands',
			'check_crash_sentiment',
			'check_thread_necromancy',
			'check_shoutbox_spam',
			'check_tip_whale',
			'check_market_prophet',
			'check_degen_combo',
			'check_panic_poster',
			'check_hodl_mentality',
			'check_fomo_master',
			'check_loss_recovery',
			'check_weekend_warrior',
			'check_night_owl',
			'check_meme_lord',
			'check_contrarian',
			'check_moon_mission'
		];

		return handlers.includes(evaluator);
	}

	/**
	 * Evaluate a specific achievement condition
	 */
	async evaluate(evaluator: string, userId: string, config: EvaluatorConfig): Promise<boolean> {
		try {
			switch (evaluator) {
				case 'check_wallet_loss':
					return await this.checkWalletLoss(userId, config);

				case 'check_diamond_hands':
					return await this.checkDiamondHands(userId, config);

				case 'check_paper_hands':
					return await this.checkPaperHands(userId, config);

				case 'check_crash_sentiment':
					return await this.checkCrashSentiment(userId, config);

				case 'check_thread_necromancy':
					return await this.checkThreadNecromancy(userId, config);

				case 'check_shoutbox_spam':
					return await this.checkShoutboxSpam(userId, config);

				case 'check_tip_whale':
					return await this.checkTipWhale(userId, config);

				case 'check_market_prophet':
					return await this.checkMarketProphet(userId, config);

				case 'check_degen_combo':
					return await this.checkDegenCombo(userId, config);

				case 'check_panic_poster':
					return await this.checkPanicPoster(userId, config);

				case 'check_hodl_mentality':
					return await this.checkHodlMentality(userId, config);

				case 'check_fomo_master':
					return await this.checkFomoMaster(userId, config);

				case 'check_loss_recovery':
					return await this.checkLossRecovery(userId, config);

				case 'check_weekend_warrior':
					return await this.checkWeekendWarrior(userId, config);

				case 'check_night_owl':
					return await this.checkNightOwl(userId, config);

				case 'check_meme_lord':
					return await this.checkMemeLord(userId, config);

				case 'check_contrarian':
					return await this.checkContrarian(userId, config);

				case 'check_moon_mission':
					return await this.checkMoonMission(userId, config);

				default:
					logger.warn('DEGEN_EVALUATOR', `Unknown evaluator: ${evaluator}`);
					return false;
			}
		} catch (error) {
			logger.error('DEGEN_EVALUATOR', `Failed to evaluate ${evaluator}`, {
				evaluator,
				userId,
				error: error instanceof Error ? error.message : String(error)
			});
			return false;
		}
	}

	/**
	 * Check for significant wallet losses (bag holder achievements)
	 */
	private async checkWalletLoss(userId: string, config: EvaluatorConfig): Promise<boolean> {
		const { minimumLoss = 1000, timeframe = 24 } = config;

		const lossEvents = await db
			.select()
			.from(achievementEvents)
			.where(
				and(
					eq(achievementEvents.userId, userId),
					eq(achievementEvents.eventType, 'wallet_loss'),
					gte(achievementEvents.triggeredAt, sql`now() - interval '${timeframe} hours'`)
				)
			);

		const totalLoss = lossEvents.reduce((sum, event) => {
			const data = event.eventData as any;
			return sum + (data.lossAmount || 0);
		}, 0);

		return totalLoss >= minimumLoss;
	}

	/**
	 * Check for diamond hands behavior (holding through adversity)
	 */
	private async checkDiamondHands(userId: string, config: EvaluatorConfig): Promise<boolean> {
		const { minimumHoldDays = 30, minimumDrawdown = 50 } = config;

		const diamondEvents = await db
			.select()
			.from(achievementEvents)
			.where(
				and(eq(achievementEvents.userId, userId), eq(achievementEvents.eventType, 'diamond_hands'))
			);

		return diamondEvents.some((event) => {
			const data = event.eventData as any;
			return data.holdDuration >= minimumHoldDays && data.maxDrawdown >= minimumDrawdown;
		});
	}

	/**
	 * Check for paper hands behavior (panic selling)
	 */
	private async checkPaperHands(userId: string, config: EvaluatorConfig): Promise<boolean> {
		const { requiredPanicSells = 3, timeframe = 168 } = config; // 1 week

		const panicSells = await db
			.select({ count: count() })
			.from(achievementEvents)
			.where(
				and(
					eq(achievementEvents.userId, userId),
					eq(achievementEvents.eventType, 'paper_hands'),
					gte(achievementEvents.triggeredAt, sql`now() - interval '${timeframe} hours'`)
				)
			);

		return (panicSells[0]?.count || 0) >= requiredPanicSells;
	}

	/**
	 * Check for crash sentiment posting (doom posting during market crashes)
	 */
	private async checkCrashSentiment(userId: string, config: EvaluatorConfig): Promise<boolean> {
		const { requiredPosts = 5, sentimentThreshold = 0.7 } = config;

		const crashPosts = await db
			.select()
			.from(achievementEvents)
			.where(
				and(
					eq(achievementEvents.userId, userId),
					eq(achievementEvents.eventType, 'crash_sentiment')
				)
			);

		const qualifyingPosts = crashPosts.filter((event) => {
			const data = event.eventData as any;
			return data.confidence >= sentimentThreshold;
		});

		return qualifyingPosts.length >= requiredPosts;
	}

	/**
	 * Check for thread necromancy (reviving old threads)
	 */
	private async checkThreadNecromancy(userId: string, config: EvaluatorConfig): Promise<boolean> {
		const { requiredNecromancies = 3, minimumThreadAge = 90 } = config;

		const necromancies = await db
			.select()
			.from(achievementEvents)
			.where(
				and(
					eq(achievementEvents.userId, userId),
					eq(achievementEvents.eventType, 'thread_necromancy')
				)
			);

		const qualifyingNecromancies = necromancies.filter((event) => {
			const data = event.eventData as any;
			return data.threadAge >= minimumThreadAge;
		});

		return qualifyingNecromancies.length >= requiredNecromancies;
	}

	/**
	 * Check for shoutbox spam patterns
	 */
	private async checkShoutboxSpam(userId: string, config: EvaluatorConfig): Promise<boolean> {
		const { messagesPerHour = 50, timeframe = 1 } = config;

		const messages = await db
			.select({ count: count() })
			.from(achievementEvents)
			.where(
				and(
					eq(achievementEvents.userId, userId),
					eq(achievementEvents.eventType, 'shoutbox_message'),
					gte(achievementEvents.triggeredAt, sql`now() - interval '${timeframe} hours'`)
				)
			);

		return (messages[0]?.count || 0) >= messagesPerHour;
	}

	/**
	 * Check for whale-level tipping behavior
	 */
	private async checkTipWhale(userId: string, config: EvaluatorConfig): Promise<boolean> {
		const { minimumTipAmount = 10000, timeframe = 24 } = config;

		const tips = await db
			.select()
			.from(achievementEvents)
			.where(
				and(
					eq(achievementEvents.userId, userId),
					eq(achievementEvents.eventType, 'tip_sent'),
					gte(achievementEvents.triggeredAt, sql`now() - interval '${timeframe} hours'`)
				)
			);

		return tips.some((tip) => {
			const data = tip.eventData as any;
			return data.amount >= minimumTipAmount;
		});
	}

	/**
	 * Check for accurate market predictions
	 */
	private async checkMarketProphet(userId: string, config: EvaluatorConfig): Promise<boolean> {
		const { minimumAccuracy = 0.8, minimumPredictions = 10 } = config;

		const predictions = await db
			.select()
			.from(achievementEvents)
			.where(
				and(
					eq(achievementEvents.userId, userId),
					eq(achievementEvents.eventType, 'market_prediction')
				)
			);

		if (predictions.length < minimumPredictions) return false;

		const accuratePredictions = predictions.filter((pred) => {
			const data = pred.eventData as any;
			return data.accuracy >= minimumAccuracy;
		});

		const overallAccuracy = accuratePredictions.length / predictions.length;
		return overallAccuracy >= minimumAccuracy;
	}

	/**
	 * Check for multiple degen activities in sequence
	 */
	private async checkDegenCombo(userId: string, config: EvaluatorConfig): Promise<boolean> {
		const { requiredEvents = ['wallet_loss', 'paper_hands', 'crash_sentiment'], timeframe = 24 } =
			config;

		const events = await db
			.select()
			.from(achievementEvents)
			.where(
				and(
					eq(achievementEvents.userId, userId),
					gte(achievementEvents.triggeredAt, sql`now() - interval '${timeframe} hours'`)
				)
			)
			.orderBy(desc(achievementEvents.triggeredAt));

		const eventTypes = events.map((e) => e.eventType);
		return requiredEvents.every((eventType) =>
			eventTypes.includes(eventType as AchievementEventType)
		);
	}

	/**
	 * Check for panic posting behavior (high activity during market stress)
	 */
	private async checkPanicPoster(userId: string, config: EvaluatorConfig): Promise<boolean> {
		const {
			postsPerHour = 10,
			crashKeywords = ['crash', 'dump', 'rekt', 'bear'],
			timeframe = 4
		} = config;

		const posts = await db
			.select({ count: count() })
			.from(achievementEvents)
			.where(
				and(
					eq(achievementEvents.userId, userId),
					eq(achievementEvents.eventType, 'post_created'),
					gte(achievementEvents.triggeredAt, sql`now() - interval '${timeframe} hours'`)
				)
			);

		const crashSentiments = await db
			.select({ count: count() })
			.from(achievementEvents)
			.where(
				and(
					eq(achievementEvents.userId, userId),
					eq(achievementEvents.eventType, 'crash_sentiment'),
					gte(achievementEvents.triggeredAt, sql`now() - interval '${timeframe} hours'`)
				)
			);

		return (posts[0]?.count || 0) >= postsPerHour && (crashSentiments[0]?.count || 0) > 0;
	}

	/**
	 * Check for long-term holding mentality
	 */
	private async checkHodlMentality(userId: string, config: EvaluatorConfig): Promise<boolean> {
		const { minimumHoldPeriod = 365, resistedSellSignals = 5 } = config;

		// Look for diamond hands events with long hold periods
		const holdEvents = await db
			.select()
			.from(achievementEvents)
			.where(
				and(eq(achievementEvents.userId, userId), eq(achievementEvents.eventType, 'diamond_hands'))
			);

		return holdEvents.some((event) => {
			const data = event.eventData as any;
			return data.holdDuration >= minimumHoldPeriod;
		});
	}

	/**
	 * Check for FOMO behavior patterns
	 */
	private async checkFomoMaster(userId: string, config: EvaluatorConfig): Promise<boolean> {
		const { requiredFomoActions = 10, timeframe = 168 } = config; // 1 week

		// Count rapid buying/posting activity during market pumps
		const fomoActivities = await db
			.select({ count: count() })
			.from(achievementEvents)
			.where(
				and(
					eq(achievementEvents.userId, userId),
					gte(achievementEvents.triggeredAt, sql`now() - interval '${timeframe} hours'`)
				)
			);

		return (fomoActivities[0]?.count || 0) >= requiredFomoActions;
	}

	/**
	 * Check for recovery from major losses
	 */
	private async checkLossRecovery(userId: string, config: EvaluatorConfig): Promise<boolean> {
		const { minimumLoss = 5000, recoveryMultiplier = 1.5 } = config;

		// Check for wallet loss followed by diamond hands
		const lossEvents = await db
			.select()
			.from(achievementEvents)
			.where(
				and(eq(achievementEvents.userId, userId), eq(achievementEvents.eventType, 'wallet_loss'))
			);

		const diamondEvents = await db
			.select()
			.from(achievementEvents)
			.where(
				and(eq(achievementEvents.userId, userId), eq(achievementEvents.eventType, 'diamond_hands'))
			);

		// Check if there's a diamond hands event after a significant loss
		return lossEvents.some((loss) => {
			const lossData = loss.eventData as any;
			if (lossData.lossAmount < minimumLoss) return false;

			return diamondEvents.some((diamond) => {
				const diamondData = diamond.eventData as any;
				return (
					diamond.triggeredAt > loss.triggeredAt &&
					diamondData.finalReturn >= lossData.lossAmount * recoveryMultiplier
				);
			});
		});
	}

	/**
	 * Check for weekend trading activity
	 */
	private async checkWeekendWarrior(userId: string, config: EvaluatorConfig): Promise<boolean> {
		const { weekendPostsRequired = 20 } = config;

		// Count posts made on weekends (Saturday/Sunday)
		const weekendPosts = await db
			.select({ count: count() })
			.from(achievementEvents)
			.where(
				and(
					eq(achievementEvents.userId, userId),
					eq(achievementEvents.eventType, 'post_created'),
					sql`EXTRACT(DOW FROM triggered_at) IN (0, 6)` // Sunday = 0, Saturday = 6
				)
			);

		return (weekendPosts[0]?.count || 0) >= weekendPostsRequired;
	}

	/**
	 * Check for late night posting activity
	 */
	private async checkNightOwl(userId: string, config: EvaluatorConfig): Promise<boolean> {
		const { nightPostsRequired = 50, startHour = 22, endHour = 6 } = config;

		// Count posts made between 10 PM and 6 AM
		const nightPosts = await db
			.select({ count: count() })
			.from(achievementEvents)
			.where(
				and(
					eq(achievementEvents.userId, userId),
					eq(achievementEvents.eventType, 'post_created'),
					sql`EXTRACT(HOUR FROM triggered_at) >= ${startHour} OR EXTRACT(HOUR FROM triggered_at) <= ${endHour}`
				)
			);

		return (nightPosts[0]?.count || 0) >= nightPostsRequired;
	}

	/**
	 * Check for meme posting mastery
	 */
	private async checkMemeLord(userId: string, config: EvaluatorConfig): Promise<boolean> {
		const { memePostsRequired = 100 } = config;

		// Count posts with meme-related content or high engagement
		const posts = await db
			.select()
			.from(achievementEvents)
			.where(
				and(eq(achievementEvents.userId, userId), eq(achievementEvents.eventType, 'post_created'))
			);

		// Simple heuristic: posts with certain keywords or patterns
		const memePosts = posts.filter((post) => {
			const data = post.eventData as any;
			const content = data.content?.toLowerCase() || '';
			const memeKeywords = [
				'pepe',
				'wojak',
				'chad',
				'based',
				'cringe',
				'moon',
				'lambo',
				'diamond hands',
				'paper hands'
			];
			return memeKeywords.some((keyword) => content.includes(keyword));
		});

		return memePosts.length >= memePostsRequired;
	}

	/**
	 * Check for contrarian behavior (posting opposite sentiment)
	 */
	private async checkContrarian(userId: string, config: EvaluatorConfig): Promise<boolean> {
		const { contrarianPostsRequired = 25 } = config;

		// Look for posts that go against market sentiment
		const contrarianEvents = await db
			.select({ count: count() })
			.from(achievementEvents)
			.where(
				and(
					eq(achievementEvents.userId, userId),
					eq(achievementEvents.eventType, 'crash_sentiment')
				)
			);

		// Simple implementation - could be enhanced with sentiment analysis
		return (contrarianEvents[0]?.count || 0) >= contrarianPostsRequired;
	}

	/**
	 * Check for moon mission posting (extreme optimism)
	 */
	private async checkMoonMission(userId: string, config: EvaluatorConfig): Promise<boolean> {
		const { moonPostsRequired = 50 } = config;

		// Count posts with extremely bullish sentiment
		const posts = await db
			.select()
			.from(achievementEvents)
			.where(
				and(eq(achievementEvents.userId, userId), eq(achievementEvents.eventType, 'post_created'))
			);

		const moonPosts = posts.filter((post) => {
			const data = post.eventData as any;
			const content = data.content?.toLowerCase() || '';
			const moonKeywords = [
				'moon',
				'lambo',
				'rocket',
				'🚀',
				'to the moon',
				'100x',
				'1000x',
				'diamond hands'
			];
			return moonKeywords.some((keyword) => content.includes(keyword));
		});

		return moonPosts.length >= moonPostsRequired;
	}
}
