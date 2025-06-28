/**
 * Gamification Analytics Controller
 *
 * API endpoints for comprehensive gamification analytics,
 * progression tracking, and system monitoring.
 */

import type { Request, Response } from 'express';
import { z } from 'zod';
import { gamificationAnalyticsService, GamificationAnalyticsService } from './analytics.service';
import { logger } from '../../core/logger';
import { AppError } from '../../core/errors';

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

			res.json({
				success: true,
				data: dashboard,
				meta: {
					timeframe,
					generatedAt: new Date().toISOString(),
					version: '1.0.0'
				}
			});
		} catch (error) {
			logger.error('ANALYTICS_CONTROLLER', 'Error getting dashboard:', error);
			if (error instanceof z.ZodError) {
				res.status(400).json({
					success: false,
					error: 'Validation error',
					details: error.errors
				});
			} else {
				res.status(500).json({
					success: false,
					error: 'Internal server error'
				});
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
			res.json({
				success: true,
				data: {
					overview: dashboard.overview,
					topPerformers: dashboard.topPerformers.slice(0, 5), // Top 5 only
					quickStats: {
						avgLevel: dashboard.progression.avgLevelGain,
						completionRate: dashboard.achievements.avgCompletionRate,
						activeUsers: dashboard.engagement.uniqueUsers
					}
				},
				meta: {
					timeframe,
					generatedAt: new Date().toISOString()
				}
			});
		} catch (error) {
			logger.error('ANALYTICS_CONTROLLER', 'Error getting overview:', error);
			res.status(500).json({
				success: false,
				error: 'Internal server error'
			});
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

			res.json({
				success: true,
				data: {
					progression: dashboard.progression,
					trends: {
						xpGrowth: dashboard.trends.xpGrowth
					}
				},
				meta: {
					timeframe,
					generatedAt: new Date().toISOString()
				}
			});
		} catch (error) {
			logger.error('ANALYTICS_CONTROLLER', 'Error getting progression metrics:', error);
			res.status(500).json({
				success: false,
				error: 'Internal server error'
			});
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

			res.json({
				success: true,
				data: {
					achievements: dashboard.achievements,
					trends: {
						completionRates: dashboard.trends.completionRates.map((t) => ({
							date: t.date,
							achievements: t.achievements
						}))
					}
				},
				meta: {
					timeframe,
					generatedAt: new Date().toISOString()
				}
			});
		} catch (error) {
			logger.error('ANALYTICS_CONTROLLER', 'Error getting achievement metrics:', error);
			res.status(500).json({
				success: false,
				error: 'Internal server error'
			});
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

			res.json({
				success: true,
				data: {
					missions: dashboard.missions,
					trends: {
						completionRates: dashboard.trends.completionRates.map((t) => ({
							date: t.date,
							missions: t.missions
						}))
					}
				},
				meta: {
					timeframe,
					generatedAt: new Date().toISOString()
				}
			});
		} catch (error) {
			logger.error('ANALYTICS_CONTROLLER', 'Error getting mission metrics:', error);
			res.status(500).json({
				success: false,
				error: 'Internal server error'
			});
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

			res.json({
				success: true,
				data: {
					engagement: dashboard.engagement,
					trends: {
						userActivity: dashboard.trends.userActivity
					}
				},
				meta: {
					timeframe,
					generatedAt: new Date().toISOString()
				}
			});
		} catch (error) {
			logger.error('ANALYTICS_CONTROLLER', 'Error getting engagement metrics:', error);
			res.status(500).json({
				success: false,
				error: 'Internal server error'
			});
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

			res.json({
				success: true,
				data: dashboard.trends,
				meta: {
					timeframe,
					generatedAt: new Date().toISOString(),
					dataPoints: dashboard.trends.xpGrowth.length
				}
			});
		} catch (error) {
			logger.error('ANALYTICS_CONTROLLER', 'Error getting trends:', error);
			res.status(500).json({
				success: false,
				error: 'Internal server error'
			});
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

			res.json({
				success: true,
				data: {
					performers: topPerformers,
					stats: {
						totalEntries: topPerformers.length,
						avgLevel: topPerformers.reduce((sum, p) => sum + p.level, 0) / topPerformers.length,
						avgXp: topPerformers.reduce((sum, p) => sum + p.xp, 0) / topPerformers.length,
						avgAchievements:
							topPerformers.reduce((sum, p) => sum + p.achievements, 0) / topPerformers.length
					}
				},
				meta: {
					limit,
					generatedAt: new Date().toISOString()
				}
			});
		} catch (error) {
			logger.error('ANALYTICS_CONTROLLER', 'Error getting top performers:', error);
			res.status(500).json({
				success: false,
				error: 'Internal server error'
			});
		}
	}

	/**
	 * GET /api/gamification/analytics/health
	 * Get system health and performance metrics
	 */
	async getSystemHealth(req: Request, res: Response) {
		try {
			const health = await this.service.getSystemHealth();

			res.json({
				success: true,
				data: health,
				status: health.responseTime < 1000 ? 'healthy' : 'degraded'
			});
		} catch (error) {
			logger.error('ANALYTICS_CONTROLLER', 'Error getting system health:', error);
			res.status(500).json({
				success: false,
				error: 'System health check failed',
				status: 'unhealthy'
			});
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
				res.json(exportData);
			} else {
				// CSV format
				res.setHeader('Content-Type', 'text/csv');
				res.setHeader(
					'Content-Disposition',
					`attachment; filename="gamification-analytics-${timeframe}.csv"`
				);
				res.send(exportData.data || 'CSV export not implemented');
			}
		} catch (error) {
			logger.error('ANALYTICS_CONTROLLER', 'Error exporting analytics:', error);
			if (error instanceof z.ZodError) {
				res.status(400).json({
					success: false,
					error: 'Validation error',
					details: error.errors
				});
			} else {
				res.status(500).json({
					success: false,
					error: 'Internal server error'
				});
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

			res.json({
				success: true,
				data: summary,
				meta: {
					generatedAt: new Date().toISOString(),
					period: 'week'
				}
			});
		} catch (error) {
			logger.error('ANALYTICS_CONTROLLER', 'Error getting summary:', error);
			res.status(500).json({
				success: false,
				error: 'Internal server error'
			});
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

			res.json({
				success: true,
				data: {
					message: 'Real-time activity tracking - to be implemented',
					placeholder: true,
					lastUpdate: new Date().toISOString()
				}
			});
		} catch (error) {
			logger.error('ANALYTICS_CONTROLLER', 'Error getting real-time activity:', error);
			res.status(500).json({
				success: false,
				error: 'Internal server error'
			});
		}
	}
}

export const gamificationAnalyticsController = new GamificationAnalyticsController();
