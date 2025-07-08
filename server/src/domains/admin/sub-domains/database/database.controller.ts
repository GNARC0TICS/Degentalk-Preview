import type { Request, Response } from 'express';
import { userService } from '@server/src/core/services/user.service';
import { DatabaseService } from './database.service';
import { QueryService } from './query.service';
import { logger } from '@server/src/core/logger';
import { adminCreateAuditLogEntry } from '../../shared/admin-operation-utils';
import { getUserId } from '../../admin.middleware';
import { z } from 'zod';
import { 
	sendSuccessResponse,
	sendErrorResponse
} from '@server/src/core/utils/transformer.helpers';
import { sendSuccess, sendError, sendValidationError, handleAdminError } from '../../admin.response';

const databaseService = new DatabaseService();
const queryService = new QueryService();

// Request validation schemas
const tableQuerySchema = z.object({
	table: z.string().min(1),
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(1000).default(50),
	search: z.string().optional(),
	sortField: z.string().optional(),
	sortOrder: z.enum(['asc', 'desc']).default('asc')
});

const rowUpdateSchema = z.object({
	table: z.string().min(1),
	rowId: z.union([z.string(), z.number()]),
	data: z.record(z.any())
});

const rowCreateSchema = z.object({
	table: z.string().min(1),
	data: z.record(z.any())
});

const rowDeleteSchema = z.object({
	table: z.string().min(1),
	rowId: z.union([z.string(), z.number()])
});

const bulkOperationSchema = z.object({
	table: z.string().min(1),
	operation: z.enum(['update', 'delete']),
	rowIds: z.array(z.union([z.string(), z.number()])),
	data: z.record(z.any()).optional()
});

/**
 * Get list of all database tables with metadata
 */
export async function getTables(req: Request, res: Response) {
	try {
		const userId = userService.getUserFromRequest(req);

		const tables = await databaseService.getTables();

		// Log access
		await adminCreateAuditLogEntry({
			adminUserId: userId,
			action: 'database_tables_viewed',
			details: `Viewed database table list (${tables.length} tables)`
		});

		sendSuccessResponse(res, tables);
	} catch (error: any) {
		logger.error('DatabaseController', 'Error getting tables', { error: error.message });
		return sendError(res, 'Failed to retrieve database tables');
	}
}

/**
 * Get table schema and metadata
 */
export async function getTableSchema(req: Request, res: Response) {
	try {
		const userId = userService.getUserFromRequest(req);
		const { table } = req.params;

		if (!table) {
			return sendValidationError(res, 'Table name is required');
		}

		const schema = await databaseService.getTableSchema(table);

		// Log access
		await adminCreateAuditLogEntry({
			adminUserId: userId,
			action: 'database_schema_viewed',
			details: `Viewed schema for table: ${table}`
		});

		sendSuccessResponse(res, schema);
	} catch (error: any) {
		logger.error('DatabaseController', 'Error getting table schema', {
			error: error.message,
			table: req.params.table
		});
		return sendError(res, 'Failed to retrieve table schema');
	}
}

/**
 * Get table data with pagination and filtering
 */
export async function getTableData(req: Request, res: Response) {
	try {
		const userId = userService.getUserFromRequest(req);
		const { table } = req.params;
		const queryParams = tableQuerySchema.parse(req.query);

		if (!table) {
			return sendValidationError(res, 'Table name is required');
		}

		const result = await databaseService.getTableData(table, queryParams);

		// Log access (only log periodically to avoid spam)
		if (queryParams.page === 1) {
			await adminCreateAuditLogEntry({
				adminUserId: userId,
				action: 'database_table_browsed',
				details: `Browsed table: ${table} (${result.total} total rows)`
			});
		}

		sendSuccessResponse(res, result);
	} catch (error: any) {
		logger.error('DatabaseController', 'Error getting table data', {
			error: error.message,
			table: req.params.table
		});
		return sendError(res, 'Failed to retrieve table data');
	}
}

/**
 * Update a single row in a table
 */
export async function updateRow(req: Request, res: Response) {
	try {
		const userId = userService.getUserFromRequest(req);
		const requestData = rowUpdateSchema.parse(req.body);

		// Check table access permissions
		const accessInfo = await databaseService.getTableAccessInfo(requestData.table);
		if (!accessInfo.canEdit) {
			const response: any = {
				success: false,
				error: accessInfo.reason || 'Table editing is not allowed',
				tableType: accessInfo.isConfig ? 'configuration' : 'restricted'
			};

			if (accessInfo.isConfig && accessInfo.configRoute) {
				response.configRoute = accessInfo.configRoute;
				response.message = `This is a configuration table. Please use the dedicated config panel: ${accessInfo.configRoute}`;
			}

			return sendError(res, response.error || 'Table editing is not allowed', 403);
		}

		// Validate data
		const validation = await databaseService.validateRowData(requestData.table, requestData.data);
		if (!validation.valid) {
			return sendValidationError(res, 'Data validation failed', validation.errors);
		}

		const result = await databaseService.updateRow(
			requestData.table,
			requestData.rowId,
			requestData.data
		);

		// Log the update
		await adminCreateAuditLogEntry({
			adminUserId: userId,
			action: 'database_row_updated',
			details: `Updated row ${requestData.rowId} in table ${requestData.table}`,
			metadata: {
				table: requestData.table,
				rowId: requestData.rowId,
				updatedFields: Object.keys(requestData.data),
				newData: requestData.data
			}
		});

		sendSuccessResponse(res, result);
	} catch (error: any) {
		logger.error('DatabaseController', 'Error updating row', { error: error.message });
		return sendError(res, 'Failed to update row');
	}
}

/**
 * Create a new row in a table
 */
export async function createRow(req: Request, res: Response) {
	try {
		const userId = userService.getUserFromRequest(req);
		const requestData = rowCreateSchema.parse(req.body);

		// Check table access permissions
		const accessInfo = await databaseService.getTableAccessInfo(requestData.table);
		if (!accessInfo.canEdit) {
			const response: any = {
				success: false,
				error: accessInfo.reason || 'Table editing is not allowed',
				tableType: accessInfo.isConfig ? 'configuration' : 'restricted'
			};

			if (accessInfo.isConfig && accessInfo.configRoute) {
				response.configRoute = accessInfo.configRoute;
				response.message = `This is a configuration table. Please use the dedicated config panel: ${accessInfo.configRoute}`;
			}

			return sendError(res, response.error || 'Table editing is not allowed', 403);
		}

		// Validate data
		const validation = await databaseService.validateRowData(requestData.table, requestData.data);
		if (!validation.valid) {
			return sendValidationError(res, 'Data validation failed', validation.errors);
		}

		const result = await databaseService.createRow(requestData.table, requestData.data);

		// Log the creation
		await adminCreateAuditLogEntry({
			adminUserId: userId,
			action: 'database_row_created',
			details: `Created new row in table ${requestData.table}`,
			metadata: {
				table: requestData.table,
				newRowId: result.id,
				data: requestData.data
			}
		});

		sendSuccessResponse(res, result);
	} catch (error: any) {
		logger.error('DatabaseController', 'Error creating row', { error: error.message });
		return sendError(res, 'Failed to create row');
	}
}

/**
 * Delete a row from a table
 */
export async function deleteRow(req: Request, res: Response) {
	try {
		const userId = userService.getUserFromRequest(req);
		const requestData = rowDeleteSchema.parse(req.body);

		// Check table access permissions
		const accessInfo = await databaseService.getTableAccessInfo(requestData.table);
		if (!accessInfo.canEdit) {
			const response: any = {
				success: false,
				error: accessInfo.reason || 'Table editing is not allowed',
				tableType: accessInfo.isConfig ? 'configuration' : 'restricted'
			};

			if (accessInfo.isConfig && accessInfo.configRoute) {
				response.configRoute = accessInfo.configRoute;
				response.message = `This is a configuration table. Please use the dedicated config panel: ${accessInfo.configRoute}`;
			}

			return sendError(res, response.error || 'Table editing is not allowed', 403);
		}

		// Get row data before deletion for audit log
		const rowData = await databaseService.getRowById(requestData.table, requestData.rowId);

		const result = await databaseService.deleteRow(requestData.table, requestData.rowId);

		// Log the deletion
		await adminCreateAuditLogEntry({
			adminUserId: userId,
			action: 'database_row_deleted',
			details: `Deleted row ${requestData.rowId} from table ${requestData.table}`,
			metadata: {
				table: requestData.table,
				deletedRowId: requestData.rowId,
				deletedData: rowData
			}
		});

		sendSuccessResponse(res, result);
	} catch (error: any) {
		logger.error('DatabaseController', 'Error deleting row', { error: error.message });
		return sendError(res, 'Failed to delete row');
	}
}

/**
 * Perform bulk operations on multiple rows
 */
export async function bulkOperation(req: Request, res: Response) {
	try {
		const userId = userService.getUserFromRequest(req);
		const requestData = bulkOperationSchema.parse(req.body);

		// Check table access permissions
		const accessInfo = await databaseService.getTableAccessInfo(requestData.table);
		if (!accessInfo.canEdit) {
			const response: any = {
				success: false,
				error: accessInfo.reason || 'Table editing is not allowed',
				tableType: accessInfo.isConfig ? 'configuration' : 'restricted'
			};

			if (accessInfo.isConfig && accessInfo.configRoute) {
				response.configRoute = accessInfo.configRoute;
				response.message = `This is a configuration table. Please use the dedicated config panel: ${accessInfo.configRoute}`;
			}

			return sendError(res, response.error || 'Table editing is not allowed', 403);
		}

		// Limit bulk operations to prevent abuse
		if (requestData.rowIds.length > 100) {
			return sendValidationError(res, 'Bulk operations are limited to 100 rows at a time');
		}

		const result = await databaseService.bulkOperation(
			requestData.table,
			requestData.operation,
			requestData.rowIds,
			requestData.data
		);

		// Log the bulk operation
		await adminCreateAuditLogEntry({
			adminUserId: userId,
			action: `database_bulk_${requestData.operation}`,
			details: `Performed bulk ${requestData.operation} on ${requestData.rowIds.length} rows in table ${requestData.table}`,
			metadata: {
				table: requestData.table,
				operation: requestData.operation,
				rowCount: requestData.rowIds.length,
				rowIds: requestData.rowIds,
				data: requestData.data
			}
		});

		sendSuccessResponse(res, result);
	} catch (error: any) {
		logger.error('DatabaseController', 'Error performing bulk operation', { error: error.message });
		return sendError(res, 'Failed to perform bulk operation');
	}
}

/**
 * Export table data as CSV
 */
export async function exportTableCSV(req: Request, res: Response) {
	try {
		const userId = userService.getUserFromRequest(req);
		const { table } = req.params;

		if (!table) {
			return sendValidationError(res, 'Table name is required');
		}

		const csvData = await databaseService.exportTableAsCSV(table);

		// Log the export
		await adminCreateAuditLogEntry({
			adminUserId: userId,
			action: 'database_table_exported',
			details: `Exported table ${table} as CSV`
		});

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', `attachment; filename="${table}_export.csv"`);
		res.send(csvData);
	} catch (error: any) {
		logger.error('DatabaseController', 'Error exporting table CSV', {
			error: error.message,
			table: req.params.table
		});
		return sendError(res, 'Failed to export table data');
	}
}

/**
 * Get foreign key relationships for a table
 */
export async function getTableRelationships(req: Request, res: Response) {
	try {
		const userId = userService.getUserFromRequest(req);
		const { table } = req.params;

		if (!table) {
			return sendValidationError(res, 'Table name is required');
		}

		const relationships = await databaseService.getTableRelationships(table);

		// Log access
		await adminCreateAuditLogEntry({
			adminUserId: userId,
			action: 'database_relationships_viewed',
			details: `Viewed relationships for table: ${table}`
		});

		sendSuccessResponse(res, relationships);
	} catch (error: any) {
		logger.error('DatabaseController', 'Error getting table relationships', {
			error: error.message,
			table: req.params.table
		});
		return sendError(res, 'Failed to retrieve table relationships');
	}
}

/**
 * Get database statistics and health info
 */
export async function getDatabaseStats(req: Request, res: Response) {
	try {
		const userId = userService.getUserFromRequest(req);

		const stats = await databaseService.getDatabaseStats();

		// Log access
		await adminCreateAuditLogEntry({
			adminUserId: userId,
			action: 'database_stats_viewed',
			details: 'Viewed database statistics'
		});

		sendSuccessResponse(res, stats);
	} catch (error: any) {
		logger.error('DatabaseController', 'Error getting database stats', { error: error.message });
		return sendError(res, 'Failed to retrieve database statistics');
	}
}
