import { userService } from '@server/src/core/services/user.service';
import type { UserId, MissionId } from '@shared/types/ids';
import type { Request, Response, NextFunction } from 'express';
import { logger } from '../../core/logger';
import { MissionsService } from './missions.service';
import { xpService } from '../xp/xp.service';
import { walletService } from '../wallet/wallet.service';
import { sendSuccessResponse, sendErrorResponse } from '@server/src/core/utils/transformer.helpers';

const missionsService = new MissionsService();

/**
 * Get all missions (admin only)
 */
export const getAllMissions = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const missions = await missionsService.getAllMissions();
		sendSuccessResponse(res, missions);
	} catch (error) {
		logger.error('Error getting all missions:', error);
		next(error);
	}
};

/**
 * Get active missions for the current user
 */
export const getActiveMissions = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// @ts-expect-error - user is added by auth middleware
		const userId = userService.getUserFromRequest(req)?.id;
		// @ts-expect-error - user is added by auth middleware
		const userLevel = userService.getUserFromRequest(req)?.level || 1;

		if (!userId) {
			return sendErrorResponse(res, 'Authentication required', 401);
		}

		const missions = await missionsService.getActiveMissions(userLevel);
		sendSuccessResponse(res, missions);
	} catch (error) {
		logger.error('Error getting active missions:', error);
		next(error);
	}
};

/**
 * Get user's mission progress
 */
export const getUserMissionProgress = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// @ts-expect-error - user is added by auth middleware
		const userId = userService.getUserFromRequest(req)?.id;

		if (!userId) {
			return sendErrorResponse(res, 'Authentication required', 401);
		}

		const progress = await missionsService.getUserMissionProgress(userId);
		sendSuccessResponse(res, progress);
	} catch (error) {
		logger.error('Error getting user mission progress:', error);
		next(error);
	}
};

/**
 * Get a specific user's mission progress (admin only)
 */
export const getUserMissionProgressById = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { userId } = req.params;

		if (!userId) {
			return sendErrorResponse(res, 'User ID is required', 400);
		}

		const progress = await missionsService.getUserMissionProgress(userId as UserId);
		sendSuccessResponse(res, progress);
	} catch (error) {
		logger.error('Error getting user mission progress by ID:', error);
		next(error);
	}
};

/**
 * Create a new mission (admin only)
 */
export const createMission = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const missionData = req.body;

		if (!missionData.title || !missionData.type || !missionData.requiredAction) {
			return sendErrorResponse(res, 'Missing required fields: title, type, and requiredAction are required', 400);
		}

		const mission = await missionsService.createMission(missionData);
		sendSuccessResponse(res, mission, 201);
	} catch (error) {
		logger.error('Error creating mission:', error);
		next(error);
	}
};

/**
 * Update a mission (admin only)
 */
export const updateMission = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;
		const missionData = req.body;

		if (!id) {
			return sendErrorResponse(res, 'Mission ID is required', 400);
		}

		const mission = await missionsService.updateMission(id as MissionId, missionData);

		if (!mission) {
			return sendErrorResponse(res, 'Mission not found', 404);
		}

		sendSuccessResponse(res, mission);
	} catch (error) {
		logger.error('Error updating mission:', error);
		next(error);
	}
};

/**
 * Claim mission reward
 */
export const claimMissionReward = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// @ts-expect-error - user is added by auth middleware
		const userId = userService.getUserFromRequest(req)?.id;
		const { missionId } = req.params;

		if (!userId) {
			return sendErrorResponse(res, 'Authentication required', 401);
		}

		if (!missionId) {
			return sendErrorResponse(res, 'Mission ID is required', 400);
		}

		const result = await missionsService.claimMissionReward(userId as UserId, missionId as MissionId);

		if (!result.success) {
			return sendErrorResponse(res, result.message, 400);
		}

		// Process rewards if the claim was successful
		if (result.rewards) {
			// Award XP if there's an XP reward
			if (result.rewards.xp) {
				await xpService.addXp({
					userId,
					amount: result.rewards.xp,
					reason: 'mission_reward',
					source: `mission:${missionId}`
				});
			}

			// Award DGT if there's a DGT reward
			if (result.rewards.dgt) {
				await walletService.addFunds({
					userId,
					amount: result.rewards.dgt,
					reason: 'mission_reward',
					source: `mission:${missionId}`
				});
			}

			// Badge rewards would be handled here if implemented
			// if (result.rewards.badge) { ... }
		}

		sendSuccessResponse(res, {
			message: 'Mission rewards claimed successfully',
			rewards: result.rewards
		});
	} catch (error) {
		logger.error('Error claiming mission reward:', error);
		next(error);
	}
};

/**
 * Initialize default missions (admin only)
 */
export const initializeDefaultMissions = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		await missionsService.createDefaultMissions();
		sendSuccessResponse(res, { message: 'Default missions created successfully' });
	} catch (error) {
		logger.error('Error initializing default missions:', error);
		next(error);
	}
};

/**
 * Reset expired daily missions (called by cron)
 */
export const resetDailyMissions = async (req: Request, res: Response, next: NextFunction) => {
	try {
		await missionsService.resetDailyMissions();
		sendSuccessResponse(res, { message: 'Daily missions reset successfully' });
	} catch (error) {
		logger.error('Error resetting daily missions:', error);
		next(error);
	}
};

/**
 * Reset expired weekly missions (called by cron)
 */
export const resetWeeklyMissions = async (req: Request, res: Response, next: NextFunction) => {
	try {
		await missionsService.resetWeeklyMissions();
		sendSuccessResponse(res, { message: 'Weekly missions reset successfully' });
	} catch (error) {
		logger.error('Error resetting weekly missions:', error);
		next(error);
	}
};
