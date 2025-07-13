import { userService } from '@core/services/user.service';
/**
 * Leveling API Controller
 *
 * Comprehensive API endpoints for level progression, user advancement,
 * leaderboards, and progression analytics.
 */

import type { Request, Response } from 'express';
import { z } from 'zod';
import { levelingService, LevelingService } from './services/leveling.service';
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
const getLevelSchema = z.object({
	level: z.string().transform(Number).pipe(z.number().int().min(1).max(1000))
});

const getUserProgressionSchema = z.object({
	userId: z.string().uuid()
});

const getLeaderboardSchema = z.object({
	type: z.enum(['level', 'xp', 'weekly', 'monthly']).optional().default('xp'),
	limit: z
		.string()
		.optional()
		.transform((val) => (val ? parseInt(val) : 50))
		.pipe(z.number().int().min(1).max(100)),
	offset: z
		.string()
		.optional()
		.transform((val) => (val ? parseInt(val) : 0))
		.pipe(z.number().int().min(0))
});

const createLevelSchema = z.object({
	level: z.number().int().min(1).max(1000),
	minXp: z.number().int().min(0),
	name: z.string().min(1).max(100).optional(),
	iconUrl: z.string().url().optional(),
	rarity: z.enum(['common', 'rare', 'epic', 'legendary', 'mythic']).optional().default('common'),
	frameUrl: z.string().url().optional(),
	colorTheme: z.string().max(25).optional(),
	animationEffect: z.string().max(30).optional(),
	unlocks: z.record(z.any()).optional(),
	rewardDgt: z.number().int().min(0).optional(),
	rewardTitleId: z.string().uuid().optional(),
	rewardBadgeId: z.string().uuid().optional()
});

const generateXpCurveSchema = z.object({
	maxLevel: z.number().int().min(10).max(1000).optional().default(100),
	baseXp: z.number().int().min(10).max(10000).optional().default(100)
});

const getAnalyticsSchema = z.object({
	timeframe: z.enum(['day', 'week', 'month']).optional().default('week')
});

export class LevelingController {
	private service: LevelingService;

	constructor() {
		this.service = levelingService;
	}

	/**
	 * GET /api/gamification/levels/:level
	 * Get detailed information about a specific level
	 */
	async getLevelInfo(req: Request, res: Response) {
		try {
			const { level } = getLevelSchema.parse(req.params);

			const levelInfo = await this.service.getLevelInfo(level);

			if (!levelInfo) {
				throw new AppError(`Level ${level} not found`, 404);
			}

			sendSuccessResponse(res, levelInfo);
		} catch (error) {
			logger.error('LEVELING_CONTROLLER', 'Error getting level info:', error);
			if (error instanceof AppError) {
				sendErrorResponse(res, error.message, error.httpStatus || 500);
			} else {
				sendErrorResponse(res, 'Internal server error', 500);
			}
		}
	}

	/**
	 * GET /api/gamification/levels
	 * Get all level configurations
	 */
	async getAllLevels(req: Request, res: Response) {
		try {
			const levels = await this.service.getAllLevels();

			sendSuccessResponse(res, levels, undefined, {
				count: levels.length,
				maxLevel: Math.max(...levels.map((l) => l.level))
			});
		} catch (error) {
			logger.error('LEVELING_CONTROLLER', 'Error getting all levels:', error);
			sendErrorResponse(res, 'Internal server error', 500);
		}
	}

	/**
	 * GET /api/gamification/progression/:userId
	 * Get comprehensive user progression data
	 */
	async getUserProgression(req: Request, res: Response) {
		try {
			const { userId } = getUserProgressionSchema.parse(req.params);

			const progression = await this.service.getUserProgression(userId);

			if (!progression) {
				throw new AppError(`User ${userId} not found`, 404);
			}

			sendSuccessResponse(res, progression);
		} catch (error) {
			logger.error('LEVELING_CONTROLLER', 'Error getting user progression:', error);
			if (error instanceof AppError) {
				sendErrorResponse(res, error.message, error.httpStatus || 500);
			} else {
				sendErrorResponse(res, 'Internal server error', 500);
			}
		}
	}

	/**
	 * GET /api/gamification/progression/me
	 * Get current user's progression data
	 */
	async getMyProgression(req: Request, res: Response) {
		try {
			const userId = userService.getUserFromRequest(req)?.id;
			if (!userId) {
				throw new AppError('Authentication required', 401);
			}

			const progression = await this.service.getUserProgression(userId);

			if (!progression) {
				throw new AppError('User not found', 404);
			}

			sendSuccessResponse(res, progression);
		} catch (error) {
			logger.error('LEVELING_CONTROLLER', 'Error getting user progression:', error);
			if (error instanceof AppError) {
				sendErrorResponse(res, error.message, error.httpStatus || 500);
			} else {
				sendErrorResponse(res, 'Internal server error', 500);
			}
		}
	}

	/**
	 * GET /api/gamification/leaderboard
	 * Get leaderboard with filtering and pagination
	 */
	async getLeaderboard(req: Request, res: Response) {
		try {
			const { type, limit, offset } = getLeaderboardSchema.parse(req.query);

			const leaderboard = await this.service.getLeaderboard(type, limit, offset);

			sendSuccessResponse(res, leaderboard, undefined, {
				type,
				limit,
				offset,
				count: leaderboard.length
			});
		} catch (error) {
			logger.error('LEVELING_CONTROLLER', 'Error getting leaderboard:', error);
			sendErrorResponse(res, 'Internal server error', 500);
		}
	}

	/**
	 * GET /api/gamification/analytics
	 * Get progression analytics for admin dashboard
	 */
	async getProgressionAnalytics(req: Request, res: Response) {
		try {
			const { timeframe } = getAnalyticsSchema.parse(req.query);

			const analytics = await this.service.getProgressionAnalytics(timeframe);

			sendSuccessResponse(res, analytics, undefined, {
				timeframe,
				generatedAt: new Date().toISOString()
			});
		} catch (error) {
			logger.error('LEVELING_CONTROLLER', 'Error getting progression analytics:', error);
			sendErrorResponse(res, 'Internal server error', 500);
		}
	}

	/**
	 * POST /api/gamification/levels
	 * Create or update a level configuration (Admin only)
	 */
	async createLevel(req: Request, res: Response) {
		try {
			const levelData = createLevelSchema.parse(req.body);

			const level = await this.service.createLevel(levelData);

			res.status(201);
			sendSuccessResponse(res, level, `Level ${levelData.level} created successfully`);
		} catch (error) {
			logger.error('LEVELING_CONTROLLER', 'Error creating level:', error);
			if (error instanceof z.ZodError) {
				sendErrorResponse(res, 'Validation error', 400, error.errors);
			} else {
				sendErrorResponse(res, 'Internal server error', 500);
			}
		}
	}

	/**
	 * POST /api/gamification/levels/generate-curve
	 * Generate and import optimal XP curve (Admin only)
	 */
	async generateXpCurve(req: Request, res: Response) {
		try {
			const { maxLevel, baseXp } = generateXpCurveSchema.parse(req.body);

			const curve = await this.service.generateXpCurve(maxLevel, baseXp);
			await this.service.importXpCurve(curve);

			sendSuccessResponse(
				res,
				{
					curve: curve.slice(0, 10),
					total: curve.length,
					maxLevel,
					maxXp: Math.max(...curve.map((c) => c.minXp))
				},
				`Generated and imported ${curve.length} levels`
			);
		} catch (error) {
			logger.error('LEVELING_CONTROLLER', 'Error generating XP curve:', error);
			if (error instanceof z.ZodError) {
				sendErrorResponse(res, 'Validation error', 400, error.errors);
			} else {
				sendErrorResponse(res, 'Internal server error', 500);
			}
		}
	}

	/**
	 * GET /api/gamification/progression/:userId/rank
	 * Get user's current rank and position
	 */
	async getUserRank(req: Request, res: Response) {
		try {
			const { userId } = getUserProgressionSchema.parse(req.params);

			const progression = await this.service.getUserProgression(userId);

			if (!progression) {
				throw new AppError(`User ${userId} not found`, 404);
			}

			// Get users around this rank for context
			const contextSize = 10;
			const leaderboard = await this.service.getLeaderboard(
				'xp',
				contextSize * 2,
				Math.max(0, progression.rank - contextSize)
			);

			sendSuccessResponse(res, {
				userId: progression.userId,
				username: progression.username,
				rank: progression.rank,
				level: progression.currentLevel,
				xp: progression.currentXp,
				context: leaderboard
			});
		} catch (error) {
			logger.error('LEVELING_CONTROLLER', 'Error getting user rank:', error);
			if (error instanceof AppError) {
				sendErrorResponse(res, error.message, error.httpStatus || 500);
			} else {
				sendErrorResponse(res, 'Internal server error', 500);
			}
		}
	}

	/**
	 * POST /api/gamification/levels/:level/simulate-rewards
	 * Simulate level up rewards for testing (Admin only)
	 */
	async simulateLevelRewards(req: Request, res: Response) {
		try {
			const { level } = getLevelSchema.parse(req.params);
			const { userId } = req.body;

			if (!userId) {
				throw new AppError('User ID required', 400);
			}

			const { rewards, unlocks } = await this.service.processLevelUp(userId, level - 1, level);

			sendSuccessResponse(
				res,
				{
					level,
					userId,
					rewards,
					unlocks
				},
				`Simulated level ${level} rewards for user ${userId}`
			);
		} catch (error) {
			logger.error('LEVELING_CONTROLLER', 'Error simulating level rewards:', error);
			if (error instanceof AppError) {
				sendErrorResponse(res, error.message, error.httpStatus || 500);
			} else {
				sendErrorResponse(res, 'Internal server error', 500);
			}
		}
	}
}

export const levelingController = new LevelingController();
