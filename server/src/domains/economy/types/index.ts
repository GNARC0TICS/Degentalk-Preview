/**
 * Economy Domain Types - Security-First Implementation
 * 
 * Clean, permission-aware economy types with proper separation
 * between public, authenticated, and admin-only financial data.
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
  WithdrawalStatus
} from '@shared/types/ids';
import type { EntityId } from "@shared/types/ids";

// Base wallet data safe for public consumption
export interface PublicWallet {
  id: WalletId;
  balance: DgtAmount; // Only DGT balance visible
  
  // User data (via UserTransformer)
  user: {
    id: UserId;
    username: string;
    avatarUrl?: string;
    level: number; // Derived from XP
  };
  
  // Public stats only
  publicStats?: {
    totalEarned: DgtAmount;
    totalSpent: DgtAmount;
    level: number;
  };
}

// Wallet data for authenticated user viewing their own wallet
export interface AuthenticatedWallet extends PublicWallet {
  // Additional personal data
  estimatedUsdValue: UsdAmount;
  
  // Transaction permissions
  permissions: {
    canTip: boolean;
    canWithdraw: boolean;
    canDeposit: boolean;
    canTransfer: boolean;
  };
  
  // Enhanced stats
  detailedStats: {
    totalTips: DgtAmount;
    totalRainReceived: DgtAmount;
    totalWithdrawn: DgtAmount;
    totalDeposited: DgtAmount;
    weeklyEarnings: DgtAmount;
    monthlyEarnings: DgtAmount;
  };
  
  // Limits and restrictions
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
  // Admin-only financial data
  adminData: {
    totalVolumeUsd: UsdAmount;
    flaggedTransactions: number;
    riskScore: number;
    lastLargeTransaction?: Date;
    suspiciousActivity: boolean;
  };
  
  // System fields
  internalNotes?: string;
  complianceFlags?: string[];
  kycStatus?: 'pending' | 'verified' | 'rejected';
  
  // Audit trail
  auditLog: {
    createdAt: Date;
    createdBy?: UserId;
    lastModifiedAt: Date;
    lastModifiedBy?: UserId;
  };
}

// Transaction types for different views
export interface PublicTransaction {
  id: TransactionId;
  type: TransactionType;
  amount: DgtAmount;
  status: TransactionStatus;
  createdAt: Date;
  
  // Public transaction context (sanitized)
  displayType: string; // "Tip", "Rain", "Purchase", etc.
  direction: 'in' | 'out';
  
  // Related user (if applicable and public)
  relatedUser?: {
    id: UserId;
    username: string;
    avatarUrl?: string;
  };
}

export interface AuthenticatedTransaction extends PublicTransaction {
  description?: string;
  metadata?: Record<string, any>; // Filtered metadata
  
  // Enhanced context
  context: {
    source?: string; // "forum_tip", "rain_event", "shop_purchase"
    threadId?: string;
    postId?: string;
    targetUserId?: UserId;
  };
  
  // USD values
  usdAmount?: UsdAmount;
  exchangeRate?: number;
  
  // Fees
  fee?: DgtAmount;
  netAmount: DgtAmount;
}

export interface AdminTransaction extends AuthenticatedTransaction {
  // Full system data
  systemData: {
    fromWalletId?: WalletId;
    toWalletId?: WalletId;
    blockchainTxId?: string;
    fromWalletAddress?: string;
    toWalletAddress?: string;
    isTreasuryTransaction: boolean;
    ipHash?: string; // Anonymized IP
  };
  
  // Admin fields
  adminNotes?: string;
  flagged: boolean;
  flagReason?: string;
  reviewedBy?: UserId;
  reviewedAt?: Date;
  
  // Full metadata
  rawMetadata: Record<string, any>;
}

// Crypto wallet types
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
  
  // Permissions
  permissions: {
    canReceive: boolean;
    canGenerateNew: boolean;
  };
}

export interface AdminCryptoWallet extends AuthenticatedCryptoWallet {
  // Admin data
  ccpaymentUserId: string;
  coinId: EntityId;
  
  // System tracking
  createdAt: Date;
  totalReceived?: UsdAmount;
  transactionCount?: number;
  lastUsed?: Date;
}

// Economy statistics and aggregations
export interface EconomyStats {
  totalDgtInCirculation: DgtAmount;
  totalUsdVolume: UsdAmount;
  activeWallets: number;
  dailyTransactions: number;
  averageBalance: DgtAmount;
  
  // Distribution
  topHolders: PublicWallet[];
  recentActivity: PublicTransaction[];
}

// Request/Response types
export interface CreateTransactionRequest {
  type: TransactionType;
  amount: DgtAmount;
  toUserId?: UserId;
  description?: string;
  metadata?: Record<string, any>;
}

export interface WithdrawalRequest {
  amount: UsdAmount;
  cryptoWalletId: CryptoWalletId;
  note?: string;
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

// Search and filtering types
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

// Response metadata
export interface EconomyPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  totalValue?: DgtAmount; // For value-based lists
}

// Type guards for validation
export const isPublicWalletSafe = (data: any): data is PublicWallet => {
  return data && 
    typeof data.id === 'string' &&
    typeof data.balance === 'number' &&
    !data.adminData && // No admin data
    !data.systemData && // No system data
    !data.internalNotes; // No internal notes
};

export const isTransactionSafe = (data: any): data is PublicTransaction => {
  return data && 
    typeof data.id === 'string' &&
    typeof data.amount === 'number' &&
    !data.systemData && // No system data
    !data.ipHash && // No IP data
    !data.adminNotes; // No admin notes
};

// Economy permission helpers
export const canUserWithdraw = (user: any, amount: UsdAmount): boolean => {
  return user && 
    user.kycVerified === true &&
    amount <= (user.dailyWithdrawalLimit || 0);
};

export const canUserTip = (user: any, amount: DgtAmount): boolean => {
  return user && 
    user.level >= 2 && // Minimum level requirement
    amount >= 0.000001 && // Minimum tip amount
    amount <= (user.dailyTipLimit || 1000);
};

export const canUserParticipateInRain = (user: any): boolean => {
  return user && 
    user.level >= 1 &&
    user.lastActiveAt && 
    new Date(user.lastActiveAt) > new Date(Date.now() - 24 * 60 * 60 * 1000); // Active in last 24h
};

/**
 * Transaction History Item - optimized for wallet history display
 * Provides enhanced transaction information with direction and context
 */
export interface TransactionHistoryItem {
  id: TransactionId;
  type: string; // Normalized transaction type
  amount: DgtAmount;
  usdValue?: UsdAmount;
  
  // Direction and counterparty information
  direction: 'incoming' | 'outgoing' | 'internal';
  counterparty?: {
    type: 'user' | 'system' | 'shop' | 'admin';
    name: string;
    id?: string;
  };
  
  // Core transaction data
  description: string;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  
  // Enhanced context
  context: {
    source: string; // Normalized source (user_tip, shop_purchase, etc.)
    category: string; // Category (social, shopping, wallet, earning, system)
    reference: string; // Reference ID or transaction ID
    threadId?: string;
    postId?: string;
    itemId?: string;
  };
  
  // Transaction properties
  properties: {
    isReversible: boolean;
    hasReceipt: boolean;
    isInternal: boolean;
    requiresConfirmation: boolean;
  };
  
  // Verification and audit
  verification: {
    isVerified: boolean;
    verifiedAt?: string;
    blockchainTxId?: string;
    confirmations: number;
  };
}