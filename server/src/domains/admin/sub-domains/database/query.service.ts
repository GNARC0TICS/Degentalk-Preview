/**
 * Query Service
 *
 * Safe SQL query execution service for admin database interface.
 * Implements security restrictions and query analysis to prevent dangerous operations.
 */

import { db } from '@server/src/core/db';
import type { UserId } from '@db/types';
import { logger } from '@server/src/core/logger';
import { sql } from 'drizzle-orm';

// Dangerous SQL keywords that are completely forbidden
const FORBIDDEN_KEYWORDS = [
	'DROP',
	'TRUNCATE',
	'DELETE',
	'ALTER',
	'CREATE',
	'INSERT',
	'UPDATE',
	'GRANT',
	'REVOKE',
	'EXEC',
	'EXECUTE',
	'CALL',
	'PROCEDURE',
	'TRIGGER',
	'FUNCTION',
	'VIEW',
	'INDEX',
	'SEQUENCE',
	'SCHEMA',
	'DATABASE',
	'USER',
	'ROLE',
	'PERMISSION'
];

// Allowed read-only query types
const ALLOWED_KEYWORDS = [
	'SELECT',
	'WITH',
	'UNION',
	'INTERSECT',
	'EXCEPT',
	'ORDER',
	'GROUP',
	'HAVING',
	'LIMIT',
	'OFFSET',
	'WHERE',
	'FROM',
	'JOIN',
	'INNER',
	'LEFT',
	'RIGHT',
	'FULL'
];

// Dangerous functions that should be blocked
const FORBIDDEN_FUNCTIONS = [
	'pg_read_file',
	'pg_write_file',
	'pg_execute',
	'pg_terminate_backend',
	'pg_cancel_backend',
	'copy',
	'pg_stat_file',
	'pg_ls_dir'
];

export interface QueryResult {
	success: boolean;
	data?: any[];
	columns?: string[];
	rowCount?: number;
	executionTime?: number;
	error?: string;
	warnings?: string[];
}

export interface QueryValidation {
	isValid: boolean;
	errors: string[];
	warnings: string[];
	queryType: string;
}

export interface QueryHistory {
	id: string;
	query: string;
	timestamp: string;
	executionTime: number;
	rowCount: number;
	success: boolean;
	userId: UserId;
}

export class QueryService {
	private queryHistory: QueryHistory[] = [];
	private readonly MAX_HISTORY = 100;
	private readonly MAX_ROWS = 10000;
	private readonly TIMEOUT_MS = 30000; // 30 seconds

	/**
	 * Execute a read-only SQL query with safety checks
	 */
	async executeQuery(query: string, userId: UserId): Promise<QueryResult> {
		const startTime = Date.now();

		try {
			// Validate the query
			const validation = this.validateQuery(query);
			if (!validation.isValid) {
				return {
					success: false,
					error: validation.errors.join('; '),
					warnings: validation.warnings
				};
			}

			// Add safety limits
			const safeQuery = this.addSafetyLimits(query);

			// Execute with timeout
			const result = await Promise.race([
				this.executeWithTimeout(safeQuery),
				this.createTimeoutPromise()
			]);

			const executionTime = Date.now() - startTime;

			// Store in history
			this.addToHistory({
				id: this.generateQueryId(),
				query: safeQuery,
				timestamp: new Date().toISOString(),
				executionTime,
				rowCount: result.rows?.length || 0,
				success: true,
				userId
			});

			return {
				success: true,
				data: result.rows,
				columns: result.fields?.map((f) => f.name) || [],
				rowCount: result.rows?.length || 0,
				executionTime,
				warnings: validation.warnings
			};
		} catch (error: any) {
			const executionTime = Date.now() - startTime;

			// Store failed query in history
			this.addToHistory({
				id: this.generateQueryId(),
				query,
				timestamp: new Date().toISOString(),
				executionTime,
				rowCount: 0,
				success: false,
				userId
			});

			logger.error('QueryService', 'Query execution failed', {
				error: error.message,
				query: query.substring(0, 200) + '...',
				userId
			});

			return {
				success: false,
				error: this.sanitizeErrorMessage(error.message),
				executionTime
			};
		}
	}

	/**
	 * Validate SQL query for safety and compatibility
	 */
	validateQuery(query: string): QueryValidation {
		const errors: string[] = [];
		const warnings: string[] = [];
		const normalizedQuery = query.trim().toUpperCase();

		// Check if query is empty
		if (!query.trim()) {
			errors.push('Query cannot be empty');
			return { isValid: false, errors, warnings, queryType: 'UNKNOWN' };
		}

		// Detect query type
		const queryType = this.detectQueryType(normalizedQuery);

		// Check for forbidden keywords
		for (const keyword of FORBIDDEN_KEYWORDS) {
			if (normalizedQuery.includes(keyword)) {
				errors.push(`Forbidden keyword detected: ${keyword}`);
			}
		}

		// Check for forbidden functions
		for (const func of FORBIDDEN_FUNCTIONS) {
			if (normalizedQuery.includes(func.toUpperCase())) {
				errors.push(`Forbidden function detected: ${func}`);
			}
		}

		// Ensure query starts with allowed keyword
		const firstKeyword = normalizedQuery.split(/\s+/)[0];
		if (!ALLOWED_KEYWORDS.includes(firstKeyword)) {
			errors.push(`Query must start with an allowed keyword (${ALLOWED_KEYWORDS.join(', ')})`);
		}

		// Check for potentially dangerous patterns
		if (normalizedQuery.includes('--')) {
			warnings.push('Query contains SQL comments, ensure they are intentional');
		}

		if (normalizedQuery.includes('/*')) {
			warnings.push('Query contains block comments, ensure they are intentional');
		}

		if (normalizedQuery.includes(';') && normalizedQuery.split(';').length > 2) {
			errors.push('Multiple statements are not allowed');
		}

		// Check for information schema access (potentially sensitive)
		if (normalizedQuery.includes('INFORMATION_SCHEMA') || normalizedQuery.includes('PG_')) {
			warnings.push('Query accesses system catalogs - be cautious with sensitive information');
		}

		return {
			isValid: errors.length === 0,
			errors,
			warnings,
			queryType
		};
	}

	/**
	 * Get query execution history
	 */
	getQueryHistory(userId?: number): QueryHistory[] {
		if (userId) {
			return this.queryHistory.filter((h) => h.userId === userId);
		}
		return [...this.queryHistory];
	}

	/**
	 * Clear query history
	 */
	clearHistory(userId?: number): void {
		if (userId) {
			this.queryHistory = this.queryHistory.filter((h) => h.userId !== userId);
		} else {
			this.queryHistory = [];
		}
	}

	/**
	 * Get suggested queries for common operations
	 */
	getSuggestedQueries(): { name: string; description: string; query: string }[] {
		return [
			{
				name: 'List all tables',
				description: 'Show all user tables in the database',
				query: `SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;`
			},
			{
				name: 'Table row counts',
				description: 'Count rows in all tables',
				query: `SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows
FROM pg_stat_user_tables 
ORDER BY n_live_tup DESC;`
			},
			{
				name: 'Database size by table',
				description: 'Show disk usage per table',
				query: `SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;`
			},
			{
				name: 'Recent user activity',
				description: 'Show recent user registrations and activity',
				query: `SELECT 
    id,
    username,
    created_at,
    last_login,
    role
FROM users 
ORDER BY created_at DESC 
LIMIT 20;`
			},
			{
				name: 'Popular forum threads',
				description: 'Find threads with most activity',
				query: `SELECT 
    t.id,
    t.title,
    t.created_at,
    u.username as author,
    COUNT(p.id) as post_count
FROM threads t
LEFT JOIN posts p ON p.thread_id = t.id
LEFT JOIN users u ON u.id = t.user_id
GROUP BY t.id, t.title, t.created_at, u.username
ORDER BY post_count DESC
LIMIT 20;`
			}
		];
	}

	/**
	 * Export query results as CSV
	 */
	formatResultAsCSV(result: QueryResult): string {
		if (!result.success || !result.data || !result.columns) {
			return '';
		}

		// Generate CSV headers
		const headers = result.columns.join(',');

		// Generate CSV rows
		const rows = result.data.map((row) =>
			result
				.columns!.map((col) => {
					const value = row[col];
					if (value === null || value === undefined) return '';
					const stringValue = String(value);
					if (
						stringValue.includes(',') ||
						stringValue.includes('"') ||
						stringValue.includes('\n')
					) {
						return `"${stringValue.replace(/"/g, '""')}"`;
					}
					return stringValue;
				})
				.join(',')
		);

		return [headers, ...rows].join('\n');
	}

	// Private helper methods

	private detectQueryType(query: string): string {
		const firstWord = query.split(/\s+/)[0];
		if (['SELECT', 'WITH'].includes(firstWord)) return 'SELECT';
		if (['EXPLAIN'].includes(firstWord)) return 'EXPLAIN';
		return 'UNKNOWN';
	}

	private addSafetyLimits(query: string): string {
		const normalizedQuery = query.trim().toUpperCase();

		// Add LIMIT if not present and it's a SELECT query
		if (normalizedQuery.startsWith('SELECT') && !normalizedQuery.includes('LIMIT')) {
			return `${query.trim()} LIMIT ${this.MAX_ROWS}`;
		}

		return query;
	}

	private async executeWithTimeout(query: string): Promise<any> {
		return await db.execute(sql.raw(query));
	}

	private createTimeoutPromise(): Promise<never> {
		return new Promise((_, reject) => {
			setTimeout(() => {
				reject(new Error(`Query timeout after ${this.TIMEOUT_MS}ms`));
			}, this.TIMEOUT_MS);
		});
	}

	private addToHistory(entry: QueryHistory): void {
		this.queryHistory.unshift(entry);

		// Keep only the most recent entries
		if (this.queryHistory.length > this.MAX_HISTORY) {
			this.queryHistory = this.queryHistory.slice(0, this.MAX_HISTORY);
		}
	}

	private generateQueryId(): string {
		return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private sanitizeErrorMessage(message: string): string {
		// Remove potentially sensitive information from error messages
		return message
			.replace(/password/gi, '[REDACTED]')
			.replace(/token/gi, '[REDACTED]')
			.replace(/secret/gi, '[REDACTED]')
			.replace(/key/gi, '[REDACTED]');
	}
}
