import { type OrderId } from '@shared/types/ids';

/**
 * CCPayment Integration
 *
 * This module exports all CCPayment-related functionality
 */

// Export client
export { CCPaymentClient, ccpaymentClient } from './ccpayment-client.ts';

// Export deposit functionality
export {
	createDeposit,
	checkDepositStatus,
	type CreateDepositParams,
	type DepositResponse
} from './deposit.ts';

// Export withdrawal functionality
export {
	createWithdrawal,
	checkWithdrawalStatus,
	validateWithdrawal,
	type CreateWithdrawalParams,
	type WithdrawalResponse
} from './withdraw.ts';

// Export swap functionality
export { createSwap, getExchangeRates, type CreateSwapParams, type SwapResponse } from './swap.ts';

// Export utility functions
export {
	createSignature,
	verifyWebhookSignature,
	formatTransactionStatus,
	generateOrderId
} from './utils.ts';

// Export types
export {
	type CCPaymentConfig,
	type DepositRequest,
	type WithdrawalRequest,
	type TransactionStatus,
	type CCPaymentWebhookEvent,
	type SupportedCurrency,
	CCPaymentTransactionStatus
} from './types.ts';
