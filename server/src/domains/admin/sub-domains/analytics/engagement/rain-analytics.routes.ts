/**
 * Rain Analytics Routes
 *
 * Defines endpoints for accessing rain analytics data in the admin dashboard
 */

import express from 'express';
import { rainAnalyticsController } from './rain-analytics.controller';
import { isAdmin } from '../../../../auth/middleware/auth.middleware';

const router = express.Router();

// Apply admin-only middleware to all routes
router.use(isAdmin);

// GET /api/admin/analytics/engagement/rain
router.get('/', rainAnalyticsController.getRainAnalytics);

export default router;
