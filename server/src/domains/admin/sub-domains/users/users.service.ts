/**
 * Admin Users Service
 * 
 * Handles user management operations for the admin panel
 */

import { db } from '../../../../core/db';
import { count, desc, eq, sql, and, like, isNull, or, ne } from 'drizzle-orm';
import { users, userGroups, posts, threads } from '@shared/schema';
import { AdminError, AdminErrorCodes } from '../../admin.errors';
import { AdminPaginationQuery } from '@shared/validators/admin';
import { z } from 'zod';

export class AdminUsersService {
  /**
   * Get paginated users with filtering
   */
  async getUsers(params: z.infer<typeof AdminPaginationQuery>) {
    try {
      const { page, pageSize, search } = params;
      const offset = (page - 1) * pageSize;

      // Build user query with optional search
      let userQuery = db.select({
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
        userQuery = userQuery.where(
          or(
            like(users.username, `%${search}%`),
            like(users.email, `%${search}%`)
          )
        );
      }
      
      // Get total count for pagination
      const [countResult] = await db.select({ count: count() })
        .from(users)
        .where(search ? 
          or(like(users.username, `%${search}%`), like(users.email, `%${search}%`)) : undefined
        )
        .execute();
        
      const total = Number(countResult?.count) || 0;

      // Fetch paginated users
      const usersList = await userQuery
        .orderBy(desc(users.createdAt))
        .limit(pageSize)
        .offset(offset);

      // Get post and thread counts for users in a single query
      const userIds = usersList.map(user => user.id);
      
      if (userIds.length === 0) {
        return {
          data: [],
          total,
          page,
          pageSize
        };
      }
      
      const userStats = await db.select({
        userId: posts.userId,
        postCount: sql`COUNT(DISTINCT ${posts.id})`,
        threadCount: sql`COUNT(DISTINCT ${threads.id})`
      })
      .from(posts)
      .leftJoin(threads, eq(posts.threadId, threads.id))
      .where(sql`${posts.userId} IN (${userIds.join(',')})`)
      .groupBy(posts.userId);

      // Create stats map for quick access
      const statsMap = new Map();
      userStats.forEach(stat => {
        statsMap.set(stat.userId, {
          posts: Number(stat.postCount) || 0,
          threads: Number(stat.threadCount) || 0
        });
      });

      // Format users with additional data
      const formattedUsers = usersList.map(user => ({
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
      throw new AdminError(
        'Failed to fetch users', 
        500, 
        AdminErrorCodes.DB_ERROR,
        { originalError: error.message }
      );
    }
  }

  /**
   * Get detailed user information by ID
   */
  async getUserById(userId: number) {
    try {
      if (!userId || isNaN(userId)) {
        throw new AdminError('Invalid user ID', 400, AdminErrorCodes.INVALID_REQUEST);
      }

      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      if (!user) {
        throw new AdminError(`User with ID ${userId} not found`, 404, AdminErrorCodes.USER_NOT_FOUND);
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
      const [postStats] = await db.select({
        postCount: sql`COUNT(*)`,
        lastPostDate: sql`MAX(${posts.createdAt})`
      })
      .from(posts)
      .where(eq(posts.userId, userId));
      
      const [threadStats] = await db.select({
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
      throw new AdminError(
        'Failed to fetch user details', 
        500, 
        AdminErrorCodes.DB_ERROR,
        { originalError: error.message }
      );
    }
  }

  /**
   * Update a user
   */
  async updateUser(userId: number, userData: Partial<typeof users.$inferInsert>) {
    try {
      // Make sure the user exists
      const [existingUser] = await db.select().from(users).where(eq(users.id, userId));
      if (!existingUser) {
        throw new AdminError(`User with ID ${userId} not found`, 404, AdminErrorCodes.USER_NOT_FOUND);
      }
      
      // Validate username uniqueness if being changed
      if (userData.username && userData.username !== existingUser.username) {
        const [usernameExists] = await db.select()
          .from(users)
          .where(and(
            eq(users.username, userData.username),
            ne(users.id, userId)
          ));
        
        if (usernameExists) {
          throw new AdminError('Username already taken', 400, AdminErrorCodes.DUPLICATE_ENTRY);
        }
      }
      
      // Validate email uniqueness if being changed
      if (userData.email && userData.email !== existingUser.email) {
        const [emailExists] = await db.select()
          .from(users)
          .where(and(
            eq(users.email, userData.email),
            ne(users.id, userId)
          ));
        
        if (emailExists) {
          throw new AdminError('Email already in use', 400, AdminErrorCodes.DUPLICATE_ENTRY);
        }
      }
      
      // Update the user
      const [updatedUser] = await db.update(users)
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
      throw new AdminError(
        'Failed to update user', 
        500, 
        AdminErrorCodes.DB_ERROR,
        { originalError: error.message }
      );
    }
  }
}

// Export singleton instance
export const adminUsersService = new AdminUsersService(); 