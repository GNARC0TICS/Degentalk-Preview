/**
 * Admin Analytics Routes
 *
 * Aggregates all analytics-related routes for the admin dashboard
 */

import express from 'express';
import { isAuthenticated, isAdmin } from '@server/domains/auth/middleware/auth.middleware';
import rainAnalyticsRoutes from './rain-analytics.routes';
import tippingAnalyticsRoutes from './tipping-analytics.routes';
import platformStatsRoutes from './stats.routes';
// import { systemAnalyticsRoutes } from './system-analytics.routes';
import { Router } from 'express';
import { AdminAnalyticsController } from './analytics.controller';
import { validateQuery } from '@server-middleware/validate';
import { AnalyticsQuerySchema } from './analytics.validators';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);
router.use(isAdmin);

// Register analytics sub-routes
router.use('/engagement/rain', rainAnalyticsRoutes);
router.use('/engagement/tips', tippingAnalyticsRoutes);
router.use('/platform-stats', platformStatsRoutes);
// router.use('/system', systemAnalyticsRoutes);

// Additional analytics routes can be added here
// e.g., router.use('/users', userAnalyticsRoutes);
// e.g., router.use('/forum', forumAnalyticsRoutes);

export default router;
