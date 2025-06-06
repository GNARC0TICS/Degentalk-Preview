/**
 * Admin Analytics Routes
 * 
 * Aggregates all analytics-related routes for the admin dashboard
 */

import express, { Router } from 'express';
import { isAuthenticated, isAdmin } from '@server/src/domains/auth/middleware/auth.middleware.js';
import rainAnalyticsRoutes from './engagement/rain-analytics.routes.js';
import tippingAnalyticsRoutes from './engagement/tipping-analytics.routes.js';
import platformStatsRoutes from './routes/stats.routes.js';
import { AdminAnalyticsController } from './analytics.controller.js';
import { validateQuery } from '@server/src/middleware/validate.js';
import { AnalyticsQuerySchema } from './analytics.validators.js';
import hotThreadsRoutes from './routes/hot-threads.routes.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);
router.use(isAdmin);

// Register analytics sub-routes
router.use('/engagement/rain', rainAnalyticsRoutes);
router.use('/engagement/tips', tippingAnalyticsRoutes);
router.use('/platform-stats', platformStatsRoutes);
router.use('/', hotThreadsRoutes);

// Additional analytics routes can be added here
// e.g., router.use('/users', userAnalyticsRoutes);
// e.g., router.use('/forum', forumAnalyticsRoutes);

export default router;
