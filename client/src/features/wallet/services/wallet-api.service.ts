/**
 * Wallet API Service
 *
 * This service handles all wallet-related API requests including:
 * - Balance fetching
 * - DGT transactions
 * - Crypto deposit/withdrawal
 * - Transaction history
 */

import { apiRequest } from '@/lib/queryClient';

export interface WalletBalance {
	dgt: {
		balance: number;
		lastTransactionAt: Date | null;
	};
	crypto: CryptoBalance[];
}

export interface CryptoBalance {
	coinId: number;
	coinSymbol: string;
	chain: string;
	balance: string;
	frozenBalance: string;
	address: string;
}

export interface Transaction {
	id: number;
	userId: number;
	fromUserId?: number;
	toUserId?: number;
	amount: number;
	type: string;
	status: string;
	description: string;
	currency: string;
	createdAt: string;
	updatedAt: string;
	metadata?: Record<string, any>;
}

export interface DgtPurchaseOrder {
	id: number;
	userId: number;
	dgtAmountRequested: number;
	cryptoAmountExpected: number;
	cryptoCurrencyExpected: string;
	ccpaymentReference: string;
	status: string;
	createdAt: string;
	updatedAt: string;
	metadata?: Record<string, any>;
}

export interface DepositAddress {
	coinId: number;
	coinSymbol: string;
	chain: string;
	address: string;
	memo?: string;
}

/**
 * Wallet API service for interacting with wallet endpoints
 */
class WalletApiService {
	/**
	 * Get wallet balance (DGT and crypto)
	 * @returns Combined wallet balance
	 */
	async getBalance(): Promise<WalletBalance> {
		return apiRequest<WalletBalance>({
			url: '/api/wallet/balances'
		});
	}

	/**
	 * Get DGT transaction history
	 * @param page Page number (1-based)
	 * @param limit Items per page
	 * @returns Paginated transaction list
	 */
	async getTransactionHistory(
		page = 1,
		limit = 10
	): Promise<{
		transactions: Transaction[];
		total: number;
	}> {
		return apiRequest<{
			transactions: Transaction[];
			total: number;
		}>({
			url: '/api/wallet/transactions',
			params: { page, limit }
		});
	}

	/**
	 * Get user's deposit addresses for all supported cryptocurrencies
	 * @returns Array of deposit addresses
	 */
	async getDepositAddresses(): Promise<DepositAddress[]> {
		return apiRequest<DepositAddress[]>({
			url: '/api/wallet/deposit-addresses'
		});
	}

	/**
	 * Create a DGT purchase order (buy DGT with crypto)
	 * @param dgtAmount Amount of DGT to purchase
	 * @param cryptoCurrency Currency to pay with (USDT, BTC, ETH, etc.)
	 * @returns Purchase order with payment link
	 */
	async createDgtPurchase(
		dgtAmount: number,
		cryptoCurrency: string
	): Promise<{
		purchaseOrderId: string;
		paymentLink: string;
		dgtAmount: number;
		cryptoAmount: number;
		cryptoCurrency: string;
	}> {
		return apiRequest<{
			purchaseOrderId: string;
			paymentLink: string;
			dgtAmount: number;
			cryptoAmount: number;
			cryptoCurrency: string;
		}>({
			url: '/api/wallet/dgt-purchase',
			method: 'POST',
			data: {
				dgtAmount,
				cryptoCurrency
			}
		});
	}

	/**
	 * Get purchase order status
	 * @param orderId Purchase order ID
	 * @returns Purchase order details
	 */
	async getPurchaseOrderStatus(orderId: string): Promise<DgtPurchaseOrder> {
		return apiRequest<DgtPurchaseOrder>({
			url: `/api/wallet/purchase/${orderId}`
		});
	}

	/**
	 * Request crypto withdrawal
	 * @param amount Amount to withdraw
	 * @param currency Currency code (USDT, BTC, etc.)
	 * @param address Destination wallet address
	 * @returns Withdrawal request details
	 */
	async requestWithdrawal(
		amount: number,
		currency: string,
		address: string
	): Promise<{
		withdrawalId: string;
		status: string;
	}> {
		return apiRequest<{
			withdrawalId: string;
			status: string;
		}>({
			url: '/api/wallet/withdraw',
			method: 'POST',
			data: {
				amount,
				currency,
				address
			}
		});
	}

	/**
	 * Send DGT to another user
	 * @param recipientId Recipient user ID
	 * @param amount Amount of DGT to send
	 * @param note Optional note for the transfer
	 * @returns Transfer result
	 */
	async transferDgt(
		recipientId: string,
		amount: number,
		note?: string
	): Promise<{
		transactionId: number;
		fromBalance: number;
		toBalance: number;
		transferId: string;
	}> {
		return apiRequest<{
			transactionId: number;
			fromBalance: number;
			toBalance: number;
			transferId: string;
		}>({
			url: '/api/wallet/transfer-dgt',
			method: 'POST',
			data: {
				toUserId: recipientId,
				amount,
				note
			}
		});
	}

	/**
	 * Get supported crypto currencies
	 * @returns List of supported currencies with details
	 */
	async getSupportedCurrencies(): Promise<
		{
			coinId: number;
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
		}[]
	> {
		return apiRequest<
			{
				coinId: number;
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
			}[]
		>({
			url: '/api/wallet/supported-cryptocurrencies'
		});
	}

	/**
	 * Get wallet configuration (for feature gates and limits)
	 * @returns Wallet configuration
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
		return apiRequest<{
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
		}>({
			url: '/api/wallet/config'
		});
	}

	/**
	 * Create purchase order from a DGT package (new flow)
	 */
	async createPurchaseOrder(
		packageId: number,
		cryptoCurrency: string = 'USDT'
	): Promise<{ order: any; depositUrl: string }> {
		return apiRequest<{ order: any; depositUrl: string }>({
			url: '/api/wallet/purchase-orders',
			method: 'POST',
			data: { packageId, cryptoCurrency }
		});
	}
}

// Export a singleton instance
export const walletApiService = new WalletApiService();

// Also export the class for cases where components want to instantiate their own instance
export { WalletApiService };
