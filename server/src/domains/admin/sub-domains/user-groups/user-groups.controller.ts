/**
 * Admin User Groups Controller
 *
 * Handles API requests for user group management.
 */

import type { Request, Response } from 'express';
import type { GroupId } from '@shared/types/ids';
import { adminUserGroupsService } from './user-groups.service';
import { AdminError, AdminErrorCodes } from '../../admin.errors';
import { getUserId } from '../../admin.middleware';
import { adminController } from '../../admin.controller';
import { UserGroupSchema, ListGroupUsersQuerySchema } from './user-groups.validators';
import { validateRequestBody, validateQueryParams } from '../../admin.validation';
import { sendSuccessResponse, sendErrorResponse } from "@server/src/core/utils/transformer.helpers";

export class AdminUserGroupsController {
	async getAllGroups(req: Request, res: Response) {
		try {
			const groups = await adminUserGroupsService.getAllGroupsWithCounts();
			sendSuccessResponse(res, groups);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to fetch user groups' });
		}
	}

	async getGroupById(req: Request, res: Response) {
		try {
			const groupId = req.params.id as GroupId;
			if (isNaN(groupId))
				throw new AdminError('Invalid group ID', 400, AdminErrorCodes.INVALID_REQUEST);
			const group = await adminUserGroupsService.getGroupById(groupId);
			sendSuccessResponse(res, group);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to fetch user group' });
		}
	}

	async createGroup(req: Request, res: Response) {
		try {
			const data = validateRequestBody(req, res, UserGroupSchema);
			if (!data) return;
			const newGroup = await adminUserGroupsService.createGroup(data);
			await adminController.logAction(
				req,
				'CREATE_USER_GROUP',
				'user_group',
				newGroup.id.toString(),
				data
			);
			res.status(201).json(newGroup);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to create user group' });
		}
	}

	async updateGroup(req: Request, res: Response) {
		try {
			const groupId = req.params.id as GroupId;
			if (isNaN(groupId))
				throw new AdminError('Invalid group ID', 400, AdminErrorCodes.INVALID_REQUEST);

			const data = validateRequestBody(req, res, UserGroupSchema);
			if (!data) return;
			const updatedGroup = await adminUserGroupsService.updateGroup(groupId, data);
			await adminController.logAction(
				req,
				'UPDATE_USER_GROUP',
				'user_group',
				groupId.toString(),
				data
			);
			sendSuccessResponse(res, updatedGroup);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to update user group' });
		}
	}

	async deleteGroup(req: Request, res: Response) {
		try {
			const groupId = req.params.id as GroupId;
			if (isNaN(groupId))
				throw new AdminError('Invalid group ID', 400, AdminErrorCodes.INVALID_REQUEST);

			const result = await adminUserGroupsService.deleteGroup(groupId);
			await adminController.logAction(req, 'DELETE_USER_GROUP', 'user_group', groupId.toString(), {
				reassignedUsers: result.reassignedUsers
			});
			sendSuccessResponse(res, result);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to delete user group' });
		}
	}

	async getUsersInGroup(req: Request, res: Response) {
		try {
			const groupId = req.params.id as GroupId;
			if (isNaN(groupId))
				throw new AdminError('Invalid group ID', 400, AdminErrorCodes.INVALID_REQUEST);

			const query = validateQueryParams(req, res, ListGroupUsersQuerySchema);
			if (!query) return;

			const result = await adminUserGroupsService.getUsersInGroup(groupId, query);
			sendSuccessResponse(res, result);
		} catch (error) {
			if (error instanceof AdminError)
				return res
					.status(error.httpStatus)
					.json({ error: error.message, code: error.code, details: error.details });
			res.status(500).json({ error: 'Failed to fetch users in group' });
		}
	}
}

export const adminUserGroupsController = new AdminUserGroupsController();
