import { userService } from '@core/services/user.service';
/**
 * Achievement API Controller
 *
 * RESTful endpoints for achievement tracking, progress monitoring,
 * and reward management.
 */

import type { Request, Response } from 'express';
import { z } from 'zod';
import { achievementService, AchievementService } from './services/achievement.service';
import type { AchievementRequirement } from './services/achievement.service';
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
const getUserAchievementsSchema = z.object({
	userId: z.string().uuid()
});

const getProgressSchema = z.object({
	userId: z.string().uuid(),
	achievementIds: z
		.string()
		.optional()
		.transform((str) => (str ? str.split(',') : undefined))
});

const awardAchievementSchema = z.object({
	userId: z.string().uuid(),
	achievementId: z.string().uuid()
});

const checkAchievementsSchema = z.object({
	userId: z.string().uuid(),
	actionType: z.string().min(1).max(100),
	metadata: z.record(z.any()).optional()
});

const createAchievementSchema = z.object({
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
});

const getLeaderboardSchema = z.object({
	limit: z
		.string()
		.optional()
		.transform((val) => (val ? parseInt(val) : 50))
		.pipe(z.number().int().min(1).max(100))
});

export class AchievementController {
	private service: AchievementService;

	constructor() {
		this.service = achievementService;
	}

	/**
	 * GET /api/gamification/achievements
	 * Get all available achievements
	 */
	async getAllAchievements(req: Request, res: Response) {
		try {
			const activeOnly = req.query.active !== 'false';
			const achievements = await this.service.getAllAchievements(activeOnly);

			// Group by category for better organization
			const grouped = achievements.reduce(
				(acc, achievement) => {
					const category = achievement.category;
					if (!acc[category]) {
						acc[category] = [];
					}
					acc[category].push(achievement);
					return acc;
				},
				{} as Record<string, typeof achievements>
			);

			const transformedAchievements = toPublicList(
				achievements,
				CloutTransformer.toPublicAchievement
			);
			const transformedGrouped = Object.fromEntries(
				Object.entries(grouped).map(([category, items]) => [
					category,
					toPublicList(items, CloutTransformer.toPublicAchievement)
				])
			);

			sendSuccessResponse(res, {
				achievements: transformedAchievements,
				grouped: transformedGrouped,
				stats: {
					total: achievements.length,
					byCategory: Object.fromEntries(
						Object.entries(grouped).map(([cat, items]) => [cat, items.length])
					),
					byRarity: achievements.reduce(
						(acc, a) => {
							acc[a.rarity] = (acc[a.rarity] || 0) + 1;
							return acc;
						},
						{} as Record<string, number>
					)
				}
			});
		} catch (error) {
			logger.error('ACHIEVEMENT_CONTROLLER', 'Error getting all achievements:', error);
			sendErrorResponse(res, 'Internal server error', 500);
		}
	}

	/**
	 * GET /api/gamification/achievements/user/:userId
	 * Get user's achievement statistics and completed achievements
	 */
	async getUserAchievements(req: Request, res: Response) {
		try {
			const { userId } = getUserAchievementsSchema.parse(req.params);

			const stats = await this.service.getUserAchievementStats(userId);

			// Transform recent achievements in stats
			const transformedStats = {
				...stats,
				recentEarned: toPublicList(stats.recentEarned, (earned: any) => ({
					...CloutTransformer.toAuthenticatedAchievement(earned.achievement, { id: userId }),
					earnedAt: earned.earnedAt
				}))
			};

			sendSuccessResponse(res, transformedStats);
		} catch (error) {
			logger.error('ACHIEVEMENT_CONTROLLER', 'Error getting user achievements:', error);
			if (error instanceof z.ZodError) {
				sendErrorResponse(res, 'Validation error', 400, error.errors);
			} else {
				sendErrorResponse(res, 'Internal server error', 500);
			}
		}
	}

	/**
	 * GET /api/gamification/achievements/my-stats
	 * Get current user's achievement statistics
	 */
	async getMyAchievements(req: Request, res: Response) {
		try {
			const userId = userService.getUserFromRequest(req)?.id;
			if (!userId) {
				throw new AppError('Authentication required', 401);
			}

			const stats = await this.service.getUserAchievementStats(userId);

			// Transform recent achievements in stats
			const transformedStats = {
				...stats,
				recentEarned: toPublicList(stats.recentEarned, (earned: any) => ({
					...CloutTransformer.toAuthenticatedAchievement(earned.achievement, { id: userId }),
					earnedAt: earned.earnedAt
				}))
			};

			sendSuccessResponse(res, transformedStats);
		} catch (error) {
			logger.error('ACHIEVEMENT_CONTROLLER', 'Error getting user achievements:', error);
			if (error instanceof AppError) {
				sendErrorResponse(res, error.message, error.httpStatus);
			} else {
				sendErrorResponse(res, 'Internal server error', 500);
			}
		}
	}

	/**
	 * GET /api/gamification/achievements/progress/:userId
	 * Get user's progress towards achievements
	 */
	async getUserProgress(req: Request, res: Response) {
		try {
			const { userId, achievementIds } = getProgressSchema.parse({
				...req.params,
				...req.query
			});

			const progress = await this.service.getUserAchievementProgress(userId, achievementIds);

			// Separate completed and in-progress achievements
			const completed = progress.filter((p) => p.isCompleted);
			const inProgress = progress.filter((p) => !p.isCompleted && p.progressPercentage > 0);
			const notStarted = progress.filter((p) => !p.isCompleted && p.progressPercentage === 0);

			const transformProgress = (progressItems: any[]) =>
				progressItems.map((p) => ({
					...p,
					achievement: CloutTransformer.toAuthenticatedAchievement(p.achievement, { id: userId })
				}));

			sendSuccessResponse(res, {
				all: transformProgress(progress),
				completed: transformProgress(completed),
				inProgress: transformProgress(inProgress),
				notStarted: transformProgress(notStarted),
				stats: {
					total: progress.length,
					completed: completed.length,
					inProgress: inProgress.length,
					completionRate: progress.length > 0 ? (completed.length / progress.length) * 100 : 0
				}
			});
		} catch (error) {
			logger.error('ACHIEVEMENT_CONTROLLER', 'Error getting user progress:', error);
			if (error instanceof z.ZodError) {
				sendErrorResponse(res, 'Validation error', 400, error.errors);
			} else {
				sendErrorResponse(res, 'Internal server error', 500);
			}
		}
	}

	/**
	 * GET /api/gamification/achievements/my-progress
	 * Get current user's achievement progress
	 */
	async getMyProgress(req: Request, res: Response) {
		try {
			const userId = userService.getUserFromRequest(req)?.id;
			if (!userId) {
				throw new AppError('Authentication required', 401);
			}

			const achievementIds = req.query.achievementIds
				? String(req.query.achievementIds).split(',')
				: undefined;

			const progress = await this.service.getUserAchievementProgress(userId, achievementIds);

			// Separate completed and in-progress achievements
			const completed = progress.filter((p) => p.isCompleted);
			const inProgress = progress.filter((p) => !p.isCompleted && p.progressPercentage > 0);
			const notStarted = progress.filter((p) => !p.isCompleted && p.progressPercentage === 0);

			const transformProgress = (progressItems: any[]) =>
				progressItems.map((p) => ({
					...p,
					achievement: CloutTransformer.toAuthenticatedAchievement(p.achievement, { id: userId })
				}));

			sendSuccessResponse(res, {
				all: transformProgress(progress),
				completed: transformProgress(completed),
				inProgress: transformProgress(inProgress),
				notStarted: transformProgress(notStarted),
				stats: {
					total: progress.length,
					completed: completed.length,
					inProgress: inProgress.length,
					completionRate: progress.length > 0 ? (completed.length / progress.length) * 100 : 0
				}
			});
		} catch (error) {
			logger.error('ACHIEVEMENT_CONTROLLER', 'Error getting user progress:', error);
			if (error instanceof AppError) {
				sendErrorResponse(res, error.message, error.httpStatus);
			} else {
				sendErrorResponse(res, 'Internal server error', 500);
			}
		}
	}

	/**
	 * POST /api/gamification/achievements/check
	 * Check and award achievements for a user action
	 */
	async checkAchievements(req: Request, res: Response) {
		try {
			const { userId, actionType, metadata } = checkAchievementsSchema.parse(req.body);

			const awardedAchievements = await this.service.checkAndAwardAchievements(
				userId,
				actionType,
				metadata
			);

			sendSuccessResponse(
				res,
				{
					awarded: toPublicList(awardedAchievements, CloutTransformer.toPublicAchievement),
					count: awardedAchievements.length
				},
				awardedAchievements.length > 0
					? `Awarded ${awardedAchievements.length} achievement(s)`
					: 'No new achievements awarded'
			);
		} catch (error) {
			logger.error('ACHIEVEMENT_CONTROLLER', 'Error checking achievements:', error);
			if (error instanceof z.ZodError) {
				sendErrorResponse(res, 'Validation error', 400, error.errors);
			} else {
				sendErrorResponse(res, 'Internal server error', 500);
			}
		}
	}

	/**
	 * POST /api/gamification/achievements/award
	 * Manually award an achievement to a user (Admin only)
	 */
	async awardAchievement(req: Request, res: Response) {
		try {
			const { userId, achievementId } = awardAchievementSchema.parse(req.body);

			await this.service.awardAchievement(userId, achievementId);

			sendSuccessResponse(res, undefined, `Achievement ${achievementId} awarded to user ${userId}`);
		} catch (error) {
			logger.error('ACHIEVEMENT_CONTROLLER', 'Error awarding achievement:', error);
			if (error instanceof z.ZodError) {
				sendErrorResponse(res, 'Validation error', 400, error.errors);
			} else if (error instanceof Error && error.message.includes('not found')) {
				sendErrorResponse(res, error.message, 404);
			} else {
				sendErrorResponse(res, 'Internal server error', 500);
			}
		}
	}

	/**
	 * POST /api/gamification/achievements
	 * Create a new achievement (Admin only)
	 */
	async createAchievement(req: Request, res: Response) {
		try {
			const achievementData = createAchievementSchema.parse(req.body);

			const achievement = await this.service.createAchievement(achievementData);

			res.status(201);
			sendTransformedResponse(
				res,
				achievement,
				CloutTransformer.toAdminAchievement,
				`Achievement "${achievement.name}" created successfully`
			);
		} catch (error) {
			logger.error('ACHIEVEMENT_CONTROLLER', 'Error creating achievement:', error);
			if (error instanceof z.ZodError) {
				sendErrorResponse(res, 'Validation error', 400, error.errors);
			} else {
				sendErrorResponse(res, 'Internal server error', 500);
			}
		}
	}

	/**
	 * GET /api/gamification/achievements/leaderboard
	 * Get achievement leaderboard
	 */
	async getAchievementLeaderboard(req: Request, res: Response) {
		try {
			const { limit } = getLeaderboardSchema.parse(req.query);

			const leaderboard = await this.service.getAchievementLeaderboard(limit);

			sendSuccessResponse(res, leaderboard, undefined, {
				limit,
				count: leaderboard.length
			});
		} catch (error) {
			logger.error('ACHIEVEMENT_CONTROLLER', 'Error getting achievement leaderboard:', error);
			sendErrorResponse(res, 'Internal server error', 500);
		}
	}

	/**
	 * POST /api/gamification/achievements/seed-defaults
	 * Create default achievements (Admin only)
	 */
	async seedDefaultAchievements(req: Request, res: Response) {
		try {
			await this.service.createDefaultAchievements();

			sendSuccessResponse(res, undefined, 'Default achievements created successfully');
		} catch (error) {
			logger.error('ACHIEVEMENT_CONTROLLER', 'Error seeding default achievements:', error);
			sendErrorResponse(res, 'Internal server error', 500);
		}
	}

	/**
	 * GET /api/gamification/achievements/:id
	 * Get specific achievement details
	 */
	async getAchievementById(req: Request, res: Response) {
		try {
			const achievementId = req.params.id;
			if (!achievementId) {
				throw new AppError('Invalid achievement ID', 400);
			}

			const achievements = await this.service.getAllAchievements(false);
			const achievement = achievements.find((a) => a.id === achievementId);

			if (!achievement) {
				throw new AppError('Achievement not found', 404);
			}

			sendTransformedResponse(res, achievement, CloutTransformer.toPublicAchievement);
		} catch (error) {
			logger.error('ACHIEVEMENT_CONTROLLER', 'Error getting achievement by ID:', error);
			if (error instanceof AppError) {
				sendErrorResponse(res, error.message, error.httpStatus);
			} else {
				sendErrorResponse(res, 'Internal server error', 500);
			}
		}
	}
}

export const achievementController = new AchievementController();
