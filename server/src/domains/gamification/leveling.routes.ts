/**
 * Leveling API Routes
 *
 * RESTful routes for the leveling and progression system
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { levelingController } from './leveling.controller';
import { isAuthenticated, isAdmin } from '@domains/auth/middleware/auth.middleware';
import rateLimit from 'express-rate-limit';

const router: RouterType = Router();

// Rate limiting for different endpoints
const publicRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // 100 requests per window
	standardHeaders: true,
	legacyHeaders: false
});

const adminRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 50, // 50 requests per window
	standardHeaders: true,
	legacyHeaders: false
});

// Public routes (with authentication optional for some)
router.get('/levels', publicRateLimit, levelingController.getAllLevels.bind(levelingController));
router.get(
	'/levels/:level',
	publicRateLimit,
	levelingController.getLevelInfo.bind(levelingController)
);
router.get(
	'/leaderboard',
	publicRateLimit,
	levelingController.getLeaderboard.bind(levelingController)
);

// Authenticated user routes
router.get(
	'/progression/me',
	isAuthenticated,
	publicRateLimit,
	levelingController.getMyProgression.bind(levelingController)
);

router.get(
	'/progression/:userId',
	publicRateLimit,
	levelingController.getUserProgression.bind(levelingController)
);

router.get(
	'/progression/:userId/rank',
	publicRateLimit,
	levelingController.getUserRank.bind(levelingController)
);

// Admin-only routes
router.get(
	'/analytics',
	isAuthenticated,
	isAdmin,
	adminRateLimit,
	levelingController.getProgressionAnalytics.bind(levelingController)
);

router.post(
	'/levels',
	isAuthenticated,
	isAdmin,
	adminRateLimit,
	levelingController.createLevel.bind(levelingController)
);

router.post(
	'/levels/generate-curve',
	isAuthenticated,
	isAdmin,
	adminRateLimit,
	levelingController.generateXpCurve.bind(levelingController)
);

router.post(
	'/levels/:level/simulate-rewards',
	isAuthenticated,
	isAdmin,
	adminRateLimit,
	levelingController.simulateLevelRewards.bind(levelingController)
);

export default router;
