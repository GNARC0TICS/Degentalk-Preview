/**
 * Admin Treasury Routes
 * 
 * Defines API routes for treasury management in the admin panel.
 */

import { Router } from 'express';
import { adminTreasuryController } from './treasury.controller';
import { asyncHandler } from '../../admin.middleware'; // Assuming isAdmin is applied at a higher level or not needed for these specific routes if they are admin-only by structure

const router = Router();

// DGT Supply Statistics
router.get('/dgt-supply', asyncHandler(adminTreasuryController.getDgtSupplyStats.bind(adminTreasuryController)));

// Send DGT from Treasury to a user
router.post('/send', asyncHandler(adminTreasuryController.sendFromTreasury.bind(adminTreasuryController)));

// Recover DGT from a user to Treasury
router.post('/recover', asyncHandler(adminTreasuryController.recoverToTreasury.bind(adminTreasuryController)));

// Mass send DGT (Airdrop)
router.post('/mass-send', asyncHandler(adminTreasuryController.massAirdrop.bind(adminTreasuryController)));

// Treasury Settings
router.get('/settings', asyncHandler(adminTreasuryController.getTreasurySettings.bind(adminTreasuryController)));
router.put('/settings', asyncHandler(adminTreasuryController.updateTreasurySettings.bind(adminTreasuryController)));

export default router;
