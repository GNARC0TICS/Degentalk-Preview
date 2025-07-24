// REFACTORED: Updated auth middleware imports to use canonical path
/**
 * Rain Routes
 *
 * This file registers all routes related to rain functionality.
 * Rain is a feature where users can distribute tokens to multiple active users at once.
 *
 * // [REFAC-RAIN]
 */

import express from 'express'
import type { Router as RouterType } from 'express';
import { rainController } from './rain.controller';
import { authenticateJWT as requireAuth } from '@api/middleware/authenticate-jwt';
import { isAdmin as requireAdmin } from '@api/domains/auth/middleware/auth.middleware';
import { validateRequest } from '@api/middleware/validate-request';
import { z } from 'zod';

// Create the router
const router: RouterType = express.Router();

// Apply authentication to all routes
router.use(requireAuth);

// Define validation schemas
const rainSchema = z.object({
	amount: z.number().positive('Amount must be positive'),
	eligibleUserCount: z.number().positive().default(10),
	channel: z.string().default('general'),
	message: z.string().optional()
});

const rainSettingsSchema = z.object({
	minAmount: z.number().min(1).optional(),
	maxAmount: z.number().positive().optional(),
	minEligibleUsers: z.number().min(1).optional(),
	maxEligibleUsers: z.number().min(1).optional(),
	activityWindowMinutes: z.number().min(1).optional(),
	cooldownMinutes: z.number().min(0).optional()
});

// POST /api/engagement/rain - Process a rain distribution
router.post('/', validateRequest(rainSchema), rainController.processRain);

// GET /api/engagement/rain/recent - Get recent rain events
router.get('/recent', rainController.getRecentRainEvents);

// GET /api/engagement/rain/settings - Get rain settings
router.get('/settings', rainController.getRainSettings);

// PATCH /api/engagement/rain/settings - Update rain settings (admin only)
router.patch(
	'/settings',
	requireAdmin,
	validateRequest(rainSettingsSchema),
	rainController.updateRainSettings
);

export default router;
