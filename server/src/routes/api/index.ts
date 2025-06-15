import { Router } from 'express';
import forumRoutes from '../../domains/forum/routes/forum.routes';
import shopRoutes from '../../domains/shop/shop.routes';
import activityRoutes from '../../domains/activity/routes';
import uploadRoutes from '../../domains/uploads/upload.routes';
import uiRoutes from './ui.routes';

const router = Router();

// Mount forum routes
router.use('/forum', forumRoutes);

// Mount shop routes
router.use('/shop', shopRoutes);

// Mount activity routes
router.use('/activity', activityRoutes);

// Mount upload routes
router.use('/uploads', uploadRoutes);

// Mount UI routes
router.use('/ui', uiRoutes);

export default router;
