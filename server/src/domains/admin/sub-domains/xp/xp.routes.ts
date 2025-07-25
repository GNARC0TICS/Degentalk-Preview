/**
 * XP Bridge Routes
 * 
 * Forwards to gamification domain's XP admin routes
 */

import { Router } from 'express';

// Import the moved XP routes from gamification domain
import xpAdminRoutes from '@api/domains/gamification/admin/xp.routes';

const router = Router();

// Forward all XP management to gamification domain
router.use('/', xpAdminRoutes);

export default router;