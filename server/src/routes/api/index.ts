import { Router } from 'express';
import forumRoutes from '@api/domains/forum/forum.routes';
import shopRoutes from '@api/domains/shop/shop.routes';
import activityRoutes from '@api/domains/activity/routes';
import uploadRoutes from '@api/domains/uploads/upload.routes';
import subscriptionRoutes from '@api/domains/subscriptions/subscription.routes';
import uiRoutes from './ui.routes';
import storeAvatarFrameRoutes from './store/avatar-frames';
import userFramesRoutes from './user/frames';
import shoutboxRoutes from '@api/domains/shoutbox/shoutbox.routes';
import userInventoryRoutes from './user/inventory';
import notificationRoutes from './notifications';
import analyticsRoutes from '@api/domains/analytics/routes/analytics.routes';
import preferencesRoutes from './preferences.routes';

const router: Router = Router();

// Mount forum routes
router.use('/forum', forumRoutes);
router.use('/shoutbox', shoutboxRoutes);

// Mount shop routes
router.use('/shop', shopRoutes);

// Mount activity routes
router.use('/activity', activityRoutes);

// Mount upload routes
router.use('/uploads', uploadRoutes);

// Mount subscription routes
router.use('/subscriptions', subscriptionRoutes);

// Mount UI routes
router.use('/ui', uiRoutes);

// Avatar frame store
router.use('/store/avatar-frames', storeAvatarFrameRoutes);

router.use('/users/me/frames', userFramesRoutes);

// User inventory routes (stub to prevent 404 spam)
router.use('/user', userInventoryRoutes);

// Notification routes (mounted at root level since endpoint starts with /)
router.use('/', notificationRoutes);

// Analytics routes (includes leaderboards)
router.use('/analytics', analyticsRoutes);

// Preferences routes
router.use('/preferences', preferencesRoutes);

export default router;
