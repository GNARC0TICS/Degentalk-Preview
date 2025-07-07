/**
 * Backup Schedule Service
 *
 * Manages scheduled backup operations and cron-based automation
 */

import { db } from '@db';
import { backupSchedules, adminBackups } from '@schema';
import { eq, desc, and, lte } from 'drizzle-orm';
import { AdminError, AdminErrorCodes } from '../../admin.errors';
import { adminCacheService } from '../../shared';
import { backupService } from './backup.service';
import { z } from 'zod';
import { logger } from "../../../../core/logger";

// Validation schemas
export const createScheduleSchema = z.object({
	name: z.string().min(1).max(255),
	description: z.string().optional(),
	cronExpression: z
		.string()
		.min(1)
		.max(100)
		.regex(/^[\d\s\*\/\-\,]+$/, 'Invalid cron expression format'),
	timezone: z.string().default('UTC'),
	backupType: z.enum(['full', 'schema', 'selective']).default('full'),
	backupFormat: z.enum(['custom', 'plain', 'tar']).default('custom'),
	compressionType: z.enum(['gzip', 'none']).default('gzip'),
	includedTables: z.array(z.string()).default([]),
	includedSchemas: z.array(z.string()).default(['public']),
	excludedTables: z.array(z.string()).default([]),
	retentionDays: z.number().min(1).max(365).default(30),
	maxBackups: z.number().min(1).max(100).default(10),
	isActive: z.boolean().default(true),
	notifyOnSuccess: z.boolean().default(false),
	notifyOnFailure: z.boolean().default(true),
	notificationEmails: z.array(z.string().email()).default([])
});

export const updateScheduleSchema = createScheduleSchema.partial();

export const listSchedulesSchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(20),
	isActive: z.boolean().optional(),
	backupType: z.enum(['full', 'schema', 'selective']).optional()
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
export type ListSchedulesInput = z.infer<typeof listSchedulesSchema>;

export class BackupScheduleService {
	private schedulerRunning = false;
	private schedulerInterval: NodeJS.Timeout | null = null;

	/**
	 * Create a new backup schedule
	 */
	async createSchedule(data: CreateScheduleInput, adminId: string) {
		try {
			const validatedData = createScheduleSchema.parse(data);

			// Validate cron expression
			const nextRun = this.calculateNextRun(validatedData.cronExpression, validatedData.timezone);

			// Create schedule record
			const [schedule] = await db
				.insert(backupSchedules)
				.values({
					...validatedData,
					nextRunAt: nextRun.toISOString(),
					createdBy: adminId,
					updatedBy: adminId
				})
				.returning();

			// Start scheduler if this is the first active schedule
			await this.ensureSchedulerRunning();

			// Invalidate cache
			await adminCacheService.invalidateEntity('backupSchedule');

			return {
				schedule,
				message: `Backup schedule "${validatedData.name}" created successfully`,
				nextRun: nextRun.toISOString()
			};
		} catch (error) {
			if (error instanceof AdminError) throw error;

			throw new AdminError('Failed to create backup schedule', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Update an existing backup schedule
	 */
	async updateSchedule(id: number, data: UpdateScheduleInput, adminId: string) {
		try {
			const validatedData = updateScheduleSchema.parse(data);

			// Get existing schedule
			const [existingSchedule] = await db
				.select()
				.from(backupSchedules)
				.where(eq(backupSchedules.id, id));

			if (!existingSchedule) {
				throw new AdminError(`Backup schedule not found: ${id}`, 404, AdminErrorCodes.NOT_FOUND);
			}

			// Calculate new next run time if cron expression changed
			let nextRunAt = existingSchedule.nextRunAt;
			if (validatedData.cronExpression || validatedData.timezone) {
				const cronExpr = validatedData.cronExpression || existingSchedule.cronExpression;
				const timezone = validatedData.timezone || existingSchedule.timezone;
				nextRunAt = this.calculateNextRun(cronExpr, timezone).toISOString();
			}

			// Update schedule
			const [updatedSchedule] = await db
				.update(backupSchedules)
				.set({
					...validatedData,
					nextRunAt,
					updatedBy: adminId,
					updatedAt: new Date().toISOString()
				})
				.where(eq(backupSchedules.id, id))
				.returning();

			// Ensure scheduler is running if schedule is active
			if (updatedSchedule.isActive) {
				await this.ensureSchedulerRunning();
			}

			// Invalidate cache
			await adminCacheService.invalidateEntity('backupSchedule');

			return {
				schedule: updatedSchedule,
				message: `Backup schedule "${updatedSchedule.name}" updated successfully`
			};
		} catch (error) {
			if (error instanceof AdminError) throw error;

			throw new AdminError('Failed to update backup schedule', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Delete a backup schedule
	 */
	async deleteSchedule(id: number, adminId: string) {
		try {
			const [schedule] = await db.select().from(backupSchedules).where(eq(backupSchedules.id, id));

			if (!schedule) {
				throw new AdminError(`Backup schedule not found: ${id}`, 404, AdminErrorCodes.NOT_FOUND);
			}

			// Delete the schedule
			await db.delete(backupSchedules).where(eq(backupSchedules.id, id));

			// Invalidate cache
			await adminCacheService.invalidateEntity('backupSchedule');

			return {
				success: true,
				message: `Backup schedule "${schedule.name}" deleted successfully`
			};
		} catch (error) {
			if (error instanceof AdminError) throw error;

			throw new AdminError('Failed to delete backup schedule', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Get list of backup schedules
	 */
	async getSchedules(filters: ListSchedulesInput) {
		try {
			const validatedFilters = listSchedulesSchema.parse(filters);

			let query = db.select().from(backupSchedules);
			const conditions = [];

			// Apply filters
			if (validatedFilters.isActive !== undefined) {
				conditions.push(eq(backupSchedules.isActive, validatedFilters.isActive));
			}

			if (validatedFilters.backupType) {
				conditions.push(eq(backupSchedules.backupType, validatedFilters.backupType));
			}

			// Apply conditions and pagination
			if (conditions.length > 0) {
				query = query.where(and(...conditions));
			}

			const schedules = await query
				.orderBy(desc(backupSchedules.createdAt))
				.limit(validatedFilters.limit)
				.offset((validatedFilters.page - 1) * validatedFilters.limit);

			// Enhance with additional information
			const enhancedSchedules = await Promise.all(
				schedules.map(async (schedule) => {
					// Get last backup info
					let lastBackup = null;
					if (schedule.lastBackupId) {
						try {
							lastBackup = await backupService.getBackup(schedule.lastBackupId);
						} catch (error) {
							// Backup may have been deleted
						}
					}

					return {
						...schedule,
						lastBackup,
						nextRunIn: this.getTimeUntilNextRun(schedule.nextRunAt),
						status: this.getScheduleStatus(schedule)
					};
				})
			);

			return {
				schedules: enhancedSchedules,
				pagination: {
					page: validatedFilters.page,
					limit: validatedFilters.limit,
					total: schedules.length, // Would need count query for accurate total
					totalPages: Math.ceil(schedules.length / validatedFilters.limit)
				}
			};
		} catch (error) {
			throw new AdminError('Failed to fetch backup schedules', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Get schedule details by ID
	 */
	async getSchedule(id: number) {
		try {
			const [schedule] = await db.select().from(backupSchedules).where(eq(backupSchedules.id, id));

			if (!schedule) {
				throw new AdminError(`Backup schedule not found: ${id}`, 404, AdminErrorCodes.NOT_FOUND);
			}

			// Get recent backups for this schedule
			const recentBackups = await db
				.select()
				.from(adminBackups)
				.where(
					and(
						eq(adminBackups.source, 'scheduled'),
						eq(adminBackups.metadata, JSON.stringify({ scheduleId: id }))
					)
				)
				.orderBy(desc(adminBackups.createdAt))
				.limit(10);

			// Get statistics
			const stats = this.calculateScheduleStats(recentBackups);

			return {
				...schedule,
				recentBackups,
				stats,
				nextRunIn: this.getTimeUntilNextRun(schedule.nextRunAt),
				status: this.getScheduleStatus(schedule)
			};
		} catch (error) {
			if (error instanceof AdminError) throw error;

			throw new AdminError('Failed to fetch backup schedule', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Trigger a schedule to run immediately
	 */
	async triggerSchedule(id: number, adminId: string) {
		try {
			const schedule = await this.getSchedule(id);

			if (!schedule.isActive) {
				throw new AdminError(
					'Cannot trigger inactive schedule',
					400,
					AdminErrorCodes.INVALID_REQUEST
				);
			}

			// Execute the backup
			const result = await this.executeScheduledBackup(schedule, adminId);

			return {
				success: true,
				message: `Schedule "${schedule.name}" triggered successfully`,
				backupId: result.backupId
			};
		} catch (error) {
			if (error instanceof AdminError) throw error;

			throw new AdminError('Failed to trigger backup schedule', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Start the backup scheduler
	 */
	async startScheduler() {
		if (this.schedulerRunning) {
			return { message: 'Backup scheduler is already running' };
		}

		this.schedulerRunning = true;

		// Check for due schedules every minute
		this.schedulerInterval = setInterval(async () => {
			try {
				await this.processDueSchedules();
			} catch (error) {
				logger.error('Error processing backup schedules:', error);
			}
		}, 60 * 1000); // 1 minute

		logger.info('Backup scheduler started');
		return { message: 'Backup scheduler started successfully' };
	}

	/**
	 * Stop the backup scheduler
	 */
	stopScheduler() {
		if (this.schedulerInterval) {
			clearInterval(this.schedulerInterval);
			this.schedulerInterval = null;
		}

		this.schedulerRunning = false;
		logger.info('Backup scheduler stopped');
		return { message: 'Backup scheduler stopped' };
	}

	/**
	 * Get scheduler status
	 */
	getSchedulerStatus() {
		return {
			running: this.schedulerRunning,
			uptime: this.schedulerRunning ? process.uptime() : 0,
			nextCheck: this.schedulerRunning ? new Date(Date.now() + 60000).toISOString() : null
		};
	}

	// Private helper methods

	private async ensureSchedulerRunning() {
		if (!this.schedulerRunning) {
			await this.startScheduler();
		}
	}

	private async processDueSchedules() {
		const now = new Date().toISOString();

		// Get schedules that are due for execution
		const dueSchedules = await db
			.select()
			.from(backupSchedules)
			.where(and(eq(backupSchedules.isActive, true), lte(backupSchedules.nextRunAt, now)));

		for (const schedule of dueSchedules) {
			try {
				logger.info(`Executing scheduled backup: ${schedule.name}`);

				// Execute the backup
				const result = await this.executeScheduledBackup(schedule, schedule.createdBy);

				// Update schedule with next run time and last backup info
				const nextRun = this.calculateNextRun(schedule.cronExpression, schedule.timezone);

				await db
					.update(backupSchedules)
					.set({
						lastRunAt: new Date().toISOString(),
						nextRunAt: nextRun.toISOString(),
						lastBackupId: result.backupId,
						consecutiveFailures: 0,
						lastError: null
					})
					.where(eq(backupSchedules.id, schedule.id));

				logger.info(`Scheduled backup completed: ${schedule.name}, next run: ${nextRun}`);
			} catch (error) {
				logger.error(`Scheduled backup failed: ${schedule.name}`, error);

				// Update failure count and error
				await db
					.update(backupSchedules)
					.set({
						consecutiveFailures: schedule.consecutiveFailures + 1,
						lastError: error.message,
						lastRunAt: new Date().toISOString(),
						nextRunAt: this.calculateNextRun(
							schedule.cronExpression,
							schedule.timezone
						).toISOString()
					})
					.where(eq(backupSchedules.id, schedule.id));

				// Send notification if configured
				if (schedule.notifyOnFailure) {
					// Implementation would send email/webhook notification
					logger.info(`Backup failure notification for schedule: ${schedule.name}`);
				}
			}
		}
	}

	private async executeScheduledBackup(schedule: any, adminId: string) {
		// Create backup using the backup service
		const result = await backupService.createBackup(
			{
				displayName: `${schedule.name} - ${new Date().toISOString()}`,
				description: `Scheduled backup from: ${schedule.name}`,
				backupType: schedule.backupType,
				backupFormat: schedule.backupFormat,
				compressionType: schedule.compressionType,
				includedTables: schedule.includedTables,
				includedSchemas: schedule.includedSchemas,
				excludedTables: schedule.excludedTables,
				tags: ['scheduled', `schedule-${schedule.id}`],
				isProtected: false
			},
			adminId
		);

		// Clean up old backups according to retention policy
		await this.cleanupOldBackups(schedule);

		return result;
	}

	private async cleanupOldBackups(schedule: any) {
		try {
			// Get all backups for this schedule
			const scheduleBackups = await db
				.select()
				.from(adminBackups)
				.where(
					and(
						eq(adminBackups.source, 'scheduled'),
						eq(adminBackups.metadata, JSON.stringify({ scheduleId: schedule.id }))
					)
				)
				.orderBy(desc(adminBackups.createdAt));

			// Delete backups exceeding max count
			if (scheduleBackups.length > schedule.maxBackups) {
				const toDelete = scheduleBackups.slice(schedule.maxBackups);
				for (const backup of toDelete) {
					await backupService.deleteBackup(backup.id, schedule.createdBy);
				}
			}

			// Delete backups older than retention period
			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - schedule.retentionDays);

			const expiredBackups = scheduleBackups.filter(
				(backup) => new Date(backup.createdAt) < cutoffDate && !backup.isProtected
			);

			for (const backup of expiredBackups) {
				await backupService.deleteBackup(backup.id, schedule.createdBy);
			}
		} catch (error) {
			logger.warn(`Failed to cleanup old backups for schedule ${schedule.name}:`, error);
		}
	}

	private calculateNextRun(cronExpression: string, timezone: string = 'UTC'): Date {
		// Simple cron calculation - in production, use a proper cron library like 'node-cron'
		// For now, just add appropriate intervals based on common patterns

		const now = new Date();
		const parts = cronExpression.split(' ');

		// Handle common patterns
		if (cronExpression === '0 2 * * *') {
			// Daily at 2 AM
			const next = new Date(now);
			next.setHours(2, 0, 0, 0);
			if (next <= now) {
				next.setDate(next.getDate() + 1);
			}
			return next;
		}

		if (cronExpression === '0 2 * * 0') {
			// Weekly on Sunday at 2 AM
			const next = new Date(now);
			next.setHours(2, 0, 0, 0);
			const daysUntilSunday = (7 - next.getDay()) % 7 || 7;
			next.setDate(next.getDate() + daysUntilSunday);
			return next;
		}

		if (cronExpression === '0 2 1 * *') {
			// Monthly on 1st at 2 AM
			const next = new Date(now);
			next.setDate(1);
			next.setHours(2, 0, 0, 0);
			if (next <= now) {
				next.setMonth(next.getMonth() + 1);
			}
			return next;
		}

		// Default: add 1 hour
		return new Date(now.getTime() + 60 * 60 * 1000);
	}

	private getTimeUntilNextRun(nextRunAt: string | null): string | null {
		if (!nextRunAt) return null;

		const now = new Date();
		const nextRun = new Date(nextRunAt);
		const diff = nextRun.getTime() - now.getTime();

		if (diff <= 0) return 'Overdue';

		const hours = Math.floor(diff / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

		if (hours > 24) {
			const days = Math.floor(hours / 24);
			return `${days}d ${hours % 24}h`;
		}

		return `${hours}h ${minutes}m`;
	}

	private getScheduleStatus(schedule: any): 'healthy' | 'warning' | 'error' {
		if (!schedule.isActive) return 'warning';
		if (schedule.consecutiveFailures >= 3) return 'error';
		if (schedule.consecutiveFailures > 0) return 'warning';
		return 'healthy';
	}

	private calculateScheduleStats(backups: any[]) {
		const total = backups.length;
		const successful = backups.filter((b) => b.status === 'completed').length;
		const failed = backups.filter((b) => b.status === 'failed').length;
		const avgSize =
			backups.length > 0
				? backups.reduce((sum, b) => sum + (b.fileSize || 0), 0) / backups.length
				: 0;

		return {
			totalBackups: total,
			successfulBackups: successful,
			failedBackups: failed,
			successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
			averageSizeMB: Math.round((avgSize / (1024 * 1024)) * 100) / 100
		};
	}
}

// Export singleton instance
export const backupScheduleService = new BackupScheduleService();
