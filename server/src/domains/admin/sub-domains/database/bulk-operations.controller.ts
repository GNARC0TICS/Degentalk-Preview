/**
 * Bulk Operations Controller
 *
 * Handles bulk data operations like CSV import/export and batch processing.
 */

import type { Request, Response } from 'express';
import { DatabaseService } from './database.service';
import { logger } from '@server/src/core/logger';
import { adminCreateAuditLogEntry } from '../../shared/admin-operation-utils';
import { getUserId } from '../../admin.middleware';
import { z } from 'zod';
import multer from 'multer';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

const databaseService = new DatabaseService();

// Validation schemas
const importValidationSchema = z.object({
	table: z.string().min(1),
	validateOnly: z.boolean().default(false),
	updateExisting: z.boolean().default(false)
});

const validateDataSchema = z.object({
	table: z.string().min(1),
	data: z.array(z.record(z.any()))
});

// Configure multer for file uploads
const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 10 * 1024 * 1024 // 10MB limit
	},
	fileFilter: (req, file, cb) => {
		if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
			cb(null, true);
		} else {
			cb(new Error('Only CSV files are allowed'));
		}
	}
}).single('file');

/**
 * Import CSV data into a table
 */
export async function importCSV(req: Request, res: Response) {
	try {
		const userId = getUserId(req);

		// Handle file upload
		upload(req, res, async (uploadError) => {
			if (uploadError) {
				return res.status(400).json({
					success: false,
					error: uploadError.message
				});
			}

			if (!req.file) {
				return res.status(400).json({
					success: false,
					error: 'No file uploaded'
				});
			}

			const { table, validateOnly, updateExisting } = importValidationSchema.parse(req.body);

			// Check table access permissions
			const accessInfo = await databaseService.getTableAccessInfo(table);
			if (!accessInfo.canEdit) {
				return res.status(403).json({
					success: false,
					error: accessInfo.reason || 'Table editing is not allowed',
					tableType: accessInfo.isConfig ? 'configuration' : 'restricted',
					configRoute: accessInfo.configRoute
				});
			}

			// Parse CSV data
			const csvData: any[] = [];
			const csvStream = Readable.from(req.file.buffer);

			try {
				await new Promise((resolve, reject) => {
					csvStream
						.pipe(csvParser())
						.on('data', (row) => csvData.push(row))
						.on('end', resolve)
						.on('error', reject);
				});

				// Validate data structure
				if (csvData.length === 0) {
					return res.status(400).json({
						success: false,
						error: 'CSV file is empty or invalid'
					});
				}

				// Validate each row against table schema
				const validationResults = [];
				for (let i = 0; i < csvData.length; i++) {
					const validation = await databaseService.validateRowData(table, csvData[i]);
					if (!validation.valid) {
						validationResults.push({
							row: i + 1,
							errors: validation.errors
						});
					}
				}

				// If validation only, return results
				if (validateOnly) {
					await adminCreateAuditLogEntry({
						adminUserId: userId,
						action: 'database_import_validated',
						details: `Validated CSV import for table ${table} (${csvData.length} rows, ${validationResults.length} errors)`
					});

					return res.json({
						success: true,
						data: {
							totalRows: csvData.length,
							validRows: csvData.length - validationResults.length,
							errors: validationResults,
							preview: csvData.slice(0, 5) // First 5 rows for preview
						}
					});
				}

				// If there are validation errors, don't proceed with import
				if (validationResults.length > 0) {
					return res.status(400).json({
						success: false,
						error: 'Data validation failed',
						details: validationResults
					});
				}

				// Perform the import
				let imported = 0;
				let updated = 0;
				let errors = 0;

				for (const row of csvData) {
					try {
						if (updateExisting) {
							// Try to update first, then create if not exists
							const schema = await databaseService.getTableSchema(table);
							const primaryKey = schema.primaryKey[0];

							if (primaryKey && row[primaryKey]) {
								const existing = await databaseService.getRowById(table, row[primaryKey]);
								if (existing) {
									await databaseService.updateRow(table, row[primaryKey], row);
									updated++;
								} else {
									await databaseService.createRow(table, row);
									imported++;
								}
							} else {
								await databaseService.createRow(table, row);
								imported++;
							}
						} else {
							await databaseService.createRow(table, row);
							imported++;
						}
					} catch (error) {
						errors++;
						logger.warn('BulkController', 'Failed to import row', { error, row });
					}
				}

				// Log the import
				await adminCreateAuditLogEntry({
					adminUserId: userId,
					action: 'database_bulk_import',
					details: `Imported CSV data to table ${table}`,
					metadata: {
						table,
						totalRows: csvData.length,
						imported,
						updated,
						errors,
						filename: req.file.originalname
					}
				});

				res.json({
					success: true,
					data: {
						totalRows: csvData.length,
						imported,
						updated,
						errors
					}
				});
			} catch (parseError: any) {
				logger.error('BulkController', 'CSV parsing error', { error: parseError.message });
				res.status(400).json({
					success: false,
					error: 'Failed to parse CSV file'
				});
			}
		});
	} catch (error: any) {
		logger.error('BulkController', 'Error importing CSV', { error: error.message });
		res.status(500).json({
			success: false,
			error: 'Failed to import CSV data'
		});
	}
}

/**
 * Get CSV import template for a table
 */
export async function getImportTemplate(req: Request, res: Response) {
	try {
		const userId = getUserId(req);
		const { table } = req.params;

		if (!table) {
			return res.status(400).json({
				success: false,
				error: 'Table name is required'
			});
		}

		// Check table access
		const accessInfo = await databaseService.getTableAccessInfo(table);
		if (!accessInfo.canView) {
			return res.status(403).json({
				success: false,
				error: 'Table access denied'
			});
		}

		// Get table schema
		const schema = await databaseService.getTableSchema(table);

		// Generate CSV headers
		const headers = schema.columns
			.filter((col) => !col.isPrimaryKey || !col.defaultValue) // Exclude auto-increment PKs
			.map((col) => col.name);

		// Generate sample row
		const sampleRow = schema.columns
			.filter((col) => !col.isPrimaryKey || !col.defaultValue)
			.map((col) => {
				if (col.type.includes('varchar') || col.type.includes('text')) {
					return 'sample_text';
				} else if (col.type.includes('int')) {
					return '123';
				} else if (col.type.includes('bool')) {
					return 'true';
				} else if (col.type.includes('timestamp') || col.type.includes('date')) {
					return '2024-01-01 12:00:00';
				} else {
					return 'sample_value';
				}
			});

		// Create CSV content
		const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');

		// Log access
		await adminCreateAuditLogEntry({
			adminUserId: userId,
			action: 'database_template_downloaded',
			details: `Downloaded import template for table: ${table}`
		});

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', `attachment; filename="${table}_import_template.csv"`);
		res.send(csvContent);
	} catch (error: any) {
		logger.error('BulkController', 'Error generating import template', {
			error: error.message,
			table: req.params.table
		});
		res.status(500).json({
			success: false,
			error: 'Failed to generate import template'
		});
	}
}

/**
 * Validate import data without actually importing
 */
export async function validateImportData(req: Request, res: Response) {
	try {
		const userId = getUserId(req);
		const { table, data } = validateDataSchema.parse(req.body);

		// Check table access
		const accessInfo = await databaseService.getTableAccessInfo(table);
		if (!accessInfo.canEdit) {
			return res.status(403).json({
				success: false,
				error: accessInfo.reason || 'Table editing is not allowed'
			});
		}

		// Validate each row
		const validationResults = [];
		for (let i = 0; i < data.length; i++) {
			const validation = await databaseService.validateRowData(table, data[i]);
			if (!validation.valid) {
				validationResults.push({
					row: i + 1,
					data: data[i],
					errors: validation.errors
				});
			}
		}

		// Log validation
		await adminCreateAuditLogEntry({
			adminUserId: userId,
			action: 'database_data_validated',
			details: `Validated ${data.length} rows for table ${table}`
		});

		res.json({
			success: true,
			data: {
				totalRows: data.length,
				validRows: data.length - validationResults.length,
				invalidRows: validationResults.length,
				errors: validationResults
			}
		});
	} catch (error: any) {
		logger.error('BulkController', 'Error validating import data', { error: error.message });
		res.status(500).json({
			success: false,
			error: 'Failed to validate import data'
		});
	}
}
