import { Router } from 'express';
import { mentionsRoutes } from './mentions.routes';
import { followsRoutes } from './follows.routes';
import { friendsRoutes } from './friends.routes';

const router = Router();

// Mount sub-routers
router.use('/mentions', mentionsRoutes);
router.use('/follows', followsRoutes);
router.use('/friends', friendsRoutes);

export { router as socialRoutes };
