/**
 * CCPayment Deposit Service
 *
 * QUALITY IMPROVEMENT: Extracted from ccpayment.service.ts god object
 * Handles deposit-specific operations with proper separation of concerns
 */

import { logger } from '@server/src/core/logger';
import { WalletError, ErrorCodes } from '@server/src/core/errors';
import { ccpaymentApiService } from './ccpayment-api.service';

export interface DepositRequest {
	amount: number;
	currency: string;
	orderId: string;
	productName: string;
	redirectUrl: string;
	notifyUrl: string;
}

export interface DepositAddress {
	address: string;
	memo?: string;
	qrCode?: string;
	coin: string;
	network: string;
}

export interface CCPaymentOrderStatus {
	orderId: string;
	status: 'pending' | 'processing' | 'success' | 'failed' | 'expired';
	amount: string;
	currency: string;
	paidAmount?: string;
	paidCurrency?: string;
	txHash?: string;
	createdAt: string;
	updatedAt: string;
	expiresAt?: string;
	metadata?: Record<string, any>;
}

export class CCPaymentDepositService {
	/**
	 * Create deposit address for a specific cryptocurrency
	 */
	async createDepositAddress(ccPaymentUserId: string, coin: string): Promise<DepositAddress> {
		try {
			logger.info('CCPaymentDepositService', 'Creating deposit address', {
				ccPaymentUserId,
				coin
			});

			const params = {
				user_id: ccPaymentUserId,
				coin: coin.toUpperCase()
			};

			const response = await ccpaymentApiService.makeRequest<{
				address: string;
				memo?: string;
				qr_code?: string;
				coin: string;
				network: string;
			}>('/v1/address/deposit', params);

			const depositAddress: DepositAddress = {
				address: response.address,
				memo: response.memo,
				qrCode: response.qr_code,
				coin: response.coin,
				network: response.network
			};

			logger.info('CCPaymentDepositService', 'Deposit address created successfully', {
				ccPaymentUserId,
				coin,
				address: depositAddress.address
			});

			return depositAddress;
		} catch (error) {
			logger.error('CCPaymentDepositService', 'Error creating deposit address', {
				ccPaymentUserId,
				coin,
				error
			});

			if (error instanceof WalletError) {
				throw error;
			}

			throw new WalletError(
				'Failed to create deposit address',
				ErrorCodes.PAYMENT_PROVIDER_ERROR,
				500,
				{ ccPaymentUserId, coin, originalError: error }
			);
		}
	}

	/**
	 * Create deposit payment link
	 */
	async createDepositLink(request: DepositRequest): Promise<string> {
		try {
			logger.info('CCPaymentDepositService', 'Creating deposit link', {
				orderId: request.orderId,
				amount: request.amount,
				currency: request.currency
			});

			const params = {
				order_id: request.orderId,
				amount: request.amount.toString(),
				currency: request.currency,
				product_name: request.productName,
				redirect_url: request.redirectUrl,
				notify_url: request.notifyUrl
			};

			const response = await ccpaymentApiService.makeRequest<{
				payment_url: string;
				order_id: string;
			}>('/v1/deposit/create', params);

			logger.info('CCPaymentDepositService', 'Deposit link created successfully', {
				orderId: request.orderId,
				paymentUrl: response.payment_url
			});

			return response.payment_url;
		} catch (error) {
			logger.error('CCPaymentDepositService', 'Error creating deposit link', {
				request,
				error
			});

			if (error instanceof WalletError) {
				throw error;
			}

			throw new WalletError(
				'Failed to create deposit link',
				ErrorCodes.PAYMENT_PROVIDER_ERROR,
				500,
				{ request, originalError: error }
			);
		}
	}

	/**
	 * Get deposit transaction status
	 */
	async getDepositStatus(orderId: string): Promise<CCPaymentOrderStatus> {
		try {
			logger.debug('CCPaymentDepositService', 'Getting deposit status', { orderId });

			const params = {
				order_id: orderId
			};

			const response = await ccpaymentApiService.makeRequest<{
				order_id: string;
				status: string;
				amount: string;
				currency: string;
				paid_amount?: string;
				paid_currency?: string;
				tx_hash?: string;
				created_at: string;
				updated_at: string;
				expires_at?: string;
				metadata?: Record<string, any>;
			}>('/v1/deposit/status', params);

			const status: CCPaymentOrderStatus = {
				orderId: response.order_id,
				status: response.status as any,
				amount: response.amount,
				currency: response.currency,
				paidAmount: response.paid_amount,
				paidCurrency: response.paid_currency,
				txHash: response.tx_hash,
				createdAt: response.created_at,
				updatedAt: response.updated_at,
				expiresAt: response.expires_at,
				metadata: response.metadata
			};

			return status;
		} catch (error) {
			logger.error('CCPaymentDepositService', 'Error getting deposit status', {
				orderId,
				error
			});

			if (error instanceof WalletError) {
				throw error;
			}

			throw new WalletError(
				'Failed to get deposit status',
				ErrorCodes.PAYMENT_PROVIDER_ERROR,
				500,
				{ orderId, originalError: error }
			);
		}
	}

	/**
	 * List available deposit currencies
	 */
	async getSupportedDepositCurrencies(): Promise<string[]> {
		try {
			const response = await ccpaymentApiService.makeRequest<{
				currencies: string[];
			}>('/v1/deposit/currencies', {});

			return response.currencies;
		} catch (error) {
			logger.error('CCPaymentDepositService', 'Error getting supported currencies', { error });

			if (error instanceof WalletError) {
				throw error;
			}

			throw new WalletError(
				'Failed to get supported deposit currencies',
				ErrorCodes.PAYMENT_PROVIDER_ERROR,
				500,
				{ originalError: error }
			);
		}
	}
}

// Export singleton instance
export const ccpaymentDepositService = new CCPaymentDepositService();
