import { apiRequest } from '@/lib/api-request';
import type { UserId } from '@shared/types/ids';

export interface WalletBalance {
	dgt: number;
	usdt: number;
	btc: number;
	eth: number;
	pendingDgt: number;
}

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
}

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

	static async getConfig(): Promise<WalletConfig> {
		return apiRequest<WalletConfig>({
			url: '/api/wallet/config',
			method: 'GET'
		});
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

	static async getDepositAddresses(): Promise<Record<string, string>> {
		return apiRequest<Record<string, string>>({
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
	}): Promise<void> {
		return apiRequest<void>({
			url: '/api/wallet/withdraw',
			method: 'POST',
			data
		});
	}
}

export const walletApiService = WalletApiService;
