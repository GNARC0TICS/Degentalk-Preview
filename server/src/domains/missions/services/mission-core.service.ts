import { db } from '@core/db';
import { logger } from '@core/logger';
import type { UserId, MissionId } from '@shared/types/ids';
import { 
  missionTemplates, 
  activeMissions, 
  missionProgress,
  missionHistory,
  missionStreaks,
  type MissionTemplate,
  type ActiveMission,
  type MissionCategory,
  type MissionType,
  type PeriodType
} from '@schema';
import { eq, and, gte, lte, inArray, sql, isNull } from 'drizzle-orm';
import { Redis } from '@core/redis';
import { addDays, addWeeks, startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';

export class MissionCoreService {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis({
      keyPrefix: 'missions:'
    });
  }
  
  /**
   * Get applicable mission templates for user
   */
  async getApplicableTemplates(
    userId: UserId,
    category?: MissionCategory,
    limit?: number
  ): Promise<MissionTemplate[]> {
    const user = await this.getUserProfile(userId);
    
    let query = db
      .select()
      .from(missionTemplates)
      .where(
        and(
          eq(missionTemplates.isActive, true),
          lte(missionTemplates.minLevel, user.level),
          isNull(missionTemplates.maxLevel).or(gte(missionTemplates.maxLevel, user.level))
        )
      );
    
    if (category) {
      query = query.where(eq(missionTemplates.category, category));
    }
    
    const templates = await query.limit(limit || 100);
    
    // Filter by prerequisites
    return this.filterByPrerequisites(templates, user);
  }
  
  /**
   * Assign daily missions to user
   */
  async assignDailyMissions(userId: UserId): Promise<ActiveMission[]> {
    const profile = await this.getUserProfile(userId);
    const pool = await this.getMissionPool(profile.level, profile.preferences, 'daily');
    
    // Smart selection based on user history
    const selected = await this.smartSelectMissions(pool, {
      userId,
      count: this.getDailyMissionCount(profile.level),
      period: 'daily',
      recentHistory: await this.getRecentMissionHistory(userId, 7),
      preferences: profile.preferences.missionTypes
    });
    
    // Create mission instances
    const periodStart = startOfDay(new Date());
    const periodEnd = endOfDay(new Date());
    
    const missions: ActiveMission[] = [];
    
    for (const template of selected) {
      const mission = await this.createMissionInstance(
        userId,
        template.id as MissionId,
        'daily',
        periodStart,
        periodEnd
      );
      missions.push(mission);
    }
    
    // Cache active missions
    await this.cacheActiveMissions(userId, missions);
    
    return missions;
  }
  
  /**
   * Assign weekly missions to user
   */
  async assignWeeklyMissions(userId: UserId): Promise<ActiveMission[]> {
    const profile = await this.getUserProfile(userId);
    const pool = await this.getMissionPool(profile.level, profile.preferences, 'weekly');
    
    const selected = await this.smartSelectMissions(pool, {
      userId,
      count: this.getWeeklyMissionCount(profile.level),
      period: 'weekly',
      recentHistory: await this.getRecentMissionHistory(userId, 30),
      preferences: profile.preferences.missionTypes
    });
    
    const periodStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const periodEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    
    const missions: ActiveMission[] = [];
    
    for (const template of selected) {
      const mission = await this.createMissionInstance(
        userId,
        template.id as MissionId,
        'weekly',
        periodStart,
        periodEnd
      );
      missions.push(mission);
    }
    
    await this.cacheActiveMissions(userId, missions);
    
    return missions;
  }
  
  /**
   * Create a mission instance for a user
   */
  private async createMissionInstance(
    userId: UserId,
    templateId: MissionId,
    periodType: PeriodType,
    periodStart: Date,
    periodEnd: Date
  ): Promise<ActiveMission> {
    const [mission] = await db
      .insert(activeMissions)
      .values({
        templateId,
        userId,
        periodType,
        periodStart,
        periodEnd,
        isFeatured: false
      })
      .returning();
    
    // Initialize progress tracking for each requirement
    const template = await this.getMissionTemplate(templateId);
    if (template?.requirements) {
      const progressEntries = Object.entries(template.requirements).map(([key, value]) => ({
        missionId: mission.id as MissionId,
        userId,
        requirementKey: key,
        currentValue: 0,
        targetValue: value as number
      }));
      
      if (progressEntries.length > 0) {
        await db.insert(missionProgress).values(progressEntries);
      }
    }
    
    return mission;
  }
  
  /**
   * Get user's active missions with progress
   */
  async getUserActiveMissions(userId: UserId): Promise<{
    daily: Array<ActiveMission & { template: MissionTemplate; progress: any }>;
    weekly: Array<ActiveMission & { template: MissionTemplate; progress: any }>;
    special: Array<ActiveMission & { template: MissionTemplate; progress: any }>;
  }> {
    // Try cache first
    const cached = await this.getCachedActiveMissions(userId);
    if (cached) return cached;
    
    const now = new Date();
    
    // Get all active missions for user
    const missions = await db
      .select({
        mission: activeMissions,
        template: missionTemplates
      })
      .from(activeMissions)
      .innerJoin(missionTemplates, eq(activeMissions.templateId, missionTemplates.id))
      .where(
        and(
          eq(activeMissions.userId, userId),
          lte(activeMissions.periodStart, now),
          gte(activeMissions.periodEnd, now),
          isNull(activeMissions.completedAt)
        )
      );
    
    // Get progress for each mission
    const missionIds = missions.map(m => m.mission.id);
    const progress = await db
      .select()
      .from(missionProgress)
      .where(inArray(missionProgress.missionId, missionIds));
    
    // Group progress by mission
    const progressByMission = progress.reduce((acc, p) => {
      if (!acc[p.missionId]) acc[p.missionId] = {};
      acc[p.missionId][p.requirementKey] = {
        current: p.currentValue,
        target: p.targetValue,
        percentage: Math.min(100, Math.round((p.currentValue / p.targetValue) * 100))
      };
      return acc;
    }, {} as Record<string, any>);
    
    // Organize by period type
    const organized = {
      daily: [] as any[],
      weekly: [] as any[],
      special: [] as any[]
    };
    
    missions.forEach(({ mission, template }) => {
      const missionWithProgress = {
        ...mission,
        template,
        progress: progressByMission[mission.id] || {},
        isComplete: this.checkMissionComplete(progressByMission[mission.id])
      };
      
      switch (mission.periodType) {
        case 'daily':
          organized.daily.push(missionWithProgress);
          break;
        case 'weekly':
          organized.weekly.push(missionWithProgress);
          break;
        case 'special':
        case 'perpetual':
          organized.special.push(missionWithProgress);
          break;
      }
    });
    
    // Cache the result
    await this.cacheActiveMissions(userId, organized);
    
    return organized;
  }
  
  /**
   * Update mission progress for user action
   */
  async updateProgress(
    userId: UserId,
    action: string,
    metadata: Record<string, any> = {}
  ): Promise<Array<{
    missionId: MissionId;
    completed: boolean;
    progress: Record<string, any>;
  }>> {
    // Get active missions that track this action
    const activeMissions = await this.getActiveMissionsForAction(userId, action);
    const updates: any[] = [];
    
    for (const mission of activeMissions) {
      // Check if action matches any requirement
      const requirementKeys = this.getMatchingRequirements(
        mission.template.requirements,
        action,
        metadata
      );
      
      for (const key of requirementKeys) {
        // Update progress in Redis first (fast path)
        const newValue = await this.incrementProgressCache(
          userId,
          mission.id as MissionId,
          key,
          metadata.amount || 1
        );
        
        // Check if requirement is met
        const target = mission.template.requirements[key] as number;
        const isComplete = newValue >= target;
        
        // Persist to database (async)
        this.persistProgressUpdate(mission.id as MissionId, key, newValue);
        
        // Check if entire mission is complete
        if (isComplete) {
          const missionComplete = await this.checkAndCompleteMission(
            userId,
            mission.id as MissionId
          );
          
          if (missionComplete) {
            updates.push({
              missionId: mission.id,
              completed: true,
              progress: await this.getMissionProgress(mission.id as MissionId)
            });
          }
        }
      }
    }
    
    return updates;
  }
  
  /**
   * Claim rewards for completed mission
   */
  async claimRewards(
    userId: UserId,
    missionId: MissionId
  ): Promise<{
    success: boolean;
    rewards?: Record<string, any>;
    error?: string;
  }> {
    return await db.transaction(async (tx) => {
      // Get mission with template
      const [result] = await tx
        .select({
          mission: activeMissions,
          template: missionTemplates
        })
        .from(activeMissions)
        .innerJoin(missionTemplates, eq(activeMissions.templateId, missionTemplates.id))
        .where(
          and(
            eq(activeMissions.id, missionId),
            eq(activeMissions.userId, userId)
          )
        )
        .limit(1);
      
      if (!result) {
        return { success: false, error: 'Mission not found' };
      }
      
      if (!result.mission.completedAt) {
        return { success: false, error: 'Mission not completed' };
      }
      
      if (result.mission.claimedAt) {
        return { success: false, error: 'Rewards already claimed' };
      }
      
      // Mark as claimed
      await tx
        .update(activeMissions)
        .set({ claimedAt: new Date() })
        .where(eq(activeMissions.id, missionId));
      
      // Process rewards (should integrate with XP, DGT, and item services)
      const rewards = result.template.rewards;
      
      // Archive to history
      await tx.insert(missionHistory).values({
        userId,
        templateId: result.template.id,
        completedAt: result.mission.completedAt,
        rewardsGranted: rewards,
        timeToComplete: Math.floor(
          (result.mission.completedAt.getTime() - result.mission.assignedAt.getTime()) / 1000
        ),
        periodType: result.mission.periodType
      });
      
      // Update streaks if applicable
      await this.updateStreaks(userId, result.mission.periodType as 'daily' | 'weekly');
      
      return { success: true, rewards };
    });
  }
  
  /**
   * Helper methods
   */
  
  private async getUserProfile(userId: UserId): Promise<any> {
    // This should integrate with user service
    // For now, return mock data
    return {
      id: userId,
      level: 10,
      xp: 5000,
      preferences: {
        missionTypes: ['social', 'content', 'trading']
      }
    };
  }
  
  private async getMissionTemplate(templateId: MissionId): Promise<MissionTemplate | null> {
    const [template] = await db
      .select()
      .from(missionTemplates)
      .where(eq(missionTemplates.id, templateId))
      .limit(1);
    
    return template || null;
  }
  
  private async filterByPrerequisites(
    templates: MissionTemplate[],
    user: any
  ): Promise<MissionTemplate[]> {
    return templates.filter(template => {
      if (!template.prerequisites) return true;
      
      // Check level prerequisite
      if (template.prerequisites.level && user.level < template.prerequisites.level) {
        return false;
      }
      
      // Check XP prerequisite
      if (template.prerequisites.xp && user.xp < template.prerequisites.xp) {
        return false;
      }
      
      // TODO: Check badges, completed missions, etc.
      
      return true;
    });
  }
  
  private getDailyMissionCount(level: number): number {
    if (level < 10) return 3;
    if (level < 25) return 4;
    return 5;
  }
  
  private getWeeklyMissionCount(level: number): number {
    if (level < 20) return 2;
    return 3;
  }
  
  private checkMissionComplete(progress: Record<string, any>): boolean {
    if (!progress) return false;
    return Object.values(progress).every(p => p.current >= p.target);
  }
  
  private async cacheActiveMissions(userId: UserId, missions: any): Promise<void> {
    const key = `active:${userId}`;
    await this.redis.setex(key, 300, JSON.stringify(missions)); // 5 min cache
  }
  
  private async getCachedActiveMissions(userId: UserId): Promise<any> {
    const key = `active:${userId}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  private async incrementProgressCache(
    userId: UserId,
    missionId: MissionId,
    requirementKey: string,
    amount: number
  ): Promise<number> {
    const key = `progress:${userId}:${missionId}:${requirementKey}`;
    return await this.redis.incrby(key, amount);
  }
  
  private async persistProgressUpdate(
    missionId: MissionId,
    requirementKey: string,
    newValue: number
  ): Promise<void> {
    await db
      .update(missionProgress)
      .set({
        currentValue: newValue,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(missionProgress.missionId, missionId),
          eq(missionProgress.requirementKey, requirementKey)
        )
      );
  }
  
  private async updateStreaks(
    userId: UserId,
    streakType: 'daily' | 'weekly'
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    const [streak] = await db
      .select()
      .from(missionStreaks)
      .where(
        and(
          eq(missionStreaks.userId, userId),
          eq(missionStreaks.streakType, streakType)
        )
      )
      .limit(1);
    
    if (!streak) {
      // Create new streak
      await db.insert(missionStreaks).values({
        userId,
        streakType,
        currentStreak: 1,
        bestStreak: 1,
        lastCompleted: today
      });
    } else {
      // Update existing streak
      const isConsecutive = this.isStreakConsecutive(
        streak.lastCompleted,
        streakType
      );
      
      const newStreak = isConsecutive ? streak.currentStreak + 1 : 1;
      const bestStreak = Math.max(newStreak, streak.bestStreak);
      
      await db
        .update(missionStreaks)
        .set({
          currentStreak: newStreak,
          bestStreak,
          lastCompleted: today,
          streakBrokenAt: isConsecutive ? null : new Date()
        })
        .where(
          and(
            eq(missionStreaks.userId, userId),
            eq(missionStreaks.streakType, streakType)
          )
        );
    }
  }
  
  private isStreakConsecutive(
    lastCompleted: string | null,
    streakType: 'daily' | 'weekly'
  ): boolean {
    if (!lastCompleted) return false;
    
    const last = new Date(lastCompleted);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    
    if (streakType === 'daily') {
      return daysDiff === 1;
    } else {
      // Weekly: check if it's the next week
      return daysDiff >= 7 && daysDiff < 14;
    }
  }
  
  // Additional helper methods would go here...
}

export const missionCoreService = new MissionCoreService();