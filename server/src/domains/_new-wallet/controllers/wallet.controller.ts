/**
 * Wallet Controller
 * 
 * HTTP request handlers for wallet operations
 * Handles authentication, validation, and response transformation
 */

import type { Request, Response } from 'express';
import type { UserId } from '@shared/types/ids';
import type {
  WithdrawalRequest,
  PaginationOptions,
  DgtTransfer
} from '@shared/types/wallet/wallet.types';

import { logger } from '../../../core/logger';
import { WalletError, ErrorCodes } from '../../../core/errors';
import { getAuthenticatedUser } from '../../../core/auth';
import { walletService } from '../services/wallet.service';

// Import transformers
import {
  toPublicWalletBalance,
  toPublicTransaction,
  toAuthenticatedTransaction,
  toPublicDepositAddress,
  toPublicWithdrawalResponse,
  toPublicWalletConfig,
  toPaginatedResponse
} from '@shared/types/wallet/wallet.transformer';

export class WalletController {
  /**
   * GET /api/wallet/balance
   * Get user's wallet balance
   */
  async getBalance(req: Request, res: Response): Promise<void> {
    try {
      const user = getAuthenticatedUser(req);
      logger.info('WalletController', 'Getting balance', { userId: user.id });

      const balance = await walletService.getUserBalance(user.id);
      const publicBalance = toPublicWalletBalance(balance);

      res.json({
        success: true,
        data: publicBalance
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to get wallet balance');
    }
  }

  /**
   * POST /api/wallet/deposit-address
   * Create deposit address for cryptocurrency
   * 
   * Body: { coinSymbol: string, chain?: string }
   */
  async createDepositAddress(req: Request, res: Response): Promise<void> {
    try {
      const user = getAuthenticatedUser(req);
      const { coinSymbol, chain } = req.body;

      logger.info('WalletController', 'Creating deposit address', {
        userId: user.id,
        coinSymbol,
        chain
      });

      const depositAddress = await walletService.createDepositAddress(
        user.id,
        coinSymbol,
        chain
      );

      const publicAddress = toPublicDepositAddress(depositAddress);

      res.json({
        success: true,
        data: publicAddress
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to create deposit address');
    }
  }

  /**
   * POST /api/wallet/withdraw
   * Request cryptocurrency withdrawal
   * 
   * Body: WithdrawalRequest
   */
  async requestWithdrawal(req: Request, res: Response): Promise<void> {
    try {
      const user = getAuthenticatedUser(req);
      const withdrawalRequest: WithdrawalRequest = req.body;

      logger.info('WalletController', 'Processing withdrawal request', {
        userId: user.id,
        amount: withdrawalRequest.amount,
        currency: withdrawalRequest.currency
      });

      const response = await walletService.requestWithdrawal(user.id, withdrawalRequest);
      const publicResponse = toPublicWithdrawalResponse(response);

      res.json({
        success: true,
        data: publicResponse
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to process withdrawal');
    }
  }

  /**
   * GET /api/wallet/transactions
   * Get paginated transaction history
   * 
   * Query: { page?, limit?, sortBy?, sortOrder? }
   */
  async getTransactionHistory(req: Request, res: Response): Promise<void> {
    try {
      const user = getAuthenticatedUser(req);
      const { page, limit, sortBy, sortOrder } = req.query;

      const options: Partial<PaginationOptions> = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as PaginationOptions['sortBy'],
        sortOrder: sortOrder as PaginationOptions['sortOrder']
      };

      logger.info('WalletController', 'Getting transaction history', {
        userId: user.id,
        options
      });

      const transactions = await walletService.getTransactionHistory(user.id, options);
      const publicTransactions = transactions.map(toAuthenticatedTransaction);

      // Create paginated response
      const paginatedResponse = toPaginatedResponse(
        publicTransactions,
        options.page || 1,
        options.limit || 20,
        publicTransactions.length // TODO: Get actual total from service
      );

      res.json({
        success: true,
        data: paginatedResponse
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to get transaction history');
    }
  }

  /**
   * POST /api/wallet/transfer-dgt
   * Transfer DGT between users
   * 
   * Body: { to: UserId, amount: number, reason?: string }
   */
  async transferDgt(req: Request, res: Response): Promise<void> {
    try {
      const user = getAuthenticatedUser(req);
      const { to, amount, reason, metadata } = req.body;

      const transfer: DgtTransfer = {
        from: user.id,
        to: to as UserId,
        amount: parseFloat(amount),
        reason,
        metadata
      };

      logger.info('WalletController', 'Processing DGT transfer', {
        from: user.id,
        to: transfer.to,
        amount: transfer.amount
      });

      const transaction = await walletService.transferDgt(transfer);
      const publicTransaction = toAuthenticatedTransaction(transaction);

      res.json({
        success: true,
        data: publicTransaction
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to transfer DGT');
    }
  }

  /**
   * GET /api/wallet/config
   * Get public wallet configuration
   */
  async getWalletConfig(req: Request, res: Response): Promise<void> {
    try {
      logger.info('WalletController', 'Getting wallet config');

      const config = await walletService.getWalletConfig();
      const publicConfig = toPublicWalletConfig(config);

      res.json({
        success: true,
        data: publicConfig
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to get wallet config');
    }
  }

  /**
   * POST /api/wallet/webhook/:provider
   * Process webhook from payment provider
   */
  async processWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { provider } = req.params;
      const payload = JSON.stringify(req.body);
      const signature = req.headers['x-signature'] as string || '';

      logger.info('WalletController', 'Processing webhook', { provider });

      const result = await walletService.processWebhook(provider, payload, signature);

      res.json({
        success: result.success,
        message: result.message,
        data: {
          transactionId: result.transactionId,
          processed: result.processed
        }
      });
    } catch (error) {
      this.handleError(res, error, 'Failed to process webhook');
    }
  }

  /**
   * Handle errors consistently
   */
  private handleError(res: Response, error: unknown, defaultMessage: string): void {
    if (error instanceof WalletError) {
      logger.error('WalletController', error.message, {
        code: error.code,
        statusCode: error.statusCode,
        metadata: error.metadata
      });

      res.status(error.statusCode).json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
          metadata: error.metadata
        }
      });
      return;
    }

    logger.error('WalletController', defaultMessage, { error });

    res.status(500).json({
      success: false,
      error: {
        message: defaultMessage,
        code: ErrorCodes.UNKNOWN_ERROR
      }
    });
  }
}

// Export singleton instance
export const walletController = new WalletController();