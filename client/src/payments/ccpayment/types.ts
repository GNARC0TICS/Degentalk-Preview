/**
 * CCPayment API Types
 *
 * This file contains type definitions for CCPayment integration
 */

/**
 * CCPayment client configuration
 */
export interface CCPaymentConfig {
	apiUrl?: string;
	appId?: string;
	appSecret?: string;
}

/**
 * Deposit request parameters
 */
export interface DepositRequest {
	amount: number;
	currency: string;
	orderId: string;
	productName: string;
	redirectUrl: string;
	notifyUrl: string;
}

/**
 * Withdrawal request parameters
 */
export interface WithdrawalRequest {
	amount: number;
	currency: string;
	orderId: string;
	address: string;
	notifyUrl: string;
}

/**
 * Transaction status response
 */
export interface TransactionStatus {
	orderId: string;
	status: string;
	amount: number;
	txHash?: string;
	createdAt: string;
	updatedAt: string;
}

/**
 * Webhook event data from CCPayment
 */
export interface CCPaymentWebhookEvent {
	order_id: string;
	status: string;
	tx_hash?: string;
	amount: string;
	currency: string;
	transaction_type: 'deposit' | 'withdrawal';
	timestamp: string;
}

/**
 * Currency type supported by CCPayment
 */
export type SupportedCurrency = 'USDT' | 'BTC' | 'ETH' | 'USDC';

/**
 * Transaction status enum
 */
export enum CCPaymentTransactionStatus {
	PENDING = 'pending',
	PROCESSING = 'processing',
	COMPLETED = 'completed',
	FAILED = 'failed',
	CANCELLED = 'cancelled'
}
