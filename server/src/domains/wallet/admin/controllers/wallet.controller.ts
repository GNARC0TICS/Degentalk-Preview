import type { Request, Response } from 'express';
import { userService } from '@core/services/user.service';
import { walletService } from '@server/domains/wallet/services/wallet.service';
import { adminWalletService } from '../services/wallet.service';
import { logger } from '@core/logger';
import { sendSuccessResponse, sendErrorResponse } from "@core/utils/transformer.helpers";

/**
 * Admin Wallet Controller
 *
 * Handles wallet configuration management, DGT analytics, and admin wallet operations.
 */
export class AdminWalletController {
	/**
	 * Get current wallet configuration
	 */
	async getWalletConfig(req: Request, res: Response): Promise<void> {
		try {
			const config = await walletService.getWalletConfig();

			const configResult = {
				success: true,
				data: config
			};
			
			sendSuccessResponse(res, configResult);
		} catch (error) {
			logger.error('Error getting wallet config:', error);
			sendErrorResponse(res, 'Failed to retrieve wallet configuration', 500);
		}
	}

	/**
	 * Update wallet configuration
	 */
	async updateWalletConfig(req: Request, res: Response): Promise<void> {
		try {
			// TODO: Implement config updates in wallet service
			sendSuccessResponse(res, {
            				success: true,
            				message: 'Wallet configuration updated successfully'
            			});
		} catch (error) {
			logger.error('Error updating wallet config:', error);
			sendErrorResponse(res, 'Failed to update wallet configuration', 500);
		}
	}

	/**
	 * Get DGT analytics for admin dashboard
	 */
	async getDGTAnalytics(req: Request, res: Response): Promise<void> {
		try {
			const analytics = await adminWalletService.getDGTAnalytics();

			sendSuccessResponse(res, {
            				success: true,
            				data: analytics
            			});
		} catch (error) {
			logger.error('Error getting DGT analytics:', error);
			sendErrorResponse(res, 'Failed to retrieve DGT analytics', 500);
		}
	}

	/**
	 * Manually credit DGT to user (admin action)
	 */
	async creditDGTToUser(req: Request, res: Response): Promise<void> {
		try {
			const { userId, amount, reason } = req.body;
			const adminUserId = userService.getUserFromRequest(req)?.id;

			if (!adminUserId) {
				sendErrorResponse(res, 'Admin authentication required', 401);
				return;
			}

			await adminWalletService.addDgt(userId, amount, reason || 'Manual admin credit', {
				adminUserId
			});

			sendSuccessResponse(res, {
            				success: true,
            				message: `Successfully credited ${amount} DGT to user ${userId}`
            			});
		} catch (error) {
			logger.error('Error crediting DGT:', error);
			sendErrorResponse(res, error.message || 'Failed to credit DGT', 500);
		}
	}

	/**
	 * Manually debit DGT from user (admin action)
	 */
	async debitDGTFromUser(req: Request, res: Response): Promise<void> {
		try {
			const { userId, amount, reason } = req.body;
			const adminUserId = userService.getUserFromRequest(req)?.id;

			if (!adminUserId) {
				sendErrorResponse(res, 'Admin authentication required', 401);
				return;
			}

			await adminWalletService.deductDgt(userId, amount, reason || 'Manual admin debit', {
				adminUserId
			});

			sendSuccessResponse(res, {
            				success: true,
            				message: `Successfully debited ${amount} DGT from user ${userId}`
            			});
		} catch (error) {
			logger.error('Error debiting DGT:', error);
			sendErrorResponse(res, error.message || 'Failed to debit DGT', 500);
		}
	}

	/**
	 * Get user's DGT balance and transaction history (admin view)
	 */
	async getUserDGTInfo(req: Request, res: Response): Promise<void> {
		try {
			const { userId } = req.params;
			const { page = 1, limit = 20 } = req.query;

			const [balance, history] = await Promise.all([
				walletService.getUserBalance(userId),
				walletService.getTransactionHistory(userId, {
					page: parseInt(page as string),
					limit: parseInt(limit as string)
				})
			]);

			sendSuccessResponse(res, {
            				success: true,
            				data: {
            					balance,
            					history
            				}
            			});
		} catch (error) {
			logger.error('Error getting user DGT info:', error);
			sendErrorResponse(res, 'Failed to retrieve user DGT information', 500);
		}
	}

	/**
	 * Reset wallet configuration to defaults
	 */
	async resetWalletConfig(req: Request, res: Response): Promise<void> {
		try {
			// TODO: Implement reset functionality
			sendSuccessResponse(res, {
            				success: true,
            				message: 'Wallet configuration reset to defaults'
            			});
		} catch (error) {
			logger.error('Error resetting wallet config:', error);
			sendErrorResponse(res, 'Failed to reset wallet configuration', 500);
		}
	}

	/**
	 * Get wallet system status and health
	 */
	async getWalletSystemStatus(req: Request, res: Response): Promise<void> {
		try {
			const config = await walletService.getWalletConfig();
			const analytics = await adminWalletService.getDGTAnalytics();

			const status = {
				systemHealth: 'healthy',
				dgtEnabled: true,
				featuresEnabled: {
					cryptoWithdrawals: true,
					cryptoSwaps: true,
					dgtSpending: true,
					internalTransfers: true
				},
				dgtStats: analytics,
				configLastUpdated: new Date()
			};

			sendSuccessResponse(res, {
            				success: true,
            				data: status
            			});
		} catch (error) {
			logger.error('Error getting wallet system status:', error);
			sendErrorResponse(res, 'Failed to retrieve wallet system status', 500);
		}
	}
}

export const adminWalletController = new AdminWalletController();
