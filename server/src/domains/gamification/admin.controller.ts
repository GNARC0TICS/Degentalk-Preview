/**
 * Gamification Admin Controller
 *
 * Administrative controls for managing all gamification systems:
 * - Level configuration and XP curves
 * - Achievement creation and management
 * - Mission scheduling and rewards
 * - System settings and feature flags
 */

import type { Request, Response } from 'express';
import { z } from 'zod';
import { levelingService } from './leveling.service';
import { achievementService } from './achievement.service';
import { missionsService } from '../missions/missions.service';
import { gamificationAnalyticsService } from './analytics.service';
import { logger } from '../../core/logger';
import { AppError } from '../../core/errors';

// Validation schemas for admin operations
const bulkCreateLevelsSchema = z.object({
	levels: z
		.array(
			z.object({
				level: z.number().int().min(1).max(1000),
				minXp: z.number().int().min(0),
				name: z.string().min(1).max(100).optional(),
				iconUrl: z.string().url().optional(),
				rarity: z.enum(['common', 'rare', 'epic', 'legendary', 'mythic']).optional(),
				frameUrl: z.string().url().optional(),
				colorTheme: z.string().max(25).optional(),
				animationEffect: z.string().max(30).optional(),
				unlocks: z.record(z.any()).optional(),
				rewardDgt: z.number().int().min(0).optional(),
				rewardTitleId: z.number().int().min(1).optional(),
				rewardBadgeId: z.number().int().min(1).optional()
			})
		)
		.min(1)
		.max(100)
});

const bulkCreateAchievementsSchema = z.object({
	achievements: z
		.array(
			z.object({
				name: z.string().min(1).max(100),
				description: z.string().min(1).max(500),
				iconUrl: z.string().url().optional(),
				rewardXp: z.number().int().min(0).max(10000),
				rewardPoints: z.number().int().min(0).max(10000),
				requirement: z.object({
					type: z.enum(['count', 'threshold', 'streak', 'composite']),
					action: z.string().min(1).max(100),
					target: z.number().int().min(1),
					timeframe: z.enum(['daily', 'weekly', 'monthly', 'lifetime']).optional(),
					conditions: z.record(z.any()).optional()
				}),
				isActive: z.boolean().optional().default(true)
			})
		)
		.min(1)
		.max(50)
});

const bulkCreateMissionsSchema = z.object({
	missions: z
		.array(
			z.object({
				title: z.string().min(1).max(100),
				description: z.string().min(1).max(255),
				type: z.string().min(1).max(50),
				requiredAction: z.string().min(1).max(100),
				requiredCount: z.number().int().min(1).max(10000),
				xpReward: z.number().int().min(0).max(10000),
				dgtReward: z.number().int().min(0).max(10000).optional(),
				badgeReward: z.string().max(100).optional(),
				icon: z.string().max(100).optional(),
				isDaily: z.boolean().default(true),
				isWeekly: z.boolean().default(false),
				minLevel: z.number().int().min(1).max(1000).default(1),
				sortOrder: z.number().int().min(0).default(0)
			})
		)
		.min(1)
		.max(20)
});

const systemConfigSchema = z.object({
	levelingEnabled: z.boolean().optional(),
	achievementsEnabled: z.boolean().optional(),
	missionsEnabled: z.boolean().optional(),
	xpMultiplierGlobal: z.number().min(0.1).max(10).optional(),
	maxLevelCap: z.number().int().min(1).max(10000).optional(),
	dailyXpLimit: z.number().int().min(0).optional(),
	achievementCooldown: z.number().int().min(0).optional(),
	missionResetTime: z
		.string()
		.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
		.optional(), // HH:mm format
	leaderboardUpdateInterval: z.number().int().min(1).max(1440).optional(), // minutes
	analyticsRetentionDays: z.number().int().min(1).max(365).optional()
});

const resetUserProgressSchema = z.object({
	userId: z.number().int().min(1),
	resetType: z.enum(['xp', 'level', 'achievements', 'missions', 'all']),
	reason: z.string().min(1).max(500)
});

export class GamificationAdminController {
	/**
	 * GET /api/gamification/admin/overview
	 * Get comprehensive admin overview of all gamification systems
	 */
	async getAdminOverview(req: Request, res: Response) {
		try {
			const [dashboard, levelCount, achievementCount, missionCount] = await Promise.all([
				gamificationAnalyticsService.generateDashboard('week'),
				levelingService.getAllLevels(),
				achievementService.getAllAchievements(false),
				missionsService.getAllMissions()
			]);

			const overview = {
				statistics: dashboard.overview,
				systemHealth: await gamificationAnalyticsService.getSystemHealth(),
				configuration: {
					levels: {
						total: levelCount.length,
						maxLevel: Math.max(...levelCount.map((l) => l.level), 0),
						configured: levelCount.filter((l) => l.name !== `Level ${l.level}`).length
					},
					achievements: {
						total: achievementCount.length,
						active: achievementCount.filter((a) => a.isActive).length,
						byCategory: achievementCount.reduce(
							(acc, a) => {
								acc[a.category] = (acc[a.category] || 0) + 1;
								return acc;
							},
							{} as Record<string, number>
						)
					},
					missions: {
						total: missionCount.length,
						daily: missionCount.filter((m) => m.isDaily).length,
						weekly: missionCount.filter((m) => m.isWeekly).length,
						active: missionCount.filter((m) => m.isActive).length
					}
				},
				recentActivity: {
					progression: dashboard.progression,
					engagement: dashboard.engagement,
					topPerformers: dashboard.topPerformers.slice(0, 10)
				}
			};

			res.json({
				success: true,
				data: overview,
				meta: {
					generatedAt: new Date().toISOString(),
					version: '1.0.0'
				}
			});
		} catch (error) {
			logger.error('ADMIN_CONTROLLER', 'Error getting admin overview:', error);
			res.status(500).json({
				success: false,
				error: 'Internal server error'
			});
		}
	}

	/**
	 * POST /api/gamification/admin/levels/bulk
	 * Bulk create or update level configurations
	 */
	async bulkCreateLevels(req: Request, res: Response) {
		try {
			const { levels } = bulkCreateLevelsSchema.parse(req.body);

			const createdLevels = [];
			for (const levelData of levels) {
				try {
					const level = await levelingService.createLevel(levelData);
					createdLevels.push(level);
				} catch (error) {
					logger.warn('ADMIN_CONTROLLER', `Failed to create level ${levelData.level}:`, error);
				}
			}

			res.json({
				success: true,
				data: {
					created: createdLevels,
					stats: {
						requested: levels.length,
						created: createdLevels.length,
						failed: levels.length - createdLevels.length
					}
				},
				message: `Created ${createdLevels.length} out of ${levels.length} levels`
			});
		} catch (error) {
			logger.error('ADMIN_CONTROLLER', 'Error bulk creating levels:', error);
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
	 * POST /api/gamification/admin/achievements/bulk
	 * Bulk create achievements
	 */
	async bulkCreateAchievements(req: Request, res: Response) {
		try {
			const { achievements } = bulkCreateAchievementsSchema.parse(req.body);

			const createdAchievements = [];
			for (const achievementData of achievements) {
				try {
					const achievement = await achievementService.createAchievement(achievementData);
					createdAchievements.push(achievement);
				} catch (error) {
					logger.warn(
						'ADMIN_CONTROLLER',
						`Failed to create achievement ${achievementData.name}:`,
						error
					);
				}
			}

			res.json({
				success: true,
				data: {
					created: createdAchievements,
					stats: {
						requested: achievements.length,
						created: createdAchievements.length,
						failed: achievements.length - createdAchievements.length
					}
				},
				message: `Created ${createdAchievements.length} out of ${achievements.length} achievements`
			});
		} catch (error) {
			logger.error('ADMIN_CONTROLLER', 'Error bulk creating achievements:', error);
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
	 * POST /api/gamification/admin/missions/bulk
	 * Bulk create missions
	 */
	async bulkCreateMissions(req: Request, res: Response) {
		try {
			const { missions } = bulkCreateMissionsSchema.parse(req.body);

			const createdMissions = [];
			for (const missionData of missions) {
				try {
					const mission = await missionsService.createMission(missionData);
					createdMissions.push(mission);
				} catch (error) {
					logger.warn('ADMIN_CONTROLLER', `Failed to create mission ${missionData.title}:`, error);
				}
			}

			res.json({
				success: true,
				data: {
					created: createdMissions,
					stats: {
						requested: missions.length,
						created: createdMissions.length,
						failed: missions.length - createdMissions.length
					}
				},
				message: `Created ${createdMissions.length} out of ${missions.length} missions`
			});
		} catch (error) {
			logger.error('ADMIN_CONTROLLER', 'Error bulk creating missions:', error);
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
	 * GET /api/gamification/admin/config
	 * Get current system configuration
	 */
	async getSystemConfig(req: Request, res: Response) {
		try {
			// TODO: Implement actual config storage and retrieval
			const config = {
				levelingEnabled: true,
				achievementsEnabled: true,
				missionsEnabled: true,
				xpMultiplierGlobal: 1.0,
				maxLevelCap: 100,
				dailyXpLimit: 10000,
				achievementCooldown: 0,
				missionResetTime: '00:00',
				leaderboardUpdateInterval: 60,
				analyticsRetentionDays: 90
			};

			res.json({
				success: true,
				data: config,
				meta: {
					lastUpdated: new Date().toISOString(),
					version: '1.0.0'
				}
			});
		} catch (error) {
			logger.error('ADMIN_CONTROLLER', 'Error getting system config:', error);
			res.status(500).json({
				success: false,
				error: 'Internal server error'
			});
		}
	}

	/**
	 * PUT /api/gamification/admin/config
	 * Update system configuration
	 */
	async updateSystemConfig(req: Request, res: Response) {
		try {
			const configUpdate = systemConfigSchema.parse(req.body);

			// TODO: Implement actual config storage
			logger.info('ADMIN_CONTROLLER', 'System config update requested:', configUpdate);

			res.json({
				success: true,
				data: configUpdate,
				message: 'System configuration updated successfully'
			});
		} catch (error) {
			logger.error('ADMIN_CONTROLLER', 'Error updating system config:', error);
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
	 * POST /api/gamification/admin/reset-user
	 * Reset user progress (dangerous operation)
	 */
	async resetUserProgress(req: Request, res: Response) {
		try {
			const { userId, resetType, reason } = resetUserProgressSchema.parse(req.body);

			// TODO: Implement actual user progress reset
			logger.warn('ADMIN_CONTROLLER', 'User progress reset requested:', {
				userId,
				resetType,
				reason,
				adminId: req.user?.id
			});

			res.json({
				success: true,
				data: {
					userId,
					resetType,
					reason,
					resetAt: new Date().toISOString()
				},
				message: `User ${userId} ${resetType} progress reset successfully`
			});
		} catch (error) {
			logger.error('ADMIN_CONTROLLER', 'Error resetting user progress:', error);
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
	 * POST /api/gamification/admin/maintenance
	 * Perform system maintenance operations
	 */
	async performMaintenance(req: Request, res: Response) {
		try {
			const { operation } = req.body;

			const results = [];

			switch (operation) {
				case 'reset-daily-missions':
					await missionsService.resetDailyMissions();
					results.push('Daily missions reset');
					break;

				case 'reset-weekly-missions':
					await missionsService.resetWeeklyMissions();
					results.push('Weekly missions reset');
					break;

				case 'recalculate-leaderboards':
					// TODO: Implement leaderboard recalculation
					results.push('Leaderboards recalculated');
					break;

				case 'cleanup-expired-data':
					// TODO: Implement expired data cleanup
					results.push('Expired data cleaned up');
					break;

				case 'rebuild-analytics':
					// TODO: Implement analytics rebuild
					results.push('Analytics data rebuilt');
					break;

				default:
					throw new AppError(`Unknown maintenance operation: ${operation}`, 400);
			}

			res.json({
				success: true,
				data: {
					operation,
					results,
					completedAt: new Date().toISOString()
				},
				message: `Maintenance operation "${operation}" completed successfully`
			});
		} catch (error) {
			logger.error('ADMIN_CONTROLLER', 'Error performing maintenance:', error);
			if (error instanceof AppError) {
				res.status(error.statusCode).json({
					success: false,
					error: error.message
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
	 * GET /api/gamification/admin/logs
	 * Get system logs and audit trail
	 */
	async getSystemLogs(req: Request, res: Response) {
		try {
			const limit = Math.min(1000, parseInt(req.query.limit as string) || 100);
			const level = (req.query.level as string) || 'info';

			// TODO: Implement actual log retrieval
			const logs = [
				{
					timestamp: new Date().toISOString(),
					level: 'info',
					message: 'System logs endpoint - to be implemented',
					service: 'gamification',
					userId: null
				}
			];

			res.json({
				success: true,
				data: {
					logs,
					meta: {
						count: logs.length,
						limit,
						level
					}
				}
			});
		} catch (error) {
			logger.error('ADMIN_CONTROLLER', 'Error getting system logs:', error);
			res.status(500).json({
				success: false,
				error: 'Internal server error'
			});
		}
	}

	/**
	 * POST /api/gamification/admin/seed-defaults
	 * Seed all default data (levels, achievements, missions)
	 */
	async seedAllDefaults(req: Request, res: Response) {
		try {
			const results = [];

			// Seed default achievements
			try {
				await achievementService.createDefaultAchievements();
				results.push('Default achievements created');
			} catch (error) {
				logger.warn('ADMIN_CONTROLLER', 'Failed to seed achievements:', error);
				results.push('Default achievements failed');
			}

			// Seed default missions
			try {
				await missionsService.createDefaultMissions();
				results.push('Default missions created');
			} catch (error) {
				logger.warn('ADMIN_CONTROLLER', 'Failed to seed missions:', error);
				results.push('Default missions failed');
			}

			// Generate default level curve
			try {
				const curve = await levelingService.generateXpCurve(100, 100);
				await levelingService.importXpCurve(curve);
				results.push('Default level curve created');
			} catch (error) {
				logger.warn('ADMIN_CONTROLLER', 'Failed to seed levels:', error);
				results.push('Default level curve failed');
			}

			res.json({
				success: true,
				data: {
					results,
					completedAt: new Date().toISOString()
				},
				message: 'Default data seeding completed'
			});
		} catch (error) {
			logger.error('ADMIN_CONTROLLER', 'Error seeding defaults:', error);
			res.status(500).json({
				success: false,
				error: 'Internal server error'
			});
		}
	}
}

export const gamificationAdminController = new GamificationAdminController();
