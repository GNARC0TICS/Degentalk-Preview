/**
 * Type-Safe Wallet Balance Manager
 * 
 * Provides thread-safe balance operations with type safety
 * for amounts and proper transaction isolation.
 */

import { and, eq, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { getDatabase } from '@degentalk/db';
import { wallets, transactions } from '@db/schema';
import { toWalletId } from '@shared/utils/id';
import { type WalletId, type UserId, type DgtAmount, type TransactionId, toDgtAmount } from '@shared/types';
import { logger } from '@core/logger';
import { AmountCalculator, AmountValidator } from '../utils/amount.utils';
import type { BuiltTransaction } from '../builders/transaction.builder';

/**
 * Balance operation result
 */
export interface BalanceOperationResult {
  success: boolean;
  newBalance: DgtAmount;
  transactionId?: TransactionId;
  error?: string;
}

/**
 * Balance check result
 */
export interface BalanceCheckResult {
  balance: DgtAmount;
  isAvailable: boolean;
  lockedAmount: DgtAmount;
  availableBalance: DgtAmount;
}

/**
 * Wallet balance manager
 */
export class BalanceManager {
  private db: NodePgDatabase<any>;
  
  constructor(db?: NodePgDatabase<any>) {
    this.db = db || getDatabase();
  }
  
  /**
   * Get wallet balance with lock information
   */
  async getBalance(walletId: WalletId): Promise<BalanceCheckResult> {
    try {
      const wallet = await this.db
        .select({
          balance: wallets.balance,
          lockedBalance: wallets.lockedBalance
        })
        .from(wallets)
        .where(eq(wallets.id, walletId))
        .limit(1);
      
      if (!wallet[0]) {
        throw new Error('Wallet not found');
      }
      
      const balance = toDgtAmount(wallet[0].balance);
      const lockedAmount = toDgtAmount(wallet[0].lockedBalance || 0);
      const availableBalance = AmountCalculator.subtractDgt(balance, lockedAmount);
      
      return {
        balance,
        isAvailable: availableBalance > 0,
        lockedAmount,
        availableBalance
      };
    } catch (error) {
      logger.error('BALANCE_MANAGER', 'Failed to get balance', {
        walletId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
  
  /**
   * Check if wallet has sufficient balance
   */
  async hasBalance(walletId: WalletId, amount: DgtAmount): Promise<boolean> {
    const { availableBalance } = await this.getBalance(walletId);
    return availableBalance >= amount;
  }
  
  /**
   * Debit wallet (subtract amount)
   */
  async debit(
    walletId: WalletId,
    amount: DgtAmount,
    transaction: BuiltTransaction
  ): Promise<BalanceOperationResult> {
    return await this.db.transaction(async (tx) => {
      try {
        // Lock wallet for update
        const [wallet] = await tx
          .select()
          .from(wallets)
          .where(eq(wallets.id, walletId))
          .for('update');
        
        if (!wallet) {
          return {
            success: false,
            newBalance: toDgtAmount(0),
            error: 'Wallet not found'
          };
        }
        
        const currentBalance = toDgtAmount(wallet.balance);
        const lockedBalance = toDgtAmount(wallet.lockedBalance || 0);
        const availableBalance = AmountCalculator.subtractDgt(currentBalance, lockedBalance);
        
        // Check sufficient balance
        if (availableBalance < amount) {
          return {
            success: false,
            newBalance: currentBalance,
            error: 'Insufficient balance'
          };
        }
        
        // Calculate new balance
        const newBalance = AmountCalculator.subtractDgt(currentBalance, amount);
        
        // Update wallet balance
        await tx
          .update(wallets)
          .set({
            balance: newBalance,
            updatedAt: sql`CURRENT_TIMESTAMP`
          })
          .where(eq(wallets.id, walletId));
        
        // Create transaction record
        const [txRecord] = await tx
          .insert(transactions)
          .values({
            type: transaction.type,
            amount: transaction.amount,
            status: transaction.status,
            fromWalletId: transaction.fromWalletId,
            toWalletId: transaction.toWalletId,
            description: transaction.description,
            metadata: transaction.metadata,
            fee: transaction.fee,
            exchangeRate: transaction.exchangeRate
          })
          .returning({ id: transactions.id });
        
        logger.info('BALANCE_MANAGER', 'Wallet debited', {
          walletId,
          amount,
          previousBalance: currentBalance,
          newBalance,
          transactionId: txRecord.id
        });
        
        return {
          success: true,
          newBalance,
          transactionId: txRecord.id
        };
      } catch (error) {
        logger.error('BALANCE_MANAGER', 'Debit failed', {
          walletId,
          amount,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
      }
    });
  }
  
  /**
   * Credit wallet (add amount)
   */
  async credit(
    walletId: WalletId,
    amount: DgtAmount,
    transaction: BuiltTransaction
  ): Promise<BalanceOperationResult> {
    return await this.db.transaction(async (tx) => {
      try {
        // Lock wallet for update
        const [wallet] = await tx
          .select()
          .from(wallets)
          .where(eq(wallets.id, walletId))
          .for('update');
        
        if (!wallet) {
          return {
            success: false,
            newBalance: toDgtAmount(0),
            error: 'Wallet not found'
          };
        }
        
        const currentBalance = toDgtAmount(wallet.balance);
        const newBalance = AmountCalculator.addDgt(currentBalance, amount);
        
        // Update wallet balance
        await tx
          .update(wallets)
          .set({
            balance: newBalance,
            updatedAt: sql`CURRENT_TIMESTAMP`
          })
          .where(eq(wallets.id, walletId));
        
        // Create transaction record
        const [txRecord] = await tx
          .insert(transactions)
          .values({
            type: transaction.type,
            amount: transaction.amount,
            status: transaction.status,
            fromWalletId: transaction.fromWalletId,
            toWalletId: transaction.toWalletId,
            description: transaction.description,
            metadata: transaction.metadata,
            fee: transaction.fee,
            exchangeRate: transaction.exchangeRate
          })
          .returning({ id: transactions.id });
        
        logger.info('BALANCE_MANAGER', 'Wallet credited', {
          walletId,
          amount,
          previousBalance: currentBalance,
          newBalance,
          transactionId: txRecord.id
        });
        
        return {
          success: true,
          newBalance,
          transactionId: txRecord.id
        };
      } catch (error) {
        logger.error('BALANCE_MANAGER', 'Credit failed', {
          walletId,
          amount,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
      }
    });
  }
  
  /**
   * Transfer between wallets atomically
   */
  async transfer(
    fromWalletId: WalletId,
    toWalletId: WalletId,
    amount: DgtAmount,
    transaction: BuiltTransaction
  ): Promise<BalanceOperationResult> {
    return await this.db.transaction(async (tx) => {
      try {
        // Lock both wallets in consistent order to prevent deadlocks
        const walletIds = [fromWalletId, toWalletId].sort();
        
        const lockedWallets = await tx
          .select()
          .from(wallets)
          .where(sql`${wallets.id} IN (${walletIds[0]}, ${walletIds[1]})`)
          .for('update');
        
        const fromWallet = lockedWallets.find(w => w.id === fromWalletId);
        const toWallet = lockedWallets.find(w => w.id === toWalletId);
        
        if (!fromWallet || !toWallet) {
          return {
            success: false,
            newBalance: toDgtAmount(0),
            error: 'One or both wallets not found'
          };
        }
        
        const fromBalance = toDgtAmount(fromWallet.balance);
        const fromLocked = toDgtAmount(fromWallet.lockedBalance || 0);
        const availableBalance = AmountCalculator.subtractDgt(fromBalance, fromLocked);
        
        // Check sufficient balance
        if (availableBalance < amount) {
          return {
            success: false,
            newBalance: fromBalance,
            error: 'Insufficient balance'
          };
        }
        
        // Calculate new balances
        const newFromBalance = AmountCalculator.subtractDgt(fromBalance, amount);
        const newToBalance = AmountCalculator.addDgt(
          toDgtAmount(toWallet.balance),
          transaction.netAmount
        );
        
        // Update both wallets
        await tx
          .update(wallets)
          .set({
            balance: newFromBalance,
            updatedAt: sql`CURRENT_TIMESTAMP`
          })
          .where(eq(wallets.id, fromWalletId));
        
        await tx
          .update(wallets)
          .set({
            balance: newToBalance,
            updatedAt: sql`CURRENT_TIMESTAMP`
          })
          .where(eq(wallets.id, toWalletId));
        
        // Create transaction record
        const [txRecord] = await tx
          .insert(transactions)
          .values({
            type: transaction.type,
            amount: transaction.amount,
            status: 'confirmed',
            fromWalletId: transaction.fromWalletId,
            toWalletId: transaction.toWalletId,
            description: transaction.description,
            metadata: transaction.metadata,
            fee: transaction.fee,
            exchangeRate: transaction.exchangeRate
          })
          .returning({ id: transactions.id });
        
        logger.info('BALANCE_MANAGER', 'Transfer completed', {
          fromWalletId,
          toWalletId,
          amount,
          fee: transaction.fee,
          netAmount: transaction.netAmount,
          transactionId: txRecord.id
        });
        
        return {
          success: true,
          newBalance: newFromBalance,
          transactionId: txRecord.id
        };
      } catch (error) {
        logger.error('BALANCE_MANAGER', 'Transfer failed', {
          fromWalletId,
          toWalletId,
          amount,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
      }
    });
  }
  
  /**
   * Lock amount in wallet (for pending operations)
   */
  async lockAmount(
    walletId: WalletId,
    amount: DgtAmount,
    reason: string
  ): Promise<boolean> {
    return await this.db.transaction(async (tx) => {
      try {
        const [wallet] = await tx
          .select()
          .from(wallets)
          .where(eq(wallets.id, walletId))
          .for('update');
        
        if (!wallet) {
          throw new Error('Wallet not found');
        }
        
        const balance = toDgtAmount(wallet.balance);
        const currentLocked = toDgtAmount(wallet.lockedBalance || 0);
        const availableBalance = AmountCalculator.subtractDgt(balance, currentLocked);
        
        if (availableBalance < amount) {
          return false;
        }
        
        const newLocked = AmountCalculator.addDgt(currentLocked, amount);
        
        await tx
          .update(wallets)
          .set({
            lockedBalance: newLocked,
            updatedAt: sql`CURRENT_TIMESTAMP`
          })
          .where(eq(wallets.id, walletId));
        
        logger.info('BALANCE_MANAGER', 'Amount locked', {
          walletId,
          amount,
          reason,
          totalLocked: newLocked
        });
        
        return true;
      } catch (error) {
        logger.error('BALANCE_MANAGER', 'Lock amount failed', {
          walletId,
          amount,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
      }
    });
  }
  
  /**
   * Unlock amount in wallet
   */
  async unlockAmount(
    walletId: WalletId,
    amount: DgtAmount,
    reason: string
  ): Promise<boolean> {
    return await this.db.transaction(async (tx) => {
      try {
        const [wallet] = await tx
          .select()
          .from(wallets)
          .where(eq(wallets.id, walletId))
          .for('update');
        
        if (!wallet) {
          throw new Error('Wallet not found');
        }
        
        const currentLocked = toDgtAmount(wallet.lockedBalance || 0);
        
        if (currentLocked < amount) {
          logger.warn('BALANCE_MANAGER', 'Attempting to unlock more than locked', {
            walletId,
            currentLocked,
            requestedUnlock: amount
          });
          return false;
        }
        
        const newLocked = AmountCalculator.subtractDgt(currentLocked, amount);
        
        await tx
          .update(wallets)
          .set({
            lockedBalance: newLocked,
            updatedAt: sql`CURRENT_TIMESTAMP`
          })
          .where(eq(wallets.id, walletId));
        
        logger.info('BALANCE_MANAGER', 'Amount unlocked', {
          walletId,
          amount,
          reason,
          totalLocked: newLocked
        });
        
        return true;
      } catch (error) {
        logger.error('BALANCE_MANAGER', 'Unlock amount failed', {
          walletId,
          amount,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
      }
    });
  }
  
  /**
   * Get wallet by user ID
   */
  async getWalletByUserId(userId: UserId): Promise<WalletId | null> {
    const [wallet] = await this.db
      .select({ id: wallets.id })
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .limit(1);
    
    return wallet ? wallet.id : null;
  }
}

/**
 * Create a new balance manager instance
 */
export function createBalanceManager(db?: NodePgDatabase<any>): BalanceManager {
  return new BalanceManager(db);
}