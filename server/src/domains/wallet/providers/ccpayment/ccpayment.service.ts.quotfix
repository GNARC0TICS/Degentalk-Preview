/**
 * CCPayment Service - Orchestration Layer
 *
 * QUALITY IMPROVEMENT: Decomposed god object into focused services
 * This file now orchestrates between specialized CCPayment services
 */

import { logger } from '@core/logger';
import { WalletError, ErrorCodes } from '@core/errors';
import type { UserId, Id } from '@shared/types/ids';

// Import specialized services
import { ccpaymentApiService } from './ccpayment-api.service';
import { ccpaymentDepositService } from './ccpayment-deposit.service';
import { ccpaymentBalanceService } from './ccpayment-balance.service';
import { ccpaymentTokenService } from './ccpayment-token.service';
import { db } from '@db';
import { ccpaymentUsers, users } from '@schema';
import { eq } from 'drizzle-orm';

// Re-export types for backward compatibility
export type {
	DepositRequest,
	DepositAddress,
	CCPaymentOrderStatus
} from './ccpayment-deposit.service';

export type {
	CryptoBalance,
	TransactionResponse,
	TransactionHistoryRequest,
	TransactionHistoryResponse
} from './ccpayment-balance.service';

export interface CCPaymentUser {
	id: string;
	email: string;
	createdAt: string;
	status: 'active' | 'suspended' | 'pending';
}

export interface WithdrawalRequest {
	amount: number;
	currency: string;
	orderId: string;
	address: string;
	notifyUrl: string;
}

export interface CCPaymentWithdrawalResponse {
	orderId: string;
	status: 'pending' | 'processing' | 'success' | 'failed';
	txHash?: string;
	fee: number;
	actualAmount: number;
	estimatedTime?: string;
	createdAt: string;
}

export interface CCPaymentWebhookEvent {
	orderId: string;
	status: string;
	amount: string;
	currency: string;
	paidAmount?: string;
	paidCurrency?: string;
	txHash?: string;
	type: 'deposit' | 'withdrawal';
	timestamp: string;
	signature: string;
	metadata?: Record<string, any>;
}

export class CCPaymentService {
	/**
	 * Create deposit address - delegates to DepositService
	 */
	async createDepositAddress(ccPaymentUserId: string, coin: string) {
		return ccpaymentDepositService.createDepositAddress(ccPaymentUserId, coin);
	}

	/**
	 * Get user crypto balances - delegates to BalanceService
	 */
	async getUserCryptoBalances(ccPaymentUserId: string) {
		return ccpaymentBalanceService.getUserCryptoBalances(ccPaymentUserId);
	}

	/**
	 * Get transaction history - delegates to BalanceService
	 */
	async getTransactionHistory(request: TransactionHistoryRequest) {
		return ccpaymentBalanceService.getTransactionHistory(request);
	}

	/**
	 * Create deposit link - delegates to DepositService
	 */
	async createDepositLink(request: DepositRequest) {
		return ccpaymentDepositService.createDepositLink(request);
	}

	/**
	 * Get transaction status - delegates to DepositService
	 */
	async getTransactionStatus(orderId: string) {
		return ccpaymentDepositService.getDepositStatus(orderId);
	}

	/**
	 * Request withdrawal - temporarily simplified
	 */
	async requestWithdrawal(request: WithdrawalRequest): Promise<CCPaymentWithdrawalResponse> {
		try {
			logger.info('CCPaymentService', 'Requesting withdrawal', {
				orderId: request.orderId,
				amount: request.amount,
				currency: request.currency
			});

			const params = {
				order_id: request.orderId,
				amount: request.amount.toString(),
				currency: request.currency,
				address: request.address,
				notify_url: request.notifyUrl
			};

			const response = await ccpaymentApiService.makeRequest<{
				order_id: string;
				status: string;
				tx_hash?: string;
				fee: number;
				actual_amount: number;
				estimated_time?: string;
				created_at: string;
			}>('/v1/withdrawal/create', params);

			const withdrawal: CCPaymentWithdrawalResponse = {
				orderId: response.order_id,
				status: response.status as any,
				txHash: response.tx_hash,
				fee: response.fee,
				actualAmount: response.actual_amount,
				estimatedTime: response.estimated_time,
				createdAt: response.created_at
			};

			logger.info('CCPaymentService', 'Withdrawal requested successfully', {
				orderId: request.orderId,
				status: withdrawal.status
			});

			return withdrawal;
		} catch (error) {
			logger.error('CCPaymentService', 'Error requesting withdrawal', {
				request,
				error
			});

			if (error instanceof WalletError) {
				throw error;
			}

			throw new WalletError(
				'Failed to request withdrawal',
				ErrorCodes.PAYMENT_PROVIDER_ERROR,
				500,
				{ request, originalError: error }
			);
		}
	}

	/**
	 * Process webhook event
	 */
	async processWebhookEvent(
		event: CCPaymentWebhookEvent,
		onDeposit?: (
			orderId: string,
			amount: string,
			currency: string,
			txHash?: string
		) => Promise<void>,
		onWithdrawal?: (orderId: string, status: string, txHash?: string) => Promise<void>
	): Promise<void> {
		try {
			logger.info('CCPaymentService', 'Processing webhook event', {
				orderId: event.orderId,
				type: event.type,
				status: event.status
			});

			// Validate webhook signature
			const payload = JSON.stringify(event);
			if (!ccpaymentApiService.validateWebhookSignature(payload, event.signature)) {
				throw new WalletError('Invalid webhook signature', ErrorCodes.VALIDATION_ERROR, 400, {
					orderId: event.orderId
				});
			}

			if (event.type === 'deposit' && event.status === 'success' && onDeposit) {
				await onDeposit(event.orderId, event.amount, event.currency, event.txHash);
			} else if (event.type === 'withdrawal' && onWithdrawal) {
				await onWithdrawal(event.orderId, event.status, event.txHash);
			}

			logger.info('CCPaymentService', 'Webhook event processed successfully', {
				orderId: event.orderId,
				type: event.type
			});
		} catch (error) {
			logger.error('CCPaymentService', 'Error processing webhook event', {
				event,
				error
			});
			throw error;
		}
	}

	/**
	 * Swap cryptocurrencies
	 */
	async swap(params: {
		uid: string;
		fromCoinId: number;
		toCoinId: number;
		fromAmount: string;
	}): Promise<string> {
		try {
			logger.info('CCPaymentService', 'Initiating swap', { uid: params.uid, from: params.fromCoinId, to: params.toCoinId });

			const apiParams = {
				user_id: params.uid,
				from_coin_id: params.fromCoinId,
				to_coin_id: params.toCoinId,
				amount: params.fromAmount,
			};

			const response = await ccpaymentApiService.makeRequest<{
				record_id: string;
			}>('/v1/swap/create', apiParams);

			logger.info('CCPaymentService', 'Swap initiated successfully', {
				uid: params.uid,
				recordId: response.record_id,
			});

			return response.record_id;
		} catch (error) {
			logger.error('CCPaymentService', 'Error initiating swap', { params, error });
			if (error instanceof WalletError) {
				throw error;
			}
			throw new WalletError('Failed to initiate swap', ErrorCodes.PAYMENT_PROVIDER_ERROR);
		}
	}

	/**
	 * Get or create a CCPayment user for a Degentalk user
	 */
	async getOrCreateCCPaymentUser(userId: UserId): Promise<string> {
		try {
			// First check if user already has a CCPayment mapping
			const existingMapping = await db
				.select()
				.from(ccpaymentUsers)
				.where(eq(ccpaymentUsers.userId, userId))
				.limit(1);

			if (existingMapping.length > 0) {
				return existingMapping[0].ccpaymentUserId;
			}

			// Get user details from Degentalk
			const userDetails = await db
				.select({
					id: users.id,
					username: users.username,
					email: users.email,
				})
				.from(users)
				.where(eq(users.id, userId))
				.limit(1);

			if (userDetails.length === 0) {
				throw new WalletError('User not found', ErrorCodes.NOT_FOUND);
			}

			const user = userDetails[0];

			// Create CCPayment user
			const ccpaymentUserId = await this.createCcPaymentWalletForUser(user.id);

			// Store the mapping
			await db.insert(ccpaymentUsers).values({
				userId: user.id,
				ccpaymentUserId: ccpaymentUserId,
			});

			return ccpaymentUserId;
		} catch (error) {
			logger.error('Error getting/creating CCPayment user:', error);
			if (error instanceof WalletError) {
				throw error;
			}
			throw new WalletError('Failed to initialize user wallet', ErrorCodes.UNKNOWN_ERROR);
		}
	}

	/**
	 * Create CCPayment wallet for user
	 */
	async createCcPaymentWalletForUser(userId: UserId): Promise<string> {
		try {
			logger.info('CCPaymentService', 'Creating CCPayment wallet for user', { userId });

			const params = {
				user_id: userId.toString(),
				email: `user${userId}@degentalk.com` // Generate email for CCPayment
			};

			const response = await ccpaymentApiService.makeRequest<{
				user_id: string;
				status: string;
			}>('/v1/user/create', params);

			logger.info('CCPaymentService', 'CCPayment wallet created successfully', {
				userId,
				ccPaymentUserId: response.user_id
			});

			return response.user_id;
		} catch (error) {
			logger.error('CCPaymentService', 'Error creating CCPayment wallet', {
				userId,
				error
			});

			if (error instanceof WalletError) {
				throw error;
			}

			throw new WalletError(
				'Failed to create CCPayment wallet',
				ErrorCodes.PAYMENT_PROVIDER_ERROR,
				500,
				{ userId, originalError: error }
			);
		}
	}

	/**
	 * Health check for CCPayment services
	 */
	async healthCheck(): Promise<boolean> {
		return ccpaymentApiService.healthCheck();
	}

	/**
	 * Get supported currencies
	 */
	async getSupportedDepositCurrencies(): Promise<string[]> {
		return ccpaymentDepositService.getSupportedDepositCurrencies();
	}

	/**
	 * Get total USD value for user
	 */
	async getUserTotalUSDValue(ccPaymentUserId: string): Promise<number> {
		return ccpaymentBalanceService.getTotalUSDValue(ccPaymentUserId);
	}

	/**
	 * Get token information with logo and network details
	 */
	async getTokenInfo(coinId: Id<'coin'>) {
		return ccpaymentTokenService.getTokenInfo(coinId);
	}

	/**
	 * Get current token prices in USDT
	 */
	async getTokenPrices(coinIds: number[]) {
		return ccpaymentTokenService.getTokenPrices(coinIds);
	}

	/**
	 * Get withdrawal fee for specific token and chain
	 */
	async getWithdrawFee(coinId: Id<'coin'>, chain: string) {
		return ccpaymentTokenService.getWithdrawFee(coinId, chain);
	}

	/**
	 * Check if withdrawal address is valid
	 */
	async checkWithdrawalAddressValidity(chain: string, address: string) {
		return ccpaymentTokenService.checkWithdrawalAddressValidity(chain, address);
	}

	/**
	 * Rescan lost transaction
	 */
	async rescanLostTransaction(params: {
		chain: string;
		toAddress: string;
		txId: string;
		memo?: string;
	}) {
		return ccpaymentTokenService.rescanLostTransaction(params);
	}

	/**
	 * Get app balance list (merchant balances)
	 */
	async getAppBalanceList() {
		return ccpaymentTokenService.getAppBalanceList();
	}

	/**
	 * Get specific app coin balance
	 */
	async getAppCoinBalance(coinId: Id<'coin'>) {
		return ccpaymentTokenService.getAppCoinBalance(coinId);
	}
}

// Export singleton instance
export const ccpaymentService = new CCPaymentService();
