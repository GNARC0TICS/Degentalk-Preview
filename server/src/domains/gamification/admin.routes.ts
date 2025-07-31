/**
 * Gamification Admin Routes
 *
 * Administrative endpoints for managing all gamification systems.
 * Highly restricted access with comprehensive logging.
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { gamificationAdminController } from './admin.controller';
import { luciaAuth } from '@middleware/lucia-auth.middleware';
const isAuthenticated = luciaAuth.require;
const isAdmin = luciaAuth.requireAdmin;
import rateLimit from 'express-rate-limit';

const router: RouterType = Router();

// Strict rate limiting for admin operations
const adminRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 30, // 30 requests per window
	standardHeaders: true,
	legacyHeaders: false,
	message: 'Too many admin requests, please try again later'
});

const bulkOperationLimit = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 5, // 5 bulk operations per hour
	standardHeaders: true,
	legacyHeaders: false,
	message: 'Bulk operation limit exceeded, please try again later'
});

const maintenanceLimit = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 10, // 10 maintenance operations per hour
	standardHeaders: true,
	legacyHeaders: false,
	message: 'Maintenance operation limit exceeded'
});

// All routes require admin authentication
router.use(isAuthenticated);
router.use(isAdmin);

// Overview and monitoring
router.get(
	'/overview',
	adminRateLimit,
	gamificationAdminController.getAdminOverview.bind(gamificationAdminController)
);

router.get(
	'/logs',
	adminRateLimit,
	gamificationAdminController.getSystemLogs.bind(gamificationAdminController)
);

// System configuration
router.get(
	'/config',
	adminRateLimit,
	gamificationAdminController.getSystemConfig.bind(gamificationAdminController)
);

router.put(
	'/config',
	adminRateLimit,
	gamificationAdminController.updateSystemConfig.bind(gamificationAdminController)
);

// Bulk operations (heavily restricted)
router.post(
	'/levels/bulk',
	bulkOperationLimit,
	gamificationAdminController.bulkCreateLevels.bind(gamificationAdminController)
);

router.post(
	'/achievements/bulk',
	bulkOperationLimit,
	gamificationAdminController.bulkCreateAchievements.bind(gamificationAdminController)
);

router.post(
	'/missions/bulk',
	bulkOperationLimit,
	gamificationAdminController.bulkCreateMissions.bind(gamificationAdminController)
);

// Dangerous operations (extra restrictions)
router.post(
	'/reset-user',
	maintenanceLimit,
	gamificationAdminController.resetUserProgress.bind(gamificationAdminController)
);

router.post(
	'/maintenance',
	maintenanceLimit,
	gamificationAdminController.performMaintenance.bind(gamificationAdminController)
);

// Setup and seeding operations
router.post(
	'/seed-defaults',
	bulkOperationLimit,
	gamificationAdminController.seedAllDefaults.bind(gamificationAdminController)
);

export default router;
