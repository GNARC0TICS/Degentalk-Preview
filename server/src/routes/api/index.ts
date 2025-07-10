import { Router } from 'express';
import forumRoutes from '../../domains/forum/forum.routes';
import shopRoutes from '../../domains/shop/shop.routes';
import activityRoutes from '../../domains/activity/routes';
import uploadRoutes from '../../domains/uploads/upload.routes';
import subscriptionRoutes from '../../domains/subscriptions/subscription.routes';
import uiRoutes from './ui.routes';
import storeAvatarFrameRoutes from './store/avatar-frames';
import userFramesRoutes from './user/frames';
import shoutboxRoutes from '../../domains/shoutbox/shoutbox.routes';

const router = Router();

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

export default router;
