import type { Request, Response } from 'express';
import { userService } from '@core/services/user.service';
import { AdminRolesService } from './roles.service';
import { createRoleSchema, updateRoleSchema } from './roles.validators';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';
import {
	validateRequestBody,
	validateNumberParam,
	AdminOperationBoundary,
	formatAdminResponse
} from '../../shared';

const service = new AdminRolesService();

export class AdminRolesController {
	async list(req: Request, res: Response) {
		const boundary =
			req.adminBoundary?.('LIST_ROLES', 'role') ||
			new AdminOperationBoundary({
				operation: 'LIST_ROLES',
				entityType: 'role',
				userId: (userService.getUserFromRequest(req) as any)?.id,
				timestamp: new Date()
			});

		const result = await boundary.execute(async () => {
			const roles = await service.list();
			return formatAdminResponse(roles, 'LIST_ROLES', 'role');
		});

		if (result.success) {
			return sendSuccessResponse(res, result.data);
		} else {
			return sendErrorResponse(
				res,
				result.error?.message || 'Failed to list roles',
				result.error?.httpStatus
			);
		}
	}

	async create(req: Request, res: Response) {
		const validatedData = validateRequestBody(req, res, createRoleSchema);
		if (!validatedData) return;

		const boundary =
			req.adminBoundary?.('CREATE_ROLE', 'role') ||
			new AdminOperationBoundary({
				operation: 'CREATE_ROLE',
				entityType: 'role',
				userId: (userService.getUserFromRequest(req) as any)?.id,
				timestamp: new Date()
			});

		const result = await boundary.execute(async () => {
			const role = await service.create(validatedData);
			return formatAdminResponse(role, 'CREATE_ROLE', 'role', { roleData: validatedData });
		});

		if (result.success) {
			return sendSuccessResponse(res, result.data, 'Role created successfully', 201);
		} else {
			return sendErrorResponse(
				res,
				result.error?.message || 'Failed to create role',
				result.error?.httpStatus
			);
		}
	}

	async update(req: Request, res: Response) {
		const roleId = validateNumberParam(req, res, 'id');
		if (roleId === null) return;

		const validatedData = validateRequestBody(req, res, updateRoleSchema);
		if (!validatedData) return;

		const boundary =
			req.adminBoundary?.('UPDATE_ROLE', 'role', roleId) ||
			new AdminOperationBoundary({
				operation: 'UPDATE_ROLE',
				entityType: 'role',
				entityId: roleId,
				userId: (userService.getUserFromRequest(req) as any)?.id,
				timestamp: new Date()
			});

		const result = await boundary.execute(async () => {
			const role = await service.update(String(roleId), validatedData);
			return formatAdminResponse(role, 'UPDATE_ROLE', 'role', { roleId, changes: validatedData });
		});

		if (result.success) {
			return sendSuccessResponse(res, result.data, 'Role updated successfully');
		} else {
			return sendErrorResponse(
				res,
				result.error?.message || 'Failed to update role',
				result.error?.httpStatus
			);
		}
	}

	async delete(req: Request, res: Response) {
		const roleId = validateNumberParam(req, res, 'id');
		if (roleId === null) return;

		const boundary =
			req.adminBoundary?.('DELETE_ROLE', 'role', roleId) ||
			new AdminOperationBoundary({
				operation: 'DELETE_ROLE',
				entityType: 'role',
				entityId: roleId,
				userId: (userService.getUserFromRequest(req) as any)?.id,
				timestamp: new Date()
			});

		const result = await boundary.execute(async () => {
			const deletionResult = await service.delete(String(roleId));
			return formatAdminResponse(deletionResult, 'DELETE_ROLE', 'role', { roleId });
		});

		if (result.success) {
			return sendSuccessResponse(res, result.data, 'Role deleted successfully');
		} else {
			return sendErrorResponse(
				res,
				result.error?.message || 'Failed to delete role',
				result.error?.httpStatus
			);
		}
	}
}
