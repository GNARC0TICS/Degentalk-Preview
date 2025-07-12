import { Router } from 'express';
import { 
	getLevels, 
	createLevel, 
	updateLevel, 
	adjustUserXp, 
	getXpAdjustmentLogs, 
	testXpActionAward 
} from './controllers/xp.controller';

const router = Router();

// XP Level Management
router.get('/xp/levels', getLevels);
router.post('/xp/levels', createLevel);
router.put('/xp/levels/:levelNumber', updateLevel);

// XP User Management
router.post('/xp/adjust', adjustUserXp);
router.get('/xp/logs', getXpAdjustmentLogs);

// Development/Testing
router.post('/xp/test-action', testXpActionAward);

export default router;