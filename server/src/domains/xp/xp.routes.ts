// REFACTORED: Updated auth middleware imports to use canonical path
/**
 * XP Routes
 *
 * API endpoints for XP-related functionality
 */

import { Router } from 'express';
import { isAuthenticated } from '@server/domains/auth/middleware/auth.middleware';
import * as xpController from './xp.controller';

const router = Router();

// Route to award XP for a specific action (e.g., creating a thread)
router.post('/award-action', isAuthenticated, xpController.awardActionXp);

// Route to award XP for an action (test/development endpoint - consider renaming or removing if redundant with award-action)
router.post('/award', isAuthenticated, xpController.awardXpForAction);

// Route to get user XP info
router.get('/user/:userId', isAuthenticated, xpController.getUserXpInfo);

// Route to get all available XP actions
router.get('/actions', isAuthenticated, xpController.getXpActions);

// Route to get user XP action logs with filtering
router.get('/logs/:userId?', isAuthenticated, xpController.getUserXpLogs);

export default router;
