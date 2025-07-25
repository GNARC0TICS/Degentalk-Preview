/**
 * Achievement Admin Service
 *
 * Handles administrative operations for achievements including CRUD operations,
 * bulk management, and validation. Provides backend support for admin panel.
 */

import { db } from '@db';
import { eq, and, desc, count, sql, ilike, inArray } from 'drizzle-orm';
import { achievements, userAchievements, users } from '@schema';
import type {
	Achievement,
	InsertAchievement,
	AchievementCategory,
	AchievementTier,
	AchievementTriggerType
} from '@schema';
import { logger, LogAction } from '@core/logger';
import { DegenAchievementEvaluators } from './evaluators/degen-evaluators';
import type { AchievementId, UserId } from '@shared/types/ids';
import { reportErrorServer } from '@server/lib/report-error';

export interface AchievementFilters {
	category?: AchievementCategory;
	tier?: AchievementTier;
	triggerType?: AchievementTriggerType;
	isActive?: boolean;
	isSecret?: boolean;
	search?: string;
}

export interface AchievementStats {
	totalAchievements: number;
	activeAchievements: number;
	secretAchievements: number;
	totalCompletions: number;
	categoryBreakdown: Record<AchievementCategory, number>;
	tierBreakdown: Record<AchievementTier, number>;
}

export interface AchievementWithStats extends Achievement {
	completionCount: number;
	completionRate: number;
	averageProgress: number;
}

export class AchievementAdminService {
	private evaluators = new DegenAchievementEvaluators();

	/**
	 * Get all achievements with optional filtering and pagination
	 */
	async getAchievements(
		filters: AchievementFilters = {},
		page: number = 1,
		limit: number = 50
	): Promise<{ achievements: AchievementWithStats[]; total: number }> {
		try {
			const offset = (page - 1) * limit;
			const whereConditions: any[] = [];

			// Build where conditions based on filters
			if (filters.category) {
				whereConditions.push(eq(achievements.category, filters.category));
			}
			if (filters.tier) {
				whereConditions.push(eq(achievements.tier, filters.tier));
			}
			if (filters.triggerType) {
				whereConditions.push(eq(achievements.triggerType, filters.triggerType));
			}
			if (filters.isActive !== undefined) {
				whereConditions.push(eq(achievements.isActive, filters.isActive));
			}
			if (filters.isSecret !== undefined) {
				whereConditions.push(eq(achievements.isSecret, filters.isSecret));
			}
			if (filters.search) {
				whereConditions.push(
					sql`(${achievements.name} ILIKE ${`%${filters.search}%`} OR ${achievements.description} ILIKE ${`%${filters.search}%`})`
				);
			}

			// Get achievements with stats
			const achievementResults = await db
				.select({
					...achievements,
					completionCount: sql<number>`COALESCE(completion_stats.completion_count, 0)`,
					totalUsers: sql<number>`COALESCE(user_stats.total_users, 0)`
				})
				.from(achievements)
				.leftJoin(
					sql`(
						SELECT 
							achievement_id, 
							COUNT(*) as completion_count 
						FROM user_achievements 
						WHERE is_completed = true 
						GROUP BY achievement_id
					) as completion_stats`,
					sql`completion_stats.achievement_id = ${achievements.id}`
				)
				.leftJoin(
					sql`(SELECT COUNT(DISTINCT id) as total_users FROM users) as user_stats`,
					sql`true`
				)
				.where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
				.orderBy(desc(achievements.createdAt))
				.limit(limit)
				.offset(offset);

			// Calculate additional stats
			const achievementsWithStats: AchievementWithStats[] = achievementResults.map((result) => {
				const completionRate =
					result.totalUsers > 0 ? (result.completionCount / result.totalUsers) * 100 : 0;

				return {
					...result,
					completionRate,
					averageProgress: 0 // TODO: Calculate from user_achievements progress
				};
			});

			// Get total count for pagination
			const totalResult = await db
				.select({ count: count() })
				.from(achievements)
				.where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

			return {
				achievements: achievementsWithStats,
				total: totalResult[0]?.count || 0
			};
		} catch (error) {
			await reportErrorServer(error, {
				service: 'AchievementAdminService',
				operation: 'getAchievements',
				action: LogAction.FAILURE,
				data: { filters, page, limit }
			});
			throw error;
		}
	}

	/**
	 * Get achievement statistics for dashboard
	 */
	async getAchievementStats(): Promise<AchievementStats> {
		try {
			// Get basic counts
			const totalResult = await db.select({ count: count() }).from(achievements);
			const activeResult = await db
				.select({ count: count() })
				.from(achievements)
				.where(eq(achievements.isActive, true));
			const secretResult = await db
				.select({ count: count() })
				.from(achievements)
				.where(eq(achievements.isSecret, true));
			const completionsResult = await db
				.select({ count: count() })
				.from(userAchievements)
				.where(eq(userAchievements.isCompleted, true));

			// Get category breakdown
			const categoryResults = await db
				.select({
					category: achievements.category,
					count: count()
				})
				.from(achievements)
				.groupBy(achievements.category);

			// Get tier breakdown
			const tierResults = await db
				.select({
					tier: achievements.tier,
					count: count()
				})
				.from(achievements)
				.groupBy(achievements.tier);

			// Build breakdowns
			const categoryBreakdown: Record<AchievementCategory, number> = {
				participation: 0,
				xp: 0,
				cultural: 0,
				secret: 0,
				social: 0,
				economy: 0,
				progression: 0,
				special: 0
			};

			const tierBreakdown: Record<AchievementTier, number> = {
				common: 0,
				rare: 0,
				epic: 0,
				legendary: 0,
				mythic: 0
			};

			categoryResults.forEach((result) => {
				categoryBreakdown[result.category as AchievementCategory] = result.count;
			});

			tierResults.forEach((result) => {
				tierBreakdown[result.tier as AchievementTier] = result.count;
			});

			return {
				totalAchievements: totalResult[0]?.count || 0,
				activeAchievements: activeResult[0]?.count || 0,
				secretAchievements: secretResult[0]?.count || 0,
				totalCompletions: completionsResult[0]?.count || 0,
				categoryBreakdown,
				tierBreakdown
			};
		} catch (error) {
			await reportErrorServer(error, {
				service: 'AchievementAdminService',
				operation: 'getAchievementStats',
				action: LogAction.FAILURE
			});
			throw error;
		}
	}

	/**
	 * Create a new achievement
	 */
	async createAchievement(
		data: Omit<InsertAchievement, 'id' | 'createdAt' | 'updatedAt'>
	): Promise<Achievement> {
		try {
			// Validate trigger configuration
			this.validateTriggerConfig(data.triggerType || 'count', data.triggerConfig as any);

			// Generate unique key if not provided
			if (!data.key) {
				data.key = this.generateAchievementKey(data.name);
			}

			const result = await db
				.insert(achievements)
				.values({
					...data,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();

			logger.info('ACHIEVEMENT_ADMIN', 'Created new achievement', {
				achievementId: result[0].id,
				key: result[0].key,
				name: result[0].name,
				category: result[0].category
			});

			return result[0];
		} catch (error) {
			await reportErrorServer(error, {
				service: 'AchievementAdminService',
				operation: 'createAchievement',
				action: LogAction.FAILURE,
				data: { achievementData: data }
			});
			throw error;
		}
	}

	/**
	 * Update an existing achievement
	 */
	async updateAchievement(
		id: AchievementId,
		data: Partial<InsertAchievement>
	): Promise<Achievement> {
		try {
			// Validate trigger configuration if provided
			if (data.triggerType && data.triggerConfig) {
				this.validateTriggerConfig(data.triggerType, data.triggerConfig as any);
			}

			const result = await db
				.update(achievements)
				.set({
					...data,
					updatedAt: new Date()
				})
				.where(eq(achievements.id, id))
				.returning();

			if (!result.length) {
				throw new Error(`Achievement with id ${id} not found`);
			}

			logger.info('ACHIEVEMENT_ADMIN', 'Updated achievement', {
				achievementId: id,
				updatedFields: Object.keys(data)
			});

			return result[0];
		} catch (error) {
			await reportErrorServer(error, {
				service: 'AchievementAdminService',
				operation: 'updateAchievement',
				action: LogAction.FAILURE,
				data: { id, updateData: data }
			});
			throw error;
		}
	}

	/**
	 * Delete an achievement (soft delete by deactivating)
	 */
	async deleteAchievement(id: AchievementId): Promise<void> {
		try {
			const result = await db
				.update(achievements)
				.set({
					isActive: false,
					updatedAt: new Date()
				})
				.where(eq(achievements.id, id))
				.returning();

			if (!result.length) {
				throw new Error(`Achievement with id ${id} not found`);
			}

			logger.info('ACHIEVEMENT_ADMIN', 'Deleted (deactivated) achievement', {
				achievementId: id,
				name: result[0].name
			});
		} catch (error) {
			await reportErrorServer(error, {
				service: 'AchievementAdminService',
				operation: 'deleteAchievement',
				action: LogAction.FAILURE,
				data: { id }
			});
			throw error;
		}
	}

	/**
	 * Bulk update achievements
	 */
	async bulkUpdateAchievements(
		ids: AchievementId[],
		updates: Partial<InsertAchievement>
	): Promise<Achievement[]> {
		try {
			const result = await db
				.update(achievements)
				.set({
					...updates,
					updatedAt: new Date()
				})
				.where(inArray(achievements.id, ids))
				.returning();

			logger.info('ACHIEVEMENT_ADMIN', 'Bulk updated achievements', {
				achievementIds: ids,
				updatedCount: result.length,
				updatedFields: Object.keys(updates)
			});

			return result;
		} catch (error) {
			await reportErrorServer(error, {
				service: 'AchievementAdminService',
				operation: 'bulkUpdateAchievements',
				action: LogAction.FAILURE,
				data: { ids, updates }
			});
			throw error;
		}
	}

	/**
	 * Get achievement by ID with detailed stats
	 */
	async getAchievementById(id: AchievementId): Promise<AchievementWithStats | null> {
		try {
			const result = await db
				.select({
					...achievements,
					completionCount: sql<number>`COALESCE(completion_stats.completion_count, 0)`,
					totalUsers: sql<number>`COALESCE(user_stats.total_users, 0)`,
					avgProgress: sql<number>`COALESCE(progress_stats.avg_progress, 0)`
				})
				.from(achievements)
				.leftJoin(
					sql`(
						SELECT 
							achievement_id, 
							COUNT(*) as completion_count 
						FROM user_achievements 
						WHERE is_completed = true 
						GROUP BY achievement_id
					) as completion_stats`,
					sql`completion_stats.achievement_id = ${achievements.id}`
				)
				.leftJoin(
					sql`(SELECT COUNT(DISTINCT id) as total_users FROM users) as user_stats`,
					sql`true`
				)
				.leftJoin(
					sql`(
						SELECT 
							achievement_id,
							AVG(CAST(progress_percentage AS DECIMAL)) as avg_progress
						FROM user_achievements 
						GROUP BY achievement_id
					) as progress_stats`,
					sql`progress_stats.achievement_id = ${achievements.id}`
				)
				.where(eq(achievements.id, id))
				.limit(1);

			if (!result.length) {
				return null;
			}

			const achievement = result[0];
			const completionRate =
				achievement.totalUsers > 0
					? (achievement.completionCount / achievement.totalUsers) * 100
					: 0;

			return {
				...achievement,
				completionRate,
				averageProgress: achievement.avgProgress
			};
		} catch (error) {
			await reportErrorServer(error, {
				service: 'AchievementAdminService',
				operation: 'getAchievementById',
				action: LogAction.FAILURE,
				data: { id }
			});
			throw error;
		}
	}

	/**
	 * Get user completions for a specific achievement
	 */
	async getAchievementCompletions(
		achievementId: AchievementId,
		page: number = 1,
		limit: number = 50
	): Promise<{ completions: any[]; total: number }> {
		try {
			const offset = (page - 1) * limit;

			const completions = await db
				.select({
					userId: userAchievements.userId,
					username: users.username,
					completedAt: userAchievements.completedAt,
					progressPercentage: userAchievements.progressPercentage,
					completionData: userAchievements.completionData
				})
				.from(userAchievements)
				.innerJoin(users, eq(userAchievements.userId, users.id))
				.where(
					and(
						eq(userAchievements.achievementId, achievementId),
						eq(userAchievements.isCompleted, true)
					)
				)
				.orderBy(desc(userAchievements.completedAt))
				.limit(limit)
				.offset(offset);

			const totalResult = await db
				.select({ count: count() })
				.from(userAchievements)
				.where(
					and(
						eq(userAchievements.achievementId, achievementId),
						eq(userAchievements.isCompleted, true)
					)
				);

			return {
				completions,
				total: totalResult[0]?.count || 0
			};
		} catch (error) {
			await reportErrorServer(error, {
				service: 'AchievementAdminService',
				operation: 'getAchievementCompletions',
				action: LogAction.FAILURE,
				data: { achievementId, page, limit }
			});
			throw error;
		}
	}

	/**
	 * Manually award achievement to user(s)
	 */
	async manuallyAwardAchievement(
		achievementId: AchievementId,
		userIds: string[],
		reason?: string
	): Promise<void> {
		try {
			const achievement = await db
				.select()
				.from(achievements)
				.where(eq(achievements.id, achievementId))
				.limit(1);

			if (!achievement.length) {
				throw new Error(`Achievement with id ${achievementId} not found`);
			}

			// Award to each user
			for (const userId of userIds) {
				await db
					.insert(userAchievements)
					.values({
						userId,
						achievementId,
						isCompleted: true,
						completedAt: new Date(),
						progressPercentage: '100',
						completionData: {
							manuallyAwarded: true,
							awardedBy: 'admin',
							reason: reason || 'Manually awarded by admin',
							awardedAt: new Date().toISOString()
						}
					})
					.onConflictDoUpdate({
						target: [userAchievements.userId, userAchievements.achievementId],
						set: {
							isCompleted: true,
							completedAt: new Date(),
							progressPercentage: '100',
							completionData: {
								manuallyAwarded: true,
								awardedBy: 'admin',
								reason: reason || 'Manually awarded by admin',
								awardedAt: new Date().toISOString()
							}
						}
					});
			}

			logger.info('ACHIEVEMENT_ADMIN', 'Manually awarded achievement', {
				achievementId,
				userIds,
				reason,
				userCount: userIds.length
			});
		} catch (error) {
			await reportErrorServer(error, {
				service: 'AchievementAdminService',
				operation: 'manuallyAwardAchievement',
				action: LogAction.FAILURE,
				data: { achievementId, userIds, reason }
			});
			throw error;
		}
	}

	/**
	 * Validate trigger configuration
	 */
	private validateTriggerConfig(triggerType: string, config: any): void {
		switch (triggerType) {
			case 'count':
				if (!config.action || typeof config.target !== 'number') {
					throw new Error('Count trigger requires action and numeric target');
				}
				break;

			case 'threshold':
				if (!config.metric || typeof config.target !== 'number') {
					throw new Error('Threshold trigger requires metric and numeric target');
				}
				break;

			case 'event':
				if (!config.eventType) {
					throw new Error('Event trigger requires eventType');
				}
				break;

			case 'composite':
				if (!Array.isArray(config.requirements) || config.requirements.length === 0) {
					throw new Error('Composite trigger requires requirements array');
				}
				break;

			case 'custom':
				if (!config.evaluator || !this.evaluators.canHandle(config.evaluator)) {
					throw new Error('Custom trigger requires valid evaluator');
				}
				break;

			case 'manual':
				// Manual triggers don't need validation
				break;

			default:
				throw new Error(`Unknown trigger type: ${triggerType}`);
		}
	}

	/**
	 * Generate a unique key from achievement name
	 */
	private generateAchievementKey(name: string): string {
		return name
			.toLowerCase()
			.replace(/[^a-z0-9\s]/g, '')
			.replace(/\s+/g, '_')
			.substring(0, 100);
	}
}
