/**
 * System Analytics Routes
 *
 * API routes for system performance analytics, cache metrics,
 * and performance monitoring endpoints
 */

import { Router } from 'express';
import { systemAnalyticsController } from './system-analytics.controller';
import { requireRole } from '@server/src/core/middleware/auth.middleware';

const router = Router();

// ============ SYSTEM METRICS ROUTES ============

/**
 * GET /api/admin/analytics/system/metrics
 * Get comprehensive system performance metrics
 * Query params: timeRange, includeCache, includeDatabase, includeAPI, includeSystem
 */
router.get(
	'/metrics',
	requireRole(['admin']),
	systemAnalyticsController.getSystemMetrics.bind(systemAnalyticsController)
);

/**
 * GET /api/admin/analytics/system/overview
 * Get system overview dashboard data (summary of all metrics)
 */
router.get(
	'/overview',
	requireRole(['admin']),
	systemAnalyticsController.getSystemOverview.bind(systemAnalyticsController)
);

/**
 * GET /api/admin/analytics/system/health
 * Get system health assessment with recommendations
 * Query params: includeRecommendations, includeDetailedChecks, forceRefresh
 */
router.get(
	'/health',
	requireRole(['admin']),
	systemAnalyticsController.getSystemHealth.bind(systemAnalyticsController)
);

/**
 * GET /api/admin/analytics/system/realtime
 * Get real-time system activity metrics
 * Query params: interval, metrics
 */
router.get(
	'/realtime',
	requireRole(['admin']),
	systemAnalyticsController.getRealtimeAnalytics.bind(systemAnalyticsController)
);

// ============ PERFORMANCE VISUALIZATION ROUTES ============

/**
 * GET /api/admin/analytics/system/heatmap
 * Get performance heatmap data for visualization
 * Query params: timeRange, granularity, metrics, includePredictions
 */
router.get(
	'/heatmap',
	requireRole(['admin']),
	systemAnalyticsController.getPerformanceHeatmap.bind(systemAnalyticsController)
);

// ============ CACHE ANALYTICS ROUTES ============

/**
 * GET /api/admin/analytics/system/cache/stats
 * Get detailed cache performance statistics
 */
router.get(
	'/cache/stats',
	requireRole(['admin']),
	systemAnalyticsController.getCacheStats.bind(systemAnalyticsController)
);

/**
 * POST /api/admin/analytics/system/cache/operation
 * Perform cache operations (clear, warm, invalidate, stats)
 * Body: { operation, category?, pattern?, warmupTargets? }
 */
router.post(
	'/cache/operation',
	requireRole(['admin']),
	systemAnalyticsController.performCacheOperation.bind(systemAnalyticsController)
);

// ============ DATABASE ANALYTICS ROUTES ============

/**
 * GET /api/admin/analytics/system/database/stats
 * Get detailed database performance statistics
 */
router.get(
	'/database/stats',
	requireRole(['admin']),
	systemAnalyticsController.getDatabaseStats.bind(systemAnalyticsController)
);

export { router as systemAnalyticsRoutes };
