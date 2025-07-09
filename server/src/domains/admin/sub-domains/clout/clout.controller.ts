import type { Request, Response, NextFunction } from 'express';
import { db } from '@db';
import { cloutAchievements, userCloutLog, users } from '@schema';
import { eq, desc } from 'drizzle-orm';
import { logger } from '../../../../core/logger';
import { CloutService } from '../../../economy/services/cloutService';
import { CloutTransformer } from '../../../gamification/transformers/clout.transformer';
import { sendSuccessResponse, sendErrorResponse } from "@server/src/core/utils/transformer.helpers";

// Instantiate once – can be swapped with dependency injection later
const cloutService = new CloutService();

/** ---------------------------- ACHIEVEMENTS CRUD --------------------------- */
export const getAllAchievements = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const achievements = await db.select().from(cloutAchievements).orderBy(cloutAchievements.id);
		
		// Transform achievements for admin view
		const transformedAchievements = CloutTransformer.toAchievementList(achievements, { role: 'admin' }, 'admin');
		
		sendSuccessResponse(res, { achievements: transformedAchievements, count: transformedAchievements.length });
	} catch (err) {
		logger.error('CloutAdmin', 'Error fetching achievements', err);
		next(err);
	}
};

export const getAchievementById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = req.params.id;
		const rows = await db
			.select()
			.from(cloutAchievements)
			.where(eq(cloutAchievements.id, id))
			.limit(1);
		if (!rows.length) return sendErrorResponse(res, 'Achievement not found', 404);
		
		// Transform achievement for admin view
		const transformedAchievement = CloutTransformer.toAdminAchievement(rows[0]);
		
		sendSuccessResponse(res, transformedAchievement);
	} catch (err) {
		next(err);
	}
};

export const createAchievement = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const {
			achievementKey,
			name,
			description,
			cloutReward,
			criteriaType,
			criteriaValue,
			enabled = true,
			iconUrl
		} = req.body;

		if (!achievementKey || !name) {
			return sendErrorResponse(res, 'achievementKey and name are required', 400);
		}

		await db.insert(cloutAchievements).values({
			achievementKey,
			name,
			description,
			cloutReward: cloutReward ?? 0,
			criteriaType,
			criteriaValue,
			enabled,
			iconUrl,
			createdAt: new Date()
		});

		sendSuccessResponse(res, { message: 'Achievement created' });
	} catch (err) {
		next(err);
	}
};

export const updateAchievement = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = req.params.id;
		const updateData = { ...req.body, updatedAt: new Date() } as any;
		delete updateData.id;

		// Check existence
		const exists = await db
			.select({ id: cloutAchievements.id })
			.from(cloutAchievements)
			.where(eq(cloutAchievements.id, id))
			.limit(1);
		if (!exists.length) return sendErrorResponse(res, 'Achievement not found', 404);

		await db.update(cloutAchievements).set(updateData).where(eq(cloutAchievements.id, id));
		sendSuccessResponse(res, { message: 'Achievement updated' });
	} catch (err) {
		next(err);
	}
};

export const deleteAchievement = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = req.params.id;
		await db.delete(cloutAchievements).where(eq(cloutAchievements.id, id));
		sendSuccessResponse(res, { message: 'Achievement deleted' });
	} catch (err) {
		next(err);
	}
};

export const toggleAchievement = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = req.params.id;
		const rows = await db
			.select({ enabled: cloutAchievements.enabled })
			.from(cloutAchievements)
			.where(eq(cloutAchievements.id, id))
			.limit(1);
		if (!rows.length) return sendErrorResponse(res, 'Achievement not found', 404);
		const enabled = !rows[0].enabled;
		await db.update(cloutAchievements).set({ enabled }).where(eq(cloutAchievements.id, id));
		sendSuccessResponse(res, { message: `Achievement ${enabled ? 'enabled' : 'disabled'}` });
	} catch (err) {
		next(err);
	}
};

/** ---------------------------- CLOUT GRANTS --------------------------- */
export const grantClout = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { userId, amount, reason } = req.body as {
			userId: string;
			amount: number;
			reason: string;
		};
		if (!userId || !amount || !reason)
			return sendErrorResponse(res, 'userId, amount, reason required', 400);

		// Validate user exists
		const userExists = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);
		if (!userExists.length) return sendErrorResponse(res, 'User not found', 404);

		await cloutService.grantClout(userId, amount, reason);

		sendSuccessResponse(res, { message: `Granted ${amount} clout to user ${userId}` });
	} catch (err) {
		next(err);
	}
};

export const getCloutLogs = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { userId, limit = 50 } = req.query as { userId?: string; limit?: string };

		const baseQuery = db.select().from(userCloutLog);
		const filtered = userId ? baseQuery.where(eq(userCloutLog.userId, userId)) : baseQuery;
		const logs = await filtered.orderBy(desc(userCloutLog.createdAt)).limit(Number(limit));
		
		// Transform logs for admin view
		const { logs: transformedLogs, summary } = CloutTransformer.toCloutLogHistory(logs, { role: 'admin' }, 'admin');
		
		sendSuccessResponse(res, { logs: transformedLogs, summary, count: transformedLogs.length });
	} catch (err) {
		next(err);
	}
};

/** ---------------------------- CLOUT ADJUSTMENTS (New Enhanced Tool) --------------------------- */
export const adjustClout = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const {
			userId,
			amount,
			adjustmentType,
			reason,
			notify = false
		} = req.body as {
			userId: string;
			amount: number;
			adjustmentType: 'add' | 'subtract' | 'set';
			reason: string;
			notify?: boolean;
		};

		if (!userId || !amount || !adjustmentType || !reason) {
			return sendErrorResponse(res, 'userId, amount, adjustmentType, and reason are required', 400);
		}

		// Validate user exists and get current clout
		const userRows = await db
			.select({ id: users.id, clout: users.clout })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!userRows.length) {
			return sendErrorResponse(res, 'User not found', 404);
		}

		const user = userRows[0];
		const oldClout = user.clout || 0;
		let newClout = oldClout;

		// Calculate new clout based on adjustment type
		switch (adjustmentType) {
			case 'add':
				newClout = oldClout + amount;
				break;
			case 'subtract':
				newClout = Math.max(0, oldClout - amount);
				break;
			case 'set':
				newClout = Math.max(0, amount);
				break;
			default:
				return sendErrorResponse(res, 'Invalid adjustmentType', 400);
		}

		const cloutChange = newClout - oldClout;

		// Apply the clout adjustment using our service
		if (cloutChange !== 0) {
			await cloutService.grantClout(userId, cloutChange, `Admin Adjustment: ${reason}`);
		}

		// Get updated user data
		const updatedUserRows = await db
			.select({ id: users.id, username: users.username, clout: users.clout })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		const updatedUser = updatedUserRows[0];

		// TODO: Handle user notification if notify=true
		// This could integrate with a notification service

		logger.info(
			'CloutAdmin',
			`Clout adjusted: ${user.id} | ${oldClout} → ${updatedUser.clout} | Reason: ${reason}`
		);

		// Transform user data for admin response
		const userResponse = {
			id: updatedUser.id,
			username: updatedUser.username,
			clout: updatedUser.clout
		};
		
		sendSuccessResponse(res, {
        			message: `Clout adjustment applied`,
        			user: userResponse,
        			adjustment: {
        				type: adjustmentType,
        				amount,
        				oldClout,
        				newClout: updatedUser.clout,
        				reason
        			}
        		});
	} catch (err) {
		logger.error('CloutAdmin', 'Error adjusting clout', err);
		next(err);
	}
};

export const getCloutAdjustmentLogs = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { userId, limit = 50 } = req.query as { userId?: string; limit?: string };

		// Get clout logs with user data joined
		const baseQuery = db
			.select({
				id: userCloutLog.id,
				userId: userCloutLog.userId,
				username: users.username,
				cloutEarned: userCloutLog.cloutEarned,
				reason: userCloutLog.reason,
				createdAt: userCloutLog.createdAt
			})
			.from(userCloutLog)
			.leftJoin(users, eq(userCloutLog.userId, users.id));

		const filtered = userId ? baseQuery.where(eq(userCloutLog.userId, userId)) : baseQuery;
		const logs = await filtered.orderBy(desc(userCloutLog.createdAt)).limit(Number(limit));

		// Transform logs to match the frontend interface
		const adjustmentLogs = logs.map((log) => {
			// Parse admin adjustment reasons to extract admin info
			const isAdminAdjustment = log.reason?.startsWith('Admin Adjustment:');
			const adjustmentReason = isAdminAdjustment
				? log.reason.replace('Admin Adjustment: ', '')
				: log.reason;

			// Determine adjustment type and amount from cloutEarned
			let adjustmentType: 'add' | 'subtract' | 'set' = 'add';
			const amount = Math.abs(log.cloutEarned);

			if (log.cloutEarned > 0) {
				adjustmentType = 'add';
			} else if (log.cloutEarned < 0) {
				adjustmentType = 'subtract';
			}

			return {
				id: log.id,
				userId: log.userId,
				username: log.username || 'Unknown',
				adjustmentType,
				amount,
				reason: adjustmentReason,
				oldClout: 0, // TODO: Calculate from previous state if needed for detailed view
				newClout: 0, // TODO: Calculate from previous state if needed for detailed view
				adminUsername: 'Admin', // TODO: Extract from request context or log metadata
				timestamp: log.createdAt
			};
		});

		// Transform adjustment logs for admin view
		const transformedLogs = adjustmentLogs.map(log => ({
			...log,
			// Ensure proper data sanitization
			username: log.username || 'Unknown',
			timestamp: log.timestamp
		}));
		
		sendSuccessResponse(res, transformedLogs);
	} catch (err) {
		logger.error('CloutAdmin', 'Error fetching clout adjustment logs', err);
		next(err);
	}
};
