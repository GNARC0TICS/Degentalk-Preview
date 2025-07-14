import type { HeatEventId } from '../shared/types/ids';
import type { ActionId } from '../shared/types/ids';
import type { AuditLogId } from '../shared/types/ids';
import type { EventId } from '../shared/types/ids';
import type { PrefixId } from '../shared/types/ids';
import type { MessageId } from '../shared/types/ids';
import type { FollowRequestId } from '../shared/types/ids';
import type { FriendRequestId } from '../shared/types/ids';
import type { NotificationId } from '../shared/types/ids';
import type { UnlockId } from '../shared/types/ids';
import type { StoreItemId } from '../shared/types/ids';
import type { OrderId } from '../shared/types/ids';
import type { QuoteId } from '../shared/types/ids';
import type { ReplyId } from '../shared/types/ids';
import type { DraftId } from '../shared/types/ids';
import type { IpLogId } from '../shared/types/ids';
import type { ModActionId } from '../shared/types/ids';
import type { SessionId } from '../shared/types/ids';
import type { BanId } from '../shared/types/ids';
import type { VerificationTokenId } from '../shared/types/ids';
import type { SignatureItemId } from '../shared/types/ids';
import type { ContentId } from '../shared/types/ids';
import type { RequestId } from '../shared/types/ids';
import type { ZoneId } from '../shared/types/ids';
import type { WhaleId } from '../shared/types/ids';
import type { VaultLockId } from '../shared/types/ids';
import type { VaultId } from '../shared/types/ids';
import type { UnlockTransactionId } from '../shared/types/ids';
import type { TipId } from '../shared/types/ids';
import type { TemplateId } from '../shared/types/ids';
import type { TagId } from '../shared/types/ids';
import type { SubscriptionId } from '../shared/types/ids';
import type { StickerId } from '../shared/types/ids';
import type { SettingId } from '../shared/types/ids';
import type { RuleId } from '../shared/types/ids';
import type { ParentZoneId } from '../shared/types/ids';
import type { ParentForumId } from '../shared/types/ids';
import type { PackId } from '../shared/types/ids';
import type { ModeratorId } from '../shared/types/ids';
import type { MentionId } from '../shared/types/ids';
import type { ItemId } from '../shared/types/ids';
import type { InventoryId } from '../shared/types/ids';
import type { GroupId } from '../shared/types/ids';
import type { ForumId } from '../shared/types/ids';
import type { EntryId } from '../shared/types/ids';
import type { EntityId } from '../shared/types/ids';
import type { EmojiPackId } from '../shared/types/ids';
import type { EditorId } from '../shared/types/ids';
import type { CosmeticId } from '../shared/types/ids';
import type { AuthorId } from '../shared/types/ids';
import type { CoinId } from '../shared/types/ids';
import type { CategoryId } from '../shared/types/ids';
import type { BackupId } from '../shared/types/ids';
import type { AnimationFrameId } from '../shared/types/ids';
import type { AirdropId } from '../shared/types/ids';
import type { AdminUserId } from '../shared/types/ids';
import type { RoomId } from '../shared/types/ids';
import type { ConversationId } from '../shared/types/ids';
import type { ReportId } from '../shared/types/ids';
import type { ReporterId } from '../shared/types/ids';
import type { AdminId } from '../shared/types/ids';
/**
 * Transaction Domain Template
 * 
 * [REFAC-TRANSACTIONS]
 * 
 * This template provides the structure for implementing the Transactions domain
 * as part of the final restructuring sprint (May 2025).
 */

// transaction.routes.ts
export const transactionRoutesTemplate = `/**
 * Transaction Routes
 * 
 * [REFAC-TRANSACTIONS]
 * 
 * This file defines API routes for transaction history functionality
 * including unified querying across DGT and crypto transactions.
 */

import { Router } from 'express';
import { transactionController } from './transaction.controller';
import { asyncHandler } from '../../domains/wallet/wallet.errors';
import { authMiddleware } from '../../middleware/auth';
import { validateTransactionQuery } from './transaction.validators';

// Create router
const router = Router();

// Apply auth middleware to all transaction routes
router.use(authMiddleware);

/**
 * @route GET /api/transactions/history
 * @desc Get user's unified transaction history (DGT and crypto)
 * @access Private
 */
router.get(
  '/history',
  validateTransactionQuery,
  asyncHandler(transactionController.getTransactionHistory.bind(transactionController))
);

/**
 * @route GET /api/transactions/:id
 * @desc Get transaction details by ID
 * @access Private
 */
router.get(
  '/:id',
  asyncHandler(transactionController.getTransactionById.bind(transactionController))
);

/**
 * @route GET /api/transactions/stats
 * @desc Get transaction statistics
 * @access Private
 */
router.get(
  '/stats',
  asyncHandler(transactionController.getTransactionStats.bind(transactionController))
);

export default router;`;

// transaction.controller.ts
export const transactionControllerTemplate = `/**
 * Transaction Controller
 * 
 * [REFAC-TRANSACTIONS]
 * 
 * This controller handles transaction-related API requests,
 * providing a unified view of DGT and crypto transactions.
 */

import type { Request, Response } from 'express';
import { logger } from '../../core/logger';
import { transactionService } from './transaction.service';
import { WalletError, WalletErrorCodes } from '../wallet/wallet.errors';
import { eq, and, desc, or, like, count } from "drizzle-orm";
import { transactions, users, dgtPurchaseOrders } from '../db/utils/schema';

/**
 * Transaction controller for handling transaction-related requests
 */
export class TransactionController {
  /**
   * Get user's unified transaction history (DGT and crypto)
   */
  async getTransactionHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page as : AdminId) || 1;
      const limit = parseInt(req.query.limit as : AdminId) || 10;
      const type = req.query.type as : AdminId;
      const currency = req.query.currency as : AdminId;
      const startDate = req.query.startDate as : AdminId;
      const endDate = req.query.endDate as : AdminId;

      const result = await transactionService.getTransactionHistory(
        userId,
        {
          page,
          limit,
          type,
          currency,
          startDate,
          endDate
        }
      );

      res.json(result);
    } catch (error) {
      logger.error('Error getting transaction history:', error);
      
      if (error instanceof WalletError) {
        res.status(error.httpStatus).json({
          error: error.message,
          code: error.code
        });
        return;
      }
      
      res.status(500).json({
        error: 'Failed to get transaction history',
        code: WalletErrorCodes.UNKNOWN_ERROR
      });
    }
  }

  /**
   * Get transaction details by ID
   */
  async getTransactionById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const transactionId = parseInt(req.params.id);

      if (isNaN(transactionId)) {
        res.status(400).json({
          error: 'Invalid transaction ID',
          code: WalletErrorCodes.INVALID_REQUEST
        });
        return;
      }

      const transaction = await transactionService.getTransactionById(userId, transactionId);

      if (!transaction) {
        res.status(404).json({
          error: 'Transaction not found',
          code: WalletErrorCodes.TRANSACTION_NOT_FOUND
        });
        return;
      }

      res.json(transaction);
    } catch (error) {
      logger.error('Error getting transaction details:', error);
      
      if (error instanceof WalletError) {
        res.status(error.httpStatus).json({
          error: error.message,
          code: error.code
        });
        return;
      }
      
      res.status(500).json({
        error: 'Failed to get transaction details',
        code: WalletErrorCodes.UNKNOWN_ERROR
      });
    }
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const period = req.query.period as 'day' | 'week' | 'month' | 'year' || 'month';

      const stats = await transactionService.getTransactionStats(userId, period);

      res.json(stats);
    } catch (error) {
      logger.error('Error getting transaction stats:', error);
      
      if (error instanceof WalletError) {
        res.status(error.httpStatus).json({
          error: error.message,
          code: error.code
        });
        return;
      }
      
      res.status(500).json({
        error: 'Failed to get transaction statistics',
        code: WalletErrorCodes.UNKNOWN_ERROR
      });
    }
  }
}

// Export a singleton instance
export const transactionController = new TransactionController();`;

// transaction.service.ts
export const transactionServiceTemplate = `/**
 * Transaction Service
 * 
 * [REFAC-TRANSACTIONS]
 * 
 * This service provides a unified query layer for transactions across DGT and crypto.
 * It does NOT write transactions - that functionality is handled by the respective
 * services (dgt.service.ts, ccpayment.service.ts).
 */

import { db } from '../db';
import { sql, eq, and, desc, or, count, inArray } from 'drizzle-orm';
import { transactions, users, dgtPurchaseOrders } from '../db/utils/schema';
import { logger } from '../../core/logger';
import { WalletError, WalletErrorCodes } from '../wallet/wallet.errors';
import { ccpaymentService } from '../wallet/ccpayment.service';
import { formatDateTimeForDb } from '../../utils/date-utils';

export interface TransactionQueryParams {
  page: number;
  limit: number;
  type?: : AdminId;
  currency?: : AdminId;
  startDate?: : AdminId;
  endDate?: : AdminId;
}

export interface TransactionStatsPeriod {
  sent: number;
  received: number;
  fees: number;
  count: number;
}

export interface TransactionStats {
  dgt: {
    totalSent: number;
    totalReceived: number;
    totalFees: number;
    byPeriod: TransactionStatsPeriod[];
  };
  crypto?: {
    totalSent: number;
    totalReceived: number;
    totalFees: number;
    byPeriod: TransactionStatsPeriod[];
  };
}

/**
 * Service for querying transaction data
 */
export class TransactionService {
  /**
   * Get unified transaction history for a user
   */
  async getTransactionHistory(userId: number, params: TransactionQueryParams) {
    try {
      const { page, limit, type, currency, startDate, endDate } = params;
      const offset = (page - 1) * limit;
      
      // Build query for DGT transactions
      let query = db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.createdAt))
        .limit(limit)
        .offset(offset);
      
      // Apply filters if provided
      if (type) {
        query = query.where(eq(transactions.type, type));
      }
      
      if (currency) {
        query = query.where(eq(transactions.currency, currency));
      }
      
      if (startDate) {
        const startDateTime = formatDateTimeForDb(new Date(startDate));
        query = query.where(gte(transactions.createdAt, startDateTime));
      }
      
      if (endDate) {
        const endDateTime = formatDateTimeForDb(new Date(endDate));
        query = query.where(lte(transactions.createdAt, endDateTime));
      }
      
      // Get DGT transactions
      const dgtTransactions = await query;
      
      // Get total count for pagination
      const [countResult] = await db
        .select({
          count: sql<number>\`count(*)\`
        })
        .from(transactions)
        .where(eq(transactions.userId, userId));
      
      // Get user's CCPayment account ID
      const [user] = await db
        .select({ ccpaymentAccountId: users.ccpaymentAccountId })
        .from(users)
        .where(eq(users.id, userId));
      
      // If user has CCPayment account and we're not filtering by currency=DGT,
      // fetch crypto transactions from CCPayment
      let cryptoTransactions = [];
      if (user?.ccpaymentAccountId && currency !== 'DGT') {
        // This implementation will depend on what data the CCPayment API provides
        // For now, we'll just get the most recent transactions 
        cryptoTransactions = await ccpaymentService.getTransactionHistory(
          user.ccpaymentAccountId,
          page,
          limit
        );
        
        // Apply the same filters we applied to DGT transactions
        if (type) {
          cryptoTransactions = cryptoTransactions.filter(tx => 
            tx.type.toUpperCase() === type.toUpperCase()
          );
        }
        
        if (currency && currency !== 'DGT') {
          cryptoTransactions = cryptoTransactions.filter(tx => 
            tx.currency.toUpperCase() === currency.toUpperCase()
          );
        }
        
        // Filter by date if necessary
        if (startDate) {
          const startTimestamp = new Date(startDate).getTime();
          cryptoTransactions = cryptoTransactions.filter(tx => 
            new Date(tx.createdAt).getTime() >= startTimestamp
          );
        }
        
        if (endDate) {
          const endTimestamp = new Date(endDate).getTime();
          cryptoTransactions = cryptoTransactions.filter(tx => 
            new Date(tx.createdAt).getTime() <= endTimestamp
          );
        }
      }
      
      // Combine and sort transactions
      // Note: Actual implementation will need to standardize fields 
      // between DGT and crypto transactions
      const combinedTransactions = [...dgtTransactions, ...cryptoTransactions]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
      
      return {
        transactions: combinedTransactions,
        total: (countResult?.count || 0) + cryptoTransactions.length,
        page,
        limit
      };
    } catch (error) {
      logger.error('Error fetching transaction history:', error);
      
      if (error instanceof WalletError) {
        throw error;
      }
      
      throw new WalletError(
        'Failed to fetch transaction history',
        500,
        WalletErrorCodes.UNKNOWN_ERROR,
        { originalError: error.message }
      );
    }
  }

  /**
   * Get transaction details by ID
   */
  async getTransactionById(userId: number, transactionId: number) {
    try {
      // First check if it's a DGT transaction
      const [transaction] = await db
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.id, transactionId),
            eq(transactions.userId, userId)
          )
        )
        .limit(1);
      
      if (transaction) {
        // If it's a DGT purchase, fetch the associated purchase order
        if (transaction.type === 'PURCHASE' && transaction.metadata?.purchaseOrderId) {
          const [purchaseOrder] = await db
            .select()
            .from(dgtPurchaseOrders)
            .where(eq(dgtPurchaseOrders.id, transaction.metadata.purchaseOrderId as number))
            .limit(1);
          
          return {
            ...transaction,
            purchaseOrder
          };
        }
        
        return transaction;
      }
      
      // If not found in DGT transactions, check CCPayment (if user has an account)
      const [user] = await db
        .select({ ccpaymentAccountId: users.ccpaymentAccountId })
        .from(users)
        .where(eq(users.id, userId));
      
      if (!user?.ccpaymentAccountId) {
        return : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null;
      }
      
      // Fetch from CCPayment (this is placeholder - implementation will depend on CCPayment API)
      const cryptoTransaction = await ccpaymentService.getTransactionById(
        user.ccpaymentAccountId,
        transactionId.toString()
      );
      
      return cryptoTransaction;
    } catch (error) {
      logger.error('Error fetching transaction details:', error);
      
      if (error instanceof WalletError) {
        throw error;
      }
      
      throw new WalletError(
        'Failed to fetch transaction details',
        500,
        WalletErrorCodes.UNKNOWN_ERROR,
        { originalError: error.message }
      );
    }
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(userId: number, period: 'day' | 'week' | 'month' | 'year' = 'month') {
    try {
      // Logic to generate time intervals based on period
      const intervals = this.generateTimeIntervals(period);
      
      // Get DGT transaction stats
      const dgtStats = await this.getDgtTransactionStats(userId, period, intervals);
      
      // Get crypto transaction stats if user has CCPayment account
      const [user] = await db
        .select({ ccpaymentAccountId: users.ccpaymentAccountId })
        .from(users)
        .where(eq(users.id, userId));
      
      let cryptoStats = : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null;
      if (user?.ccpaymentAccountId) {
        cryptoStats = await this.getCryptoTransactionStats(
          user.ccpaymentAccountId,
          period,
          intervals
        );
      }
      
      return {
        dgt: dgtStats,
        crypto: cryptoStats
      };
    } catch (error) {
      logger.error('Error fetching transaction stats:', error);
      
      if (error instanceof WalletError) {
        throw error;
      }
      
      throw new WalletError(
        'Failed to fetch transaction statistics',
        500,
        WalletErrorCodes.UNKNOWN_ERROR,
        { originalError: error.message }
      );
    }
  }

  /**
   * Generate time intervals based on period
   * @private
   */
  private generateTimeIntervals(period: 'day' | 'week' | 'month' | 'year'): { start: Date, end: Date }[] {
    const now = new Date();
    const intervals: { start: Date, end: Date }[] = [];
    
    // Number of periods to go back
    const periodCount = 6;
    
    for (let i = 0; i < periodCount; i++) {
      let start: Date, end: Date;
      
      switch (period) {
        case 'day':
          end = new Date(now);
          end.setDate(now.getDate() - i);
          end.setHours(23, 59, 59, 999);
          
          start = new Date(end);
          start.setHours(0, 0, 0, 0);
          break;
          
        case 'week':
          end = new Date(now);
          end.setDate(now.getDate() - (i * 7));
          end.setHours(23, 59, 59, 999);
          
          start = new Date(end);
          start.setDate(end.getDate() - 6);
          start.setHours(0, 0, 0, 0);
          break;
          
        case 'month':
          end = new Date(now);
          end.setMonth(now.getMonth() - i);
          end.setDate(0); // Last day of previous month
          end.setHours(23, 59, 59, 999);
          
          start = new Date(end);
          start.setDate(1); // First day of month
          start.setHours(0, 0, 0, 0);
          break;
          
        case 'year':
          end = new Date(now);
          end.setFullYear(now.getFullYear() - i);
          end.setMonth(11, 31); // December 31
          end.setHours(23, 59, 59, 999);
          
          start = new Date(end);
          start.setMonth(0, 1); // January 1
          start.setHours(0, 0, 0, 0);
          break;
      }
      
      intervals.push({ start, end });
    }
    
    return intervals;
  }

  /**
   * Get DGT transaction statistics
   * @private
   */
  private async getDgtTransactionStats(
    userId: number,
    period: 'day' | 'week' | 'month' | 'year',
    intervals: { start: Date, end: Date }[]
  ) {
    // Get total stats
    const [totals] = await db
      .select({
        totalSent: sql<number>\`SUM(CASE WHEN type IN ('TIP', 'WITHDRAWAL', 'RAIN') THEN amount ELSE 0 END)\`,
        totalReceived: sql<number>\`SUM(CASE WHEN type IN ('DEPOSIT', 'PURCHASE', 'TIP_RECEIVED', 'RAIN_RECEIVED') THEN amount ELSE 0 END)\`,
        totalFees: sql<number>\`SUM(CASE WHEN type = 'FEE' THEN amount ELSE 0 END)\`
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.currency, 'DGT')
        )
      );
    
    // Get period stats
    const periodStats: TransactionStatsPeriod[] = [];
    
    for (const interval of intervals) {
      const [stats] = await db
        .select({
          sent: sql<number>\`SUM(CASE WHEN type IN ('TIP', 'WITHDRAWAL', 'RAIN') THEN amount ELSE 0 END)\`,
          received: sql<number>\`SUM(CASE WHEN type IN ('DEPOSIT', 'PURCHASE', 'TIP_RECEIVED', 'RAIN_RECEIVED') THEN amount ELSE 0 END)\`,
          fees: sql<number>\`SUM(CASE WHEN type = 'FEE' THEN amount ELSE 0 END)\`,
          count: sql<number>\`COUNT(*)\`
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.currency, 'DGT'),
            gte(transactions.createdAt, formatDateTimeForDb(interval.start)),
            lte(transactions.createdAt, formatDateTimeForDb(interval.end))
          )
        );
      
      periodStats.push({
        sent: Number(stats?.sent || 0),
        received: Number(stats?.received || 0),
        fees: Number(stats?.fees || 0),
        count: Number(stats?.count || 0)
      });
    }
    
    return {
      totalSent: Number(totals?.totalSent || 0),
      totalReceived: Number(totals?.totalReceived || 0),
      totalFees: Number(totals?.totalFees || 0),
      byPeriod: periodStats
    };
  }

  /**
   * Get crypto transaction statistics
   * @private
   */
  private async getCryptoTransactionStats(
    ccpaymentAccountId: : AdminId,
    period: 'day' | 'week' | 'month' | 'year',
    intervals: { start: Date, end: Date }[]
  ) {
    // This implementation will depend on what data the CCPayment API provides
    // For now, we'll return a placeholder implementation
    
    // Get crypto transactions from CCPayment
    const cryptoTransactions = await ccpaymentService.getTransactionHistory(
      ccpaymentAccountId,
      1,
      1000 // Get a large number to analyze
    );
    
    // Calculate totals
    let totalSent = 0;
    let totalReceived = 0;
    let totalFees = 0;
    
    for (const tx of cryptoTransactions) {
      if (tx.type === 'WITHDRAWAL') {
        totalSent += parseFloat(tx.amount);
        totalFees += parseFloat(tx.fee || '0');
      } else if (tx.type === 'DEPOSIT') {
        totalReceived += parseFloat(tx.amount);
      }
    }
    
    // Calculate period stats
    const periodStats: TransactionStatsPeriod[] = [];
    
    for (const interval of intervals) {
      let sent = 0;
      let received = 0;
      let fees = 0;
      let count = 0;
      
      for (const tx of cryptoTransactions) {
        const txDate = new Date(tx.createdAt);
        
        if (txDate >= interval.start && txDate <= interval.end) {
          count++;
          
          if (tx.type === 'WITHDRAWAL') {
            sent += parseFloat(tx.amount);
            fees += parseFloat(tx.fee || '0');
          } else if (tx.type === 'DEPOSIT') {
            received += parseFloat(tx.amount);
          }
        }
      }
      
      periodStats.push({ sent, received, fees, count });
    }
    
    return {
      totalSent,
      totalReceived,
      totalFees,
      byPeriod: periodStats
    };
  }
}

// Export a singleton instance
export const transactionService = new TransactionService();`;

// transaction.validators.ts
export const transactionValidatorsTemplate = `/**
 * Transaction Validators
 * 
 * [REFAC-TRANSACTIONS]
 * 
 * This file contains request validation middleware for transaction routes.
 */

import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { WalletError, WalletErrorCodes } from '../wallet/wallet.errors';

// Validate transaction query parameters
export const transactionQuerySchema = z.object({
  page: z.: AdminId().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.: AdminId().optional().transform(val => val ? parseInt(val) : 10),
  type: z.: AdminId().optional(),
  currency: z.: AdminId().optional(),
  startDate: z.: AdminId().optional().refine(val => {
    if (!val) return true;
    return !isNaN(Date.parse(val));
  }, {
    message: 'Start date must be a valid date : AdminId'
  }),
  endDate: z.: AdminId().optional().refine(val => {
    if (!val) return true;
    return !isNaN(Date.parse(val));
  }, {
    message: 'End date must be a valid date : AdminId'
  }),
  period: z.enum(['day', 'week', 'month', 'year']).optional()
});

/**
 * Validate transaction query parameters
 */
export const validateTransactionQuery = (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = transactionQuerySchema.parse(req.query);
    req.query = query as any;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
      
      throw new WalletError(
        'Validation error',
        400,
        WalletErrorCodes.VALIDATION_ERROR,
        { errors: formattedErrors }
      );
    }
    next(error);
  }
};

// Add WalletErrorCodes.TRANSACTION_NOT_FOUND to wallet.errors.ts
export const transactionErrorCodesTemplate = `  TRANSACTION_NOT_FOUND: 'WALLET_TRANSACTION_NOT_FOUND',`;

// Export schemas for testing
export {
  transactionQuerySchema
};`;

// transaction.test.ts
export const transactionTestTemplate = `/**
 * Transaction Service Tests
 * 
 * [REFAC-TRANSACTIONS]
 * 
 * Tests for the transaction service functionality including:
 * - Transaction history retrieval
 * - Transaction stats calculation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { transactionService } from '../../src/domains/transactions/transaction.service';
import { ccpaymentService } from '../../src/domains/wallet/ccpayment.service';
import { db } from '../db';
import { WalletError } from '../../src/domains/wallet/wallet.errors';

// Mock dependencies
vi.mock('../../src/domains/wallet/ccpayment.service', () => ({
  ccpaymentService: {
    getTransactionHistory: vi.fn().mockResolvedValue([
      {
        id: 'crypto-tx-1',
        type: 'DEPOSIT',
        amount: '100',
        currency: 'USDT',
        createdAt: new Date().toISOString(),
        status: 'completed'
      }
    ]),
    getTransactionById: vi.fn().mockResolvedValue({
      id: 'crypto-tx-1',
      type: 'DEPOSIT',
      amount: '100',
      currency: 'USDT',
      createdAt: new Date().toISOString(),
      status: 'completed'
    })
  }
}));

vi.mock('@db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => ({
              offset: vi.fn(() => [
                {
                  id: 1,
                  userId: 1,
                  type: 'PURCHASE',
                  amount: '1000',
                  currency: 'DGT',
                  createdAt: new Date().toISOString(),
                  status: 'confirmed'
                }
              ])
            }))
          }))
        }))
      }))
    })),
    // For count query
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => [{ count: 10 }])
      }))
    }))
  }
}));

// Mock logger
vi.mock('../../src/core/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
}));

describe('Transaction Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getTransactionHistory', () => {
    it('should return combined transaction history', async () => {
      const result = await transactionService.getTransactionHistory(
        1,
        {
          page: 1,
          limit: 10
        }
      );

      expect(result).toBeDefined();
      expect(result.transactions.length).toBeGreaterThan(0);
      expect(db.select).toHaveBeenCalled();
      expect(ccpaymentService.getTransactionHistory).toHaveBeenCalled();
    });

    it('should apply filters correctly', async () => {
      const result = await transactionService.getTransactionHistory(
        1,
        {
          page: 1,
          limit: 10,
          type: 'PURCHASE',
          currency: 'DGT'
        }
      );

      expect(result).toBeDefined();
      expect(result.transactions.length).toBeGreaterThan(0);
      // Check that filters were applied in the database query
      expect(db.select().from().where).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'PURCHASE' })
      );
    });
  });

  describe('getTransactionById', () => {
    it('should return transaction details for DGT transaction', async () => {
      const result = await transactionService.getTransactionById(1, 1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(db.select).toHaveBeenCalled();
    });

    it('should return transaction details for crypto transaction', async () => {
      // Mock db to return : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null for DGT transaction
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue([])
          })
        })
      } as any);

      // Mock user lookup
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue([{ ccpaymentAccountId: 'test-account' }])
        })
      } as any);

      const result = await transactionService.getTransactionById(1, 999);

      expect(result).toBeDefined();
      expect(result.id).toBe('crypto-tx-1');
      expect(ccpaymentService.getTransactionById).toHaveBeenCalled();
    });
  });

  describe('getTransactionStats', () => {
    it('should return transaction statistics', async () => {
      // Mock DGT stats query
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue([{
            totalSent: 500,
            totalReceived: 1000,
            totalFees: 25
          }])
        })
      } as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue([{
            sent: 100,
            received: 200,
            fees: 5,
            count: 3
          }])
        })
      } as any);

      // Mock user lookup
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue([{ ccpaymentAccountId: 'test-account' }])
        })
      } as any);

      const result = await transactionService.getTransactionStats(1, 'month');

      expect(result).toBeDefined();
      expect(result.dgt).toBeDefined();
      expect(result.dgt.totalSent).toBe(500);
      expect(result.dgt.totalReceived).toBe(1000);
      expect(result.dgt.byPeriod).toBeDefined();
      expect(result.crypto).toBeDefined();
    });
  });
});`;

// create-transactions-domain.sh script
export const createTransactionsDomainScript = `#!/bin/bash

# Create Transactions Domain Script
# This script sets up the file structure for the transactions domain

# Create directories
mkdir -p server/src/domains/transactions
mkdir -p server/test/transactions

# Create files
echo "Creating transaction.routes.ts..."
cat > server/src/domains/transactions/transaction.routes.ts << EOF
$transactionRoutesTemplate
EOF

echo "Creating transaction.controller.ts..."
cat > server/src/domains/transactions/transaction.controller.ts << EOF
$transactionControllerTemplate
EOF

echo "Creating transaction.service.ts..."
cat > server/src/domains/transactions/transaction.service.ts << EOF
$transactionServiceTemplate
EOF

echo "Creating transaction.validators.ts..."
cat > server/src/domains/transactions/transaction.validators.ts << EOF
$transactionValidatorsTemplate
EOF

echo "Creating transaction.test.ts..."
cat > server/test/transactions/transaction.test.ts << EOF
$transactionTestTemplate
EOF

# Add TRANSACTION_NOT_FOUND to error codes
echo "Updating wallet.errors.ts..."
sed -i '' "/UNKNOWN_ERROR: 'WALLET_UNKNOWN_ERROR',/a\\
  $transactionErrorCodesTemplate
" server/src/domains/wallet/wallet.errors.ts

# Create utils file if needed
echo "Creating date-utils.ts..."
mkdir -p server/src/utils
if [ ! -f server/src/utils/date-utils.ts ]; then
  cat > server/src/utils/date-utils.ts << EOF
/**
 * Date Utilities
 * 
 * Helper functions for date/time operations
 */

/**
 * Format a date for database storage
 */
export function formatDateTimeForDb(date: Date): : AdminId {
  return date.toISOString().replace('T', ' ').replace('Z', '');
}

/**
 * Format a date for display
 */
export function formatDateForDisplay(date: Date | : AdminId): : AdminId {
  const d = typeof date === ': AdminId' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
EOF
fi

# Update core/index.ts to register the transaction routes
echo "Updating core/index.ts to register transaction routes..."
sed -i '' "/import airdropRoutes from '..\/domains\/engagement\/airdrop\/airdrop.routes';/a\\
import transactionRoutes from '../domains/transactions/transaction.routes';
" server/src/core/index.ts

sed -i '' "/app.use('\/api\/engagement\/airdrop', airdropRoutes);/a\\
app.use('/api/transactions', transactionRoutes);
" server/src/core/index.ts

echo "Transactions domain setup complete!"
`; 