/**
 * Admin Reports Controller
 *
 * Handles API requests for reports and content moderation.
 */

import { Request, Response } from 'express';
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

export class AdminReportsController {
	async getReports(req: Request, res: Response) {
		try {
			const validation = GetReportsQuerySchema.safeParse(req.query);
			if (!validation.success) {
				throw new AdminError(
					'Invalid query parameters',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					validation.error.format()
				);
			}
			const result = await adminReportsService.getReports(validation.data);
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

			const validation = ReportActionSchema.safeParse(req.body);
			if (!validation.success) {
				throw new AdminError(
					'Invalid input for resolving report',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					validation.error.format()
				);
			}
			const adminId = getUserId(req);
			const updatedReport = await adminReportsService.updateReportStatus(
				reportId,
				'resolved',
				adminId,
				validation.data.notes
			);

			await adminController.logAction(req, 'RESOLVE_REPORT', 'report', reportId.toString(), {
				notes: validation.data.notes,
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

			const validation = ReportActionSchema.safeParse(req.body);
			if (!validation.success) {
				throw new AdminError(
					'Invalid input for dismissing report',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					validation.error.format()
				);
			}
			const adminId = getUserId(req);
			const updatedReport = await adminReportsService.updateReportStatus(
				reportId,
				'dismissed',
				adminId,
				validation.data.notes
			);

			await adminController.logAction(req, 'DISMISS_REPORT', 'report', reportId.toString(), {
				notes: validation.data.notes,
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

			const validation = BanUserSchema.safeParse(req.body);
			if (!validation.success) {
				throw new AdminError(
					'Invalid ban request data',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					validation.error.format()
				);
			}
			const adminId = getUserId(req);
			const banResult = await adminReportsService.banUser(userIdToBan, validation.data, adminId);

			await adminController.logAction(req, 'BAN_USER', 'user', userIdToBan.toString(), {
				reason: validation.data.reason,
				duration: validation.data.duration
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

			const validation = DeleteContentSchema.safeParse(req.body);
			if (!validation.success) {
				throw new AdminError(
					'Invalid deletion request data',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					validation.error.format()
				);
			}
			const adminId = getUserId(req);
			const deleteResult = await adminReportsService.deleteContent(
				contentType,
				contentId,
				validation.data,
				adminId
			);

			await adminController.logAction(
				req,
				`DELETE_${contentType.toUpperCase()}`,
				contentType,
				contentId.toString(),
				{ reason: validation.data.reason }
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
