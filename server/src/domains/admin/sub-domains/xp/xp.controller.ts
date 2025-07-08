import type { Request, Response, NextFunction } from 'express';
import { userService } from '@server/src/core/services/user.service';
import { xpAdminService } from './xp.service';
import { logger } from '../../../../core/logger';
import { xpService } from '../../../xp/xp.service';
import { XP_ACTION } from '../../../xp/xp-actions';
import { db } from '@db';
import { xpAdjustmentLogs } from '@schema';
import { eq, desc } from 'drizzle-orm';
import { sendSuccess, sendError, sendValidationError, handleAdminError } from '../../admin.response';
import { validateRequestBody, validateNumberParam } from '../../admin.validation';
import {
	XpSettingsSchema,
	CreateLevelSchema,
	UpdateLevelSchema,
	AdjustUserXpSchema
} from './xp.validators';

// --- XP Settings Management ---
export const getXpSettings = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// const settings = await xpAdminService.getXpSettings();
		// AdminResponse.success(settings);
		return sendError(res, 'Get XP Settings not implemented', 501);
	} catch (error) {
		logger.error(
			'XP_ADMIN_CONTROLLER',
			'Error getting XP settings:',
			error instanceof Error ? error.message : String(error)
		);
		next(error);
	}
};

export const updateXpSettings = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const validatedData = validateRequestBody(req, res, XpSettingsSchema);
		if (!validatedData) return;

		// const updatedSettings = await xpAdminService.updateXpSettings(validatedData);
		// return sendSuccess(res, updatedSettings, 'XP settings updated successfully');
		return sendError(res, 'Update XP Settings not implemented', 501);
	} catch (error) {
		logger.error(
			'XP_ADMIN_CONTROLLER',
			'Error updating XP settings:',
			error instanceof Error ? error.message : String(error)
		);
		return sendError(res, 'Failed to update XP settings');
	}
};

// --- Level Management ---
export const getLevels = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const levels = await xpAdminService.getLevels();
		return sendSuccess(res, {
			levels,
			totalLevels: levels.length,
			highestLevel: levels.length > 0 ? Math.max(...levels.map((l) => l.level)) : 0,
			maxXpRequired: levels.length > 0 ? Math.max(...levels.map((l) => l.xpRequired)) : 0,
			totalDgtRewards: levels.reduce((sum, l) => sum + (l.rewardDgt || 0), 0)
		});
	} catch (error) {
		logger.error(
			'XP_ADMIN_CONTROLLER',
			'Error getting levels:',
			error instanceof Error ? error.message : String(error)
		);
		return sendError(res, 'Failed to get levels');
	}
};

export const createLevel = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const data = validateRequestBody(req, res, CreateLevelSchema);
		if (!data) return; // validation handled

		const level = await xpAdminService.createLevel(data);
		return sendSuccess(res, level, 'Level created');
	} catch (err) {
		logger.error('XP_ADMIN_CONTROLLER', 'Error creating level:', err);
		next(err);
	}
};

export const updateLevel = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const levelNumber = validateNumberParam(req, res, 'levelNumber');
		if (!levelNumber) return;

		const data = validateRequestBody(req, res, UpdateLevelSchema);
		if (!data) return;

		const level = await xpAdminService.updateLevel(levelNumber, data);
		return sendSuccess(res, level, 'Level updated');
	} catch (err) {
		logger.error('XP_ADMIN_CONTROLLER', 'Error updating level:', err);
		next(err);
	}
};

export const deleteLevel = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// const { levelNumber } = req.params;
		// await xpAdminService.deleteLevel(parseInt(levelNumber));
		// res.status(204).send();
		return sendError(res, 'Delete Level not implemented', 501);
	} catch (error) {
		logger.error(
			'XP_ADMIN_CONTROLLER',
			'Error deleting level:',
			error instanceof Error ? error.message : String(error)
		);
		next(error);
	}
};

// --- Badge Management ---
export const getBadges = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// const badges = await xpAdminService.getBadges();
		// AdminResponse.success(badges);
		return sendError(res, 'Get Badges not implemented', 501);
	} catch (error) {
		logger.error(
			'XP_ADMIN_CONTROLLER',
			'Error getting badges:',
			error instanceof Error ? error.message : String(error)
		);
		next(error);
	}
};

export const createBadge = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// const newBadge = await xpAdminService.createBadge(req.body);
		// res.status(201).json(newBadge);
		return sendError(res, 'Create Badge not implemented', 501);
	} catch (error) {
		logger.error(
			'XP_ADMIN_CONTROLLER',
			'Error creating badge:',
			error instanceof Error ? error.message : String(error)
		);
		next(error);
	}
};

export const updateBadge = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// const { badgeId } = req.params;
		// const updatedBadge = await xpAdminService.updateBadge(badgeId, req.body);
		// AdminResponse.success(updatedBadge);
		return sendError(res, 'Update Badge not implemented', 501);
	} catch (error) {
		logger.error(
			'XP_ADMIN_CONTROLLER',
			'Error updating badge:',
			error instanceof Error ? error.message : String(error)
		);
		next(error);
	}
};

export const deleteBadge = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// const { badgeId } = req.params;
		// await xpAdminService.deleteBadge(badgeId);
		// res.status(204).send();
		return sendError(res, 'Delete Badge not implemented', 501);
	} catch (error) {
		logger.error(
			'XP_ADMIN_CONTROLLER',
			'Error deleting badge:',
			error instanceof Error ? error.message : String(error)
		);
		next(error);
	}
};

// --- Title Management ---
export const getTitles = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// const titles = await xpAdminService.getTitles();
		// AdminResponse.success(titles);
		return sendError(res, 'Get Titles not implemented', 501);
	} catch (error) {
		logger.error(
			'XP_ADMIN_CONTROLLER',
			'Error getting titles:',
			error instanceof Error ? error.message : String(error)
		);
		next(error);
	}
};

export const createTitle = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// const newTitle = await xpAdminService.createTitle(req.body);
		// res.status(201).json(newTitle);
		return sendError(res, 'Create Title not implemented', 501);
	} catch (error) {
		logger.error(
			'XP_ADMIN_CONTROLLER',
			'Error creating title:',
			error instanceof Error ? error.message : String(error)
		);
		next(error);
	}
};

export const updateTitle = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// const { titleId } = req.params;
		// const updatedTitle = await xpAdminService.updateTitle(titleId, req.body);
		// AdminResponse.success(updatedTitle);
		return sendError(res, 'Update Title not implemented', 501);
	} catch (error) {
		logger.error(
			'XP_ADMIN_CONTROLLER',
			'Error updating title:',
			error instanceof Error ? error.message : String(error)
		);
		next(error);
	}
};

export const deleteTitle = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// const { titleId } = req.params;
		// await xpAdminService.deleteTitle(titleId);
		// res.status(204).send();
		return sendError(res, 'Delete Title not implemented', 501);
	} catch (error) {
		logger.error(
			'XP_ADMIN_CONTROLLER',
			'Error deleting title:',
			error instanceof Error ? error.message : String(error)
		);
		next(error);
	}
};

// --- User XP Adjustment ---
export const adjustUserXp = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { userId, amount, adjustmentType, reason } = req.body;
		const adminId = userService.getUserFromRequest(req)?.id;

		if (!userId || !amount || !adjustmentType) {
			return sendValidationError(res, 'Missing required parameters: userId, amount, and adjustmentType are required.');
		}

		if (!['add', 'subtract', 'set'].includes(adjustmentType)) {
			return sendValidationError(res, 'Invalid adjustmentType. Must be one of: add, subtract, set.');
		}

		logger.info('XP_ADMIN_CONTROLLER', 'Admin adjusting user XP', {
			adminId,
			userId,
			amount,
			adjustmentType,
			reason
		});

		const result = await xpService.updateUserXp(
			userId,
			Number(amount),
			adjustmentType as 'add' | 'subtract' | 'set',
			{
				reason: reason || 'Admin adjustment',
				adminId: adminId,
				logAdjustment: true
			}
		);

		return sendSuccess(res, result, 'XP adjusted successfully');
	} catch (error: any) {
		logger.error(
			'XP_ADMIN_CONTROLLER',
			'Error adjusting user XP:',
			error instanceof Error ? error.message : String(error)
		);
		if (error.message && error.message.includes('not found')) {
			return sendError(res, error.message, 404);
		}
		next(error);
	}
};

export const getXpAdjustmentLogs = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.query.userId ? req.query.userId : undefined;
		const limit = req.query.limit ? Number(req.query.limit) : 50;

		let query = db
			.select()
			.from(xpAdjustmentLogs)
			.orderBy(desc(xpAdjustmentLogs.createdAt))
			.limit(limit);

		if (userId) {
			query = query.where(eq(xpAdjustmentLogs.userId, userId));
		}

		const logs = await query;

		return sendSuccess(res, { logs });
	} catch (error) {
		logger.error(
			'XP_ADMIN_CONTROLLER',
			'Error getting XP adjustment logs:',
			error instanceof Error ? error.message : String(error)
		);
		next(error);
	}
};

/**
 * Test XP Action Award (Admin Development endpoint)
 *
 * This endpoint allows administrators to test the XP action award system
 * by manually triggering a specific XP action for a user.
 */
export const testXpActionAward = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { userId, action, metadata } = req.body;

		if (!userId || !action) {
			return sendValidationError(res, 'Missing required parameters. userId and action are required.');
		}

		// Ensure action is valid
		if (!Object.values(XP_ACTION).includes(action as XP_ACTION)) {
			return sendValidationError(res, `Invalid action. Must be one of: ${Object.values(XP_ACTION).join(', ')}`);
		}

		logger.info('XP_ADMIN_CONTROLLER', 'Admin testing XP action award', {
			adminId: userService.getUserFromRequest(req)?.id,
			userId,
			action,
			metadata
		});

		// Call the service to award XP
		const result = await xpService.awardXp(userId, action as XP_ACTION, metadata);

		if (!result) {
			return sendError(res, 'Could not award XP. The user may have reached a limit for this action.', 429);
		}

		return sendSuccess(res, {
			result,
			limits: await xpService.getActionLimitsForUser(userId, action as XP_ACTION)
		}, 'XP awarded successfully');
	} catch (error: any) {
		logger.error(
			'XP_ADMIN_CONTROLLER',
			'Error testing XP action award:',
			error instanceof Error ? error.message : String(error)
		);
		if (error.message && error.message.includes('not found')) {
			return sendError(res, error.message, 404);
		}
		next(error);
	}
};
