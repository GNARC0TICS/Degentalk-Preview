import { Router } from 'express';
import { isAdmin } from '../../admin.middleware';
import { getEconomyConfig, updateEconomyConfig, resetEconomyConfig } from './economy.controller';

const router = Router();

router.get('/config', isAdmin, getEconomyConfig);
router.put('/config', isAdmin, updateEconomyConfig);
router.delete('/config', isAdmin, resetEconomyConfig);

export default router;
