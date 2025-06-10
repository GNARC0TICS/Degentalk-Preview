/**
 * Wallet Types
 *
 * This file contains shared types used across wallet-related components.
 *
 * // [REFAC-DGT] [REFAC-CCPAYMENT]
 */

/**
 * Represents a transaction in the wallet system
 */
export interface Transaction {
	id: string;
	type: 'deposit' | 'withdrawal' | 'purchase' | 'transfer' | 'tip' | 'rain' | 'airdrop';
	status: 'completed' | 'pending' | 'failed';
	amount: number;
	currency: string;
	timestamp: string;
	description: string;
	to?: {
		id: number;
		username: string;
	};
	from?: {
		id: number;
		username: string;
	};
}

/**
 * Parameters for filtering transaction history
 */
export interface TransactionHistoryParams {
	page?: number;
	limit?: number;
	offset?: number;
	type?: string | string[];
	status?: string;
	startDate?: string;
	endDate?: string;
	includeCrypto?: boolean;
}

/**
 * Deposit address details
 */
export interface DepositAddress {
	address: string;
	currency: string;
	network: string;
	minDeposit: number;
}

/**
 * Wallet balances response
 */
export interface WalletBalances {
	dgt: number;
	crypto: Record<string, number>;
	totalUsdValue: number;
}
