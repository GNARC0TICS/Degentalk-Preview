/**
 * Wallet Controller
 *
 * HTTP request handlers for wallet operations
 * Handles authentication, validation, and response transformation
 */

import type { Request, Response } from 'express';
import type { UserId } from '@shared/types/ids';
import type {
	WithdrawalRequest,
	PaginationOptions,
	DgtTransfer
} from '@shared/types/wallet/wallet.types';

import { logger } from '@core/logger';
import { WalletError, ErrorCodes } from '@core/errors';
import { getAuthenticatedUser } from '@core/utils/auth.helpers';
import { walletService } from '@server/domains/wallet/services/wallet.service';
import { walletConfig } from '@shared/wallet.config';
import { settingsService } from '@core/services/settings.service';
import { hasPermission } from '@server/domains/admin/adminRegistry';
import { send } from '@server-utils/response';

// Import transformers
import {
	toPublicWalletBalance,
	toPublicTransaction,
	toAuthenticatedTransaction,
	toPublicDepositAddress,
	toPublicWithdrawalResponse,
	toPublicWalletConfig,
	toPaginatedResponse,
	toPublicSupportedCoin,
	toPublicWithdrawFeeInfo
} from '@shared/types/wallet/wallet.transformer';

export class WalletController {
	/**
	 * GET /api/wallet/balance
	 * Get user's wallet balance
	 */
	async getBalance(req: Request, res: Response): Promise<void> {
		try {
			const user = getAuthenticatedUser(req);
			logger.info('WalletController', 'Getting balance', { userId: user.id });

			const balance = await walletService.getUserBalance(user.id);
			const publicBalance = toPublicWalletBalance(balance);
			send(res, publicBalance);
		} catch (error) {
			this.handleError(res, error, 'Failed to get wallet balance');
		}
	}

	/**
	 * POST /api/wallet/initialize
	 * Initialize a new user's wallet
	 */
	async initializeWallet(req: Request, res: Response): Promise<void> {
		try {
			const user = getAuthenticatedUser(req);
			logger.info('WalletController', 'Initializing wallet', { userId: user.id });

			const result = await walletService.initializeWallet(user.id);
			send(res, result);
		} catch (error) {
			this.handleError(res, error, 'Failed to initialize wallet');
		}
	}

	/**
	 * POST /api/wallet/deposit-address
	 * Create deposit address for cryptocurrency
	 *
	 * Body: { coinSymbol: string, chain?: string }
	 */
	async createDepositAddress(req: Request, res: Response): Promise<void> {
		try {
			const user = getAuthenticatedUser(req);
			const { coinSymbol, chain } = req.body;

			logger.info('WalletController', 'Creating deposit address', {
				userId: user.id,
				coinSymbol,
				chain
			});

			const depositAddress = await walletService.createDepositAddress(user.id, coinSymbol, chain);

			const publicAddress = toPublicDepositAddress(depositAddress);
			send(res, publicAddress);
		} catch (error) {
			this.handleError(res, error, 'Failed to create deposit address');
		}
	}

	/**
	 * GET /api/wallet/deposit-addresses
	 * Get all deposit addresses for a user
	 */
	async getDepositAddresses(req: Request, res: Response): Promise<void> {
		try {
			const user = getAuthenticatedUser(req);
			logger.info('WalletController', 'Getting deposit addresses', { userId: user.id });

			const addresses = await walletService.getDepositAddresses(user.id);
			const publicAddresses = addresses.map(toPublicDepositAddress);
			send(res, publicAddresses);
		} catch (error) {
			this.handleError(res, error, 'Failed to get deposit addresses');
		}
	}

	/**
	 * POST /api/wallet/withdraw
	 * Request cryptocurrency withdrawal
	 *
	 * Body: WithdrawalRequest
	 */
	async requestWithdrawal(req: Request, res: Response): Promise<void> {
		try {
			const user = getAuthenticatedUser(req);
			const withdrawalRequest: WithdrawalRequest = req.body;

			logger.info('WalletController', 'Processing withdrawal request', {
				userId: user.id,
				amount: withdrawalRequest.amount,
				currency: withdrawalRequest.currency
			});

			const response = await walletService.requestWithdrawal(user.id, withdrawalRequest);
			const publicResponse = toPublicWithdrawalResponse(response);
			send(res, publicResponse);
		} catch (error) {
			this.handleError(res, error, 'Failed to process withdrawal');
		}
	}

	/**
	 * GET /api/wallet/transactions
	 * Get paginated transaction history
	 *
	 * Query: { page?, limit?, sortBy?, sortOrder? }
	 */
	async getTransactionHistory(req: Request, res: Response): Promise<void> {
		try {
			const user = getAuthenticatedUser(req);
			const { page, limit, sortBy, sortOrder } = req.query;

			const options: Partial<PaginationOptions> = {
				page: page ? parseInt(page as string) : undefined,
				limit: limit ? parseInt(limit as string) : undefined,
				sortBy: sortBy as PaginationOptions['sortBy'],
				sortOrder: sortOrder as PaginationOptions['sortOrder']
			};

			logger.info('WalletController', 'Getting transaction history', {
				userId: user.id,
				options
			});

			const transactions = await walletService.getTransactionHistory(user.id, options);
			const publicTransactions = transactions.map(toAuthenticatedTransaction);

			// Create paginated response
			const paginatedResponse = toPaginatedResponse(
				publicTransactions,
				options.page || 1,
				options.limit || 20,
				publicTransactions.length // NOTE: Total count requires service refactor to return PaginatedResult
			);
			send(res, paginatedResponse);
		} catch (error) {
			this.handleError(res, error, 'Failed to get transaction history');
		}
	}

	/**
	 * POST /api/wallet/purchase-dgt
	 * Purchase DGT with crypto
	 *
	 * Body: { fromCoinId: number, fromAmount: number, toCoinSymbol: 'DGT' }
	 */
	async purchaseDgt(req: Request, res: Response): Promise<void> {
		try {
			const user = getAuthenticatedUser(req);
			const { fromCoinId, fromAmount, toCoinSymbol } = req.body;

			// Validate that user is purchasing DGT
			if (toCoinSymbol !== 'DGT') {
				throw new WalletError('Only DGT purchases are supported', ErrorCodes.VALIDATION_ERROR, 400);
			}

			logger.info('WalletController', 'Processing DGT purchase', {
				userId: user.id,
				fromCoinId,
				fromAmount
			});

			// Use the swap functionality to convert crypto to DGT
			// This leverages the existing CCPayment swap infrastructure
			const result = await walletService.swapCrypto(user.id, {
				fromCoinId: Number(fromCoinId),
				toCoinId: 0, // DGT has coinId 0 in most systems
				fromAmount: fromAmount.toString()
			});

			// Award XP for making a purchase
			try {
				const { xpService } = await import('../../xp/xp.service');
				await xpService.awardXp(user.id, 'DGT_PURCHASE', {
					fromCoinId,
					fromAmount,
					recordId: result.recordId
				});
			} catch (xpError) {
				logger.warn('WalletController', 'Failed to award XP for DGT purchase', {
					userId: user.id,
					recordId: result.recordId,
					error: xpError
				});
			}

			send(res, {
				recordId: result.recordId,
				message: 'DGT purchase initiated successfully'
			});
		} catch (error) {
			this.handleError(res, error, 'Failed to purchase DGT');
		}
	}

	/**
	 * POST /api/wallet/transfer-dgt
	 * Transfer DGT between users
	 *
	 * Body: { to: UserId, amount: number, reason?: string }
	 */
	async transferDgt(req: Request, res: Response): Promise<void> {
		try {
			const user = getAuthenticatedUser(req);
			const { to, amount, reason, metadata } = req.body;

			const transfer: DgtTransfer = {
				from: user.id,
				to: to as UserId,
				amount: parseFloat(amount),
				reason,
				metadata
			};

			logger.info('WalletController', 'Processing DGT transfer', {
				from: user.id,
				to: transfer.to,
				amount: transfer.amount
			});

			const transaction = await walletService.transferDgt(transfer);
			const publicTransaction = toAuthenticatedTransaction(transaction);

			send(res, publicTransaction);
		} catch (error) {
			this.handleError(res, error, 'Failed to transfer DGT');
		}
	}

	/**
	 * GET /api/wallet/config
	 * Get public wallet configuration
	 */
	async getWalletConfig(req: Request, res: Response): Promise<void> {
		try {
			logger.info('WalletController', 'Getting wallet config');

			const config = await walletService.getWalletConfig();
			const publicConfig = toPublicWalletConfig(config);

			send(res, publicConfig);
		} catch (error) {
			this.handleError(res, error, 'Failed to get wallet config');
		}
	}

	/**
	 * GET /api/wallet/supported-coins
	 * Get list of supported coins
	 */
	async getSupportedCoins(req: Request, res: Response): Promise<void> {
		try {
			logger.info('WalletController', 'Getting supported coins');

			const coins = await walletService.getSupportedCoins();
			const publicCoins = coins.map(toPublicSupportedCoin);

			send(res, publicCoins);
		} catch (error) {
			this.handleError(res, error, 'Failed to get supported coins');
		}
	}

	/**
	 * GET /api/wallet/token-info/:coinId
	 * Get info for a single supported coin
	 */
	async getTokenInfo(req: Request, res: Response): Promise<void> {
		try {
			const { coinId } = req.params;
			logger.info('WalletController', 'Getting token info', { coinId });

			const coin = await walletService.getTokenInfo(coinId);
			const publicCoin = toPublicSupportedCoin(coin);

			send(res, publicCoin);
		} catch (error) {
			this.handleError(res, error, 'Failed to get token info');
		}
	}

	/**
	 * POST /api/wallet/validate-address
	 * Validate a crypto address for a given chain
	 */
	async validateAddress(req: Request, res: Response): Promise<void> {
		try {
			const { address, chain } = req.body;
			logger.info('WalletController', 'Validating address', { address, chain });

			const result = await walletService.validateAddress(address, chain);

			send(res, result);
		} catch (error) {
			this.handleError(res, error, 'Failed to validate address');
		}
	}

	/**
	 * POST /api/wallet/get-withdraw-fee
	 * Get withdrawal fee for a specific coin and chain.
	 */
	async getWithdrawFee(req: Request, res: Response): Promise<void> {
		try {
			const { coinId, chain } = req.body;
			logger.info('WalletController', 'Getting withdrawal fee', { coinId, chain });

			const feeInfo = await walletService.getWithdrawFee(coinId, chain);
			const publicFeeInfo = toPublicWithdrawFeeInfo(feeInfo);

			send(res, publicFeeInfo);
		} catch (error) {
			this.handleError(res, error, 'Failed to get withdrawal fee');
		}
	}

	/**
	 * POST /api/wallet/swap
	 * Swap one cryptocurrency for another.
	 */
	async swapCrypto(req: Request, res: Response): Promise<void> {
		try {
			const user = getAuthenticatedUser(req);
			const { fromCoinId, toCoinId, fromAmount } = req.body;

			logger.info('WalletController', 'Processing crypto swap', {
				userId: user.id,
				fromCoinId,
				toCoinId
			});

			const result = await walletService.swapCrypto(user.id, {
				fromCoinId: Number(fromCoinId),
				toCoinId: Number(toCoinId),
				fromAmount: fromAmount.toString()
			});

			send(res, result);
		} catch (error) {
			this.handleError(res, error, 'Failed to process crypto swap');
		}
	}

	/**
	 * POST /api/wallet/webhook/:provider
	 * Process webhook from payment provider
	 */
	async processWebhook(req: Request, res: Response): Promise<void> {
		try {
			const { provider } = req.params;
			const payload = JSON.stringify(req.body);
			const signature = (req.headers['x-signature'] as string) || '';

			logger.info('WalletController', 'Processing webhook', { provider });

			const result = await walletService.processWebhook(provider, payload, signature);

			send(res, {
				transactionId: result.transactionId,
				processed: result.processed,
				message: result.message,
				success: result.success
			});
		} catch (error) {
			this.handleError(res, error, 'Failed to process webhook');
		}
	}

	/**
	 * GET /api/wallet/admin/deposit-config
	 * Get current deposit configuration (admin only)
	 */
	async getAdminDepositConfig(req: Request, res: Response): Promise<void> {
		try {
			const user = getAuthenticatedUser(req);

			// Check admin permissions using RBAC
			if (!hasPermission(user.role, 'economy', 'read')) {
				throw new WalletError(
					'Insufficient permissions for wallet admin config',
					ErrorCodes.FORBIDDEN,
					403
				);
			}

			logger.info('WalletController', 'Getting admin deposit config', { userId: user.id });

			const walletSettings = await settingsService.getWalletSettings();
			const config = {
				...walletSettings,
				dgtPriceUsd: walletConfig.DGT.PRICE_USD // Static value from config
			};

			send(res, config);
		} catch (error) {
			this.handleError(res, error, 'Failed to get admin deposit config');
		}
	}

	/**
	 * POST /api/wallet/admin/deposit-config
	 * Update deposit configuration (admin only, immutable)
	 */
	async updateAdminDepositConfig(req: Request, res: Response): Promise<void> {
		try {
			const user = getAuthenticatedUser(req);

			// Check admin permissions using RBAC
			if (!hasPermission(user.role, 'economy', 'write')) {
				throw new WalletError(
					'Insufficient permissions to modify wallet admin config',
					ErrorCodes.FORBIDDEN,
					403
				);
			}

			const {
				autoConvertDeposits,
				manualConversionAllowed,
				conversionRateBuffer,
				depositsEnabled,
				withdrawalsEnabled,
				internalTransfersEnabled
			} = req.body;

			logger.info('WalletController', 'Updating admin deposit config', {
				userId: user.id,
				changes: req.body
			});

			// Update settings immutably through service
			const updatedSettings = await settingsService.updateWalletSettings({
				...(typeof autoConvertDeposits === 'boolean' && { autoConvertDeposits }),
				...(typeof manualConversionAllowed === 'boolean' && { manualConversionAllowed }),
				...(typeof conversionRateBuffer === 'number' && { conversionRateBuffer }),
				...(typeof depositsEnabled === 'boolean' && { depositsEnabled }),
				...(typeof withdrawalsEnabled === 'boolean' && { withdrawalsEnabled }),
				...(typeof internalTransfersEnabled === 'boolean' && { internalTransfersEnabled })
			});

			const responseConfig = {
				...updatedSettings,
				dgtPriceUsd: walletConfig.DGT.PRICE_USD
			};

			logger.info('WalletController', 'Admin deposit config updated successfully', {
				userId: user.id,
				newConfig: responseConfig
			});

			send(res, responseConfig);
		} catch (error) {
			this.handleError(res, error, 'Failed to update admin deposit config');
		}
	}

	/**
	 * Handle errors consistently
	 */
	private handleError(res: Response, error: unknown, defaultMessage: string): void {
		if (error instanceof WalletError) {
			logger.error('WalletController', error.message, {
				code: error.code,
				statusCode: error.statusCode,
				metadata: error.metadata
			});

			res.status(error.statusCode).json({
				success: false,
				error: {
					message: error.message,
					code: error.code,
					metadata: error.metadata
				}
			});
			return;
		}

		logger.error('WalletController', defaultMessage, { error });

		res.status(500).json({
			success: false,
			error: {
				message: defaultMessage,
				code: ErrorCodes.UNKNOWN_ERROR
			}
		});
	}
}

// Export singleton instance
export const walletController = new WalletController();
