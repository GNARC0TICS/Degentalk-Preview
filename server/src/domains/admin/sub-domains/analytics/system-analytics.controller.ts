import type { Request, Response } from 'express';
import { userService } from '@core/services/user.service';
import { systemAnalyticsService } from './system-analytics.service';
import { platformStatsService } from './platformStats.service';
import {
	systemMetricsQuerySchema,
	performanceHeatmapQuerySchema,
	systemHealthQuerySchema,
	realtimeAnalyticsQuerySchema,
	cacheOperationSchema,
	type SystemMetricsQuery,
	type PerformanceHeatmapQuery,
	type SystemHealthQuery,
	type RealtimeAnalyticsQuery,
	type CacheOperation
} from './system-analytics.validators';
import { formatAdminResponse, AdminOperationBoundary } from '@api/domains/admin/shared';
import { AdminError, AdminErrorCodes } from '@api/domains/admin/admin.errors';
import { adminCacheService } from '@api/domains/admin/shared/admin-cache.service';

export class SystemAnalyticsController {
	/**
	 * GET /api/admin/analytics/platform-stats
	 * Get platform statistics overview for admin dashboard
	 */
	async getPlatformStats(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'GET_PLATFORM_STATS',
			entityType: 'platform_analytics'
		});

		return boundary.execute(async () => {
			const stats = await platformStatsService.updateAllStats();

			return formatAdminResponse(
				{
					platformStats: stats,
					timestamp: new Date().toISOString()
				},
				'GET_PLATFORM_STATS',
				'platform_analytics'
			);
		});
	}

	/**
	 * GET /api/admin/analytics/system/metrics
	 * Get comprehensive system performance metrics
	 */
	async getSystemMetrics(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'GET_SYSTEM_METRICS',
			entityType: 'system_analytics'
		});

		return boundary.execute(async () => {
			const query = systemMetricsQuerySchema.parse(req.query);
			const metrics = await systemAnalyticsService.getSystemMetrics(query.timeRange);

			// Filter metrics based on query parameters
			const filteredMetrics = {
				...(query.includeCache && { cache: metrics.cache }),
				...(query.includeDatabase && { database: metrics.database }),
				...(query.includeAPI && { api: metrics.api, performance: metrics.performance }),
				...(query.includeSystem && { system: metrics.system })
			};

			return formatAdminResponse(
				{
					metrics: filteredMetrics,
					timeRange: query.timeRange,
					timestamp: new Date().toISOString()
				},
				'GET_SYSTEM_METRICS',
				'system_analytics'
			);
		});
	}

	/**
	 * GET /api/admin/analytics/system/heatmap
	 * Get performance heatmap data for visualization
	 */
	async getPerformanceHeatmap(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'GET_PERFORMANCE_HEATMAP',
			entityType: 'system_analytics'
		});

		return boundary.execute(async () => {
			const query = performanceHeatmapQuerySchema.parse(req.query);
			const heatmap = await systemAnalyticsService.getPerformanceHeatmap(
				query.timeRange,
				query.granularity
			);

			// Filter metrics if specified
			if (query.metrics && query.metrics.length > 0) {
				heatmap.metrics = heatmap.metrics.filter((metric) => query.metrics!.includes(metric.type));
			}

			return formatAdminResponse(
				{
					heatmap,
					query: {
						timeRange: query.timeRange,
						granularity: query.granularity,
						filteredMetrics: query.metrics
					},
					timestamp: new Date().toISOString()
				},
				'GET_PERFORMANCE_HEATMAP',
				'system_analytics'
			);
		});
	}

	/**
	 * GET /api/admin/analytics/system/health
	 * Get system health assessment with recommendations
	 */
	async getSystemHealth(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'GET_SYSTEM_HEALTH',
			entityType: 'system_analytics'
		});

		return boundary.execute(async () => {
			const query = systemHealthQuerySchema.parse(req.query);

			// Force refresh bypasses cache
			if (query.forceRefresh) {
				adminCacheService.delete('system_analytics:health');
			}

			const health = await systemAnalyticsService.getSystemHealth();

			// Filter response based on query parameters
			const response = {
				status: health.status,
				score: health.score,
				lastChecked: health.lastChecked,
				...(query.includeDetailedChecks && { checks: health.checks }),
				...(query.includeRecommendations && { recommendations: health.recommendations })
			};

			return formatAdminResponse(
				{
					health: response,
					timestamp: new Date().toISOString()
				},
				'GET_SYSTEM_HEALTH',
				'system_analytics'
			);
		});
	}

	/**
	 * GET /api/admin/analytics/system/realtime
	 * Get real-time system activity metrics
	 */
	async getRealtimeAnalytics(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'GET_REALTIME_ANALYTICS',
			entityType: 'system_analytics'
		});

		return boundary.execute(async () => {
			const query = realtimeAnalyticsQuerySchema.parse(req.query);
			const realtime = await systemAnalyticsService.getRealtimeAnalytics();

			// Filter metrics if specified
			let filteredRealtime = realtime;
			if (query.metrics && query.metrics.length > 0) {
				filteredRealtime = {};
				query.metrics.forEach((metric) => {
					switch (metric) {
						case 'active_users':
							filteredRealtime.activeUsers = realtime.activeUsers;
							break;
						case 'requests_per_second':
							filteredRealtime.requestsPerSecond = realtime.requestsPerSecond;
							break;
						case 'cache_operations':
							filteredRealtime.cacheOperationsPerSecond = realtime.cacheOperationsPerSecond;
							break;
						case 'new_content':
							filteredRealtime.newThreadsLastHour = realtime.newThreadsLastHour;
							filteredRealtime.newPostsLastHour = realtime.newPostsLastHour;
							break;
						case 'transactions':
							filteredRealtime.dgtTransactionsLastHour = realtime.dgtTransactionsLastHour;
							break;
					}
				});
			}

			return formatAdminResponse(
				{
					realtime: filteredRealtime,
					interval: query.interval,
					timestamp: new Date().toISOString()
				},
				'GET_REALTIME_ANALYTICS',
				'system_analytics'
			);
		});
	}

	/**
	 * GET /api/admin/analytics/system/cache/stats
	 * Get detailed cache performance statistics
	 */
	async getCacheStats(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'GET_CACHE_STATS',
			entityType: 'system_analytics'
		});

		return boundary.execute(async () => {
			const cacheMetrics = adminCacheService.getCacheMetrics();
			const cacheAnalytics = adminCacheService.getCacheAnalytics();

			return formatAdminResponse(
				{
					metrics: cacheMetrics,
					analytics: cacheAnalytics,
					timestamp: new Date().toISOString()
				},
				'GET_CACHE_STATS',
				'system_analytics'
			);
		});
	}

	/**
	 * POST /api/admin/analytics/system/cache/operation
	 * Perform cache operations (clear, warm, invalidate)
	 */
	async performCacheOperation(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'CACHE_OPERATION',
			entityType: 'system_analytics'
		});

		return boundary.execute(async () => {
			const operation = cacheOperationSchema.parse(req.body);
			const adminId = userService.getUserFromRequest(req)?.id;

			if (!adminId) {
				throw new AdminError('Admin ID required', 401, AdminErrorCodes.UNAUTHORIZED);
			}

			let result;

			switch (operation.operation) {
				case 'clear':
					if (operation.category) {
						result = adminCacheService.clearCategory(operation.category);
					} else {
						result = adminCacheService.flushAll();
					}
					break;

				case 'warm':
					// TODO: Implement cache warming
					result = { success: true, message: 'Cache warming initiated' };
					break;

				case 'invalidate':
					if (operation.pattern) {
						result = adminCacheService.deletePattern(operation.pattern);
					} else {
						throw new AdminError(
							'Pattern required for invalidation',
							400,
							AdminErrorCodes.VALIDATION_ERROR
						);
					}
					break;

				case 'stats':
					result = {
						metrics: adminCacheService.getCacheMetrics(),
						analytics: adminCacheService.getCacheAnalytics()
					};
					break;

				default:
					throw new AdminError('Invalid cache operation', 400, AdminErrorCodes.VALIDATION_ERROR);
			}

			return formatAdminResponse(
				{
					operation: operation.operation,
					result,
					executedBy: adminId,
					timestamp: new Date().toISOString()
				},
				'CACHE_OPERATION',
				'system_analytics'
			);
		});
	}

	/**
	 * GET /api/admin/analytics/system/overview
	 * Get system overview dashboard data
	 */
	async getSystemOverview(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'GET_SYSTEM_OVERVIEW',
			entityType: 'system_analytics'
		});

		return boundary.execute(async () => {
			const [metrics, health, realtime] = await Promise.all([
				systemAnalyticsService.getSystemMetrics('24h'),
				systemAnalyticsService.getSystemHealth(),
				systemAnalyticsService.getRealtimeAnalytics()
			]);

			// Create overview summary
			const overview = {
				systemStatus: {
					health: health.status,
					score: health.score,
					uptime: metrics.performance.uptime
				},
				performance: {
					averageResponseTime: metrics.performance.averageResponseTime,
					requestsPerMinute: realtime.requestsPerSecond * 60,
					errorRate: metrics.performance.errorRate,
					cacheHitRate: metrics.cache.hitRate
				},
				activity: {
					activeUsers: realtime.activeUsers,
					newThreadsLastHour: realtime.newThreadsLastHour,
					newPostsLastHour: realtime.newPostsLastHour,
					dgtTransactionsLastHour: realtime.dgtTransactionsLastHour
				},
				resources: {
					cacheMemoryUsage: metrics.cache.memoryUsage,
					databaseConnections: metrics.database.connectionCount,
					totalCacheKeys: metrics.cache.totalKeys
				},
				alerts: health.checks
					.filter((check) => check.status !== 'pass')
					.map((check) => ({
						severity: check.status === 'fail' ? 'critical' : 'warning',
						message: check.message,
						metric: check.name,
						value: check.value
					}))
			};

			return formatAdminResponse(
				{
					overview,
					lastUpdated: new Date().toISOString()
				},
				'GET_SYSTEM_OVERVIEW',
				'system_analytics'
			);
		});
	}

	/**
	 * GET /api/admin/analytics/system/database/stats
	 * Get detailed database performance statistics
	 */
	async getDatabaseStats(req: Request, res: Response) {
		const boundary = new AdminOperationBoundary({
			operation: 'GET_DATABASE_STATS',
			entityType: 'system_analytics'
		});

		return boundary.execute(async () => {
			const metrics = await systemAnalyticsService.getSystemMetrics('24h');

			return formatAdminResponse(
				{
					database: metrics.database,
					timestamp: new Date().toISOString()
				},
				'GET_DATABASE_STATS',
				'system_analytics'
			);
		});
	}
}

// Export controller instance
export const systemAnalyticsController = new SystemAnalyticsController();
