/**
 * Gamification Analytics Routes
 *
 * API endpoints for comprehensive analytics, reporting,
 * and system monitoring.
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { gamificationAnalyticsController } from './analytics.controller';
import { isAuthenticated, isAdmin } from '@domains/auth/middleware/auth.middleware';
import rateLimit from 'express-rate-limit';

const router: RouterType = Router();

// Rate limiting for analytics endpoints
const adminAnalyticsLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // 100 requests per window for admin analytics
	standardHeaders: true,
	legacyHeaders: false
});

const publicAnalyticsLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 20, // 20 requests per window for public analytics
	standardHeaders: true,
	legacyHeaders: false
});

const exportLimit = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 5, // 5 exports per hour
	standardHeaders: true,
	legacyHeaders: false
});

// Public analytics endpoints (limited access)
router.get(
	'/overview',
	publicAnalyticsLimit,
	gamificationAnalyticsController.getOverview.bind(gamificationAnalyticsController)
);

router.get(
	'/summary',
	publicAnalyticsLimit,
	gamificationAnalyticsController.getSummary.bind(gamificationAnalyticsController)
);

router.get(
	'/leaderboard',
	publicAnalyticsLimit,
	gamificationAnalyticsController.getTopPerformers.bind(gamificationAnalyticsController)
);

// System health (accessible to authenticated users)
router.get(
	'/health',
	isAuthenticated,
	publicAnalyticsLimit,
	gamificationAnalyticsController.getSystemHealth.bind(gamificationAnalyticsController)
);

// Admin-only comprehensive analytics
router.get(
	'/dashboard',
	isAuthenticated,
	isAdmin,
	adminAnalyticsLimit,
	gamificationAnalyticsController.getDashboard.bind(gamificationAnalyticsController)
);

router.get(
	'/progression',
	isAuthenticated,
	isAdmin,
	adminAnalyticsLimit,
	gamificationAnalyticsController.getProgressionMetrics.bind(gamificationAnalyticsController)
);

router.get(
	'/achievements',
	isAuthenticated,
	isAdmin,
	adminAnalyticsLimit,
	gamificationAnalyticsController.getAchievementMetrics.bind(gamificationAnalyticsController)
);

router.get(
	'/missions',
	isAuthenticated,
	isAdmin,
	adminAnalyticsLimit,
	gamificationAnalyticsController.getMissionMetrics.bind(gamificationAnalyticsController)
);

router.get(
	'/engagement',
	isAuthenticated,
	isAdmin,
	adminAnalyticsLimit,
	gamificationAnalyticsController.getEngagementMetrics.bind(gamificationAnalyticsController)
);

router.get(
	'/trends',
	isAuthenticated,
	isAdmin,
	adminAnalyticsLimit,
	gamificationAnalyticsController.getTrends.bind(gamificationAnalyticsController)
);

// Data export endpoints (highly restricted)
router.post(
	'/export',
	isAuthenticated,
	isAdmin,
	exportLimit,
	gamificationAnalyticsController.exportAnalytics.bind(gamificationAnalyticsController)
);

// Real-time monitoring (admin only)
router.get(
	'/real-time',
	isAuthenticated,
	isAdmin,
	adminAnalyticsLimit,
	gamificationAnalyticsController.getRealTimeActivity.bind(gamificationAnalyticsController)
);

export default router;
