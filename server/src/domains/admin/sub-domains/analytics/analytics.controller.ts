/**
 * Admin Analytics Controller
 *
 * Handles API requests for platform analytics.
 */

import type { Request, Response } from 'express';
import { adminAnalyticsService } from './analytics.service';
import { AdminError, AdminErrorCodes } from '../../admin.errors';
import { AnalyticsQuerySchema, AnalyticsPeriodSchema } from './analytics.validators';
import { validateQueryParams } from '../../admin.validation';

export class AdminAnalyticsController {
	async getOverviewStats(req: Request, res: Response) {
		try {
			const query = validateQueryParams(req, res, AnalyticsPeriodSchema);
			if (!query) return;
			const stats = await adminAnalyticsService.getOverviewStats(query);
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
			const query = validateQueryParams(req, res, AnalyticsQuerySchema);
			if (!query) return;
			const chartData = await adminAnalyticsService.getUserGrowthChart(query);
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
			const query = validateQueryParams(req, res, AnalyticsQuerySchema);
			if (!query) return;
			const threads = await adminAnalyticsService.getMostActiveThreads(query);
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
