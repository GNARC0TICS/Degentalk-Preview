import type { Request, Response } from 'express';
import { userService } from '@core/services/user.service';
import type { ReportId, MessageId } from '@shared/types/ids';
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
import { sendSuccessResponse, sendErrorResponse } from "@core/utils/transformer.helpers";

export class AdminReportsController {
	async getReports(req: Request, res: Response) {
		try {
			const query = validateQueryParams(req, res, GetReportsQuerySchema);
			if (!query) return;
			const result = await adminReportsService.getReports(query);
			sendSuccessResponse(res, result);
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus);
			sendErrorResponse(res, 'Failed to fetch reports', 500);
		}
	}

	async getReportById(req: Request, res: Response) {
		try {
			const reportId = req.params.id as ReportId;

			const report = await adminReportsService.getReportById(reportId);
			sendSuccessResponse(res, report);
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus);
			sendErrorResponse(res, 'Failed to fetch report details', 500);
		}
	}

	async resolveReport(req: Request, res: Response) {
		try {
			const reportId = req.params.id as ReportId;

			const body = validateRequestBody(req, res, ReportActionSchema);
			if (!body) return;
			const adminId = userService.getUserFromRequest(req);
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
			sendSuccessResponse(res, { message: 'Report resolved successfully', data: updatedReport });
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus);
			sendErrorResponse(res, 'Failed to resolve report', 500);
		}
	}

	async dismissReport(req: Request, res: Response) {
		try {
			const reportId = req.params.id as ReportId;

			const body = validateRequestBody(req, res, ReportActionSchema);
			if (!body) return;
			const adminId = userService.getUserFromRequest(req);
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
			sendSuccessResponse(res, { message: 'Report dismissed successfully', data: updatedReport });
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus);
			sendErrorResponse(res, 'Failed to dismiss report', 500);
		}
	}

	async banUser(req: Request, res: Response) {
		try {
			const userIdToBan = req.params.userId as string; // User ID as string

			const body = validateRequestBody(req, res, BanUserSchema);
			if (!body) return;
			const adminId = userService.getUserFromRequest(req);
			const banResult = await adminReportsService.banUser(userIdToBan, body, adminId);

			await adminController.logAction(req, 'BAN_USER', 'user', userIdToBan.toString(), {
				reason: body.reason,
				duration: body.duration
			});
			sendSuccessResponse(res, { message: 'User banned successfully', data: banResult });
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus);
			sendErrorResponse(res, 'Failed to ban user', 500);
		}
	}

	async deleteContent(req: Request, res: Response) {
		try {
			const contentType = req.params.contentType as 'post' | 'thread' | 'message';
			const contentId = req.params.contentId as MessageId;

			if (!['post', 'thread', 'message'].includes(contentType)) {
				throw new AdminError(
					'Invalid content type for deletion',
					400,
					AdminErrorCodes.INVALID_REQUEST
				);
			}

			const body = validateRequestBody(req, res, DeleteContentSchema);
			if (!body) return;
			const adminId = userService.getUserFromRequest(req);
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
			sendSuccessResponse(res, deleteResult);
		} catch (error) {
			if (error instanceof AdminError)
				return sendErrorResponse(res, error.message, error.httpStatus);
			sendErrorResponse(res, 'Failed to delete content', 500);
		}
	}
}

export const adminReportsController = new AdminReportsController();
