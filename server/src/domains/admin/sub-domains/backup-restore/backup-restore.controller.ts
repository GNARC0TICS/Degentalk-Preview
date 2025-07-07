import type { Request, Response } from 'express';
import { userService } from '@server/src/core/services/user.service';
import { z } from 'zod';
import { backupService, createBackupSchema, listBackupsSchema } from './backup.service';
import {
	restoreService,
	createRestoreSchema,
	listRestoreOperationsSchema
} from './restore.service';
import {
	backupScheduleService,
	createScheduleSchema,
	updateScheduleSchema,
	listSchedulesSchema
} from './schedule.service';
import { formatAdminResponse, AdminOperationBoundary } from '../../shared';
import { AdminError, AdminErrorCodes } from '../../admin.errors';
import { logger } from '../../../../core/logger';

// Additional validation schemas
const backupIdSchema = z.object({
	id: z.coerce.number().positive()
});

const restoreValidationSchema = z.object({
	backupId: z.coerce.number().positive()
});

const downloadBackupSchema = z.object({
	id: z.coerce.number().positive()
});

export class BackupRestoreController {
	// ============ BACKUP OPERATIONS ============

	/**
	 * GET /api/admin/backups
	 * List all backups with filtering and pagination
	 */
	async getBackups(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'LIST_BACKUPS',
			entityType: 'backup'
		});

		return boundary.execute(async () => {
			const filters = listBackupsSchema.parse(req.query);
			const result = await backupService.getBackups(filters);

			return formatAdminResponse(result, 'LIST_BACKUPS', 'backup');
		});
	}

	/**
	 * GET /api/admin/backups/:id
	 * Get backup details by ID
	 */
	async getBackup(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'GET_BACKUP',
			entityType: 'backup'
		});

		return boundary.execute(async () => {
			const { id } = backupIdSchema.parse(req.params);
			const backup = await backupService.getBackup(id);

			return formatAdminResponse({ backup }, 'GET_BACKUP', 'backup');
		});
	}

	/**
	 * POST /api/admin/backups
	 * Create a new manual backup
	 */
	async createBackup(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'CREATE_BACKUP',
			entityType: 'backup'
		});

		return boundary.execute(async () => {
			const backupData = createBackupSchema.parse(req.body);
			const adminId = userService.getUserFromRequest(req)?.id;

			if (!adminId) {
				throw new AdminError('Admin ID required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			const result = await backupService.createBackup(backupData, adminId);

			return formatAdminResponse(result, 'CREATE_BACKUP', 'backup');
		});
	}

	/**
	 * DELETE /api/admin/backups/:id
	 * Delete a backup and its file
	 */
	async deleteBackup(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'DELETE_BACKUP',
			entityType: 'backup'
		});

		return boundary.execute(async () => {
			const { id } = backupIdSchema.parse(req.params);
			const adminId = userService.getUserFromRequest(req)?.id;

			if (!adminId) {
				throw new AdminError('Admin ID required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			const result = await backupService.deleteBackup(id, adminId);

			return formatAdminResponse(result, 'DELETE_BACKUP', 'backup');
		});
	}

	/**
	 * GET /api/admin/backups/:id/progress
	 * Get backup progress for active operations
	 */
	async getBackupProgress(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'GET_BACKUP_PROGRESS',
			entityType: 'backup'
		});

		return boundary.execute(async () => {
			const { id } = backupIdSchema.parse(req.params);
			const progress = backupService.getBackupProgress(id);

			return formatAdminResponse({ progress }, 'GET_BACKUP_PROGRESS', 'backup');
		});
	}

	/**
	 * GET /api/admin/backups/:id/download
	 * Download backup file
	 */
	async downloadBackup(req: Request, res: Response) {
		try {
			const { id } = downloadBackupSchema.parse(req.params);
			const backup = await backupService.getBackup(id);

			if (!backup.fileExists) {
				return res.status(404).json({
					success: false,
					error: 'Backup file not found'
				});
			}

			// Set appropriate headers for file download
			res.setHeader('Content-Disposition', `attachment; filename="${backup.filename}"`);
			res.setHeader('Content-Type', 'application/octet-stream');

			// Stream the file
			const fs = await import('fs');
			const stream = fs.createReadStream(backup.filePath);

			stream.on('error', (error) => {
				logger.error('Error streaming backup file:', error);
				res.status(500).json({
					success: false,
					error: 'Failed to download backup file'
				});
			});

			stream.pipe(res);
		} catch (error) {
			res.status(500).json({
				success: false,
				error: error.message || 'Failed to download backup'
			});
		}
	}

	/**
	 * GET /api/admin/backups/storage/stats
	 * Get backup storage statistics
	 */
	async getStorageStats(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'GET_STORAGE_STATS',
			entityType: 'backup'
		});

		return boundary.execute(async () => {
			const stats = await backupService.getStorageStats();

			return formatAdminResponse(stats, 'GET_STORAGE_STATS', 'backup');
		});
	}

	// ============ RESTORE OPERATIONS ============

	/**
	 * GET /api/admin/restores
	 * List all restore operations
	 */
	async getRestoreOperations(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'LIST_RESTORE_OPERATIONS',
			entityType: 'restore'
		});

		return boundary.execute(async () => {
			const filters = listRestoreOperationsSchema.parse(req.query);
			const result = await restoreService.getRestoreOperations(filters);

			return formatAdminResponse(result, 'LIST_RESTORE_OPERATIONS', 'restore');
		});
	}

	/**
	 * GET /api/admin/restores/:operationId
	 * Get restore operation details
	 */
	async getRestoreOperation(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'GET_RESTORE_OPERATION',
			entityType: 'restore'
		});

		return boundary.execute(async () => {
			const { operationId } = req.params;
			const operation = await restoreService.getRestoreOperation(operationId);

			return formatAdminResponse({ operation }, 'GET_RESTORE_OPERATION', 'restore');
		});
	}

	/**
	 * POST /api/admin/restores/validate
	 * Validate a backup for restore and get impact assessment
	 */
	async validateRestore(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'VALIDATE_RESTORE',
			entityType: 'restore'
		});

		return boundary.execute(async () => {
			const { backupId } = restoreValidationSchema.parse(req.body);
			const validation = await restoreService.validateRestoreOperation(backupId);

			return formatAdminResponse(validation, 'VALIDATE_RESTORE', 'restore');
		});
	}

	/**
	 * POST /api/admin/restores
	 * Create a new restore operation
	 */
	async createRestoreOperation(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'CREATE_RESTORE_OPERATION',
			entityType: 'restore'
		});

		return boundary.execute(async () => {
			const restoreData = createRestoreSchema.parse(req.body);
			const adminId = userService.getUserFromRequest(req)?.id;

			if (!adminId) {
				throw new AdminError('Admin ID required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			const result = await restoreService.createRestoreOperation(restoreData, adminId);

			return formatAdminResponse(result, 'CREATE_RESTORE_OPERATION', 'restore');
		});
	}

	/**
	 * POST /api/admin/restores/:operationId/cancel
	 * Cancel a pending restore operation
	 */
	async cancelRestoreOperation(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'CANCEL_RESTORE_OPERATION',
			entityType: 'restore'
		});

		return boundary.execute(async () => {
			const { operationId } = req.params;
			const adminId = userService.getUserFromRequest(req)?.id;

			if (!adminId) {
				throw new AdminError('Admin ID required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			const result = await restoreService.cancelRestoreOperation(operationId, adminId);

			return formatAdminResponse(result, 'CANCEL_RESTORE_OPERATION', 'restore');
		});
	}

	/**
	 * GET /api/admin/restores/:operationId/progress
	 * Get restore progress for active operations
	 */
	async getRestoreProgress(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'GET_RESTORE_PROGRESS',
			entityType: 'restore'
		});

		return boundary.execute(async () => {
			const { operationId } = req.params;
			const progress = restoreService.getRestoreProgress(operationId);

			return formatAdminResponse({ progress }, 'GET_RESTORE_PROGRESS', 'restore');
		});
	}

	// ============ SCHEDULE OPERATIONS ============

	/**
	 * GET /api/admin/backup-schedules
	 * List all backup schedules
	 */
	async getSchedules(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'LIST_BACKUP_SCHEDULES',
			entityType: 'backupSchedule'
		});

		return boundary.execute(async () => {
			const filters = listSchedulesSchema.parse(req.query);
			const result = await backupScheduleService.getSchedules(filters);

			return formatAdminResponse(result, 'LIST_BACKUP_SCHEDULES', 'backupSchedule');
		});
	}

	/**
	 * GET /api/admin/backup-schedules/:id
	 * Get schedule details by ID
	 */
	async getSchedule(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'GET_BACKUP_SCHEDULE',
			entityType: 'backupSchedule'
		});

		return boundary.execute(async () => {
			const { id } = backupIdSchema.parse(req.params);
			const schedule = await backupScheduleService.getSchedule(id);

			return formatAdminResponse({ schedule }, 'GET_BACKUP_SCHEDULE', 'backupSchedule');
		});
	}

	/**
	 * POST /api/admin/backup-schedules
	 * Create a new backup schedule
	 */
	async createSchedule(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'CREATE_BACKUP_SCHEDULE',
			entityType: 'backupSchedule'
		});

		return boundary.execute(async () => {
			const scheduleData = createScheduleSchema.parse(req.body);
			const adminId = userService.getUserFromRequest(req)?.id;

			if (!adminId) {
				throw new AdminError('Admin ID required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			const result = await backupScheduleService.createSchedule(scheduleData, adminId);

			return formatAdminResponse(result, 'CREATE_BACKUP_SCHEDULE', 'backupSchedule');
		});
	}

	/**
	 * PUT /api/admin/backup-schedules/:id
	 * Update a backup schedule
	 */
	async updateSchedule(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'UPDATE_BACKUP_SCHEDULE',
			entityType: 'backupSchedule'
		});

		return boundary.execute(async () => {
			const { id } = backupIdSchema.parse(req.params);
			const scheduleData = updateScheduleSchema.parse(req.body);
			const adminId = userService.getUserFromRequest(req)?.id;

			if (!adminId) {
				throw new AdminError('Admin ID required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			const result = await backupScheduleService.updateSchedule(id, scheduleData, adminId);

			return formatAdminResponse(result, 'UPDATE_BACKUP_SCHEDULE', 'backupSchedule');
		});
	}

	/**
	 * DELETE /api/admin/backup-schedules/:id
	 * Delete a backup schedule
	 */
	async deleteSchedule(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'DELETE_BACKUP_SCHEDULE',
			entityType: 'backupSchedule'
		});

		return boundary.execute(async () => {
			const { id } = backupIdSchema.parse(req.params);
			const adminId = userService.getUserFromRequest(req)?.id;

			if (!adminId) {
				throw new AdminError('Admin ID required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			const result = await backupScheduleService.deleteSchedule(id, adminId);

			return formatAdminResponse(result, 'DELETE_BACKUP_SCHEDULE', 'backupSchedule');
		});
	}

	/**
	 * POST /api/admin/backup-schedules/:id/trigger
	 * Trigger a schedule to run immediately
	 */
	async triggerSchedule(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'TRIGGER_BACKUP_SCHEDULE',
			entityType: 'backupSchedule'
		});

		return boundary.execute(async () => {
			const { id } = backupIdSchema.parse(req.params);
			const adminId = userService.getUserFromRequest(req)?.id;

			if (!adminId) {
				throw new AdminError('Admin ID required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			const result = await backupScheduleService.triggerSchedule(id, adminId);

			return formatAdminResponse(result, 'TRIGGER_BACKUP_SCHEDULE', 'backupSchedule');
		});
	}

	// ============ SCHEDULER MANAGEMENT ============

	/**
	 * GET /api/admin/backup-schedules/scheduler/status
	 * Get backup scheduler status
	 */
	async getSchedulerStatus(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'GET_SCHEDULER_STATUS',
			entityType: 'backupSchedule'
		});

		return boundary.execute(async () => {
			const status = backupScheduleService.getSchedulerStatus();

			return formatAdminResponse(status, 'GET_SCHEDULER_STATUS', 'backupSchedule');
		});
	}

	/**
	 * POST /api/admin/backup-schedules/scheduler/start
	 * Start the backup scheduler
	 */
	async startScheduler(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'START_BACKUP_SCHEDULER',
			entityType: 'backupSchedule'
		});

		return boundary.execute(async () => {
			const result = await backupScheduleService.startScheduler();

			return formatAdminResponse(result, 'START_BACKUP_SCHEDULER', 'backupSchedule');
		});
	}

	/**
	 * POST /api/admin/backup-schedules/scheduler/stop
	 * Stop the backup scheduler
	 */
	async stopScheduler(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'STOP_BACKUP_SCHEDULER',
			entityType: 'backupSchedule'
		});

		return boundary.execute(async () => {
			const result = backupScheduleService.stopScheduler();

			return formatAdminResponse(result, 'STOP_BACKUP_SCHEDULER', 'backupSchedule');
		});
	}

	// ============ UTILITY ENDPOINTS ============

	/**
	 * GET /api/admin/backup-restore/health
	 * Health check for backup and restore system
	 */
	async getSystemHealth(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'GET_BACKUP_SYSTEM_HEALTH',
			entityType: 'backup'
		});

		return boundary.execute(async () => {
			// Check system health
			const storageStats = await backupService.getStorageStats();
			const schedulerStatus = backupScheduleService.getSchedulerStatus();

			// Basic health indicators
			const health = {
				status: 'healthy',
				storage: {
					usagePercent: storageStats.usagePercent,
					totalSizeMB: storageStats.totalSizeMB,
					maxStorageMB: storageStats.maxStorageMB,
					status:
						storageStats.usagePercent > 90
							? 'critical'
							: storageStats.usagePercent > 80
								? 'warning'
								: 'healthy'
				},
				scheduler: {
					running: schedulerStatus.running,
					uptime: schedulerStatus.uptime,
					status: schedulerStatus.running ? 'healthy' : 'stopped'
				},
				backups: {
					total: storageStats.totalCount,
					completed: storageStats.completedCount,
					failed: storageStats.failedCount,
					active: storageStats.activeCount
				},
				recommendations: storageStats.recommendations || []
			};

			// Overall health assessment
			if (health.storage.status === 'critical' || !health.scheduler.running) {
				health.status = 'unhealthy';
			} else if (
				health.storage.status === 'warning' ||
				storageStats.failedCount > storageStats.completedCount * 0.1
			) {
				health.status = 'degraded';
			}

			return formatAdminResponse(health, 'GET_BACKUP_SYSTEM_HEALTH', 'backup');
		});
	}
}

// Export controller instance
export const backupRestoreController = new BackupRestoreController();
