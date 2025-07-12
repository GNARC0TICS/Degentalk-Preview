import type { Request, Response } from 'express';
import { adminService } from './admin.service';
import { getUserId } from './admin.middleware';
import { AdminError } from './admin.errors';
import type { AdminId, UserId } from '@shared/types/ids';
import { userService } from '@core/services/user.service';
import { sendSuccessResponse, sendErrorResponse } from "@core/utils/transformer.helpers";
import { AdminTransformer } from './transformers/admin.transformer';

export class AdminController {
	/**
	 * Get admin dashboard statistics
	 */
	async getDashboardStats(req: Request, res: Response) {
		try {
			const stats = await adminService.getDashboardStats();
			const requestingAdmin = userService.getUserFromRequest(req);
			
			// Transform based on admin level
			const isSuperAdmin = requestingAdmin?.role === 'super_admin';
			const transformedStats = isSuperAdmin
				? AdminTransformer.toSuperAdminDashboard(stats, requestingAdmin)
				: AdminTransformer.toAdminDashboard(stats, requestingAdmin);
				
			sendSuccessResponse(res, transformedStats);
		} catch (error) {
			if (error instanceof AdminError) {
				return sendErrorResponse(res, error.message, error.httpStatus);
			}
			return sendErrorResponse(res, 'Failed to fetch dashboard statistics', 500);
		}
	}

	/**
	 * Get admin activity log
	 */
	async getActivityLog(req: Request, res: Response) {
		try {
			const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
			const includeDetails = req.query.details === 'true';
			const recentActions = await adminService.getRecentAdminActions(limit);
			const requestingAdmin = userService.getUserFromRequest(req);

			const transformedActions = AdminTransformer.toAdminActionLogList(
				recentActions, 
				requestingAdmin, 
				includeDetails
			);

			sendSuccessResponse(res, transformedActions);
		} catch (error) {
			if (error instanceof AdminError) {
				return sendErrorResponse(res, error.message, error.httpStatus);
			}
			return sendErrorResponse(res, 'Failed to fetch activity log', 500);
		}
	}

	/**
	 * Log admin action (utility method for other controllers)
	 */
	async logAction(
		req: Request,
		action: string,
		entityType: string,
		entityId: string,
		details: any = {}
	) {
		const adminUser = userService.getUserFromRequest(req);
		if (!adminUser?.id) {
			throw new AdminError('Admin user not found', 401);
		}
		const adminId = adminUser.id as AdminId;
		await adminService.logAdminAction(adminId, action, entityType, entityId, details);
	}
}

// Export singleton instance
export const adminController = new AdminController();
