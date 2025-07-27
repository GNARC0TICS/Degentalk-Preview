/**
 * Wallet Routes
 *
 * API routes for wallet operations
 * Includes authentication, validation, and rate limiting
 */

import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { walletController } from '../controllers/wallet.controller';
import { walletValidation } from '../validation/wallet.validation';
import { validateRequest } from '@middleware/validate-request';
import { authenticateJWT as requireAuth } from '@middleware/authenticate-jwt';
import { createCustomRateLimiter as rateLimit } from '@core/services/rate-limit.service';
import webhookRoutes from '../webhooks/ccpayment-webhook.routes';
import {
	depositRateLimit,
	withdrawalRateLimit,
	transferRateLimit,
	balanceCheckRateLimit,
	globalWalletRateLimit
} from '../middleware/rate-limit.middleware';

const router: RouterType = Router();
const publicRouter: RouterType = Router();

/**
 * GET /api/wallet/supported-coins
 * Get list of supported coins
 */
publicRouter.get(
	'/supported-coins',
	rateLimit({ windowMs: 60 * 1000, max: 60 }), // 60 requests per minute
	walletController.getSupportedCoins.bind(walletController)
);

/**
 * GET /api/wallet/token-info/:coinId
 * Get info for a single supported coin
 */
publicRouter.get(
	'/token-info/:coinId',
	rateLimit({ windowMs: 60 * 1000, max: 60 }), // 60 requests per minute
	validateRequest(walletValidation.getTokenInfo),
	walletController.getTokenInfo.bind(walletController)
);

/**
 * GET /api/wallet/config
 * Get public wallet configuration (no auth required)
 */
publicRouter.get(
	'/config',
	rateLimit({ windowMs: 60 * 1000, max: 60 }), // 60 requests per minute
	walletController.getWalletConfig.bind(walletController)
);

/**
 * POST /api/wallet/webhook/:provider
 * Process webhook from payment provider (no auth required)
 */
publicRouter.post(
	'/webhook/:provider',
	rateLimit({ windowMs: 60 * 1000, max: 100 }), // 100 requests per minute
	validateRequest(walletValidation.webhook),
	walletController.processWebhook.bind(walletController)
);

// Apply public routes
router.use(publicRouter);

/**
 * Apply authentication to all subsequent wallet routes
 */
router.use(requireAuth);

/**
 * Apply global wallet rate limiting as a safety net
 */
router.use(globalWalletRateLimit);

/**
 * GET /api/wallet/balance
 * Get user's wallet balance
 */
router.get(
	'/balance',
	balanceCheckRateLimit, // 30 requests per minute with user-based rate limiting
	walletController.getBalance.bind(walletController)
);

/**
 * GET /api/wallet/deposit-addresses
 * Get all deposit addresses for a user
 */
router.get(
	'/deposit-addresses',
	rateLimit({ windowMs: 60 * 1000, max: 20 }), // 20 requests per minute
	walletController.getDepositAddresses.bind(walletController)
);

/**
 * POST /api/wallet/deposit-address
 * Create deposit address for cryptocurrency
 */
router.post(
	'/deposit-address',
	depositRateLimit, // 10 deposits per minute with user-based rate limiting
	validateRequest(walletValidation.createDepositAddress),
	walletController.createDepositAddress.bind(walletController)
);

/**
 * POST /api/wallet/withdraw
 * Request cryptocurrency withdrawal
 */
router.post(
	'/withdraw',
	withdrawalRateLimit, // 3 withdrawals per 5 minutes with user-based rate limiting
	validateRequest(walletValidation.withdrawal),
	walletController.requestWithdrawal.bind(walletController)
);

/**
 * GET /api/wallet/transactions
 * Get paginated transaction history
 */
router.get(
	'/transactions',
	rateLimit({ windowMs: 60 * 1000, max: 20 }), // 20 requests per minute
	validateRequest(walletValidation.transactionHistory),
	walletController.getTransactionHistory.bind(walletController)
);

/**
 * POST /api/wallet/purchase-dgt
 * Purchase DGT with cryptocurrency
 */
router.post(
	'/purchase-dgt',
	depositRateLimit, // 10 purchases per minute with user-based rate limiting
	validateRequest(walletValidation.purchaseDgt),
	walletController.purchaseDgt.bind(walletController)
);

/**
 * POST /api/wallet/transfer-dgt
 * Transfer DGT between users
 */
router.post(
	'/transfer-dgt',
	transferRateLimit, // 5 transfers per minute with user-based rate limiting
	validateRequest(walletValidation.dgtTransfer),
	walletController.transferDgt.bind(walletController)
);

/**
 * POST /api/wallet/validate-address
 * Validate a crypto address for a given chain
 */
router.post(
	'/validate-address',
	rateLimit({ windowMs: 60 * 1000, max: 30 }), // 30 requests per minute
	validateRequest(walletValidation.validateAddress),
	walletController.validateAddress.bind(walletController)
);

/**
 * POST /api/wallet/initialize
 * Initialize a new user's wallet
 */
router.post(
	'/initialize',
	rateLimit({ windowMs: 5 * 60 * 1000, max: 5 }), // 5 requests per 5 minutes, strict
	walletController.initializeWallet.bind(walletController)
);

/**
 * POST /api/wallet/swap
 * Swap one cryptocurrency for another.
 */
router.post(
	'/swap',
	rateLimit({ windowMs: 60 * 1000, max: 10 }), // 10 requests per minute
	validateRequest(walletValidation.swapCrypto),
	walletController.swapCrypto.bind(walletController)
);

/**
 * POST /api/wallet/get-withdraw-fee
 * Get withdrawal fee for a specific coin and chain.
 */
router.post(
	'/get-withdraw-fee',
	rateLimit({ windowMs: 60 * 1000, max: 30 }), // 30 requests per minute
	validateRequest(walletValidation.getWithdrawFee),
	walletController.getWithdrawFee.bind(walletController)
);

/**
 * GET /api/wallet/admin/deposit-config
 * Get current deposit configuration (admin only)
 */
router.get(
	'/admin/deposit-config',
	rateLimit({ windowMs: 60 * 1000, max: 10 }), // 10 requests per minute
	walletController.getAdminDepositConfig.bind(walletController)
);

/**
 * POST /api/wallet/admin/deposit-config
 * Update deposit configuration (admin only, immutable)
 */
router.post(
	'/admin/deposit-config',
	rateLimit({ windowMs: 60 * 1000, max: 5 }), // 5 requests per minute (strict)
	validateRequest(walletValidation.walletAdminPatch),
	walletController.updateAdminDepositConfig.bind(walletController)
);

// Mount webhook routes at /webhooks
router.use('/webhooks', webhookRoutes);

export default router;
