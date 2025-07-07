/**
 * Backup Service
 *
 * Handles database backup operations using PostgreSQL pg_dump
 */

import { db } from '@db';
import { adminBackups, backupSettings } from '@schema';
import { eq, desc, and, gte, lte, ilike, or } from 'drizzle-orm';
import { AdminError, AdminErrorCodes } from '../../admin.errors';
import { adminCacheService } from '../../shared';
import { spawn } from 'child_process';
import { createHash } from 'crypto';
import { createReadStream, createWriteStream, statSync, unlinkSync, existsSync } from 'fs';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { join, dirname } from 'path';
import { mkdirSync } from 'fs';
import { z } from 'zod';
import type { BackupId } from '@shared/types';
import { logger } from '../../../../core/logger';

// Validation schemas
export const createBackupSchema = z.object({
	displayName: z.string().min(1).max(255),
	description: z.string().optional(),
	backupType: z.enum(['full', 'schema', 'selective']).default('full'),
	backupFormat: z.enum(['custom', 'plain', 'tar']).default('custom'),
	includedTables: z.array(z.string()).default([]),
	includedSchemas: z.array(z.string()).default(['public']),
	excludedTables: z.array(z.string()).default([]),
	tags: z.array(z.string()).default([]),
	compressionType: z.enum(['gzip', 'none']).default('gzip'),
	isProtected: z.boolean().default(false)
});

export const listBackupsSchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(20),
	status: z.enum(['pending', 'running', 'completed', 'failed']).optional(),
	backupType: z.enum(['full', 'schema', 'selective']).optional(),
	source: z.enum(['manual', 'scheduled']).optional(),
	search: z.string().optional(),
	startDate: z.string().datetime().optional(),
	endDate: z.string().datetime().optional(),
	tags: z.array(z.string()).default([])
});

export type CreateBackupInput = z.infer<typeof createBackupSchema>;
export type ListBackupsInput = z.infer<typeof listBackupsSchema>;

interface BackupProgress {
	backupId: BackupId;
	status: 'pending' | 'running' | 'completed' | 'failed';
	progressPercent: number;
	currentStep: string;
	estimatedTimeRemaining?: number;
	errorMessage?: string;
}

export class BackupService {
	private activeBackups = new Map<number, BackupProgress>();
	private readonly BACKUP_BASE_PATH = process.env.BACKUP_STORAGE_PATH || '/var/backups/degentalk';

	/**
	 * Create a new database backup
	 */
	async createBackup(
		data: CreateBackupInput,
		adminId: string
	): Promise<{ backupId: BackupId; message: string }> {
		try {
			// Validate input
			const validatedData = createBackupSchema.parse(data);

			// Get backup settings
			const settings = await this.getBackupSettings();

			// Check storage space
			await this.checkStorageSpace(settings);

			// Generate unique filename
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
			const filename = `degentalk_${validatedData.backupType}_${timestamp}`;
			const fileExtension = this.getFileExtension(
				validatedData.backupFormat,
				validatedData.compressionType
			);
			const fullFilename = `${filename}${fileExtension}`;
			const filePath = join(this.BACKUP_BASE_PATH, 'manual', fullFilename);

			// Ensure directory exists
			mkdirSync(dirname(filePath), { recursive: true });

			// Create backup record
			const [backup] = await db
				.insert(adminBackups)
				.values({
					filename: fullFilename,
					displayName: validatedData.displayName,
					description: validatedData.description,
					backupType: validatedData.backupType,
					source: 'manual',
					filePath,
					databaseName: this.getDatabaseName(),
					backupFormat: validatedData.backupFormat,
					compressionType: validatedData.compressionType,
					includedTables: validatedData.includedTables,
					includedSchemas: validatedData.includedSchemas,
					excludedTables: validatedData.excludedTables,
					tags: validatedData.tags,
					isProtected: validatedData.isProtected,
					status: 'pending',
					createdBy: adminId
				})
				.returning();

			// Start backup process asynchronously
			this.executeBackup(backup.id, filePath, validatedData).catch((error) => {
				logger.error(`Backup ${backup.id} failed:`, error);
				this.updateBackupStatus(backup.id, 'failed', error.message);
			});

			// Invalidate cache
			await adminCacheService.invalidateEntity('backup');

			return {
				backupId: backup.id,
				message: `Backup "${validatedData.displayName}" started successfully`
			};
		} catch (error) {
			if (error instanceof AdminError) throw error;

			throw new AdminError('Failed to create backup', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Get list of backups with filtering and pagination
	 */
	async getBackups(filters: ListBackupsInput) {
		try {
			const validatedFilters = listBackupsSchema.parse(filters);

			let query = db.select().from(adminBackups);
			const conditions = [];

			// Apply filters
			if (validatedFilters.status) {
				conditions.push(eq(adminBackups.status, validatedFilters.status));
			}

			if (validatedFilters.backupType) {
				conditions.push(eq(adminBackups.backupType, validatedFilters.backupType));
			}

			if (validatedFilters.source) {
				conditions.push(eq(adminBackups.source, validatedFilters.source));
			}

			if (validatedFilters.search) {
				conditions.push(
					or(
						ilike(adminBackups.displayName, `%${validatedFilters.search}%`),
						ilike(adminBackups.description, `%${validatedFilters.search}%`),
						ilike(adminBackups.filename, `%${validatedFilters.search}%`)
					)
				);
			}

			if (validatedFilters.startDate) {
				conditions.push(gte(adminBackups.createdAt, validatedFilters.startDate));
			}

			if (validatedFilters.endDate) {
				conditions.push(lte(adminBackups.createdAt, validatedFilters.endDate));
			}

			// Apply conditions
			if (conditions.length > 0) {
				query = query.where(and(...conditions));
			}

			// Apply ordering and pagination
			const backups = await query
				.orderBy(desc(adminBackups.createdAt))
				.limit(validatedFilters.limit)
				.offset((validatedFilters.page - 1) * validatedFilters.limit);

			// Get total count for pagination
			const [countResult] = await db
				.select({ count: adminBackups.id })
				.from(adminBackups)
				.where(conditions.length > 0 ? and(...conditions) : undefined);

			return {
				backups: backups.map((backup) => ({
					...backup,
					fileSizeMB: backup.fileSize
						? Math.round((backup.fileSize / (1024 * 1024)) * 100) / 100
						: null,
					progress: this.activeBackups.get(backup.id)
				})),
				pagination: {
					page: validatedFilters.page,
					limit: validatedFilters.limit,
					total: countResult?.count || 0,
					totalPages: Math.ceil((countResult?.count || 0) / validatedFilters.limit)
				}
			};
		} catch (error) {
			if (error instanceof AdminError) throw error;

			throw new AdminError('Failed to fetch backups', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Get backup details by ID
	 */
	async getBackup(id: Id<'id'>) {
		try {
			const [backup] = await db.select().from(adminBackups).where(eq(adminBackups.id, id));

			if (!backup) {
				throw new AdminError(`Backup not found: ${id}`, 404, AdminErrorCodes.NOT_FOUND);
			}

			// Check if file exists
			const fileExists = existsSync(backup.filePath);

			return {
				...backup,
				fileSizeMB: backup.fileSize
					? Math.round((backup.fileSize / (1024 * 1024)) * 100) / 100
					: null,
				fileExists,
				progress: this.activeBackups.get(backup.id)
			};
		} catch (error) {
			if (error instanceof AdminError) throw error;

			throw new AdminError('Failed to fetch backup', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Delete a backup and its file
	 */
	async deleteBackup(id: Id<'id'>, adminId: string) {
		try {
			const backup = await this.getBackup(id);

			// Check if backup is protected
			if (backup.isProtected) {
				throw new AdminError(
					'Cannot delete protected backup',
					400,
					AdminErrorCodes.INVALID_REQUEST
				);
			}

			// Check if backup is currently running
			if (backup.status === 'running' || backup.status === 'pending') {
				throw new AdminError(
					'Cannot delete backup that is currently running',
					400,
					AdminErrorCodes.INVALID_REQUEST
				);
			}

			// Delete file if it exists
			if (backup.fileExists) {
				try {
					unlinkSync(backup.filePath);
				} catch (fileError) {
					logger.warn(`Could not delete backup file ${backup.filePath}:`, fileError);
				}
			}

			// Delete backup record
			await db.delete(adminBackups).where(eq(adminBackups.id, id));

			// Invalidate cache
			await adminCacheService.invalidateEntity('backup');

			return { success: true, message: `Backup "${backup.displayName}" deleted successfully` };
		} catch (error) {
			if (error instanceof AdminError) throw error;

			throw new AdminError('Failed to delete backup', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	/**
	 * Get backup progress for active operations
	 */
	getBackupProgress(id: Id<'id'>): BackupProgress | null {
		return this.activeBackups.get(id) || null;
	}

	/**
	 * Get backup storage statistics
	 */
	async getStorageStats() {
		try {
			// Get total backups and storage usage
			const backups = await db.select().from(adminBackups);

			const stats = backups.reduce(
				(acc, backup) => {
					acc.totalCount++;
					acc.totalSize += backup.fileSize || 0;

					if (backup.status === 'completed') acc.completedCount++;
					if (backup.status === 'failed') acc.failedCount++;
					if (backup.status === 'running' || backup.status === 'pending') acc.activeCount++;

					acc.byType[backup.backupType] = (acc.byType[backup.backupType] || 0) + 1;
					acc.bySource[backup.source] = (acc.bySource[backup.source] || 0) + 1;

					return acc;
				},
				{
					totalCount: 0,
					completedCount: 0,
					failedCount: 0,
					activeCount: 0,
					totalSize: 0,
					totalSizeMB: 0,
					byType: {} as Record<string, number>,
					bySource: {} as Record<string, number>
				}
			);

			stats.totalSizeMB = Math.round((stats.totalSize / (1024 * 1024)) * 100) / 100;

			// Get settings for comparison
			const settings = await this.getBackupSettings();
			const maxSizeMB = Math.round(settings.maxStorageSize / (1024 * 1024));
			const usagePercent = Math.round((stats.totalSizeMB / maxSizeMB) * 100);

			return {
				...stats,
				maxStorageMB: maxSizeMB,
				usagePercent,
				recommendations: this.generateStorageRecommendations(stats, settings)
			};
		} catch (error) {
			throw new AdminError('Failed to fetch storage statistics', 500, AdminErrorCodes.DB_ERROR, {
				originalError: error.message
			});
		}
	}

	// Private helper methods

	private async executeBackup(backupId: BackupId, filePath: string, options: CreateBackupInput) {
		try {
			// Update status to running
			await this.updateBackupStatus(backupId, 'running', null, {
				startedAt: new Date().toISOString()
			});

			this.activeBackups.set(backupId, {
				backupId,
				status: 'running',
				progressPercent: 0,
				currentStep: 'Initializing backup...'
			});

			// Build pg_dump command
			const pgDumpArgs = this.buildPgDumpArgs(options);

			// Update progress
			this.updateProgress(backupId, 10, 'Connecting to database...');

			// Execute pg_dump
			const outputPath =
				options.compressionType === 'gzip' ? filePath.replace('.gz', '') : filePath;

			await this.executePgDump(pgDumpArgs, outputPath, backupId);

			// Compress if needed
			if (options.compressionType === 'gzip') {
				this.updateProgress(backupId, 90, 'Compressing backup...');
				await this.compressFile(outputPath, filePath);
				unlinkSync(outputPath); // Remove uncompressed file
			}

			// Calculate file size and checksum
			this.updateProgress(backupId, 95, 'Calculating checksum...');
			const fileSize = statSync(filePath).size;
			const checksum = await this.calculateMD5(filePath);

			// Update backup record with completion
			await this.updateBackupStatus(backupId, 'completed', null, {
				completedAt: new Date().toISOString(),
				fileSize,
				checksumMd5: checksum
			});

			this.updateProgress(backupId, 100, 'Backup completed successfully');

			// Remove from active backups after a delay
			setTimeout(() => {
				this.activeBackups.delete(backupId);
			}, 5000);
		} catch (error) {
			await this.updateBackupStatus(backupId, 'failed', error.message);
			this.activeBackups.set(backupId, {
				backupId,
				status: 'failed',
				progressPercent: 0,
				currentStep: 'Backup failed',
				errorMessage: error.message
			});

			// Clean up partial files
			try {
				if (existsSync(filePath)) unlinkSync(filePath);
			} catch (cleanupError) {
				logger.warn(`Could not clean up failed backup file:`, cleanupError);
			}

			throw error;
		}
	}

	private buildPgDumpArgs(options: CreateBackupInput): string[] {
		const args = [
			'--verbose',
			'--no-password' // Use environment variables for auth
		];

		// Set format
		if (options.backupFormat === 'custom') {
			args.push('--format=custom');
		} else if (options.backupFormat === 'tar') {
			args.push('--format=tar');
		}

		// Backup type options
		if (options.backupType === 'schema') {
			args.push('--schema-only');
		}

		// Include/exclude tables
		if (options.includedTables.length > 0) {
			options.includedTables.forEach((table) => {
				args.push(`--table=${table}`);
			});
		}

		if (options.excludedTables.length > 0) {
			options.excludedTables.forEach((table) => {
				args.push(`--exclude-table=${table}`);
			});
		}

		// Include schemas
		if (options.includedSchemas.length > 0) {
			options.includedSchemas.forEach((schema) => {
				if (schema !== 'public') {
					// public is default
					args.push(`--schema=${schema}`);
				}
			});
		}

		return args;
	}

	private async executePgDump(
		args: string[],
		outputPath: string,
		backupId: BackupId
	): Promise<void> {
		return new Promise((resolve, reject) => {
			const pgDump = spawn('pg_dump', [...args, '--file', outputPath], {
				env: {
					...process.env,
					PGPASSWORD: this.extractPasswordFromUrl(process.env.DATABASE_URL!)
				}
			});

			pgDump.on('error', (error) => {
				reject(new Error(`pg_dump process error: ${error.message}`));
			});

			pgDump.on('close', (code) => {
				if (code === 0) {
					resolve();
				} else {
					reject(new Error(`pg_dump exited with code ${code}`));
				}
			});

			// Update progress periodically
			const progressInterval = setInterval(() => {
				this.updateProgress(
					backupId,
					Math.min(80, (this.activeBackups.get(backupId)?.progressPercent || 0) + 5),
					'Creating backup...'
				);
			}, 2000);

			pgDump.on('close', () => {
				clearInterval(progressInterval);
			});
		});
	}

	private async compressFile(inputPath: string, outputPath: string): Promise<void> {
		const input = createReadStream(inputPath);
		const output = createWriteStream(outputPath);
		const gzip = createGzip({ level: 6 });

		await pipeline(input, gzip, output);
	}

	private async calculateMD5(filePath: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const hash = createHash('md5');
			const stream = createReadStream(filePath);

			stream.on('data', (data) => hash.update(data));
			stream.on('end', () => resolve(hash.digest('hex')));
			stream.on('error', reject);
		});
	}

	private updateProgress(backupId: BackupId, percent: number, step: string) {
		const progress = this.activeBackups.get(backupId);
		if (progress) {
			progress.progressPercent = percent;
			progress.currentStep = step;
			this.activeBackups.set(backupId, progress);
		}
	}

	private async updateBackupStatus(
		id: Id<'id'>,
		status: 'pending' | 'running' | 'completed' | 'failed',
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

		await db.update(adminBackups).set(updateData).where(eq(adminBackups.id, id));
	}

	private async getBackupSettings() {
		// Get or create default backup settings
		const [settings] = await db.select().from(backupSettings).limit(1);

		if (!settings) {
			const [newSettings] = await db.insert(backupSettings).values({}).returning();
			return newSettings;
		}

		return settings;
	}

	private async checkStorageSpace(settings: any) {
		// Implementation would check available disk space
		// For now, just check against configured limits
		const stats = await this.getStorageStats();

		if (stats.totalSize >= settings.maxStorageSize) {
			throw new AdminError(
				'Storage limit exceeded. Please clean up old backups.',
				400,
				AdminErrorCodes.INVALID_REQUEST
			);
		}
	}

	private getFileExtension(format: string, compression: string): string {
		let ext = '';

		if (format === 'custom') ext = '.dump';
		else if (format === 'tar') ext = '.tar';
		else ext = '.sql';

		if (compression === 'gzip') ext += '.gz';

		return ext;
	}

	private getDatabaseName(): string {
		const dbUrl = process.env.DATABASE_URL || '';
		const match = dbUrl.match(/\/([^?]+)(\?|$)/);
		return match ? match[1] : 'degentalk';
	}

	private extractPasswordFromUrl(url: string): string {
		try {
			const parsed = new URL(url);
			return parsed.password;
		} catch {
			return '';
		}
	}

	private generateStorageRecommendations(stats: any, settings: any): string[] {
		const recommendations = [];

		if (stats.usagePercent > 80) {
			recommendations.push('Storage usage is high. Consider cleaning up old backups.');
		}

		if (stats.failedCount > stats.completedCount * 0.1) {
			recommendations.push('High failure rate detected. Check backup configuration.');
		}

		if (stats.activeCount > 3) {
			recommendations.push('Multiple backups running simultaneously may impact performance.');
		}

		return recommendations;
	}
}

// Export singleton instance
export const backupService = new BackupService();
