import type { Request, Response } from 'express';
import { z } from 'zod';
import { adminUserBulkOperationsService } from './bulk-operations.service';
import {
	sendSuccess,
	sendError,
	validateRequestBody,
	AdminOperationBoundary,
	formatAdminResponse
} from '../../shared';

const bulkRoleAssignmentSchema = z.object({
	userIds: z.array(z.number()).min(1).max(100), // Limit to 100 users per operation
	newRole: z.enum(['user', 'mod', 'admin']),
	reason: z.string().optional()
});

const bulkBanSchema = z.object({
	userIds: z.array(z.number()).min(1).max(50), // Smaller limit for ban operations
	reason: z.string().min(5).max(500)
});

const bulkUnbanSchema = z.object({
	userIds: z.array(z.number()).min(1).max(50),
	reason: z.string().optional()
});

export class AdminUserBulkOperationsController {
	/**
	 * Bulk assign roles to multiple users
	 */
	async bulkAssignRoles(req: Request, res: Response) {
		const validatedData = validateRequestBody(req, res, bulkRoleAssignmentSchema);
		if (!validatedData) return;

		const adminId = (req.user as any)?.id;
		if (!adminId) {
			return sendError(res, 'Admin user ID required', 401);
		}

		const boundary =
			req.adminBoundary?.('BULK_ROLE_ASSIGNMENT', 'user') ||
			new AdminOperationBoundary({
				operation: 'BULK_ROLE_ASSIGNMENT',
				entityType: 'user',
				userId: adminId,
				timestamp: new Date()
			});

		const result = await boundary.execute(async () => {
			const operationResult = await adminUserBulkOperationsService.bulkAssignRoles({
				...validatedData,
				adminId
			});

			return formatAdminResponse(operationResult, 'BULK_ROLE_ASSIGNMENT', 'user', {
				userCount: validatedData.userIds.length,
				newRole: validatedData.newRole,
				processed: operationResult.processed,
				failed: operationResult.failed
			});
		});

		if (result.success) {
			return sendSuccess(
				res,
				result.data,
				`Bulk role assignment completed. ${result.data.processed} users updated, ${result.data.failed} failed.`
			);
		} else {
			return sendError(
				res,
				result.error?.message || 'Bulk role assignment failed',
				result.error?.httpStatus
			);
		}
	}

	/**
	 * Bulk ban multiple users
	 */
	async bulkBanUsers(req: Request, res: Response) {
		const validatedData = validateRequestBody(req, res, bulkBanSchema);
		if (!validatedData) return;

		const adminId = (req.user as any)?.id;
		if (!adminId) {
			return sendError(res, 'Admin user ID required', 401);
		}

		const boundary =
			req.adminBoundary?.('BULK_BAN_USERS', 'user') ||
			new AdminOperationBoundary({
				operation: 'BULK_BAN_USERS',
				entityType: 'user',
				userId: adminId,
				timestamp: new Date()
			});

		const result = await boundary.execute(async () => {
			const operationResult = await adminUserBulkOperationsService.bulkBanUsers({
				...validatedData,
				adminId
			});

			return formatAdminResponse(operationResult, 'BULK_BAN_USERS', 'user', {
				userCount: validatedData.userIds.length,
				reason: validatedData.reason,
				processed: operationResult.processed,
				failed: operationResult.failed
			});
		});

		if (result.success) {
			return sendSuccess(
				res,
				result.data,
				`Bulk ban completed. ${result.data.processed} users banned, ${result.data.failed} failed.`
			);
		} else {
			return sendError(
				res,
				result.error?.message || 'Bulk ban operation failed',
				result.error?.httpStatus
			);
		}
	}

	/**
	 * Bulk unban multiple users
	 */
	async bulkUnbanUsers(req: Request, res: Response) {
		const validatedData = validateRequestBody(req, res, bulkUnbanSchema);
		if (!validatedData) return;

		const adminId = (req.user as any)?.id;
		if (!adminId) {
			return sendError(res, 'Admin user ID required', 401);
		}

		const boundary =
			req.adminBoundary?.('BULK_UNBAN_USERS', 'user') ||
			new AdminOperationBoundary({
				operation: 'BULK_UNBAN_USERS',
				entityType: 'user',
				userId: adminId,
				timestamp: new Date()
			});

		const result = await boundary.execute(async () => {
			const operationResult = await adminUserBulkOperationsService.bulkUnbanUsers({
				...validatedData,
				adminId
			});

			return formatAdminResponse(operationResult, 'BULK_UNBAN_USERS', 'user', {
				userCount: validatedData.userIds.length,
				processed: operationResult.processed,
				failed: operationResult.failed
			});
		});

		if (result.success) {
			return sendSuccess(
				res,
				result.data,
				`Bulk unban completed. ${result.data.processed} users unbanned, ${result.data.failed} failed.`
			);
		} else {
			return sendError(
				res,
				result.error?.message || 'Bulk unban operation failed',
				result.error?.httpStatus
			);
		}
	}

	/**
	 * Get bulk operation history for audit purposes
	 */
	async getBulkOperationHistory(req: Request, res: Response) {
		const adminId = (req.user as any)?.id;
		if (!adminId) {
			return sendError(res, 'Admin user ID required', 401);
		}

		const limit = parseInt(req.query.limit as string) || 50;

		const boundary =
			req.adminBoundary?.('GET_BULK_HISTORY', 'audit') ||
			new AdminOperationBoundary({
				operation: 'GET_BULK_HISTORY',
				entityType: 'audit',
				userId: adminId,
				timestamp: new Date()
			});

		const result = await boundary.execute(async () => {
			const history = await adminUserBulkOperationsService.getBulkOperationHistory(adminId, limit);
			return formatAdminResponse(history, 'GET_BULK_HISTORY', 'audit');
		});

		if (result.success) {
			return sendSuccess(res, result.data);
		} else {
			return sendError(
				res,
				result.error?.message || 'Failed to fetch bulk operation history',
				result.error?.httpStatus
			);
		}
	}
}
