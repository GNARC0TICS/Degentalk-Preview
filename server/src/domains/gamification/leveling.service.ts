/**
 * Comprehensive Leveling Service
 *
 * Handles level calculations, progression tracking, reward distribution,
 * and advancement analytics for the DegenTalk gamification system.
 */

import { db } from '@db';
import { eq, and, desc, asc, gte, lte, count, sum, sql, inArray } from 'drizzle-orm';
import {
	users,
	levels,
	xpAdjustmentLogs,
	achievements,
	userAchievements,
	badges,
	userBadges,
	titles,
	userTitles,
	transactions,
	missions,
	userMissionProgress
} from '@schema';
import { logger } from '../../core/logger';
import { XpService } from '../xp/xp.service';
import type { UserId } from '@db/types';

export interface LevelInfo {
	level: number;
	name: string;
	minXp: number;
	nextLevelXp?: number;
	iconUrl?: string;
	rarity: string;
	frameUrl?: string;
	colorTheme?: string;
	animationEffect?: string;
	unlocks?: any;
	rewards: {
		dgt?: number;
		titleId?: number;
		badgeId?: number;
	};
}

export interface UserProgression {
	userId: UserId;
	username: string;
	currentLevel: number;
	currentXp: number;
	totalXp: number;
	xpForNextLevel: number;
	progressPercentage: number;
	levelInfo: LevelInfo;
	nextLevelInfo?: LevelInfo;
	recentLevelUps: number;
	weeklyXpGain: number;
	rank: number;
	achievements: {
		total: number;
		recent: any[];
	};
	missions: {
		completed: number;
		available: number;
		streak: number;
	};
}

export interface LeaderboardEntry {
	userId: UserId;
	username: string;
	level: number;
	totalXp: number;
	weeklyXp: number;
	rank: number;
	badge?: string;
	frame?: string;
	trend: 'up' | 'down' | 'stable';
}

export interface ProgressionAnalytics {
	userDistribution: Array<{ level: number; count: number }>;
	averageProgression: {
		xpPerDay: number;
		levelsPerWeek: number;
		completionRate: number;
	};
	topPerformers: LeaderboardEntry[];
	engagementMetrics: {
		activeUsers: number;
		levelUpsToday: number;
		missionCompletions: number;
	};
}

export class LevelingService {
	private xpService: XpService;

	constructor() {
		this.xpService = new XpService();
	}

	/**
	 * Get detailed level information including rewards and visual customization
	 */
	async getLevelInfo(levelNumber: number): Promise<LevelInfo | null> {
		try {
			const levelData = await db
				.select()
				.from(levels)
				.where(eq(levels.level, levelNumber))
				.limit(1);

			if (levelData.length === 0) {
				return null;
			}

			const level = levelData[0];

			// Get next level for XP requirement calculation
			const nextLevelData = await db
				.select()
				.from(levels)
				.where(gte(levels.level, levelNumber + 1))
				.orderBy(asc(levels.level))
				.limit(1);

			return {
				level: level.level,
				name: level.name || `Level ${level.level}`,
				minXp: level.minXp,
				nextLevelXp: nextLevelData.length > 0 ? nextLevelData[0].minXp : undefined,
				iconUrl: level.iconUrl || undefined,
				rarity: level.rarity || 'common',
				frameUrl: level.frameUrl || undefined,
				colorTheme: level.colorTheme || undefined,
				animationEffect: level.animationEffect || undefined,
				unlocks: level.unlocks,
				rewards: {
					dgt: level.rewardDgt || undefined,
					titleId: level.rewardTitleId || undefined,
					badgeId: level.rewardBadgeId || undefined
				}
			};
		} catch (error) {
			logger.error('LEVELING_SERVICE', 'Error getting level info:', error);
			throw error;
		}
	}

	/**
	 * Get comprehensive user progression data
	 */
	async getUserProgression(userId: UserId): Promise<UserProgression | null> {
		try {
			// Get user basic info
			const userData = await db
				.select({
					id: users.id,
					username: users.username,
					level: users.level,
					xp: users.xp
				})
				.from(users)
				.where(eq(users.id, userId))
				.limit(1);

			if (userData.length === 0) {
				return null;
			}

			const user = userData[0];

			// Get current and next level info
			const currentLevelInfo = await this.getLevelInfo(user.level);
			const nextLevelInfo = await this.getLevelInfo(user.level + 1);

			if (!currentLevelInfo) {
				throw new Error(`Level ${user.level} not found`);
			}

			// Calculate progression
			const xpForNextLevel = nextLevelInfo ? nextLevelInfo.minXp - user.xp : 0;
			const progressPercentage = nextLevelInfo
				? ((user.xp - currentLevelInfo.minXp) / (nextLevelInfo.minXp - currentLevelInfo.minXp)) *
					100
				: 100;

			// Get recent level ups (last 30 days)
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

			const recentLevelUps = await db
				.select({ count: count() })
				.from(xpAdjustmentLogs)
				.where(
					and(
						eq(xpAdjustmentLogs.userId, userId),
						gte(xpAdjustmentLogs.createdAt, thirtyDaysAgo),
						sql`${xpAdjustmentLogs.reason} LIKE '%Level up%'`
					)
				);

			// Get weekly XP gain
			const weekAgo = new Date();
			weekAgo.setDate(weekAgo.getDate() - 7);

			const weeklyXpGain = await db
				.select({ total: sum(xpAdjustmentLogs.amount) })
				.from(xpAdjustmentLogs)
				.where(
					and(
						eq(xpAdjustmentLogs.userId, userId),
						gte(xpAdjustmentLogs.createdAt, weekAgo),
						sql`${xpAdjustmentLogs.adjustmentType} = 'add'`
					)
				);

			// Get user rank
			const higherRankedUsers = await db
				.select({ count: count() })
				.from(users)
				.where(and(sql`${users.xp} > ${user.xp}`, sql`${users.level} >= ${user.level}`));

			const rank = (higherRankedUsers[0]?.count || 0) + 1;

			// Get achievement stats
			const achievementStats = await db
				.select({ count: count() })
				.from(userAchievements)
				.where(eq(userAchievements.userId, userId));

			const recentAchievements = await db
				.select({
					achievement: achievements,
					earnedAt: userAchievements.awardedAt
				})
				.from(userAchievements)
				.innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
				.where(eq(userAchievements.userId, userId))
				.orderBy(desc(userAchievements.awardedAt))
				.limit(5);

			// Get mission stats
			const missionStats = await db
				.select({
					total: count(),
					completed: sum(sql`CASE WHEN ${userMissionProgress.isCompleted} THEN 1 ELSE 0 END`),
					streak: count() // TODO: Implement streak calculation
				})
				.from(userMissionProgress)
				.where(eq(userMissionProgress.userId, userId));

			const availableMissions = await db
				.select({ count: count() })
				.from(missions)
				.where(eq(missions.isActive, true));

			return {
				userId: user.id,
				username: user.username,
				currentLevel: user.level,
				currentXp: user.xp,
				totalXp: user.xp,
				xpForNextLevel,
				progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
				levelInfo: currentLevelInfo,
				...(nextLevelInfo ? { nextLevelInfo } : {}),
				recentLevelUps: recentLevelUps[0]?.count || 0,
				weeklyXpGain: parseInt(weeklyXpGain[0]?.total || '0'),
				rank,
				achievements: {
					total: achievementStats[0]?.count || 0,
					recent: recentAchievements.map((a: { achievement: any; earnedAt: Date }) => ({
						...a.achievement,
						earnedAt: a.earnedAt
					}))
				},
				missions: {
					completed: parseInt(missionStats[0]?.completed || '0'),
					available: availableMissions[0]?.count || 0,
					streak: parseInt(missionStats[0]?.streak || '0')
				}
			};
		} catch (error) {
			logger.error('LEVELING_SERVICE', 'Error getting user progression:', error);
			throw error;
		}
	}

	/**
	 * Get leaderboard with various sorting options
	 */
	async getLeaderboard(
		type: 'level' | 'xp' | 'weekly' | 'monthly' = 'xp',
		limit: number = 50,
		offset: number = 0
	): Promise<LeaderboardEntry[]> {
		try {
			let orderBy;
			let timeFilter;

			switch (type) {
				case 'level':
					orderBy = [desc(users.level), desc(users.xp)];
					break;
				case 'weekly':
					timeFilter = new Date();
					timeFilter.setDate(timeFilter.getDate() - 7);
					orderBy = [desc(users.xp)]; // TODO: Implement weekly XP tracking
					break;
				case 'monthly':
					timeFilter = new Date();
					timeFilter.setDate(timeFilter.getDate() - 30);
					orderBy = [desc(users.xp)]; // TODO: Implement monthly XP tracking
					break;
				default:
					orderBy = [desc(users.xp)];
			}

			const leaderboardData = await db
				.select({
					userId: users.id,
					username: users.username,
					level: users.level,
					totalXp: users.xp,
					avatarUrl: users.avatarUrl
				})
				.from(users)
				.orderBy(...orderBy)
				.limit(limit)
				.offset(offset);

			// Enrich with additional data
			const enrichedData: LeaderboardEntry[] = [];

			for (let i = 0; i < leaderboardData.length; i++) {
				const user = leaderboardData[i];

				// Get weekly XP for this user (if needed)
				let weeklyXp = 0;
				if (type === 'weekly' || type === 'monthly') {
					const timeFilter = new Date();
					timeFilter.setDate(timeFilter.getDate() - (type === 'weekly' ? 7 : 30));

					const weeklyData = await db
						.select({ total: sum(xpAdjustmentLogs.amount) })
						.from(xpAdjustmentLogs)
						.where(
							and(
								eq(xpAdjustmentLogs.userId, user.userId),
								gte(xpAdjustmentLogs.createdAt, timeFilter),
								sql`${xpAdjustmentLogs.adjustmentType} = 'add'`
							)
						);

					weeklyXp = parseInt(weeklyData[0]?.total || '0');
				}

				enrichedData.push({
					userId: user.userId,
					username: user.username,
					level: user.level,
					totalXp: user.totalXp,
					weeklyXp,
					rank: offset + i + 1,
					trend: 'stable' // TODO: Implement trend calculation
				});
			}

			return enrichedData;
		} catch (error) {
			logger.error('LEVELING_SERVICE', 'Error getting leaderboard:', error);
			throw error;
		}
	}

	/**
	 * Calculate and award level up rewards
	 */
	async processLevelUp(
		userId: UserId,
		oldLevel: number,
		newLevel: number
	): Promise<{
		rewards: any[];
		unlocks: any[];
	}> {
		try {
			const rewards: any[] = [];
			const unlocks: any[] = [];

			// Process rewards for each level gained
			for (let level = oldLevel + 1; level <= newLevel; level++) {
				const levelInfo = await this.getLevelInfo(level);
				if (!levelInfo) continue;

				// Award DGT tokens
				if (levelInfo.rewards.dgt && levelInfo.rewards.dgt > 0) {
					await db.insert(transactions).values({
						userId,
						amount: levelInfo.rewards.dgt,
						type: 'LEVEL_REWARD',
						status: 'COMPLETED',
						description: `Level ${level} DGT reward`,
						metadata: { level, source: 'level_up' }
					});

					rewards.push({
						type: 'dgt',
						amount: levelInfo.rewards.dgt,
						level
					});
				}

				// Award title
				if (levelInfo.rewards.titleId) {
					await db
						.insert(userTitles)
						.values({
							userId,
							titleId: levelInfo.rewards.titleId,
							isActive: false, // User needs to manually activate
							earnedAt: new Date()
						})
						.onConflictDoNothing();

					rewards.push({
						type: 'title',
						titleId: levelInfo.rewards.titleId,
						level
					});
				}

				// Award badge
				if (levelInfo.rewards.badgeId) {
					await db
						.insert(userBadges)
						.values({
							userId,
							badgeId: levelInfo.rewards.badgeId,
							earnedAt: new Date()
						})
						.onConflictDoNothing();

					rewards.push({
						type: 'badge',
						badgeId: levelInfo.rewards.badgeId,
						level
					});
				}

				// Process unlocks
				if (levelInfo.unlocks) {
					unlocks.push({
						level,
						unlocks: levelInfo.unlocks
					});
				}
			}

			logger.info('LEVELING_SERVICE', `Processed level up rewards for user ${userId}`, {
				oldLevel,
				newLevel,
				rewardsCount: rewards.length,
				unlocksCount: unlocks.length
			});

			return { rewards, unlocks };
		} catch (error) {
			logger.error('LEVELING_SERVICE', 'Error processing level up rewards:', error);
			throw error;
		}
	}

	/**
	 * Get progression analytics for admin dashboard
	 */
	async getProgressionAnalytics(
		timeframe: 'day' | 'week' | 'month' = 'week'
	): Promise<ProgressionAnalytics> {
		try {
			const timeFilter = new Date();
			switch (timeframe) {
				case 'day':
					timeFilter.setDate(timeFilter.getDate() - 1);
					break;
				case 'week':
					timeFilter.setDate(timeFilter.getDate() - 7);
					break;
				case 'month':
					timeFilter.setDate(timeFilter.getDate() - 30);
					break;
			}

			// User distribution by level
			const userDistribution = await db
				.select({
					level: users.level,
					count: count()
				})
				.from(users)
				.groupBy(users.level)
				.orderBy(users.level);

			// Active users count
			const activeUsers = await db
				.select({ count: count() })
				.from(users)
				.where(gte(users.lastLogin, timeFilter));

			// Level ups today
			const levelUpsToday = await db
				.select({ count: count() })
				.from(xpAdjustmentLogs)
				.where(
					and(
						gte(xpAdjustmentLogs.createdAt, timeFilter),
						sql`${xpAdjustmentLogs.reason} LIKE '%Level up%'`
					)
				);

			// Mission completions
			const missionCompletions = await db
				.select({ count: count() })
				.from(userMissionProgress)
				.where(
					and(
						eq(userMissionProgress.isCompleted, true),
						gte(userMissionProgress.completedAt || userMissionProgress.updatedAt, timeFilter)
					)
				);

			// Average progression metrics
			const avgXpPerDay = await db
				.select({ avg: sql<number>`AVG(${xpAdjustmentLogs.amount})` })
				.from(xpAdjustmentLogs)
				.where(
					and(
						gte(xpAdjustmentLogs.createdAt, timeFilter),
						sql`${xpAdjustmentLogs.adjustmentType} = 'add'`
					)
				);

			// Top performers
			const topPerformers = await this.getLeaderboard('weekly', 10);

			return {
				userDistribution: userDistribution.map((d: { level: number; count: number }) => ({
					level: d.level,
					count: d.count
				})),
				averageProgression: {
					xpPerDay: avgXpPerDay[0]?.avg || 0,
					levelsPerWeek: 0.5, // TODO: Calculate actual
					completionRate: 0.8 // TODO: Calculate actual
				},
				topPerformers,
				engagementMetrics: {
					activeUsers: activeUsers[0]?.count || 0,
					levelUpsToday: levelUpsToday[0]?.count || 0,
					missionCompletions: missionCompletions[0]?.count || 0
				}
			};
		} catch (error) {
			logger.error('LEVELING_SERVICE', 'Error getting progression analytics:', error);
			throw error;
		}
	}

	/**
	 * Create or update level configurations
	 */
	async createLevel(levelData: {
		level: number;
		minXp: number;
		name?: string;
		iconUrl?: string;
		rarity?: string;
		frameUrl?: string;
		colorTheme?: string;
		animationEffect?: string;
		unlocks?: any;
		rewardDgt?: number;
		rewardTitleId?: number;
		rewardBadgeId?: number;
	}): Promise<LevelInfo> {
		try {
			const result = await db
				.insert(levels)
				.values(levelData)
				.onConflictDoUpdate({
					target: levels.level,
					set: levelData
				})
				.returning();

			logger.info('LEVELING_SERVICE', `Created/updated level ${levelData.level}`, levelData);

			return this.getLevelInfo(result[0].level) as Promise<LevelInfo>;
		} catch (error) {
			logger.error('LEVELING_SERVICE', 'Error creating level:', error);
			throw error;
		}
	}

	/**
	 * Get all levels configuration
	 */
	async getAllLevels(): Promise<LevelInfo[]> {
		try {
			const levelsData = await db.select().from(levels).orderBy(asc(levels.level));

			const levelInfos: LevelInfo[] = [];
			for (const level of levelsData) {
				const levelInfo = await this.getLevelInfo(level.level);
				if (levelInfo) {
					levelInfos.push(levelInfo);
				}
			}

			return levelInfos;
		} catch (error) {
			logger.error('LEVELING_SERVICE', 'Error getting all levels:', error);
			throw error;
		}
	}

	/**
	 * Calculate optimal XP curve for balanced progression
	 */
	async generateXpCurve(
		maxLevel: number = 100,
		baseXp: number = 100
	): Promise<Array<{ level: number; minXp: number }>> {
		const curve: Array<{ level: number; minXp: number }> = [];

		for (let level = 1; level <= maxLevel; level++) {
			// Exponential curve with diminishing returns
			const multiplier = Math.pow(level, 1.8) * 1.2;
			const minXp = Math.floor(baseXp * multiplier);

			curve.push({ level, minXp });
		}

		return curve;
	}

	/**
	 * Bulk import levels from XP curve
	 */
	async importXpCurve(curve: Array<{ level: number; minXp: number }>): Promise<void> {
		try {
			const levelValues = curve.map((c) => ({
				level: c.level,
				minXp: c.minXp,
				name: `Level ${c.level}`,
				rarity: this.getLevelRarity(c.level)
			}));

			await db.insert(levels).values(levelValues).onConflictDoNothing();

			logger.info('LEVELING_SERVICE', `Imported ${curve.length} levels`, {
				maxLevel: Math.max(...curve.map((c) => c.level)),
				maxXp: Math.max(...curve.map((c) => c.minXp))
			});
		} catch (error) {
			logger.error('LEVELING_SERVICE', 'Error importing XP curve:', error);
			throw error;
		}
	}

	/**
	 * Helper to determine level rarity based on level number
	 */
	private getLevelRarity(level: number): string {
		if (level >= 90) return 'mythic';
		if (level >= 75) return 'legendary';
		if (level >= 50) return 'epic';
		if (level >= 25) return 'rare';
		return 'common';
	}
}

export const levelingService = new LevelingService();
