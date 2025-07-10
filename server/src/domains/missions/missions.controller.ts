/**
 * Enhanced Mission System Controller
 *
 * Comprehensive API endpoints for daily/weekly missions,
 * progress tracking, and reward management.
 */

import { userService } from '@core/services/user.service';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { missionsService, MissionsService } from './missions.service';
import { MissionsTransformer } from './transformers/missions.transformer';
import { 
	toPublicList,
	sendSuccessResponse,
	sendErrorResponse,
	sendTransformedResponse,
	sendTransformedListResponse 
} from '@core/utils/transformer.helpers';
import { logger } from '../../core/logger';
import { AppError } from '../../core/errors';

// Enhanced validation schemas
const getUserMissionsSchema = z.object({
	userId: z.string().transform(Number).pipe(z.number().int().min(1))
});

const claimRewardSchema = z.object({
	missionId: z.string().uuid()
});

const updateProgressSchema = z.object({
	userId: z.string().uuid(),
	actionType: z.string().min(1).max(100),
	metadata: z.record(z.any()).optional()
});

const createMissionSchema = z.object({
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
	sortOrder: z.number().int().min(0).default(0),
	expiresAt: z
		.string()
		.datetime()
		.optional()
		.transform((str) => (str ? new Date(str) : undefined))
});

const updateMissionSchema = z.object({
	title: z.string().min(1).max(100).optional(),
	description: z.string().min(1).max(255).optional(),
	type: z.string().min(1).max(50).optional(),
	requiredAction: z.string().min(1).max(100).optional(),
	requiredCount: z.number().int().min(1).max(10000).optional(),
	xpReward: z.number().int().min(0).max(10000).optional(),
	dgtReward: z.number().int().min(0).max(10000).optional(),
	badgeReward: z.string().max(100).optional(),
	icon: z.string().max(100).optional(),
	isDaily: z.boolean().optional(),
	isWeekly: z.boolean().optional(),
	isActive: z.boolean().optional(),
	minLevel: z.number().int().min(1).max(1000).optional(),
	sortOrder: z.number().int().min(0).optional(),
	expiresAt: z
		.string()
		.datetime()
		.optional()
		.transform((str) => (str ? new Date(str) : undefined))
});

const getMissionsSchema = z.object({
	userLevel: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
	activeOnly: z
		.string()
		.transform((str) => str !== 'false')
		.optional()
		.default(true)
});

export class MissionController {
	private service: MissionsService;

	constructor() {
		this.service = missionsService;
	}

	/**
	 * GET /api/gamification/missions
	 * Get all missions (filtered by user level if provided)
	 */
	async getMissions(req: Request, res: Response) {
		try {
			const { userLevel, activeOnly } = getMissionsSchema.parse(req.query);

			let missions;
			if (activeOnly) {
				missions = await this.service.getActiveMissions(userLevel);
			} else {
				missions = await this.service.getAllMissions();
				if (userLevel) {
					missions = missions.filter((m) => m.minLevel <= userLevel);
				}
			}

			// Group missions by type
			const grouped = missions.reduce(
				(acc, mission) => {
					const key = mission.isDaily ? 'daily' : mission.isWeekly ? 'weekly' : 'other';
					if (!acc[key]) acc[key] = [];
					acc[key].push(mission);
					return acc;
				},
				{} as Record<string, typeof missions>
			);

			const transformedMissions = toPublicList(missions, MissionsTransformer.toPublicMission);
			const transformedGrouped = {
				daily: grouped.daily ? toPublicList(grouped.daily, MissionsTransformer.toPublicMission) : [],
				weekly: grouped.weekly ? toPublicList(grouped.weekly, MissionsTransformer.toPublicMission) : [],
				other: grouped.other ? toPublicList(grouped.other, MissionsTransformer.toPublicMission) : []
			};

			sendSuccessResponse(res, {
				missions: transformedMissions,
				grouped: transformedGrouped,
				stats: {
					total: missions.length,
					daily: grouped.daily?.length || 0,
					weekly: grouped.weekly?.length || 0,
					other: grouped.other?.length || 0
				}
			});
		} catch (error) {
			logger.error('MISSION_CONTROLLER', 'Error getting missions:', error);
			if (error instanceof z.ZodError) {
				sendErrorResponse(res, 'Validation error', 400, error.errors);
			} else {
				sendErrorResponse(res, 'Internal server error', 500);
			}
		}
	}

	/**
	 * GET /api/gamification/missions/user/:userId
	 * Get user's mission progress
	 */
	async getUserMissions(req: Request, res: Response) {
		try {
			const { userId } = getUserMissionsSchema.parse(req.params);

			const userProgress = await this.service.getUserMissionProgress(userId);

			// Organize progress data
			const completed = userProgress.filter((p) => p.isCompleted && !p.isRewardClaimed);
			const readyToClaim = userProgress.filter((p) => p.isCompleted && !p.isRewardClaimed);
			const inProgress = userProgress.filter((p) => !p.isCompleted && p.currentCount > 0);
			const notStarted = userProgress.filter((p) => !p.isCompleted && p.currentCount === 0);
			const claimed = userProgress.filter((p) => p.isRewardClaimed);

			// Calculate statistics
			const totalPossibleRewards = userProgress.reduce((sum, p) => {
				const xp = p.mission.xpReward || 0;
				const dgt = p.mission.dgtReward || 0;
				return sum + xp + dgt * 2; // Weight DGT higher
			}, 0);

			const earnedRewards = claimed.reduce((sum, p) => {
				const xp = p.mission.xpReward || 0;
				const dgt = p.mission.dgtReward || 0;
				return sum + xp + dgt * 2;
			}, 0);

			sendSuccessResponse(res, {
				all: toPublicList(userProgress, MissionsTransformer.toAuthenticatedMission),
				completed: toPublicList(completed, MissionsTransformer.toAuthenticatedMission),
				readyToClaim: toPublicList(readyToClaim, MissionsTransformer.toAuthenticatedMission),
				inProgress: toPublicList(inProgress, MissionsTransformer.toAuthenticatedMission),
				notStarted: toPublicList(notStarted, MissionsTransformer.toAuthenticatedMission),
				claimed: toPublicList(claimed, MissionsTransformer.toAuthenticatedMission),
				stats: {
					total: userProgress.length,
					completed: completed.length,
					readyToClaim: readyToClaim.length,
					inProgress: inProgress.length,
					claimed: claimed.length,
					completionRate:
						userProgress.length > 0 ? (claimed.length / userProgress.length) * 100 : 0,
					earnedRewards,
					totalPossibleRewards,
					rewardEfficiency:
						totalPossibleRewards > 0 ? (earnedRewards / totalPossibleRewards) * 100 : 0
				}
			});
		} catch (error) {
			logger.error('MISSION_CONTROLLER', 'Error getting user missions:', error);
			if (error instanceof z.ZodError) {
				sendErrorResponse(res, 'Validation error', 400, error.errors);
			} else {
				sendErrorResponse(res, 'Internal server error', 500);
			}
		}
	}

	/**
	 * GET /api/gamification/missions/my-progress
	 * Get current user's mission progress
	 */
	async getMyMissions(req: Request, res: Response) {
		try {
			const userId = userService.getUserFromRequest(req)?.id;
			if (!userId) {
				throw new AppError('Authentication required', 401);
			}

			// Reuse the getUserMissions logic
			req.params.userId = userId.toString();
			await this.getUserMissions(req, res);
		} catch (error) {
			logger.error('MISSION_CONTROLLER', 'Error getting user missions:', error);
			if (error instanceof AppError) {
				sendErrorResponse(res, error.message, error.statusCode);
			} else {
				sendErrorResponse(res, 'Internal server error', 500);
			}
		}
	}

	/**
	 * POST /api/gamification/missions/claim
	 * Claim mission reward
	 */
	async claimMissionReward(req: Request, res: Response) {
		try {
			const userId = userService.getUserFromRequest(req)?.id;
			if (!userId) {
				throw new AppError('Authentication required', 401);
			}

			const { missionId } = claimRewardSchema.parse(req.body);

			const result = await this.service.claimMissionReward(userId, missionId);

			if (!result.success) {
				throw new AppError(result.message || 'Failed to claim reward', 400);
			}

			sendSuccessResponse(res, result.rewards, 'Mission reward claimed successfully');
		} catch (error) {
			logger.error('MISSION_CONTROLLER', 'Error claiming mission reward:', error);
			if (error instanceof AppError) {
				sendErrorResponse(res, error.message, error.statusCode);
			} else if (error instanceof z.ZodError) {
				sendErrorResponse(res, 'Validation error', 400, error.errors);
			} else {
				sendErrorResponse(res, 'Internal server error', 500);
			}
		}
	}

	/**
	 * POST /api/gamification/missions/update-progress
	 * Update mission progress for a user action
	 */
	async updateMissionProgress(req: Request, res: Response) {
		try {
			const { userId, actionType, metadata } = updateProgressSchema.parse(req.body);

			const updatedProgress = await this.service.updateMissionProgress({
				userId,
				actionType: actionType as any, // Type assertion for MissionType
				metadata
			});

			// Check if any missions were completed
			const completedMissions = updatedProgress.filter((p) => p.isCompleted);

			sendSuccessResponse(res, {
				updatedProgress: toPublicList(updatedProgress, MissionsTransformer.toAuthenticatedMission),
				completedMissions: toPublicList(completedMissions, MissionsTransformer.toAuthenticatedMission),
				stats: {
					updated: updatedProgress.length,
					completed: completedMissions.length
				}
			}, completedMissions.length > 0
				? `${completedMissions.length} mission(s) completed!`
				: 'Progress updated');
		} catch (error) {
			logger.error('MISSION_CONTROLLER', 'Error updating mission progress:', error);
			if (error instanceof z.ZodError) {
				sendErrorResponse(res, 'Validation error', 400, error.errors);
			} else {
				sendErrorResponse(res, 'Internal server error', 500);
			}
		}
	}

	/**
	 * GET /api/gamification/missions/:id
	 * Get specific mission details
	 */
	async getMissionById(req: Request, res: Response) {
		try {
			const missionId = req.params.id;
			if (isNaN(Number(missionId))) {
				throw new AppError('Invalid mission ID', 400);
			}

			const mission = await this.service.getMission(missionId);

			if (!mission) {
				throw new AppError('Mission not found', 404);
			}

			sendTransformedResponse(res, mission, MissionsTransformer.toPublicMission);
		} catch (error) {
			logger.error('MISSION_CONTROLLER', 'Error getting mission by ID:', error);
			if (error instanceof AppError) {
				sendErrorResponse(res, error.message, error.statusCode);
			} else {
				sendErrorResponse(res, 'Internal server error', 500);
			}
		}
	}

	/**
	 * POST /api/gamification/missions (Admin only)
	 * Create a new mission
	 */
	async createMission(req: Request, res: Response) {
		try {
			const missionData = createMissionSchema.parse(req.body);

			const mission = await this.service.createMission(missionData);

			res.status(201);
			sendTransformedResponse(res, mission, MissionsTransformer.toAdminMission, `Mission "${mission.title}" created successfully`);
		} catch (error) {
			logger.error('MISSION_CONTROLLER', 'Error creating mission:', error);
			if (error instanceof z.ZodError) {
				sendErrorResponse(res, 'Validation error', 400, error.errors);
			} else {
				sendErrorResponse(res, 'Internal server error', 500);
			}
		}
	}

	/**
	 * PUT /api/gamification/missions/:id (Admin only)
	 * Update an existing mission
	 */
	async updateMission(req: Request, res: Response) {
		try {
			const missionId = req.params.id;
			if (isNaN(Number(missionId))) {
				throw new AppError('Invalid mission ID', 400);
			}

			const updateData = updateMissionSchema.parse(req.body);

			const mission = await this.service.updateMission(missionId, updateData);

			if (!mission) {
				throw new AppError('Mission not found', 404);
			}

			sendTransformedResponse(res, mission, MissionsTransformer.toAdminMission, `Mission "${mission.title}" updated successfully`);
		} catch (error) {
			logger.error('MISSION_CONTROLLER', 'Error updating mission:', error);
			if (error instanceof AppError) {
				sendErrorResponse(res, error.message, error.statusCode);
			} else if (error instanceof z.ZodError) {
				sendErrorResponse(res, 'Validation error', 400, error.errors);
			} else {
				sendErrorResponse(res, 'Internal server error', 500);
			}
		}
	}

	/**
	 * POST /api/gamification/missions/reset/daily (Admin only)
	 * Manually trigger daily mission reset
	 */
	async resetDailyMissions(req: Request, res: Response) {
		try {
			await this.service.resetDailyMissions();

			sendSuccessResponse(res, undefined, 'Daily missions reset successfully');
		} catch (error) {
			logger.error('MISSION_CONTROLLER', 'Error resetting daily missions:', error);
			sendErrorResponse(res, 'Internal server error', 500);
		}
	}

	/**
	 * POST /api/gamification/missions/reset/weekly (Admin only)
	 * Manually trigger weekly mission reset
	 */
	async resetWeeklyMissions(req: Request, res: Response) {
		try {
			await this.service.resetWeeklyMissions();

			sendSuccessResponse(res, undefined, 'Weekly missions reset successfully');
		} catch (error) {
			logger.error('MISSION_CONTROLLER', 'Error resetting weekly missions:', error);
			sendErrorResponse(res, 'Internal server error', 500);
		}
	}

	/**
	 * POST /api/gamification/missions/seed-defaults (Admin only)
	 * Create default missions
	 */
	async seedDefaultMissions(req: Request, res: Response) {
		try {
			await this.service.createDefaultMissions();

			sendSuccessResponse(res, undefined, 'Default missions created successfully');
		} catch (error) {
			logger.error('MISSION_CONTROLLER', 'Error seeding default missions:', error);
			sendErrorResponse(res, 'Internal server error', 500);
		}
	}

	/**
	 * GET /api/gamification/missions/analytics (Admin only)
	 * Get mission completion analytics
	 */
	async getMissionAnalytics(req: Request, res: Response) {
		try {
			// TODO: Implement comprehensive mission analytics
			// This would include completion rates, popular missions, user engagement, etc.

			sendSuccessResponse(res, {
				message: 'Mission analytics endpoint - to be implemented',
				placeholder: true
			});
		} catch (error) {
			logger.error('MISSION_CONTROLLER', 'Error getting mission analytics:', error);
			sendErrorResponse(res, 'Internal server error', 500);
		}
	}
}

export const missionController = new MissionController();
