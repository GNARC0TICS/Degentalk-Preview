import { db } from '../db';
import { users, xpCloutSettings } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import { logger } from '../src/core/logger';

export class XpCloutService {
  /**
   * Fetches the XP and Clout values for a specific action key.
   * @param actionKey - The unique key identifying the action (e.g., 'POST_CREATE').
   * @returns Object containing xpValue and cloutValue, or null if not found.
   */
  async getActionValues(actionKey: string): Promise<{ xpValue: number; cloutValue: number } | null> {
    try {
      const result = await db
        .select({
          xpValue: xpCloutSettings.xpValue,
          cloutValue: xpCloutSettings.cloutValue,
        })
        .from(xpCloutSettings)
        .where(eq(xpCloutSettings.actionKey, actionKey))
        .limit(1);

      if (result.length > 0) {
        return result[0];
      }
      logger.warn('XpCloutService', `No XP/Clout settings found for actionKey: ${actionKey}`);
      return null;
    } catch (error) {
      logger.error('XpCloutService', `Error fetching action values for ${actionKey}:`, error);
      return null;
    }
  }

  /**
   * Awards XP and Clout to a user for a specific action.
   * Fetches values from xpCloutSettings based on the actionKey.
   * @param userId - The ID of the user to award points to.
   * @param actionKey - The key identifying the action performed.
   * @param multiplier - Optional multiplier (e.g., for tips based on amount).
   * @returns Boolean indicating if the points were awarded successfully.
   */
  async awardPoints(userId: number, actionKey: string, multiplier: number = 1): Promise<boolean> {
    const values = await this.getActionValues(actionKey);

    if (!values || (values.xpValue === 0 && values.cloutValue === 0)) {
      // No points defined for this action or values are zero
      return false;
    }

    const xpToAdd = Math.floor(values.xpValue * multiplier);
    const cloutToAdd = Math.floor(values.cloutValue * multiplier);

    if (xpToAdd === 0 && cloutToAdd === 0) {
        // No points to add after applying multiplier
        return false;
    }

    try {
      // Update user record
      // TODO: Add logic to check for level up based on new XP total
      await db
        .update(users)
        .set({
          xp: sql`${users.xp} + ${xpToAdd}`,
          clout: sql`${users.clout} + ${cloutToAdd}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      logger.info('XpCloutService', `Awarded ${xpToAdd} XP and ${cloutToAdd} Clout to user ${userId} for action ${actionKey}`);
      
      // TODO: Trigger level up check and potential notifications/rewards
      // await this.checkLevelUp(userId);
      
      return true;
    } catch (error) {
      logger.error('XpCloutService', `Error awarding points to user ${userId} for action ${actionKey}:`, error);
      return false;
    }
  }
  
  /**
   * Checks if a user has leveled up after gaining XP and applies rewards.
   * (Placeholder - needs implementation)
   */
  async checkLevelUp(userId: number): Promise<void> {
     // 1. Get current user XP and level
     // 2. Query `levels` table to find the next level threshold
     // 3. If user XP >= next level threshold:
     //    a. Update user level
     //    b. Query the `levels` table for rewards (DGT, Title, Badge)
     //    c. Grant rewards (update user DGT balance, activeTitleId, activeBadgeId)
     //    d. Potentially create a notification
     //    e. Recursively check for further level ups if multiple levels gained
     logger.info('XpCloutService', `Level up check triggered for user ${userId} - (Not yet implemented)`);
  }
  
}

// Export a singleton instance
export const xpCloutService = new XpCloutService(); 