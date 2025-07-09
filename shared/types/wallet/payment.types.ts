import type { UserId, TransactionId } from '@shared/types/ids';

/**
 * Payment method types
 */
export type PaymentMethod = 'stripe' | 'ccpayment' | 'crypto';

/**
 * Payment status types
 */
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';

/**
 * Payment intent for external services
 */
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  clientSecret?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payment confirmation
 */
export interface PaymentConfirmation {
  transactionId: TransactionId;
  userId: UserId;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  externalTransactionId?: string;
  confirmationNumber?: string;
  timestamp: string;
}

/**
 * Refund request
 */
export interface RefundRequest {
  transactionId: TransactionId;
  userId: UserId;
  amount: number;
  reason: string;
  metadata?: Record<string, unknown>;
}

/**
 * Refund response
 */
export interface RefundResponse {
  refundId: string;
  transactionId: TransactionId;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  estimatedCompletionTime?: string;
  reason: string;
}