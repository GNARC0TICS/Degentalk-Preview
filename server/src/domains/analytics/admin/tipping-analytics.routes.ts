/**
 * Tipping Analytics Routes
 *
 * Defines endpoints for accessing tipping analytics data in the admin dashboard
 */

import express from 'express'
import type { Router as RouterType } from 'express';
import { tippingAnalyticsController } from './tipping-analytics.controller';
import { isAdmin } from '@domains/auth/middleware/auth.middleware';

const router: RouterType = express.Router();

// Apply admin-only middleware to all routes
router.use(isAdmin);

// GET /api/admin/analytics/engagement/tips
router.get('/', tippingAnalyticsController.getTippingAnalytics);

export default router;
