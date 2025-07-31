/**
 * Analytics Routes
 * 
 * Provides endpoints for session tracking, performance metrics,
 * and retention analytics
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { luciaAuth } from '@middleware/lucia-auth.middleware';
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
  luciaAuth.require,
  validateRequest({ query: sessionMetricsSchema }),
  analyticsController.getSessionMetrics
);

router.get(
  '/sessions/cohorts',
  luciaAuth.require,
  validateRequest({ query: retentionCohortsSchema }),
  analyticsController.getRetentionCohorts
);

router.get(
  '/sessions/realtime',
  luciaAuth.require,
  analyticsController.getRealtimeStats
);

// Cache performance endpoints
router.get(
  '/cache/metrics',
  luciaAuth.require,
  analyticsController.getCacheMetrics
);

router.post(
  '/cache/clear',
  luciaAuth.require,
  validateRequest({ query: clearCacheSchema }),
  analyticsController.clearCache
);

// Performance dashboard
router.get(
  '/dashboard',
  luciaAuth.require,
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