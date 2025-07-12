/**
 * Database Query Performance Monitoring
 *
 * Tracks slow queries, connection pool health, and query patterns
 */

import { logger } from '../logger';

export interface QueryMetrics {
	query: string;
	duration: number;
	timestamp: Date;
	success: boolean;
	error?: string;
	params?: any[];
	stackTrace?: string;
}

export interface PerformanceStats {
	totalQueries: number;
	slowQueries: number;
	averageQueryTime: number;
	errorRate: number;
	connectionPoolActive: number;
	connectionPoolIdle: number;
}

class QueryPerformanceMonitor {
	private metrics: QueryMetrics[] = [];
	private readonly SLOW_QUERY_THRESHOLD = 1000; // 1 second
	private readonly MAX_METRICS_RETAINED = 1000;
	private readonly CLEANUP_INTERVAL = 300000; // 5 minutes

	constructor() {
		// Periodic cleanup of old metrics
		setInterval(() => this.cleanupMetrics(), this.CLEANUP_INTERVAL);
	}

	/**
	 * Record a database query execution
	 */
	recordQuery(
		query: string,
		duration: number,
		success: boolean,
		error?: string,
		params?: any[]
	): void {
		const metric: QueryMetrics = {
			query: this.sanitizeQuery(query),
			duration,
			timestamp: new Date(),
			success,
			error,
			params: this.sanitizeParams(params),
			stackTrace: success ? undefined : this.captureStackTrace()
		};

		this.metrics.push(metric);

		// Log slow queries
		if (duration > this.SLOW_QUERY_THRESHOLD) {
			logger.warn('QueryPerformance', 'Slow query detected', {
				query: metric.query,
				duration,
				params: metric.params
			});
		}

		// Log errors
		if (!success && error) {
			logger.error('QueryPerformance', 'Query failed', {
				query: metric.query,
				error,
				params: metric.params,
				stackTrace: metric.stackTrace
			});
		}

		// Cleanup if too many metrics
		if (this.metrics.length > this.MAX_METRICS_RETAINED) {
			this.cleanupMetrics();
		}
	}

	/**
	 * Get performance statistics
	 */
	getStats(): PerformanceStats {
		const now = Date.now();
		const recentMetrics = this.metrics.filter(
			(m) => now - m.timestamp.getTime() < 3600000 // Last hour
		);

		const totalQueries = recentMetrics.length;
		const slowQueries = recentMetrics.filter((m) => m.duration > this.SLOW_QUERY_THRESHOLD).length;
		const failedQueries = recentMetrics.filter((m) => !m.success).length;
		const totalDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0);

		return {
			totalQueries,
			slowQueries,
			averageQueryTime: totalQueries > 0 ? totalDuration / totalQueries : 0,
			errorRate: totalQueries > 0 ? (failedQueries / totalQueries) * 100 : 0,
			connectionPoolActive: 0, // To be implemented with actual DB pool
			connectionPoolIdle: 0
		};
	}

	/**
	 * Get slow queries for analysis
	 */
	getSlowQueries(limit = 10): QueryMetrics[] {
		return this.metrics
			.filter((m) => m.duration > this.SLOW_QUERY_THRESHOLD)
			.sort((a, b) => b.duration - a.duration)
			.slice(0, limit);
	}

	/**
	 * Get query patterns analysis
	 */
	getQueryPatterns(): { [pattern: string]: number } {
		const patterns: { [pattern: string]: number } = {};

		this.metrics.forEach((metric) => {
			const pattern = this.extractQueryPattern(metric.query);
			patterns[pattern] = (patterns[pattern] || 0) + 1;
		});

		return patterns;
	}

	/**
	 * Clean up old metrics to prevent memory leaks
	 */
	private cleanupMetrics(): void {
		const cutoff = Date.now() - 3600000; // Keep last hour
		this.metrics = this.metrics.filter((m) => m.timestamp.getTime() > cutoff);

		// Keep only the most recent if still too many
		if (this.metrics.length > this.MAX_METRICS_RETAINED) {
			this.metrics = this.metrics
				.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
				.slice(0, this.MAX_METRICS_RETAINED);
		}
	}

	/**
	 * Sanitize query string for logging
	 */
	private sanitizeQuery(query: string): string {
		// Remove excessive whitespace and limit length
		return query.replace(/\s+/g, ' ').trim().substring(0, 500);
	}

	/**
	 * Sanitize parameters for logging
	 */
	private sanitizeParams(params?: any[]): any[] {
		if (!params) return [];

		return params.map((param) => {
			if (typeof param === 'string' && param.length > 100) {
				return param.substring(0, 100) + '...';
			}
			return param;
		});
	}

	/**
	 * Extract query pattern for analysis
	 */
	private extractQueryPattern(query: string): string {
		return query
			.replace(/\$\d+/g, '$?') // Replace parameter placeholders
			.replace(/\d+/g, 'N') // Replace numbers
			.replace(/'[^']*'/g, "'?'") // Replace string literals
			.replace(/\s+/g, ' ')
			.trim()
			.substring(0, 200);
	}

	/**
	 * Capture stack trace for debugging
	 */
	private captureStackTrace(): string {
		const stack = new Error().stack;
		return stack ? stack.split('\n').slice(2, 8).join('\n') : '';
	}

	/**
	 * Reset all metrics (for testing)
	 */
	reset(): void {
		this.metrics = [];
	}
}

// Global instance
export const queryMonitor = new QueryPerformanceMonitor();

/**
 * Middleware for Drizzle ORM to monitor queries
 */
export function createQueryMonitoringMiddleware() {
	return {
		query: {
			start: (query: string, params?: any[]) => {
				const startTime = Date.now();

				return {
					end: (error?: Error) => {
						const duration = Date.now() - startTime;
						queryMonitor.recordQuery(query, duration, !error, error?.message, params);
					}
				};
			}
		}
	};
}

/**
 * Helper to wrap database operations with monitoring
 */
export async function monitorQuery<T>(operation: () => Promise<T>, queryName: string): Promise<T> {
	const startTime = Date.now();

	try {
		const result = await operation();
		const duration = Date.now() - startTime;

		queryMonitor.recordQuery(queryName, duration, true);
		return result;
	} catch (error) {
		const duration = Date.now() - startTime;

		queryMonitor.recordQuery(
			queryName,
			duration,
			false,
			error instanceof Error ? error.message : 'Unknown error'
		);

		throw error;
	}
}
