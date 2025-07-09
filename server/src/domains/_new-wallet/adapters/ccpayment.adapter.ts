/**
 * CCPayment Wallet Adapter
 * 
 * Implements the wallet adapter interface for CCPayment provider
 * Leverages existing CCPayment services for actual implementation
 */

import type { UserId, TransactionId } from '@shared/types/ids';
import type {
  WalletBalance,
  CryptoBalance,
  DepositAddress,
  DgtTransaction,
  WithdrawalRequest,
  WithdrawalResponse,
  PurchaseRequest,
  PurchaseOrder,
  WebhookResult,
  PaginationOptions
} from '@shared/types/wallet/wallet.types';
import {
  fromCCPaymentBalance,
  fromCCPaymentDepositAddress
} from '@shared/types/wallet/wallet.transformer';

import { logger } from '../../../core/logger';
import { WalletError, ErrorCodes } from '../../../core/errors';

// Import existing CCPayment services
import { ccpaymentService } from '../../wallet/ccpayment.service';
import { ccpaymentBalanceService } from '../../wallet/services/ccpayment-balance.service';
import { ccpaymentDepositService } from '../../wallet/services/ccpayment-deposit.service';
import { ccpaymentTokenService } from '../../wallet/services/ccpayment-token.service';

export interface WalletAdapter {
  getUserBalance(userId: UserId): Promise<WalletBalance>;
  createDepositAddress(userId: UserId, coinSymbol: string, chain: string): Promise<DepositAddress>;
  requestWithdrawal(userId: UserId, request: WithdrawalRequest): Promise<WithdrawalResponse>;
  getTransactionHistory(userId: UserId, options: PaginationOptions): Promise<DgtTransaction[]>;
  processWebhook(payload: string, signature: string): Promise<WebhookResult>;
}

export class CCPaymentAdapter implements WalletAdapter {
  /**
   * Get comprehensive user balance including DGT and crypto
   */
  async getUserBalance(userId: UserId): Promise<WalletBalance> {
    try {
      logger.info('CCPaymentAdapter', 'Fetching user balance', { userId });

      // Get CCPayment user ID from database (would need to implement this mapping)
      const ccPaymentUserId = await this.getCCPaymentUserId(userId);
      
      // Get crypto balances from CCPayment
      const ccBalances = await ccpaymentBalanceService.getUserCryptoBalances(ccPaymentUserId);
      
      // Transform CCPayment balances to our format
      const cryptoBalances: CryptoBalance[] = ccBalances.map(fromCCPaymentBalance);

      // Get DGT balance from local database (would need to implement)
      const dgtBalance = await this.getDgtBalance(userId);

      const walletBalance: WalletBalance = {
        userId,
        dgtBalance,
        cryptoBalances,
        lastUpdated: new Date().toISOString()
      };

      logger.info('CCPaymentAdapter', 'User balance retrieved successfully', {
        userId,
        cryptoBalanceCount: cryptoBalances.length,
        dgtBalance
      });

      return walletBalance;
    } catch (error) {
      logger.error('CCPaymentAdapter', 'Error fetching user balance', {
        userId,
        error
      });

      if (error instanceof WalletError) {
        throw error;
      }

      throw new WalletError(
        'Failed to fetch user balance',
        ErrorCodes.PAYMENT_PROVIDER_ERROR,
        500,
        { userId, originalError: error }
      );
    }
  }

  /**
   * Create deposit address for specified coin and chain
   */
  async createDepositAddress(
    userId: UserId,
    coinSymbol: string,
    chain: string
  ): Promise<DepositAddress> {
    try {
      logger.info('CCPaymentAdapter', 'Creating deposit address', {
        userId,
        coinSymbol,
        chain
      });

      const ccPaymentUserId = await this.getCCPaymentUserId(userId);
      
      const ccAddress = await ccpaymentDepositService.createDepositAddress(
        ccPaymentUserId,
        coinSymbol
      );

      const depositAddress = fromCCPaymentDepositAddress({
        coinSymbol,
        chain,
        address: ccAddress.address,
        memo: ccAddress.memo,
        qrCode: ccAddress.qrCode
      });

      logger.info('CCPaymentAdapter', 'Deposit address created successfully', {
        userId,
        coinSymbol,
        chain,
        address: depositAddress.address.substring(0, 10) + '...'
      });

      return depositAddress;
    } catch (error) {
      logger.error('CCPaymentAdapter', 'Error creating deposit address', {
        userId,
        coinSymbol,
        chain,
        error
      });

      if (error instanceof WalletError) {
        throw error;
      }

      throw new WalletError(
        'Failed to create deposit address',
        ErrorCodes.PAYMENT_PROVIDER_ERROR,
        500,
        { userId, coinSymbol, chain, originalError: error }
      );
    }
  }

  /**
   * Request cryptocurrency withdrawal
   */
  async requestWithdrawal(
    userId: UserId,
    request: WithdrawalRequest
  ): Promise<WithdrawalResponse> {
    try {
      logger.info('CCPaymentAdapter', 'Processing withdrawal request', {
        userId,
        amount: request.amount,
        currency: request.currency
      });

      // Validate withdrawal address
      const isValidAddress = await ccpaymentTokenService.checkWithdrawalAddressValidity(
        request.currency,
        request.address
      );

      if (!isValidAddress) {
        throw new WalletError(
          'Invalid withdrawal address',
          ErrorCodes.VALIDATION_ERROR,
          400,
          { address: request.address, currency: request.currency }
        );
      }

      // Create unique order ID
      const orderId = `withdrawal_${userId}_${Date.now()}`;

      const ccWithdrawal = await ccpaymentService.requestWithdrawal({
        amount: request.amount,
        currency: request.currency,
        orderId,
        address: request.address,
        notifyUrl: process.env.CCPAYMENT_WEBHOOK_URL || ''
      });

      // Generate transaction ID (would need proper ID generation)
      const transactionId = `tx_${orderId}` as TransactionId;

      const withdrawalResponse: WithdrawalResponse = {
        transactionId,
        status: ccWithdrawal.status as any,
        estimatedCompletionTime: ccWithdrawal.estimatedTime,
        transactionHash: ccWithdrawal.txHash,
        fee: ccWithdrawal.fee
      };

      logger.info('CCPaymentAdapter', 'Withdrawal processed successfully', {
        userId,
        transactionId,
        status: withdrawalResponse.status
      });

      return withdrawalResponse;
    } catch (error) {
      logger.error('CCPaymentAdapter', 'Error processing withdrawal', {
        userId,
        request,
        error
      });

      if (error instanceof WalletError) {
        throw error;
      }

      throw new WalletError(
        'Failed to process withdrawal',
        ErrorCodes.PAYMENT_PROVIDER_ERROR,
        500,
        { userId, request, originalError: error }
      );
    }
  }

  /**
   * Get paginated transaction history
   */
  async getTransactionHistory(
    userId: UserId,
    options: PaginationOptions
  ): Promise<DgtTransaction[]> {
    try {
      logger.info('CCPaymentAdapter', 'Fetching transaction history', {
        userId,
        page: options.page,
        limit: options.limit
      });

      const ccPaymentUserId = await this.getCCPaymentUserId(userId);

      const ccTransactions = await ccpaymentBalanceService.getTransactionHistory({
        userId: ccPaymentUserId,
        page: options.page,
        limit: options.limit,
        type: 'all'
      });

      // Transform CCPayment transactions to our format
      const transactions: DgtTransaction[] = ccTransactions.transactions.map(tx => ({
        id: `tx_${tx.orderId}` as TransactionId,
        userId,
        type: this.mapTransactionType(tx.type),
        amount: parseFloat(tx.amount),
        status: this.mapTransactionStatus(tx.status),
        metadata: {
          ccPaymentOrderId: tx.orderId,
          currency: tx.currency,
          txHash: tx.txHash,
          ccPaymentType: tx.type
        },
        createdAt: tx.createdAt,
        updatedAt: tx.updatedAt || tx.createdAt
      }));

      logger.info('CCPaymentAdapter', 'Transaction history retrieved successfully', {
        userId,
        transactionCount: transactions.length
      });

      return transactions;
    } catch (error) {
      logger.error('CCPaymentAdapter', 'Error fetching transaction history', {
        userId,
        options,
        error
      });

      if (error instanceof WalletError) {
        throw error;
      }

      throw new WalletError(
        'Failed to fetch transaction history',
        ErrorCodes.PAYMENT_PROVIDER_ERROR,
        500,
        { userId, options, originalError: error }
      );
    }
  }

  /**
   * Process webhook from CCPayment
   */
  async processWebhook(payload: string, signature: string): Promise<WebhookResult> {
    try {
      logger.info('CCPaymentAdapter', 'Processing webhook');

      const event = JSON.parse(payload);
      
      // Process through existing CCPayment service
      await ccpaymentService.processWebhookEvent(
        { ...event, signature },
        this.handleDepositWebhook.bind(this),
        this.handleWithdrawalWebhook.bind(this)
      );

      return {
        success: true,
        transactionId: `tx_${event.orderId}` as TransactionId,
        message: 'Webhook processed successfully',
        processed: true
      };
    } catch (error) {
      logger.error('CCPaymentAdapter', 'Error processing webhook', { error });

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown webhook error',
        processed: false
      };
    }
  }

  /**
   * Handle deposit webhook event
   */
  private async handleDepositWebhook(
    orderId: string,
    amount: string,
    currency: string,
    txHash?: string
  ): Promise<void> {
    logger.info('CCPaymentAdapter', 'Processing deposit webhook', {
      orderId,
      amount,
      currency,
      txHash
    });

    // Implementation would update local database with deposit
    // For now, just log the event
  }

  /**
   * Handle withdrawal webhook event
   */
  private async handleWithdrawalWebhook(
    orderId: string,
    status: string,
    txHash?: string
  ): Promise<void> {
    logger.info('CCPaymentAdapter', 'Processing withdrawal webhook', {
      orderId,
      status,
      txHash
    });

    // Implementation would update local database with withdrawal status
    // For now, just log the event
  }

  /**
   * Get CCPayment user ID from database mapping
   */
  private async getCCPaymentUserId(userId: UserId): Promise<string> {
    // This would typically query a database table that maps DT user IDs to CCPayment user IDs
    // For now, return a mock implementation
    return `ccpayment_${userId}`;
  }

  /**
   * Get DGT balance from local database
   */
  private async getDgtBalance(userId: UserId): Promise<number> {
    // This would query the local database for DGT balance
    // For now, return mock data
    return 0;
  }

  /**
   * Map CCPayment transaction type to our enum
   */
  private mapTransactionType(ccType: string): DgtTransaction['type'] {
    switch (ccType.toLowerCase()) {
      case 'deposit':
        return 'deposit';
      case 'withdrawal':
        return 'withdrawal';
      case 'transfer':
        return 'transfer';
      default:
        return 'deposit';
    }
  }

  /**
   * Map CCPayment status to our enum
   */
  private mapTransactionStatus(ccStatus: string): DgtTransaction['status'] {
    switch (ccStatus.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'completed';
      case 'pending':
      case 'processing':
        return 'pending';
      case 'failed':
      case 'error':
        return 'failed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  }
}

// Export singleton instance
export const ccpaymentAdapter = new CCPaymentAdapter();