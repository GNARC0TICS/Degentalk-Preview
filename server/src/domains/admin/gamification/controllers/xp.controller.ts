import type { Request, Response, NextFunction } from 'express';
import { userService } from '@core/services/user.service';
import { logger } from '@core/logger';
import { xpService } from '../../../xp/xp.service';
import { XP_ACTION } from '../../../xp/xp-actions';
import { db } from '@db';
import { xpAdjustmentLogs } from '@schema';
import { eq, desc } from 'drizzle-orm';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';
import { z } from 'zod';
import type { UserId } from '@shared/types/ids';
import { toId } from '@shared/types';

// Zod schemas for validation
const CreateLevelSchema = z.object({
	level: z.number().min(1),
	xpRequired: z.number().min(0),
	title: z.string().optional(),
	rewardDgt: z.number().min(0).optional()
});

const UpdateLevelSchema = CreateLevelSchema.partial();

const AdjustUserXpSchema = z.object({
	userId: z.string().uuid(),
	amount: z.number(),
	adjustmentType: z.enum(['add', 'subtract', 'set']),
	reason: z.string().optional()
});

// Import service (this will need to be moved/created)
async function getXpAdminService() {
	try {
		const service = await import('../../sub-domains/xp/xp.service');
		return service.xpAdminService;
	} catch {
		// Temporary fallback - will be properly implemented
		return {
			getLevels: async () => [],
			createLevel: async (data: any) => data,
			updateLevel: async (level: number, data: any) => data
		};
	}
}

/**
 * Get all XP levels
 */
export const getLevels = async (req: Request, res: Response) => {
	try {
		const xpAdminService = await getXpAdminService();
		const levels = await xpAdminService.getLevels();
		return sendSuccessResponse(res, {
			levels,
			totalLevels: levels.length,
			highestLevel: levels.length > 0 ? Math.max(...levels.map((l: any) => l.level)) : 0,
			maxXpRequired: levels.length > 0 ? Math.max(...levels.map((l: any) => l.xpRequired)) : 0,
			totalDgtRewards: levels.reduce((sum: number, l: any) => sum + (l.rewardDgt || 0), 0)
		});
	} catch (error) {
		logger.error('XP_CONTROLLER', 'Error getting levels:', error);
		return sendErrorResponse(res, 'Failed to get levels', 500);
	}
};

/**
 * Create a new XP level
 */
export const createLevel = async (req: Request, res: Response) => {
	try {
		const data = CreateLevelSchema.parse(req.body);
		const xpAdminService = await getXpAdminService();
		const level = await xpAdminService.createLevel(data);
		return sendSuccessResponse(res, level, 'Level created successfully');
	} catch (error) {
		if (error instanceof z.ZodError) {
			return sendErrorResponse(res, 'Validation error', 400);
		}
		logger.error('XP_CONTROLLER', 'Error creating level:', error);
		return sendErrorResponse(res, 'Failed to create level', 500);
	}
};

/**
 * Update an XP level
 */
export const updateLevel = async (req: Request, res: Response) => {
	try {
		const levelNumber = parseInt(req.params.levelNumber);
		if (isNaN(levelNumber)) {
			return sendErrorResponse(res, 'Invalid level number', 400);
		}

		const data = UpdateLevelSchema.parse(req.body);
		const xpAdminService = await getXpAdminService();
		const level = await xpAdminService.updateLevel(levelNumber, data);
		return sendSuccessResponse(res, level, 'Level updated successfully');
	} catch (error) {
		if (error instanceof z.ZodError) {
			return sendErrorResponse(res, 'Validation error', 400);
		}
		logger.error('XP_CONTROLLER', 'Error updating level:', error);
		return sendErrorResponse(res, 'Failed to update level', 500);
	}
};

/**
 * Adjust user XP (admin function)
 */
export const adjustUserXp = async (req: Request, res: Response) => {
	try {
		const { userId, amount, adjustmentType, reason } = AdjustUserXpSchema.parse(req.body);
		const adminUser = userService.getUserFromRequest(req);

		if (!adminUser?.id) {
			return sendErrorResponse(res, 'Admin user not found', 401);
		}

		logger.info('XP_CONTROLLER', 'Admin adjusting user XP', {
			adminId: adminUser.id,
			userId,
			amount,
			adjustmentType,
			reason
		});

		// userId is already validated as UUID by Zod schema
		const validUserId = toId<'User'>(userId);
		const result = await xpService.updateUserXp(validUserId, Number(amount), adjustmentType, {
			reason: reason || 'Admin adjustment',
			adminId: adminUser.id,
			logAdjustment: true
		});

		return sendSuccessResponse(res, result, 'XP adjusted successfully');
	} catch (error) {
		if (error instanceof z.ZodError) {
			return sendErrorResponse(res, 'Validation error', 400);
		}
		logger.error('XP_CONTROLLER', 'Error adjusting user XP:', error);
		return sendErrorResponse(res, 'Failed to adjust XP', 500);
	}
};

/**
 * Get XP adjustment logs
 */
export const getXpAdjustmentLogs = async (req: Request, res: Response) => {
	try {
		const userId = req.query.userId as string;
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
		return sendSuccessResponse(res, { logs });
	} catch (error) {
		logger.error('XP_CONTROLLER', 'Error getting XP adjustment logs:', error);
		return sendErrorResponse(res, 'Failed to get adjustment logs', 500);
	}
};

/**
 * Test XP Action Award (Development endpoint)
 */
export const testXpActionAward = async (req: Request, res: Response) => {
	try {
		const { userId, action, metadata } = req.body;

		if (!userId || !action) {
			return sendErrorResponse(res, 'Missing required parameters: userId and action', 400);
		}

		if (!Object.values(XP_ACTION).includes(action as XP_ACTION)) {
			return sendErrorResponse(
				res,
				`Invalid action. Must be one of: ${Object.values(XP_ACTION).join(', ')}`,
				400
			);
		}

		logger.info('XP_CONTROLLER', 'Admin testing XP action award', {
			adminId: userService.getUserFromRequest(req)?.id,
			userId,
			action,
			metadata
		});

		const result = await xpService.awardXp(userId, action as XP_ACTION, metadata);

		if (!result) {
			return sendErrorResponse(
				res,
				'Could not award XP. User may have reached limit for this action.',
				429
			);
		}

		return sendSuccessResponse(
			res,
			{
				result,
				limits: await xpService.getActionLimitsForUser(userId, action as XP_ACTION)
			},
			'XP awarded successfully'
		);
	} catch (error) {
		logger.error('XP_CONTROLLER', 'Error testing XP action award:', error);
		return sendErrorResponse(res, 'Failed to award XP', 500);
	}
};
