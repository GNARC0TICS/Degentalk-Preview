/**
 * XP Controller
 *
 * Handles API endpoints for XP-related functionality
 */

import { Request, Response, NextFunction } from 'express';
import { xpService } from './xp.service'; // Changed from XpService to xpService instance
// import { XpActionLogService } from './xp-action-log.service'; // Removed as not found and not used
// import { xpAdjustmentLog } from '@schema'; // Removed as unused
import { logger } from '../../core/logger';
import { XP_ACTION } from './xp-actions';
import { db } from '@db';
import { xpActionLogs } from './xp-actions-schema';
import { desc, eq, and, gte, sql } from 'drizzle-orm';
import { xpActionSettings, users, xpAdjustmentLogs, levels } from '@schema'; // Adjusted path
import { handleXpAward } from './events/xp.events'; // Assuming this handles level ups and logging
// import { z } from 'zod'; // Removed as unused
// import { x } from 'drizzle-orm/select-builder/select'; // Removed as unused

/**
 * Award XP to a user for a specific action (test endpoint)
 */
export const awardXpForAction = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { userId, action, metadata } = req.body;

		if (!userId || !action) {
			return res.status(400).json({
				message: 'Missing required parameters. userId and action are required.'
			});
		}

		// Ensure action is valid
		if (!Object.values(XP_ACTION).includes(action as XP_ACTION)) {
			return res.status(400).json({
				message: `Invalid action. Must be one of: ${Object.values(XP_ACTION).join(', ')}`
			});
		}

		logger.info('Awarding XP for action (via API)', JSON.stringify({ userId, action, metadata }));

		// Call the service to award XP
		const result = await xpService.awardXp(Number(userId), action as XP_ACTION, metadata); // Changed to xpService instance

		if (!result) {
			return res.status(429).json({
				message: 'Could not award XP. You may have reached a limit for this action.'
			});
		}

		res.status(200).json({
			message: 'XP awarded successfully',
			result
		});
	} catch (error: any) {
		// Keep error as any for now, specific handling below
		logger.error(
			'Error awarding XP for action:',
			error instanceof Error ? error.message : String(error)
		);
		if (error.message && error.message.includes('not found')) {
			// This check might need adjustment if error is not Error instance
			return res.status(404).json({ message: error.message });
		}
		next(error);
	}
};

/**
 * Get information about a user's XP
 */
export const getUserXpInfo = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = Number(req.params.userId);

		if (!userId) {
			return res.status(400).json({ message: 'User ID is required' });
		}

		const xpInfo = await xpService.getUserXpInfo(userId); // Changed to xpService instance

		res.status(200).json(xpInfo);
	} catch (error: any) {
		// Keep error as any for now
		logger.error(
			'Error getting user XP info:',
			error instanceof Error ? error.message : String(error)
		);
		if (error.message && error.message.includes('not found')) {
			// This check might need adjustment
			return res.status(404).json({ message: error.message });
		}
		next(error);
	}
};

/**
 * Get all available XP actions and their values
 */
export const getXpActions = async (req: Request, res: Response) => {
	try {
		// Dynamically import to avoid issues if xp-actions itself has problems during initial load
		const xpActionsModule = await import('./xp-actions');
		res.status(200).json({
			actions: Object.values(xpActionsModule.XP_ACTION) // Use the imported module
		});
	} catch (error) {
		logger.error(
			'Error getting XP actions:',
			error instanceof Error ? error.message : String(error)
		);
		res.status(500).json({ message: 'Error retrieving XP actions' });
	}
};

/**
 * Get XP action logs for a user
 *
 * Supports filtering by date range and action type
 */
export const getUserXpLogs = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// Get user ID from params or from authenticated user
		const paramUserId = req.params.userId ? Number(req.params.userId) : undefined;
		const authUserId = (req.user as any)?.id; // Added type assertion

		// If not admin and trying to access someone else's logs, reject
		const isOwnLogs = paramUserId === authUserId;
		const isAdmin = (req.user as any)?.role === 'admin'; // Added type assertion

		if (!isOwnLogs && !isAdmin) {
			return res.status(403).json({
				message: 'You can only access your own XP logs'
			});
		}

		const userIdToQuery = paramUserId || authUserId; // Use a different variable name

		if (!userIdToQuery) {
			return res.status(400).json({ message: 'User ID is required' });
		}

		// Parse query parameters
		const limit = req.query.limit ? Number(req.query.limit) : 50;
		const offset = req.query.offset ? Number(req.query.offset) : 0;
		const action = req.query.action as string;

		// Date filters
		const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
		const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
		const period = req.query.period as string; // 'today', 'week', 'month'

		// Build the query filters
		let filters = [eq(xpActionLogs.userId, userIdToQuery)]; // Use userIdToQuery

		// Add action filter if specified
		if (action) {
			filters.push(eq(xpActionLogs.action, action));
		}

		// Add date range filters if specified
		if (startDate) {
			filters.push(gte(xpActionLogs.createdAt, startDate));
		}

		if (endDate) {
			filters.push(sql`${xpActionLogs.createdAt} <= ${endDate}`);
		}

		// Handle period shortcuts
		if (period) {
			const now = new Date();
			let periodStartDate: Date | null = null; // Initialize to null

			switch (period) {
				case 'today':
					periodStartDate = new Date(now.setHours(0, 0, 0, 0));
					break;
				case 'week':
					periodStartDate = new Date(now);
					periodStartDate.setDate(now.getDate() - now.getDay());
					periodStartDate.setHours(0, 0, 0, 0);
					break;
				case 'month':
					periodStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
					break;
				default:
					// If period is invalid, periodStartDate remains null (or explicitly set it again)
					periodStartDate = null;
					break;
			}

			if (periodStartDate !== null) {
				// Explicitly check for non-null
				filters.push(gte(xpActionLogs.createdAt, periodStartDate));
			}
		}

		// Execute the query with all filters
		const logs = await db
			.select()
			.from(xpActionLogs)
			.where(and(...filters))
			.orderBy(desc(xpActionLogs.createdAt))
			.limit(limit)
			.offset(offset);

		// Get total count for pagination
		const countResult = await db
			.select({ count: sql<number>`count(*)` }) // Added type assertion for sql count
			.from(xpActionLogs)
			.where(and(...filters));

		const totalCount = Number(countResult[0]?.count || 0);

		// Format the response
		res.status(200).json({
			logs,
			pagination: {
				total: totalCount,
				limit,
				offset,
				hasMore: offset + logs.length < totalCount
			},
			filters: {
				action,
				period,
				startDate: startDate?.toISOString() || null, // Send ISO string or null
				endDate: endDate?.toISOString() || null // Send ISO string or null
			}
		});
	} catch (error) {
		logger.error(
			'Error getting user XP logs:',
			error instanceof Error ? error.message : String(error)
		);
		next(error);
	}
};

export const awardActionXp = async (req: Request, res: Response) => {
	try {
		const { userId, action, entityId } = req.body;
		const authenticatedUserId = (req as any).user?.id; // Assuming user ID is available from auth middleware

		if (!userId || !action) {
			// entityId can be optional for some actions
			return res.status(400).json({ error: 'Missing required parameters (userId, action).' });
		}

		// Optional: Validate that authenticatedUserId matches userId or is an admin if they differ
		// if (userId !== authenticatedUserId && !(req as any).user?.isAdmin) {
		//   return res.status(403).json({ error: 'Forbidden: Cannot award XP for another user.'});
		// }

		const [setting] = await db
			.select()
			.from(xpActionSettings)
			.where(eq(xpActionSettings.action, action));

		if (!setting || !setting.enabled) {
			logger.warn('XP_CONTROLLER', `XP action '${action}' not found or not enabled.`);
			// Return a success to not break client flow, but award 0 XP
			return res
				.status(200)
				.json({ xpAwarded: 0, message: 'XP action not configured or disabled.' });
		}

		const xpToAward = setting.baseValue;
		if (xpToAward <= 0) {
			return res
				.status(200)
				.json({ xpAwarded: 0, message: 'XP amount for action is zero or negative.' });
		}

		// Use the centralized event handler for awarding XP
		// This will handle XP update, logging, and level ups
		const { newXp, leveledUp, newLevel } = await handleXpAward(
			Number(userId),
			xpToAward,
			action, // source
			`${action} for entity #${entityId}` // reason for the log
		);

		res.status(200).json({
			xpAwarded: xpToAward,
			newTotalXp: newXp,
			leveledUp,
			currentLevel: newLevel
		});
	} catch (err: any) {
		logger.error('XP_CONTROLLER', `Error in awardActionXp for action '${req.body.action}':`, err);
		res.status(500).json({ error: err.message || 'Server error awarding XP.' });
	}
};
