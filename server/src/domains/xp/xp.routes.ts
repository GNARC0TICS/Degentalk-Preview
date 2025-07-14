// REFACTORED: Updated auth middleware imports to use canonical path
/**
 * XP Routes
 *
 * API endpoints for XP-related functionality
 */

import { Router } from 'express';
import { authenticateJWT } from '@server/middleware/authenticate-jwt';
import * as xpController from './xp.controller';

const router = Router();

// Route to award XP for a specific action (e.g., creating a thread)
router.post('/award-action', authenticateJWT, xpController.awardActionXp);

// Route to award XP for an action (test/development endpoint - consider renaming or removing if redundant with award-action)
router.post('/award', authenticateJWT, xpController.awardXpForAction);

// Route to get user XP info
router.get('/user/:userId', authenticateJWT, xpController.getUserXpInfo);

// Route to get all available XP actions
router.get('/actions', authenticateJWT, xpController.getXpActions);

// Route to get user XP action logs with filtering
router.get('/logs/:userId?', authenticateJWT, xpController.getUserXpLogs);

export default router;
