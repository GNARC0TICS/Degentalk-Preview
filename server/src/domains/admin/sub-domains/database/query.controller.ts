/**
 * Query Controller
 *
 * Handles SQL query execution requests with proper validation and audit logging.
 */

import type { Request, Response } from 'express';
import { QueryService } from './query.service';
import { logger } from '@server/src/core/logger';
import { adminCreateAuditLogEntry } from '../../shared/admin-operation-utils';
import { getUserId } from '../../admin.middleware';
import { z } from 'zod';

const queryService = new QueryService();

// Request validation schemas
const executeQuerySchema = z.object({
	query: z.string().min(1).max(50000), // Limit query size
	saveToHistory: z.boolean().default(true)
});

const queryHistorySchema = z.object({
	userId: z.coerce.number().optional(),
	limit: z.coerce.number().min(1).max(100).default(50)
});

/**
 * Execute a SQL query with safety checks
 */
export async function executeQuery(req: Request, res: Response) {
	try {
		const userId = getUserId(req);
		const { query, saveToHistory } = executeQuerySchema.parse(req.body);

		// Additional safeguard: only allow read-only/select queries
		const READ_ONLY_REGEX = /^(\s*)(SELECT|WITH|EXPLAIN)\b/i;
		if (!READ_ONLY_REGEX.test(query)) {
			logger.warn('QueryController', 'Blocked non-read SQL statement', {
				userId,
				queryPreview: query.slice(0, 100)
			});
			return res.status(403).json({
				success: false,
				error: 'Only read-only SELECT/EXPLAIN queries are permitted.'
			});
		}

		// Reject multi-statement queries to avoid stacked injections
		if (query.includes(';')) {
			logger.warn('QueryController', 'Blocked multi-statement SQL', {
				userId,
				queryPreview: query.slice(0, 100)
			});
			return res.status(403).json({
				success: false,
				error: 'Multiple SQL statements are not allowed.'
			});
		}

		// Log query attempt
		logger.info('QueryController', 'SQL query execution requested', {
			userId,
			queryLength: query.length,
			queryPreview: query.substring(0, 100) + '...'
		});

		const result = await queryService.executeQuery(query, userId);

		// Log query execution result
		await adminCreateAuditLogEntry({
			adminUserId: userId,
			action: result.success ? 'database_query_executed' : 'database_query_failed',
			details: `SQL query ${result.success ? 'executed successfully' : 'failed'}: ${query.substring(0, 200)}${query.length > 200 ? '...' : ''}`,
			metadata: {
				queryLength: query.length,
				executionTime: result.executionTime,
				rowCount: result.rowCount,
				success: result.success,
				error: result.error
			}
		});

		res.json({
			success: true,
			data: result
		});
	} catch (error: any) {
		logger.error('QueryController', 'Error executing query', { error: error.message });
		res.status(400).json({
			success: false,
			error: 'Invalid query request'
		});
	}
}

/**
 * Validate a SQL query without executing it
 */
export async function validateQuery(req: Request, res: Response) {
	try {
		const userId = getUserId(req);
		const { query } = z.object({ query: z.string().min(1) }).parse(req.body);

		const validation = queryService.validateQuery(query);

		// Log validation request
		await adminCreateAuditLogEntry({
			adminUserId: userId,
			action: 'database_query_validated',
			details: `Query validation: ${validation.isValid ? 'valid' : 'invalid'}`,
			metadata: {
				queryLength: query.length,
				isValid: validation.isValid,
				errors: validation.errors,
				warnings: validation.warnings
			}
		});

		res.json({
			success: true,
			data: validation
		});
	} catch (error: any) {
		logger.error('QueryController', 'Error validating query', { error: error.message });
		res.status(400).json({
			success: false,
			error: 'Invalid validation request'
		});
	}
}

/**
 * Get query execution history
 */
export async function getQueryHistory(req: Request, res: Response) {
	try {
		const userId = getUserId(req);
		const { userId: targetUserId, limit } = queryHistorySchema.parse(req.query);

		// Only allow users to see their own history unless they're super admin
		const historyUserId = targetUserId || userId;

		const history = queryService.getQueryHistory(historyUserId).slice(0, limit);

		// Log access
		await adminCreateAuditLogEntry({
			adminUserId: userId,
			action: 'database_query_history_viewed',
			details: `Viewed query history (${history.length} entries)`,
			metadata: {
				targetUserId: historyUserId,
				entryCount: history.length
			}
		});

		res.json({
			success: true,
			data: history
		});
	} catch (error: any) {
		logger.error('QueryController', 'Error getting query history', { error: error.message });
		res.status(500).json({
			success: false,
			error: 'Failed to retrieve query history'
		});
	}
}

/**
 * Clear query history
 */
export async function clearQueryHistory(req: Request, res: Response) {
	try {
		const userId = getUserId(req);
		const { userId: targetUserId } = z
			.object({
				userId: z.coerce.number().optional()
			})
			.parse(req.body);

		// Only allow users to clear their own history unless they're super admin
		const clearUserId = targetUserId || userId;

		queryService.clearHistory(clearUserId);

		// Log clearing
		await adminCreateAuditLogEntry({
			adminUserId: userId,
			action: 'database_query_history_cleared',
			details: `Cleared query history for user ${clearUserId}`,
			metadata: {
				targetUserId: clearUserId
			}
		});

		res.json({
			success: true,
			message: 'Query history cleared'
		});
	} catch (error: any) {
		logger.error('QueryController', 'Error clearing query history', { error: error.message });
		res.status(500).json({
			success: false,
			error: 'Failed to clear query history'
		});
	}
}

/**
 * Get suggested queries for common operations
 */
export async function getSuggestedQueries(req: Request, res: Response) {
	try {
		const userId = getUserId(req);

		const suggestions = queryService.getSuggestedQueries();

		// Log access
		await adminCreateAuditLogEntry({
			adminUserId: userId,
			action: 'database_query_suggestions_viewed',
			details: `Viewed query suggestions (${suggestions.length} available)`
		});

		res.json({
			success: true,
			data: suggestions
		});
	} catch (error: any) {
		logger.error('QueryController', 'Error getting suggested queries', { error: error.message });
		res.status(500).json({
			success: false,
			error: 'Failed to retrieve suggested queries'
		});
	}
}

/**
 * Export query results as CSV
 */
export async function exportQueryResults(req: Request, res: Response) {
	try {
		const userId = getUserId(req);
		const { query } = z.object({ query: z.string().min(1) }).parse(req.body);

		// Execute query
		const result = await queryService.executeQuery(query, userId);

		if (!result.success) {
			return res.status(400).json({
				success: false,
				error: result.error
			});
		}

		// Convert to CSV
		const csvData = queryService.formatResultAsCSV(result);

		// Log export
		await adminCreateAuditLogEntry({
			adminUserId: userId,
			action: 'database_query_exported',
			details: `Exported query results as CSV (${result.rowCount} rows)`,
			metadata: {
				queryLength: query.length,
				rowCount: result.rowCount,
				exportSize: csvData.length
			}
		});

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', `attachment; filename="query_results_${Date.now()}.csv"`);
		res.send(csvData);
	} catch (error: any) {
		logger.error('QueryController', 'Error exporting query results', { error: error.message });
		res.status(500).json({
			success: false,
			error: 'Failed to export query results'
		});
	}
}

/**
 * Get query performance metrics
 */
export async function getQueryMetrics(req: Request, res: Response) {
	try {
		const userId = getUserId(req);

		const history = queryService.getQueryHistory();

		// Calculate metrics
		const totalQueries = history.length;
		const successfulQueries = history.filter((h) => h.success).length;
		const failedQueries = totalQueries - successfulQueries;
		const avgExecutionTime =
			history.length > 0
				? history.reduce((sum, h) => sum + h.executionTime, 0) / history.length
				: 0;
		const totalRowsReturned = history.reduce((sum, h) => sum + h.rowCount, 0);

		const metrics = {
			totalQueries,
			successfulQueries,
			failedQueries,
			successRate: totalQueries > 0 ? ((successfulQueries / totalQueries) * 100).toFixed(2) : 0,
			avgExecutionTime: Math.round(avgExecutionTime),
			totalRowsReturned,
			recentActivity: history.slice(0, 10)
		};

		// Log access
		await adminCreateAuditLogEntry({
			adminUserId: userId,
			action: 'database_query_metrics_viewed',
			details: 'Viewed query performance metrics'
		});

		res.json({
			success: true,
			data: metrics
		});
	} catch (error: any) {
		logger.error('QueryController', 'Error getting query metrics', { error: error.message });
		res.status(500).json({
			success: false,
			error: 'Failed to retrieve query metrics'
		});
	}
}
