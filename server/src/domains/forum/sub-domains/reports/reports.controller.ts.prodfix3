/**
 * User-facing Reports Controller
 *
 * Handles API requests for users to report content.
 */

import type { Request, Response } from 'express';
import { reportsService } from './reports.service';
import { CreateReportSchema } from './reports.validators';
import { getUserIdFromRequest } from '@server-utils/auth';
import { logger } from "../../../../core/logger";
import { 
	sendSuccessResponse,
	sendErrorResponse
} from '@core/utils/transformer.helpers';

export class ReportsController {
	async createReport(req: Request, res: Response) {
		try {
			const validation = CreateReportSchema.safeParse(req.body);
			if (!validation.success) {
				return sendErrorResponse(res, 'Invalid report data', 400, {
					details: validation.error.format()
				});
			}

			// Get user ID from session/auth middleware
			const userId = getUserIdFromRequest(req);
			if (!userId) {
				return sendErrorResponse(res, 'Authentication required', 401);
			}

			// Convert userId to string for UUID compatibility
			const report = await reportsService.createReport({
				...validation.data,
				reporterId: String(userId)
			});

			res.status(201);
			sendSuccessResponse(res, {
				reportId: report.id
			}, 'Report submitted successfully');
		} catch (error) {
			logger.error('Error creating report:', error);
			sendErrorResponse(res, 'Failed to submit report', 500);
		}
	}
}

export const reportsController = new ReportsController();
