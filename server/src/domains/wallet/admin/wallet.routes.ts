import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { adminWalletController } from './controllers/wallet.controller';
import {
	validateWalletConfig,
	validateDGTTransaction,
	validateUserId
} from './validators/wallet.validators';

const router: RouterType = Router();

/**
 * Admin Wallet Routes
 *
 * Provides endpoints for wallet configuration management and DGT operations.
 * All routes require admin authentication.
 */

// User Financial Profile Routes
router.get('/user-profile/:userId', validateUserId, adminWalletController.getUserFinancialProfile);

// DGT Management Routes
router.get('/dgt/analytics', adminWalletController.getDGTAnalytics);
router.post('/dgt/credit', validateDGTTransaction, adminWalletController.creditDgt);
router.post('/dgt/debit', validateDGTTransaction, adminWalletController.debitDgt);

// Crypto Management Routes
router.post('/crypto/credit', adminWalletController.creditCrypto);
router.post('/crypto/debit', adminWalletController.debitCrypto);

// TODO: Implement these methods in controller
// router.get('/dgt/user/:userId', validateUserId, adminWalletController.getUserDGTInfo);
// router.get('/system/status', adminWalletController.getWalletSystemStatus);

export { router as adminWalletRoutes };
