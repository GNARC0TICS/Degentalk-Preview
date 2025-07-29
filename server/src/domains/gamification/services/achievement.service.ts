/**
 * Achievement System Service
 *
 * Handles achievement tracking, reward distribution, and progress monitoring
 * for the comprehensive gamification system.
 */

import { db } from '@db';
import { eq, and, desc, asc, gte, lte, count, sum, sql, inArray, isNull } from 'drizzle-orm';
import {
	achievements,
	userAchievements,
	users,
	badges,
	userBadges,
	titles,
	userTitles,
	transactions,
	posts,
	threads,
	xpAdjustmentLogs
} from '@schema';
import { logger, LogAction } from '@core/logger';
import { XpService } from '../../xp/xp.service';
import type { UserId, AchievementId } from '@shared/types/ids';
import { reportErrorServer } from '../../../../lib/report-error';

export interface AchievementDefinition {
	id: AchievementId;
	name: string;
	description: string;
	iconUrl?: string;
	rewardXp: number;
	rewardPoints: number;
	requirement: AchievementRequirement;
	isActive: boolean;
	rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
	category: 'social' | 'content' | 'economy' | 'progression' | 'special';
}

export interface AchievementRequirement {
	type: 'count' | 'threshold' | 'streak' | 'composite';
	action: string;
	target: number;
	timeframe?: 'daily' | 'weekly' | 'monthly' | 'lifetime';
	conditions?: Record<string, any>;
}

export interface UserAchievementProgress {
	userId: UserId;
	achievementId: AchievementId;
	currentProgress: number;
	isCompleted: boolean;
	earnedAt?: Date;
	progressPercentage: number;
	achievement: AchievementDefinition;
}

export interface AchievementStats {
	totalAchievements: number;
	completedAchievements: number;
	completionRate: number;
	totalRewardXp: number;
	totalRewardPoints: number;
	recentEarned: Array<{
		achievement: AchievementDefinition;
		earnedAt: Date;
	}>;
	categories: Record<
		string,
		{
			total: number;
			completed: number;
			rate: number;
		}
	>;
}

export class AchievementService {
	private xpService: XpService;

	constructor() {
		this.xpService = new XpService();
	}

	/**
	 * Get all available achievements
	 */
	async getAllAchievements(activeOnly: boolean = true): Promise<AchievementDefinition[]> {
		try {
			let query = db.select().from(achievements);

			if (activeOnly) {
				query = query.where(eq(achievements.isActive, true));
			}

			const achievementsData = await query.orderBy(achievements.name);

			return achievementsData.map((a) => ({
				id: a.id,
				name: a.name,
				description: a.description || '',
				iconUrl: a.iconUrl || undefined,
				rewardXp: a.rewardXp,
				rewardPoints: a.rewardPoints,
				requirement: a.requirement as AchievementRequirement,
				isActive: a.isActive,
				rarity: this.determineRarity(a.rewardXp, a.rewardPoints),
				category: this.categorizeAchievement(a.requirement as AchievementRequirement)
			}));
		} catch (error) {
			await reportErrorServer(error, {
				service: 'AchievementService',
				operation: 'getAllAchievements',
				action: LogAction.FAILURE,
				data: { activeOnly }
			});
			throw error;
		}
	}

	/**
	 * Get user's achievement progress and statistics
	 */
	async getUserAchievementStats(userId: UserId): Promise<AchievementStats> {
		try {
			// Get all achievements
			const allAchievements = await this.getAllAchievements();

			// Get user's completed achievements
			const userAchievementsData = await db
				.select({
					achievement: achievements,
					userAchievement: userAchievements
				})
				.from(userAchievements)
				.innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
				.where(eq(userAchievements.userId, userId))
				.orderBy(desc(userAchievements.earnedAt));

			const completed = userAchievementsData.length;
			const total = allAchievements.length;
			const completionRate = total > 0 ? (completed / total) * 100 : 0;

			// Calculate total rewards earned
			const totalRewardXp = userAchievementsData.reduce(
				(sum, ua) => sum + ua.achievement.rewardXp,
				0
			);
			const totalRewardPoints = userAchievementsData.reduce(
				(sum, ua) => sum + ua.achievement.rewardPoints,
				0
			);

			// Get recent achievements (last 10)
			const recentEarned = userAchievementsData.slice(0, 10).map((ua) => ({
				achievement: {
					id: ua.achievement.id,
					name: ua.achievement.name,
					description: ua.achievement.description || '',
					iconUrl: ua.achievement.iconUrl || undefined,
					rewardXp: ua.achievement.rewardXp,
					rewardPoints: ua.achievement.rewardPoints,
					requirement: ua.achievement.requirement as AchievementRequirement,
					isActive: ua.achievement.isActive,
					rarity: this.determineRarity(ua.achievement.rewardXp, ua.achievement.rewardPoints),
					category: this.categorizeAchievement(ua.achievement.requirement as AchievementRequirement)
				},
				earnedAt: ua.userAchievement.earnedAt
			}));

			// Calculate category statistics
			const categories: Record<string, { total: number; completed: number; rate: number }> = {};

			allAchievements.forEach((achievement) => {
				const category = achievement.category;
				if (!categories[category]) {
					categories[category] = { total: 0, completed: 0, rate: 0 };
				}
				categories[category].total++;
			});

			userAchievementsData.forEach((ua) => {
				const category = this.categorizeAchievement(
					ua.achievement.requirement as AchievementRequirement
				);
				if (categories[category]) {
					categories[category].completed++;
				}
			});

			Object.keys(categories).forEach((category) => {
				const cat = categories[category];
				cat.rate = cat.total > 0 ? (cat.completed / cat.total) * 100 : 0;
			});

			return {
				totalAchievements: total,
				completedAchievements: completed,
				completionRate,
				totalRewardXp,
				totalRewardPoints,
				recentEarned,
				categories
			};
		} catch (error) {
			await reportErrorServer(error, {
				service: 'AchievementService',
				operation: 'getUserAchievementStats',
				action: LogAction.FAILURE,
				data: { userId }
			});
			throw error;
		}
	}

	/**
	 * Get user's progress towards specific achievements
	 */
	async getUserAchievementProgress(
		userId: UserId,
		achievementIds?: AchievementId[]
	): Promise<UserAchievementProgress[]> {
		try {
			// Get achievements to check
			let targetAchievements = await this.getAllAchievements();

			if (achievementIds) {
				targetAchievements = targetAchievements.filter((a) => achievementIds.includes(a.id));
			}

			const progress: UserAchievementProgress[] = [];

			for (const achievement of targetAchievements) {
				// Check if user already has this achievement
				const existingAchievement = await db
					.select()
					.from(userAchievements)
					.where(
						and(
							eq(userAchievements.userId, userId),
							eq(userAchievements.achievementId, achievement.id)
						)
					)
					.limit(1);

				if (existingAchievement.length > 0) {
					// Already earned
					progress.push({
						userId,
						achievementId: achievement.id,
						currentProgress: achievement.requirement.target,
						isCompleted: true,
						earnedAt: existingAchievement[0].earnedAt,
						progressPercentage: 100,
						achievement
					});
				} else {
					// Calculate current progress
					const currentProgress = await this.calculateAchievementProgress(
						userId,
						achievement.requirement
					);
					const progressPercentage = Math.min(
						100,
						(currentProgress / achievement.requirement.target) * 100
					);

					progress.push({
						userId,
						achievementId: achievement.id,
						currentProgress,
						isCompleted: false,
						progressPercentage,
						achievement
					});
				}
			}

			return progress.sort((a, b) => b.progressPercentage - a.progressPercentage);
		} catch (error) {
			await reportErrorServer(error, {
				service: 'AchievementService',
				operation: 'getUserAchievementProgress',
				action: LogAction.FAILURE,
				data: { userId, achievementIds }
			});
			throw error;
		}
	}

	/**
	 * Check and award achievements for a user action
	 */
	async checkAndAwardAchievements(
		userId: UserId,
		actionType: string,
		metadata?: any
	): Promise<AchievementDefinition[]> {
		try {
			// Get all achievements that could be triggered by this action
			const relevantAchievements = await db
				.select()
				.from(achievements)
				.where(
					and(
						eq(achievements.isActive, true),
						sql`${achievements.requirement}->>'action' = ${actionType}`
					)
				);

			const awardedAchievements: AchievementDefinition[] = [];

			for (const achievement of relevantAchievements) {
				// Check if user already has this achievement
				const existingAchievement = await db
					.select()
					.from(userAchievements)
					.where(
						and(
							eq(userAchievements.userId, userId),
							eq(userAchievements.achievementId, achievement.id)
						)
					)
					.limit(1);

				if (existingAchievement.length > 0) {
					continue; // Already earned
				}

				// Check if requirement is met
				const requirement = achievement.requirement as AchievementRequirement;
				const currentProgress = await this.calculateAchievementProgress(userId, requirement);

				if (currentProgress >= requirement.target) {
					// Award the achievement
					await this.awardAchievement(userId, achievement.id);

					const achievementDef: AchievementDefinition = {
						id: achievement.id,
						name: achievement.name,
						description: achievement.description || '',
						iconUrl: achievement.iconUrl || undefined,
						rewardXp: achievement.rewardXp,
						rewardPoints: achievement.rewardPoints,
						requirement,
						isActive: achievement.isActive,
						rarity: this.determineRarity(achievement.rewardXp, achievement.rewardPoints),
						category: this.categorizeAchievement(requirement)
					};

					awardedAchievements.push(achievementDef);

					logger.info('ACHIEVEMENT_SERVICE', `Achievement awarded: ${achievement.name}`, {
						userId,
						achievementId: achievement.id,
						actionType,
						currentProgress
					});
				}
			}

			return awardedAchievements;
		} catch (error) {
			await reportErrorServer(error, {
				service: 'AchievementService',
				operation: 'checkAndAwardAchievements',
				action: LogAction.FAILURE,
				data: { userId, actionType, metadata }
			});
			throw error;
		}
	}

	/**
	 * Manually award an achievement to a user
	 */
	async awardAchievement(userId: UserId, achievementId: AchievementId): Promise<void> {
		try {
			const achievement = await db
				.select()
				.from(achievements)
				.where(eq(achievements.id, achievementId))
				.limit(1);

			if (achievement.length === 0) {
				throw new Error(`Achievement ${achievementId} not found`);
			}

			const achievementData = achievement[0];

			// Insert user achievement record
			await db
				.insert(userAchievements)
				.values({
					userId,
					achievementId,
					earnedAt: new Date()
				})
				.onConflictDoNothing();

			// Award XP if specified
			if (achievementData.rewardXp > 0) {
				await this.xpService.updateUserXp(userId, achievementData.rewardXp, 'add', {
					reason: `Achievement: ${achievementData.name}`,
					skipTriggers: true
				});
			}

			// Award DGT points if specified
			if (achievementData.rewardPoints > 0) {
				await db.insert(transactions).values({
					userId,
					amount: achievementData.rewardPoints,
					type: 'ACHIEVEMENT_REWARD',
					status: 'COMPLETED',
					description: `Achievement reward: ${achievementData.name}`,
					metadata: {
						achievementId,
						source: 'achievement_reward'
					}
				});
			}

			logger.info('ACHIEVEMENT_SERVICE', `Achievement awarded successfully`, {
				userId,
				achievementId,
				name: achievementData.name,
				rewardXp: achievementData.rewardXp,
				rewardPoints: achievementData.rewardPoints
			});
		} catch (error) {
			await reportErrorServer(error, {
				service: 'AchievementService',
				operation: 'awardAchievement',
				action: LogAction.FAILURE,
				data: { userId, achievementId }
			});
			throw error;
		}
	}

	/**
	 * Create a new achievement
	 */
	async createAchievement(data: {
		name: string;
		description: string;
		iconUrl?: string;
		rewardXp: number;
		rewardPoints: number;
		requirement: AchievementRequirement;
		isActive?: boolean;
	}): Promise<AchievementDefinition> {
		try {
			const result = await db
				.insert(achievements)
				.values({
					name: data.name,
					description: data.description,
					iconUrl: data.iconUrl,
					rewardXp: data.rewardXp,
					rewardPoints: data.rewardPoints,
					requirement: data.requirement,
					isActive: data.isActive ?? true
				})
				.returning();

			const achievement = result[0];

			return {
				id: achievement.id,
				name: achievement.name,
				description: achievement.description || '',
				iconUrl: achievement.iconUrl || undefined,
				rewardXp: achievement.rewardXp,
				rewardPoints: achievement.rewardPoints,
				requirement: achievement.requirement as AchievementRequirement,
				isActive: achievement.isActive,
				rarity: this.determineRarity(achievement.rewardXp, achievement.rewardPoints),
				category: this.categorizeAchievement(achievement.requirement as AchievementRequirement)
			};
		} catch (error) {
			await reportErrorServer(error, {
				service: 'AchievementService',
				operation: 'createAchievement',
				action: LogAction.FAILURE,
				data: { name: data.name, rewardXp: data.rewardXp, rewardPoints: data.rewardPoints }
			});
			throw error;
		}
	}

	/**
	 * Calculate current progress for an achievement requirement
	 */
	private async calculateAchievementProgress(
		userId: UserId,
		requirement: AchievementRequirement
	): Promise<number> {
		try {
			const { type, action, timeframe, conditions } = requirement;

			// Build time filter if specified
			let timeFilter: Date | undefined;
			if (timeframe) {
				timeFilter = new Date();
				switch (timeframe) {
					case 'daily':
						timeFilter.setDate(timeFilter.getDate() - 1);
						break;
					case 'weekly':
						timeFilter.setDate(timeFilter.getDate() - 7);
						break;
					case 'monthly':
						timeFilter.setDate(timeFilter.getDate() - 30);
						break;
					default:
						timeFilter = undefined; // lifetime
				}
			}

			switch (action) {
				case 'posts_created':
					return await this.countUserPosts(userId, timeFilter);

				case 'threads_created':
					return await this.countUserThreads(userId, timeFilter);

				case 'xp_earned':
					return await this.sumUserXp(userId, timeFilter);

				case 'consecutive_logins':
					return await this.calculateLoginStreak(userId);

				case 'level_reached':
					const user = await db
						.select({ level: users.level })
						.from(users)
						.where(eq(users.id, userId))
						.limit(1);
					return user[0]?.level || 0;

				case 'likes_received':
					// TODO: Implement when likes system is available
					return 0;

				case 'tips_given':
					return await this.countUserTips(userId, timeFilter);

				default:
					logger.warn('ACHIEVEMENT_SERVICE', `Unknown action type: ${action}`);
					return 0;
			}
		} catch (error) {
			await reportErrorServer(error, {
				service: 'AchievementService',
				operation: 'calculateAchievementProgress',
				action: LogAction.FAILURE,
				data: { userId, requirement }
			});
			return 0;
		}
	}

	/**
	 * Helper methods for progress calculation
	 */
	private async countUserPosts(userId: UserId, timeFilter?: Date): Promise<number> {
		let query = db.select({ count: count() }).from(posts).where(eq(posts.userId, userId));

		if (timeFilter) {
			query = query.where(and(eq(posts.userId, userId), gte(posts.createdAt, timeFilter)));
		}

		const result = await query;
		return result[0]?.count || 0;
	}

	private async countUserThreads(userId: UserId, timeFilter?: Date): Promise<number> {
		let query = db.select({ count: count() }).from(threads).where(eq(threads.userId, userId));

		if (timeFilter) {
			query = query.where(and(eq(threads.userId, userId), gte(threads.createdAt, timeFilter)));
		}

		const result = await query;
		return result[0]?.count || 0;
	}

	private async sumUserXp(userId: UserId, timeFilter?: Date): Promise<number> {
		let query = db
			.select({ total: sum(xpAdjustmentLogs.amount) })
			.from(xpAdjustmentLogs)
			.where(
				and(eq(xpAdjustmentLogs.userId, userId), sql`${xpAdjustmentLogs.adjustmentType} = 'add'`)
			);

		if (timeFilter) {
			query = query.where(
				and(
					eq(xpAdjustmentLogs.userId, userId),
					sql`${xpAdjustmentLogs.adjustmentType} = 'add'`,
					gte(xpAdjustmentLogs.createdAt, timeFilter)
				)
			);
		}

		const result = await query;
		return parseInt(result[0]?.total || '0');
	}

	private async calculateLoginStreak(userId: UserId): Promise<number> {
		// TODO: Implement login streak calculation
		// This would require a login tracking system
		return 0;
	}

	private async countUserTips(userId: UserId, timeFilter?: Date): Promise<number> {
		let query = db
			.select({ count: count() })
			.from(transactions)
			.where(and(eq(transactions.userId, userId), sql`${transactions.type} = 'TIP'`));

		if (timeFilter) {
			query = query.where(
				and(
					eq(transactions.userId, userId),
					sql`${transactions.type} = 'TIP'`,
					gte(transactions.updatedAt, timeFilter)
				)
			);
		}

		const result = await query;
		return result[0]?.count || 0;
	}

	/**
	 * Determine achievement rarity based on rewards
	 */
	private determineRarity(
		rewardXp: number,
		rewardPoints: number
	): 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' {
		const totalReward = rewardXp + rewardPoints * 2; // Weight points higher

		if (totalReward >= 1000) return 'mythic';
		if (totalReward >= 500) return 'legendary';
		if (totalReward >= 200) return 'epic';
		if (totalReward >= 100) return 'rare';
		return 'common';
	}

	/**
	 * Categorize achievement based on requirement type
	 */
	private categorizeAchievement(
		requirement: AchievementRequirement
	): 'social' | 'content' | 'economy' | 'progression' | 'special' {
		const { action } = requirement;

		if (action.includes('tip') || action.includes('like')) return 'social';
		if (action.includes('post') || action.includes('thread')) return 'content';
		if (action.includes('dgt') || action.includes('purchase')) return 'economy';
		if (action.includes('level') || action.includes('xp')) return 'progression';
		return 'special';
	}

	/**
	 * Get achievement leaderboard
	 */
	async getAchievementLeaderboard(limit: number = 50): Promise<
		Array<{
			userId: UserId;
			username: string;
			achievementCount: number;
			totalXpReward: number;
			totalPointsReward: number;
			rank: number;
		}>
	> {
		try {
			const leaderboard = await db
				.select({
					userId: users.id,
					username: users.username,
					achievementCount: count(userAchievements.id),
					totalXpReward: sum(achievements.rewardXp),
					totalPointsReward: sum(achievements.rewardPoints)
				})
				.from(users)
				.leftJoin(userAchievements, eq(users.id, userAchievements.userId))
				.leftJoin(achievements, eq(userAchievements.achievementId, achievements.id))
				.groupBy(users.id, users.username)
				.orderBy(desc(count(userAchievements.id)), desc(sum(achievements.rewardXp)))
				.limit(limit);

			return leaderboard.map((entry, index) => ({
				userId: entry.userId,
				username: entry.username,
				achievementCount: entry.achievementCount,
				totalXpReward: parseInt(entry.totalXpReward || '0'),
				totalPointsReward: parseInt(entry.totalPointsReward || '0'),
				rank: index + 1
			}));
		} catch (error) {
			await reportErrorServer(error, {
				service: 'AchievementService',
				operation: 'getAchievementLeaderboard',
				action: LogAction.FAILURE,
				data: { limit }
			});
			throw error;
		}
	}

	/**
	 * Create default achievements for the platform
	 */
	async createDefaultAchievements(): Promise<void> {
		const defaultAchievements = [
			{
				name: 'First Steps',
				description: 'Create your first post',
				rewardXp: 50,
				rewardPoints: 10,
				requirement: {
					type: 'count' as const,
					action: 'posts_created',
					target: 1
				}
			},
			{
				name: 'Conversation Starter',
				description: 'Create your first thread',
				rewardXp: 75,
				rewardPoints: 15,
				requirement: {
					type: 'count' as const,
					action: 'threads_created',
					target: 1
				}
			},
			{
				name: 'Prolific Poster',
				description: 'Create 100 posts',
				rewardXp: 500,
				rewardPoints: 100,
				requirement: {
					type: 'count' as const,
					action: 'posts_created',
					target: 100
				}
			},
			{
				name: 'Level Up',
				description: 'Reach level 10',
				rewardXp: 200,
				rewardPoints: 50,
				requirement: {
					type: 'threshold' as const,
					action: 'level_reached',
					target: 10
				}
			},
			{
				name: 'XP Grinder',
				description: 'Earn 10,000 XP',
				rewardXp: 1000,
				rewardPoints: 200,
				requirement: {
					type: 'threshold' as const,
					action: 'xp_earned',
					target: 10000
				}
			},
			{
				name: 'Generous Soul',
				description: 'Give 10 tips',
				rewardXp: 300,
				rewardPoints: 75,
				requirement: {
					type: 'count' as const,
					action: 'tips_given',
					target: 10
				}
			}
		];

		for (const achievementData of defaultAchievements) {
			try {
				await this.createAchievement(achievementData);
				logger.info('ACHIEVEMENT_SERVICE', `Created default achievement: ${achievementData.name}`);
			} catch (error) {
				await reportErrorServer(error, {
					service: 'AchievementService',
					operation: 'createDefaultAchievements',
					action: LogAction.FAILURE,
					data: { achievementName: achievementData.name }
				});
				// Continue to next achievement - don't break the loop
			}
		}
	}
}

export const achievementService = new AchievementService();
