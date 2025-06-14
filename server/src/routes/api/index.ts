import { Router } from 'express';
import forumRoutes from '../../domains/forum/routes/forum.routes';
import shopRoutes from '../../domains/shop/shop.routes';
import activityRoutes from '../../domains/activity/routes';

const router = Router();

// Mount forum routes
router.use('/forum', forumRoutes);

// Mount shop routes
router.use('/shop', shopRoutes);

// Mount activity routes
router.use('/activity', activityRoutes);

export default router;
