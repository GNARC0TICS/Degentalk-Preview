/**
 * Mission Action Dispatcher
 * 
 * Central hub for tracking user actions and updating mission progress
 * Integrates with all platform features to create a cohesive mission system
 */

import { EventEmitter } from 'events';
import { logger } from '@core/logger';
import type { UserId } from '@shared/types/ids';
import { missionProgressService } from '../services/mission-progress.service';

export interface MissionAction {
  userId: UserId;
  action: string;
  metadata: {
    amount?: number;
    targetId?: string;
    forumId?: string;
    threadId?: string;
    postId?: string;
    recipientId?: string;
    quality?: {
      length?: number;
      wordCount?: number;
      hasMedia?: boolean;
      mediaCount?: number;
      reactions?: number;
    };
    context?: {
      timeOfDay?: number;
      dayOfWeek?: number;
      isFirstTime?: boolean;
      consecutiveDays?: number;
    };
    [key: string]: any;
  };
  timestamp: Date;
}

class MissionActionDispatcher extends EventEmitter {
  private actionQueue: MissionAction[] = [];
  private processing = false;
  private batchTimeout: NodeJS.Timeout | null = null;
  
  constructor() {
    super();
    this.setupActionHandlers();
  }
  
  /**
   * Track a user action for mission progress
   */
  async trackAction(action: MissionAction): Promise<void> {
    try {
      // Add to queue for batch processing
      this.actionQueue.push(action);
      
      // Process immediately for time-sensitive actions
      const timeSensitiveActions = ['daily_login', 'streak_maintain'];
      if (timeSensitiveActions.includes(action.action)) {
        await this.processQueue();
      } else {
        // Otherwise batch process after 100ms
        this.scheduleBatchProcess();
      }
    } catch (error) {
      logger.error('Error tracking mission action:', error);
    }
  }
  
  /**
   * Schedule batch processing of queued actions
   */
  private scheduleBatchProcess(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }
    
    this.batchTimeout = setTimeout(() => {
      this.processQueue();
    }, 100);
  }
  
  /**
   * Process queued actions
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.actionQueue.length === 0) {
      return;
    }
    
    this.processing = true;
    const actions = [...this.actionQueue];
    this.actionQueue = [];
    
    try {
      // Group actions by user for efficient processing
      const actionsByUser = this.groupActionsByUser(actions);
      
      // Process each user's actions
      for (const [userId, userActions] of actionsByUser) {
        await this.processUserActions(userId, userActions);
      }
    } catch (error) {
      logger.error('Error processing action queue:', error);
    } finally {
      this.processing = false;
    }
  }
  
  /**
   * Group actions by user
   */
  private groupActionsByUser(actions: MissionAction[]): Map<UserId, MissionAction[]> {
    const grouped = new Map<UserId, MissionAction[]>();
    
    for (const action of actions) {
      const userActions = grouped.get(action.userId) || [];
      userActions.push(action);
      grouped.set(action.userId, userActions);
    }
    
    return grouped;
  }
  
  /**
   * Process actions for a specific user
   */
  private async processUserActions(userId: UserId, actions: MissionAction[]): Promise<void> {
    try {
      // Process each action
      for (const action of actions) {
        const updates = await missionProgressService.trackAction(action);
        
        // Emit events for completed missions
        const completed = updates.filter(u => u.isComplete);
        if (completed.length > 0) {
          this.emit('missions:completed', {
            userId,
            completedMissions: completed.map(u => u.missionId)
          });
        }
      }
    } catch (error) {
      logger.error(`Error processing actions for user ${userId}:`, error);
    }
  }
  
  /**
   * Setup action handlers for various platform events
   */
  private setupActionHandlers(): void {
    // === FORUM ACTIONS ===
    this.on('forum:post:created', async (data: any) => {
      await this.trackAction({
        userId: data.userId,
        action: 'create_post',
        metadata: {
          postId: data.postId,
          threadId: data.threadId,
          forumId: data.forumId,
          quality: {
            length: data.content?.length || 0,
            wordCount: this.countWords(data.content || ''),
            hasMedia: data.hasMedia || false,
            mediaCount: data.mediaCount || 0
          },
          context: {
            timeOfDay: new Date().getHours(),
            dayOfWeek: new Date().getDay()
          }
        },
        timestamp: new Date()
      });
    });
    
    this.on('forum:thread:created', async (data: any) => {
      await this.trackAction({
        userId: data.userId,
        action: 'create_thread',
        metadata: {
          threadId: data.threadId,
          forumId: data.forumId,
          quality: {
            length: data.content?.length || 0,
            wordCount: this.countWords(data.content || ''),
            hasMedia: data.hasMedia || false
          }
        },
        timestamp: new Date()
      });
    });
    
    // === SOCIAL ACTIONS ===
    this.on('reaction:given', async (data: any) => {
      await this.trackAction({
        userId: data.userId,
        action: 'give_reaction',
        metadata: {
          targetId: data.targetId,
          recipientId: data.recipientId,
          reactionType: data.reactionType
        },
        timestamp: new Date()
      });
    });
    
    this.on('reaction:received', async (data: any) => {
      await this.trackAction({
        userId: data.recipientId,
        action: 'receive_reaction',
        metadata: {
          targetId: data.targetId,
          fromUserId: data.userId,
          reactionType: data.reactionType
        },
        timestamp: new Date()
      });
    });
    
    this.on('user:followed', async (data: any) => {
      await this.trackAction({
        userId: data.followerId,
        action: 'follow_user',
        metadata: {
          targetId: data.followedId
        },
        timestamp: new Date()
      });
      
      await this.trackAction({
        userId: data.followedId,
        action: 'gain_follower',
        metadata: {
          followerId: data.followerId
        },
        timestamp: new Date()
      });
    });
    
    // === ECONOMIC ACTIONS ===
    this.on('tip:sent', async (data: any) => {
      await this.trackAction({
        userId: data.senderId,
        action: 'send_tip',
        metadata: {
          amount: data.amount,
          recipientId: data.recipientId,
          targetId: data.targetId,
          reason: data.reason
        },
        timestamp: new Date()
      });
    });
    
    this.on('tip:received', async (data: any) => {
      await this.trackAction({
        userId: data.recipientId,
        action: 'receive_tip',
        metadata: {
          amount: data.amount,
          senderId: data.senderId,
          targetId: data.targetId,
          reason: data.reason
        },
        timestamp: new Date()
      });
    });
    
    this.on('rain:created', async (data: any) => {
      await this.trackAction({
        userId: data.creatorId,
        action: 'create_rain',
        metadata: {
          amount: data.totalAmount,
          recipientCount: data.recipients.length,
          channel: data.channel
        },
        timestamp: new Date()
      });
      
      // Track participation for recipients
      for (const recipientId of data.recipients) {
        await this.trackAction({
          userId: recipientId,
          action: 'participate_rain',
          metadata: {
            amount: data.amountPerUser,
            creatorId: data.creatorId,
            channel: data.channel
          },
          timestamp: new Date()
        });
      }
    });
    
    // === MESSAGING ACTIONS ===
    this.on('whisper:sent', async (data: any) => {
      await this.trackAction({
        userId: data.senderId,
        action: 'create_whisper',
        metadata: {
          recipientId: data.recipientId,
          messageLength: data.content?.length || 0
        },
        timestamp: new Date()
      });
    });
    
    this.on('shoutbox:message', async (data: any) => {
      await this.trackAction({
        userId: data.userId,
        action: 'shoutbox_message',
        metadata: {
          channel: data.channel,
          messageLength: data.content?.length || 0
        },
        timestamp: new Date()
      });
    });
    
    // === AUTHENTICATION ACTIONS ===
    this.on('user:login', async (data: any) => {
      await this.trackAction({
        userId: data.userId,
        action: 'login',
        metadata: {
          context: {
            isFirstTime: data.isFirstLogin || false,
            consecutiveDays: data.consecutiveDays || 1,
            timeOfDay: new Date().getHours()
          }
        },
        timestamp: new Date()
      });
    });
    
    // === PROFILE ACTIONS ===
    this.on('profile:completed', async (data: any) => {
      await this.trackAction({
        userId: data.userId,
        action: 'complete_profile',
        metadata: {
          fieldsCompleted: data.fieldsCompleted,
          completionPercentage: data.completionPercentage
        },
        timestamp: new Date()
      });
    });
    
    this.on('avatar:uploaded', async (data: any) => {
      await this.trackAction({
        userId: data.userId,
        action: 'upload_avatar',
        metadata: {
          isFirstUpload: data.isFirstUpload || false
        },
        timestamp: new Date()
      });
    });
    
    // === ACHIEVEMENT ACTIONS ===
    this.on('badge:earned', async (data: any) => {
      await this.trackAction({
        userId: data.userId,
        action: 'earn_badge',
        metadata: {
          badgeId: data.badgeId,
          badgeName: data.badgeName,
          rarity: data.rarity
        },
        timestamp: new Date()
      });
    });
    
    this.on('level:reached', async (data: any) => {
      await this.trackAction({
        userId: data.userId,
        action: 'reach_level',
        metadata: {
          newLevel: data.newLevel,
          previousLevel: data.previousLevel,
          totalXp: data.totalXp
        },
        timestamp: new Date()
      });
    });
    
    // === SHOP ACTIONS ===
    this.on('shop:purchase', async (data: any) => {
      await this.trackAction({
        userId: data.userId,
        action: 'shop_purchase',
        metadata: {
          itemId: data.itemId,
          itemType: data.itemType,
          dgtSpent: data.price
        },
        timestamp: new Date()
      });
    });
    
    // === CONTEST ACTIONS ===
    this.on('contest:won', async (data: any) => {
      await this.trackAction({
        userId: data.userId,
        action: 'win_contest',
        metadata: {
          contestId: data.contestId,
          contestType: data.contestType,
          placement: data.placement,
          reward: data.reward
        },
        timestamp: new Date()
      });
    });
  }
  
  /**
   * Utility to count words in text
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
  
  /**
   * Check if action occurs in time window
   */
  private isInTimeWindow(hour: number, window: { start: number; end: number }): boolean {
    if (window.start <= window.end) {
      // Normal window (e.g., 9-17)
      return hour >= window.start && hour <= window.end;
    } else {
      // Overnight window (e.g., 22-4)
      return hour >= window.start || hour <= window.end;
    }
  }
}

// Export singleton instance
export const missionActionDispatcher = new MissionActionDispatcher();