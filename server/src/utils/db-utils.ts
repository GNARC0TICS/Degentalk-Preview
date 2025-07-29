/**
 * Database Utilities
 *
 * Helper functions to optimize database operations
 */

import { db, withRetry } from '@degentalk/db';
import { sql } from 'drizzle-orm';
import { logger, LogLevel, LogAction } from '@core/logger';

/**
 * Execute a database operation with connection pooling and retry logic
 */
export async function executeDbOperation<T>(operation: () => Promise<T>): Promise<T> {
	return withRetry(async () => {
		try {
			return await operation();
		} catch (error) {
			logger.error('DATABASE', 'Database operation error', error);
			throw error;
		}
	});
}

/**
 * Execute a raw SQL query with parameters
 */
export async function executeRawQuery<T>(query: string, params: any[] = []): Promise<T[]> {
	return withRetry(async () => {
		try {
			const result = await db.execute(sql.raw(query, params));
			return result.rows as T[];
		} catch (error) {
			logger.error('DATABASE', 'Raw SQL query error', error);
			throw error;
		}
	});
}

/**
 * Execute a batch of operations in a transaction
 */
export async function executeBatchTransaction<T>(
	operations: Array<() => Promise<any>>
): Promise<T[]> {
	return withRetry(async () => {
		try {
			// Start a transaction
			const results: any[] = [];

			// Execute each operation
			for (const operation of operations) {
				const result = await operation();
				results.push(result);
			}

			return results as T[];
		} catch (error) {
			logger.error('DATABASE', 'Batch transaction error', error);
			throw error;
		}
	});
}

/**
 * Database health check
 */
export async function checkDbConnection(): Promise<boolean> {
	try {
		await db.execute(sql`SELECT 1`);
		return true;
	} catch (error) {
		logger.error('DATABASE', 'Database connection error', error);
		return false;
	}
}

/**
 * Generate a standardized error object for database errors
 */
export function createDbError(error: any, context: string = 'Database operation'): Error {
	const errorMessage = `${context} failed: ${error.message || 'Unknown error'}`;
	logger.error('DATABASE', errorMessage, error);
	return new Error(errorMessage);
}
