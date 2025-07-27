/**
 * Admin Wallet API Routes (v2)
 *
 * Defines the secure API endpoints for all administrative actions
 * related to the wallet system.
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { adminWalletController } from '../controllers/wallet.controller';
import { requireAdmin } from '@middleware/auth.unified';

const router: RouterType = Router();

// All routes in this file are protected and require admin privileges.
router.use(requireAdmin);

// --- Unified User Financial Profile ---
router.get('/user-profile/:userId', adminWalletController.getUserFinancialProfile);

// --- DGT Ledger Actions ---
router.post('/dgt/credit', adminWalletController.creditDgt);
router.post('/dgt/debit', adminWalletController.debitDgt);

// --- Crypto Ledger Actions ---
router.post('/crypto/credit', adminWalletController.creditCrypto);
router.post('/crypto/debit', adminWalletController.debitCrypto);

// --- Analytics ---
router.get('/analytics/dgt', adminWalletController.getDGTAnalytics);

export const adminWalletRoutes = router;
