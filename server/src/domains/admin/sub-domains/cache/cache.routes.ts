/**
 * Admin Cache Management Routes
 *
 * Provides cache monitoring, management, and optimization tools for admin users
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { AdminCacheController } from './cache.controller';
import { asyncHandler } from '../../admin.middleware';
import cacheMetricsRoutes from '../../routes/cache-metrics.routes';

// Create router
const router: RouterType = Router();

// Initialize cache controller
const cacheController = new AdminCacheController();

/**
 * @route GET /api/admin/cache/metrics
 * @desc Get cache performance metrics and health status
 * @access Admin
 */
router.get('/metrics', asyncHandler(cacheController.getMetrics.bind(cacheController)));

/**
 * @route GET /api/admin/cache/analytics
 * @desc Get detailed cache usage analytics and recommendations
 * @access Admin
 */
router.get('/analytics', asyncHandler(cacheController.getAnalytics.bind(cacheController)));

/**
 * @route POST /api/admin/cache/clear
 * @desc Clear cache by pattern or category
 * @access Admin
 */
router.post('/clear', asyncHandler(cacheController.clearCache.bind(cacheController)));

/**
 * @route POST /api/admin/cache/warmup
 * @desc Warm up cache with critical admin data
 * @access Admin
 */
router.post('/warmup', asyncHandler(cacheController.warmupCache.bind(cacheController)));

// Mount new cache metrics routes
router.use('/metrics', cacheMetricsRoutes);

export default router;
