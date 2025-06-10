/**
 * Admin User Groups Controller
 *
 * Handles API requests for user group management.
 */

import { Request, Response } from 'express';
import { adminUserGroupsService } from './user-groups.service';
import { AdminError, AdminErrorCodes } from '../../admin.errors';
import { getUserId } from '../../admin.middleware';
import { adminController } from '../../admin.controller';
import { UserGroupSchema, ListGroupUsersQuerySchema } from './user-groups.validators';

export class AdminUserGroupsController {
	async getAllGroups(req: Request, res: Response) {
		try {
			const groups = await adminUserGroupsService.getAllGroupsWithCounts();
			res.json(groups);
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
			const groupId = parseInt(req.params.id);
			if (isNaN(groupId))
				throw new AdminError('Invalid group ID', 400, AdminErrorCodes.INVALID_REQUEST);
			const group = await adminUserGroupsService.getGroupById(groupId);
			res.json(group);
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
			const validation = UserGroupSchema.safeParse(req.body);
			if (!validation.success) {
				throw new AdminError(
					'Invalid user group data',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					validation.error.format()
				);
			}
			const newGroup = await adminUserGroupsService.createGroup(validation.data);
			await adminController.logAction(
				req,
				'CREATE_USER_GROUP',
				'user_group',
				newGroup.id.toString(),
				validation.data
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
			const groupId = parseInt(req.params.id);
			if (isNaN(groupId))
				throw new AdminError('Invalid group ID', 400, AdminErrorCodes.INVALID_REQUEST);

			const validation = UserGroupSchema.safeParse(req.body);
			if (!validation.success) {
				throw new AdminError(
					'Invalid user group data for update',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					validation.error.format()
				);
			}
			const updatedGroup = await adminUserGroupsService.updateGroup(groupId, validation.data);
			await adminController.logAction(
				req,
				'UPDATE_USER_GROUP',
				'user_group',
				groupId.toString(),
				validation.data
			);
			res.json(updatedGroup);
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
			const groupId = parseInt(req.params.id);
			if (isNaN(groupId))
				throw new AdminError('Invalid group ID', 400, AdminErrorCodes.INVALID_REQUEST);

			const result = await adminUserGroupsService.deleteGroup(groupId);
			await adminController.logAction(req, 'DELETE_USER_GROUP', 'user_group', groupId.toString(), {
				reassignedUsers: result.reassignedUsers
			});
			res.json(result);
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
			const groupId = parseInt(req.params.id);
			if (isNaN(groupId))
				throw new AdminError('Invalid group ID', 400, AdminErrorCodes.INVALID_REQUEST);

			const queryValidation = ListGroupUsersQuerySchema.safeParse(req.query);
			if (!queryValidation.success) {
				throw new AdminError(
					'Invalid pagination parameters',
					400,
					AdminErrorCodes.VALIDATION_ERROR,
					queryValidation.error.format()
				);
			}

			const result = await adminUserGroupsService.getUsersInGroup(groupId, queryValidation.data);
			res.json(result);
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
