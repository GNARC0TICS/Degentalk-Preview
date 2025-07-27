import type { UserId, TransactionId } from './ids.js';

/**
 * Transaction type categories
 */
export type TransactionType =
	| 'deposit'
	| 'withdrawal'
	| 'transfer'
	| 'purchase'
	| 'reward'
	| 'refund'
	| 'fee';

/**
 * Transaction status types
 */
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

/**
 * Base transaction interface
 */
export interface BaseTransaction {
	id: TransactionId;
	userId: UserId;
	type: TransactionType;
	amount: number;
	currency: string;
	status: TransactionStatus;
	description?: string;
	metadata?: Record<string, unknown>;
	createdAt: string;
	updatedAt: string;
	/**
	 * TEMPORARY BACK-COMPAT field for legacy wallet UI.  Will be removed once
	 * client components are migrated to use `createdAt` consistently.
	 */
	timestamp?: string;
}

/**
 * Deposit transaction
 */
export interface DepositTransaction extends BaseTransaction {
	type: 'deposit';
	sourceAddress?: string;
	transactionHash?: string;
	confirmations?: number;
	requiredConfirmations?: number;
}

/**
 * Withdrawal transaction
 */
export interface WithdrawalTransaction extends BaseTransaction {
	type: 'withdrawal';
	destinationAddress: string;
	transactionHash?: string;
	fee: number;
	memo?: string;
}

/**
 * Transfer transaction (internal)
 */
export interface TransferTransaction extends BaseTransaction {
	type: 'transfer';
	fromUserId: UserId;
	toUserId: UserId;
	reason?: string;
}

/**
 * Purchase transaction
 */
export interface PurchaseTransaction extends BaseTransaction {
	type: 'purchase';
	paymentMethod: 'stripe' | 'ccpayment';
	paymentIntentId?: string;
	externalOrderId?: string;
}

/**
 * Reward transaction
 */
export interface RewardTransaction extends BaseTransaction {
	type: 'reward';
	source: 'xp' | 'rain' | 'tip' | 'airdrop' | 'mission' | 'achievement';
	sourceId?: string;
}

/**
 * Legacy alias used by client wallet components.  Remove after migration.
 */
export type TransactionItem = BaseTransaction;

/**
 * Transaction filter options
 */
export interface TransactionFilters {
	userId?: UserId;
	type?: TransactionType;
	status?: TransactionStatus;
	currency?: string;
	minAmount?: number;
	maxAmount?: number;
	startDate?: string;
	endDate?: string;
}

/**
 * Transaction summary
 */
export interface TransactionSummary {
	totalTransactions: number;
	totalAmount: number;
	pendingAmount: number;
	completedAmount: number;
	failedAmount: number;
	byType: Record<TransactionType, number>;
	byStatus: Record<TransactionStatus, number>;
}
