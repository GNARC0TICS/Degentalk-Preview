/**
 * Admin Titles Routes
 * 
 * Bridge to gamification domain titles management
 */

import { Router } from 'express';
import { titlesRoutes } from '@domains/gamification';

const router = Router();

// Forward all title management to gamification domain
router.use('/', titlesRoutes);

export default router;