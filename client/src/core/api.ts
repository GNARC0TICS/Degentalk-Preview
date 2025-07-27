import type { ShopItem } from '@/hooks/use-shop-items';
import type { ItemCategory } from '@/hooks/use-vault-items';
import type { Notification, NotificationsParams } from '@/types/notifications';
import type {
	Transaction,
	TransactionHistoryParams,
	DepositAddress,
	WalletBalances
} from '@/types/wallet';
import type { RoomId, TipId, VaultId, ActionId, UserId } from '@shared/types/ids';
import { logger } from '@/lib/logger';

// API endpoint base URL
const API_BASE_URL = '/api';

// Fetch JSON helper with error handling
async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
	try {
		const response = await fetch(url, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...(options?.headers || {})
			}
		});

		if (!response.ok) {
			const errorText = await response.text();
			try {
				const errorJson = JSON.parse(errorText);
				throw new Error(errorJson.message || errorJson.error || 'API Error');
			} catch (e) {
				throw new Error(errorText || response.statusText || 'API Error');
			}
		}

		const data = await response.json();
		return data as T;
	} catch (error) {
		logger.error('Api', 'API Error:', error);
		throw error;
	}
}

// Wallet-related types
export interface CryptoBalance {
	currency: string;
	balance: number;
	available: number;
	frozen: number;
}

export interface WalletBalance {
	dgt: number;
	crypto: CryptoBalance[];
	totalUsdValue: number;
}

export interface DgtPurchaseOrder {
	id: string;
	dgtAmount: number;
	cryptoAmount: number;
	cryptoCurrency: string;
	status: 'pending' | 'completed' | 'failed';
	createdAt: string;
}

// API Client
export const api = {
	// Wallet API
	wallet: {
		// [REFAC-DGT] [REFAC-CCPAYMENT]
		async getBalance(): Promise<WalletBalance> {
			return fetchJSON<WalletBalance>(`${API_BASE_URL}/wallet/balance`);
		},

		// [REFAC-CCPAYMENT]
		async createDepositAddress(currency: string): Promise<DepositAddress> {
			return fetchJSON<DepositAddress>(`${API_BASE_URL}/wallet/deposit-address`, {
				method: 'POST',
				body: JSON.stringify({ currency })
			});
		},

		// [REFAC-DGT] [REFAC-CCPAYMENT]
		async getTransactionHistory(params: TransactionHistoryParams = {}): Promise<{
			transactions: Transaction[];
			total: number;
		}> {
			const queryParams = new URLSearchParams();
			if (params.limit) queryParams.append('limit', params.limit.toString());
			if (params.offset) queryParams.append('offset', params.offset.toString());
			if (params.type) {
				if (Array.isArray(params.type)) {
					params.type.forEach((t) => queryParams.append('type', t));
				} else {
					queryParams.append('type', params.type);
				}
			}
			if (params.startDate) queryParams.append('startDate', params.startDate);
			if (params.endDate) queryParams.append('endDate', params.endDate);
			if (params.includeCrypto !== undefined)
				queryParams.append('includeCrypto', params.includeCrypto.toString());

			return fetchJSON<{ transactions: Transaction[]; total: number }>(
				`${API_BASE_URL}/wallet/transactions?${queryParams.toString()}`
			);
		},

		// [REFAC-DGT]
		async requestDgtPurchase(
			cryptoAmount: number,
			cryptoCurrency: string
		): Promise<{
			success: boolean;
			orderId: string;
			depositAddress: string;
			dgtAmount: number;
			message: string;
		}> {
			return fetchJSON(`${API_BASE_URL}/wallet/purchase-dgt`, {
				method: 'POST',
				body: JSON.stringify({
					cryptoAmount,
					cryptoCurrency
				})
			});
		},

		// [REFAC-DGT]
		async checkPurchaseStatus(orderId: string): Promise<{
			status: 'pending' | 'completed' | 'failed';
			message: string;
			dgtAmount?: number;
			cryptoAmount?: number;
			cryptoCurrency?: string;
		}> {
			return fetchJSON(`${API_BASE_URL}/wallet/purchase-status/${orderId}`);
		},

		// [REFAC-DGT]
		async transferDGT(
			toUserId: UserId,
			amount: number,
			reason: string
		): Promise<{
			success: boolean;
			transactionId: ActionId;
			message: string;
		}> {
			return fetchJSON(`${API_BASE_URL}/wallet/transfer`, {
				method: 'POST',
				body: JSON.stringify({
					toUserId,
					amount,
					reason
				})
			});
		}
	},

	notifications: {
		// Dev only
		async getNotifications(params: NotificationsParams = {}): Promise<{
			notifications: Notification[];
		}> {
			const queryParams = new URLSearchParams();
			if (params.pageOffset) queryParams.append('pageOffset', params.pageOffset.toString());

			return fetchJSON<{
				notifications: Notification[];
			}>(`${API_BASE_URL}/notifications/getPaginatedNotifications?${queryParams.toString()}`);
		}
	},

	// Engagement API (Tip, Rain, etc.)
	engagement: {
		// [REFAC-TIP]
		async sendTip(
			toUserId: UserId,
			amount: number,
			currency: string,
			source: string,
			contextId?: string
		): Promise<{
			success: boolean;
			tipId: TipId;
			message: string;
		}> {
			return fetchJSON(`${API_BASE_URL}/engagement/tip`, {
				method: 'POST',
				body: JSON.stringify({
					toUserId,
					amount,
					currency,
					source,
					contextId
				})
			});
		},

		// [REFAC-TIP]
		async getTipHistory(
			type: 'sent' | 'received' | 'both' = 'both',
			limit: number = 20,
			offset: number = 0
		): Promise<{
			tips: Record<string, unknown>[]; // FIXME: any → tip objects
			total: number;
		}> {
			return fetchJSON(
				`${API_BASE_URL}/engagement/tip/history?type=${type}&limit=${limit}&offset=${offset}`
			);
		},

		// [REFAC-RAIN]
		async sendRain(
			amount: number,
			currency: string,
			userCount: number,
			roomId?: RoomId
		): Promise<{
			success: boolean;
			transactionId: ActionId;
			recipients: { id: UserId; username: string }[];
			message: string;
		}> {
			return fetchJSON(`${API_BASE_URL}/engagement/rain`, {
				method: 'POST',
				body: JSON.stringify({
					amount,
					currency,
					userCount,
					roomId
				})
			});
		},

		// [REFAC-RAIN]
		async getRecentRainEvents(limit: number = 10): Promise<any[]> {
			return fetchJSON(`${API_BASE_URL}/engagement/rain/recent?limit=${limit}`);
		}
	},

	// Shop API methods
	shop: {
		async getItems(category?: ItemCategory): Promise<ShopItem[]> {
			const query = category ? `?category=${category}` : '';
			return fetchJSON<ShopItem[]>(`${API_BASE_URL}/shop/items${query}`);
		},

		async getItem(itemId: string): Promise<ShopItem> {
			return fetchJSON<ShopItem>(`${API_BASE_URL}/shop/items/${itemId}`);
		},

		async purchaseItem(
			itemId: string,
			paymentMethod: 'dgt' | 'usdt'
		): Promise<{ success: boolean; message: string }> {
			return fetchJSON(`${API_BASE_URL}/shop/purchase`, {
				method: 'POST',
				body: JSON.stringify({ itemId, paymentMethod })
			});
		},

		async checkBalance(
			itemId: string,
			paymentMethod: 'dgt' | 'usdt'
		): Promise<{ canAfford: boolean; currentBalance: number }> {
			return fetchJSON(`${API_BASE_URL}/shop/check-balance`, {
				method: 'POST',
				body: JSON.stringify({ itemId, paymentMethod })
			});
		}
	},

	// Vault API
	vault: {
		async lockDGT(
			amount: number,
			unlockTime?: Date
		): Promise<{
			success: boolean;
			vaultId: VaultId;
			message: string;
		}> {
			return fetchJSON(`${API_BASE_URL}/engagement/vault/lock`, {
				method: 'POST',
				body: JSON.stringify({
					amount,
					unlockTime: unlockTime?.toISOString()
				})
			});
		},

		async getVaults(): Promise<any[]> {
			return fetchJSON(`${API_BASE_URL}/engagement/vault`);
		},

		async unlockVault(vaultId: VaultId): Promise<{
			success: boolean;
			message: string;
			transactionId?: ActionId;
		}> {
			return fetchJSON(`${API_BASE_URL}/engagement/vault/unlock/${vaultId}`, {
				method: 'POST'
			});
		}
	}
};

export default api;
