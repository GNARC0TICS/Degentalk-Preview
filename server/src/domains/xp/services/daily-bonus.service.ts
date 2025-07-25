import { redisClient } from '@core/services/rate-limit.service';
import { xpService } from '../xp.service';
import { logger } from '@core/logger';
import type { UserId } from '@shared/types/ids';
import { economyConfig } from '@shared/config/economy.config';

/**
 * Simple Daily Login Bonus Service for MVP
 * 
 * ACTIVE: This is the MVP engagement loop while missions are archived
 * Post-launch: Can be integrated with full mission system
 */
export class DailyBonusService {
  private readonly DAILY_LOGIN_XP = economyConfig.DAILY_LOGIN_BONUS_XP;
  private readonly STREAK_MULTIPLIER = 1.1; // 10% bonus per streak day (max 2x)
  
  /**
   * Check and award daily login bonus
   * @returns Object with bonus info or null if already claimed
   */
  async checkDailyBonus(userId: UserId): Promise<{
    awarded: boolean;
    xp: number;
    streak: number;
    message: string;
  } | null> {
    try {
      const today = new Date().toDateString();
      const claimKey = `daily_bonus:${userId}:${today}`;
      const streakKey = `daily_streak:${userId}`;
      
      // Check if already claimed today
      const claimed = await redisClient?.get(claimKey);
      if (claimed) {
        const currentStreak = await this.getCurrentStreak(userId);
        return {
          awarded: false,
          xp: 0,
          streak: currentStreak,
          message: 'Daily bonus already claimed! Come back tomorrow.'
        };
      }
      
      // Calculate streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = `daily_bonus:${userId}:${yesterday.toDateString()}`;
      const claimedYesterday = await redisClient?.get(yesterdayKey);
      
      let streak = 1;
      if (claimedYesterday) {
        const currentStreak = await redisClient?.get(streakKey);
        streak = currentStreak ? parseInt(currentStreak) + 1 : 1;
      }
      
      // Calculate XP with streak bonus (max 2x)
      const multiplier = Math.min(1 + (streak - 1) * 0.1, 2);
      const xpAmount = Math.floor(this.DAILY_LOGIN_XP * multiplier);
      
      // Award XP
      await xpService.awardXp(userId, xpAmount, 'DAILY_LOGIN', {
        streak,
        multiplier
      });
      
      // Mark as claimed (expires in 48 hours to allow for missed days)
      await redisClient?.setex(claimKey, 172800, '1');
      
      // Update streak
      await redisClient?.setex(streakKey, 172800, streak.toString());
      
      logger.info('DAILY_BONUS', 'Daily bonus awarded', {
        userId,
        xp: xpAmount,
        streak,
        multiplier
      });
      
      return {
        awarded: true,
        xp: xpAmount,
        streak,
        message: streak > 1 
          ? `🔥 ${streak} day streak! Earned ${xpAmount} XP (${Math.round((multiplier - 1) * 100)}% bonus)`
          : `Welcome back! Earned ${xpAmount} XP`
      };
    } catch (error) {
      logger.error('DAILY_BONUS', 'Error checking daily bonus', {
        error,
        userId
      });
      return null;
    }
  }
  
  /**
   * Get user's current streak
   */
  async getCurrentStreak(userId: UserId): Promise<number> {
    const streakKey = `daily_streak:${userId}`;
    const streak = await redisClient?.get(streakKey);
    return streak ? parseInt(streak) : 0;
  }
  
  /**
   * Get all users who have claimed bonus today (for analytics)
   */
  async getTodayClaimCount(): Promise<number> {
    const today = new Date().toDateString();
    const pattern = `daily_bonus:*:${today}`;
    const keys = await redisClient?.keys(pattern);
    return keys.length;
  }
  
  /**
   * Reset a user's streak (admin action)
   */
  async resetStreak(userId: UserId): Promise<void> {
    const streakKey = `daily_streak:${userId}`;
    await redisClient?.del(streakKey);
    
    logger.info('DAILY_BONUS', 'Streak reset', { userId });
  }
}

// Export singleton instance
export const dailyBonusService = new DailyBonusService();