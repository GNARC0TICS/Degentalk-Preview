/**
 * Admin Users Controller
 *
 * Handle admin user management API requests
 */

import { Request, Response } from 'express';
import { adminUsersService } from './users.service';
import { AdminError } from '../../admin.errors';
import { adminController } from '../../admin.controller';
import { getUserId } from '../../admin.middleware';
import { AdminPaginationQuery, AdminUserUpdateSchema } from '@shared/validators/admin';
import { z } from 'zod';

export class AdminUsersController {
	/**
	 * Get paginated users with filtering
	 */
	async getUsers(req: Request, res: Response) {
		try {
			// Validate query params using Zod
			const queryParams = AdminPaginationQuery.safeParse(req.query);
			if (!queryParams.success) {
				return res.status(400).json({
					error: 'Invalid query parameters',
					details: queryParams.error.format()
				});
			}

			const users = await adminUsersService.getUsers(queryParams.data);
			return res.json(users);
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					error: error.message,
					code: error.code
				});
			}
			return res.status(500).json({
				error: 'Failed to fetch users'
			});
		}
	}

	/**
	 * Get a user by ID
	 */
	async getUserById(req: Request, res: Response) {
		try {
			const userId = Number(req.params.id);
			if (isNaN(userId)) {
				return res.status(400).json({ error: 'Invalid user ID' });
			}

			const userData = await adminUsersService.getUserById(userId);
			return res.json(userData);
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					error: error.message,
					code: error.code
				});
			}
			return res.status(500).json({
				error: 'Failed to fetch user'
			});
		}
	}

	/**
	 * Update a user
	 */
	async updateUser(req: Request, res: Response) {
		try {
			const userId = Number(req.params.id);
			if (isNaN(userId)) {
				return res.status(400).json({ error: 'Invalid user ID' });
			}

			// Validate request body
			const validatedData = AdminUserUpdateSchema.safeParse(req.body);
			if (!validatedData.success) {
				return res.status(400).json({
					error: 'Invalid user data',
					details: validatedData.error.format()
				});
			}

			const updatedUser = await adminUsersService.updateUser(userId, validatedData.data);

			// Log admin action
			const adminId = getUserId(req);
			await adminController.logAction(req, 'UPDATE_USER', 'user', userId.toString(), {
				adminId,
				changes: validatedData.data
			});

			return res.json(updatedUser);
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					error: error.message,
					code: error.code
				});
			}
			return res.status(500).json({
				error: 'Failed to update user'
			});
		}
	}
}

// Export singleton instance
export const adminUsersController = new AdminUsersController();
