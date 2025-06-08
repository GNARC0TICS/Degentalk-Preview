// REFACTORED: Updated auth middleware imports to use canonical path
/**
 * Wallet Routes
 * 
 * [REFAC-WALLET]
 * 
 * This file defines API routes for wallet functionality including:
 * - Balance checking
 * - DGT operations
 * - CCPayment integration
 * - Transaction history
 */

import { Router } from 'express';
import { WalletController } from './wallet.controller';
import { validateRequest, WalletRequestSchemas } from './wallet.validators';
import { isAuthenticated, isAdmin } from '../auth/middleware/auth.middleware'; // Removed isSelfOrAdmin
import { asyncHandler } from '../../core/errors';
import { 
  validateTransferDgt, 
  validateCreateDepositAddress,
  validateDgtPurchase
} from './wallet.validators';

// Instantiate controller
const walletController = new WalletController();

// Create router
const router = Router();

// Apply auth middleware to all wallet routes
router.use(isAuthenticated);

/**
 * @route GET /api/wallet/balance
 * @desc Get user's wallet balance (DGT and crypto)
 * @access Private
 */
router.get(
  '/balance',
  asyncHandler(walletController.getBalance.bind(walletController))
);

/**
 * @route GET /api/wallet/transactions
 * @desc Get user's transaction history
 * @access Private
 */
router.get(
  '/transactions',
  asyncHandler(walletController.getTransactionHistory.bind(walletController))
);

/**
 * @route POST /api/wallet/deposit-address
 * @desc Create a deposit address for crypto
 * @access Private
 */
router.post(
  '/deposit-address',
  validateCreateDepositAddress,
  asyncHandler(walletController.createDepositAddress.bind(walletController))
);

/**
 * @route POST /api/wallet/dgt-purchase
 * @desc Create a DGT purchase order
 * @access Private
 */
router.post(
  '/dgt-purchase',
  validateDgtPurchase,
  asyncHandler(walletController.createDgtPurchase.bind(walletController))
);

/**
 * @route GET /api/wallet/purchase/:orderId
 * @desc Get DGT purchase order status
 * @access Private
 */
router.get(
  '/purchase/:orderId',
  asyncHandler(walletController.getPurchaseOrderStatus.bind(walletController))
);

/**
 * @route POST /api/wallet/transfer
 * @desc Transfer DGT to another user
 * @access Private
 */
router.post(
  '/transfer',
  validateTransferDgt,
  asyncHandler(walletController.transferDgt.bind(walletController))
);

/**
 * @route GET /api/wallet/currencies
 * @desc Get supported cryptocurrencies
 * @access Private
 */
router.get(
  '/currencies',
  asyncHandler(walletController.getSupportedCurrencies.bind(walletController))
);

// --- DGT Rewards & Internal Transactions ---
router.post('/transactions/create', walletController.createDgtRewardTransaction);

export default router;
