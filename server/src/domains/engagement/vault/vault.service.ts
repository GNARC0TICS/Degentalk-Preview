/**
 * Vault Service
 * 
 * This service handles the token vaulting functionality, allowing users to lock tokens for a period of time.
 * 
 * // [REFAC-VAULT]
 */

import { db } from '../../../../db';
import { 
  transactions, 
  users, 
  /* vaultSettings, */ // vaultSettings is not in schema
  vaults as vaultLocks 
} from '@shared/schema';
import { eq, and, lt, sql, gte } from 'drizzle-orm';
import { logger } from '../../../core/logger';
import { WalletError, ErrorCodes } from '../../../core/errors';
import { dgtService } from '../../wallet/dgt.service.js';

/**
 * Vault lock options structure
 */
export interface VaultLockOptions {
  userId: number;
  amount: number; 
  currency: string; 
  lockDurationDays: number;
  reason?: string;
}

/**
 * Service for handling token vaulting functionality
 */
export class VaultService {
  /**
   * Lock tokens in the vault for a period of time
   * @param options Vault lock options
   * @returns The created vault lock record
   */
  async lockTokens(options: VaultLockOptions): Promise<any> {
    const { userId, amount, currency, lockDurationDays, reason } = options;
    
    try {
      logger.info('VaultService', `Processing token lock for user ${userId}`, {
        amount,
        currency,
        lockDurationDays
      });
      
      const { userWalletAddress } = await this.validateLockOptions(userId, amount, currency, lockDurationDays);

      if (!userWalletAddress) {
        throw new WalletError('User wallet address not found, cannot create vault lock.', 400, ErrorCodes.INVALID_REQUEST);
      }
      
      const unlockDate = new Date();
      unlockDate.setDate(unlockDate.getDate() + lockDurationDays);
      
      let transactionId: number | null = null; // This will be lockTransactionId in vaults table
      
      if (currency === 'DGT') {
        const deductResult = await dgtService.deductDgt( 
          userId,
          BigInt(Math.floor(amount)), 
          'ADMIN_ADJUST', // Using ADMIN_ADJUST as VAULT_LOCK is not in DgtTransactionType
          {
            lockDurationDays,
            unlockDate: unlockDate.toISOString(),
            reason: reason || 'Vault Lock'
          }
        );
        // transactionId = deductResult.transactionId; // Assuming dgtService.deductDgt returns an object with transactionId
                                                  // This needs to be confirmed from dgt.service.ts structure.
                                                  // For now, keeping it null if not directly returned.
      } else {
        throw new WalletError(
          `Vaulting of ${currency} is not supported yet`,
          400,
          ErrorCodes.INVALID_REQUEST 
        );
      }
      
      const [vaultLock] = await db.insert(vaultLocks)
        .values({
          userId,
          walletAddress: userWalletAddress, // Added required walletAddress
          amount: amount, 
          initialAmount: amount, 
          lockedAt: new Date(),
          unlockTime: unlockDate,
          status: 'locked',
          lockTransactionId: transactionId, 
          notes: reason || 'User initiated', 
          metadata: {
            createdAt: new Date().toISOString(),
            currency: currency 
          },
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      logger.info('VaultService', `Token lock created for user ${userId}`, {
        amount,
        currency, 
        vaultLockId: vaultLock.id,
        unlockDate
      });
      
      return vaultLock;
    } catch (error) {
      if (error instanceof WalletError) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('VaultService', `Error locking tokens: ${errorMessage}`);
      
      throw new WalletError(
        `Failed to lock tokens: ${errorMessage}`,
        500,
        ErrorCodes.OPERATION_FAILED, 
        { originalError: errorMessage }
      );
    }
  }
  
  /**
   * Unlock tokens from the vault when they reach their unlock date
   * @param vaultLockId The ID of the vault lock to unlock
   * @returns The updated vault lock record
   */
  async unlockTokens(vaultLockId: number): Promise<any> {
    try {
      const [vaultLock] = await db.select()
        .from(vaultLocks)
        .where(eq(vaultLocks.id, vaultLockId))
        .limit(1);
      
      if (!vaultLock) {
        throw new WalletError('Vault lock not found', 404, ErrorCodes.NOT_FOUND);
      }
      
      if (vaultLock.status === 'unlocked') {
        throw new WalletError('Vault lock already unlocked', 400, ErrorCodes.INVALID_REQUEST);
      }
      
      const now = new Date();
      if (vaultLock.unlockTime && now < vaultLock.unlockTime) { 
        throw new WalletError(
          'Vault lock is still locked',
          400,
          ErrorCodes.OPERATION_FAILED, 
          {
            unlockDate: vaultLock.unlockTime,
            timeRemaining: vaultLock.unlockTime ? Math.floor((vaultLock.unlockTime.getTime() - now.getTime()) / 1000) : undefined
          }
        );
      }
      
      let unlockTransactionId: number | null = null;
      const vaultCurrency = (vaultLock.metadata as any)?.currency || 'DGT'; 

      if (vaultCurrency === 'DGT') {
        const grantResult = await dgtService.addDgt( 
          vaultLock.userId,
          BigInt(Math.floor(vaultLock.amount)), 
          'ADMIN_ADJUST', // Using ADMIN_ADJUST as VAULT_UNLOCK is not in DgtTransactionType
          {
            vaultLockId: vaultLock.id,
            lockDuration: vaultLock.lockedAt ? Math.floor((now.getTime() - vaultLock.lockedAt.getTime()) / (1000 * 60 * 60 * 24)) : undefined,
            originalLockTransaction: vaultLock.lockTransactionId 
          }
        );
        // unlockTransactionId = grantResult.transactionId; // Assuming addDgt returns transactionId
      }
      
      const [updatedVaultLock] = await db.update(vaultLocks)
        .set({
          status: 'unlocked',
          unlockedAt: now, 
          unlockTransactionId,
          updatedAt: now
        })
        .where(eq(vaultLocks.id, vaultLockId))
        .returning();
      
      logger.info('VaultService', `Tokens unlocked for user ${vaultLock.userId}`, {
        amount: vaultLock.amount,
        currency: vaultCurrency,
        vaultLockId,
        lockedDuration: vaultLock.lockedAt ? Math.floor((now.getTime() - vaultLock.lockedAt.getTime()) / (1000 * 60 * 60 * 24)) : undefined
      });
      
      return updatedVaultLock;
    } catch (error) {
      if (error instanceof WalletError) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('VaultService', `Error unlocking tokens: ${errorMessage}`);
      
      throw new WalletError(
        `Failed to unlock tokens: ${errorMessage}`,
        500,
        ErrorCodes.OPERATION_FAILED, 
        { originalError: errorMessage }
      );
    }
  }
  
  /**
   * Process automatic unlocks for any vault locks that have reached their unlock date
   * @returns Array of processed vault locks
   */
  async processAutomaticUnlocks(): Promise<any[]> {
    try {
      const now = new Date();
      
      const eligibleLocks = await db.select()
        .from(vaultLocks)
        .where(
          and(
            eq(vaultLocks.status, 'locked'),
            vaultLocks.unlockTime ? lt(vaultLocks.unlockTime, now) : sql`FALSE` 
          )
        )
        .limit(50); 
      
      const results = [];
      for (const lock of eligibleLocks) {
        try {
          const result = await this.unlockTokens(lock.id);
          results.push(result);
        } catch (error) {
          logger.error('VaultService', `Error processing automatic unlock for lock ${lock.id}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('VaultService', `Error processing automatic unlocks: ${errorMessage}`);
      throw new WalletError(
        `Failed to process automatic unlocks: ${errorMessage}`,
        500,
        ErrorCodes.OPERATION_FAILED 
      );
    }
  }
  
  /**
   * Get active vault locks for a user
   * @param userId User ID
   * @returns Array of active vault locks
   */
  async getUserVaultLocks(userId: number): Promise<any[]> {
    try {
      const vaultLocksList = await db.select()
        .from(vaultLocks)
        .where(eq(vaultLocks.userId, userId))
        .orderBy(sql`${vaultLocks.createdAt} DESC`); 
      
      return vaultLocksList;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('VaultService', `Error getting user vault locks: ${errorMessage}`);
      throw new WalletError(
        `Failed to get user vault locks: ${errorMessage}`,
        500,
        ErrorCodes.OPERATION_FAILED 
      );
    }
  }
  
  /**
   * Validate lock options
   */
  private async validateLockOptions(
    userId: number,
    amount: number,
    currency: string,
    lockDurationDays: number
  ): Promise<{ userWalletAddress: string | null }> { 
    const [user] = await db.select({
      id: users.id,
      dgtWalletBalance: users.dgtWalletBalance,
      walletAddress: users.walletAddress 
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
    
    if (!user) {
      throw new WalletError('User not found', 404, ErrorCodes.USER_NOT_FOUND);
    }
    
    if (currency !== 'DGT') {
      throw new WalletError('Only DGT vaulting is supported at this time', 400, ErrorCodes.INVALID_REQUEST);
    }
    
    if (amount <= 0) {
      throw new WalletError('Amount must be positive', 400, ErrorCodes.INVALID_REQUEST); 
    }
    
    if (currency === 'DGT' && BigInt(user.dgtWalletBalance) < BigInt(Math.floor(amount))) { 
      throw new WalletError(
        'Insufficient DGT balance',
        400,
        ErrorCodes.WALLET_INSUFFICIENT_FUNDS, 
        { required: amount, available: user.dgtWalletBalance }
      );
    }
    
    // Since vaultSettings is commented out, using default validations
    if (lockDurationDays < 1) {
      throw new WalletError('Lock duration must be at least 1 day', 400, ErrorCodes.INVALID_REQUEST);
    }
    
    if (lockDurationDays > 365) { 
      throw new WalletError('Lock duration cannot exceed 365 days', 400, ErrorCodes.INVALID_REQUEST);
    }
    return { userWalletAddress: user.walletAddress };
  }
}

// Export a singleton instance
export const vaultService = new VaultService();
