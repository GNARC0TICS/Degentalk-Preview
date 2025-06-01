import { db } from '../../../../core/db';
import { users, userToUserGroups, adminManualAirdropLogs, type NewAdminManualAirdropLog } from '@/db/schema';
import { xpService } from '../../../xp/xp.service'; // Core XP service for XP adjustments
import { dgtService } from '../../../wallet/dgt.service'; // Core DGT service for DGT adjustments
import { eq, inArray } from 'drizzle-orm';
import { logger } from '../../../../core/logger';
import { v4 as uuidv4 } from 'uuid';

interface AirdropRequest {
  adminId: number;
  tokenType: 'XP' | 'DGT';
  amount: number;
  targetCriteria: {
    type: 'group' | 'userIds' | 'role'; // For now, we primarily support 'group'
    value: number | number[]; // Group ID or array of User IDs
  };
  note?: string;
}

export class AirdropAdminService {
  async processAirdrop(request: AirdropRequest): Promise<{ success: boolean; message: string; batchId?: string; processedCount: number; errorCount: number }> {
    const { adminId, tokenType, amount, targetCriteria, note } = request;
    logger.info('AIRDROP_SERVICE', 'Processing airdrop request', { request });

    if (amount <= 0) {
      return { success: false, message: 'Airdrop amount must be positive.', processedCount: 0, errorCount: 0 };
    }

    let targetUserIds: number[] = [];

    if (targetCriteria.type === 'group') {
      const groupId = targetCriteria.value as number;
      try {
        const usersInGroup = await db
          .select({ userId: userToUserGroups.userId })
          .from(userToUserGroups)
          .where(eq(userToUserGroups.groupId, groupId));
        targetUserIds = usersInGroup.map((u) => u.userId);
      } catch (error) {
        logger.error('AIRDROP_SERVICE', `Error fetching users in group ${groupId}:`, error);
        return { success: false, message: 'Failed to fetch users in the target group.', processedCount: 0, errorCount: 0 };
      }
    } else if (targetCriteria.type === 'userIds') {
      targetUserIds = Array.isArray(targetCriteria.value) ? targetCriteria.value : [targetCriteria.value as number];
    } else {
      // TODO: Implement other target types like 'role' or 'all_users' if needed
      logger.warn('AIRDROP_SERVICE', `Unsupported target criteria type: ${targetCriteria.type}`)
      return { success: false, message: `Unsupported target criteria: ${targetCriteria.type}`, processedCount: 0, errorCount: 0 };
    }

    if (targetUserIds.length === 0) {
      return { success: false, message: 'No target users found for the airdrop.', processedCount: 0, errorCount: 0 };
    }

    const airdropBatchId = uuidv4();
    let processedCount = 0;
    let errorCount = 0;
    const airdropLogEntries: NewAdminManualAirdropLog[] = [];

    for (const userId of targetUserIds) {
      try {
        let operationSuccessful = false;
        if (tokenType === 'XP') {
          const xpResult = await xpService.updateUserXp(userId, amount, 'add', {
            reason: note || `Admin airdrop (Batch: ${airdropBatchId})`,
            adminId,
            logAdjustment: false, // We will log via airdropRecords
          });
          operationSuccessful = !!xpResult; // Check if xpResult is not undefined/null
        } else if (tokenType === 'DGT') {
          // Assuming dgtService.addDgt returns an object indicating success or throws an error
          await dgtService.addDgt(
            userId,
            BigInt(amount),
            'AIRDROP',
            { reason: note || `Admin airdrop (Batch: ${airdropBatchId})`, adminId, batchId: airdropBatchId }
          );
          operationSuccessful = true;
        }

        if (operationSuccessful) {
          airdropLogEntries.push({
            adminId,
            userId,
            tokenType,
            amount,
            groupId: targetCriteria.type === 'group' ? (targetCriteria.value as number) : undefined,
            note,
            airdropBatchId,
            // createdAt will be set by default
          });
          processedCount++;
        } else {
           logger.warn('AIRDROP_SERVICE', `Airdrop operation for user ${userId} (token: ${tokenType}) reported failure but did not throw.`);
           errorCount++;
        }

      } catch (error) {
        logger.error('AIRDROP_SERVICE', `Error processing airdrop for user ${userId} (Batch: ${airdropBatchId}):`, error);
        errorCount++;
        // Optionally, collect individual errors to return to the admin
      }
    }

    // Batch insert airdrop records
    if (airdropLogEntries.length > 0) {
      try {
        await db.insert(adminManualAirdropLogs).values(airdropLogEntries);
      } catch (error) {
        logger.error('AIRDROP_SERVICE', `Failed to batch insert admin manual airdrop logs for batch ${airdropBatchId}:`, error);
        // This is a partial failure scenario. Some users might have received tokens.
        // Decide on atomicity or compensating transactions if this is critical.
        return { 
          success: false, 
          message: 'Airdrop processed for some users, but failed to log all records. Please check logs.',
          batchId: airdropBatchId, 
          processedCount, 
          errorCount: errorCount + (targetUserIds.length - processedCount) // Count unlogged as errors too
        };
      }
    }

    let message = `Airdrop batch ${airdropBatchId} processed. ${processedCount} users received ${amount} ${tokenType}.`;
    if (errorCount > 0) {
      message += ` ${errorCount} users could not be processed. Check server logs for details.`;
    }

    logger.info('AIRDROP_SERVICE', message);
    return { success: processedCount > 0, message, batchId: airdropBatchId, processedCount, errorCount };
  }
}

export const airdropAdminService = new AirdropAdminService(); 