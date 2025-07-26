/**
 * Admin Routes
 *
 * Main router for admin panel API endpoints
 */

import { Router, type Express } from 'express'
import type { Router as RouterType } from 'express'; // Import Express as type
import { adminController } from './admin.controller';
import { isAdmin, asyncHandler } from './admin.middleware';
import { logger } from '@core/logger';

// Import sub-domain routes
import userRoutes from './sub-domains/users/users.routes';
import treasuryRoutes from './sub-domains/treasury/treasury.routes';
import analyticsRoutes from './sub-domains/analytics/analytics.routes';
import forumRoutes from './sub-domains/forum/forum.routes';
import settingsRoutes from './sub-domains/settings/settings.routes';
import xpRoutes from './sub-domains/xp/xp.routes';
import announcementRoutes from './sub-domains/announcements/announcements.routes';
import shopAdminApiRoutes from './sub-domains/shop/shop.admin.routes';
import userInventoryAdminApiRoutes from './sub-domains/users/inventory.admin.routes';
import emojiRoutes from './sub-domains/emojis/emojis.routes';
import uiConfigRoutes from './sub-domains/settings/ui-config.routes';
import rolesRoutes from './sub-domains/roles/roles.routes';
import titlesRoutes from './sub-domains/titles/titles.routes';
import permissionsRoutes from './sub-domains/permissions/permissions.routes';
import reputationRoutes from '@domains/gamification/reputation.routes';
import economyRoutes from './sub-domains/economy/economy.routes';
import dgtPackageRoutes from './sub-domains/dgt-packages/dgt-packages.routes';
import avatarFramesRoutes from './sub-domains/avatar-frames/avatar-frames.routes';
import brandConfigRoutes from './sub-domains/settings/brand.routes';
import socialRoutes from './sub-domains/social/social.routes';
import cacheRoutes from './sub-domains/cache/cache.routes';
import { adminWalletRoutes } from '@domains/wallet/admin/wallet.routes';
import emailTemplateRoutes from './sub-domains/email-templates/email-templates.routes';
import { backupRestoreRoutes } from './sub-domains/backup-restore/backup-restore.routes';
import { stickerRoutes } from '@domains/collectibles/stickers/stickers.routes';
import subscriptionAdminRoutes from './sub-domains/subscriptions/subscription.admin.routes';
import databaseRoutes from './sub-domains/database/database.routes';
import securityMonitorRoutes from './routes/security-monitor.routes';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

// All admin routes migrated to new domain structure

// Create admin router
const adminRouter: RouterType = Router();

// Apply admin authentication middleware to all routes
adminRouter.use(isAdmin);

// Register sub-domain routes
adminRouter.use('/users', userRoutes);
adminRouter.use('/treasury', treasuryRoutes);
adminRouter.use('/analytics', analyticsRoutes);
adminRouter.use('/forum', forumRoutes);
adminRouter.use('/settings', settingsRoutes);
adminRouter.use('/xp', xpRoutes);
adminRouter.use('/announcements', announcementRoutes);
adminRouter.use('/shop-management', shopAdminApiRoutes);
adminRouter.use('/user-inventory', userInventoryAdminApiRoutes);
adminRouter.use('/roles', rolesRoutes);
adminRouter.use('/titles', titlesRoutes);
adminRouter.use('/permissions', permissionsRoutes);
adminRouter.use('/reputation', reputationRoutes);
adminRouter.use('/economy', economyRoutes);
adminRouter.use('/dgt-packages', dgtPackageRoutes);
adminRouter.use('/avatar-frames', avatarFramesRoutes);
adminRouter.use('/brand-config', brandConfigRoutes);
adminRouter.use('/social', socialRoutes);
adminRouter.use('/cache', cacheRoutes);
adminRouter.use('/wallet', adminWalletRoutes);
adminRouter.use('/email-templates', emailTemplateRoutes);
adminRouter.use('/backup-restore', backupRestoreRoutes);
adminRouter.use('/collectibles', stickerRoutes);
adminRouter.use('/subscriptions', subscriptionAdminRoutes);
adminRouter.use('/database', databaseRoutes);
adminRouter.use('/security', securityMonitorRoutes);

// DEBUG: Middleware to check if /emojis path is reached in adminRouter
adminRouter.use('/emojis', (req, res, next) => {
	logger.debug('AdminRoutes', `Request received for /api/admin${req.url}`, {
		url: req.url,
		method: req.method
	});
	next();
});

adminRouter.use('/emojis', emojiRoutes);
adminRouter.use('/ui-config', uiConfigRoutes);
// All routes properly registered above

// Dashboard overview route
adminRouter.get('/dashboard', asyncHandler(adminController.getDashboardStats)); // Corrected method name

// Admin account validation
adminRouter.get('/validate', (req, res) => {
	sendSuccessResponse(res, { isAdmin: true });
});

/**
 * Register admin routes with the Express application
 * @param app Express application or router
 */
export function registerAdminRoutes(router: Router) {
	// Added type for app
	router.use('/admin', adminRouter);
}

export default adminRouter;
