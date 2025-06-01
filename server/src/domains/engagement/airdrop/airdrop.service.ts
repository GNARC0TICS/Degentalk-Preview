/**
 * Airdrop Service
 * 
 * This service handles admin-initiated airdrops to distribute tokens to all active users.
 * 
 * // [REFAC-AIRDROP]
 */

import { db } from '../../../../db';
import { transactions, users, airdropSettings, airdropRecords } from '@db/schema';
import { eq, and, gt, sql, desc, between } from 'drizzle-orm';
import { logger } from '../../../core/logger';
import { WalletError, ErrorCodes as WalletErrorCodes } from '../../../core/errors';
import { dgtService } from '../../wallet/dgt.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Airdrop options structure
 */
export interface AirdropOptions {
  adminUserId: number;
  amount: number;
  currency: string;
  title?: string;
  description?: string;
  target?: 'all' | 'active' | 'premium';
  activityDays?: number; // For active target, how many days back to look
  threshold?: number; // Minimum amount of activity to qualify
}

/**
 * Airdrop result structure
 */
export interface AirdropResult {
  id: number;
  title: string;
  adminUserId: number;
  amount: number;
  perUserAmount: number;
  currency: string;
  recipientCount: number;
  transactionId: number;
  status: string;
  createdAt: Date;
}

/**
 * Service for handling airdrops to users
 */
export class AirdropService {
  /**
   * Process an airdrop to distribute tokens to users
   * @param options - Airdrop options
   * @returns Airdrop result
   */
  async processAirdrop(options: AirdropOptions): Promise<AirdropResult> {
    const {
      adminUserId,
      amount,
      currency,
      title = 'Platform Airdrop',
      description = 'Token distribution to active users',
      target = 'active',
      activityDays = 30,
      threshold = 1
    } = options;
    
    try {
      logger.info('AirdropService', `Processing airdrop from admin ${adminUserId}`, {
        amount,
        currency,
        target
      });
      
      // Only DGT is supported for now
      if (currency !== 'DGT') {
        throw new WalletError(
          'Only DGT airdrops are supported at this time',
          400,
          WalletErrorCodes.INVALID_PARAMETERS
        );
      }
      
      // Verify admin has sufficient balance if they're the source
      if (adminUserId) {
        const [admin] = await db.select({
          id: users.id,
          dgtWalletBalance: users.dgtWalletBalance,
          groupId: users.groupId
        })
        .from(users)
        .where(eq(users.id, adminUserId))
        .limit(1);
        
        if (!admin) {
          throw new WalletError(
            'Admin user not found',
            404,
            WalletErrorCodes.USER_NOT_FOUND
          );
        }
        
        // Check if user is actually an admin
        if (admin.groupId !== 1) {
          throw new WalletError(
            'Only administrators can initiate airdrops',
            403,
            WalletErrorCodes.PERMISSION_DENIED
          );
        }
        
        // Check admin balance
        if (admin.dgtWalletBalance < amount) {
          throw new WalletError(
            'Insufficient DGT balance',
            400,
            WalletErrorCodes.INSUFFICIENT_FUNDS,
            { required: amount, available: admin.dgtWalletBalance }
          );
        }
      }
      
      // Get recipients based on target
      const recipientIds = await this.getRecipients(target, activityDays, threshold);
      
      if (recipientIds.length === 0) {
        throw new WalletError(
          'No eligible recipients found for airdrop',
          400,
          WalletErrorCodes.INVALID_PARAMETERS
        );
      }
      
      // Calculate per-user amount
      const recipientCount = recipientIds.length;
      const perUserAmount = Math.floor(amount / recipientCount);
      
      if (perUserAmount <= 0) {
        throw new WalletError(
          'Airdrop amount too small for the number of recipients',
          400,
          WalletErrorCodes.INVALID_AMOUNT,
          { recipients: recipientCount, minAmount: recipientCount }
        );
      }
      
      // Create a unique reference for the airdrop
      const airdropRef = uuidv4();
      
      // Record the airdrop in db
      const [airdropRecord] = await db.insert(airdropRecords)
        .values({
          adminUserId,
          title,
          description,
          amount,
          perUserAmount,
          currency,
          recipientCount,
          target,
          activityDays,
          threshold,
          reference: airdropRef,
          status: 'processing',
          metadata: {
            recipientIds,
            timestamp: new Date().toISOString()
          },
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      // Record the transaction
      const [airdropTransaction] = await db.insert(transactions).values({
        userId: adminUserId,
        fromUserId: adminUserId,
        amount,
        type: 'AIRDROP',
        status: 'confirmed',
        currency,
        description: `Airdrop: ${title}`,
        metadata: {
          recipientCount,
          perUserAmount,
          airdropId: airdropRecord.id,
          reference: airdropRef,
          timestamp: new Date().toISOString()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      // Process the airdrop distribution
      // Note: For large airdrops, this would ideally be handled by a background job
      // or a queue system to avoid timeout issues
      if (currency === 'DGT') {
        await this.processDGTAirdrop(
          adminUserId,
          perUserAmount,
          recipientIds,
          airdropTransaction.id,
          airdropRecord.id,
          title
        );
      }
      
      // Update the airdrop record to completed
      await db.update(airdropRecords)
        .set({
          status: 'completed',
          transactionId: airdropTransaction.id,
          updatedAt: new Date()
        })
        .where(eq(airdropRecords.id, airdropRecord.id));
      
      logger.info('AirdropService', `Airdrop completed: Admin ${adminUserId} -> ${recipientCount} users`, {
        amount,
        currency,
        airdropId: airdropRecord.id,
        transactionId: airdropTransaction.id
      });
      
      return {
        id: airdropRecord.id,
        title,
        adminUserId,
        amount,
        perUserAmount,
        currency,
        recipientCount,
        transactionId: airdropTransaction.id,
        status: 'completed',
        createdAt: airdropRecord.createdAt
      };
    } catch (error) {
      if (error instanceof WalletError) {
        throw error;
      }
      
      logger.error('AirdropService', `Error processing airdrop: ${error.message}`);
      
      throw new WalletError(
        `Failed to process airdrop: ${error.message}`,
        500,
        WalletErrorCodes.TRANSACTION_FAILED,
        { originalError: error.message }
      );
    }
  }
  
  /**
   * Process DGT airdrop by distributing to recipient users
   */
  private async processDGTAirdrop(
    adminUserId: number,
    perUserAmount: number,
    recipientIds: number[],
    transactionId: number,
    airdropId: number,
    title: string
  ): Promise<void> {
    // Process airdrop for each recipient individually
    for (const recipientId of recipientIds) {
      // Skip sending to the admin themselves
      if (recipientId === adminUserId) {
        continue;
      }
      
      try {
        // Use dgtService to grant DGT to the recipient
        await dgtService.grantDGT(
          recipientId,
          perUserAmount,
          'airdrop',
          {
            airdropId,
            parentTransactionId: transactionId,
            title,
            adminUserId
          }
        );
      } catch (error) {
        // Log error but continue with other recipients
        logger.error('AirdropService', `Error sending airdrop to recipient ${recipientId}: ${error.message}`);
      }
    }
    
    // If the admin is in the recipients list, deduct the full amount from them
    if (adminUserId && recipientIds.includes(adminUserId)) {
      try {
        // Deduct the entire airdrop amount from admin
        const totalAmount = perUserAmount * (recipientIds.length - 1); // Exclude admin from recipients
        await dgtService.deductDGT(
          adminUserId,
          totalAmount,
          'airdrop_source',
          {
            airdropId,
            parentTransactionId: transactionId,
            title
          }
        );
      } catch (error) {
        // This should not happen since we checked balance earlier
        logger.error('AirdropService', `Error deducting airdrop amount from admin ${adminUserId}: ${error.message}`);
      }
    }
  }
  
  /**
   * Get list of recipient user IDs based on target criteria
   */
  private async getRecipients(
    target: 'all' | 'active' | 'premium',
    activityDays: number,
    threshold: number
  ): Promise<number[]> {
    switch (target) {
      case 'all':
        // Get all users excluding suspended
        const allUsers = await db.select({
          id: users.id
        })
        .from(users)
        .where(
          sql`${users.status} != 'suspended'`
        );
        
        return allUsers.map(u => u.id);
        
      case 'active':
        // Get users active in the last X days
        const activityDate = new Date();
        activityDate.setDate(activityDate.getDate() - activityDays);
        
        const activeUsers = await db.select({
          id: users.id
        })
        .from(users)
        .where(
          and(
            sql`${users.status} != 'suspended'`,
            sql`${users.lastActive} >= ${activityDate.toISOString()}`
          )
        );
        
        return activeUsers.map(u => u.id);
        
      case 'premium':
        // Get users with premium status
        const premiumUsers = await db.select({
          id: users.id
        })
        .from(users)
        .where(
          and(
            sql`${users.status} != 'suspended'`,
            sql`${users.isPremium} = true`
          )
        );
        
        return premiumUsers.map(u => u.id);
        
      default:
        throw new WalletError(
          `Invalid target type: ${target}`,
          400,
          WalletErrorCodes.INVALID_PARAMETERS
        );
    }
  }
  
  /**
   * Get airdrop history for admin
   */
  async getAirdropHistory(
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    airdrops: any[];
    total: number;
  }> {
    try {
      const airdrops = await db.select()
        .from(airdropRecords)
        .orderBy(sql`${airdropRecords.createdAt} DESC`)
        .limit(limit)
        .offset(offset);
      
      const [{ count }] = await db.select({
        count: sql`COUNT(*)`
      })
      .from(airdropRecords);
      
      return {
        airdrops,
        total: Number(count)
      };
    } catch (error) {
      logger.error('AirdropService', `Error getting airdrop history: ${error.message}`);
      throw new WalletError(
        `Failed to get airdrop history: ${error.message}`,
        500,
        WalletErrorCodes.SYSTEM_ERROR
      );
    }
  }
  
  /**
   * Get airdrop details with recipients
   */
  async getAirdropDetails(airdropId: number): Promise<any> {
    try {
      const [airdrop] = await db.select()
        .from(airdropRecords)
        .where(eq(airdropRecords.id, airdropId))
        .limit(1);
      
      if (!airdrop) {
        throw new WalletError(
          'Airdrop not found',
          404,
          WalletErrorCodes.TRANSACTION_NOT_FOUND
        );
      }
      
      // Get transaction details
      const [transaction] = airdrop.transactionId ? 
        await db.select()
          .from(transactions)
          .where(eq(transactions.id, airdrop.transactionId))
          .limit(1) : 
        [null];
      
      return {
        ...airdrop,
        transaction
      };
    } catch (error) {
      if (error instanceof WalletError) {
        throw error;
      }
      
      logger.error('AirdropService', `Error getting airdrop details: ${error.message}`);
      throw new WalletError(
        `Failed to get airdrop details: ${error.message}`,
        500,
        WalletErrorCodes.SYSTEM_ERROR
      );
    }
  }
}

// Export a singleton instance
export const airdropService = new AirdropService(); 