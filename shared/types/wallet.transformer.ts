import type { UserId, TransactionId } from './ids.js';
import type {
	WalletBalance,
	CryptoBalance,
	DepositAddress,
	DgtTransaction,
	WithdrawalResponse,
	PurchaseOrder,
	WalletConfigPublic,
	SupportedCoin,
	SupportedNetwork,
	DgtTransfer,
	CCPaymentWithdrawFee
} from './wallet.types.js';

/**
 * Public wallet balance DTO (no sensitive data)
 */
export interface WalletBalancePublic {
	dgtBalance: number;
	cryptoBalances: CryptoBalancePublic[];
	lastUpdated: string;
}

/**
 * Public crypto balance DTO
 */
export interface CryptoBalancePublic {
	coinSymbol: string;
	chain: string;
	balance: string;
	usdValue: string;
	available: string;
}

/**
 * Public transaction DTO
 */
export interface DgtTransactionPublic {
	id: TransactionId;
	type: 'deposit' | 'withdrawal' | 'transfer' | 'purchase' | 'reward';
	amount: number;
	status: 'pending' | 'completed' | 'failed' | 'cancelled';
	createdAt: string;
	updatedAt: string;
}

/**
 * Authenticated transaction DTO (includes metadata)
 */
export interface DgtTransactionAuthenticated extends DgtTransactionPublic {
	metadata: Record<string, unknown>;
}

/**
 * Transform wallet balance to public DTO
 */
export function toPublicWalletBalance(balance: WalletBalance): WalletBalancePublic {
	return {
		dgtBalance: balance.dgtBalance,
		cryptoBalances: balance.cryptoBalances.map(toPublicCryptoBalance),
		lastUpdated: balance.lastUpdated
	};
}

/**
 * Transform crypto balance to public DTO
 */
export function toPublicCryptoBalance(balance: CryptoBalance): CryptoBalancePublic {
	return {
		coinSymbol: balance.coinSymbol,
		chain: balance.chain,
		balance: balance.balance,
		usdValue: balance.usdValue,
		available: balance.available
	};
}

/**
 * Transform transaction to public DTO
 */
export function toPublicTransaction(transaction: DgtTransaction): DgtTransactionPublic {
	return {
		id: transaction.id,
		type: transaction.type,
		amount: transaction.amount,
		status: transaction.status,
		createdAt: transaction.createdAt,
		updatedAt: transaction.updatedAt
	};
}

/**
 * Transform transaction to authenticated DTO
 */
export function toAuthenticatedTransaction(
	transaction: DgtTransaction
): DgtTransactionAuthenticated {
	return {
		...toPublicTransaction(transaction),
		metadata: transaction.metadata
	};
}

/**
 * Transform purchase order to public DTO
 */
export function toPublicPurchaseOrder(order: PurchaseOrder): Omit<PurchaseOrder, 'userId'> {
	const { userId: _UserId, ...publicOrder } = order;
	return publicOrder;
}

/**
 * Transform deposit address (no transformation needed - already safe)
 */
export function toPublicDepositAddress(address: DepositAddress): DepositAddress {
	return address;
}

/**
 * Transform withdrawal response (no transformation needed - already safe)
 */
export function toPublicWithdrawalResponse(response: WithdrawalResponse): WithdrawalResponse {
	return response;
}

/**
 * Transform wallet config (no transformation needed - already public)
 */
export function toPublicWalletConfig(config: WalletConfigPublic): WalletConfigPublic {
	return config;
}

/**
 * CCPayment-specific transformers
 */

/**
 * Transform CCPayment balance response to CryptoBalance
 */
export function fromCCPaymentBalance(ccBalance: {
	coinId: number;
	coinSymbol: string;
	chain: string;
	balance: string;
	usdValue: string;
	available: string;
	frozen: string;
}): CryptoBalance {
	return {
		coinId: ccBalance.coinId,
		coinSymbol: ccBalance.coinSymbol,
		chain: ccBalance.chain,
		balance: ccBalance.balance,
		usdValue: ccBalance.usdValue,
		available: ccBalance.available,
		frozen: ccBalance.frozen,
		lastUpdated: new Date().toISOString()
	};
}

/**
 * Transform CCPayment deposit address to DepositAddress
 */
export function fromCCPaymentDepositAddress(ccAddress: {
	coinSymbol: string;
	chain: string;
	address: string;
	memo?: string;
	qrCode?: string;
}): DepositAddress {
	return {
		coinSymbol: ccAddress.coinSymbol,
		chain: ccAddress.chain,
		address: ccAddress.address,
		memo: ccAddress.memo,
		qrCode: ccAddress.qrCode
	};
}

export function fromDbCryptoWallet(wallet: any): DepositAddress {
	return {
		address: wallet.address,
		memo: wallet.memo || undefined,
		qrCode: wallet.qrCodeUrl || undefined,
		coinSymbol: wallet.coinSymbol,
		chain: wallet.chain
	};
}

/**
 * Transform CCPayment token info to SupportedCoin
 */
export function fromCCPaymentTokenInfo(token: any, price?: string): SupportedCoin {
	const networks: SupportedNetwork[] = Object.values(token.networks || {}).map((net: any) => ({
		network: net.chain,
		chain: net.chain,
		displayName: net.chainFullName,
		canDeposit: net.canDeposit,
		canWithdraw: net.canWithdraw,
		minDepositAmount: net.minimumDepositAmount,
		minWithdrawAmount: net.minimumWithdrawAmount,
		fee: '0' // Fee is not part of this response, would need another call
	}));

	let status: 'online' | 'maintenance' | 'degraded' = 'online';
	if (token.status === 'Maintain') {
		status = 'maintenance';
	} else if (token.status === 'Pre-delisting' || token.status === 'Delisted') {
		status = 'degraded';
	}

	const coin: SupportedCoin = {
		id: token.symbol.toLowerCase(),
		name: token.coinFullName,
		symbol: token.symbol,
		logoUrl: token.logoUrl,
		status,
		isDegraded: status !== 'online',
		networks,
		currentPrice: price || '0',
		priceLastUpdated: price ? new Date().toISOString() : undefined
	};

	return coin;
}

export function toPublicSupportedCoin(coin: SupportedCoin): any {
	return {
		id: coin.id,
		name: coin.name,
		symbol: coin.symbol,
		logoUrl: coin.logoUrl,
		status: coin.status,
		networks: coin.networks.map((net) => ({
			network: net.network,
			displayName: net.displayName,
			canDeposit: net.canDeposit,
			canWithdraw: net.canWithdraw
		}))
	};
}

export function toPublicWithdrawFeeInfo(
	feeInfo: CCPaymentWithdrawFee
): Omit<CCPaymentWithdrawFee, 'coinId'> {
	const { coinId: _coinId, ...publicFeeInfo } = feeInfo;
	return publicFeeInfo;
}

/**
 * Utility function to safely extract user-specific data
 */
export function extractUserData<T>(data: T & { userId: UserId }, requestingUserId: UserId): T {
	if (data.userId !== requestingUserId) {
		throw new Error('Unauthorized access to user data');
	}

	const { userId: _UserId, ...userData } = data;
	return userData as T;
}

/**
 * Pagination transformer
 */
export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

export function toPaginatedResponse<T>(
	data: T[],
	page: number,
	limit: number,
	total: number
): PaginatedResponse<T> {
	const totalPages = Math.ceil(total / limit);

	return {
		data,
		pagination: {
			page,
			limit,
			total,
			totalPages,
			hasNext: page < totalPages,
			hasPrev: page > 1
		}
	};
}
