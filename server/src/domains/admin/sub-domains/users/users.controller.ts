/**
 * Admin Users Controller
 *
 * Handle admin user management API requests
 */

import type { Request, Response } from 'express';
import { adminUsersService } from './users.service';
import { AdminError } from '../../admin.errors';
import { adminController } from '../../admin.controller';
import { getUserId } from '../../admin.middleware';
import { AdminPaginationQuery, AdminUserUpdateSchema } from '@shared/validators/admin';
import { z } from 'zod';
import { db } from '@db';
import { users } from '@schema';
import { ilike } from 'drizzle-orm';

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

	/**
	 * Search users for admin tools (XP/Clout adjustments)
	 */
	async searchUsers(req: Request, res: Response) {
		try {
			const term = req.query.term as string;
			if (!term || term.length < 3) {
				return res.status(200).json({ users: [] });
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

			return res.status(200).json({ users: transformedResults });
		} catch (error) {
			console.error('Error searching users:', error);
			return res.status(500).json({
				error: 'Failed to search users'
			});
		}
	}
}

// Export singleton instance
export const adminUsersController = new AdminUsersController();
