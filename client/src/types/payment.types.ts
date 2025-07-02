/**
 * Payment System Type Definitions
 * CCPayment integration and wallet management types
 */

import type { UserId } from '@db/types';

// Supported currencies
export type SupportedCurrency = 'BTC' | 'ETH' | 'USDT' | 'USDC' | 'LTC' | 'BCH' | 'BNB';

// CCPayment API Response Wrapper
export interface CCPaymentResponse<T> {
	code: number;
	message: string;
	data: T;
	timestamp: string;
	success: boolean;
}

// Deposit Types
export interface DepositRequest {
	userId: UserId;
	currency: SupportedCurrency;
	amount: number;
	returnUrl?: string;
	notifyUrl?: string;
}

export interface DepositResponse {
	payment_link: string;
	order_id: string;
	amount: number;
	currency: SupportedCurrency;
	expires_at: string;
	qr_code?: string;
	deposit_address?: string;
}

// Withdrawal Types
export interface WithdrawalRequest {
	userId: UserId;
	currency: SupportedCurrency;
	amount: number;
	address: string;
	memo?: string;
}

export interface WithdrawalResponse {
	transaction_id: string;
	status: 'pending' | 'processing' | 'completed' | 'failed';
	fee: number;
	network_fee?: number;
	estimated_arrival: string;
}

// Swap Types
export interface SwapRequest {
	userId: UserId;
	fromCurrency: SupportedCurrency;
	toCurrency: SupportedCurrency;
	amount: number;
}

export interface SwapResponse {
	swap_id: string;
	rate: number;
	from_amount: number;
	to_amount: number;
	fee: number;
	expires_at: string;
}

// Balance Types
export interface CryptoBalance {
	currency: SupportedCurrency;
	available: number;
	frozen: number;
	total: number;
	usd_value: number;
}

export interface WalletBalances {
	dgt: number;
	crypto: CryptoBalance[];
	total_usd_value: number;
	last_updated: string;
}

// Transaction Types
export interface Transaction {
	id: string;
	userId: UserId;
	type: 'deposit' | 'withdrawal' | 'swap' | 'transfer' | 'tip' | 'purchase' | 'reward';
	status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
	amount: number;
	currency: SupportedCurrency | 'DGT';
	fee?: number;
	description?: string;
	metadata?: TransactionMetadata;
	createdAt: string;
	updatedAt: string;
	completedAt?: string;
}

export interface TransactionMetadata {
	orderId?: string;
	fromAddress?: string;
	toAddress?: string;
	txHash?: string;
	blockHeight?: number;
	confirmations?: number;
	recipientId?: number;
	conversionRate?: number;
	originalAmount?: number;
	originalCurrency?: string;
	[key: string]: unknown;
}

// Webhook Types
export interface CCPaymentWebhook {
	event_type: 'deposit_confirmed' | 'withdrawal_completed' | 'swap_completed';
	order_id: string;
	user_id: UserId;
	amount: number;
	currency: SupportedCurrency;
	status: string;
	tx_hash?: string;
	confirmations?: number;
	timestamp: string;
	signature: string;
}

// Configuration Types
export interface PaymentConfig {
	ccpayment: {
		apiKey: string;
		secretKey: string;
		webhookSecret: string;
		baseUrl: string;
		testMode: boolean;
	};
	currencies: {
		supported: SupportedCurrency[];
		minimumDeposit: Record<SupportedCurrency, number>;
		withdrawalFees: Record<SupportedCurrency, number>;
	};
	dgt: {
		usdPrice: number;
		conversionRates: Record<SupportedCurrency, number>;
	};
}

// Error Types
export interface PaymentError {
	code: string;
	message: string;
	details?: Record<string, unknown>;
}

// Address Types
export interface DepositAddress {
	currency: SupportedCurrency;
	address: string;
	memo?: string;
	qr_code: string;
	expires_at?: string;
}

// Rate Types
export interface ExchangeRate {
	from: SupportedCurrency;
	to: SupportedCurrency;
	rate: number;
	spread: number;
	minimum: number;
	maximum: number;
	updated_at: string;
}
