/**
 * Backup & Restore Schema
 *
 * Database schema for backup and restore operations management
 */
import {
	pgTable,
	varchar,
	text,
	boolean,
	timestamp,
	integer,
	bigint,
	jsonb,
	uuid
} from 'drizzle-orm/pg-core';
import { users } from '../user/users';
export const adminBackups = pgTable('admin_backups', {
	id: uuid('id').primaryKey().defaultRandom(),
	// Backup identification
	filename: varchar('filename', { length: 255 }).notNull().unique(),
	displayName: varchar('display_name', { length: 255 }).notNull(),
	description: text('description'),
	// Backup type and metadata
	backupType: varchar('backup_type', { length: 50 }).notNull().default('full'), // full, schema, selective
	source: varchar('source', { length: 50 }).notNull().default('manual'), // manual, scheduled
	// File information
	filePath: text('file_path').notNull(),
	fileSize: bigint('file_size', { mode: 'number' }).notNull().default(0), // Size in bytes
	checksumMd5: varchar('checksum_md5', { length: 32 }),
	compressionType: varchar('compression_type', { length: 20 }).default('gzip'),
	// Operation details
	databaseName: varchar('database_name', { length: 100 }).notNull(),
	postgresVersion: varchar('postgres_version', { length: 50 }),
	backupFormat: varchar('backup_format', { length: 20 }).default('custom'), // custom, plain, tar
	// Tables and schemas included (for selective backups)
	includedTables: jsonb('included_tables').default('[]'), // Array of table names
	includedSchemas: jsonb('included_schemas').default('["public"]'), // Array of schema names
	excludedTables: jsonb('excluded_tables').default('[]'), // Array of excluded table names
	// Status and timing
	status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, running, completed, failed
	startedAt: timestamp('started_at', { mode: 'string' }),
	completedAt: timestamp('completed_at', { mode: 'string' }),
	duration: integer('duration'), // Duration in seconds
	// Error handling
	errorMessage: text('error_message'),
	errorCode: varchar('error_code', { length: 50 }),
	retryCount: integer('retry_count').default(0),
	// Audit trail
	createdBy: uuid('created_by')
		.notNull()
		.references(() => users.id),
	createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
	// Retention and cleanup
	expiresAt: timestamp('expires_at', { mode: 'string' }),
	isProtected: boolean('is_protected').default(false), // Protected from auto-deletion
	// Tags and categorization
	tags: jsonb('tags').default('[]'), // Array of string tags
	metadata: jsonb('metadata').default('{}') // Additional metadata
});
export const backupSchedules = pgTable('backup_schedules', {
	id: uuid('id').primaryKey().defaultRandom(),
	// Schedule identification
	name: varchar('name', { length: 255 }).notNull(),
	description: text('description'),
	// Schedule configuration
	cronExpression: varchar('cron_expression', { length: 100 }).notNull(), // e.g., "0 2 * * *" for daily at 2 AM
	timezone: varchar('timezone', { length: 50 }).default('UTC'),
	// Backup configuration (inherits from adminBackups schema)
	backupType: varchar('backup_type', { length: 50 }).notNull().default('full'),
	backupFormat: varchar('backup_format', { length: 20 }).default('custom'),
	compressionType: varchar('compression_type', { length: 20 }).default('gzip'),
	includedTables: jsonb('included_tables').default('[]'),
	includedSchemas: jsonb('included_schemas').default('["public"]'),
	excludedTables: jsonb('excluded_tables').default('[]'),
	// Retention policy
	retentionDays: integer('retention_days').default(30),
	maxBackups: integer('max_backups').default(10), // Maximum number of backups to keep for this schedule
	// Status and control
	isActive: boolean('is_active').default(true),
	lastRunAt: timestamp('last_run_at', { mode: 'string' }),
	nextRunAt: timestamp('next_run_at', { mode: 'string' }),
	lastBackupId: uuid('last_backup_id').references(() => adminBackups.id),
	// Error tracking
	consecutiveFailures: integer('consecutive_failures').default(0),
	lastError: text('last_error'),
	// Audit trail
	createdBy: uuid('created_by')
		.notNull()
		.references(() => users.id),
	updatedBy: uuid('updated_by').references(() => users.id),
	createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
	// Notification settings
	notifyOnSuccess: boolean('notify_on_success').default(false),
	notifyOnFailure: boolean('notify_on_failure').default(true),
	notificationEmails: jsonb('notification_emails').default('[]') // Array of email addresses
});
export const restoreOperations = pgTable('restore_operations', {
	id: uuid('id').primaryKey().defaultRandom(),
	// Operation identification
	operationId: uuid('operation_id').defaultRandom().notNull().unique(), // @uuid-exception - unique operation identifier
	displayName: varchar('display_name', { length: 255 }).notNull(),
	description: text('description'),
	// Source backup information
	sourceBackupId: uuid('source_backup_id')
		.notNull()
		.references(() => adminBackups.id),
	sourceFilename: varchar('source_filename', { length: 255 }).notNull(),
	// Restore configuration
	restoreType: varchar('restore_type', { length: 50 }).notNull().default('full'), // full, schema_only, data_only, selective
	targetDatabase: varchar('target_database', { length: 100 }),
	// Pre-restore backup (safety checkpoint)
	preRestoreBackupId: uuid('pre_restore_backup_id').references(() => adminBackups.id),
	createPreBackup: boolean('create_pre_backup').default(true),
	// Selective restore options
	includedTables: jsonb('included_tables').default('[]'),
	excludedTables: jsonb('excluded_tables').default('[]'),
	includeIndexes: boolean('include_indexes').default(true),
	includeConstraints: boolean('include_constraints').default(true),
	includeTriggers: boolean('include_triggers').default(true),
	// Operation status and timing
	status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, pre_backup, restoring, completed, failed, cancelled
	startedAt: timestamp('started_at', { mode: 'string' }),
	preBackupCompletedAt: timestamp('pre_backup_completed_at', { mode: 'string' }),
	restoreStartedAt: timestamp('restore_started_at', { mode: 'string' }),
	completedAt: timestamp('completed_at', { mode: 'string' }),
	duration: integer('duration'), // Total duration in seconds
	// Progress tracking
	progressPercent: integer('progress_percent').default(0),
	currentStep: varchar('current_step', { length: 100 }),
	estimatedTimeRemaining: integer('estimated_time_remaining'), // Seconds
	// Results and statistics
	tablesRestored: integer('tables_restored').default(0),
	rowsRestored: bigint('rows_restored', { mode: 'number' }).default(0),
	dataSize: bigint('data_size', { mode: 'number' }).default(0),
	// Error handling
	errorMessage: text('error_message'),
	errorCode: varchar('error_code', { length: 50 }),
	errorStep: varchar('error_step', { length: 100 }),
	canRollback: boolean('can_rollback').default(true),
	// Audit and security
	initiatedBy: uuid('initiated_by')
		.notNull()
		.references(() => users.id),
	approvedBy: uuid('approved_by').references(() => users.id), // For critical restore operations
	confirmationToken: varchar('confirmation_token', { length: 100 }),
	confirmationExpiresAt: timestamp('confirmation_expires_at', { mode: 'string' }),
	// Audit trail
	createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
	// Warnings and validations
	validationWarnings: jsonb('validation_warnings').default('[]'), // Array of warning messages
	impactAssessment: jsonb('impact_assessment').default('{}'), // Estimated impact on system
	// Metadata
	metadata: jsonb('metadata').default('{}')
});
export const backupSettings = pgTable('backup_settings', {
	id: uuid('id').primaryKey().defaultRandom(),
	// Storage configuration
	storageLocation: text('storage_location').notNull().default('/var/backups/degentalk'),
	maxStorageSize: bigint('max_storage_size', { mode: 'number' }).default(100 * 1024 * 1024 * 1024), // 100 GB in bytes
	compressionLevel: integer('compression_level').default(6), // gzip compression level 1-9
	// Default retention policies
	defaultRetentionDays: integer('default_retention_days').default(30),
	maxManualBackups: integer('max_manual_backups').default(50),
	maxScheduledBackups: integer('max_scheduled_backups').default(100),
	// Security and permissions
	requireApprovalForRestore: boolean('require_approval_for_restore').default(true),
	allowedRestoreRoles: jsonb('allowed_restore_roles').default('["admin"]'), // Array of role names
	allowedBackupRoles: jsonb('allowed_backup_roles').default('["admin", "mod"]'),
	// Notification settings
	defaultNotificationEmails: jsonb('default_notification_emails').default('[]'),
	notifyOnLargeBackups: boolean('notify_on_large_backups').default(true),
	largeBackupThresholdMB: integer('large_backup_threshold_mb').default(1000),
	// Performance settings
	connectionTimeout: integer('connection_timeout').default(30), // Seconds
	commandTimeout: integer('command_timeout').default(3600), // Seconds (1 hour)
	maxConcurrentOperations: integer('max_concurrent_operations').default(2),
	// Cleanup settings
	cleanupFrequency: varchar('cleanup_frequency', { length: 50 }).default('daily'), // daily, weekly
	cleanupTime: varchar('cleanup_time', { length: 10 }).default('02:00'), // Time in HH:MM format
	autoCleanupEnabled: boolean('auto_cleanup_enabled').default(true),
	// System information
	lastCleanupAt: timestamp('last_cleanup_at', { mode: 'string' }),
	diskUsage: bigint('disk_usage', { mode: 'number' }).default(0), // Current backup storage usage in bytes
	// Audit trail
	updatedBy: uuid('updated_by').references(() => users.id),
	updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull()
});
// Export types for TypeScript
export type AdminBackup = typeof adminBackups.$inferSelect;
export type NewAdminBackup = typeof adminBackups.$inferInsert;
export type BackupSchedule = typeof backupSchedules.$inferSelect;
export type NewBackupSchedule = typeof backupSchedules.$inferInsert;
export type RestoreOperation = typeof restoreOperations.$inferSelect;
export type NewRestoreOperation = typeof restoreOperations.$inferInsert;
export type BackupSettings = typeof backupSettings.$inferSelect;
export type NewBackupSettings = typeof backupSettings.$inferInsert;
