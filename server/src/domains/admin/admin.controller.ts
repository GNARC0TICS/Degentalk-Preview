/**
 * Admin Controller
 *
 * Handle admin panel API requests
 */

import type { Request, Response } from 'express';
import { adminService } from './admin.service';
import { getUserId } from './admin.middleware';
import { AdminError } from './admin.errors';

export class AdminController {
	/**
	 * Get admin dashboard statistics
	 */
	async getDashboardStats(req: Request, res: Response) {
		try {
			const stats = await adminService.getDashboardStats();
			return res.json(stats);
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					error: error.message,
					code: error.code
				});
			}
			return res.status(500).json({
				error: 'Failed to fetch dashboard statistics'
			});
		}
	}

	/**
	 * Get admin activity log
	 */
	async getActivityLog(req: Request, res: Response) {
		try {
			const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
			const recentActions = await adminService.getRecentAdminActions(limit);

			return res.json(recentActions);
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					error: error.message,
					code: error.code
				});
			}
			return res.status(500).json({
				error: 'Failed to fetch activity log'
			});
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
		const adminId = getUserId(req);
		await adminService.logAdminAction(adminId, action, entityType, entityId, details);
	}
}

// Export singleton instance
export const adminController = new AdminController();
