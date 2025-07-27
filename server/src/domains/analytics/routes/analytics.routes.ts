/**
 * Analytics Routes
 * 
 * Provides endpoints for session tracking, performance metrics,
 * and retention analytics
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate } from '@middleware/auth.unified';
import { validateRequest } from '@middleware/validate-request';
import { z } from 'zod';

const router: RouterType = Router();

// Validation schemas
const sessionMetricsSchema = z.object({
  timeframe: z.enum(['day', 'week', 'month']).optional().default('day')
});

const retentionCohortsSchema = z.object({
  weeks: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(52)).optional().default(12)
});

const clearCacheSchema = z.object({
  prefix: z.string().optional()
});

// Session metrics endpoints
router.get(
  '/sessions/metrics',
  authenticate,
  validateRequest({ query: sessionMetricsSchema }),
  analyticsController.getSessionMetrics
);

router.get(
  '/sessions/cohorts',
  authenticate,
  validateRequest({ query: retentionCohortsSchema }),
  analyticsController.getRetentionCohorts
);

router.get(
  '/sessions/realtime',
  authenticate,
  analyticsController.getRealtimeStats
);

// Cache performance endpoints
router.get(
  '/cache/metrics',
  authenticate,
  analyticsController.getCacheMetrics
);

router.post(
  '/cache/clear',
  authenticate,
  validateRequest({ query: clearCacheSchema }),
  analyticsController.clearCache
);

// Performance dashboard
router.get(
  '/dashboard',
  authenticate,
  validateRequest({ query: sessionMetricsSchema }),
  analyticsController.getPerformanceDashboard
);

// Leaderboard endpoints
const leaderboardSchema = z.object({
  current: z.string().transform(val => val === 'true').optional().default(true)
});

router.get(
  '/leaderboards/:type',
  validateRequest({ 
    params: z.object({ type: z.enum(['xp', 'posts', 'reputation', 'tips']) }),
    query: leaderboardSchema 
  }),
  analyticsController.getLeaderboard
);

export default router;