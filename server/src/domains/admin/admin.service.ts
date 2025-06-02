/**
 * Admin Service
 * 
 * Provides centralized admin functionality
 */

import { WalletService } from '../wallet/wallet.service';
import { DgtService } from '../wallet/dgt.service';
import { db } from '@db';
import { count, desc, eq, sql, and, like, isNull, or, ne, sum } from 'drizzle-orm';
import { users, auditLogs, transactions } from '@schema';
import { AdminError, AdminErrorCodes } from './admin.errors';

export class AdminService {
  /**
   * Log admin action for audit purposes
   */
  async logAdminAction(adminId: number, action: string, entityType: string, entityId: string, details: any = {}) {
    try {
      await db.insert(auditLogs).values({
        userId: adminId,
        action,
        entityType,
        entityId,
        details: details || {}
      });
    } catch (error) {
      console.error('Error logging admin action:', error);
      // Non-blocking - we continue even if logging fails
    }
  }

  /**
   * Get admin dashboard statistics
   */
  async getDashboardStats() {
    try {
      // User stats
      const [userStats] = await db.select({
        total: count(users.id),
        active: sql`COUNT(CASE WHEN ${users.isActive} = true THEN 1 END)`,
        banned: sql`COUNT(CASE WHEN ${users.isBanned} = true THEN 1 END)`,
        new24h: sql`COUNT(CASE WHEN ${users.createdAt} > NOW() - INTERVAL '1 day' THEN 1 END)`
      }).from(users);

      // Additional stats could be added here (posts, threads, etc.)

      return {
        users: {
          total: Number(userStats.total) || 0,
          active: Number(userStats.active) || 0,
          banned: Number(userStats.banned) || 0, 
          new24h: Number(userStats.new24h) || 0
        }
      };
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      throw new AdminError(
        'Failed to fetch dashboard statistics', 
        500, 
        AdminErrorCodes.DB_ERROR,
        { originalError: error.message }
      );
    }
  }

  /**
   * Get a user by ID with standardized ID handling
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
      
      return user;
    } catch (error) {
      if (error instanceof AdminError) {
        throw error;
      }
      console.error('Error fetching user by ID:', error);
      throw new AdminError(
        'Failed to fetch user', 
        500, 
        AdminErrorCodes.DB_ERROR,
        { originalError: error.message }
      );
    }
  }

  /**
   * Get recent admin actions
   */
  async getRecentAdminActions(limit: number = 10) {
    try {
      const recentActions = await db.select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        details: auditLogs.details,
        createdAt: auditLogs.createdAt,
        username: users.username
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
      
      return recentActions;
    } catch (error) {
      console.error('Error fetching recent admin actions:', error);
      throw new AdminError(
        'Failed to fetch recent admin actions', 
        500, 
        AdminErrorCodes.DB_ERROR,
        { originalError: error.message }
      );
    }
  }
}

// Export singleton instance
export const adminService = new AdminService();
