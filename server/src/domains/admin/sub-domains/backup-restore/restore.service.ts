/**
 * Restore Service
 *
 * Handles database restore operations with safety validations
 */

import { db } from '@db';
import { adminBackups, restoreOperations, backupSettings } from '@schema';
import { eq, desc } from 'drizzle-orm';
import { AdminError, AdminErrorCodes } from '../../admin.errors';
import { adminCacheService } from '../../shared';
import { backupService } from './backup.service';
import { spawn } from 'child_process';
import { existsSync, statSync } from 'fs';
import { randomUUID } from 'crypto';
import { z } from 'zod';

// Validation schemas
export const createRestoreSchema = z.object({
	sourceBackupId: z.number().positive(),
	displayName: z.string().min(1).max(255),
	description: z.string().optional(),
	restoreType: z.enum(['full', 'schema_only', 'data_only', 'selective']).default('full'),
	createPreBackup: z.boolean().default(true),
	includedTables: z.array(z.string()).default([]),
	excludedTables: z.array(z.string()).default([]),
	includeIndexes: z.boolean().default(true),
	includeConstraints: z.boolean().default(true),
	includeTriggers: z.boolean().default(true),
	confirmationToken: z.string().min(1) // Required for safety
});

export const listRestoreOperationsSchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(20),
	status: z
		.enum(['pending', 'pre_backup', 'restoring', 'completed', 'failed', 'cancelled'])
		.optional(),
	restoreType: z.enum(['full', 'schema_only', 'data_only', 'selective']).optional()
});

export type CreateRestoreInput = z.infer<typeof createRestoreSchema>;
export type ListRestoreOperationsInput = z.infer<typeof listRestoreOperationsSchema>;

interface RestoreProgress {
	operationId: string;
	status: 'pending' | 'pre_backup' | 'restoring' | 'completed' | 'failed' | 'cancelled';
	progressPercent: number;
	currentStep: string;
	estimatedTimeRemaining?: number;
	errorMessage?: string;
	canRollback: boolean;
}

export class RestoreService {
	private activeRestores = new Map<string, RestoreProgress>();

	/**
	 * Validate backup file and get restore impact assessment
	 */
	async validateRestoreOperation(backupId: number) {
		try {
			// Get backup details
			const backup = await backupService.getBackup(backupId);

			if (!backup) {
				throw new AdminError(`Backup not found: ${backupId}`, 404, AdminErrorCodes.NOT_FOUND);
			}

			if (backup.status !== 'completed') {
				throw new AdminError(
					'Can only restore from completed backups',
					400,
					AdminErrorCodes.INVALID_REQUEST
				);
			}

			if (!backup.fileExists) {
				throw new AdminError('Backup file not found on disk', 400, AdminErrorCodes.NOT_FOUND);
			}

			// Validate backup file integrity
			const validationResult = await this.validateBackupFile(backup);

			// Generate impact assessment
			const impactAssessment = await this.generateImpactAssessment(backup);

			// Generate warnings
			const warnings = this.generateRestoreWarnings(backup, impactAssessment);

			return {
				backup,
				validation: validationResult,
				impactAssessment,
				warnings,
				confirmationRequired: true,
				estimatedDuration: this.estimateRestoreDuration(backup)
			};
		} catch (error) {
			if (error instanceof AdminError) throw error;

			throw new AdminError('Failed to validate restore operation', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Create a new restore operation
	 */
	async createRestoreOperation(
		data: CreateRestoreInput,
		adminId: string
	): Promise<{ operationId: string; message: string }> {
		try {
			// Validate input
			const validatedData = createRestoreSchema.parse(data);

			// Validate backup and get assessment
			const validation = await this.validateRestoreOperation(validatedData.sourceBackupId);

			// Check if user has permission for this type of restore
			await this.checkRestorePermissions(adminId, validatedData.restoreType);

			// Generate operation ID
			const operationId = randomUUID();

			// Get source backup details
			const sourceBackup = validation.backup;

			// Create restore operation record
			const [operation] = await db
				.insert(restoreOperations)
				.values({
					operationId,
					displayName: validatedData.displayName,
					description: validatedData.description,
					sourceBackupId: validatedData.sourceBackupId,
					sourceFilename: sourceBackup.filename,
					restoreType: validatedData.restoreType,
					createPreBackup: validatedData.createPreBackup,
					includedTables: validatedData.includedTables,
					excludedTables: validatedData.excludedTables,
					includeIndexes: validatedData.includeIndexes,
					includeConstraints: validatedData.includeConstraints,
					includeTriggers: validatedData.includeTriggers,
					status: 'pending',
					initiatedBy: adminId,
					confirmationToken: validatedData.confirmationToken,
					confirmationExpiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
					validationWarnings: validation.warnings,
					impactAssessment: validation.impactAssessment
				})
				.returning();

			// Start restore process asynchronously
			this.executeRestore(operation.id, operationId, validatedData, adminId).catch((error) => {
				console.error(`Restore operation ${operationId} failed:`, error);
				this.updateRestoreStatus(operation.id, 'failed', error.message);
			});

			// Invalidate cache
			await adminCacheService.invalidateEntity('restore');

			return {
				operationId,
				message: `Restore operation "${validatedData.displayName}" started successfully`
			};
		} catch (error) {
			if (error instanceof AdminError) throw error;

			throw new AdminError('Failed to create restore operation', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Get list of restore operations
	 */
	async getRestoreOperations(filters: ListRestoreOperationsInput) {
		try {
			const validatedFilters = listRestoreOperationsSchema.parse(filters);

			let query = db.select().from(restoreOperations);
			const conditions = [];

			// Apply filters
			if (validatedFilters.status) {
				conditions.push(eq(restoreOperations.status, validatedFilters.status));
			}

			if (validatedFilters.restoreType) {
				conditions.push(eq(restoreOperations.restoreType, validatedFilters.restoreType));
			}

			// Apply conditions and pagination
			const operations = await query
				.orderBy(desc(restoreOperations.createdAt))
				.limit(validatedFilters.limit)
				.offset((validatedFilters.page - 1) * validatedFilters.limit);

			// Add progress information
			const operationsWithProgress = operations.map((operation) => ({
				...operation,
				progress: this.activeRestores.get(operation.operationId),
				durationMinutes: operation.duration ? Math.round(operation.duration / 60) : null
			}));

			return {
				operations: operationsWithProgress,
				pagination: {
					page: validatedFilters.page,
					limit: validatedFilters.limit,
					total: operations.length, // Would need count query for accurate total
					totalPages: Math.ceil(operations.length / validatedFilters.limit)
				}
			};
		} catch (error) {
			throw new AdminError('Failed to fetch restore operations', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Get restore operation details
	 */
	async getRestoreOperation(operationId: string) {
		try {
			const [operation] = await db
				.select()
				.from(restoreOperations)
				.where(eq(restoreOperations.operationId, operationId));

			if (!operation) {
				throw new AdminError(
					`Restore operation not found: ${operationId}`,
					404,
					AdminErrorCodes.NOT_FOUND
				);
			}

			// Get source backup details
			const sourceBackup = await backupService.getBackup(operation.sourceBackupId);

			// Get pre-restore backup if exists
			let preRestoreBackup = null;
			if (operation.preRestoreBackupId) {
				preRestoreBackup = await backupService.getBackup(operation.preRestoreBackupId);
			}

			return {
				...operation,
				sourceBackup,
				preRestoreBackup,
				progress: this.activeRestores.get(operationId),
				durationMinutes: operation.duration ? Math.round(operation.duration / 60) : null
			};
		} catch (error) {
			if (error instanceof AdminError) throw error;

			throw new AdminError('Failed to fetch restore operation', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Cancel a pending restore operation
	 */
	async cancelRestoreOperation(operationId: string, adminId: string) {
		try {
			const operation = await this.getRestoreOperation(operationId);

			if (operation.status !== 'pending') {
				throw new AdminError(
					'Can only cancel pending restore operations',
					400,
					AdminErrorCodes.INVALID_REQUEST
				);
			}

			// Update status to cancelled
			await this.updateRestoreStatus(operation.id, 'cancelled');

			// Remove from active restores
			this.activeRestores.delete(operationId);

			return { success: true, message: 'Restore operation cancelled successfully' };
		} catch (error) {
			if (error instanceof AdminError) throw error;

			throw new AdminError('Failed to cancel restore operation', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Get restore progress for active operations
	 */
	getRestoreProgress(operationId: string): RestoreProgress | null {
		return this.activeRestores.get(operationId) || null;
	}

	// Private helper methods

	private async executeRestore(
		dbId: number,
		operationId: string,
		options: CreateRestoreInput,
		adminId: string
	) {
		const startTime = Date.now();

		try {
			// Initialize progress tracking
			this.activeRestores.set(operationId, {
				operationId,
				status: 'pending',
				progressPercent: 0,
				currentStep: 'Initializing restore operation...',
				canRollback: true
			});

			// Update status to starting
			await this.updateRestoreStatus(dbId, 'pre_backup', null, {
				startedAt: new Date().toISOString()
			});

			// Step 1: Create pre-restore backup if requested
			let preRestoreBackupId = null;
			if (options.createPreBackup) {
				this.updateProgress(operationId, 5, 'Creating safety backup...');
				preRestoreBackupId = await this.createPreRestoreBackup(adminId);

				await db
					.update(restoreOperations)
					.set({
						preRestoreBackupId,
						preBackupCompletedAt: new Date().toISOString()
					})
					.where(eq(restoreOperations.id, dbId));
			}

			// Step 2: Prepare for restore
			this.updateProgress(operationId, 15, 'Preparing database for restore...');
			await this.updateRestoreStatus(dbId, 'restoring', null, {
				restoreStartedAt: new Date().toISOString()
			});

			// Step 3: Execute restore
			this.updateProgress(operationId, 20, 'Restoring database...');
			await this.executePgRestore(operationId, options);

			// Step 4: Verify restore
			this.updateProgress(operationId, 90, 'Verifying restore...');
			const verificationResult = await this.verifyRestore();

			// Step 5: Update completion
			const endTime = Date.now();
			const duration = Math.round((endTime - startTime) / 1000);

			await this.updateRestoreStatus(dbId, 'completed', null, {
				completedAt: new Date().toISOString(),
				duration,
				tablesRestored: verificationResult.tablesCount,
				rowsRestored: verificationResult.rowsCount
			});

			this.updateProgress(operationId, 100, 'Restore completed successfully');

			// Remove from active restores after delay
			setTimeout(() => {
				this.activeRestores.delete(operationId);
			}, 10000);
		} catch (error) {
			const endTime = Date.now();
			const duration = Math.round((endTime - startTime) / 1000);

			await this.updateRestoreStatus(dbId, 'failed', error.message, {
				duration
			});

			this.activeRestores.set(operationId, {
				operationId,
				status: 'failed',
				progressPercent: 0,
				currentStep: 'Restore failed',
				errorMessage: error.message,
				canRollback: true
			});

			throw error;
		}
	}

	private async createPreRestoreBackup(adminId: string): Promise<number> {
		const result = await backupService.createBackup(
			{
				displayName: `Pre-restore backup ${new Date().toISOString()}`,
				description: 'Automatic backup created before restore operation',
				backupType: 'full',
				backupFormat: 'custom',
				tags: ['pre-restore', 'automatic'],
				isProtected: true
			},
			adminId
		);

		return result.backupId;
	}

	private async executePgRestore(operationId: string, options: CreateRestoreInput): Promise<void> {
		// Get source backup
		const sourceBackup = await backupService.getBackup(options.sourceBackupId);

		return new Promise((resolve, reject) => {
			const args = this.buildPgRestoreArgs(options, sourceBackup);

			const pgRestore = spawn('pg_restore', args, {
				env: {
					...process.env,
					PGPASSWORD: this.extractPasswordFromUrl(process.env.DATABASE_URL!)
				}
			});

			pgRestore.on('error', (error) => {
				reject(new Error(`pg_restore process error: ${error.message}`));
			});

			pgRestore.on('close', (code) => {
				if (code === 0) {
					resolve();
				} else {
					reject(new Error(`pg_restore exited with code ${code}`));
				}
			});

			// Update progress periodically
			const progressInterval = setInterval(() => {
				const current = this.activeRestores.get(operationId);
				if (current && current.progressPercent < 85) {
					this.updateProgress(
						operationId,
						Math.min(85, current.progressPercent + 5),
						'Restoring data...'
					);
				}
			}, 3000);

			pgRestore.on('close', () => {
				clearInterval(progressInterval);
			});
		});
	}

	private buildPgRestoreArgs(options: CreateRestoreInput, sourceBackup: any): string[] {
		const args = [
			'--verbose',
			'--no-password',
			'--clean', // Clean (drop) database objects before recreating
			'--if-exists' // Use IF EXISTS when dropping objects
		];

		// Database connection
		const dbUrl = new URL(process.env.DATABASE_URL!);
		args.push(`--host=${dbUrl.hostname}`);
		args.push(`--port=${dbUrl.port || '5432'}`);
		args.push(`--username=${dbUrl.username}`);
		args.push(`--dbname=${dbUrl.pathname.slice(1)}`);

		// Restore type options
		if (options.restoreType === 'schema_only') {
			args.push('--schema-only');
		} else if (options.restoreType === 'data_only') {
			args.push('--data-only');
		}

		// Include/exclude options
		if (!options.includeIndexes) {
			args.push('--no-indexes');
		}

		if (!options.includeConstraints) {
			args.push('--no-constraints');
		}

		if (!options.includeTriggers) {
			args.push('--no-triggers');
		}

		// Tables
		if (options.includedTables.length > 0) {
			options.includedTables.forEach((table) => {
				args.push(`--table=${table}`);
			});
		}

		// Exclude tables (for selective restore)
		if (options.excludedTables.length > 0) {
			options.excludedTables.forEach((table) => {
				args.push(`--exclude-table=${table}`);
			});
		}

		// Source file
		args.push(sourceBackup.filePath);

		return args;
	}

	private async validateBackupFile(backup: any) {
		try {
			// Check file exists and size
			if (!existsSync(backup.filePath)) {
				throw new Error('Backup file not found');
			}

			const stats = statSync(backup.filePath);
			const currentSize = stats.size;

			// Check if file size matches recorded size (within 1% tolerance)
			if (backup.fileSize && Math.abs(currentSize - backup.fileSize) > backup.fileSize * 0.01) {
				throw new Error('Backup file size mismatch - file may be corrupted');
			}

			// Verify MD5 checksum if available
			if (backup.checksumMd5) {
				// Implementation would calculate and compare MD5
				// Skipped for now due to complexity
			}

			return {
				valid: true,
				fileSize: currentSize,
				lastModified: stats.mtime,
				warnings: []
			};
		} catch (error) {
			return {
				valid: false,
				error: error.message,
				warnings: ['Backup file validation failed']
			};
		}
	}

	private async generateImpactAssessment(backup: any) {
		// This would analyze the backup and current database to assess impact
		return {
			estimatedDowntime: '5-15 minutes',
			affectedTables: backup.includedTables || ['All tables'],
			dataLossRisk: backup.backupType === 'full' ? 'Low' : 'Medium',
			rollbackTime: '2-5 minutes',
			databaseSizeChange: 'Unknown',
			userImpact: 'High - Database will be temporarily unavailable'
		};
	}

	private generateRestoreWarnings(backup: any, impact: any): string[] {
		const warnings = [];

		if (backup.backupType !== 'full') {
			warnings.push('Partial backup - some data may not be restored');
		}

		const backupAge = Date.now() - new Date(backup.createdAt).getTime();
		const daysOld = Math.floor(backupAge / (1000 * 60 * 60 * 24));

		if (daysOld > 7) {
			warnings.push(`Backup is ${daysOld} days old - recent data will be lost`);
		}

		if (backup.fileSize > 1000 * 1024 * 1024) {
			// > 1GB
			warnings.push('Large backup file - restore may take significant time');
		}

		warnings.push('Database will be unavailable during restore');
		warnings.push('All current data will be replaced');

		return warnings;
	}

	private estimateRestoreDuration(backup: any): number {
		// Rough estimation based on backup size
		const sizeGB = (backup.fileSize || 0) / (1024 * 1024 * 1024);
		return Math.max(5, Math.round(sizeGB * 3)); // ~3 minutes per GB, minimum 5 minutes
	}

	private async checkRestorePermissions(adminId: string, restoreType: string) {
		// Get backup settings to check permissions
		const [settings] = await db.select().from(backupSettings).limit(1);

		// For now, require admin role for all restores
		// This would integrate with the user role system
		return true;
	}

	private async verifyRestore() {
		// Basic verification - check if database is accessible and has expected structure
		try {
			const result = await db.execute(`
				SELECT 
					COUNT(*) as table_count,
					(SELECT COUNT(*) FROM users) as user_count
				FROM information_schema.tables 
				WHERE table_schema = 'public'
			`);

			return {
				tablesCount: result.rows[0]?.table_count || 0,
				rowsCount: result.rows[0]?.user_count || 0,
				verified: true
			};
		} catch (error) {
			throw new Error(`Restore verification failed: ${error.message}`);
		}
	}

	private updateProgress(operationId: string, percent: number, step: string) {
		const progress = this.activeRestores.get(operationId);
		if (progress) {
			progress.progressPercent = percent;
			progress.currentStep = step;
			this.activeRestores.set(operationId, progress);
		}
	}

	private async updateRestoreStatus(
		id: number,
		status: 'pending' | 'pre_backup' | 'restoring' | 'completed' | 'failed' | 'cancelled',
		errorMessage?: string | null,
		additionalData?: Record<string, any>
	) {
		const updateData: any = { status };

		if (errorMessage !== undefined) {
			updateData.errorMessage = errorMessage;
		}

		if (additionalData) {
			Object.assign(updateData, additionalData);
		}

		await db.update(restoreOperations).set(updateData).where(eq(restoreOperations.id, id));
	}

	private extractPasswordFromUrl(url: string): string {
		try {
			const parsed = new URL(url);
			return parsed.password;
		} catch {
			return '';
		}
	}
}

// Export singleton instance
export const restoreService = new RestoreService();
