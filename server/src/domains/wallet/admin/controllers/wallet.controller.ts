import type { Request, Response } from 'express';
import { userService } from '@core/services/user.service';
import { walletService } from '@api/domains/wallet/services/wallet.service';
import { adminWalletService } from '../services/wallet.service';
import { logger } from '@core/logger';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';
import { validateAndConvertId } from '@core/helpers/validate-controller-ids';

/**
 * Admin Wallet Controller (v2)
 *
 * Handles all administrative actions related to the dual-ledger wallet system.
 */
export class AdminWalletController {

	// --- Unified User Financial Profile --- //

	/**
	 * Gets a complete financial profile for a user, including DGT balance,
	 * crypto balances, and transaction history.
	 */
	async getUserFinancialProfile(req: Request, res: Response): Promise<void> {
		try {
			const userId = validateAndConvertId(req.params.userId, 'User');
			const { page = 1, limit = 20 } = req.query;

			const [dgtBalance, cryptoBalances, history] = await Promise.all([
				walletService.getUserDgtBalance(userId),
				adminWalletService.getUserCryptoBalances(userId),
				walletService.getTransactionHistory(userId, {
					page: parseInt(page as string),
					limit: parseInt(limit as string)
				})
			]);

			sendSuccessResponse(res, {
				success: true,
				data: {
					dgtBalance,
					cryptoBalances,
					history
				}
			});
		} catch (error) {
			logger.error('AdminWalletController', 'Error getting user financial profile', { error });
			// @ts-ignore
			sendErrorResponse(res, error.message || 'Failed to retrieve user profile', 500);
		}
	}

	// --- DGT Ledger Actions --- //

	async creditDgt(req: Request, res: Response): Promise<void> {
		try {
			const { userId, amount, reason } = req.body;
			const adminUserId = userService.getUserFromRequest(req)?.id;
			if (!adminUserId) throw new Error('Admin authentication required');

			await adminWalletService.creditDgt(userId, amount, reason, { adminUserId });
			sendSuccessResponse(res, { success: true, message: `Successfully credited ${amount} DGT` });
		} catch (error) {
			logger.error('AdminWalletController', 'Error crediting DGT', { error });
			// @ts-ignore
			sendErrorResponse(res, error.message || 'Failed to credit DGT', 500);
		}
	}

	async debitDgt(req: Request, res: Response): Promise<void> {
		try {
			const { userId, amount, reason } = req.body;
			const adminUserId = userService.getUserFromRequest(req)?.id;
			if (!adminUserId) throw new Error('Admin authentication required');

			await adminWalletService.debitDgt(userId, amount, reason, { adminUserId });
			sendSuccessResponse(res, { success: true, message: `Successfully debited ${amount} DGT` });
		} catch (error) {
			logger.error('AdminWalletController', 'Error debiting DGT', { error });
			// @ts-ignore
			sendErrorResponse(res, error.message || 'Failed to debit DGT', 500);
		}
	}

	// --- Crypto Ledger Actions --- //

	async creditCrypto(req: Request, res: Response): Promise<void> {
		try {
			const { userId, coinId, amount, reason } = req.body;
			const adminUserId = userService.getUserFromRequest(req)?.id;
			if (!adminUserId) throw new Error('Admin authentication required');

			await adminWalletService.creditUserCrypto({ adminUserId, userId, coinId, amount, reason });
			sendSuccessResponse(res, { success: true, message: `Successfully credited ${amount} of coin ${coinId}` });
		} catch (error) {
			logger.error('AdminWalletController', 'Error crediting crypto', { error });
			// @ts-ignore
			sendErrorResponse(res, error.message || 'Failed to credit crypto', 500);
		}
	}

	async debitCrypto(req: Request, res: Response): Promise<void> {
		try {
			const { userId, coinId, amount, reason } = req.body;
			const adminUserId = userService.getUserFromRequest(req)?.id;
			if (!adminUserId) throw new Error('Admin authentication required');

			await adminWalletService.debitUserCrypto({ adminUserId, userId, coinId, amount, reason });
			sendSuccessResponse(res, { success: true, message: `Successfully debited ${amount} of coin ${coinId}` });
		} catch (error) {
			logger.error('AdminWalletController', 'Error debiting crypto', { error });
			// @ts-ignore
			sendErrorResponse(res, error.message || 'Failed to debit crypto', 500);
		}
	}

	// --- Analytics --- //

	async getDGTAnalytics(req: Request, res: Response): Promise<void> {
		try {
			const analytics = await adminWalletService.getDGTAnalytics();
			sendSuccessResponse(res, { success: true, data: analytics });
		} catch (error) {
			logger.error('AdminWalletController', 'Error getting DGT analytics', { error });
			// @ts-ignore
			sendErrorResponse(res, error.message || 'Failed to retrieve DGT analytics', 500);
		}
	}
}

export const adminWalletController = new AdminWalletController();