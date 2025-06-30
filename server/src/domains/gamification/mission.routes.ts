/**
 * Mission System API Routes
 *
 * RESTful routes for daily/weekly missions, progress tracking,
 * and reward management.
 */

import { Router } from 'express';
import { missionController } from './mission.controller';
import { isAuthenticated, isAdmin } from '../auth/middleware/auth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting
const publicRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // 100 requests per window
	standardHeaders: true,
	legacyHeaders: false
});

const userRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 200, // 200 requests per window for authenticated users
	standardHeaders: true,
	legacyHeaders: false
});

const adminRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 50, // 50 requests per window for admin operations
	standardHeaders: true,
	legacyHeaders: false
});

// Public routes (mission browsing)
router.get('/', publicRateLimit, missionController.getMissions.bind(missionController));

// Authenticated user routes (own missions and actions) - PUT BEFORE /:id route
router.get(
	'/my-progress',
	isAuthenticated,
	userRateLimit,
	missionController.getMyMissions.bind(missionController)
);

// User-specific routes (can view any user's mission progress)
router.get(
	'/user/:userId',
	publicRateLimit,
	missionController.getUserMissions.bind(missionController)
);

// Dynamic ID route MUST come after specific routes to avoid conflicts
router.get('/:id', publicRateLimit, missionController.getMissionById.bind(missionController));

router.post(
	'/claim',
	isAuthenticated,
	userRateLimit,
	missionController.claimMissionReward.bind(missionController)
);

// System integration routes (for mission progress updates)
router.post(
	'/update-progress',
	isAuthenticated,
	userRateLimit,
	missionController.updateMissionProgress.bind(missionController)
);

// Admin-only routes
router.post(
	'/',
	isAuthenticated,
	isAdmin,
	adminRateLimit,
	missionController.createMission.bind(missionController)
);

router.put(
	'/:id',
	isAuthenticated,
	isAdmin,
	adminRateLimit,
	missionController.updateMission.bind(missionController)
);

router.post(
	'/reset/daily',
	isAuthenticated,
	isAdmin,
	adminRateLimit,
	missionController.resetDailyMissions.bind(missionController)
);

router.post(
	'/reset/weekly',
	isAuthenticated,
	isAdmin,
	adminRateLimit,
	missionController.resetWeeklyMissions.bind(missionController)
);

router.post(
	'/seed-defaults',
	isAuthenticated,
	isAdmin,
	adminRateLimit,
	missionController.seedDefaultMissions.bind(missionController)
);

router.get(
	'/analytics',
	isAuthenticated,
	isAdmin,
	adminRateLimit,
	missionController.getMissionAnalytics.bind(missionController)
);

export default router;
