import type { Request, Response } from 'express';
import { userService } from '@server/src/core/services/user.service';
import { adminUsersService } from './users.service';
import { AdminError } from '../../admin.errors';
import { adminController } from '../../admin.controller';
import { getUserId } from '../../admin.middleware';
import { AdminPaginationQuery, AdminUserUpdateSchema } from '@shared/validators/admin';
import { validateQueryParams, validateRequestBody } from '../../admin.validation';
import { z } from 'zod';
import { db } from '@db';
import { users } from '@schema';
import { ilike } from 'drizzle-orm';
import type { UserId, AdminId } from '@shared/types/ids';
import { toId, isValidId } from '@shared/utils/id';
import { logger } from '../../../../core/logger';

export class AdminUsersController {
	/**
	 * Get paginated users with filtering
	 */
	async getUsers(req: Request, res: Response) {
		try {
			const query = validateQueryParams(req, res, AdminPaginationQuery);
			if (!query) return;
			const users = await adminUsersService.getUsers(query);
			return res.json({
				success: true,
				data: users
			});
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					success: false,
					error: error.message,
					code: error.code
				});
			}
			return res.status(500).json({
				success: false,
				error: 'Failed to fetch users'
			});
		}
	}

	/**
	 * Get a user by ID
	 */
	async getUserById(req: Request, res: Response) {
		try {
			const userIdParam = req.params.id;
			if (!isValidId(userIdParam)) {
				return res.status(400).json({
					success: false,
					error: 'Invalid user ID format'
				});
			}

			const userId = toId<'User'>(userIdParam);
			const userData = await adminUsersService.getUserById(userId);
			return res.json({
				success: true,
				data: userData
			});
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					success: false,
					error: error.message,
					code: error.code
				});
			}
			return res.status(500).json({
				success: false,
				error: 'Failed to fetch user'
			});
		}
	}

	/**
	 * Update a user
	 */
	async updateUser(req: Request, res: Response) {
		try {
			const userIdParam = req.params.id;
			if (!isValidId(userIdParam)) {
				return res.status(400).json({
					success: false,
					error: 'Invalid user ID format'
				});
			}

			const userId = toId<'User'>(userIdParam);
			const data = validateRequestBody(req, res, AdminUserUpdateSchema);
			if (!data) return;
			const updatedUser = await adminUsersService.updateUser(userId, data);

			// Log admin action
			await adminController.logAction(req, 'UPDATE_USER', 'user', userId, {
				changes: data
			});

			return res.json({
				success: true,
				data: updatedUser,
				message: 'User updated successfully'
			});
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					success: false,
					error: error.message,
					code: error.code
				});
			}
			return res.status(500).json({
				success: false,
				error: 'Failed to update user'
			});
		}
	}

	/**
	 * Create a new user
	 */
	async createUser(req: Request, res: Response) {
		try {
			const createSchema = AdminUserUpdateSchema.extend({
				password: z.string().min(6).optional(),
				username: z.string().min(3).max(50),
				email: z.string().email()
			});
			const dataCreate = validateRequestBody(req, res, createSchema);
			if (!dataCreate) return;
			const newUser = await adminUsersService.createUser(dataCreate);

			// Log admin action
			await adminController.logAction(req, 'CREATE_USER', 'user', newUser.id, {
				userData: dataCreate
			});

			return res.status(201).json({
				success: true,
				data: newUser,
				message: 'User created successfully'
			});
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					success: false,
					error: error.message,
					code: error.code
				});
			}
			return res.status(500).json({
				success: false,
				error: 'Failed to create user'
			});
		}
	}

	/**
	 * Delete a user
	 */
	async deleteUser(req: Request, res: Response) {
		try {
			const userIdParam = req.params.id;
			if (!isValidId(userIdParam)) {
				return res.status(400).json({
					success: false,
					error: 'Invalid user ID format'
				});
			}

			const userId = toId<'User'>(userIdParam);
			await adminUsersService.deleteUser(userId);

			// Log admin action
			await adminController.logAction(req, 'DELETE_USER', 'user', userId, {});

			return res.json({
				success: true,
				message: 'User deleted successfully'
			});
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					success: false,
					error: error.message,
					code: error.code
				});
			}
			return res.status(500).json({
				success: false,
				error: 'Failed to delete user'
			});
		}
	}

	/**
	 * Ban a user
	 */
	async banUser(req: Request, res: Response) {
		try {
			const userIdParam = req.params.id;
			if (!isValidId(userIdParam)) {
				return res.status(400).json({
					success: false,
					error: 'Invalid user ID format'
				});
			}

			const userId = toId<'User'>(userIdParam);
			const { reason } = req.body;
			await adminUsersService.banUser(userId, reason);

			// Log admin action
			await adminController.logAction(req, 'BAN_USER', 'user', userId, {
				reason
			});

			return res.json({
				success: true,
				message: 'User banned successfully'
			});
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					success: false,
					error: error.message,
					code: error.code
				});
			}
			return res.status(500).json({
				success: false,
				error: 'Failed to ban user'
			});
		}
	}

	/**
	 * Unban a user
	 */
	async unbanUser(req: Request, res: Response) {
		try {
			const userIdParam = req.params.id;
			if (!isValidId(userIdParam)) {
				return res.status(400).json({
					success: false,
					error: 'Invalid user ID format'
				});
			}

			const userId = toId<'User'>(userIdParam);
			await adminUsersService.unbanUser(userId);

			// Log admin action
			await adminController.logAction(req, 'UNBAN_USER', 'user', userId, {});

			return res.json({
				success: true,
				message: 'User unbanned successfully'
			});
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					success: false,
					error: error.message,
					code: error.code
				});
			}
			return res.status(500).json({
				success: false,
				error: 'Failed to unban user'
			});
		}
	}

	/**
	 * Change user role
	 */
	async changeUserRole(req: Request, res: Response) {
		try {
			const userIdParam = req.params.id;
			if (!isValidId(userIdParam)) {
				return res.status(400).json({
					success: false,
					error: 'Invalid user ID format'
				});
			}

			const userId = toId<'User'>(userIdParam);
			const { role } = req.body;
			if (!role || !['user', 'mod', 'admin'].includes(role)) {
				return res.status(400).json({
					success: false,
					error: 'Invalid role. Must be one of: user, mod, admin'
				});
			}

			const updatedUser = await adminUsersService.changeUserRole(userId, role);

			// Log admin action
			await adminController.logAction(req, 'CHANGE_USER_ROLE', 'user', userId, {
				newRole: role
			});

			return res.json({
				success: true,
				data: updatedUser,
				message: 'User role updated successfully'
			});
		} catch (error) {
			if (error instanceof AdminError) {
				return res.status(error.httpStatus).json({
					success: false,
					error: error.message,
					code: error.code
				});
			}
			return res.status(500).json({
				success: false,
				error: 'Failed to change user role'
			});
		}
	}

	/**
	 * Search users for admin tools (XP/Clout adjustments)
	 */
	async searchUsers(req: Request, res: Response) {
		try {
			const term = req.query.term as string;
			if (!term || term.length < 3) {
				return res.status(200).json({
					success: true,
					data: { users: [] }
				});
			}

			// Search users by username or ID and include clout data
			const results = await db
				.select({
					id: users.id,
					username: users.username,
					avatarUrl: users.avatarUrl,
					clout: users.clout,
					xp: users.xp,
					level: users.level
				})
				.from(users)
				.where(ilike(users.username, `%${term}%`))
				.limit(20);

			// Transform results to include tier information for frontend
			const transformedResults = results.map((user) => {
				// Import clout calculator functions
				const clout = user.clout || 0;

				// Basic tier calculation (we'll import the proper calculator later)
				let tier = { tier: 0, name: 'Unknown', color: '#6b7280' };
				if (clout >= 50000) tier = { tier: 6, name: 'Mythic', color: '#ef4444' };
				else if (clout >= 15000) tier = { tier: 5, name: 'Legendary', color: '#f59e0b' };
				else if (clout >= 5000) tier = { tier: 4, name: 'Influential', color: '#8b5cf6' };
				else if (clout >= 1500) tier = { tier: 3, name: 'Respected', color: '#3b82f6' };
				else if (clout >= 500) tier = { tier: 2, name: 'Regular', color: '#22c55e' };
				else if (clout >= 100) tier = { tier: 1, name: 'Newcomer', color: '#84cc16' };

				// Calculate progress to next tier
				const nextTierThresholds = [0, 100, 500, 1500, 5000, 15000, 50000, Infinity];
				const currentTierIndex = tier.tier;
				const nextTierClout = nextTierThresholds[currentTierIndex + 1] || Infinity;
				const currentTierClout = nextTierThresholds[currentTierIndex];

				let progressPercent = 0;
				if (nextTierClout !== Infinity) {
					const progressInTier = clout - currentTierClout;
					const tierRange = nextTierClout - currentTierClout;
					progressPercent = tierRange > 0 ? (progressInTier / tierRange) * 100 : 0;
				} else {
					progressPercent = 100; // Max tier
				}

				return {
					id: user.id,
					username: user.username,
					avatarUrl: user.avatarUrl,
					clout: clout,
					tier: tier,
					nextTierClout: nextTierClout === Infinity ? null : nextTierClout,
					progressPercent: Math.min(100, Math.max(0, progressPercent)),
					// Include XP/level data for XP adjustments too
					xp: user.xp || 0,
					level: user.level || 1
				};
			});

			return res.status(200).json({
				success: true,
				data: { users: transformedResults }
			});
		} catch (error) {
			logger.error('Error searching users:', error);
			return res.status(500).json({
				success: false,
				error: 'Failed to search users'
			});
		}
	}
}

// Export singleton instance
export const adminUsersController = new AdminUsersController();
