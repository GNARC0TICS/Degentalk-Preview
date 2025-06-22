/**
 * CCPayment Integration Service
 *
 * [REFAC-CCPAYMENT]
 *
 * This service handles all interactions with the CCPayment API, including:
 * - Deposit and withdrawal operations
 * - Wallet management
 * - Transaction verification and history
 * - Balance inquiries
 */

import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import crypto from 'crypto';
import { logger } from '../../core/logger';
// Database imports removed for now - will be added back when we implement database integration
import { WalletError, ErrorCodes } from '../../core/errors';
import { walletConfig } from '@shared/wallet.config';

// Interfaces
export interface CCPaymentConfig {
	apiUrl?: string;
	appId?: string;
	appSecret?: string;
	notificationUrl?: string;
}

export interface DepositRequest {
	amount: number;
	currency: string;
	orderId: string;
	productName: string;
	redirectUrl: string;
	notifyUrl: string;
}

export interface WithdrawalRequest {
	amount: number;
	currency: string;
	orderId: string;
	address: string;
	notifyUrl: string;
}

export interface TransactionResponse {
	orderId: string;
	status: string;
	amount: number;
	txHash?: string;
	createdAt: string;
	updatedAt: string;
}

export interface CryptoBalance {
	currency: string;
	balance: number;
	available: number;
	frozen: number;
	network?: string;
	usdValue?: number;
}

export interface CCPaymentUser {
	id: string;
	name?: string;
	email?: string;
	createdAt: string;
}

export interface DepositAddress {
	address: string;
	currency: string;
	network: string;
	expireAt?: string;
	qrCodeUrl?: string;
}

export interface CCPaymentOrderStatus {
	orderId: string;
	merchantOrderId: string;
	status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
	amount: string;
	actualAmount?: string;
	currency: string;
	network: string;
	fromAddress?: string;
	toAddress: string;
	txHash?: string;
	expiredAt?: string;
	createdAt: string;
	updatedAt: string;
}

export interface CCPaymentWithdrawalResponse {
	orderId: string;
	merchantOrderId: string;
	status: 'pending' | 'processing' | 'completed' | 'failed';
	amount: string;
	fee: string;
	currency: string;
	network: string;
	address: string;
	txHash?: string;
	createdAt: string;
}

export interface CCPaymentWebhookEvent {
	eventType: 'deposit_completed' | 'deposit_failed' | 'withdrawal_completed' | 'withdrawal_failed';
	orderId: string;
	merchantOrderId: string;
	status: string;
	amount: string;
	actualAmount?: string;
	currency: string;
	network: string;
	txHash?: string;
	fromAddress?: string;
	toAddress?: string;
	createdAt: string;
	updatedAt: string;
}

/**
 * Create signature for CCPayment API requests
 * CCPayment v2 API signature algorithm: appId + timestamp + JSON.stringify(requestBody)
 */
function createSignature(
	appId: string,
	appSecret: string,
	data: Record<string, any>,
	timestamp: number
): string {
	// CCPayment v2 signature algorithm
	const dataString = Object.keys(data).length > 0 ? JSON.stringify(data) : '';
	const stringToSign = appId + timestamp + dataString;

	// Create HMAC SHA256 hash
	return crypto.createHmac('sha256', appSecret).update(stringToSign).digest('hex');
}

/**
 * CCPayment service for interacting with CCPayment API
 * [MOVED-FROM: server/services/ccpayment-client.ts]
 */
export class CCPaymentService {
	private apiUrl: string;
	private appId: string;
	private appSecret: string;
	private notificationUrl: string;

	constructor(config: CCPaymentConfig = {}) {
		this.apiUrl =
			config.apiUrl || process.env.CCPAYMENT_API_URL || 'https://ccpayment.com/ccpayment/v2';
		this.appId = config.appId || process.env.CCPAYMENT_APP_ID || '';
		this.appSecret = config.appSecret || process.env.CCPAYMENT_APP_SECRET || '';
		this.notificationUrl = config.notificationUrl || process.env.CCPAYMENT_NOTIFICATION_URL || '';

		if (!this.appId || !this.appSecret) {
			logger.warn('CCPaymentService', 'Initialized without app ID or secret');
		}
	}

	/**
	 * Create axios instance with necessary headers and signature
	 */
	private createAxiosInstance(data: Record<string, any>): AxiosInstance {
		const timestamp = Math.floor(Date.now() / 1000);
		const signature = createSignature(this.appId, this.appSecret, data, timestamp);

		return axios.create({
			baseURL: this.apiUrl,
			headers: {
				'Content-Type': 'application/json',
				Appid: this.appId,
				Timestamp: timestamp.toString(),
				Sign: signature
			}
		});
	}

	/**
	 * Make a request to CCPayment API with proper authentication
	 */
	private async makeRequest<T>(
		endpoint: string,
		method: 'GET' | 'POST' | 'PUT' | 'DELETE',
		data: Record<string, any> = {}
	): Promise<T> {
		try {
			const axiosInstance = this.createAxiosInstance(data);

			const config: AxiosRequestConfig = {
				method,
				url: endpoint,
				data: method !== 'GET' ? data : undefined,
				params: method === 'GET' ? data : undefined
			};

			const response = await axiosInstance(config);

			if (response.data.code !== 10000) {
				throw new Error(`CCPayment API Error: ${response.data.msg || 'Unknown error'}`);
			}

			return response.data.data as T;
		} catch (error) {
			logger.error(
				'CCPaymentService',
				`CCPayment API Error: ${error instanceof Error ? error.message : String(error)}`,
				{ endpoint, method }
			);
			throw new WalletError(
				`CCPayment API Error: ${error instanceof Error ? error.message : String(error)}`,
				500,
				ErrorCodes.OPERATION_FAILED,
				{ originalError: error instanceof Error ? error.message : String(error) }
			);
		}
	}

	/**
	 * Create CCPayment user mapping (will be implemented later with database integration)
	 * For now, CCPayment users will be created through their system directly
	 */

	/**
	 * Create a deposit address for a user
	 *
	 * @param ccPaymentUserId - CCPayment user ID
	 * @param coin - Currency code (BTC, ETH, USDT_ERC20, etc.)
	 * @returns Deposit address details
	 *
	 * Endpoint: POST /api/v1/address/create
	 */
	async createDepositAddress(ccPaymentUserId: string, coin: string): Promise<DepositAddress> {
		try {
			// Normalize currency and network
			const { currency, network } = this.normalizeCurrency(coin);

			// Check if we should use mock data
			if (walletConfig.DEV_MODE.MOCK_CCPAYMENT) {
				logger.info(
					'CCPaymentService',
					`[MOCK] Created ${coin} deposit address for CCPayment user ${ccPaymentUserId}`
				);
				const mockAddress = this.generateMockAddress(currency, network);
				return {
					address: mockAddress,
					currency,
					network,
					qrCodeUrl: `https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${mockAddress}`,
					expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
				};
			}

			// Make real API call
			const response = await this.makeRequest<DepositAddress>('/api/v1/address/create', 'POST', {
				userId: ccPaymentUserId,
				currency,
				network
			});
			return response;
		} catch (error) {
			logger.error(
				'CCPaymentService',
				'Error creating deposit address:',
				error instanceof Error ? error.message : String(error)
			);
			throw new WalletError('Failed to create deposit address', 500, ErrorCodes.OPERATION_FAILED, {
				originalError: error instanceof Error ? error.message : String(error)
			});
		}
	}

	/**
	 * Get user crypto balances
	 *
	 * @param ccPaymentUserId - CCPayment user ID
	 * @returns Array of crypto balances
	 *
	 * Endpoint: POST /api/v1/user/assets
	 */
	async getUserCryptoBalances(ccPaymentUserId: string): Promise<CryptoBalance[]> {
		try {
			// In production, we'd make a real API call:
			// const response = await this.makeRequest<{ assets: CryptoBalance[] }>('/api/v1/user/assets', 'POST', {
			//   userId: ccPaymentUserId
			// });
			// return response.assets;

			// For development/testing, return mock balances
			logger.info(
				'CCPaymentService',
				`[MOCK] Retrieved balances for CCPayment user ${ccPaymentUserId}`
			);

			// For testing consistency, use a simple hash of the user ID to generate mock balances
			const userIdHash = this.simpleHash(ccPaymentUserId);
			const btcBase = (userIdHash % 100) / 100; // 0.00 - 0.99
			const ethBase = ((userIdHash * 2) % 100) / 10; // 0.0 - 9.9
			const usdtBase = (userIdHash * 3) % 1000; // 0 - 999

			return [
				{
					currency: 'BTC',
					balance: parseFloat(btcBase.toFixed(8)),
					available: parseFloat(btcBase.toFixed(8)),
					frozen: 0,
					network: 'BTC',
					usdValue: parseFloat((btcBase * 60000).toFixed(2)) // Mock BTC price ~$60k
				},
				{
					currency: 'ETH',
					balance: parseFloat(ethBase.toFixed(6)),
					available: parseFloat(ethBase.toFixed(6)),
					frozen: 0,
					network: 'ETH',
					usdValue: parseFloat((ethBase * 3000).toFixed(2)) // Mock ETH price ~$3k
				},
				{
					currency: 'USDT',
					balance: parseFloat(usdtBase.toFixed(2)),
					available: parseFloat(usdtBase.toFixed(2)),
					frozen: 0,
					network: 'TRC20',
					usdValue: parseFloat(usdtBase.toFixed(2)) // USDT price = $1
				},
				{
					currency: 'USDT',
					balance: parseFloat((usdtBase / 10).toFixed(2)),
					available: parseFloat((usdtBase / 10).toFixed(2)),
					frozen: 0,
					network: 'ERC20',
					usdValue: parseFloat((usdtBase / 10).toFixed(2)) // USDT price = $1
				}
			];
		} catch (error) {
			logger.error(
				'CCPaymentService',
				'Error getting crypto balances:',
				error instanceof Error ? error.message : String(error)
			);
			throw new WalletError('Failed to get crypto balances', 500, ErrorCodes.OPERATION_FAILED, {
				originalError: error instanceof Error ? error.message : String(error)
			});
		}
	}

	/**
	 * Get transaction history
	 *
	 * @param ccPaymentUserId - CCPayment user ID
	 * @param filters - Optional filters like date range, currency, status
	 * @returns Transaction history
	 *
	 * Endpoint: POST /api/v1/transaction/list
	 */
	async getTransactionHistory(
		ccPaymentUserId: string,
		filters: {
			startDate?: string;
			endDate?: string;
			currency?: string;
			status?: string;
			page?: number;
			limit?: number;
		} = {}
	): Promise<any[]> {
		try {
			// In production, we'd make a real API call:
			// const response = await this.makeRequest<{ transactions: any[] }>('/api/v1/transaction/list', 'POST', {
			//   userId: ccPaymentUserId,
			//   ...filters
			// });
			// return response.transactions;

			// For development/testing, return mock transactions
			logger.info(
				'CCPaymentService',
				`[MOCK] Retrieved transaction history for CCPayment user ${ccPaymentUserId}`
			);

			// Generate some realistic mock transactions
			const mockTransactions = [];
			const limit = filters.limit || 20;
			const page = filters.page || 1;

			// Generate more transactions than needed, then filter and paginate
			for (let i = 0; i < 100; i++) {
				// Alternate between deposit and withdrawal
				const isDeposit = i % 2 === 0;

				// Create mock transaction
				const mockTx = {
					orderId: `ord_${Date.now() - i * 86400000}_${this.simpleHash(ccPaymentUserId + i)}`,
					merchantOrderId: `dgt_${this.simpleHash(ccPaymentUserId + i)}`,
					type: isDeposit ? 'deposit' : 'withdrawal',
					status: this.getRandomStatus(),
					amount: this.getRandomAmount(),
					actualAmount: isDeposit ? this.getRandomAmount() : undefined,
					currency: this.getRandomCurrency(),
					network: this.getRandomNetwork(),
					fromAddress: isDeposit ? this.generateMockAddress() : undefined,
					toAddress: this.generateMockAddress(),
					txHash: this.getRandomTxHash(),
					createdAt: new Date(Date.now() - i * 86400000).toISOString(),
					updatedAt: new Date(Date.now() - i * 86400000 + 3600000).toISOString()
				};

				mockTransactions.push(mockTx);
			}

			// Apply filters
			let filteredTransactions = mockTransactions;

			if (filters.currency) {
				filteredTransactions = filteredTransactions.filter(
					(tx) => tx.currency === filters.currency
				);
			}

			if (filters.status) {
				filteredTransactions = filteredTransactions.filter((tx) => tx.status === filters.status);
			}

			if (filters.startDate) {
				const startDate = new Date(filters.startDate).getTime();
				filteredTransactions = filteredTransactions.filter(
					(tx) => new Date(tx.createdAt).getTime() >= startDate
				);
			}

			if (filters.endDate) {
				const endDate = new Date(filters.endDate).getTime();
				filteredTransactions = filteredTransactions.filter(
					(tx) => new Date(tx.createdAt).getTime() <= endDate
				);
			}

			// Apply pagination
			const start = (page - 1) * limit;
			const end = start + limit;
			const paginatedTransactions = filteredTransactions.slice(start, end);

			return paginatedTransactions;
		} catch (error) {
			logger.error(
				'CCPaymentService',
				'Error getting transaction history:',
				error instanceof Error ? error.message : String(error)
			);
			throw new WalletError('Failed to get transaction history', 500, ErrorCodes.OPERATION_FAILED, {
				originalError: error instanceof Error ? error.message : String(error)
			});
		}
	}

	/**
	 * Create a deposit link/order
	 *
	 * @param request - Deposit request details
	 * @returns Deposit link URL
	 *
	 * Endpoint: POST /api/v1/deposit/create
	 */
	async createDepositLink(request: DepositRequest): Promise<string> {
		try {
			// Check if we should use mock data
			if (walletConfig.DEV_MODE.MOCK_CCPAYMENT) {
				logger.info('CCPaymentService', `[MOCK] Created deposit link for order ${request.orderId}`);
				return `https://pay.ccpayment.com/deposit/${request.orderId}?amount=${request.amount}&currency=${request.currency}`;
			}

			// Make real API call
			const response = await this.makeRequest<{ depositUrl: string }>(
				'/api/v1/deposit/create',
				'POST',
				{
					...request
				}
			);
			return response.depositUrl;
		} catch (error) {
			logger.error(
				'CCPaymentService',
				'Error creating deposit link:',
				error instanceof Error ? error.message : String(error)
			);
			throw new WalletError('Failed to create deposit link', 500, ErrorCodes.OPERATION_FAILED, {
				originalError: error instanceof Error ? error.message : String(error)
			});
		}
	}

	/**
	 * Request withdrawal
	 *
	 * @param request - Withdrawal request details
	 * @returns Order ID
	 *
	 * Endpoint: POST /api/v1/withdrawal/create
	 */
	async requestWithdrawal(request: WithdrawalRequest): Promise<CCPaymentWithdrawalResponse> {
		try {
			// In production, we'd make a real API call:
			// const response = await this.makeRequest<CCPaymentWithdrawalResponse>('/api/v1/withdrawal/create', 'POST', {
			//   ...request
			// });
			// return response;

			// For development/testing, return a mock withdrawal response
			logger.info(
				'CCPaymentService',
				`[MOCK] Created withdrawal request for order ${request.orderId}`
			);

			// Calculate a realistic fee
			const fee = (request.amount * 0.001).toFixed(8);

			return {
				orderId: `ord_${Date.now()}_${this.simpleHash(request.orderId)}`,
				merchantOrderId: request.orderId,
				status: 'pending',
				amount: request.amount.toString(),
				fee,
				currency: request.currency,
				network: this.getNetworkFromCurrency(request.currency),
				address: request.address,
				createdAt: new Date().toISOString()
			};
		} catch (error) {
			logger.error(
				'CCPaymentService',
				'Error requesting withdrawal:',
				error instanceof Error ? error.message : String(error)
			);
			throw new WalletError('Failed to request withdrawal', 500, ErrorCodes.OPERATION_FAILED, {
				originalError: error instanceof Error ? error.message : String(error)
			});
		}
	}

	/**
	 * Get transaction status
	 *
	 * @param orderId - Order ID to check
	 * @returns Transaction status
	 *
	 * Endpoint: POST /api/v1/transaction/status
	 */
	async getTransactionStatus(orderId: string): Promise<CCPaymentOrderStatus> {
		try {
			// In production, we'd make a real API call:
			// const response = await this.makeRequest<CCPaymentOrderStatus>('/api/v1/transaction/status', 'POST', {
			//   orderId
			// });
			// return response;

			// For development/testing, return a mock status
			logger.info('CCPaymentService', `[MOCK] Retrieved status for order ${orderId}`);

			// Parse timestamp from orderId if possible
			let timestamp = Date.now();
			const timestampMatch = orderId.match(/ord_(\d+)/);
			if (timestampMatch) {
				timestamp = parseInt(timestampMatch[1]);
			}

			// Determine status based on time elapsed
			const elapsedMinutes = (Date.now() - timestamp) / (60 * 1000);
			let status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' = 'pending';

			if (elapsedMinutes > 30) {
				status = 'completed';
			} else if (elapsedMinutes > 15) {
				status = 'processing';
			} else if (elapsedMinutes > 45 && Math.random() < 0.1) {
				status = 'failed';
			}

			const mockOrderDetails: CCPaymentOrderStatus = {
				orderId,
				merchantOrderId: `dgt_${this.simpleHash(orderId)}`,
				status,
				amount: this.getRandomAmount(),
				actualAmount: status === 'completed' ? this.getRandomAmount() : undefined,
				currency: this.getRandomCurrency(),
				network: this.getRandomNetwork(),
				fromAddress: this.generateMockAddress(),
				toAddress: this.generateMockAddress(),
				txHash: status === 'completed' ? this.getRandomTxHash() : undefined,
				expiredAt: new Date(timestamp + 60 * 60 * 1000).toISOString(), // 1 hour expiry
				createdAt: new Date(timestamp).toISOString(),
				updatedAt: new Date().toISOString()
			};

			return mockOrderDetails;
		} catch (error) {
			logger.error(
				'CCPaymentService',
				'Error getting transaction status:',
				error instanceof Error ? error.message : String(error)
			);
			throw new WalletError('Failed to get transaction status', 500, ErrorCodes.OPERATION_FAILED, {
				originalError: error instanceof Error ? error.message : String(error)
			});
		}
	}

	/**
	 * Verify webhook signature
	 *
	 * @param data - Webhook payload
	 * @param signature - X-Signature header
	 * @param timestamp - X-Timestamp header
	 * @returns Whether signature is valid
	 */
	verifyWebhookSignature(data: Record<string, any>, signature: string, timestamp: string): boolean {
		try {
			// Create expected signature
			const expectedSignature = createSignature(
				this.appId,
				this.appSecret,
				data,
				parseInt(timestamp)
			);

			// Compare with provided signature
			return expectedSignature === signature;
		} catch (error) {
			logger.error(
				'CCPaymentService',
				'Error verifying webhook signature:',
				error instanceof Error ? error.message : String(error)
			);
			return false;
		}
	}

	/**
	 * Process a webhook event
	 *
	 * @param event - Webhook event data
	 * @returns Processing result
	 */
	async processWebhookEvent(
		event: CCPaymentWebhookEvent
	): Promise<{ success: boolean; message: string }> {
		try {
			logger.info('CCPaymentService', 'Processing CCPayment webhook event', {
				eventType: event.eventType,
				orderId: event.orderId
			});

			// @todo Implement webhook processing for different event types
			// This is where we would update our database records, credit user accounts, etc.

			switch (event.eventType) {
				case 'deposit_completed':
					// Handle deposit completion (e.g., credit user's DGT balance)
					break;

				case 'deposit_failed':
					// Handle deposit failure
					break;

				case 'withdrawal_completed':
					// Handle withdrawal completion
					break;

				case 'withdrawal_failed':
					// Handle withdrawal failure
					break;

				default:
					logger.warn('CCPaymentService', `Unknown webhook event type: ${event.eventType}`);
					return { success: false, message: 'Unknown event type' };
			}

			return { success: true, message: 'Webhook processed successfully' };
		} catch (error) {
			logger.error(
				'CCPaymentService',
				'Error processing webhook event:',
				error instanceof Error ? error.message : String(error)
			);
			return {
				success: false,
				message: `Error: ${error instanceof Error ? error.message : String(error)}`
			};
		}
	}

	// Helper methods for mock data generation

	/**
	 * Generate a simple hash from a string
	 */
	private simpleHash(input: string): number {
		let hash = 0;
		for (let i = 0; i < input.length; i++) {
			const char = input.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // Convert to 32bit integer
		}
		return Math.abs(hash);
	}

	/**
	 * Generate a mock address for testing
	 */
	private generateMockAddress(currency: string = '', network: string = ''): string {
		// Generate addresses that look realistic for each currency
		if (currency === 'BTC' || network === 'BTC') {
			// BTC address format (P2PKH)
			return `1${this.getRandomHex(33)}`;
		} else if (currency === 'ETH' || network === 'ETH' || network === 'ERC20') {
			// ETH address format
			return `0x${this.getRandomHex(40)}`;
		} else if (network === 'TRC20') {
			// TRON address format
			return `T${this.getRandomHex(33)}`;
		} else {
			// Generic
			return `addr_${this.getRandomHex(32)}`;
		}
	}

	/**
	 * Get random hex string
	 */
	private getRandomHex(length: number): string {
		const hex = '0123456789abcdef';
		let result = '';
		for (let i = 0; i < length; i++) {
			result += hex.charAt(Math.floor(Math.random() * hex.length));
		}
		return result;
	}

	/**
	 * Get random transaction hash
	 */
	private getRandomTxHash(): string {
		return `0x${this.getRandomHex(64)}`;
	}

	/**
	 * Get random status for mock data
	 */
	private getRandomStatus(): string {
		const statuses = ['pending', 'processing', 'completed', 'failed'];
		const weights = [0.2, 0.1, 0.65, 0.05]; // Weighted probabilities

		const random = Math.random();
		let cumulativeWeight = 0;

		for (let i = 0; i < statuses.length; i++) {
			cumulativeWeight += weights[i];
			if (random < cumulativeWeight) {
				return statuses[i];
			}
		}

		return 'completed';
	}

	/**
	 * Get random amount for mock data
	 */
	private getRandomAmount(): string {
		// Generate realistic looking amounts
		const magnitude = Math.floor(Math.random() * 4); // 0-3
		let amount;

		switch (magnitude) {
			case 0: // Small amount (0.001-0.1)
				amount = (Math.random() * 0.099 + 0.001).toFixed(6);
				break;
			case 1: // Medium amount (0.1-1.0)
				amount = (Math.random() * 0.9 + 0.1).toFixed(4);
				break;
			case 2: // Larger amount (1-10)
				amount = (Math.random() * 9 + 1).toFixed(2);
				break;
			case 3: // Big amount (10-100)
				amount = (Math.random() * 90 + 10).toFixed(2);
				break;
			default:
				amount = '1.00';
		}

		return amount;
	}

	/**
	 * Get random currency for mock data
	 */
	private getRandomCurrency(): string {
		const currencies = ['BTC', 'ETH', 'USDT', 'USDC'];
		const weights = [0.1, 0.2, 0.5, 0.2]; // Weighted probabilities

		const random = Math.random();
		let cumulativeWeight = 0;

		for (let i = 0; i < currencies.length; i++) {
			cumulativeWeight += weights[i];
			if (random < cumulativeWeight) {
				return currencies[i];
			}
		}

		return 'USDT';
	}

	/**
	 * Get random network for mock data
	 */
	private getRandomNetwork(): string {
		const networks = ['BTC', 'ETH', 'TRC20', 'ERC20'];
		const weights = [0.1, 0.2, 0.4, 0.3]; // Weighted probabilities

		const random = Math.random();
		let cumulativeWeight = 0;

		for (let i = 0; i < networks.length; i++) {
			cumulativeWeight += weights[i];
			if (random < cumulativeWeight) {
				return networks[i];
			}
		}

		return 'TRC20';
	}

	/**
	 * Get network from currency
	 */
	private getNetworkFromCurrency(currency: string): string {
		switch (currency) {
			case 'BTC':
				return 'BTC';
			case 'ETH':
				return 'ETH';
			case 'USDT':
				return 'TRC20'; // Default for USDT
			case 'USDT_TRC20':
				return 'TRC20';
			case 'USDT_ERC20':
				return 'ERC20';
			case 'USDC':
				return 'ERC20'; // Default for USDC
			default:
				return 'TRC20';
		}
	}

	/**
	 * Normalize currency and network
	 */
	private normalizeCurrency(currencyInput: string): { currency: string; network: string } {
		// Handle combined formats like USDT_TRC20
		if (currencyInput.includes('_')) {
			const [currency, network] = currencyInput.split('_');
			return { currency, network };
		}

		// Handle simple formats
		switch (currencyInput) {
			case 'BTC':
				return { currency: 'BTC', network: 'BTC' };
			case 'ETH':
				return { currency: 'ETH', network: 'ETH' };
			case 'USDT':
				return { currency: 'USDT', network: 'TRC20' }; // Default to TRC20
			case 'USDC':
				return { currency: 'USDC', network: 'ERC20' }; // Default to ERC20
			default:
				return { currency: currencyInput, network: 'TRC20' };
		}
	}
}

// Export a singleton instance
export const ccpaymentService = new CCPaymentService();
