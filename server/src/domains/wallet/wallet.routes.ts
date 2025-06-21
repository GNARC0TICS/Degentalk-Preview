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
import { isDevMode } from '../../utils/environment';
import * as walletDevController from './wallet.dev.controller';
import { withdrawalController } from './withdrawal.controller';
import { treasuryController } from './treasury.controller';

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
router.get('/balance', asyncHandler(walletController.getBalance.bind(walletController)));

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

// Public packages list (no auth required)
router.get('/packages', asyncHandler(walletController.listPackages.bind(walletController)));

// Create purchase order for a DGT package
router.post(
	'/purchase-orders',
	asyncHandler(walletController.createPurchaseOrder.bind(walletController))
);

// Withdrawal routes
router.post(
	'/withdraw',
	asyncHandler(withdrawalController.createWithdrawalRequest.bind(withdrawalController))
);

router.get(
	'/withdrawals',
	asyncHandler(withdrawalController.getWithdrawalHistory.bind(withdrawalController))
);

// Admin withdrawal routes
router.get(
	'/admin/withdrawals',
	isAdmin,
	asyncHandler(withdrawalController.getAllWithdrawalRequests.bind(withdrawalController))
);

router.put(
	'/admin/withdrawals/:requestId',
	isAdmin,
	asyncHandler(withdrawalController.processWithdrawalRequest.bind(withdrawalController))
);

// Treasury management routes (admin only)
router.get(
	'/admin/treasury',
	isAdmin,
	asyncHandler(treasuryController.getTreasuryOverview.bind(treasuryController))
);

router.get(
	'/admin/treasury/user/:userId',
	isAdmin,
	asyncHandler(treasuryController.getUserBalanceDetails.bind(treasuryController))
);

router.post(
	'/admin/treasury/adjust',
	isAdmin,
	asyncHandler(treasuryController.adjustUserBalance.bind(treasuryController))
);

router.post(
	'/admin/treasury/airdrop',
	isAdmin,
	asyncHandler(treasuryController.executeBulkAirdrop.bind(treasuryController))
);

router.get(
	'/admin/treasury/analytics',
	isAdmin,
	asyncHandler(treasuryController.getTransactionAnalytics.bind(treasuryController))
);

// Development-only routes
if (isDevMode()) {
	// Initialize wallet for current user
	router.post('/dev/init', asyncHandler(walletDevController.initializeWallet));

	// Top up wallet balance (dev only)
	router.post('/dev/topup', asyncHandler(walletDevController.devTopUp));

	// Get detailed wallet info (dev only)
	router.get('/dev/info', asyncHandler(walletDevController.getDevWalletInfo));

	// Simulate webhook (dev only)
	router.post('/dev/simulate-webhook', asyncHandler(walletDevController.simulateWebhook));

	// Reset wallet (dev only) - disabled by default
	router.post('/dev/reset', asyncHandler(walletDevController.resetWallet));
}

export default router;
