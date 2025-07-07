/**
 * System Analytics Validation Schemas
 *
 * Zod schemas for system analytics API endpoints
 */

import { z } from 'zod';

// Time range validation
export const timeRangeSchema = z.enum(['1h', '24h', '7d', '30d']).default('24h');

// Granularity validation
export const granularitySchema = z.enum(['hour', 'day']).default('hour');

// Metric type validation
export const metricTypeSchema = z.enum([
	'response_time',
	'request_count',
	'error_rate',
	'cache_hit_rate',
	'memory_usage',
	'cpu_usage',
	'database_connections'
]);

// System metrics query schema
export const systemMetricsQuerySchema = z.object({
	timeRange: timeRangeSchema.optional(),
	includeCache: z.coerce.boolean().default(true),
	includeDatabase: z.coerce.boolean().default(true),
	includeAPI: z.coerce.boolean().default(true),
	includeSystem: z.coerce.boolean().default(false) // System metrics require additional setup
});

// Performance heatmap query schema
export const performanceHeatmapQuerySchema = z.object({
	timeRange: z.enum(['24h', '7d', '30d']).default('24h'),
	granularity: granularitySchema.optional(),
	metrics: z.array(metricTypeSchema).optional(), // Filter specific metrics
	includePredictions: z.coerce.boolean().default(false) // Future: ML predictions
});

// System health query schema
export const systemHealthQuerySchema = z.object({
	includeRecommendations: z.coerce.boolean().default(true),
	includeDetailedChecks: z.coerce.boolean().default(true),
	forceRefresh: z.coerce.boolean().default(false) // Skip cache
});

// Realtime analytics query schema
export const realtimeAnalyticsQuerySchema = z.object({
	interval: z.enum(['5s', '30s', '1m', '5m']).default('30s'),
	metrics: z
		.array(
			z.enum([
				'active_users',
				'requests_per_second',
				'cache_operations',
				'new_content',
				'transactions'
			])
		)
		.optional()
});

// Alert threshold configuration schema
export const alertThresholdSchema = z.object({
	metricType: metricTypeSchema,
	thresholds: z.object({
		warning: z.number(),
		critical: z.number()
	}),
	enabled: z.boolean().default(true),
	notificationChannels: z.array(z.enum(['email', 'webhook', 'slack'])).default(['email'])
});

// Performance baseline schema (for comparison)
export const performanceBaselineSchema = z.object({
	period: z.enum(['last_week', 'last_month', 'last_quarter']).default('last_week'),
	metrics: z.array(metricTypeSchema).optional(),
	includePercentiles: z.coerce.boolean().default(true) // P50, P95, P99
});

// System report generation schema
export const systemReportSchema = z.object({
	reportType: z.enum(['daily', 'weekly', 'monthly', 'custom']).default('daily'),
	startDate: z.string().datetime().optional(),
	endDate: z.string().datetime().optional(),
	format: z.enum(['json', 'pdf', 'csv']).default('json'),
	includeCharts: z.coerce.boolean().default(true),
	sections: z
		.array(
			z.enum(['overview', 'performance', 'cache', 'database', 'api', 'system', 'recommendations'])
		)
		.default(['overview', 'performance', 'recommendations'])
});

// Cache operations schema
export const cacheOperationSchema = z.object({
	operation: z.enum(['clear', 'warm', 'invalidate', 'stats']),
	category: z.string().optional(), // Specific cache category
	pattern: z.string().optional(), // Key pattern for invalidation
	warmupTargets: z.array(z.string()).optional() // Specific endpoints to warm
});

// Performance optimization schema
export const performanceOptimizationSchema = z.object({
	optimizationType: z.enum(['cache', 'database', 'api', 'system']),
	autoApply: z.coerce.boolean().default(false), // Automatically apply safe optimizations
	dryRun: z.coerce.boolean().default(true), // Test mode first
	targets: z.array(z.string()).optional() // Specific targets to optimize
});

// Export input types
export type SystemMetricsQuery = z.infer<typeof systemMetricsQuerySchema>;
export type PerformanceHeatmapQuery = z.infer<typeof performanceHeatmapQuerySchema>;
export type SystemHealthQuery = z.infer<typeof systemHealthQuerySchema>;
export type RealtimeAnalyticsQuery = z.infer<typeof realtimeAnalyticsQuerySchema>;
export type AlertThreshold = z.infer<typeof alertThresholdSchema>;
export type PerformanceBaseline = z.infer<typeof performanceBaselineSchema>;
export type SystemReport = z.infer<typeof systemReportSchema>;
export type CacheOperation = z.infer<typeof cacheOperationSchema>;
export type PerformanceOptimization = z.infer<typeof performanceOptimizationSchema>;
