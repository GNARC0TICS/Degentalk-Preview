/**
 * Core Wallet Service
 * 
 * Orchestrates wallet operations across different providers
 * Provides unified interface for wallet functionality
 */

import type { UserId, TransactionId } from '@shared/types/ids';
import type {
  WalletBalance,
  DepositAddress,
  DgtTransaction,
  WithdrawalRequest,
  WithdrawalResponse,
  PurchaseRequest,
  PurchaseOrder,
  WebhookResult,
  PaginationOptions,
  WalletConfigPublic,
  DgtTransfer
} from '@shared/types/wallet/wallet.types';

import { logger } from '../../../core/logger';
import { WalletError, ErrorCodes } from '../../../core/errors';

// Import adapters
import { ccpaymentAdapter } from '../adapters/ccpayment.adapter';
import { CacheAdapter } from '../adapters/cache.adapter';
import type { WalletAdapter } from '../adapters/ccpayment.adapter';

export interface WalletServiceConfig {
  primaryProvider: 'ccpayment';
  enableCaching: boolean;
  cacheProvider?: 'memory' | 'redis';
  defaultCurrency: string;
  supportedCurrencies: string[];
}

export class WalletService {
  private readonly config: WalletServiceConfig;
  private readonly primaryAdapter: WalletAdapter;

  constructor(config: Partial<WalletServiceConfig> = {}) {
    this.config = {
      primaryProvider: 'ccpayment',
      enableCaching: true,
      cacheProvider: 'memory',
      defaultCurrency: 'USDT',
      supportedCurrencies: ['USDT', 'BTC', 'ETH', 'SOL'],
      ...config
    };

    // Initialize primary adapter
    const baseAdapter = this.createPrimaryAdapter();
    
    // Wrap with caching if enabled
    this.primaryAdapter = this.config.enableCaching 
      ? new CacheAdapter(baseAdapter)
      : baseAdapter;

    logger.info('WalletService', 'Initialized with configuration', {
      primaryProvider: this.config.primaryProvider,
      enableCaching: this.config.enableCaching,
      supportedCurrencies: this.config.supportedCurrencies
    });
  }

  /**
   * Get comprehensive user wallet balance
   */
  async getUserBalance(userId: UserId): Promise<WalletBalance> {
    try {
      logger.info('WalletService', 'Fetching user balance', { userId });

      const balance = await this.primaryAdapter.getUserBalance(userId);

      logger.info('WalletService', 'User balance retrieved successfully', {
        userId,
        dgtBalance: balance.dgtBalance,
        cryptoAssets: balance.cryptoBalances.length
      });

      return balance;
    } catch (error) {
      logger.error('WalletService', 'Error fetching user balance', {
        userId,
        error
      });
      throw this.handleError(error, 'Failed to fetch user balance');
    }
  }

  /**
   * Create deposit address for cryptocurrency
   */
  async createDepositAddress(
    userId: UserId,
    coinSymbol: string,
    chain?: string
  ): Promise<DepositAddress> {
    try {
      this.validateCurrency(coinSymbol);

      logger.info('WalletService', 'Creating deposit address', {
        userId,
        coinSymbol,
        chain
      });

      const depositAddress = await this.primaryAdapter.createDepositAddress(
        userId,
        coinSymbol,
        chain || this.getDefaultChain(coinSymbol)
      );

      logger.info('WalletService', 'Deposit address created successfully', {
        userId,
        coinSymbol,
        chain: depositAddress.chain
      });

      return depositAddress;
    } catch (error) {
      logger.error('WalletService', 'Error creating deposit address', {
        userId,
        coinSymbol,
        chain,
        error
      });
      throw this.handleError(error, 'Failed to create deposit address');
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
      this.validateWithdrawalRequest(request);

      logger.info('WalletService', 'Processing withdrawal request', {
        userId,
        amount: request.amount,
        currency: request.currency
      });

      const response = await this.primaryAdapter.requestWithdrawal(userId, request);

      logger.info('WalletService', 'Withdrawal processed successfully', {
        userId,
        transactionId: response.transactionId,
        status: response.status
      });

      return response;
    } catch (error) {
      logger.error('WalletService', 'Error processing withdrawal', {
        userId,
        request,
        error
      });
      throw this.handleError(error, 'Failed to process withdrawal');
    }
  }

  /**
   * Get paginated transaction history
   */
  async getTransactionHistory(
    userId: UserId,
    options: Partial<PaginationOptions> = {}
  ): Promise<DgtTransaction[]> {
    try {
      const paginationOptions: PaginationOptions = {
        page: options.page || 1,
        limit: Math.min(options.limit || 20, 100), // Cap at 100
        sortBy: options.sortBy || 'createdAt',
        sortOrder: options.sortOrder || 'desc'
      };

      logger.info('WalletService', 'Fetching transaction history', {
        userId,
        options: paginationOptions
      });

      const transactions = await this.primaryAdapter.getTransactionHistory(
        userId,
        paginationOptions
      );

      logger.info('WalletService', 'Transaction history retrieved successfully', {
        userId,
        transactionCount: transactions.length,
        page: paginationOptions.page
      });

      return transactions;
    } catch (error) {
      logger.error('WalletService', 'Error fetching transaction history', {
        userId,
        options,
        error
      });
      throw this.handleError(error, 'Failed to fetch transaction history');
    }
  }

  /**
   * Process internal DGT transfer between users
   */
  async transferDgt(transfer: DgtTransfer): Promise<DgtTransaction> {
    try {
      logger.info('WalletService', 'Processing DGT transfer', {
        from: transfer.from,
        to: transfer.to,
        amount: transfer.amount
      });

      // Validate transfer
      this.validateDgtTransfer(transfer);

      // Create transaction record
      const transactionId = this.generateTransactionId();
      const transaction: DgtTransaction = {
        id: transactionId,
        userId: transfer.from,
        type: 'transfer',
        amount: -transfer.amount, // Negative for sender
        status: 'completed',
        metadata: {
          transferTo: transfer.to,
          reason: transfer.reason,
          ...transfer.metadata
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // TODO: Implement actual database operations
      // - Deduct from sender
      // - Add to receiver
      // - Create transaction records

      logger.info('WalletService', 'DGT transfer completed successfully', {
        transactionId,
        from: transfer.from,
        to: transfer.to,
        amount: transfer.amount
      });

      return transaction;
    } catch (error) {
      logger.error('WalletService', 'Error processing DGT transfer', {
        transfer,
        error
      });
      throw this.handleError(error, 'Failed to process DGT transfer');
    }
  }

  /**
   * Process webhook from payment provider
   */
  async processWebhook(
    provider: string,
    payload: string,
    signature: string
  ): Promise<WebhookResult> {
    try {
      logger.info('WalletService', 'Processing webhook', { provider });

      if (provider !== this.config.primaryProvider) {
        throw new WalletError(
          `Unsupported webhook provider: ${provider}`,
          ErrorCodes.VALIDATION_ERROR,
          400,
          { provider }
        );
      }

      const result = await this.primaryAdapter.processWebhook(payload, signature);

      logger.info('WalletService', 'Webhook processed successfully', {
        provider,
        success: result.success,
        transactionId: result.transactionId
      });

      return result;
    } catch (error) {
      logger.error('WalletService', 'Error processing webhook', {
        provider,
        error
      });
      throw this.handleError(error, 'Failed to process webhook');
    }
  }

  /**
   * Get public wallet configuration
   */
  async getWalletConfig(): Promise<WalletConfigPublic> {
    return {
      supportedCurrencies: this.config.supportedCurrencies,
      minimumWithdrawal: {
        BTC: 0.001,
        ETH: 0.01,
        USDT: 10,
        SOL: 0.1
      },
      maximumWithdrawal: {
        BTC: 10,
        ETH: 100,
        USDT: 100000,
        SOL: 1000
      },
      withdrawalFees: {
        BTC: 0.0005,
        ETH: 0.005,
        USDT: 1,
        SOL: 0.01
      },
      dgtExchangeRate: 0.01, // 1 DGT = $0.01 USD
      maintenanceMode: false
    };
  }

  /**
   * Create primary adapter based on configuration
   */
  private createPrimaryAdapter(): WalletAdapter {
    switch (this.config.primaryProvider) {
      case 'ccpayment':
        return ccpaymentAdapter;
      default:
        throw new Error(`Unsupported primary provider: ${this.config.primaryProvider}`);
    }
  }

  /**
   * Validate currency is supported
   */
  private validateCurrency(currency: string): void {
    if (!this.config.supportedCurrencies.includes(currency)) {
      throw new WalletError(
        `Unsupported currency: ${currency}`,
        ErrorCodes.VALIDATION_ERROR,
        400,
        { currency, supportedCurrencies: this.config.supportedCurrencies }
      );
    }
  }

  /**
   * Validate withdrawal request
   */
  private validateWithdrawalRequest(request: WithdrawalRequest): void {
    this.validateCurrency(request.currency);

    if (request.amount <= 0) {
      throw new WalletError(
        'Withdrawal amount must be positive',
        ErrorCodes.VALIDATION_ERROR,
        400,
        { amount: request.amount }
      );
    }

    if (!request.address || request.address.trim().length === 0) {
      throw new WalletError(
        'Withdrawal address is required',
        ErrorCodes.VALIDATION_ERROR,
        400
      );
    }
  }

  /**
   * Validate DGT transfer request
   */
  private validateDgtTransfer(transfer: DgtTransfer): void {
    if (transfer.amount <= 0) {
      throw new WalletError(
        'Transfer amount must be positive',
        ErrorCodes.VALIDATION_ERROR,
        400,
        { amount: transfer.amount }
      );
    }

    if (transfer.from === transfer.to) {
      throw new WalletError(
        'Cannot transfer to same user',
        ErrorCodes.VALIDATION_ERROR,
        400,
        { from: transfer.from, to: transfer.to }
      );
    }
  }

  /**
   * Get default chain for a currency
   */
  private getDefaultChain(currency: string): string {
    const defaultChains: Record<string, string> = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'USDT': 'Ethereum',
      'SOL': 'Solana'
    };

    return defaultChains[currency] || 'Ethereum';
  }

  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(): TransactionId {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as TransactionId;
  }

  /**
   * Handle and standardize errors
   */
  private handleError(error: unknown, message: string): WalletError {
    if (error instanceof WalletError) {
      return error;
    }

    return new WalletError(
      message,
      ErrorCodes.UNKNOWN_ERROR,
      500,
      { originalError: error }
    );
  }
}

// Export singleton instance
export const walletService = new WalletService();