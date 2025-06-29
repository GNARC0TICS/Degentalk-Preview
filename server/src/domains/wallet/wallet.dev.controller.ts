import { userService } from '@server/src/core/services/user.service';
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
			return res.status(403).json({ error: 'This endpoint is only available in development mode' });
		}

		const userId = userService.getUserFromRequest(req)?.id;
		if (!userId) {
			return res.status(401).json({ error: 'User not authenticated' });
		}

		// Initialize DGT wallet
		await dgtService.initializeUserWallet(userId);

		// Initialize CCPayment wallet
		const ccpaymentId = await walletService.ensureCcPaymentWallet(userId);

		logger.info('WalletDevController', 'Initialized wallets for user', { userId, ccpaymentId });

		res.json({
			success: true,
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
			return res.status(403).json({ error: 'This endpoint is only available in development mode' });
		}

		const userId = userService.getUserFromRequest(req)?.id;
		if (!userId) {
			return res.status(401).json({ error: 'User not authenticated' });
		}

		const { amount, token } = topUpSchema.parse(req.body);

		if (token === 'DGT') {
			// Top up DGT balance
			const dgtAmount = BigInt(Math.floor(amount * 100000000)); // Convert to smallest unit
			await dgtService.addDGT(userId, dgtAmount, 'dev_topup', 'Development top-up');

			logger.info('WalletDevController', 'DGT top-up completed', { userId, amount });

			res.json({
				success: true,
				message: `Added ${amount} DGT to your wallet`,
				newBalance: await dgtService.getUserBalance(userId)
			});
		} else {
			// For USDT, we would simulate a deposit via CCPayment webhook
			res.json({
				success: false,
				message: 'USDT top-up not implemented yet. Use the simulate webhook endpoint instead.'
			});
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({ error: 'Invalid request', details: error.errors });
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
			return res.status(403).json({ error: 'This endpoint is only available in development mode' });
		}

		const userId = userService.getUserFromRequest(req)?.id;
		if (!userId) {
			return res.status(401).json({ error: 'User not authenticated' });
		}

		const wallet = await walletService.getUserWallet(userId);
		const transactions = await walletService.getTransactionHistory(userId, 10);

		res.json({
			wallet,
			recentTransactions: transactions,
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
			return res
				.status(403)
				.json({ error: 'This endpoint is only available in development mode with mock CCPayment' });
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

		res.json({
			success: true,
			message: 'Webhook simulation processed',
			event: webhookEvent,
			result
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({ error: 'Invalid request', details: error.errors });
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
			return res.status(403).json({ error: 'This endpoint is disabled for safety' });
		}

		const userId = userService.getUserFromRequest(req)?.id;
		if (!userId) {
			return res.status(401).json({ error: 'User not authenticated' });
		}

		// This would reset the user's wallet to initial state
		// Implementation depends on your requirements

		res.json({
			success: false,
			message: 'Wallet reset not implemented for safety reasons'
		});
	} catch (error) {
		logger.error('WalletDevController', 'Error resetting wallet', {
			error: error instanceof Error ? error.message : String(error),
			userId: userService.getUserFromRequest(req)?.id
		});
		next(error);
	}
}
