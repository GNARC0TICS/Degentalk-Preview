import { Router } from 'express';
import forumRoutes from '../../domains/forum/routes/forum.routes';

const router = Router();

// Mount forum routes
router.use('/forum', forumRoutes);

export default router; 