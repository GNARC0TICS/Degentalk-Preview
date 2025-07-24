/**
 * XP Admin Routes
 *
 * API endpoints for admin-specific XP system management
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
import * as adminXpController from './xp.controller';
import { isAuthenticated, isAdmin } from '@api/domains/auth/middleware/auth.middleware';
import { asyncHandler } from '@core/errors';

const router: RouterType = Router();

// XP adjustments
router.post('/adjust', asyncHandler(adminXpController.adjustUserXp));
router.get('/adjust/history/:userId', asyncHandler(adminXpController.getXpAdjustmentHistory));

// XP actions
router.get('/actions', asyncHandler(adminXpController.getAllXpActions));
router.post('/actions', asyncHandler(adminXpController.createXpAction));
router.put('/actions/:actionKey', asyncHandler(adminXpController.updateXpAction));
router.delete('/actions/:actionKey', asyncHandler(adminXpController.deleteXpAction));

// Levels
router.get('/levels', asyncHandler(adminXpController.getAllLevels));
router.post('/levels', asyncHandler(adminXpController.createLevel));
router.put('/levels/:level', asyncHandler(adminXpController.updateLevel));
router.delete('/levels/:level', asyncHandler(adminXpController.deleteLevel));

// Badges
router.get('/badges', asyncHandler(adminXpController.getAllBadges));
router.post('/badges', asyncHandler(adminXpController.createBadge));
router.put('/badges/:id', asyncHandler(adminXpController.updateBadge));
router.delete('/badges/:id', asyncHandler(adminXpController.deleteBadge));

// Titles
router.get('/titles', asyncHandler(adminXpController.getAllTitles));
router.post('/titles', asyncHandler(adminXpController.createTitle));
router.put('/titles/:id', asyncHandler(adminXpController.updateTitle));
router.delete('/titles/:id', asyncHandler(adminXpController.deleteTitle));

// Stats and metrics
router.get('/stats', asyncHandler(adminXpController.getXpSystemStats));

export default router;
