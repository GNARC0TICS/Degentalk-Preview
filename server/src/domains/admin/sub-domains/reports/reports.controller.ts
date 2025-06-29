/**
 * Admin Reports Controller
 *
 * Handles API requests for reports and content moderation.
 */

import type { Request, Response } from 'express';
import { adminReportsService } from './reports.service';
import { AdminError, AdminErrorCodes } from '../../admin.errors';
import { getUserId } from '../../admin.middleware';
import { adminController } from '../../admin.controller';
import {
	GetReportsQuerySchema,
	ReportActionSchema,
	BanUserSchema,
	DeleteContentSchema
} from './reports.validators';
import { validateRequestBody, validateQueryParams } from '../../admin.validation';

export class AdminReportsController {
	async getReports(req: Request, res: Response) {
		try {
			const query = validateQueryParams(req, res, GetReportsQuerySchema);
			if (!query) return;
			const result = await adminReportsService.getReports(query);
			res.json(result);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to fetch reports' });
		}
	}

	async getReportById(req: Request, res: Response) {
		try {
			const reportId = parseInt(req.params.id);
			if (isNaN(reportId))
				throw new AdminError('Invalid report ID', 400, AdminErrorCodes.INVALID_REQUEST);

			const report = await adminReportsService.getReportById(reportId);
			res.json(report);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to fetch report details' });
		}
	}

	async resolveReport(req: Request, res: Response) {
		try {
			const reportId = parseInt(req.params.id);
			if (isNaN(reportId))
				throw new AdminError('Invalid report ID', 400, AdminErrorCodes.INVALID_REQUEST);

			const body = validateRequestBody(req, res, ReportActionSchema);
			if (!body) return;
			const adminId = getUserId(req);
			const updatedReport = await adminReportsService.updateReportStatus(
				reportId,
				'resolved',
				adminId,
				body.notes
			);

			await adminController.logAction(req, 'RESOLVE_REPORT', 'report', reportId.toString(), {
				notes: body.notes,
				finalStatus: 'resolved'
			});
			res.json({ message: 'Report resolved successfully', data: updatedReport });
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to resolve report' });
		}
	}

	async dismissReport(req: Request, res: Response) {
		try {
			const reportId = parseInt(req.params.id);
			if (isNaN(reportId))
				throw new AdminError('Invalid report ID', 400, AdminErrorCodes.INVALID_REQUEST);

			const body = validateRequestBody(req, res, ReportActionSchema);
			if (!body) return;
			const adminId = getUserId(req);
			const updatedReport = await adminReportsService.updateReportStatus(
				reportId,
				'dismissed',
				adminId,
				body.notes
			);

			await adminController.logAction(req, 'DISMISS_REPORT', 'report', reportId.toString(), {
				notes: body.notes,
				finalStatus: 'dismissed'
			});
			res.json({ message: 'Report dismissed successfully', data: updatedReport });
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to dismiss report' });
		}
	}

	async banUser(req: Request, res: Response) {
		try {
			const userIdToBan = parseInt(req.params.userId); // Assuming route is /users/:userId/ban
			if (isNaN(userIdToBan))
				throw new AdminError('Invalid user ID for ban', 400, AdminErrorCodes.INVALID_REQUEST);

			const body = validateRequestBody(req, res, BanUserSchema);
			if (!body) return;
			const adminId = getUserId(req);
			const banResult = await adminReportsService.banUser(userIdToBan, body, adminId);

			await adminController.logAction(req, 'BAN_USER', 'user', userIdToBan.toString(), {
				reason: body.reason,
				duration: body.duration
			});
			res.json({ message: 'User banned successfully', data: banResult });
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to ban user' });
		}
	}

	async deleteContent(req: Request, res: Response) {
		try {
			const contentType = req.params.contentType as 'post' | 'thread' | 'message';
			const contentId = parseInt(req.params.contentId);

			if (!['post', 'thread', 'message'].includes(contentType)) {
				throw new AdminError(
					'Invalid content type for deletion',
					400,
					AdminErrorCodes.INVALID_REQUEST
				);
			}
			if (isNaN(contentId))
				throw new AdminError(
					'Invalid content ID for deletion',
					400,
					AdminErrorCodes.INVALID_REQUEST
				);

			const body = validateRequestBody(req, res, DeleteContentSchema);
			if (!body) return;
			const adminId = getUserId(req);
			const deleteResult = await adminReportsService.deleteContent(
				contentType,
				contentId,
				body,
				adminId
			);

			await adminController.logAction(
				req,
				`DELETE_${contentType.toUpperCase()}`,
				contentType,
				contentId.toString(),
				{ reason: body.reason }
			);
			res.json(deleteResult);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to delete content' });
		}
	}
}

export const adminReportsController = new AdminReportsController();
