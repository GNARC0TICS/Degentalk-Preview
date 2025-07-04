/**
 * Admin Users Service
 *
 * Handles user management operations for the admin panel
 */

import { db } from '@db';
import { count, desc, eq, sql, and, like, isNull, or, ne } from 'drizzle-orm';
import { users, roles, posts, threads, userBans, userGroups } from '@schema';
import { AdminError, AdminErrorCodes } from '../../admin.errors';
import { AdminPaginationQuery } from '@shared/validators/admin';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import type { UserId } from '@shared/types';

export class AdminUsersService {
	/**
	 * Get paginated users with filtering
	 */
	async getUsers(params: z.infer<typeof AdminPaginationQuery>) {
		try {
			const { page, pageSize, search } = params;
			const offset = (page - 1) * pageSize;

			// Build user query with optional search
			let userQuery = db
				.select({
					id: users.id,
					username: users.username,
					email: users.email,
					role: users.role,
					isActive: users.isActive,
					isBanned: users.isBanned,
					isVerified: users.isVerified,
					createdAt: users.createdAt,
					avatarUrl: users.avatarUrl,
					groupId: users.groupId,
					groupName: userGroups.name
				})
				.from(users)
				.leftJoin(userGroups, eq(users.groupId, userGroups.id));

			if (search) {
				// Use full-text search for better performance
				const searchCondition = sql`to_tsvector('english', ${users.username} || ' ' || ${users.email}) @@ plainto_tsquery('english', ${search})`;
				userQuery = userQuery.where(searchCondition);
			}

			// Get total count for pagination with same search logic
			const [countResult] = await db
				.select({ count: count() })
				.from(users)
				.where(
					search
						? sql`to_tsvector('english', ${users.username} || ' ' || ${users.email}) @@ plainto_tsquery('english', ${search})`
						: undefined
				)
				.execute();

			const total = Number(countResult?.count) || 0;

			// Fetch paginated users
			const usersList = await userQuery
				.orderBy(desc(users.createdAt))
				.limit(pageSize)
				.offset(offset);

			// Get post and thread counts for users in a single optimized query
			const userIds = usersList.map((user) => user.id);

			if (userIds.length === 0) {
				return {
					data: [],
					total,
					page,
					pageSize
				};
			}

			// Optimized single query to get both post and thread counts
			const userStats = await db
				.select({
					userId: sql`COALESCE(${posts.userId}, ${threads.userId})`.as('userId'),
					postCount: sql`COUNT(DISTINCT ${posts.id})`.as('postCount'),
					threadCount: sql`COUNT(DISTINCT ${threads.id})`.as('threadCount')
				})
				.from(posts)
				.fullJoin(threads, eq(posts.userId, threads.userId))
				.where(sql`COALESCE(${posts.userId}, ${threads.userId}) = ANY(${userIds})`)
				.groupBy(sql`COALESCE(${posts.userId}, ${threads.userId})`);

			// Create stats map for quick access
			const statsMap = new Map();
			userStats.forEach((stat) => {
				statsMap.set(stat.userId, {
					posts: Number(stat.postCount) || 0,
					threads: Number(stat.threadCount) || 0
				});
			});

			// Format users with additional data
			const formattedUsers = usersList.map((user) => ({
				...user,
				stats: statsMap.get(user.id) || { posts: 0, threads: 0 },
				createdAtFormatted: new Date(user.createdAt).toLocaleDateString()
			}));

			return {
				data: formattedUsers,
				total,
				page,
				pageSize
			};
		} catch (error) {
			console.error('Error fetching users:', error);
			throw new AdminError('Failed to fetch users', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Get detailed user information by ID
	 */
	async getUserById(userId: UserId) {
		try {
			if (!userId) {
				throw new AdminError('Invalid user ID', 400, AdminErrorCodes.INVALID_REQUEST);
			}

			const [user] = await db.select().from(users).where(eq(users.id, userId));

			if (!user) {
				throw new AdminError(
					`User with ID ${userId} not found`,
					404,
					AdminErrorCodes.USER_NOT_FOUND
				);
			}

			// Get user group if available
			let userGroup = null;
			if (user.groupId) {
				const [group] = await db.select().from(userGroups).where(eq(userGroups.id, user.groupId));
				userGroup = group;
			}

			// Get all available groups for dropdown
			const allGroups = await db.select().from(userGroups);

			// Get user activity stats
			const [postStats] = await db
				.select({
					postCount: sql`COUNT(*)`,
					lastPostDate: sql`MAX(${posts.createdAt})`
				})
				.from(posts)
				.where(eq(posts.userId, userId));

			const [threadStats] = await db
				.select({
					threadCount: sql`COUNT(*)`
				})
				.from(threads)
				.where(eq(threads.userId, userId));

			return {
				user,
				group: userGroup,
				allGroups,
				stats: {
					posts: Number(postStats?.postCount) || 0,
					threads: Number(threadStats?.threadCount) || 0,
					lastActivity: postStats?.lastPostDate
				}
			};
		} catch (error) {
			if (error instanceof AdminError) {
				throw error;
			}
			console.error('Error fetching user details:', error);
			throw new AdminError('Failed to fetch user details', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Update a user
	 */
	async updateUser(userId: UserId, userData: Partial<typeof users.$inferInsert>) {
		try {
			// Make sure the user exists
			const [existingUser] = await db.select().from(users).where(eq(users.id, userId));
			if (!existingUser) {
				throw new AdminError(
					`User with ID ${userId} not found`,
					404,
					AdminErrorCodes.USER_NOT_FOUND
				);
			}

			// Validate username uniqueness if being changed
			if (userData.username && userData.username !== existingUser.username) {
				const [usernameExists] = await db
					.select()
					.from(users)
					.where(and(eq(users.username, userData.username), ne(users.id, userId)));

				if (usernameExists) {
					throw new AdminError('Username already taken', 400, AdminErrorCodes.DUPLICATE_ENTRY);
				}
			}

			// Validate email uniqueness if being changed
			if (userData.email && userData.email !== existingUser.email) {
				const [emailExists] = await db
					.select()
					.from(users)
					.where(and(eq(users.email, userData.email), ne(users.id, userId)));

				if (emailExists) {
					throw new AdminError('Email already in use', 400, AdminErrorCodes.DUPLICATE_ENTRY);
				}
			}

			// Update the user
			const [updatedUser] = await db
				.update(users)
				.set({
					...userData,
					updatedAt: new Date()
				})
				.where(eq(users.id, userId))
				.returning();

			return updatedUser;
		} catch (error) {
			if (error instanceof AdminError) {
				throw error;
			}
			console.error('Error updating user:', error);
			throw new AdminError('Failed to update user', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Create a new user
	 */
	async createUser(userData: {
		username: string;
		email: string;
		password?: string;
		role?: string;
	}) {
		try {
			// Validate username uniqueness
			const [usernameExists] = await db
				.select()
				.from(users)
				.where(eq(users.username, userData.username));

			if (usernameExists) {
				throw new AdminError('Username already taken', 400, AdminErrorCodes.DUPLICATE_ENTRY);
			}

			// Validate email uniqueness
			const [emailExists] = await db.select().from(users).where(eq(users.email, userData.email));

			if (emailExists) {
				throw new AdminError('Email already in use', 400, AdminErrorCodes.DUPLICATE_ENTRY);
			}

			// Hash password if provided, otherwise use a random one
			const password = userData.password || Math.random().toString(36).slice(-8);
			const hashedPassword = await bcrypt.hash(password, 10);

			// Create the user
			const [newUser] = await db
				.insert(users)
				.values({
					username: userData.username,
					email: userData.email,
					passwordHash: hashedPassword,
					role: userData.role || 'user',
					isActive: true,
					isVerified: true,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();

			return newUser;
		} catch (error) {
			if (error instanceof AdminError) {
				throw error;
			}
			console.error('Error creating user:', error);
			throw new AdminError('Failed to create user', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Delete a user
	 */
	async deleteUser(userId: UserId) {
		try {
			// Check if user exists
			const [user] = await db.select().from(users).where(eq(users.id, userId));
			if (!user) {
				throw new AdminError(
					`User with ID ${userId} not found`,
					404,
					AdminErrorCodes.USER_NOT_FOUND
				);
			}

			// Note: In a real application, you might want to soft delete or move data
			// For now, we'll actually delete the user and their related data

			// Delete user's posts and threads (cascade should handle this, but being explicit)
			await db.delete(posts).where(eq(posts.userId, userId));
			await db.delete(threads).where(eq(threads.userId, userId));

			// Delete any ban records
			await db.delete(userBans).where(eq(userBans.userId, userId));

			// Delete the user
			await db.delete(users).where(eq(users.id, userId));

			return { success: true };
		} catch (error) {
			if (error instanceof AdminError) {
				throw error;
			}
			console.error('Error deleting user:', error);
			throw new AdminError('Failed to delete user', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Ban a user
	 */
	async banUser(userId: UserId, reason?: string) {
		try {
			// Check if user exists
			const [user] = await db.select().from(users).where(eq(users.id, userId));
			if (!user) {
				throw new AdminError(
					`User with ID ${userId} not found`,
					404,
					AdminErrorCodes.USER_NOT_FOUND
				);
			}

			// Check if user is already banned
			if (user.isBanned) {
				throw new AdminError('User is already banned', 400, AdminErrorCodes.INVALID_REQUEST);
			}

			// Update user ban status
			await db
				.update(users)
				.set({
					isBanned: true,
					updatedAt: new Date()
				})
				.where(eq(users.id, userId));

			// Create ban record
			await db.insert(userBans).values({
				userId,
				bannedBy: userId, // TODO: Should be admin user ID
				reason: reason || 'No reason provided',
				banType: 'manual',
				createdAt: new Date(),
				isActive: true
			});

			return { success: true };
		} catch (error) {
			if (error instanceof AdminError) {
				throw error;
			}
			console.error('Error banning user:', error);
			throw new AdminError('Failed to ban user', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Unban a user
	 */
	async unbanUser(userId: UserId) {
		try {
			// Check if user exists
			const [user] = await db.select().from(users).where(eq(users.id, userId));
			if (!user) {
				throw new AdminError(
					`User with ID ${userId} not found`,
					404,
					AdminErrorCodes.USER_NOT_FOUND
				);
			}

			// Check if user is actually banned
			if (!user.isBanned) {
				throw new AdminError('User is not banned', 400, AdminErrorCodes.INVALID_REQUEST);
			}

			// Update user ban status
			await db
				.update(users)
				.set({
					isBanned: false,
					updatedAt: new Date()
				})
				.where(eq(users.id, userId));

			// Deactivate ban records
			await db
				.update(userBans)
				.set({
					isActive: false,
					liftedAt: new Date()
				})
				.where(and(eq(userBans.userId, userId), eq(userBans.isActive, true)));

			return { success: true };
		} catch (error) {
			if (error instanceof AdminError) {
				throw error;
			}
			console.error('Error unbanning user:', error);
			throw new AdminError('Failed to unban user', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Change user role
	 */
	async changeUserRole(userId: UserId, newRole: string) {
		try {
			// Check if user exists
			const [user] = await db.select().from(users).where(eq(users.id, userId));
			if (!user) {
				throw new AdminError(
					`User with ID ${userId} not found`,
					404,
					AdminErrorCodes.USER_NOT_FOUND
				);
			}

			// Validate role
			const validRoles = ['user', 'mod', 'admin'];
			if (!validRoles.includes(newRole)) {
				throw new AdminError(
					`Invalid role: ${newRole}. Must be one of: ${validRoles.join(', ')}`,
					400,
					AdminErrorCodes.INVALID_REQUEST
				);
			}

			// Update user role
			const [updatedUser] = await db
				.update(users)
				.set({
					role: newRole,
					updatedAt: new Date()
				})
				.where(eq(users.id, userId))
				.returning();

			return updatedUser;
		} catch (error) {
			if (error instanceof AdminError) {
				throw error;
			}
			console.error('Error changing user role:', error);
			throw new AdminError('Failed to change user role', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}
}

// Export singleton instance
export const adminUsersService = new AdminUsersService();
