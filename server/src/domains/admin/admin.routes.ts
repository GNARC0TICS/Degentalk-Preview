/**
 * Admin Routes
 *
 * Main router for admin panel API endpoints
 */

import { Router, type Express } from 'express'; // Import Express as type
import { adminController } from './admin.controller';
import { isAdmin, asyncHandler } from './admin.middleware';
import { logger } from '@server/src/core/logger';

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
import shopAdminApiRoutes from './sub-domains/shop/shop.admin.routes';
import userInventoryAdminApiRoutes from './sub-domains/users/inventory.admin.routes';
import emojiRoutes from './sub-domains/emojis/emojis.routes';
import uiConfigRoutes from './sub-domains/ui-config/ui-config.routes';
import rolesRoutes from './sub-domains/roles/roles.routes';
import titlesRoutes from './sub-domains/titles/titles.routes';
import permissionsRoutes from './sub-domains/permissions/permissions.routes';
import devSeedingRoutes from './sub-domains/dev/seeding.routes';
import cloutRoutes from './sub-domains/clout/clout.routes';
import economyRoutes from './sub-domains/economy/economy.routes';
import dgtPackageRoutes from './sub-domains/dgt-packages/dgt-packages.routes';
import animationPackRoutes from './sub-domains/animation-packs/animation-packs.routes';
import avatarFramesRoutes from './sub-domains/avatar-frames/avatar-frames.routes';
import moderatorNotesRoutes from './sub-domains/moderator-notes/moderator-notes.routes';
import brandConfigRoutes from './sub-domains/brand-config/brand.routes';
import socialRoutes from './sub-domains/social/social.routes';
import cacheRoutes from './sub-domains/cache/cache.routes';
import { adminWalletRoutes } from './sub-domains/wallet/wallet.routes';
import { emailTemplateRoutes } from './sub-domains/email-templates/email-templates.routes';
import { backupRestoreRoutes } from './sub-domains/backup-restore/backup-restore.routes';
import { stickerRoutes } from '../collectibles/stickers/stickers.routes';
import subscriptionAdminRoutes from './sub-domains/subscriptions/subscription.admin.routes';
import databaseRoutes from './sub-domains/database/database.routes';
// import userAdminRoutes from './users/users.admin.routes'; // DEPRECATED
// import economyAdminRoutes from './settings/economy.routes'; // Placeholder for future

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
adminRouter.use('/shop-management', shopAdminApiRoutes);
adminRouter.use('/user-inventory', userInventoryAdminApiRoutes);
adminRouter.use('/roles', rolesRoutes);
adminRouter.use('/titles', titlesRoutes);
adminRouter.use('/permissions', permissionsRoutes);
adminRouter.use('/dev', devSeedingRoutes);
adminRouter.use('/clout', cloutRoutes);
adminRouter.use('/economy', economyRoutes);
adminRouter.use('/dgt-packages', dgtPackageRoutes);
adminRouter.use('/animation-packs', animationPackRoutes);
adminRouter.use('/avatar-frames', avatarFramesRoutes);
adminRouter.use('/moderator-notes', moderatorNotesRoutes);
adminRouter.use('/brand-config', brandConfigRoutes);
adminRouter.use('/social', socialRoutes);
adminRouter.use('/cache', cacheRoutes);
adminRouter.use('/wallet', adminWalletRoutes);
adminRouter.use('/email-templates', emailTemplateRoutes);
adminRouter.use('/backup-restore', backupRestoreRoutes);
adminRouter.use('/collectibles', stickerRoutes);
adminRouter.use('/subscriptions', subscriptionAdminRoutes);
adminRouter.use('/database', databaseRoutes);

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
// adminRouter.use('/users', userAdminRoutes); // DEPRECATED - Handled by userRoutes
// economy routes registered above

// Dashboard overview route
adminRouter.get('/dashboard', asyncHandler(adminController.getDashboardStats)); // Corrected method name

// Admin account validation
adminRouter.get('/validate', (req, res) => res.json({ isAdmin: true }));

/**
 * Register admin routes with the Express application
 * @param app Express application or router
 */
export function registerAdminRoutes(app: Express) {
	// Added type for app
	app.use('/api/admin', adminRouter);
}

export default adminRouter;
