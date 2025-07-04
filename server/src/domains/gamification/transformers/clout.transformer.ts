/**
 * Clout Transformer - Security-First Implementation
 * 
 * Transforms raw database clout records into role-appropriate
 * response objects with GDPR compliance and admin data protection.
 */

import type { 
  UserId,
  AchievementId,
  CloutAmount 
} from '@shared/types';
import { UserTransformer } from '../../users/transformers/user.transformer';

// Public clout data (leaderboards, etc.)
export interface PublicCloutAchievement {
  id: AchievementId;
  name: string;
  description?: string;
  iconUrl?: string;
  cloutReward: CloutAmount;
  isEnabled: boolean;
}

// Authenticated user viewing achievements
export interface AuthenticatedCloutAchievement extends PublicCloutAchievement {
  // User progress tracking
  userProgress?: {
    isCompleted: boolean;
    progress: number;
    maxProgress: number;
    completedAt?: string;
  };
  
  // Display criteria (sanitized)
  criteria: {
    type: string;
    description: string;
    target: number;
  };
}

// Admin view with full management data
export interface AdminCloutAchievement extends AuthenticatedCloutAchievement {
  // System fields
  achievementKey: string;
  criteriaType?: string;
  criteriaValue?: number;
  
  // Admin metadata
  createdAt: string;
  adminNotes?: string;
  
  // Usage statistics
  stats: {
    totalCompletions: number;
    completionRate: number;
    avgTimeToComplete?: number;
    lastAwarded?: string;
  };
}

// Clout log entries for different views
export interface PublicCloutLog {
  id: string;
  amount: CloutAmount;
  reason: string;
  timestamp: string;
  
  // Public user info (if enabled by user)
  user?: {
    id: UserId;
    username: string;
    avatarUrl?: string;
    level: number;
  };
}

export interface AuthenticatedCloutLog extends PublicCloutLog {
  // Enhanced context for own logs
  source: 'achievement' | 'admin_grant' | 'event' | 'system';
  achievement?: {
    id: AchievementId;
    name: string;
    iconUrl?: string;
  };
}

export interface AdminCloutLog extends AuthenticatedCloutLog {
  // Full admin data
  systemData: {
    userId: UserId;
    achievementId?: AchievementId;
    adminId?: UserId;
    ipHash?: string; // Anonymized
  };
  
  // Admin metadata
  reviewedBy?: UserId;
  flagged: boolean;
  flagReason?: string;
}

export class CloutTransformer {
  
  /**
   * Transform achievement for public consumption
   * Only shows basic achievement info for leaderboards/public displays
   */
  static toPublicAchievement(dbAchievement: any): PublicCloutAchievement {
    if (!dbAchievement) {
      throw new Error('Invalid achievement data provided to transformer');
    }

    return {
      id: dbAchievement.id as AchievementId,
      name: dbAchievement.name,
      description: this.sanitizeDescription(dbAchievement.description),
      iconUrl: dbAchievement.iconUrl || undefined,
      cloutReward: this.sanitizeCloutAmount(dbAchievement.cloutReward),
      isEnabled: dbAchievement.enabled === true
    };
  }

  /**
   * Transform achievement for authenticated users
   * Includes user progress and sanitized criteria
   */
  static toAuthenticatedAchievement(dbAchievement: any, requestingUser: any, userProgress?: any): AuthenticatedCloutAchievement {
    const publicData = this.toPublicAchievement(dbAchievement);
    
    return {
      ...publicData,
      
      // User progress (if available)
      userProgress: userProgress ? {
        isCompleted: userProgress.isCompleted === true,
        progress: userProgress.progress || 0,
        maxProgress: userProgress.maxProgress || dbAchievement.criteriaValue || 1,
        completedAt: userProgress.completedAt?.toISOString()
      } : undefined,
      
      // Sanitized criteria
      criteria: {
        type: this.normalizeCriteriaType(dbAchievement.criteriaType),
        description: this.generateCriteriaDescription(dbAchievement),
        target: dbAchievement.criteriaValue || 0
      }
    };
  }

  /**
   * Transform achievement for admin view
   * Includes all system data and usage statistics
   */
  static toAdminAchievement(dbAchievement: any, stats?: any): AdminCloutAchievement {
    // Get authenticated data with admin permissions
    const authenticatedData = this.toAuthenticatedAchievement(dbAchievement, { role: 'admin' });
    
    return {
      ...authenticatedData,
      
      // System fields
      achievementKey: dbAchievement.achievementKey,
      criteriaType: dbAchievement.criteriaType,
      criteriaValue: dbAchievement.criteriaValue,
      
      // Admin metadata
      createdAt: dbAchievement.createdAt.toISOString(),
      adminNotes: dbAchievement.adminNotes,
      
      // Usage statistics
      stats: {
        totalCompletions: stats?.totalCompletions || 0,
        completionRate: this.calculateCompletionRate(stats),
        avgTimeToComplete: stats?.avgTimeToComplete,
        lastAwarded: stats?.lastAwarded?.toISOString()
      }
    };
  }

  /**
   * Transform clout log for public consumption
   * Only shows basic info for public activity feeds
   */
  static toPublicCloutLog(dbLog: any): PublicCloutLog {
    return {
      id: dbLog.id,
      amount: this.sanitizeCloutAmount(dbLog.cloutEarned),
      reason: this.sanitizeReason(dbLog.reason, 'public'),
      timestamp: dbLog.createdAt.toISOString(),
      
      // Public user info (if enabled)
      user: dbLog.user ? {
        id: dbLog.user.id as UserId,
        username: dbLog.user.username || '[deleted]',
        avatarUrl: dbLog.user.avatarUrl,
        level: this.calculateLevel(dbLog.user.xp || 0)
      } : undefined
    };
  }

  /**
   * Transform clout log for authenticated users viewing their own logs
   */
  static toAuthenticatedCloutLog(dbLog: any, requestingUser: any): AuthenticatedCloutLog {
    const publicData = this.toPublicCloutLog(dbLog);
    
    return {
      ...publicData,
      
      // Enhanced source identification
      source: this.identifyLogSource(dbLog),
      
      // Achievement context (if applicable)
      achievement: dbLog.achievement ? {
        id: dbLog.achievement.id as AchievementId,
        name: dbLog.achievement.name,
        iconUrl: dbLog.achievement.iconUrl
      } : undefined
    };
  }

  /**
   * Transform clout log for admin view
   * Includes all system data and moderation info
   */
  static toAdminCloutLog(dbLog: any): AdminCloutLog {
    // Get authenticated data with admin permissions
    const authenticatedData = this.toAuthenticatedCloutLog(dbLog, { role: 'admin' });
    
    return {
      ...authenticatedData,
      
      // System tracking
      systemData: {
        userId: dbLog.userId as UserId,
        achievementId: dbLog.achievementId as AchievementId,
        adminId: dbLog.adminId as UserId,
        ipHash: this.anonymizeIP(dbLog.ipAddress)
      },
      
      // Admin metadata
      reviewedBy: dbLog.reviewedBy as UserId,
      flagged: dbLog.flagged === true,
      flagReason: dbLog.flagReason
    };
  }

  /**
   * Transform multiple achievements for list views
   */
  static toAchievementList(achievements: any[], requestingUser: any, viewType: 'public' | 'authenticated' | 'admin' = 'public') {
    switch (viewType) {
      case 'admin':
        return achievements.map(achievement => this.toAdminAchievement(achievement));
      case 'authenticated':
        return achievements.map(achievement => this.toAuthenticatedAchievement(achievement, requestingUser));
      default:
        return achievements.map(achievement => this.toPublicAchievement(achievement));
    }
  }

  /**
   * Transform clout logs with pagination and summary
   */
  static toCloutLogHistory(logs: any[], requestingUser: any, viewType: 'public' | 'authenticated' | 'admin' = 'public') {
    let transformedLogs;
    
    switch (viewType) {
      case 'admin':
        transformedLogs = logs.map(log => this.toAdminCloutLog(log));
        break;
      case 'authenticated':
        transformedLogs = logs.map(log => this.toAuthenticatedCloutLog(log, requestingUser));
        break;
      default:
        transformedLogs = logs.map(log => this.toPublicCloutLog(log));
    }

    return {
      logs: transformedLogs,
      summary: this.calculateLogSummary(logs, requestingUser)
    };
  }

  // ==========================================
  // PRIVATE UTILITY METHODS
  // ==========================================

  private static sanitizeCloutAmount(amount: any): CloutAmount {
    const parsed = parseInt(amount?.toString() || '0', 10);
    return (isNaN(parsed) ? 0 : Math.max(0, parsed)) as CloutAmount;
  }

  private static sanitizeDescription(description: string): string {
    if (!description) return '';
    return description.trim().substring(0, 200); // Limit length for security
  }

  private static sanitizeReason(reason: string, level: 'public' | 'authenticated'): string {
    if (!reason) return 'Achievement earned';
    
    if (level === 'public') {
      // More aggressive sanitization for public view
      return reason.replace(/admin|internal|system/gi, '').trim() || 'Achievement earned';
    }
    
    return reason.trim();
  }

  private static normalizeCriteriaType(criteriaType: string): string {
    const typeMap: Record<string, string> = {
      'posts_created': 'Create Posts',
      'likes_received': 'Receive Likes',
      'threads_created': 'Create Threads',
      'days_active': 'Active Days',
      'dgt_earned': 'Earn DGT',
      'tips_given': 'Give Tips'
    };
    
    return typeMap[criteriaType] || 'Complete Action';
  }

  private static generateCriteriaDescription(achievement: any): string {
    const { criteriaType, criteriaValue } = achievement;
    
    switch (criteriaType) {
      case 'posts_created':
        return `Create ${criteriaValue} posts`;
      case 'likes_received':
        return `Receive ${criteriaValue} likes`;
      case 'threads_created':
        return `Start ${criteriaValue} threads`;
      case 'days_active':
        return `Be active for ${criteriaValue} days`;
      case 'dgt_earned':
        return `Earn ${criteriaValue} DGT`;
      case 'tips_given':
        return `Give ${criteriaValue} tips`;
      default:
        return achievement.description || 'Complete the required action';
    }
  }

  private static identifyLogSource(dbLog: any): 'achievement' | 'admin_grant' | 'event' | 'system' {
    if (dbLog.achievementId) return 'achievement';
    if (dbLog.reason?.includes('Admin')) return 'admin_grant';
    if (dbLog.reason?.includes('Event') || dbLog.reason?.includes('Rain')) return 'event';
    return 'system';
  }

  private static calculateLevel(xp: number): number {
    // Basic level calculation - replace with actual level system
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  private static calculateCompletionRate(stats: any): number {
    if (!stats || !stats.totalUsers) return 0;
    return Math.round((stats.totalCompletions / stats.totalUsers) * 100);
  }

  private static calculateLogSummary(logs: any[], user: any) {
    const totalClout = logs.reduce((sum, log) => sum + (log.cloutEarned || 0), 0);
    const achievementLogs = logs.filter(log => log.achievementId);
    const adminLogs = logs.filter(log => log.reason?.includes('Admin'));
    
    return {
      totalClout,
      totalEntries: logs.length,
      fromAchievements: achievementLogs.length,
      fromAdminGrants: adminLogs.length,
      fromEvents: logs.length - achievementLogs.length - adminLogs.length
    };
  }

  private static anonymizeIP(ip?: string): string {
    if (!ip) return 'unknown';
    
    if (ip.includes(':')) {
      // IPv6
      const parts = ip.split(':');
      return parts.slice(0, 4).join(':') + '::***';
    } else {
      // IPv4
      const parts = ip.split('.');
      return parts.slice(0, 3).join('.') + '.***';
    }
  }
}