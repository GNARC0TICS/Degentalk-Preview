import { Router } from 'express';
import { adminWalletController } from './wallet.controller';
import { validateWalletConfig, validateDGTTransaction, validateUserId } from './wallet.validators';

const router = Router();

/**
 * Admin Wallet Routes
 *
 * Provides endpoints for wallet configuration management and DGT operations.
 * All routes require admin authentication.
 */

// Wallet Configuration Routes
router.get('/config', adminWalletController.getWalletConfig);
router.put('/config', validateWalletConfig, adminWalletController.updateWalletConfig);
router.post('/config/reset', adminWalletController.resetWalletConfig);

// DGT Management Routes
router.get('/dgt/analytics', adminWalletController.getDGTAnalytics);
router.post('/dgt/credit', validateDGTTransaction, adminWalletController.creditDGTToUser);
router.post('/dgt/debit', validateDGTTransaction, adminWalletController.debitDGTFromUser);
router.get('/dgt/user/:userId', validateUserId, adminWalletController.getUserDGTInfo);

// System Status Routes
router.get('/system/status', adminWalletController.getWalletSystemStatus);

export { router as adminWalletRoutes };
