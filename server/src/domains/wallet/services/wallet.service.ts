/**
 * Core Wallet Service
 *
 * Orchestrates wallet operations across different providers
 * Provides unified interface for wallet functionality
 */

import type { UserId, TransactionId } from '@shared/types/ids';
import type {
	WalletBalance,
	DepositAddress,
	DgtTransaction,
	DgtTransactionMetadata, // Added
	WithdrawalRequest,
	WithdrawalResponse,
	PurchaseRequest,
	PurchaseOrder,
	WebhookResult,
	PaginationOptions,
	WalletConfigPublic,
	DgtTransfer,
	SupportedCoin,
	CCPaymentWithdrawFee
} from '@shared/types/wallet/wallet.types';
import { fromDbCryptoWallet } from '@shared/types/wallet/wallet.transformer';

import { logger, LogAction } from '@core/logger';
import { WalletError, ErrorCodes } from '@core/errors';
import { reportErrorServer } from '../../../../lib/report-error';

// Import adapters
import { ccpaymentAdapter } from '../adapters/ccpayment.adapter';
import { CacheAdapter } from '../adapters/cache.adapter';
import type { WalletAdapter } from '../adapters/ccpayment.adapter';
import { db } from '@db';
import { wallets, transactions, supportedTokens, cryptoWallets, swapRecords, users } from '@schema';
import { and, eq, sql } from 'drizzle-orm';
import { ccpaymentService } from '../providers/ccpayment/ccpayment.service';

export interface WalletServiceConfig {
	primaryProvider: 'ccpayment';
	enableCaching: boolean;
	cacheProvider?: 'memory' | 'redis';
	defaultCurrency: string;
	supportedCurrencies: string[];
}

export class WalletService {
	private readonly config: WalletServiceConfig;
	private readonly primaryAdapter: WalletAdapter;

	constructor(config: Partial<WalletServiceConfig> = {}) {
		this.config = {
			primaryProvider: 'ccpayment',
			enableCaching: true,
			cacheProvider: 'memory',
			defaultCurrency: 'USDT',
			supportedCurrencies: ['USDT', 'BTC', 'ETH', 'SOL'],
			...config
		};

		// Initialize primary adapter
		const baseAdapter = this.createPrimaryAdapter();

		// Wrap with caching if enabled
		this.primaryAdapter = this.config.enableCaching ? new CacheAdapter(baseAdapter) : baseAdapter;

		logger.info('WalletService', 'Initialized with configuration', {
			primaryProvider: this.config.primaryProvider,
			enableCaching: this.config.enableCaching,
			supportedCurrencies: this.config.supportedCurrencies
		});
	}

	/**
	 * Get comprehensive user wallet balance
	 */
	async getUserBalance(userId: UserId): Promise<WalletBalance> {
		try {
			logger.info('WalletService', 'Fetching user balance', { userId });

			const balance = await this.primaryAdapter.getUserBalance(userId);

			logger.info('WalletService', 'User balance retrieved successfully', {
				userId,
				dgtBalance: balance.dgtBalance,
				cryptoAssets: balance.cryptoBalances.length
			});

			return balance;
		} catch (error) {
			await reportErrorServer(error, {
				service: 'WalletService',
				operation: 'getUserBalance',
				action: LogAction.FAILURE,
				data: { userId }
			});
			throw this.handleError(error, 'Failed to fetch user balance');
		}
	}

	/**
	 * Create deposit address for cryptocurrency
	 */
	async createDepositAddress(
		userId: UserId,
		coinSymbol: string,
		chain?: string
	): Promise<DepositAddress> {
		try {
			this.validateCurrency(coinSymbol);

			logger.info('WalletService', 'Creating deposit address', {
				userId,
				coinSymbol,
				chain
			});

			const depositAddress = await this.primaryAdapter.createDepositAddress(
				userId,
				coinSymbol,
				chain || this.getDefaultChain(coinSymbol)
			);

			logger.info('WalletService', 'Deposit address created successfully', {
				userId,
				coinSymbol,
				chain: depositAddress.chain
			});

			return depositAddress;
		} catch (error) {
			await reportErrorServer(error, {
				service: 'WalletService',
				operation: 'createDepositAddress',
				action: LogAction.FAILURE,
				data: { userId, coinSymbol, chain }
			});
			throw this.handleError(error, 'Failed to create deposit address');
		}
	}

	/**
	 * Get all deposit addresses for a user
	 */
	async getDepositAddresses(userId: UserId): Promise<DepositAddress[]> {
		try {
			logger.info('WalletService', 'Fetching deposit addresses', { userId });

			const dbWallets = await db
				.select()
				.from(cryptoWallets)
				.where(eq(cryptoWallets.userId, userId));

			const depositAddresses = dbWallets.map(fromDbCryptoWallet);

			logger.info('WalletService', 'Deposit addresses retrieved successfully', {
				userId,
				count: depositAddresses.length
			});

			return depositAddresses;
		} catch (error) {
			await reportErrorServer(error, {
				service: 'WalletService',
				operation: 'getDepositAddresses',
				action: LogAction.FAILURE,
				data: { userId }
			});
			throw this.handleError(error, 'Failed to fetch deposit addresses');
		}
	}

	/**
	 * Initialize a new user's wallet with default crypto addresses and welcome bonus.
	 * Implements circuit breaker pattern to never fail registration flow.
	 */
	async initializeWallet(
		userId: UserId
	): Promise<{
		success: boolean;
		walletsCreated: number;
		dgtWalletCreated: boolean;
		welcomeBonusAdded: boolean;
	}> {
		try {
			logger.info('WalletService', 'Initializing wallet for user', { userId });

			let walletsCreated = 0;
			let dgtWalletCreated = false;
			let welcomeBonusAdded = false;

			// Everything runs in a single transaction for atomicity
			return await db.transaction(async (tx) => {
				// Step 1: Create DGT wallet (critical for registration)
				try {
					await this.getOrCreateDgtWallet(tx, userId);
					dgtWalletCreated = true;
					logger.info('WalletService', 'DGT wallet created/verified for user', { userId });

					// Add 10 DGT welcome bonus within same transaction
					const wallet = await tx.query.wallets.findFirst({
						where: eq(wallets.userId, userId)
					});

					if (wallet) {
						const newBalance = wallet.balance + 10;
						await tx
							.update(wallets)
							.set({ balance: newBalance, lastTransaction: new Date() })
							.where(eq(wallets.id, wallet.id));

						await tx.insert(transactions).values({
							userId: userId,
							walletId: wallet.id,
							amount: 10,
							type: 'admin_credit',
							status: 'completed',
							description: 'Welcome bonus for new user',
							metadata: {
								source: 'admin_credit',
								reason: 'Welcome bonus for new user',
								adminId: 'system'
							}
						});

						welcomeBonusAdded = true;
						logger.info('WalletService', 'Welcome bonus credited to new user', {
							userId,
							amount: 10
						});
					}
				} catch (dgtError) {
					logger.error('WalletService', 'Failed to create DGT wallet during initialization', {
						userId,
						error: dgtError
					});
					// Continue despite DGT wallet failure - circuit breaker
				}

				// Step 2: Initialize CCPayment wallet (non-critical, outside transaction)
				try {
					const ccpaymentUserId = await ccpaymentService.getOrCreateCCPaymentUser(userId);
					logger.info('WalletService', 'CCPayment user created/verified', {
						userId,
						ccpaymentUserId
					});
				} catch (ccpaymentError) {
					logger.warn('WalletService', 'Failed to create CCPayment user during initialization', {
						userId,
						error: ccpaymentError
					});
					// Continue despite CCPayment failure - circuit breaker
				}

				// Step 3: Create crypto deposit addresses (non-critical, outside transaction)
				try {
					const supportedCoins = await this.getSupportedCoins();
					const primaryCoins = supportedCoins.filter((coin) =>
						['BTC', 'ETH', 'USDT'].includes(coin.symbol.toUpperCase())
					);

					for (const coin of primaryCoins) {
						for (const network of coin.networks) {
							try {
								const address = await this.createDepositAddress(
									userId,
									coin.symbol,
									network.network
								);

								await db.insert(cryptoWallets).values({
									userId,
									ccpaymentUserId: '', // Will be populated later if CCPayment succeeds
									coinId: 0,
									coinSymbol: coin.symbol,
									chain: network.network,
									address: address.address,
									memo: address.memo,
									qrCodeUrl: address.qrCode
								});

								walletsCreated++;
							} catch (addressError) {
								logger.warn(
									'WalletService',
									'Failed to create deposit address during initialization',
									{
										userId,
										coin: coin.symbol,
										network: network.network,
										error: addressError
									}
								);
								// Continue despite individual address failures
							}
						}
					}
				} catch (coinError) {
					logger.warn('WalletService', 'Failed to initialize crypto addresses', {
						userId,
						error: coinError
					});
					// Continue despite crypto address failures - circuit breaker
				}

				logger.info('WalletService', 'Wallet initialization completed', {
					userId,
					walletsCreated,
					dgtWalletCreated,
					welcomeBonusAdded
				});

				return {
					success: true,
					walletsCreated,
					dgtWalletCreated,
					welcomeBonusAdded
				};
			});
		} catch (error) {
			await reportErrorServer(error, {
				service: 'WalletService',
				operation: 'initializeWallet',
				action: LogAction.FAILURE,
				data: { userId }
			});
			// Even on complete failure, return success to not break registration
			return {
				success: false,
				walletsCreated: 0,
				dgtWalletCreated: false,
				welcomeBonusAdded: false
			};
		}
	}

	/**
	 * Ensure CCPayment wallet exists for user (used during login).
	 * Non-critical operation that won't fail authentication.
	 */
	async ensureCcPaymentWallet(userId: UserId): Promise<string | null> {
		try {
			logger.info('WalletService', 'Ensuring CCPayment wallet for user', { userId });

			const ccpaymentUserId = await ccpaymentService.getOrCreateCCPaymentUser(userId);

			logger.info('WalletService', 'CCPayment wallet ensured for user', {
				userId,
				ccpaymentUserId
			});

			return ccpaymentUserId;
		} catch (error) {
			await reportErrorServer(error, {
				service: 'WalletService',
				operation: 'ensureCcPaymentWallet',
				action: LogAction.FAILURE,
				data: { userId }
			});
			// Return null on failure rather than throwing - circuit breaker
			return null;
		}
	}

	/**
	 * Swap cryptocurrencies for a user.
	 */
	async swapCrypto(
		userId: UserId,
		params: { fromCoinId: number; toCoinId: number; fromAmount: string }
	): Promise<{ recordId: string }> {
		try {
			logger.info('WalletService', 'Processing crypto swap', { userId, ...params });

			// In a real app, we'd have a feature flag check here from a config service.

			const ccpaymentUserId = await ccpaymentService.getOrCreateCCPaymentUser(userId);

			const recordId = await ccpaymentService.swap({
				uid: ccpaymentUserId,
				fromCoinId: params.fromCoinId,
				toCoinId: params.toCoinId,
				fromAmount: params.fromAmount
			});

			// We don't have enough info to fill this completely,
			// the webhook would populate the rest.
			await db.insert(swapRecords).values({
				userId,
				recordId,
				fromCoinId: params.fromCoinId,
				toCoinId: params.toCoinId,
				fromAmount: params.fromAmount,
				status: 'Processing',
				fromCoinSymbol: '', // from webhook
				toCoinSymbol: '', // from webhook
				toAmount: '0' // from webhook
			});

			logger.info('WalletService', 'Crypto swap processed successfully', {
				userId,
				recordId
			});

			return { recordId };
		} catch (error) {
			await reportErrorServer(error, {
				service: 'WalletService',
				operation: 'swapCrypto',
				action: LogAction.FAILURE,
				data: { userId, params }
			});
			throw this.handleError(error, 'Failed to process crypto swap');
		}
	}

	/**
	 * Request cryptocurrency withdrawal
	 */
	async requestWithdrawal(userId: UserId, request: WithdrawalRequest): Promise<WithdrawalResponse> {
		try {
			this.validateWithdrawalRequest(request);

			logger.info('WalletService', 'Processing withdrawal request', {
				userId,
				amount: request.amount,
				currency: request.currency
			});

			const response = await this.primaryAdapter.requestWithdrawal(userId, request);

			logger.info('WalletService', 'Withdrawal processed successfully', {
				userId,
				transactionId: response.transactionId,
				status: response.status
			});

			return response;
		} catch (error) {
			await reportErrorServer(error, {
				service: 'WalletService',
				operation: 'requestWithdrawal',
				action: LogAction.FAILURE,
				data: { userId, request }
			});
			throw this.handleError(error, 'Failed to process withdrawal');
		}
	}

	/**
	 * Get paginated transaction history
	 */
	async getTransactionHistory(
		userId: UserId,
		options: Partial<PaginationOptions> = {}
	): Promise<DgtTransaction[]> {
		try {
			const paginationOptions: PaginationOptions = {
				page: options.page || 1,
				limit: Math.min(options.limit || 20, 100), // Cap at 100
				sortBy: options.sortBy || 'createdAt',
				sortOrder: options.sortOrder || 'desc'
			};

			logger.info('WalletService', 'Fetching transaction history', {
				userId,
				options: paginationOptions
			});

			const transactions = await this.primaryAdapter.getTransactionHistory(
				userId,
				paginationOptions
			);

			logger.info('WalletService', 'Transaction history retrieved successfully', {
				userId,
				transactionCount: transactions.length,
				page: paginationOptions.page
			});

			return transactions;
		} catch (error) {
			await reportErrorServer(error, {
				service: 'WalletService',
				operation: 'getTransactionHistory',
				action: LogAction.FAILURE,
				data: { userId, options }
			});
			throw this.handleError(error, 'Failed to fetch transaction history');
		}
	}

	/**
	 * Get list of supported coins for deposits and withdrawals
	 */
	async getSupportedCoins(): Promise<SupportedCoin[]> {
		try {
			logger.info('WalletService', 'Fetching supported coins');

			// 1. Try to fetch from local database first
			const localTokens = await db
				.select()
				.from(supportedTokens)
				.where(eq(supportedTokens.isActive, true));

			if (localTokens.length > 0) {
				logger.info('WalletService', 'Supported coins retrieved from local database', {
					count: localTokens.length
				});
				// NOTE: Could create a transformer for local tokens to SupportedCoin[] format
				// Currently we just log and proceed to the adapter.
			}

			// 2. Fallback to the primary adapter (e.g., CCPayment)
			logger.info('WalletService', 'Falling back to primary adapter for supported coins');
			const adapterTokens = await this.primaryAdapter.getSupportedCoins();

			// NOTE: Could cache the adapter response into our local DB for performance

			logger.info('WalletService', 'Supported coins retrieved successfully from adapter', {
				count: adapterTokens.length
			});

			return adapterTokens;
		} catch (error) {
			await reportErrorServer(error, {
				service: 'WalletService',
				operation: 'getSupportedCoins',
				action: LogAction.FAILURE,
				data: {}
			});
			throw this.handleError(error, 'Failed to fetch supported coins');
		}
	}

	/**
	 * Get detailed information for a single supported coin.
	 */
	async getTokenInfo(coinId: string): Promise<SupportedCoin> {
		try {
			logger.info('WalletService', 'Fetching token info', { coinId });
			const tokenInfo = await this.primaryAdapter.getTokenInfo(coinId);
			logger.info('WalletService', 'Token info retrieved successfully', {
				coinId,
				symbol: tokenInfo.symbol
			});
			return tokenInfo;
		} catch (error) {
			await reportErrorServer(error, {
				service: 'WalletService',
				operation: 'getTokenInfo',
				action: LogAction.FAILURE,
				data: { coinId }
			});
			throw this.handleError(error, 'Failed to fetch token info');
		}
	}

	/**
	 * Validate a crypto address for a given chain.
	 */
	async validateAddress(address: string, chain: string): Promise<{ isValid: boolean }> {
		try {
			logger.info('WalletService', 'Validating address', { address, chain });
			const result = await this.primaryAdapter.validateAddress(address, chain);
			logger.info('WalletService', 'Address validation completed', {
				address,
				chain,
				isValid: result.isValid
			});
			return result;
		} catch (error) {
			await reportErrorServer(error, {
				service: 'WalletService',
				operation: 'validateAddress',
				action: LogAction.FAILURE,
				data: { address, chain }
			});
			throw this.handleError(error, 'Failed to validate address');
		}
	}

	/**
	 * Get withdrawal fee for a specific coin and chain.
	 */
	async getWithdrawFee(coinId: number, chain: string): Promise<CCPaymentWithdrawFee> {
		try {
			logger.info('WalletService', 'Fetching withdrawal fee', { coinId, chain });
			const feeInfo = await this.primaryAdapter.getWithdrawFee(coinId, chain);
			logger.info('WalletService', 'Withdrawal fee retrieved successfully', {
				coinId,
				chain,
				fee: feeInfo.amount
			});
			return feeInfo;
		} catch (error) {
			await reportErrorServer(error, {
				service: 'WalletService',
				operation: 'getWithdrawFee',
				action: LogAction.FAILURE,
				data: { coinId, chain }
			});
			throw this.handleError(error, 'Failed to fetch withdrawal fee');
		}
	}

	/**
	 * Credit DGT to a user's wallet.
	 */
	async creditDgt(
		userId: UserId,
		amount: number,
		metadata: DgtTransactionMetadata
	): Promise<DgtTransaction> {
		if (amount <= 0) {
			throw new WalletError('Credit amount must be positive', ErrorCodes.VALIDATION_ERROR);
		}

		return await db.transaction(async (tx) => {
			const wallet = await this.getOrCreateDgtWallet(tx, userId);
			const newBalance = wallet.balance + amount;

			// Check max balance limit
			const MAX_WALLET_BALANCE = 1000000000; // 1 billion DGT
			if (newBalance > MAX_WALLET_BALANCE) {
				throw new Error(`Wallet balance would exceed maximum allowed balance of ${MAX_WALLET_BALANCE} DGT`);
			}

			await tx
				.update(wallets)
				.set({ balance: newBalance, lastTransaction: new Date() })
				.where(eq(wallets.id, wallet.id));

			const [transaction] = await tx
				.insert(transactions)
				.values({
					userId: userId,
					walletId: wallet.id,
					amount: amount,
					type: metadata.source,
					status: 'completed',
					description: this.getTransactionDescription(metadata),
					metadata: metadata as any
				})
				.returning();

			logger.info('WalletService:creditDgt', 'DGT credited', {
				userId,
				amount,
				source: metadata.source
			});

			return this.transformDbTransaction(transaction, newBalance);
		});
	}

	/**
	 * Debit DGT from a user's wallet.
	 */
	async debitDgt(
		userId: UserId,
		amount: number,
		metadata: DgtTransactionMetadata
	): Promise<DgtTransaction> {
		if (amount <= 0) {
			throw new WalletError('Debit amount must be positive', ErrorCodes.VALIDATION_ERROR);
		}

		return await db.transaction(async (tx) => {
			const wallet = await this.getOrCreateDgtWallet(tx, userId);

			if (wallet.balance < amount) {
				throw new WalletError('Insufficient balance', ErrorCodes.INSUFFICIENT_FUNDS);
			}

			const newBalance = wallet.balance - amount;

			await tx
				.update(wallets)
				.set({ balance: newBalance, lastTransaction: new Date() })
				.where(eq(wallets.id, wallet.id));

			const [transaction] = await tx
				.insert(transactions)
				.values({
					userId: userId,
					walletId: wallet.id,
					amount: -amount,
					type: metadata.source,
					status: 'completed',
					description: this.getTransactionDescription(metadata),
					metadata: metadata as any
				})
				.returning();

			logger.info('WalletService:debitDgt', 'DGT debited', {
				userId,
				amount,
				source: metadata.source
			});

			// NOTE: Vanity sink analyzer can be integrated here for tracking specific sources like 'xp_boost'

			return this.transformDbTransaction(transaction, newBalance);
		});
	}

	/**
	 * Process internal DGT transfer between users
	 */
	async transferDgt(transfer: DgtTransfer): Promise<DgtTransaction> {
		this.validateDgtTransfer(transfer);

		const transferAmount = Math.abs(transfer.amount);

		return await db.transaction(async (tx) => {
			logger.info('WalletService:transferDgt', 'Processing DGT transfer', {
				from: transfer.from,
				to: transfer.to,
				amount: transferAmount
			});

			// Use SELECT FOR UPDATE to prevent race conditions on concurrent transfers
			const senderWallet = await tx
				.select()
				.from(wallets)
				.where(eq(wallets.userId, transfer.from))
				.for('update')
				.limit(1)
				.then((rows) => rows[0]);

			if (!senderWallet) {
				throw new WalletError('Sender wallet not found', ErrorCodes.NOT_FOUND, 404);
			}

			if (senderWallet.status !== 'active') {
				throw new WalletError('Sender wallet is frozen or suspended', ErrorCodes.FORBIDDEN, 403);
			}

			if (senderWallet.balance < transferAmount) {
				throw new WalletError('Insufficient balance', ErrorCodes.INSUFFICIENT_FUNDS, 400);
			}

			// Use SELECT FOR UPDATE to prevent race conditions on receiver wallet too
			const receiverWallet = await tx
				.select()
				.from(wallets)
				.where(eq(wallets.userId, transfer.to))
				.for('update')
				.limit(1)
				.then((rows) => rows[0]);

			if (!receiverWallet) {
				throw new WalletError('Receiver wallet not found', ErrorCodes.NOT_FOUND, 404);
			}

			if (receiverWallet.status !== 'active') {
				throw new WalletError('Receiver wallet is frozen or suspended', ErrorCodes.FORBIDDEN, 403);
			}

			// Perform the transfer
			await tx
				.update(wallets)
				.set({
					balance: sql`${wallets.balance} - ${transferAmount}`,
					lastTransaction: new Date()
				})
				.where(eq(wallets.id, senderWallet.id));

			await tx
				.update(wallets)
				.set({
					balance: sql`${wallets.balance} + ${transferAmount}`,
					lastTransaction: new Date()
				})
				.where(eq(wallets.id, receiverWallet.id));

			// Create transaction records
			const [senderTransaction] = await tx
				.insert(transactions)
				.values({
					userId: transfer.from,
					walletId: senderWallet.id,
					fromUserId: transfer.from,
					toUserId: transfer.to,
					amount: -transferAmount,
					type: 'transfer_out',
					status: 'completed',
					description: transfer.reason,
					metadata: transfer.metadata
				})
				.returning();

			await tx
				.insert(transactions)
				.values({
					userId: transfer.to,
					walletId: receiverWallet.id,
					fromUserId: transfer.from,
					toUserId: transfer.to,
					amount: transferAmount,
					type: 'transfer_in',
					status: 'completed',
					description: transfer.reason,
					metadata: transfer.metadata
				})
				.returning();

			logger.info('WalletService:transferDgt', 'DGT transfer completed successfully', {
				transactionId: senderTransaction.id,
				from: transfer.from,
				to: transfer.to,
				amount: transferAmount
			});

			return {
				id: senderTransaction.id,
				userId: senderTransaction.userId,
				type: 'transfer',
				amount: -transferAmount,
				status: 'completed',
				metadata: senderTransaction.metadata,
				createdAt: senderTransaction.createdAt.toISOString(),
				updatedAt: senderTransaction.updatedAt.toISOString()
			};
		});
	}

	/**
	 * Process webhook from payment provider
	 */
	async processWebhook(
		provider: string,
		payload: string,
		signature: string
	): Promise<WebhookResult> {
		try {
			logger.info('WalletService', 'Processing webhook', { provider });

			if (provider !== this.config.primaryProvider) {
				throw new WalletError(
					`Unsupported webhook provider: ${provider}`,
					ErrorCodes.VALIDATION_ERROR,
					400,
					{ provider }
				);
			}

			const result = await this.primaryAdapter.processWebhook(payload, signature);

			logger.info('WalletService', 'Webhook processed successfully', {
				provider,
				success: result.success,
				transactionId: result.transactionId
			});

			return result;
		} catch (error) {
			await reportErrorServer(error, {
				service: 'WalletService',
				operation: 'processWebhook',
				action: LogAction.FAILURE,
				data: { provider }
			});
			throw this.handleError(error, 'Failed to process webhook');
		}
	}

	/**
	 * Get public wallet configuration
	 */
	async getWalletConfig(): Promise<WalletConfigPublic> {
		return {
			supportedCurrencies: this.config.supportedCurrencies,
			minimumWithdrawal: {
				BTC: 0.001,
				ETH: 0.01,
				USDT: 10,
				SOL: 0.1
			},
			maximumWithdrawal: {
				BTC: 10,
				ETH: 100,
				USDT: 100000,
				SOL: 1000
			},
			withdrawalFees: {
				BTC: 0.0005,
				ETH: 0.005,
				USDT: 1,
				SOL: 0.01
			},
			dgtExchangeRate: 0.01, // 1 DGT = $0.01 USD
			maintenanceMode: false
		};
	}

	/**
	 * Create primary adapter based on configuration
	 */
	private createPrimaryAdapter(): WalletAdapter {
		switch (this.config.primaryProvider) {
			case 'ccpayment':
				return ccpaymentAdapter;
			default:
				throw new Error(`Unsupported primary provider: ${this.config.primaryProvider}`);
		}
	}

	/**
	 * Validate currency is supported
	 */
	private validateCurrency(currency: string): void {
		if (!this.config.supportedCurrencies.includes(currency)) {
			throw new WalletError(`Unsupported currency: ${currency}`, ErrorCodes.VALIDATION_ERROR, 400, {
				currency,
				supportedCurrencies: this.config.supportedCurrencies
			});
		}
	}

	/**
	 * Validate withdrawal request
	 */
	private validateWithdrawalRequest(request: WithdrawalRequest): void {
		this.validateCurrency(request.currency);

		if (request.amount <= 0) {
			throw new WalletError(
				'Withdrawal amount must be positive',
				ErrorCodes.VALIDATION_ERROR,
				400,
				{ amount: request.amount }
			);
		}

		if (!request.address || request.address.trim().length === 0) {
			throw new WalletError('Withdrawal address is required', ErrorCodes.VALIDATION_ERROR, 400);
		}
	}

	/**
	 * Validate DGT transfer request
	 */
	private validateDgtTransfer(transfer: DgtTransfer): void {
		if (transfer.amount <= 0) {
			throw new WalletError('Transfer amount must be positive', ErrorCodes.VALIDATION_ERROR, 400, {
				amount: transfer.amount
			});
		}

		if (transfer.from === transfer.to) {
			throw new WalletError('Cannot transfer to same user', ErrorCodes.VALIDATION_ERROR, 400, {
				from: transfer.from,
				to: transfer.to
			});
		}
	}

	/**
	 * Get default chain for a currency
	 */
	private getDefaultChain(currency: string): string {
		const defaultChains: Record<string, string> = {
			BTC: 'Bitcoin',
			ETH: 'Ethereum',
			USDT: 'Ethereum',
			SOL: 'Solana'
		};

		return defaultChains[currency] || 'Ethereum';
	}

	/**
	 * Generate unique transaction ID
	 */
	private generateTransactionId(): TransactionId {
		return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as TransactionId;
	}

	/**
	 * Get or create a DGT wallet for a user within a transaction.
	 */
	private async getOrCreateDgtWallet(tx: any, userId: UserId) {
		// Use SELECT FOR UPDATE to prevent race conditions on wallet creation and balance updates
		let wallet = await tx
			.select()
			.from(wallets)
			.where(eq(wallets.userId, userId))
			.for('update')
			.limit(1)
			.then((rows) => rows[0]);

		if (wallet) {
			return wallet;
		}

		const [newWallet] = await tx.insert(wallets).values({ userId, balance: 0 }).returning();
		logger.info('WalletService:getOrCreateDgtWallet', 'Created new DGT wallet for user', {
			userId
		});
		return newWallet;
	}

	/**
	 * Get transaction description from metadata
	 */
	private getTransactionDescription(metadata: DgtTransactionMetadata): string {
		// Logic from old dgt.service.ts
		switch (metadata.source) {
			case 'crypto_deposit':
				return `DGT credit from ${metadata.originalToken} deposit (${metadata.usdtAmount} USDT)`;
			case 'shop_purchase':
				return `Shop purchase: ${metadata.shopItemId}`;
			case 'tip_send':
				return `Tip sent: ${metadata.reason || 'No message'}`;
			case 'tip_receive':
				return `Tip received: ${metadata.reason || 'No message'}`;
			case 'rain_send':
				return `Rain event participation`;
			case 'rain_receive':
				return `Rain reward received`;
			case 'admin_credit':
				return `Admin credit: ${metadata.reason || 'Manual adjustment'}`;
			case 'admin_debit':
				return `Admin debit: ${metadata.reason || 'Manual adjustment'}`;
			case 'internal_transfer_send':
				return `Transfer sent: ${metadata.reason || 'No note'}`;
			case 'internal_transfer_receive':
				return `Transfer received: ${metadata.reason || 'No note'}`;
			case 'xp_boost':
				return `XP boost purchase`;
			case 'manual_credit':
				return `Manual credit: ${metadata.reason || 'Administrator action'}`;
			default:
				return 'DGT transaction';
		}
	}

	private transformDbTransaction(
		dbTx: typeof transactions.$inferSelect,
		balanceAfter: number
	): DgtTransaction {
		return {
			id: dbTx.id,
			userId: dbTx.userId,
			type: dbTx.type,
			amount: dbTx.amount,
			status: dbTx.status,
			metadata: dbTx.metadata as DgtTransactionMetadata,
			createdAt: dbTx.createdAt.toISOString(),
			updatedAt: dbTx.updatedAt.toISOString(),
			balanceAfter
		};
	}

	/**
	 * Handle and standardize errors
	 */
	private handleError(error: unknown, message: string): WalletError {
		if (error instanceof WalletError) {
			return error;
		}

		return new WalletError(message, ErrorCodes.UNKNOWN_ERROR, 500, { originalError: error });
	}
}

// Export singleton instance
export const walletService = new WalletService();
