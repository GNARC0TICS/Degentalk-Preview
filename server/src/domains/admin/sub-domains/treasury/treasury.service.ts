/**
 * Admin Treasury Service
 * 
 * Handles business logic for treasury operations in the admin panel.
 */

import { db } from '@db';
import { users, transactions, adminAuditLogs, dgtEconomyParameters, siteSettings as platformSiteSettings } from '@schema';
import type { Transaction } from '@schema';
import { sql, eq, desc, and, inArray } from 'drizzle-orm';
import { AdminError, AdminErrorCodes } from '../../admin.errors';
import type { TreasuryDepositInput, TreasuryWithdrawalInput, TreasurySettingsUpdateInput, MassAirdropInput } from './treasury.validators';

// Helper to format DGT amounts for display (assuming 6 decimal places for DGT)
function formatDgtAmount(amount: number): number {
  return amount / 1000000;
}

// Helper to parse DGT amounts for storage
function parseDgtAmount(displayAmount: number): number {
  return Math.floor(displayAmount * 1000000);
}

export class AdminTreasuryService {

  async getDgtSupplyStats() {
    try {
      const [totalSupplySetting] = await db.select({ value: platformSiteSettings.value })
        .from(platformSiteSettings)
        .where(eq(platformSiteSettings.key, 'dgt_total_supply_cap'));
        
      const circulatingSupplyResult = await db.select({ circulating: sql<number>`sum(${users.dgtWalletBalance})` })
        .from(users)
        .where(sql`${users.id} != 999999`); // Exclude treasury user ID if you have one
        
      const [treasurySpecificSettings] = await db.select({ 
          dgtTreasuryBalance: dgtEconomyParameters.dgtTreasuryBalance 
        })
        .from(dgtEconomyParameters)
        .limit(1);
        
      const holdersCountResult = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(and(sql`${users.dgtWalletBalance} > 0`, sql`${users.id} != 999999`));

      const totalSupply = parseDgtAmount(parseFloat(totalSupplySetting?.value || '1000000000'));
      const circulatingAmount = Number(circulatingSupplyResult[0]?.circulating) || 0;
      const treasuryAmount = Number(treasurySpecificSettings?.dgtTreasuryBalance) || 0;
      const holdersCount = Number(holdersCountResult[0]?.count) || 0;

      return {
        totalSupply: formatDgtAmount(totalSupply),
        circulatingSupply: formatDgtAmount(circulatingAmount),
        treasuryBalance: formatDgtAmount(treasuryAmount),
        percentCirculating: totalSupply > 0 ? (circulatingAmount / totalSupply) * 100 : 0,
        holders: holdersCount
      };
    } catch (error: any) {
      console.error("Error in getDgtSupplyStats:", error);
      throw new AdminError('Failed to fetch DGT supply statistics', 500, AdminErrorCodes.DB_ERROR, { originalError: error.message });
    }
  }

  async sendFromTreasury(input: TreasuryDepositInput, adminUserId: number) {
    const { amount, userId, description, metadata } = input;
    const transferAmountDgt = parseDgtAmount(amount);

    return db.transaction(async (tx) => {
      const [currentDgtParams] = await tx.select({ balance: dgtEconomyParameters.dgtTreasuryBalance })
        .from(dgtEconomyParameters)
        .limit(1);

      const currentTreasuryBalance = Number(currentDgtParams?.balance) || 0;
      if (currentTreasuryBalance < transferAmountDgt) {
        throw new AdminError('Insufficient treasury balance', 400, AdminErrorCodes.OPERATION_FAILED);
      }

      const [recipient] = await tx.select().from(users).where(eq(users.id, userId));
      if (!recipient) {
        throw new AdminError('Recipient user not found', 404, AdminErrorCodes.USER_NOT_FOUND);
      }

      await tx.update(dgtEconomyParameters)
        .set({
          dgtTreasuryBalance: sql`${dgtEconomyParameters.dgtTreasuryBalance} - ${transferAmountDgt}`,
          updatedAt: new Date(),
          updatedBy: adminUserId
        });
      
      await tx.update(users)
        .set({
          dgtWalletBalance: sql`${users.dgtWalletBalance || 0} + ${transferAmountDgt}`,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      const [newTransaction] = await tx.insert(transactions).values({
        userId: userId,
        fromUserId: null, 
        toUserId: userId,
        amount: transferAmountDgt,
        type: 'ADMIN_ADJUST',
        status: 'confirmed',
        description: description || 'Treasury allocation',
        metadata: metadata || { adminUser: adminUserId },
        isTreasuryTransaction: true,
      }).returning();
      
      return { ...newTransaction, amount: formatDgtAmount(newTransaction.amount || 0) };
    });
  }

  async recoverToTreasury(input: TreasuryWithdrawalInput, adminUserId: number) {
    const { amount, userId, description, metadata } = input;
    const transferAmountDgt = parseDgtAmount(amount);

    return db.transaction(async (tx) => {
      const [userToRecoverFrom] = await tx.select({ balance: users.dgtWalletBalance })
        .from(users)
        .where(eq(users.id, userId));

      if (!userToRecoverFrom) {
        throw new AdminError('User not found for recovery', 404, AdminErrorCodes.USER_NOT_FOUND);
      }

      const currentUserBalance = Number(userToRecoverFrom.balance) || 0;
      if (currentUserBalance < transferAmountDgt) {
        throw new AdminError('Insufficient user balance for recovery', 400, AdminErrorCodes.OPERATION_FAILED);
      }

      await tx.update(users)
        .set({
          dgtWalletBalance: sql`${users.dgtWalletBalance || 0} - ${transferAmountDgt}`,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
        
      await tx.update(dgtEconomyParameters)
        .set({
          dgtTreasuryBalance: sql`${dgtEconomyParameters.dgtTreasuryBalance || 0} + ${transferAmountDgt}`,
          updatedAt: new Date(),
          updatedBy: adminUserId
        });

      const [newTransaction] = await tx.insert(transactions).values({
        userId: userId,
        fromUserId: userId,
        toUserId: null, 
        amount: transferAmountDgt,
        type: 'ADMIN_ADJUST',
        status: 'confirmed',
        description: description || 'Recovery to treasury',
        metadata: metadata || { adminUser: adminUserId },
        isTreasuryTransaction: true,
      }).returning();

      return { ...newTransaction, amount: formatDgtAmount(newTransaction.amount || 0) };
    });
  }

  async massAirdrop(input: MassAirdropInput, adminUserId: number) {
    const { userIds, amountPerUser, reason } = input;
    const dgtAmountPerUserStorage = parseDgtAmount(amountPerUser);
    const totalDgtAmountStorage = dgtAmountPerUserStorage * userIds.length;

    return db.transaction(async (tx) => {
      const [currentDgtParams] = await tx.select({ balance: dgtEconomyParameters.dgtTreasuryBalance })
        .from(dgtEconomyParameters)
        .limit(1);
      const currentTreasuryBalance = Number(currentDgtParams?.balance) || 0;

      if (currentTreasuryBalance < totalDgtAmountStorage) {
        throw new AdminError(
          `Insufficient treasury balance. Need ${formatDgtAmount(totalDgtAmountStorage)} DGT, have ${formatDgtAmount(currentTreasuryBalance)} DGT`,
          400,
          AdminErrorCodes.OPERATION_FAILED
        );
      }

      const foundUsers = await tx.select({ id: users.id, username: users.username, currentBalance: users.dgtWalletBalance })
        .from(users)
        .where(inArray(users.id, userIds));

      const foundUserIds = foundUsers.map(u => u.id);
      const missingUserIds = userIds.filter(id => !foundUserIds.includes(id));

      if (foundUsers.length === 0) {
        throw new AdminError('No valid users found for airdrop.', 404, AdminErrorCodes.USER_NOT_FOUND);
      }

      await tx.update(dgtEconomyParameters)
        .set({
          dgtTreasuryBalance: sql`${dgtEconomyParameters.dgtTreasuryBalance || 0} - ${totalDgtAmountStorage}`,
          updatedAt: new Date(),
          updatedBy: adminUserId
        });

      const airdropResults: Array<{ userId: number; username: string; amount: number; transactionId?: number; status: string; error?: string }> = [];

      for (const user of foundUsers) {
        try {
          await tx.update(users)
            .set({ dgtWalletBalance: sql`${user.currentBalance || 0} + ${dgtAmountPerUserStorage}` })
            .where(eq(users.id, user.id));

          const [transactionResult] = await tx.insert(transactions).values({
            userId: user.id,
            amount: dgtAmountPerUserStorage,
            type: 'AIRDROP',
            status: 'confirmed',
            description: `Admin Airdrop: ${reason || 'Mass Distribution'}`,
            metadata: { adminUser: adminUserId, reason: reason || 'Mass Distribution', displayAmount: amountPerUser },
            isTreasuryTransaction: true,
          }).returning({ transactionId: transactions.id });
          
          airdropResults.push({
            userId: user.id, 
            username: user.username,
            amount: amountPerUser, 
            transactionId: transactionResult.transactionId,
            status: 'success'
          });
        } catch (e: any) {
          airdropResults.push({ 
            userId: user.id, 
            username: user.username, 
            amount: amountPerUser, 
            status: 'failed',
            error: e.message 
          });
        }
      }
      return { airdropResults, missingUserIds };
    });
  }
  
  async getDgtEconomyParameters() {
    try {
        const settings = await db.query.dgtEconomyParameters.findFirst({});
        
        if (!settings) {
            return null; 
        }
        return {
          ...settings,
          dgtTreasuryBalance: settings.dgtTreasuryBalance ? formatDgtAmount(Number(settings.dgtTreasuryBalance)) : 0,
          minWithdrawalAmount: settings.minWithdrawalAmount ? formatDgtAmount(Number(settings.minWithdrawalAmount)) : 0,
          minTipAmount: settings.minTipAmount ? formatDgtAmount(Number(settings.minTipAmount)) : 0,
          maxTipAmount: settings.maxTipAmount ? formatDgtAmount(Number(settings.maxTipAmount)) : 0,
        };
    } catch (error: any) {
        console.error("Error in getDgtEconomyParameters:", error);
        throw new AdminError(
            'Failed to fetch DGT economy parameters',
            500,
            AdminErrorCodes.DB_ERROR,
            { originalError: error.message }
        );
    }
}

async updateDgtEconomyParameters(input: TreasurySettingsUpdateInput, adminUserId: number) {
    try {
        const [existingSettings] = await db.select().from(dgtEconomyParameters)
          .limit(1);

        if (!existingSettings) {
             throw new AdminError('DGT Economy Parameters record not found. Cannot update.', 404, AdminErrorCodes.NOT_FOUND);
        }

        const dataToUpdate: Partial<typeof dgtEconomyParameters.$inferInsert> = {
            treasuryWalletAddress: input.treasuryWalletAddress,
            minWithdrawalAmount: input.minWithdrawalAmount !== undefined ? parseDgtAmount(input.minWithdrawalAmount) : undefined,
            withdrawalFeePercent: input.withdrawalFeePercent,
            rewardDistributionDelayHours: input.rewardDistributionDelayHours,
            tipBurnPercent: input.tipBurnPercent,
            tipRecipientPercent: input.tipRecipientPercent,
            minTipAmount: input.minTipAmount !== undefined ? parseDgtAmount(input.minTipAmount) : undefined,
            maxTipAmount: input.maxTipAmount !== undefined ? parseDgtAmount(input.maxTipAmount) : undefined,
            updatedAt: new Date(),
            updatedBy: adminUserId,
        };
        
        Object.keys(dataToUpdate).forEach(key => dataToUpdate[key as keyof typeof dataToUpdate] === undefined && delete dataToUpdate[key as keyof typeof dataToUpdate]);

        const [updatedSettings] = await db.update(dgtEconomyParameters)
            .set(dataToUpdate)
            .where(eq(dgtEconomyParameters.id, existingSettings.id))
            .returning();
        
        if (!updatedSettings) {
          throw new AdminError('Failed to update DGT Economy Parameters record.', 500, AdminErrorCodes.OPERATION_FAILED);
        }

        return {
          ...updatedSettings,
          dgtTreasuryBalance: updatedSettings.dgtTreasuryBalance ? formatDgtAmount(Number(updatedSettings.dgtTreasuryBalance)) : 0,
          minWithdrawalAmount: updatedSettings.minWithdrawalAmount ? formatDgtAmount(Number(updatedSettings.minWithdrawalAmount)) : 0,
           minTipAmount: updatedSettings.minTipAmount ? formatDgtAmount(Number(updatedSettings.minTipAmount)) : 0,
          maxTipAmount: updatedSettings.maxTipAmount ? formatDgtAmount(Number(updatedSettings.maxTipAmount)) : 0,
        };
    } catch (error: any) {
         console.error("Error in updateDgtEconomyParameters:", error);
        throw new AdminError(
            'Failed to update DGT economy parameters',
            500,
            AdminErrorCodes.DB_ERROR,
            { originalError: error.message }
        );
    }
}

}

export const adminTreasuryService = new AdminTreasuryService();
