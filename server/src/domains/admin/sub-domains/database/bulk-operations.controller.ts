import { userService } from '@core/services/user.service';
/**
 * Bulk Operations Controller
 *
 * Handles bulk data operations like CSV import/export and batch processing.
 */

import type { Request, Response } from 'express';
import { DatabaseService } from './database.service';
import { logger } from '@core/logger';
import { adminCreateAuditLogEntry } from '../../shared/admin-operation-utils';
import { getUserId } from '../../admin.middleware';
import { z } from 'zod';
import multer from 'multer';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

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
		const userId = userService.getUserFromRequest(req);

		// Handle file upload
		sendErrorResponse(res, 'Server error', 400);
	} catch (error: any) {
		logger.error('BulkController', 'Error importing CSV', { error: error.message });
		sendErrorResponse(res, 'Failed to import CSV data', 500);
	}
}

/**
 * Get CSV import template for a table
 */
export async function getImportTemplate(req: Request, res: Response) {
	try {
		const userId = userService.getUserFromRequest(req);
		const { table } = req.params;

		if (!table) {
			return sendErrorResponse(res, 'Table name is required', 400);
		}

		// Check table access
		const accessInfo = await databaseService.getTableAccessInfo(table);
		if (!accessInfo.canView) {
			return sendErrorResponse(res, 'Table access denied', 403);
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
		sendSuccessResponse(res, csvContent);
	} catch (error: any) {
		logger.error('BulkController', 'Error generating import template', {
			error: error.message,
			table: req.params.table
		});
		sendErrorResponse(res, 'Failed to generate import template', 500);
	}
}

/**
 * Validate import data without actually importing
 */
export async function validateImportData(req: Request, res: Response) {
	try {
		const userId = userService.getUserFromRequest(req);
		const { table, data } = validateDataSchema.parse(req.body);

		// Check table access
		const accessInfo = await databaseService.getTableAccessInfo(table);
		if (!accessInfo.canEdit) {
			return sendErrorResponse(res, accessInfo.reason || 'Table editing is not allowed', 403);
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

		sendSuccessResponse(res, {
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
		sendErrorResponse(res, 'Failed to validate import data', 500);
	}
}
