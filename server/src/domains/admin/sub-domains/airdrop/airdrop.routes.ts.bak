import { Router } from 'express';
import { isAdmin } from '../../../auth/middleware/auth.middleware'; // Adjust path as needed
import * as airdropController from './airdrop.controller';

const router = Router();

// POST /api/admin/airdrop - Execute an airdrop
router.post('/', isAdmin, airdropController.executeAirdrop);

// TODO: Add GET route for fetching airdrop history if implementing that feature
// router.get('/history', isAdmin, airdropController.getAirdropHistory);

export default router; 