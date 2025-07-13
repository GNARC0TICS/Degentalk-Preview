/**
 * Gamification Analytics Controller
 *
 * API endpoints for comprehensive gamification analytics,
 * progression tracking, and system monitoring.
 */

import type { Request, Response } from 'express';
import { z } from 'zod';
import {
	gamificationAnalyticsService,
	GamificationAnalyticsService
} from './services/analytics.service';
import { CloutTransformer } from './transformers/clout.transformer';
import {
	toPublicList,
	sendSuccessResponse,
	sendErrorResponse,
	sendTransformedResponse,
	sendTransformedListResponse
} from '@core/utils/transformer.helpers';
import { logger } from '@core/logger';
import { AppError } from '@core/errors';

// Validation schemas
const getDashboardSchema = z.object({
	timeframe: z.enum(['day', 'week', 'month']).optional().default('week')
});

const exportAnalyticsSchema = z.object({
	format: z.enum(['json', 'csv']).optional().default('json'),
	timeframe: z.enum(['week', 'month']).optional().default('week')
});

export class GamificationAnalyticsController {
	private service: GamificationAnalyticsService;

	constructor() {
		this.service = gamificationAnalyticsService;
	}

	/**
	 * GET /api/gamification/analytics/dashboard
	 * Get comprehensive gamification dashboard
	 */
	async getDashboard(req: Request, res: Response) {
		try {
			const { timeframe } = getDashboardSchema.parse(req.query);

			const dashboard = await this.service.generateDashboard(timeframe);

			sendSuccessResponse(res, dashboard, undefined, {
				timeframe,
				generatedAt: new Date().toISOString(),
				version: '1.0.0'
			});
		} catch (error) {
			logger.error('ANALYTICS_CONTROLLER', 'Error getting dashboard:', error);
			if (error instanceof z.ZodError) {
				sendErrorResponse(res, 'Validation error', 400, error.errors);
			} else {
				sendErrorResponse(res, 'Internal server error', 500);
			}
		}
	}

	/**
	 * GET /api/gamification/analytics/overview
	 * Get quick overview statistics
	 */
	async getOverview(req: Request, res: Response) {
		try {
			const timeframe = (req.query.timeframe as 'day' | 'week' | 'month') || 'week';
			const dashboard = await this.service.generateDashboard(timeframe);

			// Return just the overview section for performance
			sendSuccessResponse(
				res,
				{
					overview: dashboard.overview,
					topPerformers: dashboard.topPerformers.slice(0, 5),
					quickStats: {
						avgLevel: dashboard.progression.avgLevelGain,
						completionRate: dashboard.achievements.avgCompletionRate,
						activeUsers: dashboard.engagement.uniqueUsers
					}
				},
				undefined,
				{
					timeframe,
					generatedAt: new Date().toISOString()
				}
			);
		} catch (error) {
			logger.error('ANALYTICS_CONTROLLER', 'Error getting overview:', error);
			sendErrorResponse(res, 'Internal server error', 500);
		}
	}

	/**
	 * GET /api/gamification/analytics/progression
	 * Get detailed progression metrics
	 */
	async getProgressionMetrics(req: Request, res: Response) {
		try {
			const timeframe = (req.query.timeframe as 'day' | 'week' | 'month') || 'week';
			const dashboard = await this.service.generateDashboard(timeframe);

			sendSuccessResponse(
				res,
				{
					progression: dashboard.progression,
					trends: {
						xpGrowth: dashboard.trends.xpGrowth
					}
				},
				undefined,
				{
					timeframe,
					generatedAt: new Date().toISOString()
				}
			);
		} catch (error) {
			logger.error('ANALYTICS_CONTROLLER', 'Error getting progression metrics:', error);
			sendErrorResponse(res, 'Internal server error', 500);
		}
	}

	/**
	 * GET /api/gamification/analytics/achievements
	 * Get detailed achievement metrics
	 */
	async getAchievementMetrics(req: Request, res: Response) {
		try {
			const timeframe = (req.query.timeframe as 'day' | 'week' | 'month') || 'week';
			const dashboard = await this.service.generateDashboard(timeframe);

			sendTransformedResponse(
				res,
				{
					achievements: dashboard.achievements.map((a) => CloutTransformer.toPublicAchievement(a)),
					trends: {
						completionRates: dashboard.trends.completionRates.map((t) => ({
							date: t.date,
							achievements: t.achievements
						}))
					}
				},
				undefined,
				{
					timeframe,
					generatedAt: new Date().toISOString()
				}
			);
		} catch (error) {
			logger.error('ANALYTICS_CONTROLLER', 'Error getting achievement metrics:', error);
			sendErrorResponse(res, 'Internal server error', 500);
		}
	}

	/**
	 * GET /api/gamification/analytics/missions
	 * Get detailed mission metrics
	 */
	async getMissionMetrics(req: Request, res: Response) {
		try {
			const timeframe = (req.query.timeframe as 'day' | 'week' | 'month') || 'week';
			const dashboard = await this.service.generateDashboard(timeframe);

			sendSuccessResponse(
				res,
				{
					missions: dashboard.missions,
					trends: {
						completionRates: dashboard.trends.completionRates.map((t) => ({
							date: t.date,
							missions: t.missions
						}))
					}
				},
				undefined,
				{
					timeframe,
					generatedAt: new Date().toISOString()
				}
			);
		} catch (error) {
			logger.error('ANALYTICS_CONTROLLER', 'Error getting mission metrics:', error);
			sendErrorResponse(res, 'Internal server error', 500);
		}
	}

	/**
	 * GET /api/gamification/analytics/engagement
	 * Get detailed engagement metrics
	 */
	async getEngagementMetrics(req: Request, res: Response) {
		try {
			const timeframe = (req.query.timeframe as 'day' | 'week' | 'month') || 'week';
			const dashboard = await this.service.generateDashboard(timeframe);

			sendSuccessResponse(
				res,
				{
					engagement: dashboard.engagement,
					trends: {
						userActivity: dashboard.trends.userActivity
					}
				},
				undefined,
				{
					timeframe,
					generatedAt: new Date().toISOString()
				}
			);
		} catch (error) {
			logger.error('ANALYTICS_CONTROLLER', 'Error getting engagement metrics:', error);
			sendErrorResponse(res, 'Internal server error', 500);
		}
	}

	/**
	 * GET /api/gamification/analytics/trends
	 * Get trend data for charts and graphs
	 */
	async getTrends(req: Request, res: Response) {
		try {
			const timeframe = (req.query.timeframe as 'day' | 'week' | 'month') || 'week';
			const dashboard = await this.service.generateDashboard(timeframe);

			sendSuccessResponse(res, dashboard.trends, undefined, {
				timeframe,
				generatedAt: new Date().toISOString(),
				dataPoints: dashboard.trends.xpGrowth.length
			});
		} catch (error) {
			logger.error('ANALYTICS_CONTROLLER', 'Error getting trends:', error);
			sendErrorResponse(res, 'Internal server error', 500);
		}
	}

	/**
	 * GET /api/gamification/analytics/leaderboard
	 * Get top performers across all gamification metrics
	 */
	async getTopPerformers(req: Request, res: Response) {
		try {
			const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
			const dashboard = await this.service.generateDashboard('week');

			// Get more detailed leaderboard data
			const topPerformers = dashboard.topPerformers.slice(0, limit);

			sendSuccessResponse(
				res,
				{
					performers: topPerformers,
					stats: {
						totalEntries: topPerformers.length,
						avgLevel: topPerformers.reduce((sum, p) => sum + p.level, 0) / topPerformers.length,
						avgXp: topPerformers.reduce((sum, p) => sum + p.xp, 0) / topPerformers.length,
						avgAchievements:
							topPerformers.reduce((sum, p) => sum + p.achievements, 0) / topPerformers.length
					}
				},
				undefined,
				{
					limit,
					generatedAt: new Date().toISOString()
				}
			);
		} catch (error) {
			logger.error('ANALYTICS_CONTROLLER', 'Error getting top performers:', error);
			sendErrorResponse(res, 'Internal server error', 500);
		}
	}

	/**
	 * GET /api/gamification/analytics/health
	 * Get system health and performance metrics
	 */
	async getSystemHealth(req: Request, res: Response) {
		try {
			const health = await this.service.getSystemHealth();

			sendSuccessResponse(res, health, undefined, {
				status: health.responseTime < 1000 ? 'healthy' : 'degraded'
			});
		} catch (error) {
			logger.error('ANALYTICS_CONTROLLER', 'Error getting system health:', error);
			sendErrorResponse(res, 'System health check failed', 500, { status: 'unhealthy' });
		}
	}

	/**
	 * POST /api/gamification/analytics/export
	 * Export analytics data in various formats
	 */
	async exportAnalytics(req: Request, res: Response) {
		try {
			const { format, timeframe } = exportAnalyticsSchema.parse(req.body);

			const exportData = await this.service.exportAnalytics(format, timeframe);

			if (format === 'json') {
				sendSuccessResponse(res, exportData);
			} else {
				// CSV format
				res.setHeader('Content-Type', 'text/csv');
				res.setHeader(
					'Content-Disposition',
					`attachment; filename="gamification-analytics-${timeframe}.csv"`
				);
				res.end(exportData.data || 'CSV export not implemented');
			}
		} catch (error) {
			logger.error('ANALYTICS_CONTROLLER', 'Error exporting analytics:', error);
			if (error instanceof z.ZodError) {
				sendErrorResponse(res, 'Validation error', 400, error.errors);
			} else {
				sendErrorResponse(res, 'Internal server error', 500);
			}
		}
	}

	/**
	 * GET /api/gamification/analytics/summary
	 * Get a quick summary of all metrics for widget displays
	 */
	async getSummary(req: Request, res: Response) {
		try {
			const dashboard = await this.service.generateDashboard('week');

			const summary = {
				users: {
					total: dashboard.overview.totalUsers,
					active: dashboard.overview.activeToday,
					growth: dashboard.progression.progressionRate
				},
				activity: {
					levelUps: dashboard.overview.levelUpsToday,
					achievements: dashboard.overview.achievementsEarned,
					missions: dashboard.overview.missionsCompleted,
					xpAwarded: dashboard.overview.totalXpAwarded
				},
				performance: {
					avgLevel: dashboard.progression.avgLevelGain,
					completionRate: dashboard.achievements.avgCompletionRate,
					engagement: dashboard.engagement.uniqueUsers
				},
				trends: {
					direction: 'up', // TODO: Calculate actual trend direction
					strength: 'moderate',
					confidence: 85
				}
			};

			sendSuccessResponse(res, summary, undefined, {
				generatedAt: new Date().toISOString(),
				period: 'week'
			});
		} catch (error) {
			logger.error('ANALYTICS_CONTROLLER', 'Error getting summary:', error);
			sendErrorResponse(res, 'Internal server error', 500);
		}
	}

	/**
	 * GET /api/gamification/analytics/real-time
	 * Get real-time activity feed
	 */
	async getRealTimeActivity(req: Request, res: Response) {
		try {
			// TODO: Implement real-time activity tracking
			// This would typically use WebSocket or Server-Sent Events

			sendSuccessResponse(res, {
				message: 'Real-time activity tracking - to be implemented',
				placeholder: true,
				lastUpdate: new Date().toISOString()
			});
		} catch (error) {
			logger.error('ANALYTICS_CONTROLLER', 'Error getting real-time activity:', error);
			sendErrorResponse(res, 'Internal server error', 500);
		}
	}
}

export const gamificationAnalyticsController = new GamificationAnalyticsController();
