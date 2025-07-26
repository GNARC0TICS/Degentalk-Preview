/**
 * Cache Metrics Routes
 * 
 * Admin-only endpoints for monitoring cache performance and health
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { cacheMetricsController } from '../controllers/cache-metrics.controller';
import { isAdmin } from '@domains/auth/middleware/auth.middleware';

const router: RouterType = Router();

// All cache metrics routes require admin access
router.use(isAdmin);

/**
 * GET /api/admin/cache/health
 * Get comprehensive cache health dashboard
 */
router.get('/health', cacheMetricsController.getHealthDashboard);

/**
 * GET /api/admin/cache/operations
 * Get recent cache operations for debugging
 */
router.get('/operations', cacheMetricsController.getRecentOperations);

/**
 * GET /api/admin/cache/invalidations
 * Get cache invalidation history and stats
 */
router.get('/invalidations', cacheMetricsController.getInvalidationHistory);

/**
 * DELETE /api/admin/cache/metrics
 * Clear cache metrics (development only)
 */
router.delete('/metrics', cacheMetricsController.clearMetrics);

export default router;