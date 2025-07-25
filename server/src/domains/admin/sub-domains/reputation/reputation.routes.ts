import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { isAdmin } from '../../../auth/middleware/auth.middleware';
import * as reputationController from './reputation.controller';

const router: RouterType = Router();

// ----------------- Achievements -----------------
router.get('/achievements', isAdmin, reputationController.getAllAchievements);
router.get('/achievements/:id', isAdmin, reputationController.getAchievementById);
router.post('/achievements', isAdmin, reputationController.createAchievement);
router.put('/achievements/:id', isAdmin, reputationController.updateAchievement);
router.delete('/achievements/:id', isAdmin, reputationController.deleteAchievement);
router.post('/achievements/:id/toggle', isAdmin, reputationController.toggleAchievement);

// ----------------- Grants & Logs -----------------
router.post('/grants', isAdmin, reputationController.grantReputation);
router.get('/logs', isAdmin, reputationController.getReputationLogs);

// ----------------- Enhanced Reputation Adjustments -----------------
router.post('/adjust', isAdmin, reputationController.adjustReputation);
router.get('/adjustment-logs', isAdmin, reputationController.getReputationAdjustmentLogs);

export default router;
