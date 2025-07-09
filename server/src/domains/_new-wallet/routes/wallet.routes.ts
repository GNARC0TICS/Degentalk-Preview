/**
 * Wallet Routes
 * 
 * API routes for wallet operations
 * Includes authentication, validation, and rate limiting
 */

import { Router } from 'express';
import { walletController } from '../controllers/wallet.controller';
import { walletValidation } from '../validation/wallet.validation';
import { validateRequest } from '../../../core/middleware/validate-request';
import { requireAuth } from '../../../core/middleware/auth';
import { rateLimit } from '../../../core/middleware/rate-limit';

const router = Router();

/**
 * Apply authentication to all wallet routes
 */
router.use(requireAuth);

/**
 * GET /api/wallet/balance
 * Get user's wallet balance
 */
router.get(
  '/balance',
  rateLimit({ windowMs: 60 * 1000, max: 30 }), // 30 requests per minute
  walletController.getBalance.bind(walletController)
);

/**
 * POST /api/wallet/deposit-address
 * Create deposit address for cryptocurrency
 */
router.post(
  '/deposit-address',
  rateLimit({ windowMs: 60 * 1000, max: 10 }), // 10 requests per minute
  validateRequest(walletValidation.createDepositAddress),
  walletController.createDepositAddress.bind(walletController)
);

/**
 * POST /api/wallet/withdraw
 * Request cryptocurrency withdrawal
 */
router.post(
  '/withdraw',
  rateLimit({ windowMs: 60 * 1000, max: 5 }), // 5 requests per minute (strict)
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
 * POST /api/wallet/transfer-dgt
 * Transfer DGT between users
 */
router.post(
  '/transfer-dgt',
  rateLimit({ windowMs: 60 * 1000, max: 10 }), // 10 requests per minute
  validateRequest(walletValidation.dgtTransfer),
  walletController.transferDgt.bind(walletController)
);

/**
 * GET /api/wallet/config
 * Get public wallet configuration (no auth required)
 */
router.get(
  '/config',
  rateLimit({ windowMs: 60 * 1000, max: 60 }), // 60 requests per minute
  walletController.getWalletConfig.bind(walletController)
);

/**
 * POST /api/wallet/webhook/:provider
 * Process webhook from payment provider (no auth required)
 */
router.post(
  '/webhook/:provider',
  rateLimit({ windowMs: 60 * 1000, max: 100 }), // 100 requests per minute
  validateRequest(walletValidation.webhook),
  walletController.processWebhook.bind(walletController)
);

export { router as walletRoutes };