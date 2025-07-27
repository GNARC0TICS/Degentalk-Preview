import { apiRequest } from '@/utils/api-request';
import type { UserId } from '@shared/types/ids';

export interface WalletBalance {
	dgt: number;
	usdt: number;
	btc: number;
	eth: number;
	pendingDgt: number;
	// Legacy compatibility properties
	crypto?: CryptoBalance[];
	cryptoBalances?: CryptoBalance[];
	dgtBalance?: number; // Alias for dgt
}

export type CryptoBalance = WalletBalance;

export interface TransactionItem {
	id: string;
	type: string;
	amount: number;
	currency: string;
	status: 'completed' | 'pending' | 'processing' | 'failed';
	description?: string;
	metadata?: Record<string, any>;
	createdAt: string;
	updatedAt: string;
	/** temp back-compat */
	timestamp?: string;
}

export type Transaction = TransactionItem;

export interface WalletConfig {
	features: {
		allowCryptoWithdrawals: boolean;
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
}

export interface DepositAddress {
	coinSymbol: string;
	chain: string;
	address: string;
	memo?: string;
}

export interface DgtPackage {
	id: string;
	name: string;
	dgt_amount: number;
	usd_price: number;
	description?: string;
	is_popular?: boolean;
}

export class WalletApiService {
	static async getBalances(): Promise<WalletBalance> {
		return apiRequest<WalletBalance>({
			url: '/api/wallet/balances',
			method: 'GET'
		});
	}

	static async getBalance(): Promise<WalletBalance> {
		return this.getBalances();
	}

	static async getTransactions(filters?: {
		type?: string;
		status?: string;
		limit?: number;
	}): Promise<TransactionItem[]> {
		const queryParams: Record<string, string> = {};
		if (filters?.type) queryParams.type = filters.type;
		if (filters?.status) queryParams.status = filters.status;
		if (filters?.limit) queryParams.limit = filters.limit.toString();

		return apiRequest<TransactionItem[]>({
			url: '/api/wallet/transactions',
			method: 'GET',
			params: Object.keys(queryParams).length > 0 ? queryParams : undefined
		});
	}

	static async getTransactionHistory(): Promise<{
		transactions: TransactionItem[];
		total: number;
	}> {
		const transactions = await this.getTransactions();
		return {
			transactions,
			total: transactions.length
		};
	}

	static async getConfig(): Promise<WalletConfig> {
		return apiRequest<WalletConfig>({
			url: '/api/wallet/config',
			method: 'GET'
		});
	}

	static async getWalletConfig(): Promise<WalletConfig> {
		return this.getConfig();
	}

	static async transferDgt(data: {
		toUserId: UserId;
		amount: number;
		note?: string;
	}): Promise<void> {
		return apiRequest<void>({
			url: '/api/wallet/transfer-dgt',
			method: 'POST',
			data
		});
	}

	static async createPurchaseOrder(data: {
		cryptoAmount: number;
		cryptoCurrency: string;
	}): Promise<{
		success: boolean;
		orderId: string;
		depositAddress: string;
		dgtAmount: number;
		message: string;
	}> {
		return apiRequest({
			url: '/api/wallet/purchase-dgt',
			method: 'POST',
			data
		});
	}

	static async getDepositAddresses(): Promise<DepositAddress[]> {
		return apiRequest<DepositAddress[]>({
			url: '/api/wallet/deposit-addresses',
			method: 'GET'
		});
	}

	static async getDgtPackages(): Promise<DgtPackage[]> {
		return apiRequest<DgtPackage[]>({
			url: '/api/wallet/dgt-packages',
			method: 'GET'
		});
	}

	static async requestWithdrawal(data: {
		amount: number;
		currency: string;
		address: string;
	}): Promise<void>;
	static async requestWithdrawal(amount: number, currency: string, address: string): Promise<void>;
	static async requestWithdrawal(arg1: any, arg2?: string, arg3?: string): Promise<void> {
		if (typeof arg1 === 'object') {
			return apiRequest<void>({ url: '/api/wallet/withdraw', method: 'POST', data: arg1 });
		}
		return apiRequest<void>({
			url: '/api/wallet/withdraw',
			method: 'POST',
			data: { amount: arg1, currency: arg2!, address: arg3! }
		});
	}
}

export const walletApiService = WalletApiService;
