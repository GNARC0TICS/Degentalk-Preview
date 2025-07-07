import type { Request, Response } from 'express';
import { adminService } from './admin.service';
import { getUserId } from './admin.middleware';
import { AdminError } from './admin.errors';
import type { AdminId, UserId } from '@shared/types/ids';
import { userService } from '@server/src/core/services/user.service';

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
