import { apiRequest } from '@/lib/queryClient';
import { type UserId } from "@shared/types";

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
		const params = new URLSearchParams();
		if (filters?.type) params.append('type', filters.type);
		if (filters?.status) params.append('status', filters.status);
		if (filters?.limit) params.append('limit', filters.limit.toString());

		return apiRequest<TransactionItem[]>({
			url: `/api/wallet/transactions?${params.toString()}`,
			method: 'GET'
		});
	}

	static async getConfig(): Promise<WalletConfig> {
		return apiRequest<WalletConfig>({
			url: '/api/wallet/config',
			method: 'GET'
		});
	}

	static async transferDgt(data: {
		toUserId: string;
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
