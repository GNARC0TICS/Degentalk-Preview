/**
 * Achievement Processor Service
 *
 * Processes achievement events and updates user progress.
 * Handles the core logic for checking requirements and awarding achievements.
 */

import { db } from '@db';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import { achievements, userAchievements, achievementEvents } from '@schema';
import type { Achievement, UserAchievement } from '@schema';
import type { AchievementEventType } from '@schema';
import { users } from '@schema';
import { logger, LogAction } from '@core/logger';
import { XpService } from '../../xp/xp.service';
import { DegenAchievementEvaluators } from './evaluators/degen-evaluators';
import type { UserId, AchievementId } from '@shared/types/ids';
import { reportErrorServer } from '../../../../lib/report-error';

export interface AchievementProgress {
	current: number;
	target: number;
	percentage: number;
	isCompleted: boolean;
	data?: any;
}

export class AchievementProcessorService {
	private xpService = new XpService();
	private evaluators = new DegenAchievementEvaluators();

	/**
	 * Process a single achievement event
	 */
	async processEvent(
		eventType: AchievementEventType,
		userId: UserId,
		eventData: any
	): Promise<void> {
		try {
			// Get all active achievements that could be triggered by this event
			const triggeredAchievements = await this.getTriggeredAchievements(eventType);

			for (const achievement of triggeredAchievements) {
				await this.updateUserProgress(userId, achievement, eventData);
			}

			// Mark event as processed
			await this.markEventProcessed(eventType, userId, eventData);

			logger.info('ACHIEVEMENT_PROCESSOR', `Processed ${eventType} for user ${userId}`, {
				eventType,
				userId,
				achievementCount: triggeredAchievements.length
			});
		} catch (error) {
			await reportErrorServer(error, {
				service: 'AchievementProcessorService',
				operation: 'processEvent',
				action: LogAction.FAILURE,
				data: { eventType, userId, eventData }
			});
			// Don't rethrow - continue processing other events
		}
	}

	/**
	 * Get achievements that can be triggered by an event type
	 */
	private async getTriggeredAchievements(eventType: AchievementEventType): Promise<Achievement[]> {
		// Get achievements where the trigger config matches this event type
		const allAchievements = await db
			.select()
			.from(achievements)
			.where(eq(achievements.isActive, true));

		return allAchievements.filter((achievement) => {
			const config = achievement.triggerConfig as any;

			// Check different trigger types
			switch (achievement.triggerType) {
				case 'count':
				case 'threshold':
					return config.action && this.mapEventToAction(eventType) === config.action;

				case 'event':
					return config.eventType === eventType;

				case 'custom':
					return (
						config.eventTypes?.includes(eventType) ||
						this.evaluators.canHandle(config.evaluator, eventType)
					);

				case 'composite':
					return config.requirements?.some(
						(req: any) => this.mapEventToAction(eventType) === req.action
					);

				default:
					return false;
			}
		});
	}

	/**
	 * Map event types to action names for trigger matching
	 */
	private mapEventToAction(eventType: AchievementEventType): string {
		const mapping: Record<AchievementEventType, string> = {
			post_created: 'posts_created',
			thread_created: 'threads_created',
			user_login: 'login_count',
			tip_sent: 'tips_sent',
			tip_received: 'tips_received',
			shoutbox_message: 'shoutbox_messages',
			like_given: 'likes_given',
			like_received: 'likes_received',
			user_mentioned: 'mentions_received',
			daily_streak: 'daily_streaks',
			wallet_loss: 'wallet_losses',
			thread_necromancy: 'thread_necromancies',
			crash_sentiment: 'crash_sentiments',
			diamond_hands: 'diamond_hands_events',
			paper_hands: 'paper_hands_events',
			market_prediction: 'market_predictions',
			thread_locked: 'threads_locked',
			custom_event: 'custom_events'
		};

		return mapping[eventType] || eventType;
	}

	/**
	 * Update user progress for a specific achievement
	 */
	private async updateUserProgress(
		userId: UserId,
		achievement: Achievement,
		eventData: any
	): Promise<void> {
		try {
			// Get current user achievement record
			const userAchievement = await this.getUserAchievement(userId, achievement.id);

			// Skip if already completed
			if (userAchievement?.isCompleted) {
				return;
			}

			// Calculate new progress
			const progress = await this.calculateProgress(achievement, userId, eventData);

			if (progress.isCompleted && !userAchievement?.isCompleted) {
				await this.completeAchievement(userId, achievement, progress);
			} else if (progress.current > 0) {
				await this.updateProgress(userId, achievement, progress);
			}
		} catch (error) {
			await reportErrorServer(error, {
				service: 'AchievementProcessorService',
				operation: 'updateUserProgress',
				action: LogAction.FAILURE,
				data: { userId, achievementId: achievement.id, achievementKey: achievement.key }
			});
			// Don't rethrow - continue processing other achievements
		}
	}

	/**
	 * Calculate achievement progress based on trigger type
	 */
	private async calculateProgress(
		achievement: Achievement,
		userId: UserId,
		eventData: any
	): Promise<AchievementProgress> {
		const config = achievement.triggerConfig as any;

		switch (achievement.triggerType) {
			case 'count':
				return await this.calculateCountProgress(achievement, userId, config);

			case 'threshold':
				return await this.calculateThresholdProgress(achievement, userId, config);

			case 'event':
				return await this.calculateEventProgress(achievement, userId, config, eventData);

			case 'composite':
				return await this.calculateCompositeProgress(achievement, userId, config);

			case 'custom':
				return await this.calculateCustomProgress(achievement, userId, config, eventData);

			default:
				return { current: 0, target: 1, percentage: 0, isCompleted: false };
		}
	}

	/**
	 * Calculate progress for count-based achievements
	 */
	private async calculateCountProgress(
		achievement: Achievement,
		userId: UserId,
		config: any
	): Promise<AchievementProgress> {
		const action = config.action;
		const target = config.target || 1;

		// Count relevant events for this user
		const eventType = this.actionToEventType(action);
		const result = await db
			.select({ count: count() })
			.from(achievementEvents)
			.where(
				and(
					eq(achievementEvents.userId, userId),
					eq(achievementEvents.eventType, eventType),
					eq(achievementEvents.processingStatus, 'completed')
				)
			);

		const current = result[0]?.count || 0;
		const percentage = Math.min((current / target) * 100, 100);

		return {
			current,
			target,
			percentage,
			isCompleted: current >= target
		};
	}

	/**
	 * Calculate progress for threshold-based achievements
	 */
	private async calculateThresholdProgress(
		achievement: Achievement,
		userId: UserId,
		config: any
	): Promise<AchievementProgress> {
		// Similar to count but may use different data sources
		const metric = config.metric;
		const target = config.target;

		// Get current value from user data or calculated metric
		const current = await this.getUserMetric(userId, metric);
		const percentage = Math.min((current / target) * 100, 100);

		return {
			current,
			target,
			percentage,
			isCompleted: current >= target
		};
	}

	/**
	 * Calculate progress for event-based achievements (single occurrence)
	 */
	private async calculateEventProgress(
		achievement: Achievement,
		userId: UserId,
		config: any,
		eventData: any
	): Promise<AchievementProgress> {
		// Check if the event conditions are met
		const conditionsMet = await this.checkEventConditions(config.conditions || [], eventData);

		return {
			current: conditionsMet ? 1 : 0,
			target: 1,
			percentage: conditionsMet ? 100 : 0,
			isCompleted: conditionsMet
		};
	}

	/**
	 * Calculate progress for composite achievements (multiple requirements)
	 */
	private async calculateCompositeProgress(
		achievement: Achievement,
		userId: UserId,
		config: any
	): Promise<AchievementProgress> {
		const requirements = config.requirements || [];
		const operator = config.operator || 'AND';

		let completedRequirements = 0;

		for (const requirement of requirements) {
			const reqProgress = await this.calculateCountProgress(achievement, userId, requirement);
			if (reqProgress.isCompleted) {
				completedRequirements++;
			}
		}

		const isCompleted =
			operator === 'AND'
				? completedRequirements === requirements.length
				: completedRequirements > 0;

		const percentage = (completedRequirements / requirements.length) * 100;

		return {
			current: completedRequirements,
			target: requirements.length,
			percentage,
			isCompleted
		};
	}

	/**
	 * Calculate progress for custom achievements using evaluators
	 */
	private async calculateCustomProgress(
		achievement: Achievement,
		userId: UserId,
		config: any,
		eventData: any
	): Promise<AchievementProgress> {
		const evaluator = config.evaluator;

		if (!this.evaluators.canHandle(evaluator)) {
			logger.warn('ACHIEVEMENT_PROCESSOR', `Unknown evaluator: ${evaluator}`);
			return { current: 0, target: 1, percentage: 0, isCompleted: false };
		}

		const isCompleted = await this.evaluators.evaluate(evaluator, userId, config.config || {});

		return {
			current: isCompleted ? 1 : 0,
			target: 1,
			percentage: isCompleted ? 100 : 0,
			isCompleted,
			data: eventData
		};
	}

	/**
	 * Complete an achievement for a user
	 */
	private async completeAchievement(
		userId: UserId,
		achievement: Achievement,
		progress: AchievementProgress
	): Promise<void> {
		try {
			// Mark achievement as completed
			await db
				.insert(userAchievements)
				.values({
					userId,
					achievementId: achievement.id,
					currentProgress: progress.data || {},
					progressPercentage: progress.percentage.toString(),
					isCompleted: true,
					completedAt: new Date(),
					completionData: {
						completedAt: new Date().toISOString(),
						finalProgress: progress
					}
				})
				.onConflictDoUpdate({
					target: [userAchievements.userId, userAchievements.achievementId],
					set: {
						isCompleted: true,
						completedAt: new Date(),
						progressPercentage: progress.percentage.toString(),
						completionData: {
							completedAt: new Date().toISOString(),
							finalProgress: progress
						}
					}
				});

			// Distribute rewards
			await this.distributeRewards(userId, achievement);

			// Log achievement completion
			logger.info(
				'ACHIEVEMENT_COMPLETED',
				`User ${userId} completed achievement ${achievement.key}`,
				{
					userId,
					achievementId: achievement.id,
					achievementKey: achievement.key,
					achievementName: achievement.name,
					rewardXp: achievement.rewardXp,
					rewardDgt: achievement.rewardDgt
				}
			);
		} catch (error) {
			await reportErrorServer(error, {
				service: 'AchievementProcessorService',
				operation: 'completeAchievement',
				action: LogAction.FAILURE,
				data: { userId, achievementId: achievement.id, achievementKey: achievement.key }
			});
			// Don't rethrow - partial failure shouldn't stop other operations
		}
	}

	/**
	 * Update achievement progress (partial completion)
	 */
	private async updateProgress(
		userId: UserId,
		achievement: Achievement,
		progress: AchievementProgress
	): Promise<void> {
		await db
			.insert(userAchievements)
			.values({
				userId,
				achievementId: achievement.id,
				currentProgress: progress.data || {},
				progressPercentage: progress.percentage.toString(),
				isCompleted: false
			})
			.onConflictDoUpdate({
				target: [userAchievements.userId, userAchievements.achievementId],
				set: {
					currentProgress: progress.data || {},
					progressPercentage: progress.percentage.toString()
				}
			});
	}

	/**
	 * Distribute rewards for completed achievement
	 */
	private async distributeRewards(userId: UserId, achievement: Achievement): Promise<void> {
		try {
			// Award XP
			if (achievement.rewardXp > 0) {
				await this.xpService.awardXP(userId, achievement.rewardXp, 'achievement_unlock');
			}

			// Award DGT (integrate with existing DGT service)
			if (achievement.rewardDgt > 0) {
				try {
					const { walletService } = await import('../../wallet/services/wallet.service');
					await walletService.creditDgt(userId, achievement.rewardDgt, {
						source: 'achievement_unlock',
						reason: `Achievement reward: ${achievement.name}`,
						achievementId: achievement.id
					});
					logger.info(
						'ACHIEVEMENT_REWARD',
						`Awarded ${achievement.rewardDgt} DGT to user ${userId} for achievement ${achievement.name}`
					);
				} catch (error) {
					await reportErrorServer(error, {
						service: 'AchievementProcessorService',
						operation: 'distributeRewards.awardDGT',
						action: LogAction.FAILURE,
						data: { userId, achievementId: achievement.id, achievementName: achievement.name, rewardDgt: achievement.rewardDgt }
					});
					// Continue to award other rewards
				}
			}

			// Award Reputation (integrate with existing Reputation service)
			if (achievement.rewardReputation > 0) {
				// TODO: Integrate with Reputation service
				logger.info(
					'ACHIEVEMENT_REWARD',
					`Would award ${achievement.rewardReputation} Reputation to user ${userId}`
				);
			}

			// TODO: Handle title and badge rewards when those systems are integrated
		} catch (error) {
			await reportErrorServer(error, {
				service: 'AchievementProcessorService',
				operation: 'distributeRewards',
				action: LogAction.FAILURE,
				data: { userId, achievementId: achievement.id, achievementName: achievement.name }
			});
			// Don't rethrow - reward distribution failure shouldn't break achievement completion
		}
	}

	/**
	 * Helper methods
	 */
	private async getUserAchievement(
		userId: UserId,
		achievementId: AchievementId
	): Promise<UserAchievement | null> {
		const result = await db
			.select()
			.from(userAchievements)
			.where(
				and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievementId))
			)
			.limit(1);

		return result[0] || null;
	}

	private async getUserMetric(userId: UserId, metric: string): Promise<number> {
		// Get user metrics from users table or calculate from events
		switch (metric) {
			case 'total_posts':
				const posts = await db
					.select({ count: count() })
					.from(achievementEvents)
					.where(
						and(
							eq(achievementEvents.userId, userId),
							eq(achievementEvents.eventType, 'post_created')
						)
					);
				return posts[0]?.count || 0;

			case 'total_threads':
				const threads = await db
					.select({ count: count() })
					.from(achievementEvents)
					.where(
						and(
							eq(achievementEvents.userId, userId),
							eq(achievementEvents.eventType, 'thread_created')
						)
					);
				return threads[0]?.count || 0;

			default:
				return 0;
		}
	}

	private async checkEventConditions(conditions: any[], eventData: any): Promise<boolean> {
		return conditions.every((condition) => {
			const fieldValue = this.getNestedValue(eventData, condition.field);

			switch (condition.operation) {
				case 'equals':
					return fieldValue === condition.value;
				case 'greater_than':
					return fieldValue > condition.value;
				case 'less_than':
					return fieldValue < condition.value;
				case 'contains':
					return String(fieldValue).includes(condition.value);
				case 'within_seconds':
					const timeDiff = Date.now() - new Date(fieldValue).getTime();
					return timeDiff <= condition.value * 1000;
				default:
					return false;
			}
		});
	}

	private getNestedValue(obj: any, path: string): any {
		return path.split('.').reduce((current, key) => current?.[key], obj);
	}

	private actionToEventType(action: string): AchievementEventType {
		const mapping: Record<string, AchievementEventType> = {
			posts_created: 'post_created',
			threads_created: 'thread_created',
			login_count: 'user_login',
			tips_sent: 'tip_sent',
			tips_received: 'tip_received',
			shoutbox_messages: 'shoutbox_message',
			likes_given: 'like_given',
			likes_received: 'like_received'
		};

		return mapping[action] || 'custom_event';
	}

	private async markEventProcessed(
		eventType: AchievementEventType,
		userId: UserId,
		eventData: any
	): Promise<void> {
		await db
			.update(achievementEvents)
			.set({
				processingStatus: 'completed',
				processedAt: new Date()
			})
			.where(
				and(
					eq(achievementEvents.userId, userId),
					eq(achievementEvents.eventType, eventType),
					eq(achievementEvents.processingStatus, 'pending')
				)
			);
	}
}
