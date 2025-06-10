/**
 * Shared Payment Functionality
 *
 * This module provides common payment functionality shared across
 * different payment providers.
 */

/**
 * Generic transaction type
 */
export type TransactionType = 'deposit' | 'withdrawal' | 'tip' | 'purchase' | 'refund';

/**
 * Generic transaction status
 */
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

/**
 * Common transaction interface that all providers should map to
 */
export interface Transaction {
	id: string;
	userId: number;
	type: TransactionType;
	status: TransactionStatus;
	amount: number;
	currency: string;
	createdAt: string;
	completedAt?: string;
	metadata?: Record<string, any>;
	provider: string;
	transactionHash?: string;
}

/**
 * Interface for payment provider capabilities
 */
export interface PaymentProvider {
	name: string;
	supportsDeposit: boolean;
	supportsWithdrawal: boolean;
	supportedCurrencies: string[];
}

/**
 * Format currency amount with symbol
 * @param amount Amount to format
 * @param currency Currency code
 * @returns Formatted amount with currency symbol
 */
export function formatCurrency(amount: number, currency: string): string {
	// Currency symbols
	const symbols: Record<string, string> = {
		USD: '$',
		USDT: '₮',
		EUR: '€',
		GBP: '£',
		BTC: '₿',
		ETH: 'Ξ',
		DGT: '⟁'
	};

	const symbol = symbols[currency] || currency;

	// Format based on currency
	if (['BTC', 'ETH'].includes(currency)) {
		// Crypto formats with more decimal places
		return `${symbol}${amount.toFixed(8)}`;
	} else {
		// Standard currencies with 2 decimal places
		return `${symbol}${amount.toFixed(2)}`;
	}
}

/**
 * Calculate transaction fee
 * @param amount Transaction amount
 * @param type Transaction type
 * @param provider Payment provider
 * @returns Fee amount
 */
export function calculateFee(
	amount: number,
	type: TransactionType,
	provider = 'ccpayment'
): number {
	// Fee structure (to be configured per provider)
	const feeStructure: Record<string, Record<TransactionType, number>> = {
		ccpayment: {
			deposit: 0.01, // 1%
			withdrawal: 0.015, // 1.5%
			tip: 0.005, // 0.5%
			purchase: 0.02, // 2%
			refund: 0 // No fee on refunds
		}
	};

	const providerFees = feeStructure[provider] || feeStructure['ccpayment'];
	const feeRate = providerFees[type] || 0;

	return amount * feeRate;
}
