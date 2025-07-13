import type { UserId, WalletId, TransactionId, ProductId } from '../ids';
import type { TransactionType, TransactionStatus } from '@db/schema/core/enums';

/**
 * Economy Domain Types
 *
 * Types for DGT economy, wallets, transactions, and financial operations.
 * Ensures precision and type safety for all monetary calculations.
 */

export interface DGTToken {
	symbol: 'DGT';
	name: 'DegenTalk Token';
	decimals: 8;
	totalSupply: number;
	circulatingSupply: number;
	price: {
		usd: number;
		lastUpdated: Date;
	};
}

export interface Wallet {
	id: WalletId;
	userId: UserId;
	balance: number;
	pendingBalance: number;
	lockedBalance: number;
	totalEarned: number;
	totalSpent: number;
	totalWithdrawn: number;
	withdrawalAddress: string | null;
	isActive: boolean;
	isLocked: boolean;
	lockedUntil: Date | null;
	lockReason: string | null;
	features: WalletFeatures;
	limits: WalletLimits;
	createdAt: Date;
	updatedAt: Date;
}

export interface WalletFeatures {
	withdrawalsEnabled: boolean;
	stakingEnabled: boolean;
	tradingEnabled: boolean;
	tippingEnabled: boolean;
}

export interface WalletLimits {
	dailyWithdrawal: number;
	singleWithdrawal: number;
	dailySpend: number;
	singleTransaction: number;
	minimumWithdrawal: number;
	withdrawalCooldown: number; // seconds
}

export interface Transaction {
	id: TransactionId;
	type: TransactionType;
	status: TransactionStatus;
	fromWalletId: WalletId | null;
	toWalletId: WalletId | null;
	amount: number;
	fee: number;
	netAmount: number;
	currency: 'DGT';
	reference: TransactionReference;
	metadata: TransactionMetadata;
	createdAt: Date;
	completedAt: Date | null;
	failedAt: Date | null;
	failureReason: string | null;
}

export interface TransactionReference {
	type: 'tip' | 'purchase' | 'withdrawal' | 'deposit' | 'reward' | 'refund';
	id: string;
	description: string;
}

export interface TransactionMetadata {
	ipAddress: string;
	userAgent: string;
	externalId?: string;
	blockchainTxHash?: string;
	notes?: string;
}

export interface PendingTransaction {
	id: TransactionId;
	walletId: WalletId;
	amount: number;
	type: TransactionType;
	expiresAt: Date;
	canCancel: boolean;
	reason: string;
}

export interface Tip {
	id: string;
	fromUserId: UserId;
	toUserId: UserId;
	amount: number;
	postId: string | null;
	threadId: string | null;
	message: string | null;
	isAnonymous: boolean;
	transactionId: TransactionId;
	createdAt: Date;
}

export interface Purchase {
	id: string;
	userId: UserId;
	productId: ProductId;
	quantity: number;
	unitPrice: number;
	totalPrice: number;
	discount: number;
	tax: number;
	finalAmount: number;
	transactionId: TransactionId;
	items: PurchaseItem[];
	createdAt: Date;
}

export interface PurchaseItem {
	itemId: string;
	name: string;
	type: 'cosmetic' | 'consumable' | 'permanent';
	metadata: Record<string, unknown>;
}

export interface Withdrawal {
	id: string;
	walletId: WalletId;
	amount: number;
	fee: number;
	netAmount: number;
	address: string;
	status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
	transactionId: TransactionId;
	blockchainTxHash: string | null;
	processedAt: Date | null;
	failureReason: string | null;
	createdAt: Date;
}

export interface EconomyStats {
	totalSupply: number;
	circulatingSupply: number;
	totalWallets: number;
	activeWallets: number;
	dailyVolume: number;
	weeklyVolume: number;
	monthlyVolume: number;
	averageTransaction: number;
	topHolders: WalletHolder[];
}

export interface WalletHolder {
	userId: UserId;
	username: string;
	balance: number;
	percentage: number;
}

// Request/Response types
export interface CreateTransactionRequest {
	type: TransactionType;
	amount: number;
	toWalletId?: WalletId;
	reference?: TransactionReference;
	metadata?: Partial<TransactionMetadata>;
}

export interface WithdrawRequest {
	amount: number;
	address: string;
	twoFactorCode?: string;
}

export interface TipRequest {
	toUserId: UserId;
	amount: number;
	postId?: string;
	threadId?: string;
	message?: string;
	isAnonymous?: boolean;
}

export interface PurchaseRequest {
	productId: ProductId;
	quantity: number;
	couponCode?: string;
}

export interface WalletHistoryParams {
	walletId: WalletId;
	type?: TransactionType;
	status?: TransactionStatus;
	dateFrom?: Date;
	dateTo?: Date;
	minAmount?: number;
	maxAmount?: number;
	sortBy?: 'createdAt' | 'amount' | 'type';
	sortOrder?: 'asc' | 'desc';
}

// Type guards
export function isWallet(value: unknown): value is Wallet {
	return (
		typeof value === 'object' &&
		value !== null &&
		'id' in value &&
		'userId' in value &&
		'balance' in value &&
		'features' in value &&
		'limits' in value &&
		typeof (value as Wallet).balance === 'number' &&
		typeof (value as Wallet).isActive === 'boolean' &&
		typeof (value as Wallet).isLocked === 'boolean'
	);
}

export function isTransaction(value: unknown): value is Transaction {
	return (
		typeof value === 'object' &&
		value !== null &&
		'id' in value &&
		'type' in value &&
		'amount' in value &&
		'status' in value &&
		'currency' in value &&
		'reference' in value &&
		'metadata' in value &&
		typeof (value as Transaction).amount === 'number' &&
		typeof (value as Transaction).fee === 'number'
	);
}

export function isPendingTransaction(value: unknown): value is PendingTransaction {
	return (
		typeof value === 'object' &&
		value !== null &&
		'id' in value &&
		'walletId' in value &&
		'amount' in value &&
		'type' in value &&
		'expiresAt' in value &&
		'reason' in value &&
		typeof (value as PendingTransaction).canCancel === 'boolean'
	);
}

export function isTip(value: unknown): value is Tip {
	return (
		typeof value === 'object' &&
		value !== null &&
		'id' in value &&
		'fromUserId' in value &&
		'toUserId' in value &&
		'amount' in value &&
		'transactionId' in value &&
		typeof (value as Tip).amount === 'number' &&
		typeof (value as Tip).isAnonymous === 'boolean'
	);
}

export function isWithdrawal(value: unknown): value is Withdrawal {
	return (
		typeof value === 'object' &&
		value !== null &&
		'id' in value &&
		'walletId' in value &&
		'amount' in value &&
		'address' in value &&
		'status' in value &&
		'transactionId' in value &&
		typeof (value as Withdrawal).amount === 'number' &&
		typeof (value as Withdrawal).fee === 'number'
	);
}

// Utility types
export type WalletWithUser = Wallet & { user: { id: UserId; username: string; level: number } };
export type TransactionWithWallets = Transaction & {
	fromWallet?: { userId: UserId; username: string };
	toWallet?: { userId: UserId; username: string };
};
export type WalletSummary = Pick<Wallet, 'id' | 'balance' | 'pendingBalance' | 'isLocked'>;
export type TransactionSummary = Pick<
	Transaction,
	'id' | 'type' | 'amount' | 'status' | 'createdAt'
>;

// Constants
export const DGT_DECIMALS = 8;
export const DGT_PRECISION = Math.pow(10, DGT_DECIMALS);

// Helper functions
export function toDGTAmount(value: number): number {
	return Math.round(value * DGT_PRECISION) / DGT_PRECISION;
}

export function fromDGTAmount(value: number): number {
	return value / DGT_PRECISION;
}
