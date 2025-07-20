/**
 * CCPayment Client
 *
 * This service provides methods to interact with the CCPayment API
 * for deposits, withdrawals, and transaction verification.
 */

import axios from 'axios';
import { createSignature, verifyWebhookSignature } from './utils';
import { CCPaymentConfig, DepositRequest, WithdrawalRequest, TransactionStatus } from './types';

// Default config from environment variables
const DEFAULT_CONFIG = {
	apiUrl: import.meta.env.VITE_CCPAYMENT_API_URL || 'https://api.ccpayment.com',
	appId: import.meta.env.VITE_CCPAYMENT_APP_ID || '',
	appSecret: import.meta.env.VITE_CCPAYMENT_APP_SECRET || ''
};

/**
 * CCPaymentClient provides methods to interact with the CCPayment API
 */
export class CCPaymentClient {
	private apiUrl: string;
	private appId: string;
	private appSecret: string;

	constructor(config: CCPaymentConfig = {}) {
		this.apiUrl = config.apiUrl || DEFAULT_CONFIG.apiUrl;
		this.appId = config.appId || DEFAULT_CONFIG.appId;
		this.appSecret = config.appSecret || DEFAULT_CONFIG.appSecret;

		if (!this.appId || !this.appSecret) {
			throw new Error('CCPaymentClient: Missing APP_ID or APP_SECRET');
		}
	}

	/**
	 * Create axios instance with proper headers
	 */
	private createAxiosInstance(data: Record<string, any>) {
		const timestamp = Math.floor(Date.now() / 1000);
		const signature = createSignature(this.appId, this.appSecret, data, timestamp);

		return axios.create({
			baseURL: this.apiUrl,
			headers: {
				'Content-Type': 'application/json',
				'X-CCPAYMENT-APP-ID': this.appId,
				'X-CCPAYMENT-TIMESTAMP': timestamp.toString(),
				'X-CCPAYMENT-SIGNATURE': signature
			}
		});
	}

	/**
	 * Create a payment link for user deposit
	 */
	async createDepositLink(request: DepositRequest): Promise<string> {
		try {
			const data = {
				amount: request.amount.toString(),
				currency: request.currency,
				order_id: request.orderId,
				product_name: request.productName,
				redirect_url: request.redirectUrl,
				notify_url: request.notifyUrl
			};

			const http = this.createAxiosInstance(data);
			const response = await http.post('/api/v1/deposit/create', data);

			if (response.data?.code !== 0) {
				throw new Error(`CCPayment API error: ${response.data?.message || 'Unknown error'}`);
			}

			return response.data.data.payment_link;
		} catch (error) {
			throw new Error(`Failed to create deposit link: ${error.message}`);
		}
	}

	/**
	 * Request a withdrawal
	 */
	async requestWithdrawal(request: WithdrawalRequest): Promise<string> {
		try {
			const data = {
				amount: request.amount.toString(),
				currency: request.currency,
				order_id: request.orderId,
				address: request.address,
				notify_url: request.notifyUrl
			};

			const http = this.createAxiosInstance(data);
			const response = await http.post('/api/v1/withdrawal/create', data);

			if (response.data?.code !== 0) {
				throw new Error(`CCPayment API error: ${response.data?.message || 'Unknown error'}`);
			}

			return response.data.data.transaction_id;
		} catch (error) {
			throw new Error(`Failed to request withdrawal: ${error.message}`);
		}
	}

	/**
	 * Get transaction status
	 */
	async getTransactionStatus(orderId: string): Promise<TransactionStatus> {
		try {
			const data = { order_id: orderId };

			const http = this.createAxiosInstance(data);
			const response = await http.get(`/api/v1/transaction/${orderId}`);

			if (response.data?.code !== 0) {
				throw new Error(`CCPayment API error: ${response.data?.message || 'Unknown error'}`);
			}

			return {
				orderId: response.data.data.order_id,
				status: response.data.data.status,
				amount: Number(response.data.data.amount),
				txHash: response.data.data.tx_hash,
				createdAt: response.data.data.created_at,
				updatedAt: response.data.data.updated_at
			};
		} catch (error) {
			throw new Error(`Failed to get transaction status: ${error.message}`);
		}
	}

	/**
	 * Verify webhook signature
	 */
	verifyWebhookSignature(data: Record<string, any>, signature: string, timestamp: string): boolean {
		return verifyWebhookSignature(this.appId, this.appSecret, data, signature, timestamp);
	}
}

// Create and export a singleton instance
export const ccpaymentClient = new CCPaymentClient();
