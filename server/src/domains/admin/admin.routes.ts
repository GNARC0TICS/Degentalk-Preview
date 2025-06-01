/**
 * Admin Routes
 * 
 * Main router for admin panel API endpoints
 */

import { Router } from 'express';
import { adminController } from './admin.controller';
import { isAdmin, asyncHandler } from './admin.middleware';

// Import sub-domain routes
import userRoutes from './sub-domains/users/users.routes';
import treasuryRoutes from './sub-domains/treasury/treasury.routes';
import reportsRoutes from './sub-domains/reports/reports.routes';
import analyticsRoutes from './sub-domains/analytics/analytics.routes';
import userGroupsRoutes from './sub-domains/user-groups/user-groups.routes';
import forumRoutes from './sub-domains/forum/forum.routes';
import settingsRoutes from './sub-domains/settings/settings.routes';
import xpRoutes from './sub-domains/xp/xp.routes';
import missionsRoutes from '../missions/missions.admin.routes';
import announcementRoutes from './sub-domains/announcements/announcements.routes';
import airdropRoutes from './sub-domains/airdrop/airdrop.routes';

// Create admin router
const adminRouter = Router();

// Apply admin authentication middleware to all routes
adminRouter.use(isAdmin);

// Register sub-domain routes
adminRouter.use('/users', userRoutes);
adminRouter.use('/treasury', treasuryRoutes);
adminRouter.use('/reports', reportsRoutes);
adminRouter.use('/analytics', analyticsRoutes);
adminRouter.use('/user-groups', userGroupsRoutes);
adminRouter.use('/forum', forumRoutes);
adminRouter.use('/settings', settingsRoutes);
adminRouter.use('/xp', xpRoutes);
adminRouter.use('/missions', missionsRoutes);
adminRouter.use('/announcements', announcementRoutes);
adminRouter.use('/airdrop', airdropRoutes);

// Dashboard overview route
adminRouter.get('/dashboard', asyncHandler(adminController.getDashboardOverview));

// Admin account validation
adminRouter.get('/validate', (req, res) => res.json({ isAdmin: true }));

/**
 * Register admin routes with the Express application
 * @param app Express application or router
 */
export function registerAdminRoutes(app) {
  app.use('/api/admin', adminRouter);
}

export default adminRouter;
