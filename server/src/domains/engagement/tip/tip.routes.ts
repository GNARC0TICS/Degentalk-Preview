/**
 * Tip Routes
 *
 * This file registers all routes related to tipping functionality.
 *
 * // [REFAC-TIP]
 */

import express from 'express';
import { tipController } from './tip.controller';
import { isAuthenticated as requireAuth } from '@server/domains/auth/middleware/auth.middleware';
import { isAdmin as requireAdmin } from '@server/domains/auth/middleware/auth.middleware';
import { validateRequest } from '@server-middleware/validate-request';
import { z } from 'zod';

// Create the router
const router = express.Router();

// Apply authentication to all routes
router.use(requireAuth);

// Define validation schemas
const tipSchema = z.object({
	toUserId: z.string().uuid('Recipient ID must be a valid UUID'),
	amount: z.number().positive('Amount must be positive'),
	reason: z.string().optional(),
	source: z.string().default('forum')
});

const tipSettingsSchema = z.object({
	minAmount: z.number().min(1).optional(),
	maxAmount: z.number().positive().optional(),
	cooldownMinutes: z.number().min(0).optional(),
	burnPercentage: z.number().min(0).max(100).optional()
});

// POST /api/engagement/tip - Send a tip to another user
router.post('/', validateRequest(tipSchema), tipController.sendTip);

// GET /api/engagement/tip/history - Get tip history for the authenticated user
router.get('/history', tipController.getTipHistory);

// GET /api/engagement/tip/leaderboard - Get tip leaderboard
router.get('/leaderboard', tipController.getTipLeaderboard);

// GET /api/engagement/tip/settings - Get tip settings
router.get('/settings', tipController.getTipSettings);

// PATCH /api/engagement/tip/settings - Update tip settings (admin only)
router.patch(
	'/settings',
	requireAdmin,
	validateRequest(tipSettingsSchema),
	tipController.updateTipSettings
);

export default router;
