/**
 * Tip Service
 * 
 * This service handles the user-to-user tipping functionality.
 * It validates balances, executes transfers, and tracks transactions.
 */

import { db } from '../db';
import { transactions, users, tipSettings, cooldownSettings } from '@db/schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '../src/core/logger';
import { WalletError, ErrorCodes as WalletErrorCodes } from '../src/core/errors';
import { sql } from 'drizzle-orm';

// Constants
const MIN_TIP_AMOUNT = 0.1; // Minimum tip amount in USDT

/**
 * Class to handle all tipping-related functionality
 */
export class TipService {
  /**
   * Process a tip from one user to another
   * Uses internal ledger system rather than blockchain transactions
   * @param senderUserId - ID of the user sending the tip
   * @param recipientUserId - ID of the user receiving the tip
   * @param amount - Amount to tip in DGT
   * @returns Transaction details
   */
  async processTip(
    senderUserId: number,
    recipientUserId: number,
    amount: number
  ): Promise<{
    transactionId: number;
    amount: number;
    success: boolean;
  }> {
    try {
      logger.info('TipService', `Processing tip from user ${senderUserId} to user ${recipientUserId}`, {
        amount
      });
      
      // Validate tip amount
      if (amount < MIN_TIP_AMOUNT) {
        throw new WalletError(
          `Tip amount must be at least ${MIN_TIP_AMOUNT} DGT`,
          400,
          WalletErrorCodes.INVALID_AMOUNT,
          { minAmount: MIN_TIP_AMOUNT, providedAmount: amount }
        );
      }
      
      // Get the sender's details
      const [sender] = await db.select({
        id: users.id,
        dgtBalance: users.dgtWalletBalance
      })
      .from(users)
      .where(eq(users.id, senderUserId))
      .limit(1);
      
      if (!sender) {
        throw new WalletError(
          'Sender not found',
          404,
          WalletErrorCodes.USER_NOT_FOUND
        );
      }
      
      // Check if sender has enough balance (DGT stored with 6 decimal places)
      const amountInStorage = Math.floor(amount * 1000000);
      if (sender.dgtBalance < amountInStorage) {
        throw new WalletError(
          'Insufficient DGT balance for tip',
          400,
          WalletErrorCodes.INSUFFICIENT_FUNDS,
          { required: amount, available: sender.dgtBalance / 1000000 }
        );
      }
      
      // Get the recipient's details
      const [recipient] = await db.select({
        id: users.id
      })
      .from(users)
      .where(eq(users.id, recipientUserId))
      .limit(1);
      
      if (!recipient) {
        throw new WalletError(
          'Recipient not found',
          404,
          WalletErrorCodes.USER_NOT_FOUND
        );
      }
      
      // Record the transaction in the database first as 'pending'
      const [transaction] = await db.insert(transactions).values({
        userId: senderUserId,
        fromUserId: senderUserId,
        toUserId: recipientUserId,
        amount: amountInStorage,
        type: 'TIP',
        status: 'pending',
        description: `Tip to user ${recipientUserId}`,
        currencyType: 'DGT',
        metadata: {
          tipInitiated: new Date().toISOString()
        }
      }).returning();
      
      logger.debug('TipService', `Created pending transaction record for tip`, {
        transactionId: transaction.id
      });
      
      // TODO: CCPayment Integration Point
      // In the next phase, we'll check if CCPayment supports user-to-user transfers
      // For now, we'll implement an internal ledger transfer
      
      try {
        // Deduct from sender
        await db.execute(sql`
          UPDATE users
          SET dgt_wallet_balance = dgt_wallet_balance - ${amountInStorage}
          WHERE user_id = ${senderUserId}
        `);
        
        // Add to recipient
        await db.execute(sql`
          UPDATE users
          SET dgt_wallet_balance = dgt_wallet_balance + ${amountInStorage}
          WHERE user_id = ${recipientUserId}
        `);
        
        // Update the transaction to confirmed
        await db.update(transactions)
          .set({
            status: 'confirmed',
            confirmedAt: new Date(),
            metadata: {
              ...transaction.metadata,
              confirmed: true,
              internalTransfer: true
            }
          })
          .where(eq(transactions.id, transaction.id));
          
        logger.info('TipService', `Tip completed: User ${senderUserId} -> User ${recipientUserId}`, {
          amount,
          transactionId: transaction.id
        });
        
        return {
          transactionId: transaction.id,
          amount,
          success: true
        };
      } catch (transferError) {
        // If something goes wrong during the transfer, update the transaction status
        await db.update(transactions)
          .set({
            status: 'failed',
            metadata: {
              ...transaction.metadata,
              error: transferError.message
            }
          })
          .where(eq(transactions.id, transaction.id));
          
        throw transferError;
      }
    } catch (error) {
      if (error instanceof WalletError) {
        throw error;
      }
      
      logger.error('TipService', `Error processing tip: ${error.message}`);
      
      throw new WalletError(
        `Failed to process tip: ${error.message}`,
        500,
        WalletErrorCodes.TRANSACTION_FAILED,
        { originalError: error.message }
      );
    }
  }
  
  /**
   * Process a tip command from the shoutbox
   * @param senderUserId - ID of the user sending the tip
   * @param recipientUserId - ID of the user receiving the tip
   * @param amount - Amount to tip
   * @param currency - The currency to use for tipping (DGT or USDT)
   * @param roomId - The room ID where the tip was initiated
   * @param isDust - Whether this is a dust tip (very small amount)
   * @returns Transaction details
   */
  async processTipCommand(
    senderUserId: number,
    recipientUserId: number,
    amount: number,
    currency: 'DGT' | 'USDT',
    roomId: number,
    isDust: boolean = false
  ): Promise<{
    transactionId: number;
    amount: number;
    currency: string;
    recipient: {id: number, username: string};
  }> {
    try {
      logger.info('TipService', `Processing tip command from user ${senderUserId} to user ${recipientUserId}`, {
        amount,
        currency,
        roomId,
        isDust
      });
      
      // Validate tip settings
      const settings = await this.getTipSettings();
      
      // Check if tipping is enabled
      if (!settings.enabled) {
        throw new WalletError(
          'Tipping feature is currently disabled',
          400,
          WalletErrorCodes.SERVICE_UNAVAILABLE
        );
      }
      
      // Get the sender user
      const [sender] = await db.select({
        id: users.id,
        username: users.username,
        dgtWalletBalance: users.dgtWalletBalance,
        groupId: users.groupId
      })
      .from(users)
      .where(eq(users.id, senderUserId))
      .limit(1);
      
      if (!sender) {
        throw new WalletError(
          'Sender not found',
          404,
          WalletErrorCodes.USER_NOT_FOUND
        );
      }
      
      // Check if user is admin or moderator for dust tips
      const isAdminOrMod = sender.groupId === 1 || sender.groupId === 2;
      
      // Only admins and mods can use dust command
      if (isDust && !isAdminOrMod) {
        throw new WalletError(
          'Only admins and moderators can send dust tips',
          403,
          WalletErrorCodes.PERMISSION_DENIED
        );
      }
      
      // Get the recipient user
      const [recipient] = await db.select({
        id: users.id,
        username: users.username
      })
      .from(users)
      .where(eq(users.id, recipientUserId))
      .limit(1);
      
      if (!recipient) {
        throw new WalletError(
          'Recipient not found',
          404,
          WalletErrorCodes.USER_NOT_FOUND
        );
      }
      
      // For now, we'll only support DGT tips (internal ledger)
      if (currency !== 'DGT') {
        throw new WalletError(
          'Only DGT tipping is supported at this time',
          400,
          WalletErrorCodes.INVALID_CURRENCY
        );
      }
      
      // Validate the min/max amount (skip for dust tips by admins/mods)
      if (!isDust) {
        const minAmount = settings.minAmountDGT;
        if (amount < minAmount) {
          throw new WalletError(
            `Tip amount must be at least ${minAmount} ${currency}`,
            400,
            WalletErrorCodes.INVALID_AMOUNT,
            { minAmount, providedAmount: amount }
          );
        }
        
        const maxAmount = settings.maxAmountDGT;
        if (maxAmount > 0 && amount > maxAmount) {
          throw new WalletError(
            `Tip amount cannot exceed ${maxAmount} ${currency}`,
            400,
            WalletErrorCodes.INVALID_AMOUNT,
            { maxAmount, providedAmount: amount }
          );
        }
      }
      
      // Check for cooldowns
      await this.checkCooldowns(senderUserId, 'tip');
      
      // Process the tip
      const { transactionId } = await this.processTip(
        senderUserId,
        recipientUserId,
        amount
      );
      
      // Update last command time
      await this.updateLastCommandTime(senderUserId, 'tip');
      
      return {
        transactionId,
        amount,
        currency,
        recipient: {
          id: recipient.id,
          username: recipient.username
        }
      };
    } catch (error) {
      if (error instanceof WalletError) {
        throw error;
      }
      
      logger.error('TipService', `Error processing tip command: ${error.message}`);
      
      throw new WalletError(
        `Failed to process tip command: ${error.message}`,
        500,
        WalletErrorCodes.TRANSACTION_FAILED,
        { originalError: error.message }
      );
    }
  }
  
  /**
   * Get tip settings from the database
   */
  private async getTipSettings() {
    try {
      const settings = await db.query.tipSettings.findFirst({
        where: eq(tipSettings.isActive, true)
      });
      
      // Default settings if none found
      if (!settings) {
        return {
          enabled: true,
          minAmountDGT: 0.1,
          maxAmountDGT: 1000,
          minAmountUSDT: 0.1,
          maxAmountUSDT: 100,
          cooldownSeconds: 60
        };
      }
      
      return settings;
    } catch (error) {
      logger.error('TipService', `Error getting tip settings: ${error.message}`);
      
      // Default settings on error
      return {
        enabled: true,
        minAmountDGT: 0.1,
        maxAmountDGT: 1000,
        minAmountUSDT: 0.1,
        maxAmountUSDT: 100,
        cooldownSeconds: 60
      };
    }
  }
  
  /**
   * Check if user is on cooldown for a command
   */
  private async checkCooldowns(userId: number, commandType: 'tip' | 'rain'): Promise<void> {
    try {
      // Get cooldown settings
      const settings = await db.query.cooldownSettings.findFirst({
        where: and(
          eq(cooldownSettings.isActive, true),
          eq(cooldownSettings.type, commandType)
        )
      });
      
      if (!settings || settings.durationSeconds <= 0) {
        return; // No cooldown
      }
      
      // Get user's last command time
      const userCooldown = await db.execute(sql`
        SELECT last_${commandType}_time
        FROM user_cooldowns
        WHERE user_id = ${userId}
      `);
      
      if (userCooldown.rowCount === 0 || !userCooldown.rows[0][`last_${commandType}_time`]) {
        return; // User hasn't used this command before
      }
      
      const lastCommandTime = new Date(userCooldown.rows[0][`last_${commandType}_time`]);
      const cooldownEndTime = new Date(lastCommandTime.getTime() + (settings.durationSeconds * 1000));
      const now = new Date();
      
      if (now < cooldownEndTime) {
        const remainingSeconds = Math.ceil((cooldownEndTime.getTime() - now.getTime()) / 1000);
        
        throw new WalletError(
          `You must wait ${remainingSeconds} seconds before using this command again`,
          429,
          WalletErrorCodes.RATE_LIMITED,
          { cooldownRemaining: remainingSeconds }
        );
      }
    } catch (error) {
      if (error instanceof WalletError) {
        throw error;
      }
      
      logger.error('TipService', `Error checking cooldowns: ${error.message}`);
      // Allow command to proceed if there's an error checking cooldowns
    }
  }
  
  /**
   * Update the last command time for a user
   */
  private async updateLastCommandTime(userId: number, commandType: 'tip' | 'rain'): Promise<void> {
    try {
      // Check if user has a cooldown record
      const existingRecord = await db.execute(sql`
        SELECT 1
        FROM user_cooldowns
        WHERE user_id = ${userId}
      `);
      
      if (existingRecord.rowCount === 0) {
        // Insert new record
        await db.execute(sql`
          INSERT INTO user_cooldowns (user_id, last_${commandType}_time)
          VALUES (${userId}, NOW())
        `);
      } else {
        // Update existing record
        await db.execute(sql`
          UPDATE user_cooldowns
          SET last_${commandType}_time = NOW()
          WHERE user_id = ${userId}
        `);
      }
    } catch (error) {
      logger.error('TipService', `Error updating last command time: ${error.message}`);
      // Non-critical error, don't throw
    }
  }
}

/**
 * Create a new instance of the TipService
 */
export function createTipService(): TipService {
  return new TipService();
}

// Create and export a singleton instance
export const tipService = createTipService(); 