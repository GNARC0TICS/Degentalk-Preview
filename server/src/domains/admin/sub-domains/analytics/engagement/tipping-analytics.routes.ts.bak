/**
 * Tipping Analytics Routes
 * 
 * Defines endpoints for accessing tipping analytics data in the admin dashboard
 */

import express from 'express';
import { tippingAnalyticsController } from './tipping-analytics.controller';
import { isAdmin } from '../../../../auth/middleware/auth.middleware';

const router = express.Router();

// Apply admin-only middleware to all routes
router.use(isAdmin);

// GET /api/admin/analytics/engagement/tips
router.get('/', tippingAnalyticsController.getTippingAnalytics);

export default router; 