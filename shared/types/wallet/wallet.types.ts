/**
 * Shared Wallet & Economy Domain Types
 *
 * This file provides a single source of truth for all types related to
 * wallet, transactions, and the DegenTalk economy. It follows a security-first
 * approach by defining separate shapes for public, authenticated, and admin contexts.
 */
import type {
	UserId,
	WalletId,
	TransactionId,
	CryptoWalletId,
	DgtAmount,
	UsdAmount,
	XpAmount,
	TipAmount,
	WithdrawalAmount,
	TransactionType,
	TransactionStatus,
	WithdrawalStatus,
	EntityId
} from '../ids.js';

// ================================================================= //
// C O R E   W A L L E T   S T R U C T U R E S
// ================================================================= //

// Base wallet data safe for public consumption
export interface PublicWallet {
	id: WalletId;
	balance: DgtAmount; // Only DGT balance visible
	user: {
		id: UserId;
		username: string;
		avatarUrl?: string;
		level: number; // Derived from XP
	};
	publicStats?: {
		totalEarned: DgtAmount;
		totalSpent: DgtAmount;
		level: number;
	};
}

// Wallet data for authenticated user viewing their own wallet
export interface AuthenticatedWallet extends PublicWallet {
	estimatedUsdValue: UsdAmount;
	permissions: {
		canTip: boolean;
		canWithdraw: boolean;
		canDeposit: boolean;
		canTransfer: boolean;
	};
	detailedStats: {
		totalTips: DgtAmount;
		totalRainReceived: DgtAmount;
		totalWithdrawn: DgtAmount;
		totalDeposited: DgtAmount;
		weeklyEarnings: DgtAmount;
		monthlyEarnings: DgtAmount;
	};
	limits: {
		dailyTipLimit: DgtAmount;
		dailyWithdrawalLimit: UsdAmount;
		remainingDaily: {
			tips: DgtAmount;
			withdrawals: UsdAmount;
		};
	};
}

// Wallet data for admin view
export interface AdminWallet extends AuthenticatedWallet {
	adminData: {
		totalVolumeUsd: UsdAmount;
		flaggedTransactions: number;
		riskScore: number;
		lastLargeTransaction?: Date;
		suspiciousActivity: boolean;
	};
	internalNotes?: string;
	complianceFlags?: string[];
	kycStatus?: 'pending' | 'verified' | 'rejected';
	auditLog: {
		createdAt: Date;
		createdBy?: UserId;
		lastModifiedAt: Date;
		lastModifiedBy?: UserId;
	};
}

// ================================================================= //
// C R Y P T O   W A L L E T   S T R U C T U R E S
// ================================================================= //

export interface PublicCryptoWallet {
	id: CryptoWalletId;
	coinSymbol: string;
	chain: string;
	// Address is NOT exposed in public view for security
}

export interface AuthenticatedCryptoWallet extends PublicCryptoWallet {
	address: string; // Only show to owner
	memo?: string;
	qrCodeUrl?: string;
	permissions: {
		canReceive: boolean;
		canGenerateNew: boolean;
	};
}

export interface AdminCryptoWallet extends AuthenticatedCryptoWallet {
	ccpaymentUserId: string;
	coinId: EntityId;
	createdAt: Date;
	totalReceived?: UsdAmount;
	transactionCount?: number;
	lastUsed?: Date;
}

/**
 * Individual cryptocurrency balance (aligned with CCPayment API)
 */
export interface CryptoBalance {
	coinId: number;
	coinSymbol: string;
	chain: string;
	balance: string;
	usdValue: string;
	available: string;
	frozen: string;
	lastUpdated: string;
}

// ================================================================= //
// T R A N S A C T I O N   S T R U C T U R E S
// ================================================================= //

export interface PublicTransaction {
	id: TransactionId;
	type: TransactionType;
	amount: DgtAmount;
	status: TransactionStatus;
	createdAt: Date;
	displayType: string; // "Tip", "Rain", "Purchase", etc.
	direction: 'in' | 'out';
	relatedUser?: {
		id: UserId;
		username: string;
		avatarUrl?: string;
	};
}

export interface AuthenticatedTransaction extends PublicTransaction {
	description?: string;
	metadata?: Record<string, any>; // Filtered metadata
	context: {
		source?: string; // "forum_tip", "rain_event", "shop_purchase"
		threadId?: string;
		postId?: string;
		targetUserId?: UserId;
	};
	usdAmount?: UsdAmount;
	exchangeRate?: number;
	fee?: DgtAmount;
	netAmount: DgtAmount;
}

export interface AdminTransaction extends AuthenticatedTransaction {
	systemData: {
		fromWalletId?: WalletId;
		toWalletId?: WalletId;
		blockchainTxId?: string;
		fromWalletAddress?: string;
		toWalletAddress?: string;
		isTreasuryTransaction: boolean;
		ipHash?: string; // Anonymized IP
	};
	adminNotes?: string;
	flagged: boolean;
	flagReason?: string;
	reviewedBy?: UserId;
	reviewedAt?: Date;
	rawMetadata: Record<string, any>;
}

export interface TransactionHistoryItem {
	id: TransactionId;
	type: string;
	amount: DgtAmount;
	usdValue?: UsdAmount;
	direction: 'incoming' | 'outgoing' | 'internal';
	counterparty?: {
		type: 'user' | 'system' | 'shop' | 'admin';
		name: string;
		id?: string;
	};
	description: string;
	timestamp: string;
	status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
	context: {
		source: string;
		category: string;
		reference: string;
		threadId?: string;
		postId?: string;
		itemId?: string;
	};
	properties: {
		isReversible: boolean;
		hasReceipt: boolean;
		isInternal: boolean;
		requiresConfirmation: boolean;
	};
	verification: {
		isVerified: boolean;
		verifiedAt?: string;
		blockchainTxId?: string;
		confirmations: number;
	};
}

// ================================================================= //
// A P I   R E Q U E S T / R E S P O N S E   T Y P E S
// ================================================================= //

export interface CreateTransactionRequest {
	type: TransactionType;
	amount: DgtAmount;
	toUserId?: UserId;
	description?: string;
	metadata?: Record<string, any>;
}

export interface TipRequest {
	amount: TipAmount;
	targetUserId: UserId;
	threadId?: string;
	postId?: string;
	message?: string;
}

export interface RainRequest {
	totalAmount: DgtAmount;
	participantCount: number;
	criteria?: {
		minLevel?: number;
		minXp?: XpAmount;
		activeInLast?: number; // hours
	};
	message?: string;
}

export interface WithdrawalRequest {
	userId: UserId;
	amount: number;
	currency: string;
	address: string;
	memo?: string;
}

export interface WithdrawalResponse {
	transactionId: TransactionId;
	status: 'pending' | 'processing' | 'completed' | 'failed';
	estimatedCompletionTime?: string;
	transactionHash?: string;
	fee: number;
}

export interface PurchaseRequest {
	userId: UserId;
	amount: number;
	currency: 'USD' | 'USDT';
	paymentMethod: 'stripe' | 'ccpayment';
}

export interface PurchaseOrder {
	id: TransactionId;
	userId: UserId;
	amount: number;
	currency: string;
	paymentMethod: string;
	status: 'pending' | 'processing' | 'completed' | 'failed';
	paymentIntentId?: string;
	externalOrderId?: string;
	createdAt: string;
}

// ================================================================= //
// S E A R C H   &   P A G I N A T I O N
// ================================================================= //

export interface TransactionSearchParams {
	walletId?: WalletId;
	userId?: UserId;
	type?: TransactionType;
	status?: TransactionStatus;
	amountMin?: DgtAmount;
	amountMax?: DgtAmount;
	dateFrom?: Date;
	dateTo?: Date;
	page?: number;
	limit?: number;
	sortBy?: 'date' | 'amount' | 'type';
	sortOrder?: 'asc' | 'desc';
}

export interface WalletSearchParams {
	userId?: UserId;
	balanceMin?: DgtAmount;
	balanceMax?: DgtAmount;
	lastActiveAfter?: Date;
	page?: number;
	limit?: number;
	sortBy?: 'balance' | 'lastActivity' | 'created';
	sortOrder?: 'asc' | 'desc';
}

export interface WalletConfigPublic {
	features: {
		dgt: {
			transfers: boolean;
		};
		crypto: {
			deposits: boolean;
			withdrawals: boolean;
		};
	};
	provider: string;
}

export interface SupportedCoin {
	id: string; // e.g., 'bitcoin'
	name: string; // e.g., 'Bitcoin'
	symbol: string; // e.g., 'BTC'
	logoUrl: string;
	status: 'online' | 'maintenance' | 'degraded';
	isDegraded: boolean;
	networks: SupportedNetwork[];
	currentPrice?: string;
	priceLastUpdated?: string;
}

export interface SupportedNetwork {
	network: string; // e.g. 'Ethereum', 'TRC20'
	chain: string; // e.g. 'ETH', 'TRX'
	displayName: string;
	canDeposit: boolean;
	canWithdraw: boolean;
	minDepositAmount?: string;
	minWithdrawAmount?: string;
	fee?: string;
}

export interface CCPaymentWithdrawFee {
	coinId: number;
	coinSymbol: string;
	amount: string;
	chain: string;
}

export interface PaginationOptions {
	page: number;
	limit: number;
	sortBy: 'createdAt' | 'amount' | 'type' | 'status';
	sortOrder: 'asc' | 'desc';
}

export interface EconomyPaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
	totalValue?: DgtAmount;
}

// ================================================================= //
// M I S C   &   L E G A C Y
// ================================================================= //

export interface DgtTransaction {
	id: TransactionId;
	userId: UserId;
	type: 'deposit' | 'withdrawal' | 'transfer' | 'purchase' | 'reward';
	amount: number;
	status: 'pending' | 'completed' | 'failed' | 'cancelled';
	metadata: Record<string, unknown>;
	createdAt: string;
	updatedAt: string;
}

export interface DgtTransfer {
	from: UserId;
	to: UserId;
	amount: number;
	reason?: string;
	metadata?: Record<string, unknown>;
}

export interface DgtTransactionMetadata {
	source: 
		| 'crypto_deposit'
		| 'shop_purchase'
		| 'tip_send'
		| 'tip_receive'
		| 'rain_send'
		| 'rain_receive'
		| 'admin_credit'
		| 'admin_debit'
		| 'internal_transfer_send'
		| 'internal_transfer_receive'
		| 'xp_boost'
		| 'manual_credit'
		| 'transfer_out'
		| 'transfer_in';
	
	// For crypto deposits
	originalToken?: string;
	usdtAmount?: string;
	
	// For shop purchases
	shopItemId?: string;
	
	// For tips and transfers
	reason?: string;
	
	// For admin actions
	adminId?: string;
	
	// For various contexts
	fromUserId?: UserId;
	toUserId?: UserId;
	threadId?: string;
	postId?: string;
	
	// Any additional metadata
	[key: string]: any;
}

export interface WalletBalance {
	userId: UserId;
	dgtBalance: number;
	cryptoBalances: CryptoBalance[];
	lastUpdated: string;
	dgt?: number;
	usdt?: number;
	btc?: number;
	eth?: number;
	pendingDgt?: number;
	crypto?: { balance: string }[];
}

export interface DepositAddress {
	coinSymbol: string;
	chain: string;
	address: string;
	memo?: string;
	qrCode?: string;
}

export interface WebhookResult {
	success: boolean;
	transactionId?: TransactionId;
	message: string;
	processed: boolean;
}

export interface CCPaymentWebhook {
	orderId: string;
	status: string;
	amount: number;
	currency: string;
	transactionHash?: string;
	timestamp: string;
	signature: string;
}

export interface StripeWebhook {
	id: string;
	object: string;
	type: string;
	data: {
		object: Record<string, unknown>;
	};
	created: number;
}
