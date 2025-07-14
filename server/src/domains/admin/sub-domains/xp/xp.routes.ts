// REFACTORED: Updated auth middleware imports to use canonical path
import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { isAdmin } from '../../../auth/middleware/auth.middleware'; // Correct path to the auth middleware
import * as xpController from './xp.controller';
import * as xpActionsController from './xp-actions.controller';

const router: RouterType = Router();

// --- XP Settings Management (Economy Settings for XP/Clout) ---
// GET /api/admin/xp/settings - Get all XP/Clout related economy settings
router.get('/settings', isAdmin, xpController.getXpSettings);
// POST /api/admin/xp/settings - Update XP/Clout related economy settings
router.post('/settings', isAdmin, xpController.updateXpSettings);

// --- Level Management ---
// GET /api/admin/xp/levels - Get all levels
router.get('/levels', isAdmin, xpController.getLevels);
// POST /api/admin/xp/levels - Create a new level
router.post('/levels', isAdmin, xpController.createLevel);
// PUT /api/admin/xp/levels/:levelNumber - Update an existing level
router.put('/levels/:levelNumber', isAdmin, xpController.updateLevel);
// DELETE /api/admin/xp/levels/:levelNumber - Delete a level
router.delete('/levels/:levelNumber', isAdmin, xpController.deleteLevel);

// --- Badge Management ---
// GET /api/admin/xp/badges - Get all badges
router.get('/badges', isAdmin, xpController.getBadges);
// POST /api/admin/xp/badges - Create a new badge
router.post('/badges', isAdmin, xpController.createBadge);
// PUT /api/admin/xp/badges/:badgeId - Update an existing badge
router.put('/badges/:badgeId', isAdmin, xpController.updateBadge);
// DELETE /api/admin/xp/badges/:badgeId - Delete a badge
router.delete('/badges/:badgeId', isAdmin, xpController.deleteBadge);

// --- Title Management ---
// GET /api/admin/xp/titles - Get all titles
router.get('/titles', isAdmin, xpController.getTitles);
// POST /api/admin/xp/titles - Create a new title
router.post('/titles', isAdmin, xpController.createTitle);
// PUT /api/admin/xp/titles/:titleId - Update an existing title
router.put('/titles/:titleId', isAdmin, xpController.updateTitle);
// DELETE /api/admin/xp/titles/:titleId - Delete a title
router.delete('/titles/:titleId', isAdmin, xpController.deleteTitle);

// --- User XP Adjustment ---
// POST /api/admin/xp/adjust - Adjust a user's XP
router.post('/adjust', isAdmin, xpController.adjustUserXp);
// GET /api/admin/xp/adjustments-log - Get XP adjustment logs for a user or all users
router.get('/adjustments-log', isAdmin, xpController.getXpAdjustmentLogs);

// --- XP Action testing endpoint (admin development only) ---
router.post('/test-action', isAdmin, xpController.testXpActionAward);

// --- XP Actions Management ---
// GET /api/admin/xp/actions - Get all XP actions
router.get('/actions', isAdmin, xpActionsController.getAllXpActions);
// GET /api/admin/xp/actions/:actionKey - Get a specific XP action
router.get('/actions/:actionKey', isAdmin, xpActionsController.getXpActionByKey);
// POST /api/admin/xp/actions - Create a new XP action
router.post('/actions', isAdmin, xpActionsController.createXpAction);
// PUT /api/admin/xp/actions/:actionKey - Update an XP action
router.put('/actions/:actionKey', isAdmin, xpActionsController.updateXpAction);
// POST /api/admin/xp/actions/:actionKey/toggle - Toggle an XP action enabled/disabled
router.post('/actions/:actionKey/toggle', isAdmin, xpActionsController.toggleXpAction);
// POST /api/admin/xp/actions/:actionKey/reset - Reset an XP action to defaults
router.post('/actions/:actionKey/reset', isAdmin, xpActionsController.resetXpAction);

export default router;
