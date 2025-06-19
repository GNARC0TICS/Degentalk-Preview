import { Router } from 'express';
import { isAdmin } from '../../auth/middleware/auth.middleware';
import { getEconomyConfig, updateEconomyConfig } from './economy.controller';

const router = Router();

router.get('/config', isAdmin, getEconomyConfig);
router.put('/config', isAdmin, updateEconomyConfig);

export default router;
