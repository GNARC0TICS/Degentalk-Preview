import type { Request, Response } from 'express';
import { userService } from '@server/src/core/services/user.service';
import { walletConfigService } from '../../../wallet/wallet-config.service';
import { dgtService } from '../../../wallet/dgt.service';
import { EconomyTransformer } from '../../../economy/transformers/economy.transformer';
import { logger } from '../../../../core/logger';

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
			const config = await walletConfigService.getConfig();

			const configResult = {
				success: true,
				data: config
			};
			
			res.json(configResult);
		} catch (error) {
			logger.error('Error getting wallet config:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to retrieve wallet configuration'
			});
		}
	}

	/**
	 * Update wallet configuration
	 */
	async updateWalletConfig(req: Request, res: Response): Promise<void> {
		try {
			const { config } = req.body;

			await walletConfigService.updateConfig(config);

			res.json({
				success: true,
				message: 'Wallet configuration updated successfully'
			});
		} catch (error) {
			logger.error('Error updating wallet config:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to update wallet configuration'
			});
		}
	}

	/**
	 * Get DGT analytics for admin dashboard
	 */
	async getDGTAnalytics(req: Request, res: Response): Promise<void> {
		try {
			const analytics = await dgtService.getDGTAnalytics();

			res.json({
				success: true,
				data: analytics
			});
		} catch (error) {
			logger.error('Error getting DGT analytics:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to retrieve DGT analytics'
			});
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
				res.status(401).json({
					success: false,
					message: 'Admin authentication required'
				});
				return;
			}

			const transaction = await dgtService.creditDGT(userId, amount, {
				source: 'admin_credit',
				adminUserId,
				reason: reason || 'Manual admin credit'
			});

			// Transform transaction for admin view with full audit trail
			const transformedTransaction = EconomyTransformer.toAdminTransaction(transaction);

			res.json({
				success: true,
				data: transformedTransaction,
				message: `Successfully credited ${amount} DGT to user ${userId}`
			});
		} catch (error) {
			logger.error('Error crediting DGT:', error);
			res.status(500).json({
				success: false,
				message: error.message || 'Failed to credit DGT'
			});
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
				res.status(401).json({
					success: false,
					message: 'Admin authentication required'
				});
				return;
			}

			const transaction = await dgtService.debitDGT(userId, amount, {
				source: 'admin_debit',
				adminUserId,
				reason: reason || 'Manual admin debit'
			});

			// Transform transaction for admin view with full audit trail
			const transformedTransaction = EconomyTransformer.toAdminTransaction(transaction);

			res.json({
				success: true,
				data: transformedTransaction,
				message: `Successfully debited ${amount} DGT from user ${userId}`
			});
		} catch (error) {
			logger.error('Error debiting DGT:', error);
			res.status(500).json({
				success: false,
				message: error.message || 'Failed to debit DGT'
			});
		}
	}

	/**
	 * Get user's DGT balance and transaction history (admin view)
	 */
	async getUserDGTInfo(req: Request, res: Response): Promise<void> {
		try {
			const { userId } = req.params;
			const { limit = 50, offset = 0 } = req.query;

			const [balance, history] = await Promise.all([
				dgtService.getDGTBalance(userId),
				dgtService.getDGTHistory(userId, {
					limit: parseInt(limit as string),
					offset: parseInt(offset as string)
				})
			]);

			// Transform wallet and transactions for admin view
			const transformedWallet = EconomyTransformer.toAdminWallet(balance);
			const transformedHistory = EconomyTransformer.toTransactionList(history, { role: 'admin' }, 'admin');

			res.json({
				success: true,
				data: {
					wallet: transformedWallet,
					history: transformedHistory
				}
			});
		} catch (error) {
			logger.error('Error getting user DGT info:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to retrieve user DGT information'
			});
		}
	}

	/**
	 * Reset wallet configuration to defaults
	 */
	async resetWalletConfig(req: Request, res: Response): Promise<void> {
		try {
			await walletConfigService.resetToDefaults();

			res.json({
				success: true,
				message: 'Wallet configuration reset to defaults'
			});
		} catch (error) {
			logger.error('Error resetting wallet config:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to reset wallet configuration'
			});
		}
	}

	/**
	 * Get wallet system status and health
	 */
	async getWalletSystemStatus(req: Request, res: Response): Promise<void> {
		try {
			const config = await walletConfigService.getConfig();
			const analytics = await dgtService.getDGTAnalytics();

			const status = {
				systemHealth: 'healthy', // Could add more sophisticated health checks
				dgtEnabled: true,
				autoConversion: config.ccpayment.autoSwapEnabled,
				featuresEnabled: {
					cryptoWithdrawals: config.features.allowCryptoWithdrawals,
					cryptoSwaps: config.features.allowCryptoSwaps,
					dgtSpending: config.features.allowDGTSpending,
					internalTransfers: config.features.allowInternalTransfers
				},
				dgtStats: {
					totalSupply: analytics.totalSupply,
					totalUsers: analytics.totalUsers,
					averageBalance: analytics.averageBalance
				},
				configLastUpdated: config.updatedAt || new Date()
			};

			res.json({
				success: true,
				data: status
			});
		} catch (error) {
			logger.error('Error getting wallet system status:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to retrieve wallet system status'
			});
		}
	}
}

export const adminWalletController = new AdminWalletController();
