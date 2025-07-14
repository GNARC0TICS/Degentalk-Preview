/**
 * System Analytics API Service
 *
 * Frontend API service for system performance analytics
 */

import { apiRequest } from '@utils/api-request';

// ============ TYPE DEFINITIONS ============

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
		data: string[][];
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
	score: number;
	checks: Array<{
		name: string;
		status: 'pass' | 'warn' | 'fail';
		value: number | string;
		threshold: number | string;
		message: string;
	}>;
	recommendations: string[];
	lastChecked: string;
}

export interface RealtimeAnalytics {
	activeUsers: number;
	requestsPerSecond: number;
	newThreadsLastHour: number;
	newPostsLastHour: number;
	dgtTransactionsLastHour: number;
	cacheOperationsPerSecond: number;
}

export interface SystemOverview {
	systemStatus: {
		health: 'healthy' | 'degraded' | 'critical';
		score: number;
		uptime: number;
	};
	performance: {
		averageResponseTime: number;
		requestsPerMinute: number;
		errorRate: number;
		cacheHitRate: number;
	};
	activity: {
		activeUsers: number;
		newThreadsLastHour: number;
		newPostsLastHour: number;
		dgtTransactionsLastHour: number;
	};
	resources: {
		cacheMemoryUsage: number;
		databaseConnections: number;
		totalCacheKeys: number;
	};
	alerts: Array<{
		severity: 'critical' | 'warning';
		message: string;
		metric: string;
		value: number | string;
	}>;
}

export interface CacheStats {
	metrics: {
		keys: number;
		ksize: number;
		vsize: number;
		hits: number;
		misses: number;
	};
	analytics: {
		hitRate: number;
		hitRateGrade: string;
		keysByCategory: Record<string, number>;
		hits: number;
		misses: number;
		recommendations: string[];
	};
}

// ============ QUERY PARAMETERS ============

export interface SystemMetricsParams {
	timeRange?: '1h' | '24h' | '7d' | '30d';
	includeCache?: boolean;
	includeDatabase?: boolean;
	includeAPI?: boolean;
	includeSystem?: boolean;
}

export interface PerformanceHeatmapParams {
	timeRange?: '24h' | '7d' | '30d';
	granularity?: 'hour' | 'day';
	metrics?: Array<'response_time' | 'request_count' | 'error_rate' | 'cache_hit_rate'>;
	includePredictions?: boolean;
}

export interface SystemHealthParams {
	includeRecommendations?: boolean;
	includeDetailedChecks?: boolean;
	forceRefresh?: boolean;
}

export interface RealtimeAnalyticsParams {
	interval?: '5s' | '30s' | '1m' | '5m';
	metrics?: Array<
		'active_users' | 'requests_per_second' | 'cache_operations' | 'new_content' | 'transactions'
	>;
}

export interface CacheOperationParams {
	operation: 'clear' | 'warm' | 'invalidate' | 'stats';
	category?: string;
	pattern?: string;
	warmupTargets?: string[];
}

// ============ API FUNCTIONS ============

export const systemAnalyticsApi = {
	/**
	 * Get comprehensive system metrics
	 */
	async getSystemMetrics(params?: SystemMetricsParams) {
		return apiRequest<{ metrics: Partial<SystemMetrics>; timeRange: string; timestamp: string }>({
			url: '/api/admin/analytics/system/metrics',
			method: 'GET',
			params
		});
	},

	/**
	 * Get system overview dashboard data
	 */
	async getSystemOverview() {
		return apiRequest<{ overview: SystemOverview; lastUpdated: string }>({
			url: '/api/admin/analytics/system/overview',
			method: 'GET'
		});
	},

	/**
	 * Get performance heatmap data
	 */
	async getPerformanceHeatmap(params?: PerformanceHeatmapParams) {
		return apiRequest<{
			heatmap: PerformanceHeatmap;
			query: PerformanceHeatmapParams & { filteredMetrics?: string[] };
			timestamp: string;
		}>({
			url: '/api/admin/analytics/system/heatmap',
			method: 'GET',
			params
		});
	},

	/**
	 * Get system health assessment
	 */
	async getSystemHealth(params?: SystemHealthParams) {
		return apiRequest<{ health: Partial<SystemHealth>; timestamp: string }>({
			url: '/api/admin/analytics/system/health',
			method: 'GET',
			params
		});
	},

	/**
	 * Get real-time analytics
	 */
	async getRealtimeAnalytics(params?: RealtimeAnalyticsParams) {
		return apiRequest<{
			realtime: Partial<RealtimeAnalytics>;
			interval: string;
			timestamp: string;
		}>({
			url: '/api/admin/analytics/system/realtime',
			method: 'GET',
			params
		});
	},

	/**
	 * Get cache statistics
	 */
	async getCacheStats() {
		return apiRequest<CacheStats & { timestamp: string }>({
			url: '/api/admin/analytics/system/cache/stats',
			method: 'GET'
		});
	},

	/**
	 * Perform cache operation
	 */
	async performCacheOperation(operation: CacheOperationParams) {
		return apiRequest<{
			operation: string;
			result: unknown;
			executedBy: string;
			timestamp: string;
		}>({
			url: '/api/admin/analytics/system/cache/operation',
			method: 'POST',
			data: operation
		});
	},

	/**
	 * Get database statistics
	 */
	async getDatabaseStats() {
		return apiRequest<{ database: SystemMetrics['database']; timestamp: string }>({
			url: '/api/admin/analytics/system/database/stats',
			method: 'GET'
		});
	}
};
