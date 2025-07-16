import { db } from '@core/db';
import { logger } from '@core/logger';
import type { UserId, MissionId } from '@shared/types/ids';
import { missionProgress, activeMissions, missionTemplates } from '@schema';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { EventEmitter } from 'events';
import { Redis } from '@core/redis';
import { WebSocketService } from '@core/websocket.service';

interface MissionEvent {
  userId: UserId;
  action: string;
  metadata: {
    amount?: number;
    targetId?: string;
    forumId?: string;
    quality?: {
      length?: number;
      hasMedia?: boolean;
      reactions?: number;
    };
    [key: string]: any;
  };
  timestamp: Date;
}

interface ProgressUpdate {
  missionId: MissionId;
  requirementKey: string;
  previousValue: number;
  currentValue: number;
  targetValue: number;
  percentage: number;
  isComplete: boolean;
}

export class MissionProgressService extends EventEmitter {
  private redis: Redis;
  private wsService: WebSocketService;
  
  // Action mapping to requirement keys
  private actionMap: Record<string, string[]> = {
    'create_post': ['posts_created'],
    'create_thread': ['threads_created'],
    'give_reaction': ['reactions_given'],
    'receive_reaction': ['reactions_received'],
    'send_tip': ['tips_sent', 'dgt_spent_tips'],
    'receive_tip': ['tips_received', 'dgt_earned_tips'],
    'login': ['daily_logins'],
    'complete_profile': ['profile_completed'],
    'upload_avatar': ['avatar_uploaded'],
    'follow_user': ['users_followed'],
    'gain_follower': ['followers_gained'],
    'create_whisper': ['whispers_sent'],
    'participate_rain': ['rain_events'],
    'win_contest': ['contests_won'],
    'earn_badge': ['badges_earned'],
    'reach_level': ['level_reached'],
    'forum_post': ['unique_forums_posted']
  };
  
  constructor() {
    super();
    this.redis = new Redis({ keyPrefix: 'mission:progress:' });
    this.wsService = new WebSocketService();
    this.setupEventListeners();
  }
  
  /**
   * Track an action and update relevant mission progress
   */
  async trackAction(event: MissionEvent): Promise<ProgressUpdate[]> {
    try {
      // Get user's active missions
      const activeMissions = await this.getActiveMissionsForUser(event.userId);
      
      // Filter missions that track this action
      const relevantMissions = this.filterRelevantMissions(activeMissions, event.action);
      
      if (relevantMissions.length === 0) {
        return [];
      }
      
      // Update progress for each relevant mission
      const updates: ProgressUpdate[] = [];
      
      for (const mission of relevantMissions) {
        const missionUpdates = await this.updateMissionProgress(mission, event);
        updates.push(...missionUpdates);
      }
      
      // Check for completions
      const completedMissions = updates
        .filter(u => u.isComplete)
        .map(u => u.missionId)
        .filter((id, index, self) => self.indexOf(id) === index); // unique
      
      if (completedMissions.length > 0) {
        await this.markMissionsComplete(completedMissions);
        this.emit('missions:completed', { userId: event.userId, missionIds: completedMissions });
      }
      
      // Broadcast progress updates via WebSocket
      if (updates.length > 0) {
        await this.broadcastProgressUpdates(event.userId, updates);
      }
      
      return updates;
    } catch (error) {
      logger.error('Error tracking mission action:', error);
      return [];
    }
  }
  
  /**
   * Get active missions for a user
   */
  private async getActiveMissionsForUser(userId: UserId): Promise<any[]> {
    const cacheKey = `active:${userId}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const now = new Date();
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
          sql`${activeMissions.periodEnd} >= ${now}`,
          sql`${activeMissions.completedAt} IS NULL`
        )
      );
    
    // Cache for 5 minutes
    await this.redis.setex(cacheKey, 300, JSON.stringify(missions));
    
    return missions;
  }
  
  /**
   * Filter missions that care about this action
   */
  private filterRelevantMissions(missions: any[], action: string): any[] {
    const requirementKeys = this.actionMap[action] || [];
    
    return missions.filter(({ template }) => {
      if (!template.requirements) return false;
      
      // Check if any requirement key matches
      return requirementKeys.some(key => key in template.requirements);
    });
  }
  
  /**
   * Update progress for a specific mission
   */
  private async updateMissionProgress(
    mission: any,
    event: MissionEvent
  ): Promise<ProgressUpdate[]> {
    const updates: ProgressUpdate[] = [];
    const requirementKeys = this.actionMap[event.action] || [];
    
    for (const key of requirementKeys) {
      if (!(key in mission.template.requirements)) continue;
      
      // Get current progress
      const progress = await this.getOrCreateProgress(
        mission.mission.id,
        event.userId,
        key,
        mission.template.requirements[key]
      );
      
      // Calculate increment based on event metadata
      const increment = this.calculateIncrement(key, event.metadata);
      
      // Update in Redis for fast access
      const newValue = await this.incrementRedisProgress(
        event.userId,
        mission.mission.id,
        key,
        increment
      );
      
      // Prepare update object
      const update: ProgressUpdate = {
        missionId: mission.mission.id,
        requirementKey: key,
        previousValue: progress.currentValue,
        currentValue: Math.min(newValue, progress.targetValue),
        targetValue: progress.targetValue,
        percentage: Math.min(100, Math.round((newValue / progress.targetValue) * 100)),
        isComplete: newValue >= progress.targetValue
      };
      
      updates.push(update);
      
      // Persist to database (can be done async)
      this.persistProgress(mission.mission.id, key, update.currentValue);
    }
    
    return updates;
  }
  
  /**
   * Get or create progress record
   */
  private async getOrCreateProgress(
    missionId: MissionId,
    userId: UserId,
    requirementKey: string,
    targetValue: number
  ): Promise<any> {
    const [existing] = await db
      .select()
      .from(missionProgress)
      .where(
        and(
          eq(missionProgress.missionId, missionId),
          eq(missionProgress.requirementKey, requirementKey)
        )
      )
      .limit(1);
    
    if (existing) {
      return existing;
    }
    
    // Create new progress record
    const [created] = await db
      .insert(missionProgress)
      .values({
        missionId,
        userId,
        requirementKey,
        currentValue: 0,
        targetValue
      })
      .returning();
    
    return created;
  }
  
  /**
   * Calculate increment amount based on action and metadata
   */
  private calculateIncrement(requirementKey: string, metadata: any): number {
    // Special handling for certain requirements
    switch (requirementKey) {
      case 'dgt_spent_tips':
      case 'dgt_earned_tips':
        return metadata.amount || 0;
      
      case 'unique_forums_posted':
        // This requires special handling to track uniqueness
        return metadata.isNewForum ? 1 : 0;
      
      case 'min_post_length':
        // Check if post meets minimum length
        return (metadata.quality?.length || 0) >= 100 ? 1 : 0;
      
      default:
        return 1;
    }
  }
  
  /**
   * Increment progress in Redis
   */
  private async incrementRedisProgress(
    userId: UserId,
    missionId: MissionId,
    requirementKey: string,
    amount: number
  ): Promise<number> {
    const key = `${userId}:${missionId}:${requirementKey}`;
    const newValue = await this.redis.incrby(key, amount);
    
    // Set expiry to mission end time
    await this.redis.expire(key, 86400 * 7); // 7 days max
    
    return newValue;
  }
  
  /**
   * Persist progress to database
   */
  private async persistProgress(
    missionId: MissionId,
    requirementKey: string,
    currentValue: number
  ): Promise<void> {
    await db
      .update(missionProgress)
      .set({
        currentValue,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(missionProgress.missionId, missionId),
          eq(missionProgress.requirementKey, requirementKey)
        )
      );
  }
  
  /**
   * Mark missions as complete
   */
  private async markMissionsComplete(missionIds: MissionId[]): Promise<void> {
    await db
      .update(activeMissions)
      .set({
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(inArray(activeMissions.id, missionIds));
  }
  
  /**
   * Broadcast progress updates via WebSocket
   */
  private async broadcastProgressUpdates(
    userId: UserId,
    updates: ProgressUpdate[]
  ): Promise<void> {
    const message = {
      type: 'mission_progress',
      userId,
      updates,
      timestamp: new Date()
    };
    
    // Send to user's personal channel
    await this.wsService.sendToUser(userId, message);
    
    // Also emit event for other services
    this.emit('progress:updated', { userId, updates });
  }
  
  /**
   * Setup event listeners for various actions
   */
  private setupEventListeners(): void {
    // These would integrate with other services
    const events = [
      'post:created',
      'thread:created',
      'reaction:given',
      'tip:sent',
      'user:login',
      'profile:updated',
      'user:followed',
      'whisper:sent',
      'rain:participated',
      'level:reached'
    ];
    
    // In a real implementation, these would listen to actual service events
    logger.info('Mission progress service initialized with event listeners');
  }
  
  /**
   * Get mission progress for a user
   */
  async getMissionProgress(
    userId: UserId,
    missionId: MissionId
  ): Promise<Record<string, any>> {
    const progress = await db
      .select()
      .from(missionProgress)
      .where(
        and(
          eq(missionProgress.userId, userId),
          eq(missionProgress.missionId, missionId)
        )
      );
    
    return progress.reduce((acc, p) => {
      acc[p.requirementKey] = {
        current: p.currentValue,
        target: p.targetValue,
        percentage: Math.min(100, Math.round((p.currentValue / p.targetValue) * 100))
      };
      return acc;
    }, {} as Record<string, any>);
  }
  
  /**
   * Reset progress for expired missions
   */
  async resetExpiredMissions(): Promise<void> {
    const now = new Date();
    
    // Get expired missions
    const expired = await db
      .select()
      .from(activeMissions)
      .where(
        and(
          sql`${activeMissions.periodEnd} < ${now}`,
          sql`${activeMissions.completedAt} IS NULL`
        )
      );
    
    if (expired.length === 0) return;
    
    const missionIds = expired.map(m => m.id);
    
    // Delete progress records
    await db
      .delete(missionProgress)
      .where(inArray(missionProgress.missionId, missionIds));
    
    // Delete missions
    await db
      .delete(activeMissions)
      .where(inArray(activeMissions.id, missionIds));
    
    // Clear Redis cache
    for (const mission of expired) {
      const pattern = `*:${mission.id}:*`;
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    }
    
    logger.info(`Reset ${expired.length} expired missions`);
  }
}

export const missionProgressService = new MissionProgressService();