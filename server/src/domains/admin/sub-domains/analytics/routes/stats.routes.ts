/**
 * Admin Platform Stats Routes
 *
 * Provides API endpoints for platform statistics
 */
import { Router } from 'express';
import { db } from '@db';
import { platformStatistics } from '@schema';
import { eq } from 'drizzle-orm';
import { platformStatsService } from '../services/platformStats.service';
import { isAdmin } from '../../../../auth/middleware/auth.middleware';
import { logger } from '../../../../core/logger';
import { sendSuccessResponse, sendErrorResponse } from "@core/utils/transformer.helpers";

const router = Router();

// Apply admin authorization middleware to all routes
router.use(isAdmin);

/**
 * GET /api/admin/platform-stats
 *
 * Retrieves all platform statistics
 */
router.get('/', async (req, res) => {
	try {
		// Fetch all stats from the platformStatistics table
		const stats = await db.select().from(platformStatistics);

		// Convert to a more usable format
		const formattedStats = stats.reduce(
			(acc, stat) => {
				acc[stat.statKey] = Number(stat.statValue);
				return acc;
			},
			{} as Record<string, number>
		);

		// Include the latest update timestamp
		const latestStat = stats.sort((a, b) => {
			return new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime();
		})[0];

		const response = {
			stats: formattedStats,
			lastUpdated: latestStat?.lastUpdatedAt || new Date()
		};

		sendSuccessResponse(res, response);
	} catch (error) {
		logger.error('Error fetching platform statistics:', error);
		sendErrorResponse(res, 'Failed to fetch platform statistics', 500);
	}
});

/**
 * GET /api/admin/platform-stats/:key
 *
 * Retrieves a specific platform statistic by key
 */
router.get('/:key', async (req, res) => {
	try {
		const { key } = req.params;

		const [stat] = await db
			.select()
			.from(platformStatistics)
			.where(eq(platformStatistics.statKey, key));

		if (!stat) {
			return sendErrorResponse(res, `Statistic '${key}' not found`, 404);
		}

		sendSuccessResponse(res, {
        			key: stat.statKey,
        			value: Number(stat.statValue),
        			lastUpdated: stat.lastUpdatedAt
        		});
	} catch (error) {
		logger.error('Error fetching platform statistic:', error);
		sendErrorResponse(res, 'Failed to fetch platform statistic', 500);
	}
});

/**
 * POST /api/admin/platform-stats/refresh
 *
 * Refreshes all platform statistics
 */
router.post('/refresh', async (req, res) => {
	try {
		const stats = await platformStatsService.updateAllStats();

		sendSuccessResponse(res, {
        			message: 'Platform statistics refreshed successfully',
        			stats
        		});
	} catch (error) {
		logger.error('Error refreshing platform statistics:', error);
		sendErrorResponse(res, 'Failed to refresh platform statistics', 500);
	}
});

export default router;
