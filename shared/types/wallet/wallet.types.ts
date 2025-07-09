import type { UserId, TransactionId } from '@shared/types/ids';

/**
 * Core wallet balance structure
 */
export interface WalletBalance {
  userId: UserId;
  dgtBalance: number;
  cryptoBalances: CryptoBalance[];
  lastUpdated: string;
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

/**
 * Deposit address for crypto deposits
 */
export interface DepositAddress {
  coinSymbol: string;
  chain: string;
  address: string;
  memo?: string;
  qrCode?: string;
}

/**
 * DGT transaction record
 */
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

/**
 * Crypto withdrawal request
 */
export interface WithdrawalRequest {
  userId: UserId;
  amount: number;
  currency: string;
  address: string;
  memo?: string;
}

/**
 * Crypto withdrawal response
 */
export interface WithdrawalResponse {
  transactionId: TransactionId;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  estimatedCompletionTime?: string;
  transactionHash?: string;
  fee: number;
}

/**
 * DGT purchase request
 */
export interface PurchaseRequest {
  userId: UserId;
  amount: number;
  currency: 'USD' | 'USDT';
  paymentMethod: 'stripe' | 'ccpayment';
}

/**
 * DGT purchase order
 */
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

/**
 * Webhook processing result
 */
export interface WebhookResult {
  success: boolean;
  transactionId?: TransactionId;
  message: string;
  processed: boolean;
}

/**
 * Pagination options for transactions
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: 'createdAt' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Public wallet configuration
 */
export interface WalletConfigPublic {
  supportedCurrencies: string[];
  minimumWithdrawal: Record<string, number>;
  maximumWithdrawal: Record<string, number>;
  withdrawalFees: Record<string, number>;
  dgtExchangeRate: number;
  maintenanceMode: boolean;
}

/**
 * Internal DGT transfer
 */
export interface DgtTransfer {
  from: UserId;
  to: UserId;
  amount: number;
  reason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * CCPayment webhook payload
 */
export interface CCPaymentWebhook {
  orderId: string;
  status: string;
  amount: number;
  currency: string;
  transactionHash?: string;
  timestamp: string;
  signature: string;
}

/**
 * Stripe webhook payload
 */
export interface StripeWebhook {
  id: string;
  object: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
  created: number;
}