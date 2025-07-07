import { db } from '@db';
import {
	cryptoWallets,
	depositRecords,
	withdrawalRecords,
	internalTransfers,
	swapRecords,
	supportedTokens,
	wallets
} from '@schema';
import { eq, and, desc, or } from 'drizzle-orm';
import { CCPaymentService } from './ccpayment.service';
import { UserManagementService } from './user-management.service';
import { walletConfigService } from './wallet-config.service';
import { dgtService } from './dgt.service';
import type { CoinId, ActionId, UserId, DgtAmount, UsdAmount } from '@shared/types';
import { logger } from "../../core/logger";
import { EconomyTransformer } from '../economy/transformers/economy.transformer';

/**
 * High-level Wallet Service
 *
 * Provides wallet operations for Degentalk users, abstracting away CCPayment complexity.
 */
export class WalletService {
	private ccpaymentService: CCPaymentService;
	private userManagementService: UserManagementService;

	constructor() {
		this.ccpaymentService = new CCPaymentService();
		this.userManagementService = new UserManagementService();
	}

	/**
	 * Get user's wallet balances (includes DGT and crypto)
	 */
	async getUserBalances(userId: UserId): Promise<{
		dgt: {
			balance: number;
			lastTransactionAt: Date | null;
		};
		crypto: Array<{
			coinId: CoinId;
			coinSymbol: string;
			chain: string;
			balance: string;
			frozenBalance: string;
			address: string;
		}>;
	}> {
		try {
			// Get DGT balance (always available)
			const dgtBalance = await dgtService.getDGTBalance(userId);

			// Get crypto balances (if user has CCPayment account)
			const cryptoBalances = [];
			const ccpaymentUserId = await this.userManagementService.getCCPaymentUserId(userId);

			if (ccpaymentUserId) {
				// Get user's wallets from database
				const userWallets = await db
					.select()
					.from(cryptoWallets)
					.where(eq(cryptoWallets.userId, userId));

				// Get balances from CCPayment for each wallet
				for (const wallet of userWallets) {
					try {
						const balance = await this.ccpaymentService.getBalance({
							uid: ccpaymentUserId,
							coinId: wallet.coinId
						});

						cryptoBalances.push({
							coinId: wallet.coinId,
							coinSymbol: wallet.coinSymbol,
							chain: wallet.chain,
							balance: balance.balance,
							frozenBalance: balance.frozenBalance,
							address: wallet.address
						});
					} catch (error) {
						logger.error(`Error getting balance for ${wallet.coinSymbol}:`, error);
						// Include wallet with zero balance if API call fails
						cryptoBalances.push({
							coinId: wallet.coinId,
							coinSymbol: wallet.coinSymbol,
							chain: wallet.chain,
							balance: '0',
							frozenBalance: '0',
							address: wallet.address
						});
					}
				}
			}

			// Transform DGT balance for consistent response format
			const transformedDgtBalance = dgtBalance.balance as number;

			return {
				dgt: {
					balance: transformedDgtBalance,
					lastTransactionAt: dgtBalance.lastTransactionAt
				},
				crypto: cryptoBalances
			};
		} catch (error) {
			logger.error('Error getting user balances:', error);
			throw new Error('Failed to retrieve wallet balances');
		}
	}

	/**
	 * Get user's deposit addresses
	 */
	async getUserDepositAddresses(userId: UserId): Promise<
		Array<{
			coinId: CoinId;
			coinSymbol: string;
			chain: string;
			address: string;
			memo?: string;
		}>
	> {
		try {
			await this.userManagementService.ensureUserWallets(userId);

			const wallets = await db.select().from(cryptoWallets).where(eq(cryptoWallets.userId, userId));

			return wallets.map((wallet) => ({
				coinId: wallet.coinId,
				coinSymbol: wallet.coinSymbol,
				chain: wallet.chain,
				address: wallet.address,
				memo: wallet.memo || undefined
			}));
		} catch (error) {
			logger.error('Error getting deposit addresses:', error);
			throw new Error('Failed to retrieve deposit addresses');
		}
	}

	/**
	 * Initiate withdrawal to blockchain
	 */
	async withdrawToBlockchain(
		userId: UserId,
		params: {
			coinId: CoinId;
			amount: string;
			toAddress: string;
			memo?: string;
		}
	): Promise<string> {
		try {
			// Check if crypto withdrawals are allowed
			const config = await walletConfigService.getConfig();
			if (!config.features.allowCryptoWithdrawals) {
				throw new Error(
					'Crypto withdrawals are currently disabled. Please use DGT for transactions.'
				);
			}

			const ccpaymentUserId = await this.userManagementService.getOrCreateCCPaymentUser(userId);

			const recordId = await this.ccpaymentService.withdrawToBlockchain({
				uid: ccpaymentUserId,
				coinId: params.coinId,
				amount: params.amount,
				toAddress: params.toAddress,
				memo: params.memo
			});

			// Store withdrawal record
			await db.insert(withdrawalRecords).values({
				userId: userId,
				recordId: recordId,
				coinId: params.coinId,
				coinSymbol: '', // Will be populated by webhook
				chain: '', // Will be populated by webhook
				amount: params.amount,
				toAddress: params.toAddress,
				toMemo: params.memo,
				withdrawType: 'blockchain',
				status: 'Processing'
			});

			return recordId;
		} catch (error) {
			logger.error('Error initiating blockchain withdrawal:', error);
			throw new Error('Failed to initiate withdrawal');
		}
	}

	/**
	 * Transfer to another CCPayment user (internal transfer)
	 */
	async transferToUser(
		fromUserId: UserId,
		params: {
			toUserId: UserId;
			coinId: CoinId;
			amount: string;
			note?: string;
		}
	): Promise<string> {
		try {
			// Check if internal transfers are allowed
			const config = await walletConfigService.getConfig();
			if (!config.features.allowInternalTransfers) {
				throw new Error('Internal transfers are currently disabled.');
			}

			const fromCCPaymentUserId =
				await this.userManagementService.getOrCreateCCPaymentUser(fromUserId);
			const toCCPaymentUserId = await this.userManagementService.getOrCreateCCPaymentUser(
				params.toUserId
			);

			const recordId = await this.ccpaymentService.internalTransfer({
				fromUid: fromCCPaymentUserId,
				toUid: toCCPaymentUserId,
				coinId: params.coinId,
				amount: params.amount
			});

			// Store transfer record
			await db.insert(internalTransfers).values({
				fromUserId: fromUserId,
				toUserId: params.toUserId,
				recordId: recordId,
				coinId: params.coinId,
				coinSymbol: '', // Will be populated by webhook
				amount: params.amount,
				note: params.note,
				status: 'Processing'
			});

			return recordId;
		} catch (error) {
			logger.error('Error initiating internal transfer:', error);
			throw new Error('Failed to transfer funds');
		}
	}

	/**
	 * Swap cryptocurrencies
	 */
	async swapCrypto(
		userId: UserId,
		params: {
			fromCoinId: CoinId;
			toCoinId: CoinId;
			fromAmount: string;
		}
	): Promise<string> {
		try {
			// Check if crypto swaps are allowed
			const config = await walletConfigService.getConfig();
			if (!config.features.allowCryptoSwaps) {
				throw new Error(
					'Crypto swaps are currently disabled. All deposits are automatically converted to DGT.'
				);
			}

			const ccpaymentUserId = await this.userManagementService.getOrCreateCCPaymentUser(userId);

			const recordId = await this.ccpaymentService.swap({
				uid: ccpaymentUserId,
				fromCoinId: params.fromCoinId,
				toCoinId: params.toCoinId,
				fromAmount: params.fromAmount
			});

			// Store swap record
			await db.insert(swapRecords).values({
				userId: userId,
				recordId: recordId,
				fromCoinId: params.fromCoinId,
				fromCoinSymbol: '', // Will be populated by webhook
				fromAmount: params.fromAmount,
				toCoinId: params.toCoinId,
				toCoinSymbol: '', // Will be populated by webhook
				toAmount: '0', // Will be populated by webhook
				status: 'Processing'
			});

			return recordId;
		} catch (error) {
			logger.error('Error initiating swap:', error);
			throw new Error('Failed to swap cryptocurrencies');
		}
	}

	/**
	 * Get user's transaction history
	 */
	async getUserTransactionHistory(
		userId: UserId,
		params?: {
			type?: 'deposit' | 'withdrawal' | 'transfer' | 'swap';
			limit?: number;
			offset?: number;
		}
	): Promise<{
		deposits: any[];
		withdrawals: any[];
		transfers: any[];
		swaps: any[];
	}> {
		try {
			const limit = params?.limit || 50;
			const offset = params?.offset || 0;

			const [deposits, withdrawals, transfers, swaps] = await Promise.all([
				// Get deposits
				!params?.type || params.type === 'deposit'
					? db
							.select()
							.from(depositRecords)
							.where(eq(depositRecords.userId, userId))
							.orderBy(desc(depositRecords.createdAt))
							.limit(limit)
							.offset(offset)
					: [],

				// Get withdrawals
				!params?.type || params.type === 'withdrawal'
					? db
							.select()
							.from(withdrawalRecords)
							.where(eq(withdrawalRecords.userId, userId))
							.orderBy(desc(withdrawalRecords.createdAt))
							.limit(limit)
							.offset(offset)
					: [],

				// Get transfers (both sent and received)
				!params?.type || params.type === 'transfer'
					? db
							.select()
							.from(internalTransfers)
							.where(
								or(eq(internalTransfers.fromUserId, userId), eq(internalTransfers.toUserId, userId))
							)
							.orderBy(desc(internalTransfers.createdAt))
							.limit(limit)
							.offset(offset)
					: [],

				// Get swaps
				!params?.type || params.type === 'swap'
					? db
							.select()
							.from(swapRecords)
							.where(eq(swapRecords.userId, userId))
							.orderBy(desc(swapRecords.createdAt))
							.limit(limit)
							.offset(offset)
					: []
			]);

			return {
				deposits,
				withdrawals,
				transfers,
				swaps
			};
		} catch (error) {
			logger.error('Error getting transaction history:', error);
			throw new Error('Failed to retrieve transaction history');
		}
	}

	/**
	 * Transfer DGT between users
	 */
	async transferDGT(
		fromUserId: UserId,
		params: {
			toUserId: UserId;
			amount: number;
			note?: string;
		}
	): Promise<{
		transactionId: ActionId;
		fromBalance: number;
		toBalance: number;
		transferId: string;
	}> {
		try {
			// Check if DGT transfers are allowed
			const config = await walletConfigService.getConfig();
			if (!config.features.allowInternalTransfers) {
				throw new Error('DGT transfers are currently disabled.');
			}

			return await dgtService.transferDGT(fromUserId, params.toUserId, params.amount, params.note);
		} catch (error) {
			logger.error('Error transferring DGT:', error);
			throw new Error(`Failed to transfer DGT: ${error.message}`);
		}
	}

	/**
	 * Get DGT transaction history
	 */
	async getDGTHistory(
		userId: UserId,
		options?: {
			limit?: number;
			offset?: number;
			type?: string;
		}
	): Promise<any[]> {
		try {
			return await dgtService.getDGTHistory(userId, options);
		} catch (error) {
			logger.error('Error getting DGT history:', error);
			throw new Error('Failed to retrieve DGT transaction history');
		}
	}

	/**
	 * Get wallet configuration (for frontend feature gates)
	 */
	async getWalletConfig(): Promise<{
		features: {
			allowCryptoWithdrawals: boolean;
			allowCryptoSwaps: boolean;
			allowDGTSpending: boolean;
			allowInternalTransfers: boolean;
		};
		dgt: {
			usdPrice: number;
			minDepositUSD: number;
			maxDGTBalance: number;
		};
		limits: {
			maxDGTTransfer: number;
		};
	}> {
		try {
			const config = await walletConfigService.getConfig();

			// Return only public configuration (hide sensitive settings)
			return {
				features: {
					allowCryptoWithdrawals: config.features.allowCryptoWithdrawals,
					allowCryptoSwaps: config.features.allowCryptoSwaps,
					allowDGTSpending: config.features.allowDGTSpending,
					allowInternalTransfers: config.features.allowInternalTransfers
				},
				dgt: {
					usdPrice: config.dgt.usdPrice,
					minDepositUSD: config.dgt.minDepositUSD,
					maxDGTBalance: config.dgt.maxDGTBalance
				},
				limits: {
					maxDGTTransfer: config.limits.maxDGTTransfer
				}
			};
		} catch (error) {
			logger.error('Error getting wallet config:', error);
			throw new Error('Failed to retrieve wallet configuration');
		}
	}

	/**
	 * Get supported cryptocurrencies
	 */
	async getSupportedCryptocurrencies(): Promise<
		Array<{
			coinId: CoinId;
			coinSymbol: string;
			coinName: string;
			chain: string;
			contract?: string;
			decimals: number;
			minDepositAmount?: string;
			minWithdrawAmount?: string;
			withdrawFee?: string;
			supportsDeposit: boolean;
			supportsWithdraw: boolean;
			supportsSwap: boolean;
			iconUrl?: string;
		}>
	> {
		try {
			// First try to get from local database
			const localTokens = await db
				.select()
				.from(supportedTokens)
				.where(eq(supportedTokens.isActive, true));

			if (localTokens.length > 0) {
				return localTokens.map((token) => ({
					coinId: token.coinId,
					coinSymbol: token.coinSymbol,
					coinName: token.coinName,
					chain: token.chain,
					contract: token.contract || undefined,
					decimals: token.decimals,
					minDepositAmount: token.minDepositAmount || undefined,
					minWithdrawAmount: token.minWithdrawAmount || undefined,
					withdrawFee: token.withdrawFee || undefined,
					supportsDeposit: token.supportsDeposit,
					supportsWithdraw: token.supportsWithdraw,
					supportsSwap: token.supportsSwap,
					iconUrl: token.iconUrl || undefined
				}));
			}

			// Fallback to CCPayment API
			const apiTokens = await this.ccpaymentService.getSupportedCoins();
			return apiTokens.map((token) => ({
				coinId: token.coinId,
				coinSymbol: token.coinSymbol,
				coinName: token.coinName,
				chain: token.chain,
				contract: token.contract,
				decimals: token.decimals || 18,
				supportsDeposit: true,
				supportsWithdraw: true,
				supportsSwap: true
			}));
		} catch (error) {
			logger.error('Error getting supported cryptocurrencies:', error);
			throw new Error('Failed to retrieve supported cryptocurrencies');
		}
	}

	/**
	 * Ensure CCPayment wallet exists for user (used by auth controller)
	 */
	async ensureCcPaymentWallet(userId: UserId): Promise<string> {
		try {
			return await this.userManagementService.getOrCreateCCPaymentUser(userId);
		} catch (error) {
			logger.error('Error ensuring CCPayment wallet:', error);
			throw new Error('Failed to ensure CCPayment wallet');
		}
	}
}

// Export singleton instance
export const walletService = new WalletService();
