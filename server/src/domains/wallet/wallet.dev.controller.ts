import { userService } from '@server/src/core/services/user.service';
import { EconomyTransformer } from '../economy/transformers/economy.transformer';
import { 
	toPublicList,
	sendSuccessResponse,
	sendErrorResponse,
	sendTransformedResponse
} from '@server/src/core/utils/transformer.helpers';
/**
 * Development endpoints for wallet testing
 * These are only available in development mode
 */

import type { Request, Response, NextFunction } from 'express';
import { walletService } from './wallet.service';
import { dgtService } from './dgt.service';
import { ccpaymentService } from './ccpayment.service';
import { logger } from '../../core/logger';
import { walletConfig } from '@shared/wallet.config';
import { isDevMode } from '../../utils/environment';
import { z } from 'zod';

// Validation schemas
const topUpSchema = z.object({
	amount: z.number().positive().max(10000),
	token: z.enum(['DGT', 'USDT']).default('DGT')
});

const simulateWebhookSchema = z.object({
	orderId: z.string(),
	status: z.enum(['completed', 'failed']).default('completed'),
	amount: z.string().optional(),
	txHash: z.string().optional()
});

/**
 * Initialize wallet for current user (dev only)
 */
export async function initializeWallet(req: Request, res: Response, next: NextFunction) {
	try {
		if (!isDevMode() || !walletConfig.DEV_MODE.ALLOW_DEV_TOPUP) {
			return sendErrorResponse(res, 'This endpoint is only available in development mode', 403);
		}

		const userId = userService.getUserFromRequest(req)?.id;
		if (!userId) {
			return sendErrorResponse(res, 'User not authenticated', 401);
		}

		// Initialize DGT wallet
		await dgtService.initializeUserWallet(userId);

		// Initialize CCPayment wallet
		const ccpaymentId = await walletService.ensureCcPaymentWallet(userId);

		logger.info('WalletDevController', 'Initialized wallets for user', { userId, ccpaymentId });

		sendSuccessResponse(res, {
			message: 'Wallets initialized successfully',
			ccpaymentId
		});
	} catch (error) {
		logger.error('WalletDevController', 'Error initializing wallet', {
			error: error instanceof Error ? error.message : String(error),
			userId: userService.getUserFromRequest(req)?.id
		});
		next(error);
	}
}

/**
 * Top up wallet balance (dev only)
 */
export async function devTopUp(req: Request, res: Response, next: NextFunction) {
	try {
		if (!isDevMode() || !walletConfig.DEV_MODE.ALLOW_DEV_TOPUP) {
			return sendErrorResponse(res, 'This endpoint is only available in development mode', 403);
		}

		const userId = userService.getUserFromRequest(req)?.id;
		if (!userId) {
			return sendErrorResponse(res, 'User not authenticated', 401);
		}

		const { amount, token } = topUpSchema.parse(req.body);

		if (token === 'DGT') {
			// Top up DGT balance
			const dgtAmount = BigInt(Math.floor(amount * 100000000)); // Convert to smallest unit
			await dgtService.addDGT(userId, dgtAmount, 'dev_topup', 'Development top-up');

			logger.info('WalletDevController', 'DGT top-up completed', { userId, amount });

			sendSuccessResponse(res, {
				message: `Added ${amount} DGT to your wallet`,
				newBalance: EconomyTransformer.toAuthenticatedDgtBalance(await dgtService.getUserBalance(userId), userService.getUserFromRequest(req))
			});
		} else {
			// For USDT, we would simulate a deposit via CCPayment webhook
			sendSuccessResponse(res, {
				message: 'USDT top-up not implemented yet. Use the simulate webhook endpoint instead.',
				success: false
			});
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			return sendErrorResponse(res, 'Invalid request', 400);
		}
		logger.error('WalletDevController', 'Error in dev top-up', {
			error: error instanceof Error ? error.message : String(error),
			userId: userService.getUserFromRequest(req)?.id
		});
		next(error);
	}
}

/**
 * Get dev wallet info (dev only)
 */
export async function getDevWalletInfo(req: Request, res: Response, next: NextFunction) {
	try {
		if (!isDevMode()) {
			return sendErrorResponse(res, 'This endpoint is only available in development mode', 403);
		}

		const userId = userService.getUserFromRequest(req)?.id;
		if (!userId) {
			return sendErrorResponse(res, 'User not authenticated', 401);
		}

		const wallet = await walletService.getUserWallet(userId);
		const transactions = await walletService.getTransactionHistory(userId, 10);

		sendSuccessResponse(res, {
			wallet: EconomyTransformer.toAuthenticatedWallet(wallet, userService.getUserFromRequest(req)),
			recentTransactions: toPublicList(transactions, EconomyTransformer.toTransaction),
			devMode: true,
			mockCCPayment: walletConfig.DEV_MODE.MOCK_CCPAYMENT
		});
	} catch (error) {
		logger.error('WalletDevController', 'Error getting dev wallet info', {
			error: error instanceof Error ? error.message : String(error),
			userId: userService.getUserFromRequest(req)?.id
		});
		next(error);
	}
}

/**
 * Simulate webhook (dev only)
 */
export async function simulateWebhook(req: Request, res: Response, next: NextFunction) {
	try {
		if (!isDevMode() || !walletConfig.DEV_MODE.MOCK_CCPAYMENT) {
			return sendErrorResponse(res, 'This endpoint is only available in development mode with mock CCPayment', 403);
		}

		const { orderId, status, amount, txHash } = simulateWebhookSchema.parse(req.body);

		// Simulate a webhook event
		const webhookEvent = {
			eventType: status === 'completed' ? 'deposit_completed' : 'deposit_failed',
			orderId,
			merchantOrderId: orderId,
			status,
			amount: amount || '100.00',
			currency: 'USDT',
			network: 'TRC20',
			txHash: txHash || `0x${Date.now().toString(16)}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		const result = await ccpaymentService.processWebhookEvent(webhookEvent as any);

		logger.info('WalletDevController', 'Simulated webhook processed', { orderId, status, result });

		sendSuccessResponse(res, {
			message: 'Webhook simulation processed',
			event: webhookEvent,
			result
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return sendErrorResponse(res, 'Invalid request', 400);
		}
		logger.error('WalletDevController', 'Error simulating webhook', {
			error: error instanceof Error ? error.message : String(error)
		});
		next(error);
	}
}

/**
 * Reset wallet (dev only) - dangerous operation
 */
export async function resetWallet(req: Request, res: Response, next: NextFunction) {
	try {
		if (!isDevMode() || process.env.ALLOW_WALLET_RESET !== 'true') {
			return sendErrorResponse(res, 'This endpoint is disabled for safety', 403);
		}

		const userId = userService.getUserFromRequest(req)?.id;
		if (!userId) {
			return sendErrorResponse(res, 'User not authenticated', 401);
		}

		// This would reset the user's wallet to initial state
		// Implementation depends on your requirements

		sendSuccessResponse(res, {
			message: 'Wallet reset not implemented for safety reasons',
			success: false
		});
	} catch (error) {
		logger.error('WalletDevController', 'Error resetting wallet', {
			error: error instanceof Error ? error.message : String(error),
			userId: userService.getUserFromRequest(req)?.id
		});
		next(error);
	}
}
