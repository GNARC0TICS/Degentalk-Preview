/**
 * CCPayment Wallet Adapter
 *
 * Implements the wallet adapter interface for CCPayment provider
 * Leverages existing CCPayment services for actual implementation
 */

import type { UserId, TransactionId } from '@shared/types/ids';
import type {
	WalletBalance,
	CryptoBalance,
	DepositAddress,
	DgtTransaction,
	WithdrawalRequest,
	WithdrawalResponse,
	PurchaseRequest,
	PurchaseOrder,
	WebhookResult,
	PaginationOptions,
	SupportedCoin,
	CCPaymentWithdrawFee
} from '@shared/types/wallet/wallet.types';
import {
	fromCCPaymentBalance,
	fromCCPaymentDepositAddress,
	fromCCPaymentTokenInfo,
	toPublicWithdrawFeeInfo
} from '@shared/types/wallet/wallet.transformer';

import { logger } from '@core/logger';
import { WalletError, ErrorCodes } from '@core/errors';

// Import Drizzle and schemas
import { db } from '@db';
import { users, wallets, transactions } from '@schema';
import { eq, sql } from 'drizzle-orm';

// Import existing CCPayment services
import { ccpaymentService } from '../providers/ccpayment/ccpayment.service';
import { ccpaymentApiService } from '../providers/ccpayment/ccpayment-api.service';
import { ccpaymentTokenService } from '../providers/ccpayment/ccpayment-token.service';

export interface WalletAdapter {
	getUserBalance(userId: UserId): Promise<WalletBalance>;
	createDepositAddress(userId: UserId, coinSymbol: string, chain: string): Promise<DepositAddress>;
	requestWithdrawal(userId: UserId, request: WithdrawalRequest): Promise<WithdrawalResponse>;
	getTransactionHistory(userId: UserId, options: PaginationOptions): Promise<DgtTransaction[]>;
	processWebhook(payload: string, signature: string): Promise<WebhookResult>;
	getSupportedCoins(): Promise<SupportedCoin[]>;
	getTokenInfo(coinId: string): Promise<SupportedCoin>;
	validateAddress(address: string, chain: string): Promise<{ isValid: boolean }>;
	getWithdrawFee(coinId: number, chain: string): Promise<CCPaymentWithdrawFee>;
}

export class CCPaymentAdapter implements WalletAdapter {
	/**
	 * Get comprehensive user balance including DGT and crypto
	 */
	async getUserBalance(userId: UserId): Promise<WalletBalance> {
		try {
			logger.info('CCPaymentAdapter', 'Fetching user balance', { userId });

			// Get CCPayment user ID from database (would need to implement this mapping)
			const ccPaymentUserId = await this.getCCPaymentUserId(userId);

			// Get crypto balances from CCPayment using the v2 service
			const ccBalances = await ccpaymentService.getUserCoinAssetList(ccPaymentUserId);

			// Transform CCPayment balances to our format
			const cryptoBalances: CryptoBalance[] = ccBalances.map(fromCCPaymentBalance);

			// Get DGT balance from local database (would need to implement)
			const dgtBalance = await this.getDgtBalance(userId);

			const walletBalance: WalletBalance = {
				userId,
				dgtBalance,
				cryptoBalances,
				lastUpdated: new Date().toISOString()
			};

			logger.info('CCPaymentAdapter', 'User balance retrieved successfully', {
				userId,
				cryptoBalanceCount: cryptoBalances.length,
				dgtBalance
			});

			return walletBalance;
		} catch (error) {
			logger.error('CCPaymentAdapter', 'Error fetching user balance', {
				userId,
				error
			});

			if (error instanceof WalletError) {
				throw error;
			}

			throw new WalletError(
				'Failed to fetch user balance',
				ErrorCodes.PAYMENT_PROVIDER_ERROR,
				500,
				{ userId, originalError: error }
			);
		}
	}

	/**
	 * Create deposit address for specified coin and chain
	 */
	async createDepositAddress(
		userId: UserId,
		coinSymbol: string,
		chain: string
	): Promise<DepositAddress> {
		try {
			logger.info('CCPaymentAdapter', 'Creating deposit address', {
				userId,
				coinSymbol,
				chain
			});

			const ccPaymentUserId = await this.getCCPaymentUserId(userId);

			const ccAddress = await ccpaymentService.getOrCreateUserDepositAddress(
				ccPaymentUserId,
				coinSymbol
			);

			const depositAddress = fromCCPaymentDepositAddress({
				coinSymbol,
				chain,
				address: ccAddress.address,
				memo: ccAddress.memo,
				qrCode: ccAddress.qrCode
			});

			logger.info('CCPaymentAdapter', 'Deposit address created successfully', {
				userId,
				coinSymbol,
				chain,
				address: depositAddress.address.substring(0, 10) + '...'
			});

			return depositAddress;
		} catch (error) {
			logger.error('CCPaymentAdapter', 'Error creating deposit address', {
				userId,
				coinSymbol,
				chain,
				error
			});

			if (error instanceof WalletError) {
				throw error;
			}

			throw new WalletError(
				'Failed to create deposit address',
				ErrorCodes.PAYMENT_PROVIDER_ERROR,
				500,
				{ userId, coinSymbol, chain, originalError: error }
			);
		}
	}

	/**
	 * Request cryptocurrency withdrawal
	 */
	async requestWithdrawal(userId: UserId, request: WithdrawalRequest): Promise<WithdrawalResponse> {
		try {
			logger.info('CCPaymentAdapter', 'Processing withdrawal request', {
				userId,
				amount: request.amount,
				currency: request.currency
			});

			// Validate withdrawal address
			const isValidAddress = await ccpaymentTokenService.checkWithdrawalAddressValidity(
				request.currency,
				request.address
			);

			if (!isValidAddress) {
				throw new WalletError('Invalid withdrawal address', ErrorCodes.VALIDATION_ERROR, 400, {
					address: request.address,
					currency: request.currency
				});
			}

			// Create unique order ID
			const orderId = `withdrawal_${userId}_${Date.now()}`;

			const ccWithdrawal = await ccpaymentService.requestWithdrawal({
				amount: request.amount,
				currency: request.currency,
				orderId,
				address: request.address,
				notifyUrl: process.env.CCPAYMENT_WEBHOOK_URL || ''
			});

			// Generate transaction ID (would need proper ID generation)
			const transactionId = `tx_${orderId}` as TransactionId;

			const withdrawalResponse: WithdrawalResponse = {
				transactionId,
				status: ccWithdrawal.status as any,
				estimatedCompletionTime: ccWithdrawal.estimatedTime,
				transactionHash: ccWithdrawal.txHash,
				fee: ccWithdrawal.fee
			};

			logger.info('CCPaymentAdapter', 'Withdrawal processed successfully', {
				userId,
				transactionId,
				status: withdrawalResponse.status
			});

			return withdrawalResponse;
		} catch (error) {
			logger.error('CCPaymentAdapter', 'Error processing withdrawal', {
				userId,
				request,
				error
			});

			if (error instanceof WalletError) {
				throw error;
			}

			throw new WalletError(
				'Failed to process withdrawal',
				ErrorCodes.PAYMENT_PROVIDER_ERROR,
				500,
				{ userId, request, originalError: error }
			);
		}
	}

	/**
	 * Get list of supported coins
	 */
	async getSupportedCoins(): Promise<SupportedCoin[]> {
		try {
			logger.info('CCPaymentAdapter', 'Fetching supported coins');

			const rawTokens = await ccpaymentTokenService.getSupportedTokens();

			const supportedCoins = rawTokens.map(fromCCPaymentTokenInfo);

			logger.info('CCPaymentAdapter', 'Supported coins retrieved successfully', {
				count: supportedCoins.length
			});

			return supportedCoins;
		} catch (error) {
			logger.error('CCPaymentAdapter', 'Error fetching supported coins', { error });

			if (error instanceof WalletError) {
				throw error;
			}

			throw new WalletError(
				'Failed to fetch supported coins',
				ErrorCodes.PAYMENT_PROVIDER_ERROR,
				500,
				{ originalError: error }
			);
		}
	}

	/**
	 * Get info for a single token
	 */
	async getTokenInfo(coinId: string): Promise<SupportedCoin> {
		try {
			logger.info('CCPaymentAdapter', 'Fetching token info', { coinId });

			const coinIdNum = parseInt(coinId);
			if (isNaN(coinIdNum)) {
				throw new WalletError('Invalid coinId format', ErrorCodes.VALIDATION_ERROR);
			}

			const tokenInfo = await ccpaymentTokenService.getTokenInfo(coinIdNum);

			let price = '0';
			try {
				const prices = await ccpaymentTokenService.getTokenPrices([coinIdNum]);
				price = prices[coinIdNum] || '0';
			} catch (error) {
				logger.warn('CCPaymentAdapter', 'Could not fetch price for token', { coinId, error });
			}

			const supportedCoin = fromCCPaymentTokenInfo(tokenInfo, price);

			logger.info('CCPaymentAdapter', 'Token info retrieved successfully', {
				coinId,
				symbol: supportedCoin.symbol
			});

			return supportedCoin;
		} catch (error) {
			logger.error('CCPaymentAdapter', 'Error fetching token info', { coinId, error });

			if (error instanceof WalletError) {
				throw error;
			}

			throw new WalletError('Failed to fetch token info', ErrorCodes.PAYMENT_PROVIDER_ERROR, 500, {
				coinId,
				originalError: error
			});
		}
	}

	/**
	 * Validate a crypto address for a given chain
	 */
	async validateAddress(address: string, chain: string): Promise<{ isValid: boolean }> {
		try {
			logger.info('CCPaymentAdapter', 'Validating address', { address, chain });

			const isValid = await ccpaymentTokenService.checkWithdrawalAddressValidity(chain, address);

			logger.info('CCPaymentAdapter', 'Address validation completed', {
				address,
				chain,
				isValid
			});

			return { isValid };
		} catch (error) {
			logger.error('CCPaymentAdapter', 'Error validating address', { address, chain, error });

			if (error instanceof WalletError) {
				throw error;
			}

			throw new WalletError('Failed to validate address', ErrorCodes.PAYMENT_PROVIDER_ERROR, 500, {
				address,
				chain,
				originalError: error
			});
		}
	}

	/**
	 * Get withdrawal fee for a specific coin and chain
	 */
	async getWithdrawFee(coinId: number, chain: string): Promise<CCPaymentWithdrawFee> {
		try {
			logger.info('CCPaymentAdapter', 'Fetching withdrawal fee', { coinId, chain });

			const feeInfo = await ccpaymentTokenService.getWithdrawFee(coinId, chain);

			logger.info('CCPaymentAdapter', 'Withdrawal fee retrieved successfully', {
				coinId,
				chain,
				fee: feeInfo.amount
			});

			return feeInfo;
		} catch (error) {
			logger.error('CCPaymentAdapter', 'Error fetching withdrawal fee', { coinId, chain, error });

			if (error instanceof WalletError) {
				throw error;
			}

			throw new WalletError(
				'Failed to fetch withdrawal fee',
				ErrorCodes.PAYMENT_PROVIDER_ERROR,
				500,
				{ coinId, chain, originalError: error }
			);
		}
	}

	/**
	 * Get paginated transaction history
	 */
	async getTransactionHistory(
		userId: UserId,
		options: PaginationOptions
	): Promise<DgtTransaction[]> {
		try {
			logger.info('CCPaymentAdapter', 'Fetching transaction history', {
				userId,
				page: options.page,
				limit: options.limit
			});

			// 1. Fetch transactions from CCPayment
			const ccPaymentUserId = await this.getCCPaymentUserId(userId).catch(() => null);
			let ccTransactions: DgtTransaction[] = [];
			if (ccPaymentUserId) {
				try {
					const rawCcTxs = await ccpaymentBalanceService.getTransactionHistory({
						userId: ccPaymentUserId,
						page: options.page,
						limit: options.limit,
						type: 'all'
					});
					ccTransactions = rawCcTxs.transactions.map((tx) => ({
						id: `tx_cc_${tx.orderId}` as TransactionId,
						userId,
						type: this.mapTransactionType(tx.type),
						amount: parseFloat(tx.amount),
						status: this.mapTransactionStatus(tx.status),
						metadata: {
							ccPaymentOrderId: tx.orderId,
							currency: tx.currency,
							txHash: tx.txHash,
							ccPaymentType: tx.type
						},
						createdAt: tx.createdAt,
						updatedAt: tx.updatedAt || tx.createdAt
					}));
				} catch (error) {
					logger.error(
						'CCPaymentAdapter',
						'Failed to fetch CCPayment transactions, continuing with local.',
						{ userId, error }
					);
				}
			}

			// 2. Fetch local DGT transactions
			const localDbTransactions = await db.query.transactions.findMany({
				where: eq(transactions.userId, userId), // simpler query: all transactions where user is the primary actor
				orderBy: [sql`${transactions.createdAt} desc`],
				limit: options.limit
			});

			const localDgtTransactions: DgtTransaction[] = localDbTransactions.map((tx) => ({
				id: tx.id,
				userId: tx.userId,
				type: tx.type,
				amount: tx.amount,
				status: tx.status,
				metadata: tx.metadata,
				createdAt: tx.createdAt.toISOString(),
				updatedAt: tx.updatedAt.toISOString()
			}));

			// 3. Merge, sort, and slice
			const allTransactions = [...ccTransactions, ...localDgtTransactions];
			allTransactions.sort(
				(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);

			const paginatedTransactions = allTransactions.slice(0, options.limit);

			logger.info('CCPaymentAdapter', 'Transaction history retrieved successfully', {
				userId,
				transactionCount: paginatedTransactions.length
			});

			return paginatedTransactions;
		} catch (error) {
			logger.error('CCPaymentAdapter', 'Error fetching transaction history', {
				userId,
				options,
				error
			});

			if (error instanceof WalletError) {
				throw error;
			}

			throw new WalletError(
				'Failed to fetch transaction history',
				ErrorCodes.PAYMENT_PROVIDER_ERROR,
				500,
				{ userId, options, originalError: error }
			);
		}
	}

	/**
	 * Process webhook from CCPayment
	 */
	async processWebhook(payload: string, signature: string): Promise<WebhookResult> {
		try {
			logger.info('CCPaymentAdapter', 'Processing webhook');

			const event = JSON.parse(payload);

			// Process through existing CCPayment service
			await ccpaymentService.processWebhookEvent(
				{ ...event, signature },
				this.handleDepositWebhook.bind(this),
				this.handleWithdrawalWebhook.bind(this)
			);

			return {
				success: true,
				transactionId: `tx_${event.orderId}` as TransactionId,
				message: 'Webhook processed successfully',
				processed: true
			};
		} catch (error) {
			logger.error('CCPaymentAdapter', 'Error processing webhook', { error });

			return {
				success: false,
				message: error instanceof Error ? error.message : 'Unknown webhook error',
				processed: false
			};
		}
	}

	/**
	 * Handle deposit webhook event
	 */
	private async handleDepositWebhook(
		orderId: string,
		amount: string,
		currency: string,
		txHash?: string
	): Promise<void> {
		logger.info('CCPaymentAdapter', 'Processing deposit webhook', {
			orderId,
			amount,
			currency,
			txHash
		});

		// Implementation would update local database with deposit
		// For now, just log the event
	}

	/**
	 * Handle withdrawal webhook event
	 */
	private async handleWithdrawalWebhook(
		orderId: string,
		status: string,
		txHash?: string
	): Promise<void> {
		logger.info('CCPaymentAdapter', 'Processing withdrawal webhook', {
			orderId,
			status,
			txHash
		});

		// Implementation would update local database with withdrawal status
		// For now, just log the event
	}

	/**
	 * Get CCPayment user ID from database mapping
	 */
	private async getCCPaymentUserId(userId: UserId): Promise<string> {
		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
			columns: {
				ccpaymentAccountId: true
			}
		});

		if (!user || !user.ccpaymentAccountId) {
			// In a full implementation, the service layer would handle the creation flow.
			// The adapter's role is to adapt, not to orchestrate business logic.
			throw new WalletError(
				`CCPayment account ID not found for user: ${userId}`,
				ErrorCodes.NOT_FOUND,
				404
			);
		}

		return user.ccpaymentAccountId;
	}

	/**
	 * Get DGT balance from local database
	 */
	private async getDgtBalance(userId: UserId): Promise<number> {
		const userWallet = await db.query.wallets.findFirst({
			where: eq(wallets.userId, userId)
		});

		if (userWallet) {
			return userWallet.balance;
		}

		// Wallet doesn't exist, let's create it.
		// First, find the user to get their legacy balance and check existence.
		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
			columns: {
				dgtWalletBalance: true
			}
		});

		if (!user) {
			throw new WalletError(`User not found: ${userId}`, ErrorCodes.NOT_FOUND, 404);
		}

		// Create the new wallet record with the legacy balance.
		const [newWallet] = await db
			.insert(wallets)
			.values({
				userId: userId,
				balance: user.dgtWalletBalance || 0
			})
			.returning();

		return newWallet.balance;
	}

	/**
	 * Map CCPayment transaction type to our enum
	 */
	private mapTransactionType(ccType: string): DgtTransaction['type'] {
		switch (ccType.toLowerCase()) {
			case 'deposit':
				return 'deposit';
			case 'withdrawal':
				return 'withdrawal';
			case 'transfer':
				return 'transfer';
			default:
				return 'deposit';
		}
	}

	/**
	 * Map CCPayment status to our enum
	 */
	private mapTransactionStatus(ccStatus: string): DgtTransaction['status'] {
		switch (ccStatus.toLowerCase()) {
			case 'success':
			case 'completed':
				return 'completed';
			case 'pending':
			case 'processing':
				return 'pending';
			case 'failed':
			case 'error':
				return 'failed';
			case 'cancelled':
				return 'cancelled';
			default:
				return 'pending';
		}
	}
}

// Export singleton instance
export const ccpaymentAdapter = new CCPaymentAdapter();
