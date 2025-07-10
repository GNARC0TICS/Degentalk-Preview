/**
 * Gamification Analytics Service
 *
 * Comprehensive analytics and reporting for all gamification systems:
 * - User progression tracking
 * - Achievement completion analytics
 * - Mission engagement metrics
 * - Leveling progression insights
 * - System performance monitoring
 */

import { db } from '@db';
import { eq, and, desc, gte, count, sum, avg, sql } from 'drizzle-orm';
import {
	users,
	levels,
	achievements,
	userAchievements,
	missions,
	userMissionProgress,
	xpAdjustmentLogs,
	transactions
} from '@schema';
import { logger } from '../../../core/logger';
import type { UserId, AchievementId } from '@shared/types/ids';

export interface ProgressionMetrics {
	period: string;
	totalUsers: number;
	activeUsers: number;
	avgLevelGain: number;
	avgXpGain: number;
	levelUps: number;
	topLevelReached: number;
	progressionRate: number; // Users progressing vs stagnating
}

export interface AchievementMetrics {
	period: string;
	totalAchievements: number;
	totalCompletions: number;
	avgCompletionRate: number;
	popularAchievements: Array<{
		achievementId: AchievementId;
		name: string;
		completions: number;
		completionRate: number;
	}>;
	rareAchievements: Array<{
		achievementId: AchievementId;
		name: string;
		completions: number;
		rarity: number;
	}>;
}

export interface MissionMetrics {
	period: string;
	totalMissions: number;
	totalCompletions: number;
	dailyMissionRate: number;
	weeklyMissionRate: number;
	avgCompletionTime: number;
	streakData: {
		avgStreak: number;
		maxStreak: number;
		usersWithStreaks: number;
	};
}

export interface EngagementMetrics {
	period: string;
	totalEngagements: number;
	uniqueUsers: number;
	avgSessionLength: number;
	retentionRate: number;
	churnRate: number;
	powerUsers: number; // Users in top 10% of activity
}

export interface SystemHealth {
	timestamp: string;
	responseTime: number;
	errorRate: number;
	throughput: number;
	memoryUsage: number;
	alerts: Array<{
		type: 'warning' | 'error' | 'info';
		message: string;
		timestamp: string;
	}>;
}

export interface GamificationDashboard {
	overview: {
		totalUsers: number;
		activeToday: number;
		levelUpsToday: number;
		achievementsEarned: number;
		missionsCompleted: number;
		totalXpAwarded: number;
	};
	progression: ProgressionMetrics;
	achievements: AchievementMetrics;
	missions: MissionMetrics;
	engagement: EngagementMetrics;
	topPerformers: Array<{
		userId: UserId;
		username: string;
		level: number;
		xp: number;
		achievements: number;
		rank: number;
	}>;
	trends: {
		xpGrowth: Array<{ date: string; value: number }>;
		userActivity: Array<{ date: string; value: number }>;
		completionRates: Array<{ date: string; achievements: number; missions: number }>;
	};
}

export class GamificationAnalyticsService {
	/**
	 * Generate comprehensive gamification dashboard
	 */
	async generateDashboard(
		timeframe: 'day' | 'week' | 'month' = 'week'
	): Promise<GamificationDashboard> {
		try {
			const timeFilter = this.getTimeFilter(timeframe);

			// Parallel data fetching for performance
			const [
				overview,
				progressionMetrics,
				achievementMetrics,
				missionMetrics,
				engagementMetrics,
				topPerformers,
				trends
			] = await Promise.all([
				this.getOverviewStats(timeFilter),
				this.getProgressionMetrics(timeframe, timeFilter),
				this.getAchievementMetrics(timeframe, timeFilter),
				this.getMissionMetrics(timeframe, timeFilter),
				this.getEngagementMetrics(timeframe, timeFilter),
				this.getTopPerformers(10),
				this.getTrendData(timeframe)
			]);

			return {
				overview,
				progression: progressionMetrics,
				achievements: achievementMetrics,
				missions: missionMetrics,
				engagement: engagementMetrics,
				topPerformers,
				trends
			};
		} catch (error) {
			logger.error('ANALYTICS_SERVICE', 'Error generating dashboard:', error);
			throw error;
		}
	}

	/**
	 * Get overview statistics
	 */
	private async getOverviewStats(timeFilter: Date) {
		const [
			totalUsers,
			activeToday,
			levelUpsToday,
			achievementsEarned,
			missionsCompleted,
			totalXpAwarded
		] = await Promise.all([
			db.select({ count: count() }).from(users),

			db
				.select({ count: count() })
				.from(users)
				.where(gte(users.lastLoginAt || users.createdAt, timeFilter)),

			db
				.select({ count: count() })
				.from(xpAdjustmentLogs)
				.where(
					and(
						gte(xpAdjustmentLogs.createdAt, timeFilter),
						sql`${xpAdjustmentLogs.reason} LIKE '%Level up%'`
					)
				),

			db
				.select({ count: count() })
				.from(userAchievements)
				.where(gte(userAchievements.earnedAt, timeFilter)),

			db
				.select({ count: count() })
				.from(userMissionProgress)
				.where(
					and(
						eq(userMissionProgress.isCompleted, true),
						gte(userMissionProgress.completedAt || userMissionProgress.updatedAt, timeFilter)
					)
				),

			db
				.select({ total: sum(xpAdjustmentLogs.amount) })
				.from(xpAdjustmentLogs)
				.where(
					and(
						gte(xpAdjustmentLogs.createdAt, timeFilter),
						sql`${xpAdjustmentLogs.adjustmentType} = 'add'`
					)
				)
		]);

		return {
			totalUsers: totalUsers[0]?.count || 0,
			activeToday: activeToday[0]?.count || 0,
			levelUpsToday: levelUpsToday[0]?.count || 0,
			achievementsEarned: achievementsEarned[0]?.count || 0,
			missionsCompleted: missionsCompleted[0]?.count || 0,
			totalXpAwarded: parseInt(totalXpAwarded[0]?.total || '0')
		};
	}

	/**
	 * Get progression metrics
	 */
	private async getProgressionMetrics(
		timeframe: string,
		timeFilter: Date
	): Promise<ProgressionMetrics> {
		// Get user level distribution changes
		const levelGains = await db
			.select({
				userId: xpAdjustmentLogs.userId,
				levelGain: count()
			})
			.from(xpAdjustmentLogs)
			.where(
				and(
					gte(xpAdjustmentLogs.createdAt, timeFilter),
					sql`${xpAdjustmentLogs.reason} LIKE '%Level up%'`
				)
			)
			.groupBy(xpAdjustmentLogs.userId);

		const xpGains = await db
			.select({
				total: sum(xpAdjustmentLogs.amount),
				avg: avg(xpAdjustmentLogs.amount),
				count: count()
			})
			.from(xpAdjustmentLogs)
			.where(
				and(
					gte(xpAdjustmentLogs.createdAt, timeFilter),
					sql`${xpAdjustmentLogs.adjustmentType} = 'add'`
				)
			);

		const topLevel = await db.select({ maxLevel: sql<number>`MAX(${users.level})` }).from(users);

		const activeUsers = await db
			.select({ count: count() })
			.from(users)
			.where(gte(users.lastLoginAt || users.createdAt, timeFilter));

		const totalUsers = await db.select({ count: count() }).from(users);

		return {
			period: timeframe,
			totalUsers: totalUsers[0]?.count || 0,
			activeUsers: activeUsers[0]?.count || 0,
			avgLevelGain:
				levelGains.length > 0
					? levelGains.reduce((sum, g) => sum + g.levelGain, 0) / levelGains.length
					: 0,
			avgXpGain: parseFloat(xpGains[0]?.avg || '0'),
			levelUps: levelGains.reduce((sum, g) => sum + g.levelGain, 0),
			topLevelReached: topLevel[0]?.maxLevel || 0,
			progressionRate:
				totalUsers[0]?.count > 0 ? (levelGains.length / totalUsers[0].count) * 100 : 0
		};
	}

	/**
	 * Get achievement metrics
	 */
	private async getAchievementMetrics(
		timeframe: string,
		timeFilter: Date
	): Promise<AchievementMetrics> {
		const totalAchievements = await db.select({ count: count() }).from(achievements);

		const totalCompletions = await db
			.select({ count: count() })
			.from(userAchievements)
			.where(gte(userAchievements.earnedAt, timeFilter));

		// Get popular achievements
		const popularAchievements = await db
			.select({
				achievementId: achievements.id,
				name: achievements.name,
				completions: count(userAchievements.id)
			})
			.from(achievements)
			.leftJoin(userAchievements, eq(achievements.id, userAchievements.achievementId))
			.where(gte(userAchievements.earnedAt, timeFilter))
			.groupBy(achievements.id, achievements.name)
			.orderBy(desc(count(userAchievements.id)))
			.limit(10);

		// Calculate completion rates
		const totalUsers = await db.select({ count: count() }).from(users);
		const userCount = totalUsers[0]?.count || 1;

		const enrichedPopular = popularAchievements.map((a) => ({
			achievementId: a.achievementId,
			name: a.name,
			completions: a.completions,
			completionRate: (a.completions / userCount) * 100
		}));

		// Get rare achievements (low completion rate)
		const rareAchievements = enrichedPopular
			.filter((a) => a.completionRate < 5)
			.map((a) => ({
				achievementId: a.achievementId,
				name: a.name,
				completions: a.completions,
				rarity: 100 - a.completionRate
			}))
			.slice(0, 10);

		return {
			period: timeframe,
			totalAchievements: totalAchievements[0]?.count || 0,
			totalCompletions: totalCompletions[0]?.count || 0,
			avgCompletionRate:
				enrichedPopular.length > 0
					? enrichedPopular.reduce((sum, a) => sum + a.completionRate, 0) / enrichedPopular.length
					: 0,
			popularAchievements: enrichedPopular,
			rareAchievements
		};
	}

	/**
	 * Get mission metrics
	 */
	private async getMissionMetrics(timeframe: string, timeFilter: Date): Promise<MissionMetrics> {
		const totalMissions = await db.select({ count: count() }).from(missions);

		const completions = await db
			.select({
				count: count(),
				daily: sum(sql`CASE WHEN ${missions.isDaily} THEN 1 ELSE 0 END`),
				weekly: sum(sql`CASE WHEN ${missions.isWeekly} THEN 1 ELSE 0 END`)
			})
			.from(userMissionProgress)
			.innerJoin(missions, eq(userMissionProgress.missionId, missions.id))
			.where(
				and(
					eq(userMissionProgress.isCompleted, true),
					gte(userMissionProgress.completedAt || userMissionProgress.updatedAt, timeFilter)
				)
			);

		const completionData = completions[0];

		return {
			period: timeframe,
			totalMissions: totalMissions[0]?.count || 0,
			totalCompletions: completionData?.count || 0,
			dailyMissionRate: parseInt(completionData?.daily || '0'),
			weeklyMissionRate: parseInt(completionData?.weekly || '0'),
			avgCompletionTime: 0, // TODO: Implement completion time tracking
			streakData: {
				avgStreak: 0, // TODO: Implement streak calculation
				maxStreak: 0,
				usersWithStreaks: 0
			}
		};
	}

	/**
	 * Get engagement metrics
	 */
	private async getEngagementMetrics(
		timeframe: string,
		timeFilter: Date
	): Promise<EngagementMetrics> {
		// Count unique users with any gamification activity
		const engagements = await db
			.select({
				userId: userAchievements.userId,
				achievements: count(userAchievements.id)
			})
			.from(userAchievements)
			.where(gte(userAchievements.earnedAt, timeFilter))
			.groupBy(userAchievements.userId);

		const missionEngagements = await db
			.select({
				userId: userMissionProgress.userId,
				missions: count(userMissionProgress.id)
			})
			.from(userMissionProgress)
			.where(
				and(
					eq(userMissionProgress.isCompleted, true),
					gte(userMissionProgress.completedAt || userMissionProgress.updatedAt, timeFilter)
				)
			)
			.groupBy(userMissionProgress.userId);

		const uniqueUsers = new Set([
			...engagements.map((e) => e.userId),
			...missionEngagements.map((e) => e.userId)
		]).size;

		const totalEngagements =
			engagements.reduce((sum, e) => sum + e.achievements, 0) +
			missionEngagements.reduce((sum, e) => sum + e.missions, 0);

		return {
			period: timeframe,
			totalEngagements,
			uniqueUsers,
			avgSessionLength: 0, // TODO: Implement session tracking
			retentionRate: 0, // TODO: Implement retention calculation
			churnRate: 0, // TODO: Implement churn calculation
			powerUsers: Math.floor(uniqueUsers * 0.1) // Top 10%
		};
	}

	/**
	 * Get top performers
	 */
	private async getTopPerformers(limit: number = 10) {
		const topUsers = await db
			.select({
				userId: users.id,
				username: users.username,
				level: users.level,
				xp: users.xp,
				achievements: count(userAchievements.id)
			})
			.from(users)
			.leftJoin(userAchievements, eq(users.id, userAchievements.userId))
			.groupBy(users.id, users.username, users.level, users.xp)
			.orderBy(desc(users.level), desc(users.xp))
			.limit(limit);

		return topUsers.map((user, index) => ({
			userId: user.userId,
			username: user.username,
			level: user.level,
			xp: user.xp,
			achievements: user.achievements,
			rank: index + 1
		}));
	}

	/**
	 * Get trend data for charts
	 */
	private async getTrendData(timeframe: string) {
		// Generate date range for the past period
		const dates = this.generateDateRange(timeframe);

		// TODO: Implement actual trend data queries
		// This would require daily/hourly aggregation tables for performance

		return {
			xpGrowth: dates.map((date) => ({ date, value: Math.random() * 1000 })),
			userActivity: dates.map((date) => ({ date, value: Math.random() * 100 })),
			completionRates: dates.map((date) => ({
				date,
				achievements: Math.random() * 50,
				missions: Math.random() * 30
			}))
		};
	}

	/**
	 * Helper methods
	 */
	private getTimeFilter(timeframe: 'day' | 'week' | 'month'): Date {
		const now = new Date();
		switch (timeframe) {
			case 'day':
				now.setDate(now.getDate() - 1);
				break;
			case 'week':
				now.setDate(now.getDate() - 7);
				break;
			case 'month':
				now.setDate(now.getDate() - 30);
				break;
		}
		return now;
	}

	private generateDateRange(timeframe: string): string[] {
		const dates: string[] = [];
		const now = new Date();

		const days = timeframe === 'day' ? 7 : timeframe === 'week' ? 30 : 90;

		for (let i = days; i >= 0; i--) {
			const date = new Date(now);
			date.setDate(date.getDate() - i);
			dates.push(date.toISOString().split('T')[0]);
		}

		return dates;
	}

	/**
	 * Export analytics data for external systems
	 */
	async exportAnalytics(format: 'json' | 'csv' = 'json', timeframe: 'week' | 'month' = 'week') {
		try {
			const dashboard = await this.generateDashboard(timeframe);

			if (format === 'json') {
				return {
					success: true,
					data: dashboard,
					exported_at: new Date().toISOString(),
					timeframe
				};
			}

			// TODO: Implement CSV export
			return {
				success: false,
				error: 'CSV export not yet implemented'
			};
		} catch (error) {
			logger.error('ANALYTICS_SERVICE', 'Error exporting analytics:', error);
			throw error;
		}
	}

	/**
	 * Real-time system health monitoring
	 */
	async getSystemHealth(): Promise<SystemHealth> {
		try {
			const startTime = Date.now();

			// Simple health checks
			await db.select({ count: count() }).from(users).limit(1);

			const responseTime = Date.now() - startTime;

			return {
				timestamp: new Date().toISOString(),
				responseTime,
				errorRate: 0, // TODO: Implement error rate tracking
				throughput: 0, // TODO: Implement throughput tracking
				memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
				alerts: [] // TODO: Implement alert system
			};
		} catch (error) {
			logger.error('ANALYTICS_SERVICE', 'Error getting system health:', error);
			throw error;
		}
	}
}

export const gamificationAnalyticsService = new GamificationAnalyticsService();
