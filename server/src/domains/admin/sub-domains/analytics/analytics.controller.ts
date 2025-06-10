/**
 * Admin Analytics Controller
 *
 * Handles API requests for platform analytics.
 */

import { Request, Response } from 'express';
import { adminAnalyticsService } from './analytics.service';
import { AdminError, AdminErrorCodes } from '../../admin.errors';
import { AnalyticsQuerySchema, AnalyticsPeriodSchema } from './analytics.validators';

export class AdminAnalyticsController {
	async getOverviewStats(req: Request, res: Response) {
		try {
			const validation = AnalyticsPeriodSchema.safeParse(req.query);
			if (!validation.success) {
				throw new AdminError(
					'Invalid query parameters for overview stats',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					validation.error.format()
				);
			}
			const stats = await adminAnalyticsService.getOverviewStats(validation.data);
			res.json(stats);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to fetch overview statistics' });
		}
	}

	async getUserGrowthChart(req: Request, res: Response) {
		try {
			const validation = AnalyticsQuerySchema.safeParse(req.query);
			if (!validation.success) {
				throw new AdminError(
					'Invalid query parameters for user growth chart',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					validation.error.format()
				);
			}
			const chartData = await adminAnalyticsService.getUserGrowthChart(validation.data);
			res.json(chartData);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to fetch user growth chart data' });
		}
	}

	async getMostActiveThreads(req: Request, res: Response) {
		try {
			const validation = AnalyticsQuerySchema.safeParse(req.query);
			if (!validation.success) {
				throw new AdminError(
					'Invalid query parameters for most active threads',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					validation.error.format()
				);
			}
			const threads = await adminAnalyticsService.getMostActiveThreads(validation.data);
			res.json(threads);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to fetch most active threads' });
		}
	}

	// Placeholder for more analytics endpoints
	// async getSomeOtherAnalytics(req: Request, res: Response) { ... }
}

export const adminAnalyticsController = new AdminAnalyticsController();
