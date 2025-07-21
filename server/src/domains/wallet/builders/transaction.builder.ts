/**
 * Type-Safe Transaction Builder
 * 
 * Provides a fluent interface for building transactions with compile-time
 * type safety for amounts, IDs, and metadata validation.
 */

import type {
  TransactionId,
  UserId,
  WalletId,
  ThreadId,
  PostId,
  DgtAmount,
  UsdAmount,
  TransactionType,
  TransactionStatus
} from '@shared/types';
import {
  toDgtAmount,
  toUsdAmount,
  toUserId,
  toWalletId,
  toTransactionId,
  toThreadId,
  toPostId
} from '@shared/utils/id';
import { logger } from '@core/logger';
import type { DgtTransactionMetadata } from '@shared/types/wallet';

/**
 * Transaction builder configuration
 */
interface TransactionConfig {
  type: TransactionType;
  amount: DgtAmount;
  fromWalletId: WalletId;
  toWalletId?: WalletId;
  status?: TransactionStatus;
  description?: string;
  metadata?: DgtTransactionMetadata;
  usdAmount?: UsdAmount;
  exchangeRate?: number;
  fee?: DgtAmount;
}

/**
 * Built transaction ready for persistence
 */
export interface BuiltTransaction {
  id?: TransactionId;
  type: TransactionType;
  amount: DgtAmount;
  fromWalletId: WalletId;
  toWalletId?: WalletId;
  status: TransactionStatus;
  description?: string;
  metadata: DgtTransactionMetadata;
  usdAmount?: UsdAmount;
  exchangeRate?: number;
  fee?: DgtAmount;
  netAmount: DgtAmount;
  createdAt: Date;
}

/**
 * Type-safe transaction builder
 */
export class TransactionBuilder {
  private config: Partial<TransactionConfig> = {};
  
  /**
   * Set transaction type
   */
  ofType(type: TransactionType): this {
    this.config.type = type;
    return this;
  }
  
  /**
   * Set transaction amount with validation
   */
  withAmount(amount: number): this {
    this.config.amount = toDgtAmount(amount);
    return this;
  }
  
  /**
   * Set USD amount with validation
   */
  withUsdAmount(amount: number): this {
    this.config.usdAmount = toUsdAmount(amount);
    return this;
  }
  
  /**
   * Set exchange rate
   */
  withExchangeRate(rate: number): this {
    if (rate <= 0) {
      throw new Error('Exchange rate must be positive');
    }
    this.config.exchangeRate = rate;
    return this;
  }
  
  /**
   * Set transaction fee
   */
  withFee(fee: number): this {
    this.config.fee = toDgtAmount(fee);
    return this;
  }
  
  /**
   * Set source wallet with validation
   */
  fromWallet(walletId: string): this {
    this.config.fromWalletId = toWalletId(walletId);
    return this;
  }
  
  /**
   * Set destination wallet with validation
   */
  toWallet(walletId: string): this {
    this.config.toWalletId = toWalletId(walletId);
    return this;
  }
  
  /**
   * Set transaction status
   */
  withStatus(status: TransactionStatus): this {
    this.config.status = status;
    return this;
  }
  
  /**
   * Set transaction description
   */
  withDescription(description: string): this {
    this.config.description = description;
    return this;
  }
  
  /**
   * Set transaction metadata
   */
  withMetadata(metadata: Partial<DgtTransactionMetadata>): this {
    this.config.metadata = {
      ...this.config.metadata,
      ...metadata
    } as DgtTransactionMetadata;
    return this;
  }
  
  /**
   * Build a tip transaction
   */
  tip(amount: number, fromUserId: string, toUserId: string): this {
    return this
      .ofType('TIP')
      .withAmount(amount)
      .withMetadata({
        source: 'tip_send',
        fromUserId: toUserId(fromUserId),
        toUserId: toUserId(toUserId)
      });
  }
  
  /**
   * Build a forum tip transaction
   */
  forumTip(
    amount: number,
    fromUserId: string,
    toUserId: string,
    threadId: string,
    postId?: string
  ): this {
    const metadata: Partial<DgtTransactionMetadata> = {
      source: 'tip_send',
      fromUserId: toUserId(fromUserId),
      toUserId: toUserId(toUserId),
      threadId: toThreadId(threadId)
    };
    
    if (postId) {
      metadata.postId = toPostId(postId);
    }
    
    return this
      .ofType('TIP')
      .withAmount(amount)
      .withMetadata(metadata);
  }
  
  /**
   * Build a rain transaction
   */
  rain(totalAmount: number, fromUserId: string, participantCount: number): this {
    return this
      .ofType('RAIN')
      .withAmount(totalAmount)
      .withMetadata({
        source: 'rain_send',
        fromUserId: toUserId(fromUserId),
        participantCount,
        amountPerUser: totalAmount / participantCount
      });
  }
  
  /**
   * Build a shop purchase transaction
   */
  shopPurchase(amount: number, userId: string, itemId: string): this {
    return this
      .ofType('SHOP_PURCHASE')
      .withAmount(amount)
      .withMetadata({
        source: 'shop_purchase',
        fromUserId: toUserId(userId),
        shopItemId: itemId
      });
  }
  
  /**
   * Build a crypto deposit transaction
   */
  cryptoDeposit(
    dgtAmount: number,
    usdAmount: number,
    userId: string,
    originalToken: string
  ): this {
    return this
      .ofType('DEPOSIT')
      .withAmount(dgtAmount)
      .withUsdAmount(usdAmount)
      .withExchangeRate(usdAmount / dgtAmount)
      .withMetadata({
        source: 'crypto_deposit',
        toUserId: toUserId(userId),
        originalToken,
        usdtAmount: usdAmount.toString()
      });
  }
  
  /**
   * Build an admin adjustment transaction
   */
  adminAdjustment(
    amount: number,
    userId: string,
    adminId: string,
    reason: string,
    isCredit: boolean
  ): this {
    return this
      .ofType('ADMIN_ADJUST')
      .withAmount(Math.abs(amount))
      .withDescription(reason)
      .withMetadata({
        source: isCredit ? 'admin_credit' : 'admin_debit',
        [isCredit ? 'toUserId' : 'fromUserId']: toUserId(userId),
        adminId: toUserId(adminId),
        reason
      });
  }
  
  /**
   * Validate and build the transaction
   */
  build(): BuiltTransaction {
    // Validate required fields
    if (!this.config.type) {
      throw new Error('Transaction type is required');
    }
    
    if (!this.config.amount) {
      throw new Error('Transaction amount is required');
    }
    
    if (!this.config.fromWalletId) {
      throw new Error('Source wallet is required');
    }
    
    // Set defaults
    const status = this.config.status || 'pending';
    const metadata = this.config.metadata || { source: 'manual_credit' };
    
    // Calculate net amount
    const fee = this.config.fee || toDgtAmount(0);
    const netAmount = toDgtAmount(this.config.amount - fee);
    
    // Build transaction
    const transaction: BuiltTransaction = {
      type: this.config.type,
      amount: this.config.amount,
      fromWalletId: this.config.fromWalletId,
      toWalletId: this.config.toWalletId,
      status,
      description: this.config.description,
      metadata,
      usdAmount: this.config.usdAmount,
      exchangeRate: this.config.exchangeRate,
      fee: fee > 0 ? fee : undefined,
      netAmount,
      createdAt: new Date()
    };
    
    logger.debug('TRANSACTION_BUILDER', 'Built transaction', {
      type: transaction.type,
      amount: transaction.amount,
      from: transaction.fromWalletId,
      to: transaction.toWalletId,
      metadata: transaction.metadata
    });
    
    return transaction;
  }
  
  /**
   * Create a new transaction builder
   */
  static create(): TransactionBuilder {
    return new TransactionBuilder();
  }
}

/**
 * Helper function to create a transaction builder
 */
export function transaction(): TransactionBuilder {
  return TransactionBuilder.create();
}