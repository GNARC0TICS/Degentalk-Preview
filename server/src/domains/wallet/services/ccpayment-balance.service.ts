/**
 * CCPayment Balance Service
 *
 * QUALITY IMPROVEMENT: Extracted from ccpayment.service.ts god object
 * Handles balance and transaction history operations with proper separation of concerns
 */

import { logger } from '@server/src/core/logger';
import { WalletError, ErrorCodes } from '@server/src/core/errors';
import { ccpaymentApiService } from './ccpayment-api.service';

export interface CryptoBalance {
	coin: string;
	available: string;
	frozen: string;
	total: string;
	usdValue?: string;
}

export interface TransactionResponse {
	orderId: string;
	status: string;
	amount: number;
	txHash?: string;
	createdAt: string;
	updatedAt: string;
	currency: string;
	type: 'deposit' | 'withdrawal';
	fee?: number;
	metadata?: Record<string, any>;
}

export interface TransactionHistoryRequest {
	ccPaymentUserId: string;
	currency?: string;
	type?: 'deposit' | 'withdrawal';
	page?: number;
	limit?: number;
	startDate?: string;
	endDate?: string;
}

export interface TransactionHistoryResponse {
	transactions: TransactionResponse[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export class CCPaymentBalanceService {
	/**
	 * Get user's cryptocurrency balances
	 */
	async getUserCryptoBalances(ccPaymentUserId: string): Promise<CryptoBalance[]> {
		try {
			logger.debug('CCPaymentBalanceService', 'Getting user crypto balances', {
				ccPaymentUserId
			});

			const params = {
				user_id: ccPaymentUserId
			};

			const response = await ccpaymentApiService.makeRequest<{
				balances: Array<{
					coin: string;
					available: string;
					frozen: string;
					total: string;
					usd_value?: string;
				}>;
			}>('/v1/balance/list', params);

			const balances: CryptoBalance[] = response.balances.map((balance) => ({
				coin: balance.coin,
				available: balance.available,
				frozen: balance.frozen,
				total: balance.total,
				usdValue: balance.usd_value
			}));

			logger.debug('CCPaymentBalanceService', 'Retrieved crypto balances', {
				ccPaymentUserId,
				balanceCount: balances.length
			});

			return balances;
		} catch (error) {
			logger.error('CCPaymentBalanceService', 'Error getting user crypto balances', {
				ccPaymentUserId,
				error
			});

			if (error instanceof WalletError) {
				throw error;
			}

			throw new WalletError(
				'Failed to get crypto balances',
				ErrorCodes.PAYMENT_PROVIDER_ERROR,
				500,
				{ ccPaymentUserId, originalError: error }
			);
		}
	}

	/**
	 * Get specific cryptocurrency balance
	 */
	async getCryptoBalance(ccPaymentUserId: string, coin: string): Promise<CryptoBalance | null> {
		try {
			const balances = await this.getUserCryptoBalances(ccPaymentUserId);
			return balances.find((balance) => balance.coin.toUpperCase() === coin.toUpperCase()) || null;
		} catch (error) {
			logger.error('CCPaymentBalanceService', 'Error getting specific crypto balance', {
				ccPaymentUserId,
				coin,
				error
			});
			throw error;
		}
	}

	/**
	 * Get transaction history for a user
	 */
	async getTransactionHistory(
		request: TransactionHistoryRequest
	): Promise<TransactionHistoryResponse> {
		try {
			logger.debug('CCPaymentBalanceService', 'Getting transaction history', { request });

			const params = {
				user_id: request.ccPaymentUserId,
				currency: request.currency,
				type: request.type,
				page: request.page || 1,
				limit: Math.min(request.limit || 20, 100),
				start_date: request.startDate,
				end_date: request.endDate
			};

			// Remove undefined values
			Object.keys(params).forEach((key) => {
				if (params[key] === undefined) {
					delete params[key];
				}
			});

			const response = await ccpaymentApiService.makeRequest<{
				transactions: Array<{
					order_id: string;
					status: string;
					amount: number;
					tx_hash?: string;
					created_at: string;
					updated_at: string;
					currency: string;
					type: string;
					fee?: number;
					metadata?: Record<string, any>;
				}>;
				total: number;
				page: number;
				limit: number;
				total_pages: number;
			}>('/v1/transaction/history', params);

			const transactions: TransactionResponse[] = response.transactions.map((tx) => ({
				orderId: tx.order_id,
				status: tx.status,
				amount: tx.amount,
				txHash: tx.tx_hash,
				createdAt: tx.created_at,
				updatedAt: tx.updated_at,
				currency: tx.currency,
				type: tx.type as 'deposit' | 'withdrawal',
				fee: tx.fee,
				metadata: tx.metadata
			}));

			const result: TransactionHistoryResponse = {
				transactions,
				total: response.total,
				page: response.page,
				limit: response.limit,
				totalPages: response.total_pages
			};

			logger.debug('CCPaymentBalanceService', 'Retrieved transaction history', {
				ccPaymentUserId: request.ccPaymentUserId,
				transactionCount: transactions.length,
				total: response.total
			});

			return result;
		} catch (error) {
			logger.error('CCPaymentBalanceService', 'Error getting transaction history', {
				request,
				error
			});

			if (error instanceof WalletError) {
				throw error;
			}

			throw new WalletError(
				'Failed to get transaction history',
				ErrorCodes.PAYMENT_PROVIDER_ERROR,
				500,
				{ request, originalError: error }
			);
		}
	}

	/**
	 * Get total USD value of all balances
	 */
	async getTotalUSDValue(ccPaymentUserId: string): Promise<number> {
		try {
			const balances = await this.getUserCryptoBalances(ccPaymentUserId);

			const totalUSD = balances.reduce((sum, balance) => {
				const usdValue = parseFloat(balance.usdValue || '0');
				return sum + usdValue;
			}, 0);

			return totalUSD;
		} catch (error) {
			logger.error('CCPaymentBalanceService', 'Error calculating total USD value', {
				ccPaymentUserId,
				error
			});
			throw error;
		}
	}
}

// Export singleton instance
export const ccpaymentBalanceService = new CCPaymentBalanceService();
