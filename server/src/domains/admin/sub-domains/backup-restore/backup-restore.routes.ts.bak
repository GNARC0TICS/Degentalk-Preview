/**
 * Backup & Restore Routes
 *
 * Admin routes for backup and restore operations
 */

import { Router } from 'express';
import { backupRestoreController } from './backup-restore.controller';
import { isAdmin } from '../../admin.middleware';

export const backupRestoreRoutes = Router();

// Apply admin authentication to all routes
backupRestoreRoutes.use(isAdmin);

// ============ BACKUP OPERATIONS ============

// Main backup endpoints
backupRestoreRoutes.get(
	'/backups',
	backupRestoreController.getBackups.bind(backupRestoreController)
);
backupRestoreRoutes.post(
	'/backups',
	backupRestoreController.createBackup.bind(backupRestoreController)
);
backupRestoreRoutes.get(
	'/backups/storage/stats',
	backupRestoreController.getStorageStats.bind(backupRestoreController)
);

// Individual backup operations
backupRestoreRoutes.get(
	'/backups/:id',
	backupRestoreController.getBackup.bind(backupRestoreController)
);
backupRestoreRoutes.delete(
	'/backups/:id',
	backupRestoreController.deleteBackup.bind(backupRestoreController)
);
backupRestoreRoutes.get(
	'/backups/:id/progress',
	backupRestoreController.getBackupProgress.bind(backupRestoreController)
);
backupRestoreRoutes.get(
	'/backups/:id/download',
	backupRestoreController.downloadBackup.bind(backupRestoreController)
);

// ============ RESTORE OPERATIONS ============

// Restore operations
backupRestoreRoutes.get(
	'/restores',
	backupRestoreController.getRestoreOperations.bind(backupRestoreController)
);
backupRestoreRoutes.post(
	'/restores/validate',
	backupRestoreController.validateRestore.bind(backupRestoreController)
);
backupRestoreRoutes.post(
	'/restores',
	backupRestoreController.createRestoreOperation.bind(backupRestoreController)
);

// Individual restore operations
backupRestoreRoutes.get(
	'/restores/:operationId',
	backupRestoreController.getRestoreOperation.bind(backupRestoreController)
);
backupRestoreRoutes.post(
	'/restores/:operationId/cancel',
	backupRestoreController.cancelRestoreOperation.bind(backupRestoreController)
);
backupRestoreRoutes.get(
	'/restores/:operationId/progress',
	backupRestoreController.getRestoreProgress.bind(backupRestoreController)
);

// ============ BACKUP SCHEDULES ============

// Schedule management
backupRestoreRoutes.get(
	'/backup-schedules',
	backupRestoreController.getSchedules.bind(backupRestoreController)
);
backupRestoreRoutes.post(
	'/backup-schedules',
	backupRestoreController.createSchedule.bind(backupRestoreController)
);
backupRestoreRoutes.get(
	'/backup-schedules/:id',
	backupRestoreController.getSchedule.bind(backupRestoreController)
);
backupRestoreRoutes.put(
	'/backup-schedules/:id',
	backupRestoreController.updateSchedule.bind(backupRestoreController)
);
backupRestoreRoutes.delete(
	'/backup-schedules/:id',
	backupRestoreController.deleteSchedule.bind(backupRestoreController)
);
backupRestoreRoutes.post(
	'/backup-schedules/:id/trigger',
	backupRestoreController.triggerSchedule.bind(backupRestoreController)
);

// Scheduler control
backupRestoreRoutes.get(
	'/backup-schedules/scheduler/status',
	backupRestoreController.getSchedulerStatus.bind(backupRestoreController)
);
backupRestoreRoutes.post(
	'/backup-schedules/scheduler/start',
	backupRestoreController.startScheduler.bind(backupRestoreController)
);
backupRestoreRoutes.post(
	'/backup-schedules/scheduler/stop',
	backupRestoreController.stopScheduler.bind(backupRestoreController)
);

// ============ SYSTEM HEALTH & UTILITIES ============

// System health and monitoring
backupRestoreRoutes.get(
	'/health',
	backupRestoreController.getSystemHealth.bind(backupRestoreController)
);
