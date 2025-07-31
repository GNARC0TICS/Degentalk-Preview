import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { ProfileStatsController } from './profile-stats.controller';
import { createCustomRateLimiter } from '@core/services/rate-limit.service';
import { luciaAuth } from '@middleware/lucia-auth.middleware';

const router: RouterType = Router();

/**
 * Profile Statistics Routes
 * Handles enhanced profile data for widget system
 */

// GET /api/profile/:username/stats - Extended profile statistics
router.get(
	'/:username/stats',
	luciaAuth.optional, // Allow both authenticated and anonymous access
	createCustomRateLimiter({ windowMs: 60000, max: 30 }), // 30 requests per minute
	ProfileStatsController.getExtendedProfileStats
);

// GET /api/profile/:username/quick-stats - Minimal stats for previews
router.get(
	'/:username/quick-stats',
	luciaAuth.optional,
	createCustomRateLimiter({ windowMs: 60000, max: 60 }), // 60 requests per minute (higher for previews)
	ProfileStatsController.getQuickProfileStats
);

// Analytics routes
const analyticsRouter: RouterType = Router();

// POST /api/analytics/profile-engagement - Track profile engagement
analyticsRouter.post(
	'/profile-engagement',
	luciaAuth.optional,
	createCustomRateLimiter({ windowMs: 60000, max: 100 }), // 100 analytics events per minute
	ProfileStatsController.trackProfileEngagement
);

export { router as profileStatsRoutes, analyticsRouter };

/**
 * Route Documentation
 *
 * GET /api/profile/:username/stats
 * - Returns comprehensive profile statistics for enhanced widgets
 * - Includes reputation, activity, wallet, social, and achievement data
 * - Sanitizes sensitive data for non-own profiles
 * - Cached for 30 seconds to reduce database load
 *
 * GET /api/profile/:username/quick-stats
 * - Returns minimal profile data for quick previews/tooltips
 * - Optimized for high-frequency requests
 * - Essential data only (level, reputation, online status)
 *
 * POST /api/analytics/profile-engagement
 * - Tracks user engagement with profile pages
 * - Records time spent, tab switches, actions performed
 * - Used for behavioral analytics and conversion optimization
 *
 * Rate Limiting:
 * - Extended stats: 30/min (comprehensive data)
 * - Quick stats: 60/min (lightweight previews)
 * - Analytics: 100/min (high-frequency tracking)
 *
 * Authentication:
 * - Optional auth allows anonymous profile viewing
 * - Authenticated users get enhanced data and tracking
 * - Own profiles return full sensitive data
 */
