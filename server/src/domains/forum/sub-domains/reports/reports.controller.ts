/**
 * User-facing Reports Controller
 *
 * Handles API requests for users to report content.
 */

import type { Request, Response } from 'express';
import { reportsService } from './reports.service';
import { CreateReportSchema } from './reports.validators';
import { getUserIdFromRequest } from '@server/src/utils/auth';
import { logger } from "../../../../core/logger";

export class ReportsController {
	async createReport(req: Request, res: Response) {
		try {
			const validation = CreateReportSchema.safeParse(req.body);
			if (!validation.success) {
				return res.status(400).json({
					error: 'Invalid report data',
					details: validation.error.format()
				});
			}

			// Get user ID from session/auth middleware
			const userId = getUserIdFromRequest(req);
			if (!userId) {
				return res.status(401).json({ error: 'Authentication required' });
			}

			// Convert userId to string for UUID compatibility
			const report = await reportsService.createReport({
				...validation.data,
				reporterId: String(userId)
			});

			res.status(201).json({
				success: true,
				message: 'Report submitted successfully',
				reportId: report.id
			});
		} catch (error) {
			logger.error('Error creating report:', error);
			res.status(500).json({ error: 'Failed to submit report' });
		}
	}
}

export const reportsController = new ReportsController();
