/**
 * Mission Scheduler Service
 * 
 * Handles mission rotation, daily/weekly resets, and smart assignment
 * Uses cron jobs for scheduled tasks and ML-inspired selection algorithms
 */

import { CronJob } from 'cron';
import { db } from '@core/db';
import { logger } from '@core/logger';
import { createServiceReporter } from '@shared/lib/report-error';
import type { UserId, MissionId } from '@shared/types/ids';
import {
  missionTemplates,
  activeMissions,
  missionHistory,
  missionStreaks,
  users,
  type MissionTemplate,
  type MissionCategory
} from '@schema';
import { eq, and, gte, lte, inArray, sql, desc, not } from 'drizzle-orm';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, subDays } from 'date-fns';
import { missionCoreService } from './mission-core.service';
import { 
  dailyMissionTemplates, 
  weeklyMissionTemplates,
  specialMissionTemplates,
  vipMissionTemplates,
  missionRotationConfig,
  type MissionTemplateConfig
} from '../config/mission-templates.config';
import { Redis } from '@core/redis';
import { WebSocketService } from '@core/websocket.service';

const reportError = createServiceReporter('MissionSchedulerService');

interface UserMissionPreferences {
  favoriteCategories: MissionCategory[];
  completionRate: number;
  averageCompletionTime: number;
  preferredDifficulty: 'easy' | 'medium' | 'hard';
  activeHours: number[];
  streakDays: number;
}

export class MissionSchedulerService {
  private dailyResetJob: CronJob;
  private weeklyResetJob: CronJob;
  private specialEventJob: CronJob;
  private redis: Redis;
  private wsService: WebSocketService;
  
  constructor() {
    this.redis = new Redis({ keyPrefix: 'mission:scheduler:' });
    this.wsService = new WebSocketService();
    this.initializeJobs();
    this.seedMissionTemplates();
  }
  
  /**
   * Initialize cron jobs
   */
  private initializeJobs(): void {
    // Daily reset at 00:00 UTC
    this.dailyResetJob = new CronJob(
      '0 0 * * *',
      async () => {
        try {
          await this.performDailyReset();
        } catch (error) {
          logger.error('Daily mission reset failed:', error);
        }
      },
      null,
      true,
      'UTC'
    );
    
    // Weekly reset at Monday 00:00 UTC
    this.weeklyResetJob = new CronJob(
      '0 0 * * 1',
      async () => {
        try {
          await this.performWeeklyReset();
        } catch (error) {
          logger.error('Weekly mission reset failed:', error);
        }
      },
      null,
      true,
      'UTC'
    );
    
    // Special event check every hour
    this.specialEventJob = new CronJob(
      '0 * * * *',
      async () => {
        try {
          await this.checkSpecialEvents();
        } catch (error) {
          logger.error('Special event check failed:', error);
        }
      },
      null,
      true,
      'UTC'
    );
    
    logger.info('Mission scheduler initialized with cron jobs');
  }
  
  /**
   * Seed mission templates to database
   */
  private async seedMissionTemplates(): Promise<void> {
    try {
      const allTemplates = [
        ...dailyMissionTemplates,
        ...weeklyMissionTemplates,
        ...specialMissionTemplates,
        ...vipMissionTemplates
      ];
      
      for (const template of allTemplates) {
        // Check if template already exists
        const existing = await db
          .select()
          .from(missionTemplates)
          .where(eq(missionTemplates.key, template.key))
          .limit(1);
        
        if (existing.length === 0) {
          await db.insert(missionTemplates).values(template);
          logger.info(`Seeded mission template: ${template.key}`);
        }
      }
    } catch (error) {
      logger.error('Error seeding mission templates:', error);
    }
  }
  
  /**
   * Perform daily mission reset
   */
  async performDailyReset(): Promise<void> {
    logger.info('Starting daily mission reset...');
    
    try {
      // 1. Archive completed daily missions
      await this.archiveExpiredMissions('daily');
      
      // 2. Update daily streaks
      await this.updateDailyStreaks();
      
      // 3. Get all active users (logged in within last 7 days)
      const activeUsers = await this.getActiveUsers(7);
      
      // 4. Assign new daily missions to each user
      let assigned = 0;
      for (const user of activeUsers) {
        try {
          await missionCoreService.assignDailyMissions(user.id as UserId);
          assigned++;
        } catch (error) {
          logger.error(`Failed to assign daily missions to user ${user.id}:`, error);
        }
      }
      
      // 5. Send notifications
      await this.broadcastMissionReset('daily', assigned);
      
      logger.info(`Daily mission reset completed. Assigned to ${assigned} users.`);
    } catch (error) {
      logger.error('Daily mission reset failed:', error);
      throw error;
    }
  }
  
  /**
   * Perform weekly mission reset
   */
  async performWeeklyReset(): Promise<void> {
    logger.info('Starting weekly mission reset...');
    
    try {
      // 1. Archive completed weekly missions
      await this.archiveExpiredMissions('weekly');
      
      // 2. Update weekly streaks
      await this.updateWeeklyStreaks();
      
      // 3. Get all active users (logged in within last 14 days)
      const activeUsers = await this.getActiveUsers(14);
      
      // 4. Assign new weekly missions
      let assigned = 0;
      for (const user of activeUsers) {
        try {
          await missionCoreService.assignWeeklyMissions(user.id as UserId);
          assigned++;
        } catch (error) {
          logger.error(`Failed to assign weekly missions to user ${user.id}:`, error);
        }
      }
      
      // 5. Send notifications
      await this.broadcastMissionReset('weekly', assigned);
      
      logger.info(`Weekly mission reset completed. Assigned to ${assigned} users.`);
    } catch (error) {
      logger.error('Weekly mission reset failed:', error);
      throw error;
    }
  }
  
  /**
   * Smart mission selection based on user preferences and behavior
   */
  async selectMissionsForUser(
    userId: UserId,
    periodType: 'daily' | 'weekly',
    count: number
  ): Promise<MissionTemplate[]> {
    try {
      // Get user preferences and history
      const preferences = await this.getUserMissionPreferences(userId);
      const recentHistory = await this.getUserRecentMissions(userId, 30);
      
      // Get available mission pool
      const pool = await this.getAvailableMissionPool(userId, periodType);
      
      // Score each mission based on user fit
      const scoredMissions = pool.map(mission => ({
        mission,
        score: this.calculateMissionScore(mission, preferences, recentHistory)
      }));
      
      // Sort by score and apply diversity rules
      const selected = this.applyDiversitySelection(
        scoredMissions.sort((a, b) => b.score - a.score),
        count,
        periodType
      );
      
      return selected.map(item => item.mission);
    } catch (error) {
      logger.error('Error selecting missions for user:', error);
      // Fallback to random selection
      return this.randomMissionSelection(periodType, count);
    }
  }
  
  /**
   * Calculate mission score based on user fit
   */
  private calculateMissionScore(
    mission: MissionTemplate,
    preferences: UserMissionPreferences,
    recentHistory: any[]
  ): number {
    let score = mission.weight || 100;
    
    // Category preference bonus (0-50 points)
    if (preferences.favoriteCategories.includes(mission.category)) {
      score += 50;
    }
    
    // Completion rate adjustment (-20 to +20 points)
    if (preferences.completionRate > 0.8) {
      // High completion rate - give slightly harder missions
      score += mission.minLevel > 5 ? 20 : 0;
    } else if (preferences.completionRate < 0.5) {
      // Low completion rate - give easier missions
      score += mission.minLevel <= 3 ? 20 : -20;
    }
    
    // Recent variety penalty (-30 points if done recently)
    const recentlySimilar = recentHistory.filter(
      h => h.category === mission.category && 
      h.type === mission.type
    ).length;
    score -= recentlySimilar * 10;
    
    // Time window bonus (0-30 points)
    if (mission.metadata?.specialConditions?.timeWindow) {
      const currentHour = new Date().getHours();
      const activeInWindow = preferences.activeHours.some(
        hour => this.isInTimeWindow(hour, mission.metadata.specialConditions.timeWindow)
      );
      if (activeInWindow) {
        score += 30;
      }
    }
    
    // Streak bonus for consistent players (0-25 points)
    if (preferences.streakDays > 7 && mission.type === 'streak') {
      score += 25;
    }
    
    // VIP bonus
    if (mission.category === 'vip_exclusive' && preferences.favoriteCategories.includes('vip_exclusive')) {
      score += 100;
    }
    
    return Math.max(0, score);
  }
  
  /**
   * Apply diversity rules to mission selection
   */
  private applyDiversitySelection(
    scoredMissions: Array<{ mission: MissionTemplate; score: number }>,
    count: number,
    periodType: 'daily' | 'weekly'
  ): Array<{ mission: MissionTemplate; score: number }> {
    const selected: Array<{ mission: MissionTemplate; score: number }> = [];
    const categoryCount: Record<string, number> = {};
    const distribution = missionRotationConfig[periodType].distribution;
    
    // First pass: Fill minimum requirements per category
    for (const [category, ratio] of Object.entries(distribution)) {
      const targetCount = Math.floor(count * ratio);
      const categoryMissions = scoredMissions.filter(
        m => m.mission.category === category && 
        !selected.includes(m)
      );
      
      for (let i = 0; i < targetCount && i < categoryMissions.length; i++) {
        selected.push(categoryMissions[i]);
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    }
    
    // Second pass: Fill remaining slots with highest scored
    const remaining = count - selected.length;
    const unselected = scoredMissions.filter(m => !selected.includes(m));
    
    for (let i = 0; i < remaining && i < unselected.length; i++) {
      selected.push(unselected[i]);
    }
    
    return selected.slice(0, count);
  }
  
  /**
   * Get user mission preferences based on history
   */
  private async getUserMissionPreferences(userId: UserId): Promise<UserMissionPreferences> {
    // Get user's mission history
    const history = await db
      .select({
        templateId: missionHistory.templateId,
        completedAt: missionHistory.completedAt,
        timeToComplete: missionHistory.timeToComplete,
        template: missionTemplates
      })
      .from(missionHistory)
      .innerJoin(missionTemplates, eq(missionHistory.templateId, missionTemplates.id))
      .where(eq(missionHistory.userId, userId))
      .orderBy(desc(missionHistory.completedAt))
      .limit(100);
    
    // Calculate preferences
    const categoryCount: Record<string, number> = {};
    let totalTime = 0;
    let completedCount = history.length;
    
    history.forEach(h => {
      categoryCount[h.template.category] = (categoryCount[h.template.category] || 0) + 1;
      totalTime += h.timeToComplete || 0;
    });
    
    // Get favorite categories
    const favoriteCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category as MissionCategory);
    
    // Get streak info
    const [streak] = await db
      .select()
      .from(missionStreaks)
      .where(
        and(
          eq(missionStreaks.userId, userId),
          eq(missionStreaks.streakType, 'daily')
        )
      )
      .limit(1);
    
    // Get total assigned missions for completion rate
    const totalAssigned = await db
      .select({ count: sql<number>`count(*)` })
      .from(activeMissions)
      .where(eq(activeMissions.userId, userId));
    
    const completionRate = totalAssigned[0].count > 0 
      ? completedCount / totalAssigned[0].count 
      : 0.5;
    
    return {
      favoriteCategories,
      completionRate,
      averageCompletionTime: completedCount > 0 ? totalTime / completedCount : 3600,
      preferredDifficulty: completionRate > 0.7 ? 'hard' : completionRate > 0.4 ? 'medium' : 'easy',
      activeHours: [18, 19, 20, 21, 22], // TODO: Calculate from activity data
      streakDays: streak?.currentStreak || 0
    };
  }
  
  /**
   * Archive expired missions
   */
  private async archiveExpiredMissions(periodType: 'daily' | 'weekly'): Promise<void> {
    const now = new Date();
    
    // Get expired missions
    const expired = await db
      .select()
      .from(activeMissions)
      .where(
        and(
          eq(activeMissions.periodType, periodType),
          lte(activeMissions.periodEnd, now)
        )
      );
    
    // Delete expired missions (they should already be in history if completed)
    if (expired.length > 0) {
      await db
        .delete(activeMissions)
        .where(
          inArray(
            activeMissions.id,
            expired.map(m => m.id)
          )
        );
      
      logger.info(`Archived ${expired.length} expired ${periodType} missions`);
    }
  }
  
  /**
   * Update daily streaks
   */
  private async updateDailyStreaks(): Promise<void> {
    // Get users who completed at least one daily mission yesterday
    const yesterday = subDays(new Date(), 1);
    const startOfYesterday = startOfDay(yesterday);
    const endOfYesterday = endOfDay(yesterday);
    
    const completedYesterday = await db
      .select({
        userId: missionHistory.userId,
        count: sql<number>`count(*)`
      })
      .from(missionHistory)
      .where(
        and(
          eq(missionHistory.periodType, 'daily'),
          gte(missionHistory.completedAt, startOfYesterday),
          lte(missionHistory.completedAt, endOfYesterday)
        )
      )
      .groupBy(missionHistory.userId);
    
    // Update streaks
    for (const { userId } of completedYesterday) {
      await this.incrementStreak(userId as UserId, 'daily');
    }
    
    // Break streaks for users who didn't complete
    await this.breakInactiveStreaks('daily', completedYesterday.map(c => c.userId as UserId));
  }
  
  /**
   * Helper methods
   */
  
  private async getActiveUsers(daysActive: number): Promise<any[]> {
    const since = subDays(new Date(), daysActive);
    
    return await db
      .select()
      .from(users)
      .where(
        and(
          gte(users.lastActiveAt, since),
          eq(users.isActive, true)
        )
      );
  }
  
  private async getUserRecentMissions(userId: UserId, days: number): Promise<any[]> {
    const since = subDays(new Date(), days);
    
    return await db
      .select()
      .from(missionHistory)
      .innerJoin(missionTemplates, eq(missionHistory.templateId, missionTemplates.id))
      .where(
        and(
          eq(missionHistory.userId, userId),
          gte(missionHistory.completedAt, since)
        )
      );
  }
  
  private async getAvailableMissionPool(
    userId: UserId,
    periodType: 'daily' | 'weekly'
  ): Promise<MissionTemplate[]> {
    // This would integrate with missionCoreService.getApplicableTemplates
    // For now, return from config
    const templates = periodType === 'daily' ? dailyMissionTemplates : weeklyMissionTemplates;
    return templates as any[];
  }
  
  private randomMissionSelection(
    periodType: 'daily' | 'weekly',
    count: number
  ): MissionTemplate[] {
    const templates = periodType === 'daily' ? dailyMissionTemplates : weeklyMissionTemplates;
    const shuffled = [...templates].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count) as any[];
  }
  
  private isInTimeWindow(hour: number, window: { start: number; end: number }): boolean {
    if (window.start <= window.end) {
      return hour >= window.start && hour <= window.end;
    } else {
      return hour >= window.start || hour <= window.end;
    }
  }
  
  private async incrementStreak(userId: UserId, streakType: 'daily' | 'weekly'): Promise<void> {
    // Implementation would update missionStreaks table
    logger.info(`Incrementing ${streakType} streak for user ${userId}`);
  }
  
  private async breakInactiveStreaks(
    streakType: 'daily' | 'weekly',
    activeUserIds: UserId[]
  ): Promise<void> {
    await db
      .update(missionStreaks)
      .set({
        currentStreak: 0,
        streakBrokenAt: new Date()
      })
      .where(
        and(
          eq(missionStreaks.streakType, streakType),
          not(inArray(missionStreaks.userId, activeUserIds))
        )
      );
  }
  
  private async broadcastMissionReset(
    type: 'daily' | 'weekly',
    userCount: number
  ): Promise<void> {
    await this.wsService.broadcast({
      type: 'mission_reset',
      data: {
        resetType: type,
        timestamp: new Date(),
        affectedUsers: userCount
      }
    });
  }
  
  private async checkSpecialEvents(): Promise<void> {
    // Check for special event missions that should be activated
    logger.debug('Checking for special event missions...');
  }
  
  /**
   * Start the scheduler
   */
  start(): void {
    this.dailyResetJob.start();
    this.weeklyResetJob.start();
    this.specialEventJob.start();
    logger.info('Mission scheduler started');
  }
  
  /**
   * Stop the scheduler
   */
  stop(): void {
    this.dailyResetJob.stop();
    this.weeklyResetJob.stop();
    this.specialEventJob.stop();
    logger.info('Mission scheduler stopped');
  }
}

export const missionSchedulerService = new MissionSchedulerService();