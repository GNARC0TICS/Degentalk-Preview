/**
 * Admin User Bulk Operations Service
 *
 * Handles batch operations for user management with audit logging
 * and rate limiting for performance and safety
 */

import { db } from '@db';
import { eq, inArray, sql } from 'drizzle-orm';
import { users, userBans, auditLogs } from '@schema';
import { AdminError, AdminErrorCodes } from '../../admin.errors';
import {
	AdminRateLimiter,
	createAuditLogEntry,
	validateRoleAssignment,
	USER_ROLES
} from '../../shared';

export interface BulkOperationResult {
	success: boolean;
	processed: number;
	failed: number;
	errors: Array<{ userId: number; error: string }>;
}

export interface BulkRoleAssignmentData {
	userIds: number[];
	newRole: string;
	adminId: number;
	reason?: string;
}

export interface BulkBanData {
	userIds: number[];
	reason: string;
	adminId: number;
}

export class AdminUserBulkOperationsService {
	private rateLimiter = new AdminRateLimiter();

	/**
	 * Bulk role assignment with validation and audit logging
	 */
	async bulkAssignRoles(data: BulkRoleAssignmentData): Promise<BulkOperationResult> {
		const { userIds, newRole, adminId, reason } = data;

		// Validate role
		if (!USER_ROLES.includes(newRole)) {
			throw new AdminError(
				`Invalid role: ${newRole}. Must be one of: ${USER_ROLES.join(', ')}`,
				400,
				AdminErrorCodes.INVALID_REQUEST
			);
		}

		// Rate limiting for bulk operations
		await this.rateLimiter.checkLimit(`bulk_role_${adminId}`, 5, 300); // 5 operations per 5 minutes

		const result: BulkOperationResult = {
			success: true,
			processed: 0,
			failed: 0,
			errors: []
		};

		// Process in batches to avoid overwhelming the database
		const batchSize = 20;
		for (let i = 0; i < userIds.length; i += batchSize) {
			const batch = userIds.slice(i, i + batchSize);

			try {
				// Get current admin role to validate permissions
				const [admin] = await db
					.select({ role: users.role })
					.from(users)
					.where(eq(users.id, adminId));

				// Verify users exist and get their current roles
				const existingUsers = await db
					.select({ id: users.id, role: users.role, username: users.username })
					.from(users)
					.where(inArray(users.id, batch));

				const validUserIds: number[] = [];
				const auditEntries: Array<typeof auditLogs.$inferInsert> = [];

				for (const user of existingUsers) {
					try {
						// Validate role assignment permission
						validateRoleAssignment(admin?.role || 'user', user.role, newRole);

						validUserIds.push(user.id);
						auditEntries.push(
							createAuditLogEntry('BULK_ROLE_ASSIGNMENT', 'user', user.id.toString(), adminId, {
								previousRole: user.role,
								newRole,
								reason,
								username: user.username
							})
						);
					} catch (error) {
						result.errors.push({
							userId: user.id,
							error: error.message
						});
						result.failed++;
					}
				}

				if (validUserIds.length > 0) {
					// Perform bulk role update
					await db.transaction(async (tx) => {
						// Update user roles
						await tx
							.update(users)
							.set({
								role: newRole,
								updatedAt: new Date()
							})
							.where(inArray(users.id, validUserIds));

						// Insert audit logs
						await tx.insert(auditLogs).values(auditEntries);
					});

					result.processed += validUserIds.length;
				}

				// Track failed users not found in database
				const foundUserIds = existingUsers.map((u) => u.id);
				const notFoundIds = batch.filter((id) => !foundUserIds.includes(id));

				for (const userId of notFoundIds) {
					result.errors.push({
						userId,
						error: 'User not found'
					});
					result.failed++;
				}
			} catch (error) {
				// Handle batch-level errors
				for (const userId of batch) {
					result.errors.push({
						userId,
						error: error.message || 'Unknown error occurred'
					});
					result.failed++;
				}
			}
		}

		result.success = result.failed === 0;
		return result;
	}

	/**
	 * Bulk ban users with audit logging
	 */
	async bulkBanUsers(data: BulkBanData): Promise<BulkOperationResult> {
		const { userIds, reason, adminId } = data;

		// Rate limiting for bulk bans
		await this.rateLimiter.checkLimit(`bulk_ban_${adminId}`, 3, 600); // 3 operations per 10 minutes

		const result: BulkOperationResult = {
			success: true,
			processed: 0,
			failed: 0,
			errors: []
		};

		const batchSize = 15; // Smaller batches for ban operations
		for (let i = 0; i < userIds.length; i += batchSize) {
			const batch = userIds.slice(i, i + batchSize);

			try {
				// Get users that exist and are not already banned
				const existingUsers = await db
					.select({
						id: users.id,
						username: users.username,
						isBanned: users.isBanned,
						role: users.role
					})
					.from(users)
					.where(inArray(users.id, batch));

				const validUserIds: number[] = [];
				const banRecords: Array<typeof userBans.$inferInsert> = [];
				const auditEntries: Array<typeof auditLogs.$inferInsert> = [];

				for (const user of existingUsers) {
					if (user.isBanned) {
						result.errors.push({
							userId: user.id,
							error: 'User is already banned'
						});
						result.failed++;
						continue;
					}

					// Prevent banning admins (safety check)
					if (user.role === 'admin') {
						result.errors.push({
							userId: user.id,
							error: 'Cannot ban admin users'
						});
						result.failed++;
						continue;
					}

					validUserIds.push(user.id);
					banRecords.push({
						userId: user.id,
						bannedBy: adminId,
						reason,
						banType: 'bulk',
						createdAt: new Date(),
						isActive: true
					});
					auditEntries.push(
						createAuditLogEntry('BULK_BAN_USER', 'user', user.id.toString(), adminId, {
							reason,
							username: user.username,
							previousStatus: 'active'
						})
					);
				}

				if (validUserIds.length > 0) {
					// Perform bulk ban operation
					await db.transaction(async (tx) => {
						// Update user ban status
						await tx
							.update(users)
							.set({
								isBanned: true,
								updatedAt: new Date()
							})
							.where(inArray(users.id, validUserIds));

						// Insert ban records
						await tx.insert(userBans).values(banRecords);

						// Insert audit logs
						await tx.insert(auditLogs).values(auditEntries);
					});

					result.processed += validUserIds.length;
				}

				// Track users not found
				const foundUserIds = existingUsers.map((u) => u.id);
				const notFoundIds = batch.filter((id) => !foundUserIds.includes(id));

				for (const userId of notFoundIds) {
					result.errors.push({
						userId,
						error: 'User not found'
					});
					result.failed++;
				}
			} catch (error) {
				for (const userId of batch) {
					result.errors.push({
						userId,
						error: error.message || 'Unknown error occurred'
					});
					result.failed++;
				}
			}
		}

		result.success = result.failed === 0;
		return result;
	}

	/**
	 * Bulk unban users
	 */
	async bulkUnbanUsers(data: {
		userIds: number[];
		adminId: number;
		reason?: string;
	}): Promise<BulkOperationResult> {
		const { userIds, adminId, reason } = data;

		const result: BulkOperationResult = {
			success: true,
			processed: 0,
			failed: 0,
			errors: []
		};

		const batchSize = 20;
		for (let i = 0; i < userIds.length; i += batchSize) {
			const batch = userIds.slice(i, i + batchSize);

			try {
				// Get banned users
				const bannedUsers = await db
					.select({
						id: users.id,
						username: users.username,
						isBanned: users.isBanned
					})
					.from(users)
					.where(inArray(users.id, batch));

				const validUserIds: number[] = [];
				const auditEntries: Array<typeof auditLogs.$inferInsert> = [];

				for (const user of bannedUsers) {
					if (!user.isBanned) {
						result.errors.push({
							userId: user.id,
							error: 'User is not banned'
						});
						result.failed++;
						continue;
					}

					validUserIds.push(user.id);
					auditEntries.push(
						createAuditLogEntry('BULK_UNBAN_USER', 'user', user.id.toString(), adminId, {
							reason: reason || 'Bulk unban operation',
							username: user.username,
							newStatus: 'active'
						})
					);
				}

				if (validUserIds.length > 0) {
					await db.transaction(async (tx) => {
						// Update user ban status
						await tx
							.update(users)
							.set({
								isBanned: false,
								updatedAt: new Date()
							})
							.where(inArray(users.id, validUserIds));

						// Deactivate ban records
						await tx
							.update(userBans)
							.set({
								isActive: false,
								liftedAt: new Date()
							})
							.where(inArray(userBans.userId, validUserIds));

						// Insert audit logs
						await tx.insert(auditLogs).values(auditEntries);
					});

					result.processed += validUserIds.length;
				}
			} catch (error) {
				for (const userId of batch) {
					result.errors.push({
						userId,
						error: error.message || 'Unknown error occurred'
					});
					result.failed++;
				}
			}
		}

		result.success = result.failed === 0;
		return result;
	}

	/**
	 * Get bulk operation status/history
	 */
	async getBulkOperationHistory(adminId: number, limit: number = 50) {
		try {
			const history = await db
				.select({
					id: auditLogs.id,
					action: auditLogs.action,
					entityType: auditLogs.entityType,
					entityId: auditLogs.entityId,
					details: auditLogs.details,
					timestamp: auditLogs.timestamp
				})
				.from(auditLogs)
				.where(sql`${auditLogs.adminId} = ${adminId} AND ${auditLogs.action} LIKE 'BULK_%'`)
				.orderBy(sql`${auditLogs.timestamp} DESC`)
				.limit(limit);

			return history;
		} catch (error) {
			throw new AdminError(
				'Failed to fetch bulk operation history',
				500,
				AdminErrorCodes.DB_ERROR,
				{
					originalError: error.message
				}
			);
		}
	}
}

// Export singleton instance
export const adminUserBulkOperationsService = new AdminUserBulkOperationsService();
