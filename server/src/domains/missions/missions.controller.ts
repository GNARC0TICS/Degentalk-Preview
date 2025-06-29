import { userService } from '@server/src/core/services/user.service';
import type { Request, Response, NextFunction } from 'express';
import { logger } from '../../core/logger';
import { MissionsService } from './missions.service';
import { xpService } from '../xp/xp.service';
import { walletService } from '../wallet/wallet.service';

/**
 * Get all missions (admin only)
 */
export const getAllMissions = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const missions = await missionsService.getAllMissions();
		res.status(200).json(missions);
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
		// @ts-ignore - user is added by auth middleware
		const userId = userService.getUserFromRequest(req)?.id;
		// @ts-ignore - user is added by auth middleware
		const userLevel = userService.getUserFromRequest(req)?.level || 1;

		if (!userId) {
			return res.status(401).json({ message: 'Authentication required' });
		}

		const missions = await missionsService.getActiveMissions(userLevel);
		res.status(200).json(missions);
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
		// @ts-ignore - user is added by auth middleware
		const userId = userService.getUserFromRequest(req)?.id;

		if (!userId) {
			return res.status(401).json({ message: 'Authentication required' });
		}

		const progress = await missionsService.getUserMissionProgress(userId);
		res.status(200).json(progress);
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
			return res.status(400).json({ message: 'User ID is required' });
		}

		const progress = await missionsService.getUserMissionProgress(Number(userId));
		res.status(200).json(progress);
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
			return res.status(400).json({
				message: 'Missing required fields: title, type, and requiredAction are required'
			});
		}

		const mission = await missionsService.createMission(missionData);
		res.status(201).json(mission);
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
			return res.status(400).json({ message: 'Mission ID is required' });
		}

		const mission = await missionsService.updateMission(Number(id), missionData);

		if (!mission) {
			return res.status(404).json({ message: 'Mission not found' });
		}

		res.status(200).json(mission);
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
		// @ts-ignore - user is added by auth middleware
		const userId = userService.getUserFromRequest(req)?.id;
		const { missionId } = req.params;

		if (!userId) {
			return res.status(401).json({ message: 'Authentication required' });
		}

		if (!missionId) {
			return res.status(400).json({ message: 'Mission ID is required' });
		}

		const result = await missionsService.claimMissionReward(userId, Number(missionId));

		if (!result.success) {
			return res.status(400).json({ message: result.message });
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

		res.status(200).json({
			success: true,
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
		res.status(200).json({ message: 'Default missions created successfully' });
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
		res.status(200).json({ message: 'Daily missions reset successfully' });
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
		res.status(200).json({ message: 'Weekly missions reset successfully' });
	} catch (error) {
		logger.error('Error resetting weekly missions:', error);
		next(error);
	}
};
