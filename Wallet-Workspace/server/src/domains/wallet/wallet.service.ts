/**
 * Wallet Service
 * 
 * [REFAC-WALLET]
 * 
 * This service orchestrates between the DGT ledger and CCPayment services.
 * It provides high-level operations for wallet management.
 */

import { dgtService } from './dgt.service.js';
import { ccpaymentService, type CryptoBalance } from './ccpayment.service.js';
// import { TransactionService } from '../transactions/transaction.service'; // Not used
import { logger } from '../../core/logger';
import { 
  users, 
  transactions, 
  dgtPurchaseOrders,
  transactionTypeEnum // Import the enum
} from '@schema';
import { db } from '@db';
import { eq, and, desc, sql, SQL } from 'drizzle-orm'; // Import SQL type
import { v4 as uuidv4 } from 'uuid';
import { WalletError, ErrorCodes } from '../../core/errors'; // Import ErrorCodes

/**
 * Wallet service for orchestrating wallet operations
 */
export class WalletService {
  /**
   * Get user's combined wallet details (DGT balance and crypto balances)
   */
  async getUserWallet(userId: number): Promise<{
    dgt: bigint;
    cryptoBalances: CryptoBalance[];
    ccpaymentAccountId: string | null;
  }> {
    try {
      // Get DGT balance
      const dgtBalance = await dgtService.getUserBalance(userId);
      
      // Get user's CCPayment account ID
      const [user] = await db
        .select({ ccpaymentAccountId: users.ccpaymentAccountId })
        .from(users)
        .where(eq(users.id, userId));
      
      let cryptoBalances: CryptoBalance[] = [];
      
      // If user has CCPayment account, get crypto balances
      if (user?.ccpaymentAccountId) {
        cryptoBalances = await ccpaymentService.getUserCryptoBalances(user.ccpaymentAccountId);
      }
      
      return {
        dgt: dgtBalance,
        cryptoBalances,
        ccpaymentAccountId: user?.ccpaymentAccountId || null
      };
    } catch (error) {
      logger.error('Error getting user wallet:', error instanceof Error ? error.message : String(error));
      
      if (error instanceof WalletError) {
        throw error;
      }
      
      throw new WalletError(
        'Failed to get user wallet', 
        500, 
        ErrorCodes.DB_ERROR, 
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }
  
  /**
   * Create or get a CCPayment wallet for user
   */
  async ensureCcPaymentWallet(userId: number): Promise<string> {
    try {
      // Check if user already has a CCPayment account
      const [user] = await db
        .select({ ccpaymentAccountId: users.ccpaymentAccountId })
        .from(users)
        .where(eq(users.id, userId));
      
      // If user has an account, return it
      if (user?.ccpaymentAccountId) {
        return user.ccpaymentAccountId;
      }
      
      // Create new CCPayment account
      const ccpaymentAccountId = await ccpaymentService.createCcPaymentWalletForUser(userId);
      
      // Update user record
      await db
        .update(users)
        .set({ ccpaymentAccountId })
        .where(eq(users.id, userId));
      
      return ccpaymentAccountId;
    } catch (error) {
      logger.error('Error ensuring CCPayment wallet:', error instanceof Error ? error.message : String(error));
      
      if (error instanceof WalletError) {
        throw error;
      }
      
      throw new WalletError(
        'Failed to create CCPayment wallet', 
        500, 
        ErrorCodes.DB_ERROR, 
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }
  
  /**
   * Process a completed DGT purchase from a webhook event
   */
  async processDgtPurchaseCompletion(
    purchaseOrderId: number, 
    transactionHash: string, 
    actualAmount?: string
  ): Promise<any> {
    try {
      return await dgtService.fulfillDgtPurchase(
        purchaseOrderId,
        'confirmed',
        {
          transactionHash,
          actualAmount,
          completedAt: new Date().toISOString()
        }
      );
    } catch (error) {
      logger.error('Error processing DGT purchase completion:', error instanceof Error ? error.message : String(error));
      
      if (error instanceof WalletError) {
        throw error;
      }
      
      throw WalletError.transactionFailed(
        'Failed to process DGT purchase'
      );
    }
  }
  
  /**
   * Get user's combined transaction history
   */
  async getTransactionHistory(
    userId: number,
    limit: number = 10,
    offset: number = 0,
    type?: string,
    currency?: string // This parameter is not used as 'transactions' table has no 'currency' column
  ): Promise<any[]> {
    try {
      const conditions: SQL[] = [eq(transactions.userId, userId)];

      if (type) {
        // Validate and cast type to the enum type
        const validTypes = transactionTypeEnum.enumValues;
        if (validTypes.includes(type as typeof transactionTypeEnum.enumValues[number])) {
          conditions.push(eq(transactions.type, type as typeof transactionTypeEnum.enumValues[number]));
        } else {
          // Optionally handle invalid type string, e.g., log a warning or throw an error
          logger.warn('WalletService', 'Invalid transaction type filter: ' + type);
        }
      }
      
      // Construct the query in one chain
      // The 'conditions' array will always have at least one element.
      const dgtTransactions = await db
        .select()
        .from(transactions)
        .where(conditions.length === 1 ? conditions[0] : and(conditions[0], conditions[1]))
        .orderBy(desc(transactions.createdAt))
        .limit(limit)
        .offset(offset);
      
      // Get user's CCPayment account
      const [user] = await db
        .select({ ccpaymentAccountId: users.ccpaymentAccountId })
        .from(users)
        .where(eq(users.id, userId));
      
      // If user has CCPayment account, get crypto transactions
      let cryptoTransactions: CryptoBalance[] = []; // Explicitly type if it's intended to hold these
      if (user?.ccpaymentAccountId) {
        // This is where we would fetch crypto transactions from CCPayment
        // For now, we'll just return DGT transactions
        // cryptoTransactions = await ccpaymentService.getTransactionHistory(user.ccpaymentAccountId);
      }
      
      // Combine and sort transactions
      // For now, just return DGT transactions
      return dgtTransactions;
    } catch (error) {
      logger.error('Error getting transaction history:', error instanceof Error ? error.message : String(error));
      
      if (error instanceof WalletError) {
        throw error;
      }
      
      throw new WalletError(
        'Failed to get transaction history', 
        500, 
        ErrorCodes.DB_ERROR, 
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }
}

// Export a singleton instance
export const walletService = new WalletService();
