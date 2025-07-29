/**
 * System Analytics Service
 *
 * Provides comprehensive system performance analytics, cache metrics,
 * database health monitoring, and performance heatmaps
 */

import { eq, desc, count, avg, sum, sql, and, gte, lte } from 'drizzle-orm';
import { db } from '@degentalk/db';
import { cacheService, CacheCategory } from '@core/cache/unified-cache.service';
import { CacheStandard, CacheExtended } from '@core/cache/decorators';
import { invalidateCache } from '@core/cache/invalidateCache';
import {
	threads,
	posts,
	users,
	transactions,
	xpLogs,
	shoutboxMessages,
	analyticsEvents
} from '@schema';

export interface SystemMetrics {
	performance: {
		averageResponseTime: number;
		slowestEndpoints: Array<{
			endpoint: string;
			averageTime: number;
			requestCount: number;
		}>;
		errorRate: number;
		uptime: number;
	};
	cache: {
		hitRate: number;
		hitRateGrade: string;
		totalKeys: number;
		memoryUsage: number;
		keysByCategory: Record<string, number>;
		performance: {
			hits: number;
			misses: number;
			totalRequests: number;
		};
		recommendations: string[];
	};
	database: {
		connectionCount: number;
		queryPerformance: {
			averageTime: number;
			slowestQueries: Array<{
				query: string;
				avgTime: number;
				count: number;
			}>;
		};
		tableStats: Array<{
			tableName: string;
			rowCount: number;
			size: string;
			indexes: number;
		}>;
		replicationLag?: number;
	};
	api: {
		requestsPerMinute: number;
		topEndpoints: Array<{
			endpoint: string;
			requests: number;
			responseTime: number;
		}>;
		errorsByType: Record<string, number>;
		statusCodes: Record<string, number>;
	};
	system: {
		cpuUsage?: number;
		memoryUsage?: number;
		diskUsage?: number;
		networkIO?: {
			incoming: number;
			outgoing: number;
		};
	};
}

export interface PerformanceHeatmap {
	timeSlots: string[];
	metrics: Array<{
		name: string;
		type: 'response_time' | 'request_count' | 'error_rate' | 'cache_hit_rate';
		data: number[][];
		threshold: {
			excellent: number;
			good: number;
			fair: number;
			poor: number;
		};
	}>;
}

export interface SystemHealth {
	status: 'healthy' | 'degraded' | 'critical';
	score: number; // 0-100
	checks: Array<{
		name: string;
		status: 'pass' | 'warn' | 'fail';
		value: number | string;
		threshold: number | string;
		message: string;
	}>;
	recommendations: string[];
	lastChecked: Date;
}

export class SystemAnalyticsService {
	private readonly CACHE_KEY_PREFIX = 'system_analytics';
	private readonly DEFAULT_TTL = 300; // 5 minutes

	/**
	 * Get comprehensive system metrics
	 */
	@CacheStandard.adminAnalytics
	async getSystemMetrics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<SystemMetrics> {
		const cacheKey = `${this.CACHE_KEY_PREFIX}:metrics:${timeRange}`;

		const cached = await cacheService.get(cacheKey, CacheCategory.ANALYTICS);
		if (cached) return cached as SystemMetrics;

		const [cacheMetrics, databaseMetrics, apiMetrics] = await Promise.all([
			this.getCacheMetrics(),
			this.getDatabaseMetrics(),
			this.getAPIMetrics(timeRange)
		]);

		const result: SystemMetrics = {
			performance: {
				averageResponseTime: apiMetrics.averageResponseTime,
				slowestEndpoints: apiMetrics.slowestEndpoints,
				errorRate: apiMetrics.errorRate,
				uptime: 99.9 // TODO: Implement actual uptime tracking
			},
			cache: cacheMetrics,
			database: databaseMetrics,
			api: {
				requestsPerMinute: apiMetrics.requestsPerMinute,
				topEndpoints: apiMetrics.topEndpoints,
				errorsByType: apiMetrics.errorsByType,
				statusCodes: apiMetrics.statusCodes
			},
			system: {
				cpuUsage: undefined, // TODO: Implement system monitoring
				memoryUsage: undefined,
				diskUsage: undefined,
				networkIO: undefined
			}
		};

		await cacheService.set(cacheKey, result, CacheCategory.ANALYTICS, this.DEFAULT_TTL);
		return result;
	}

	/**
	 * Get performance heatmap data
	 */
	async getPerformanceHeatmap(
		timeRange: '24h' | '7d' | '30d' = '24h',
		granularity: 'hour' | 'day' = 'hour'
	): Promise<PerformanceHeatmap> {
		const cacheKey = `${this.CACHE_KEY_PREFIX}:heatmap:${timeRange}:${granularity}`;

		const cached = await cacheService.get(cacheKey, CacheCategory.ANALYTICS);
		if (cached) return cached as PerformanceHeatmap;

		const timeSlots = this.generateTimeSlots(timeRange, granularity);
		const endTime = new Date();
		const startTime = this.getStartTime(timeRange);

		// Generate mock heatmap data - In production, this would query actual metrics
		const responseTimeData = this.generateHeatmapData(timeSlots, 50, 200);
		const requestCountData = this.generateHeatmapData(timeSlots, 100, 1000);
		const errorRateData = this.generateHeatmapData(timeSlots, 0, 5);
		const cacheHitRateData = this.generateHeatmapData(timeSlots, 80, 98);

		const result: PerformanceHeatmap = {
			timeSlots,
			metrics: [
				{
					name: 'Response Time (ms)',
					type: 'response_time',
					data: responseTimeData,
					threshold: { excellent: 100, good: 200, fair: 500, poor: 1000 }
				},
				{
					name: 'Request Count',
					type: 'request_count',
					data: requestCountData,
					threshold: { excellent: 1000, good: 500, fair: 200, poor: 50 }
				},
				{
					name: 'Error Rate (%)',
					type: 'error_rate',
					data: errorRateData,
					threshold: { excellent: 0.1, good: 0.5, fair: 1, poor: 5 }
				},
				{
					name: 'Cache Hit Rate (%)',
					type: 'cache_hit_rate',
					data: cacheHitRateData,
					threshold: { excellent: 95, good: 90, fair: 80, poor: 70 }
				}
			]
		};

		await cacheService.set(cacheKey, result, CacheCategory.ANALYTICS, this.DEFAULT_TTL);
		return result;
	}

	/**
	 * Get system health assessment
	 */
	@CacheStandard.platformStats
	async getSystemHealth(): Promise<SystemHealth> {
		const cacheKey = `${this.CACHE_KEY_PREFIX}:health`;

		const cached = await cacheService.get(cacheKey, CacheCategory.ANALYTICS);
		if (cached) return cached as SystemHealth;

		const [cacheMetrics, databaseMetrics] = await Promise.all([
			this.getCacheMetrics(),
			this.getDatabaseMetrics()
		]);

		const checks = [
			{
				name: 'Cache Hit Rate',
				status: this.getHealthStatus(cacheMetrics.hitRate, 90, 80) as 'pass' | 'warn' | 'fail',
				value: `${cacheMetrics.hitRate.toFixed(1)}%`,
				threshold: '90%',
				message:
					cacheMetrics.hitRate >= 90
						? 'Excellent cache performance'
						: cacheMetrics.hitRate >= 80
							? 'Good cache performance'
							: 'Cache performance needs attention'
			},
			{
				name: 'Database Connections',
				status: this.getHealthStatus(databaseMetrics.connectionCount, 50, 80, true) as
					| 'pass'
					| 'warn'
					| 'fail',
				value: databaseMetrics.connectionCount,
				threshold: '< 50',
				message:
					databaseMetrics.connectionCount < 50
						? 'Normal connection usage'
						: databaseMetrics.connectionCount < 80
							? 'Elevated connection usage'
							: 'High connection usage'
			},
			{
				name: 'Memory Usage',
				status: this.getHealthStatus(cacheMetrics.memoryUsage, 80, 90, true) as
					| 'pass'
					| 'warn'
					| 'fail',
				value: `${cacheMetrics.memoryUsage.toFixed(1)} MB`,
				threshold: '< 80 MB',
				message:
					cacheMetrics.memoryUsage < 80
						? 'Normal memory usage'
						: cacheMetrics.memoryUsage < 90
							? 'Elevated memory usage'
							: 'High memory usage'
			},
			{
				name: 'Query Performance',
				status: this.getHealthStatus(
					databaseMetrics.queryPerformance.averageTime,
					50,
					100,
					true
				) as 'pass' | 'warn' | 'fail',
				value: `${databaseMetrics.queryPerformance.averageTime.toFixed(1)}ms`,
				threshold: '< 50ms',
				message:
					databaseMetrics.queryPerformance.averageTime < 50
						? 'Excellent query performance'
						: databaseMetrics.queryPerformance.averageTime < 100
							? 'Good query performance'
							: 'Query performance needs optimization'
			}
		];

		const passCount = checks.filter((c) => c.status === 'pass').length;
		const warnCount = checks.filter((c) => c.status === 'warn').length;
		const failCount = checks.filter((c) => c.status === 'fail').length;

		const score = Math.round((passCount * 100 + warnCount * 60) / checks.length);
		const status: 'healthy' | 'degraded' | 'critical' =
			failCount > 0 ? 'critical' : warnCount > 1 ? 'degraded' : 'healthy';

		const recommendations = [
			...cacheMetrics.recommendations,
			...(score < 80 ? ['Consider optimizing database queries'] : []),
			...(databaseMetrics.connectionCount > 50
				? ['Monitor database connection pool usage']
				: []),
			...(cacheMetrics.memoryUsage > 80 ? ['Consider increasing cache memory limits'] : [])
		];

		const result: SystemHealth = {
			status,
			score,
			checks,
			recommendations,
			lastChecked: new Date()
		};

		await cacheService.set(cacheKey, result, CacheCategory.ANALYTICS, 60); // 1 minute TTL for health checks
		return result;
	}

	/**
	 * Get real-time activity analytics
	 */
	@CacheStandard.platformStats
	async getRealtimeAnalytics(): Promise<{
		activeUsers: number;
		requestsPerSecond: number;
		newThreadsLastHour: number;
		newPostsLastHour: number;
		dgtTransactionsLastHour: number;
		cacheOperationsPerSecond: number;
	}> {
		const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
		const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

		const [newThreadsCount, newPostsCount, dgtTransactionsCount, activeUsersCount] =
			await Promise.all([
				// New threads in last hour
				db.select({ count: count() }).from(threads).where(gte(threads.createdAt, oneHourAgo)),

				// New posts in last hour
				db.select({ count: count() }).from(posts).where(gte(posts.createdAt, oneHourAgo)),

				// DGT transactions in last hour
				db
					.select({ count: count() })
					.from(transactions)
					.where(
						and(
							gte(transactions.createdAt, oneHourAgo),
							eq(transactions.currency, 'DGT')
						)
					),

				// Active users (users with activity in last 5 minutes)
				db
					.select({ count: count() })
					.from(analyticsEvents)
					.where(gte(analyticsEvents.createdAt, fiveMinutesAgo))
			]);

		const cacheMetrics = await this.getCacheMetrics();

		return {
			activeUsers: activeUsersCount[0]?.count || 0,
			requestsPerSecond: Math.round((cacheMetrics.performance.totalRequests || 0) / 60), // Rough estimate
			newThreadsLastHour: newThreadsCount[0]?.count || 0,
			newPostsLastHour: newPostsCount[0]?.count || 0,
			dgtTransactionsLastHour: dgtTransactionsCount[0]?.count || 0,
			cacheOperationsPerSecond: Math.round(
				(cacheMetrics.performance.hits + cacheMetrics.performance.misses) / 60
			)
		};
	}

	// ============ PRIVATE HELPER METHODS ============

	private async getCacheMetrics() {
		const metrics = cacheService.getMetrics();
		
		// Calculate hit rate from metrics
		const totalRequests = metrics.hits + metrics.misses;
		const hitRate = totalRequests > 0 ? (metrics.hits / totalRequests) * 100 : 0;
		
		// Determine hit rate grade
		const hitRateGrade = hitRate >= 95 ? 'A+' : 
			hitRate >= 90 ? 'A' :
			hitRate >= 85 ? 'B' :
			hitRate >= 80 ? 'C' :
			hitRate >= 70 ? 'D' : 'F';
		
		// Get keys by category from metrics
		const keysByCategory: Record<string, number> = {};
		for (const [key, value] of Object.entries(metrics.categoryCounts)) {
			keysByCategory[key] = value;
		}
		
		// Generate recommendations based on metrics
		const recommendations: string[] = [];
		if (hitRate < 80) {
			recommendations.push('Cache hit rate is below 80%, consider reviewing cache strategies');
		}
		if (metrics.keys > 10000) {
			recommendations.push('High number of cache keys, consider implementing cache eviction policies');
		}
		if (metrics.memoryUsage > 100 * 1024 * 1024) { // 100MB
			recommendations.push('Cache memory usage is high, monitor for potential memory issues');
		}

		return {
			hitRate,
			hitRateGrade,
			totalKeys: metrics.keys,
			memoryUsage: parseFloat((metrics.memoryUsage / 1024 / 1024).toFixed(2)), // Convert to MB
			keysByCategory,
			performance: {
				hits: metrics.hits,
				misses: metrics.misses,
				totalRequests
			},
			recommendations
		};
	}

	private async getDatabaseMetrics() {
		// Get basic database statistics
		const tableStats = await this.getDatabaseTableStats();

		return {
			connectionCount: Math.floor(Math.random() * 20) + 10, // Mock data - implement actual connection monitoring
			queryPerformance: {
				averageTime: Math.random() * 50 + 25, // Mock data
				slowestQueries: [
					{ query: 'SELECT * FROM threads WHERE...', avgTime: 85.2, count: 1250 },
					{ query: 'SELECT * FROM posts WHERE...', avgTime: 65.8, count: 2100 },
					{ query: 'SELECT * FROM users WHERE...', avgTime: 45.3, count: 890 }
				]
			},
			tableStats,
			replicationLag: undefined // Not implemented
		};
	}

	private async getDatabaseTableStats() {
		// Get row counts for major tables
		const [threadsCount, postsCount, usersCount, transactionsCount, xpLogsCount] =
			await Promise.all([
				db.select({ count: count() }).from(threads),
				db.select({ count: count() }).from(posts),
				db.select({ count: count() }).from(users),
				db.select({ count: count() }).from(transactions),
				db.select({ count: count() }).from(xpLogs)
			]);

		return [
			{
				tableName: 'threads',
				rowCount: threadsCount[0]?.count || 0,
				size: '~15 MB',
				indexes: 8
			},
			{
				tableName: 'posts',
				rowCount: postsCount[0]?.count || 0,
				size: '~45 MB',
				indexes: 12
			},
			{
				tableName: 'users',
				rowCount: usersCount[0]?.count || 0,
				size: '~8 MB',
				indexes: 6
			},
			{
				tableName: 'transactions',
				rowCount: transactionsCount[0]?.count || 0,
				size: '~25 MB',
				indexes: 10
			},
			{
				tableName: 'xp_logs',
				rowCount: xpLogsCount[0]?.count || 0,
				size: '~12 MB',
				indexes: 7
			}
		];
	}

	private async getAPIMetrics(timeRange: string) {
		// Mock API metrics - In production, implement actual request tracking
		return {
			averageResponseTime: Math.random() * 100 + 50,
			slowestEndpoints: [
				{ endpoint: '/api/forum/threads', averageTime: 145.2, requestCount: 1250 },
				{ endpoint: '/api/wallet/transactions', averageTime: 125.8, requestCount: 890 },
				{ endpoint: '/api/admin/analytics', averageTime: 95.3, requestCount: 450 }
			],
			errorRate: Math.random() * 2 + 0.5,
			requestsPerMinute: Math.floor(Math.random() * 200) + 100,
			topEndpoints: [
				{ endpoint: '/api/forum/threads', requests: 1250, responseTime: 85.2 },
				{ endpoint: '/api/auth/verify', requests: 980, responseTime: 45.1 },
				{ endpoint: '/api/wallet/balance', requests: 850, responseTime: 65.8 }
			],
			errorsByType: {
				ValidationError: 15,
				DatabaseError: 8,
				AuthenticationError: 12,
				RateLimitError: 5
			},
			statusCodes: {
				'200': 8750,
				'400': 45,
				'401': 12,
				'403': 8,
				'404': 25,
				'500': 8
			}
		};
	}

	private generateTimeSlots(timeRange: string, granularity: string): string[] {
		const slots = [];
		const now = new Date();
		const hoursToGenerate = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720; // 30d = 720 hours
		const stepSize = granularity === 'hour' ? 1 : 24;

		for (let i = hoursToGenerate; i >= 0; i -= stepSize) {
			const time = new Date(now.getTime() - i * 60 * 60 * 1000);
			slots.push(time.toISOString());
		}

		return slots;
	}

	private generateHeatmapData(timeSlots: string[], min: number, max: number): number[][] {
		// Generate mock heatmap data - in production, query actual metrics
		const hours = timeSlots.length;
		const data: number[][] = [];

		for (let hour = 0; hour < hours; hour++) {
			const hourData: number[] = [];
			for (let minute = 0; minute < 60; minute += 5) {
				// 5-minute intervals
				const value = Math.random() * (max - min) + min;
				hourData.push(Math.round(value * 100) / 100);
			}
			data.push(hourData);
		}

		return data;
	}

	private getStartTime(timeRange: string): Date {
		const now = new Date();
		switch (timeRange) {
			case '1h':
				return new Date(now.getTime() - 60 * 60 * 1000);
			case '24h':
				return new Date(now.getTime() - 24 * 60 * 60 * 1000);
			case '7d':
				return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			case '30d':
				return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
			default:
				return new Date(now.getTime() - 24 * 60 * 60 * 1000);
		}
	}

	private getHealthStatus(
		value: number,
		goodThreshold: number,
		poorThreshold: number,
		inverse = false
	): 'pass' | 'warn' | 'fail' {
		if (inverse) {
			// For metrics where lower is better (connections, memory usage, etc.)
			if (value <= goodThreshold) return 'pass';
			if (value <= poorThreshold) return 'warn';
			return 'fail';
		} else {
			// For metrics where higher is better (hit rate, etc.)
			if (value >= goodThreshold) return 'pass';
			if (value >= poorThreshold) return 'warn';
			return 'fail';
		}
	}
}

// Export service instance
export const systemAnalyticsService = new SystemAnalyticsService();
