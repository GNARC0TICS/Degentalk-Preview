import type { Request, Response, NextFunction } from 'express';
import { db } from '@degentalk/db';
import { reputationAchievements, userReputationLog, users } from '@schema';
import { eq, desc } from 'drizzle-orm';
import { logger } from '@core/logger';
import { ReputationService } from './services/reputationService';
import { ReputationTransformer } from './transformers/reputation.transformer';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

// Instantiate once – can be swapped with dependency injection later
const reputationService = new ReputationService();

/** ---------------------------- ACHIEVEMENTS CRUD --------------------------- */
export const getAllAchievements = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const achievements = await db
			.select()
			.from(reputationAchievements)
			.orderBy(reputationAchievements.id);

		// Transform achievements for admin view
		const transformedAchievements = ReputationTransformer.toAchievementList(
			achievements,
			{ role: 'admin' },
			'admin'
		);

		sendSuccessResponse(res, {
			achievements: transformedAchievements,
			count: transformedAchievements.length
		});
	} catch (err) {
		logger.error('ReputationAdmin', 'Error fetching achievements', err);
		next(err);
	}
};

export const getAchievementById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = req.params.id;
		const rows = await db
			.select()
			.from(reputationAchievements)
			.where(eq(reputationAchievements.id, id))
			.limit(1);
		if (!rows.length) return sendErrorResponse(res, 'Achievement not found', 404);

		// Transform achievement for admin view
		const transformedAchievement = ReputationTransformer.toAdminAchievement(rows[0]);

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
			reputationReward,
			criteriaType,
			criteriaValue,
			enabled = true,
			iconUrl
		} = req.body;

		if (!achievementKey || !name) {
			return sendErrorResponse(res, 'achievementKey and name are required', 400);
		}

		await db.insert(reputationAchievements).values({
			achievementKey,
			name,
			description,
			reputationReward: reputationReward ?? 0,
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
			.select({ id: reputationAchievements.id })
			.from(reputationAchievements)
			.where(eq(reputationAchievements.id, id))
			.limit(1);
		if (!exists.length) return sendErrorResponse(res, 'Achievement not found', 404);

		await db
			.update(reputationAchievements)
			.set(updateData)
			.where(eq(reputationAchievements.id, id));
		sendSuccessResponse(res, { message: 'Achievement updated' });
	} catch (err) {
		next(err);
	}
};

export const deleteAchievement = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = req.params.id;
		await db.delete(reputationAchievements).where(eq(reputationAchievements.id, id));
		sendSuccessResponse(res, { message: 'Achievement deleted' });
	} catch (err) {
		next(err);
	}
};

export const toggleAchievement = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = req.params.id;
		const rows = await db
			.select({ enabled: reputationAchievements.enabled })
			.from(reputationAchievements)
			.where(eq(reputationAchievements.id, id))
			.limit(1);
		if (!rows.length) return sendErrorResponse(res, 'Achievement not found', 404);
		const enabled = !rows[0].enabled;
		await db
			.update(reputationAchievements)
			.set({ enabled })
			.where(eq(reputationAchievements.id, id));
		sendSuccessResponse(res, { message: `Achievement ${enabled ? 'enabled' : 'disabled'}` });
	} catch (err) {
		next(err);
	}
};

/** ---------------------------- REPUTATION GRANTS --------------------------- */
export const grantReputation = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { userId, amount, reason } = req.body as {
			userId: string;
			amount: number;
			reason: string;
		};
		if (!userId || !amount || !reason)
			return sendErrorResponse(res, 'userId, amount, reason required');

		// Validate user exists
		const userExists = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);
		if (!userExists.length) return sendErrorResponse(res, 'User not found', 404);

		await reputationService.grantReputation(userId, amount, reason);

		sendSuccessResponse(res, { message: `Granted ${amount} reputation to user ${userId}` });
	} catch (err) {
		next(err);
	}
};

export const getReputationLogs = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { userId, limit = 50 } = req.query as { userId?: string; limit?: string };

		const baseQuery = db.select().from(userReputationLog);
		const filtered = userId ? baseQuery.where(eq(userReputationLog.userId, userId)) : baseQuery;
		const logs = await filtered.orderBy(desc(userReputationLog.createdAt)).limit(Number(limit));

		// Transform logs for admin view
		const { logs: transformedLogs, summary } = ReputationTransformer.toReputationLogHistory(
			logs,
			{ role: 'admin' },
			'admin'
		);

		sendSuccessResponse(res, { logs: transformedLogs, summary, count: transformedLogs.length });
	} catch (err) {
		next(err);
	}
};

/** ---------------------------- REPUTATION ADJUSTMENTS (New Enhanced Tool) --------------------------- */
export const adjustReputation = async (req: Request, res: Response, next: NextFunction) => {
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
			return sendErrorResponse(res, 'userId, amount, adjustmentType, and reason are required');
		}

		// Validate user exists and get current reputation
		const userRows = await db
			.select({ id: users.id, reputation: users.reputation })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!userRows.length) {
			return sendErrorResponse(res, 'User not found', 404);
		}

		const user = userRows[0];
		const oldReputation = user.reputation || 0;
		let newReputation = oldReputation;

		// Calculate new reputation based on adjustment type
		switch (adjustmentType) {
			case 'add':
				newReputation = oldReputation + amount;
				break;
			case 'subtract':
				newReputation = Math.max(0, oldReputation - amount);
				break;
			case 'set':
				newReputation = Math.max(0, amount);
				break;
			default:
				return sendErrorResponse(res, 'Invalid adjustmentType', 400);
		}

		const reputationChange = newReputation - oldReputation;

		// Apply the reputation adjustment using our service
		if (reputationChange !== 0) {
			await reputationService.grantReputation(
				userId,
				reputationChange,
				`Admin Adjustment: ${reason}`
			);
		}

		// Get updated user data
		const updatedUserRows = await db
			.select({ id: users.id, username: users.username, reputation: users.reputation })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		const updatedUser = updatedUserRows[0];

		// TODO: Handle user notification if notify=true
		// This could integrate with a notification service

		logger.info(
			'ReputationAdmin',
			`Reputation adjusted: ${user.id} | ${oldReputation} → ${updatedUser.reputation} | Reason: ${reason}`
		);

		// Transform user data for admin response
		const userResponse = {
			id: updatedUser.id,
			username: updatedUser.username,
			reputation: updatedUser.reputation
		};

		sendSuccessResponse(res, {
			message: `Reputation adjustment applied`,
			user: userResponse,
			adjustment: {
				type: adjustmentType,
				amount,
				oldReputation,
				newReputation: updatedUser.reputation,
				reason
			}
		});
	} catch (err) {
		logger.error('ReputationAdmin', 'Error adjusting reputation', err);
		next(err);
	}
};

export const getReputationAdjustmentLogs = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { userId, limit = 50 } = req.query as { userId?: string; limit?: string };

		// Get reputation logs with user data joined
		const baseQuery = db
			.select({
				id: userReputationLog.id,
				userId: userReputationLog.userId,
				username: users.username,
				reputationEarned: userReputationLog.reputationEarned,
				reason: userReputationLog.reason,
				createdAt: userReputationLog.createdAt
			})
			.from(userReputationLog)
			.leftJoin(users, eq(userReputationLog.userId, users.id));

		const filtered = userId ? baseQuery.where(eq(userReputationLog.userId, userId)) : baseQuery;
		const logs = await filtered.orderBy(desc(userReputationLog.createdAt)).limit(Number(limit));

		// Transform logs to match the frontend interface
		const adjustmentLogs = logs.map((log) => {
			// Parse admin adjustment reasons to extract admin info
			const isAdminAdjustment = log.reason?.startsWith('Admin Adjustment:');
			const adjustmentReason = isAdminAdjustment
				? log.reason.replace('Admin Adjustment: ', '')
				: log.reason;

			// Determine adjustment type and amount from reputationEarned
			let adjustmentType: 'add' | 'subtract' | 'set' = 'add';
			const amount = Math.abs(log.reputationEarned);

			if (log.reputationEarned > 0) {
				adjustmentType = 'add';
			} else if (log.reputationEarned < 0) {
				adjustmentType = 'subtract';
			}

			return {
				id: log.id,
				userId: log.userId,
				username: log.username || 'Unknown',
				adjustmentType,
				amount,
				reason: adjustmentReason,
				oldReputation: 0, // TODO: Calculate from previous state if needed for detailed view
				newReputation: 0, // TODO: Calculate from previous state if needed for detailed view
				adminUsername: 'Admin', // TODO: Extract from request context or log metadata
				timestamp: log.createdAt
			};
		});

		// Transform adjustment logs for admin view
		const transformedLogs = adjustmentLogs.map((log) => ({
			...log,
			// Ensure proper data sanitization
			username: log.username || 'Unknown',
			timestamp: log.timestamp
		}));

		sendSuccessResponse(res, transformedLogs);
	} catch (err) {
		logger.error('ReputationAdmin', 'Error fetching reputation adjustment logs', err);
		next(err);
	}
};
