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
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

export class AdminAnalyticsController {
	async getOverviewStats(req: Request, res: Response) {
		try {
			const query = validateQueryParams(req, res, AnalyticsPeriodSchema);
			if (!query) return;
			const stats = await adminAnalyticsService.getOverviewStats(query);
			sendSuccessResponse(res, stats);
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus);
			sendErrorResponse(res, 'Failed to fetch overview statistics', 500);
		}
	}

	async getUserGrowthChart(req: Request, res: Response) {
		try {
			const query = validateQueryParams(req, res, AnalyticsQuerySchema);
			if (!query) return;
			const chartData = await adminAnalyticsService.getUserGrowthChart(query);
			sendSuccessResponse(res, chartData);
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus);
			sendErrorResponse(res, 'Failed to fetch user growth chart data', 500);
		}
	}

	async getMostActiveThreads(req: Request, res: Response) {
		try {
			const query = validateQueryParams(req, res, AnalyticsQuerySchema);
			if (!query) return;
			const threads = await adminAnalyticsService.getMostActiveThreads(query);
			sendSuccessResponse(res, threads);
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus);
			sendErrorResponse(res, 'Failed to fetch most active threads', 500);
		}
	}

	// Placeholder for more analytics endpoints
	// async getSomeOtherAnalytics(req: Request, res: Response) { ... }
}

export const adminAnalyticsController = new AdminAnalyticsController();
