/**
 * CCPayment Client for Server-Side Integration
 *
 * This service handles secure interactions with the CCPayment API
 * for deposit, withdrawal, and transaction verification.
 */

import axios from 'axios';
import crypto from 'crypto';
import { logger } from '../src/core/logger';

// Configuration
const CCPAYMENT_API_URL = process.env.CCPAYMENT_API_URL || 'https://api.ccpayment.com';
const CCPAYMENT_APP_ID = process.env.CCPAYMENT_APP_ID;
const CCPAYMENT_APP_SECRET = process.env.CCPAYMENT_APP_SECRET;

// Interfaces
interface CCPaymentConfig {
	apiUrl?: string;
	appId?: string;
	appSecret?: string;
}

interface DepositRequest {
	amount: number;
	currency: string;
	orderId: string;
	productName: string;
	redirectUrl: string;
	notifyUrl: string;
}

interface WithdrawalRequest {
	amount: number;
	currency: string;
	orderId: string;
	address: string;
	notifyUrl: string;
}

interface TransactionResponse {
	orderId: string;
	status: string;
	amount: number;
	txHash?: string;
	createdAt: string;
	updatedAt: string;
}

/**
 * Creates a signature for CCPayment API requests
 */
function createSignature(
	appId: string,
	appSecret: string,
	data: Record<string, any>,
	timestamp: number
): string {
	try {
		// Sort the parameters alphabetically by key
		const sortedParams = Object.keys(data)
			.sort()
			.reduce((result: Record<string, any>, key: string) => {
				result[key] = data[key];
				return result;
			}, {});

		// Convert to JSON string
		const jsonStr = JSON.stringify(sortedParams);

		// Create the signature string: appId + timestamp + jsonStr + appSecret
		const signatureStr = `${appId}${timestamp}${jsonStr}${appSecret}`;

		// Create SHA256 hash
		return crypto.createHash('sha256').update(signatureStr).digest('hex');
	} catch (error) {
		logger.error('Error creating CCPayment signature:', error);
		throw new Error('Failed to create CCPayment API signature');
	}
}

/**
 * CCPayment client for secure API interactions
 */
class CCPaymentClient {
	private apiUrl: string;
	private appId: string;
	private appSecret: string;

	constructor(config: CCPaymentConfig = {}) {
		this.apiUrl = config.apiUrl || CCPAYMENT_API_URL;
		this.appId = config.appId || CCPAYMENT_APP_ID;
		this.appSecret = config.appSecret || CCPAYMENT_APP_SECRET;

		if (!this.appId || !this.appSecret) {
			logger.warn(
				'CCPaymentClient initialized without APP_ID or APP_SECRET. Integration will not function properly.'
			);
		}
	}

	/**
	 * Create axios instance with proper security headers
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
	 * Create a payment link for user deposits
	 */
	async createDepositLink(request: DepositRequest): Promise<string> {
		try {
			logger.info('Creating CCPayment deposit link', {
				amount: request.amount,
				currency: request.currency,
				orderId: request.orderId
			});

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
				logger.error('CCPayment API error:', response.data);
				throw new Error(`CCPayment API error: ${response.data?.message || 'Unknown error'}`);
			}

			return response.data.data.payment_link;
		} catch (error) {
			logger.error('Error creating CCPayment deposit link:', error);
			throw new Error(`Failed to create deposit link: ${error.message}`);
		}
	}

	/**
	 * Process a withdrawal request
	 */
	async requestWithdrawal(request: WithdrawalRequest): Promise<string> {
		try {
			logger.info('Requesting CCPayment withdrawal', {
				amount: request.amount,
				currency: request.currency,
				orderId: request.orderId
			});

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
				logger.error('CCPayment API error:', response.data);
				throw new Error(`CCPayment API error: ${response.data?.message || 'Unknown error'}`);
			}

			return response.data.data.transaction_id;
		} catch (error) {
			logger.error('Error requesting CCPayment withdrawal:', error);
			throw new Error(`Failed to request withdrawal: ${error.message}`);
		}
	}

	/**
	 * Check transaction status
	 */
	async getTransactionStatus(orderId: string): Promise<TransactionResponse> {
		try {
			logger.info('Checking CCPayment transaction status', { orderId });

			const data = { order_id: orderId };

			const http = this.createAxiosInstance(data);
			const response = await http.get(`/api/v1/transaction/${orderId}`);

			if (response.data?.code !== 0) {
				logger.error('CCPayment API error:', response.data);
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
			logger.error('Error checking CCPayment transaction status:', error);
			throw new Error(`Failed to check transaction status: ${error.message}`);
		}
	}

	/**
	 * Verify webhook signature
	 */
	verifyWebhookSignature(data: Record<string, any>, signature: string, timestamp: string): boolean {
		try {
			const calculatedSignature = createSignature(
				this.appId,
				this.appSecret,
				data,
				parseInt(timestamp)
			);
			return calculatedSignature === signature;
		} catch (error) {
			logger.error('Error verifying CCPayment webhook signature:', error);
			return false;
		}
	}
}

// Export a singleton instance
export const ccpaymentClient = new CCPaymentClient();

// Export interfaces for use in other files
export type { CCPaymentConfig, DepositRequest, WithdrawalRequest, TransactionResponse };
