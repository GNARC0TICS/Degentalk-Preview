import { eq, and, desc, asc, gte, lte, count, sum, sql, inArray, isNull } from 'drizzle-orm';
import { db } from '@db';
import { 
  achievements,
  userAchievements,
  users,
  badges,
  userBadges,
  titles,
  userTitles,
  transactions,
  posts,
  threads,
  xpAdjustmentLogs
} from '@schema';
import { BaseRepository, RepositoryError } from '@core/repository/base-repository';
import { logger } from '@core/logger';
import type { UserId, AchievementId } from '@shared/types/ids';

export interface AchievementDefinition {
  id: AchievementId;
  name: string;
  description: string;
  iconUrl?: string;
  rewardXp: number;
  rewardPoints: number;
  requirement: AchievementRequirement;
  isActive: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  category: 'social' | 'content' | 'economy' | 'progression' | 'special';
}

export interface AchievementRequirement {
  type: 'count' | 'threshold' | 'streak' | 'composite';
  action: string;
  target: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'lifetime';
  conditions?: Record<string, any>;
}

export interface UserAchievementProgress {
  userId: UserId;
  achievementId: AchievementId;
  currentProgress: number;
  isCompleted: boolean;
  earnedAt?: Date;
  progressPercentage: number;
  achievement: AchievementDefinition;
}

/**
 * Repository for gamification domain
 * All database operations for gamification should go through this repository
 */
export class GamificationRepository {
  /**
   * Get all achievements
   */
  async findAllAchievements(activeOnly: boolean = true): Promise<any[]> {
    try {
      let query = db.select().from(achievements);

      if (activeOnly) {
        query = query.where(eq(achievements.isActive, true));
      }

      return await query.orderBy(achievements.name);
    } catch (error) {
      logger.error('GamificationRepository', 'Error in findAllAchievements', { activeOnly, error });
      throw new RepositoryError('Failed to find achievements', 'FIND_ACHIEVEMENTS_ERROR', 500, {
        activeOnly,
        originalError: error
      });
    }
  }

  /**
   * Get user achievement progress
   */
  async getUserAchievementProgress(userId: UserId, achievementId?: AchievementId): Promise<any[]> {
    try {
      let query = db
        .select({
          userId: userAchievements.userId,
          achievementId: userAchievements.achievementId,
          currentProgress: userAchievements.currentProgress,
          isCompleted: userAchievements.isCompleted,
          earnedAt: userAchievements.earnedAt,
          achievement: achievements
        })
        .from(userAchievements)
        .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
        .where(eq(userAchievements.userId, userId));

      if (achievementId) {
        query = query.where(and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, achievementId)
        ));
      }

      return await query.orderBy(desc(userAchievements.earnedAt));
    } catch (error) {
      logger.error('GamificationRepository', 'Error in getUserAchievementProgress', { userId, achievementId, error });
      throw new RepositoryError('Failed to get user achievement progress', 'GET_PROGRESS_ERROR', 500, {
        userId,
        achievementId,
        originalError: error
      });
    }
  }

  /**
   * Award achievement to user
   */
  async awardAchievement(userId: UserId, achievementId: AchievementId, currentProgress: number): Promise<any> {
    try {
      const [result] = await db
        .insert(userAchievements)
        .values({
          userId,
          achievementId,
          currentProgress,
          isCompleted: true,
          earnedAt: new Date()
        })
        .onConflictDoUpdate({
          target: [userAchievements.userId, userAchievements.achievementId],
          set: {
            currentProgress,
            isCompleted: true,
            earnedAt: new Date()
          }
        })
        .returning();

      return result;
    } catch (error) {
      logger.error('GamificationRepository', 'Error in awardAchievement', { userId, achievementId, error });
      throw new RepositoryError('Failed to award achievement', 'AWARD_ACHIEVEMENT_ERROR', 500, {
        userId,
        achievementId,
        originalError: error
      });
    }
  }

  /**
   * Update achievement progress
   */
  async updateAchievementProgress(userId: UserId, achievementId: AchievementId, progress: number): Promise<any> {
    try {
      const [result] = await db
        .insert(userAchievements)
        .values({
          userId,
          achievementId,
          currentProgress: progress,
          isCompleted: false
        })
        .onConflictDoUpdate({
          target: [userAchievements.userId, userAchievements.achievementId],
          set: {
            currentProgress: progress
          }
        })
        .returning();

      return result;
    } catch (error) {
      logger.error('GamificationRepository', 'Error in updateAchievementProgress', { userId, achievementId, progress, error });
      throw new RepositoryError('Failed to update achievement progress', 'UPDATE_PROGRESS_ERROR', 500, {
        userId,
        achievementId,
        progress,
        originalError: error
      });
    }
  }

  /**
   * Get achievement statistics for user
   */
  async getAchievementStats(userId: UserId): Promise<any> {
    try {
      const totalAchievements = await db
        .select({ count: count() })
        .from(achievements)
        .where(eq(achievements.isActive, true));

      const completedAchievements = await db
        .select({ count: count() })
        .from(userAchievements)
        .where(and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.isCompleted, true)
        ));

      const recentEarned = await db
        .select({
          achievement: achievements,
          earnedAt: userAchievements.earnedAt
        })
        .from(userAchievements)
        .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
        .where(and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.isCompleted, true)
        ))
        .orderBy(desc(userAchievements.earnedAt))
        .limit(5);

      return {
        totalAchievements: totalAchievements[0]?.count || 0,
        completedAchievements: completedAchievements[0]?.count || 0,
        recentEarned
      };
    } catch (error) {
      logger.error('GamificationRepository', 'Error in getAchievementStats', { userId, error });
      throw new RepositoryError('Failed to get achievement stats', 'GET_STATS_ERROR', 500, {
        userId,
        originalError: error
      });
    }
  }

  /**
   * Create transaction record
   */
  async createTransaction(transactionData: any): Promise<any> {
    try {
      const [result] = await db.insert(transactions).values(transactionData).returning();
      return result;
    } catch (error) {
      logger.error('GamificationRepository', 'Error in createTransaction', { transactionData, error });
      throw new RepositoryError('Failed to create transaction', 'CREATE_TRANSACTION_ERROR', 500, {
        transactionData,
        originalError: error
      });
    }
  }

  /**
   * Get user post count
   */
  async getUserPostCount(userId: UserId): Promise<number> {
    try {
      const result = await db.select({ count: count() }).from(posts).where(eq(posts.userId, userId));
      return result[0]?.count || 0;
    } catch (error) {
      logger.error('GamificationRepository', 'Error in getUserPostCount', { userId, error });
      throw new RepositoryError('Failed to get user post count', 'GET_POST_COUNT_ERROR', 500, {
        userId,
        originalError: error
      });
    }
  }

  /**
   * Get user thread count
   */
  async getUserThreadCount(userId: UserId): Promise<number> {
    try {
      const result = await db.select({ count: count() }).from(threads).where(eq(threads.userId, userId));
      return result[0]?.count || 0;
    } catch (error) {
      logger.error('GamificationRepository', 'Error in getUserThreadCount', { userId, error });
      throw new RepositoryError('Failed to get user thread count', 'GET_THREAD_COUNT_ERROR', 500, {
        userId,
        originalError: error
      });
    }
  }
}

// Export singleton instance
export const gamificationRepository = new GamificationRepository();
