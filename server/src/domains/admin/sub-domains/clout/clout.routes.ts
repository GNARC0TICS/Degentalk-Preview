import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { isAdmin } from '../../../auth/middleware/auth.middleware';
import * as cloutController from './clout.controller';

const router: RouterType = Router();

// ----------------- Achievements -----------------
router.get('/achievements', isAdmin, cloutController.getAllAchievements);
router.get('/achievements/:id', isAdmin, cloutController.getAchievementById);
router.post('/achievements', isAdmin, cloutController.createAchievement);
router.put('/achievements/:id', isAdmin, cloutController.updateAchievement);
router.delete('/achievements/:id', isAdmin, cloutController.deleteAchievement);
router.post('/achievements/:id/toggle', isAdmin, cloutController.toggleAchievement);

// ----------------- Grants & Logs -----------------
router.post('/grants', isAdmin, cloutController.grantClout);
router.get('/logs', isAdmin, cloutController.getCloutLogs);

// ----------------- Enhanced Clout Adjustments -----------------
router.post('/adjust', isAdmin, cloutController.adjustClout);
router.get('/adjustment-logs', isAdmin, cloutController.getCloutAdjustmentLogs);

export default router;
