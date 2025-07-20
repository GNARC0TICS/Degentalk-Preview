/**
 * Shared Wallet & Economy Domain Types
 *
 * This file provides a single source of truth for all types related to
 * wallet, transactions, and the DegenTalk economy. It follows a security-first
 * approach by defining separate shapes for public, authenticated, and admin contexts.
 */
import type { UserId, WalletId, TransactionId, CryptoWalletId, DgtAmount, UsdAmount, XpAmount, TipAmount, TransactionType, TransactionStatus, EntityId } from '../ids.js';
export interface PublicWallet {
    id: WalletId;
    balance: DgtAmount;
    user: {
        id: UserId;
        username: string;
        avatarUrl?: string;
        level: number;
    };
    publicStats?: {
        totalEarned: DgtAmount;
        totalSpent: DgtAmount;
        level: number;
    };
}
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
export interface PublicCryptoWallet {
    id: CryptoWalletId;
    coinSymbol: string;
    chain: string;
}
export interface AuthenticatedCryptoWallet extends PublicCryptoWallet {
    address: string;
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
export interface PublicTransaction {
    id: TransactionId;
    type: TransactionType;
    amount: DgtAmount;
    status: TransactionStatus;
    createdAt: Date;
    displayType: string;
    direction: 'in' | 'out';
    relatedUser?: {
        id: UserId;
        username: string;
        avatarUrl?: string;
    };
}
export interface AuthenticatedTransaction extends PublicTransaction {
    description?: string;
    metadata?: Record<string, any>;
    context: {
        source?: string;
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
        ipHash?: string;
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
        activeInLast?: number;
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
    id: string;
    name: string;
    symbol: string;
    logoUrl: string;
    status: 'online' | 'maintenance' | 'degraded';
    isDegraded: boolean;
    networks: SupportedNetwork[];
    currentPrice?: string;
    priceLastUpdated?: string;
}
export interface SupportedNetwork {
    network: string;
    chain: string;
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
export interface EconomyPaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    totalValue?: DgtAmount;
}
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
    fromUserId: UserId;
    toUserId: UserId;
    amount: number;
    reason?: string;
    metadata?: Record<string, unknown>;
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
    crypto?: {
        balance: string;
    }[];
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
