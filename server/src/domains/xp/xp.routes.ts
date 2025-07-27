// REFACTORED: Updated auth middleware imports to use canonical path
/**
 * XP Routes
 *
 * API endpoints for XP-related functionality
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { authenticateJWT } from '@middleware/authenticate-jwt';
import * as xpController from './xp.controller';
import dailyBonusRoutes from './routes/daily-bonus.routes';

const router: RouterType = Router();

// Route to award XP for a specific action (e.g., creating a thread)
router.post('/award-action', authenticateJWT, xpController.awardActionXp);

// Route to get user XP info
router.get('/user/:userId', authenticateJWT, xpController.getUserXpInfo);

// Route to get all available XP actions
router.get('/actions', authenticateJWT, xpController.getXpActions);

// Route to get user XP action logs with filtering
router.get('/logs/:userId?', authenticateJWT, xpController.getUserXpLogs);

// Daily bonus routes (MVP engagement feature)
router.use('/daily-bonus', dailyBonusRoutes);

export default router;
