/**
 * Centralized Cache Invalidation Control
 * 
 * Tech Debt Control: Systematic cache invalidation prevents stale data
 * All services use these functions for consistent invalidation patterns
 */

import { redisCacheService } from './redis.service';
import { cacheKeys, cachePatterns } from './getCacheKey';
import { isCachingEnabled } from './cache.config';
import { logger } from '@core/logger';
import type { UserId, ForumId, ThreadId, PostId } from '@shared/types/ids';

/**
 * Cache invalidation tracking for debugging
 */
interface InvalidationEvent {
  key: string | string[];
  pattern?: string;
  reason: string;
  timestamp: Date;
  success: boolean;
}

const invalidationLog: InvalidationEvent[] = [];

/**
 * Core invalidation utilities
 */
async function invalidateKey(key: string, reason: string): Promise<boolean> {
  if (!isCachingEnabled()) {
    return true; // Skip if caching disabled
  }
  
  try {
    await redisCacheService.delete(key);
    logInvalidation(key, reason, true);
    return true;
  } catch (error) {
    logger.warn(`Cache invalidation failed for key ${key}:`, error);
    logInvalidation(key, reason, false);
    return false;
  }
}

async function invalidatePattern(pattern: string, reason: string): Promise<boolean> {
  if (!isCachingEnabled()) {
    return true;
  }
  
  try {
    await redisCacheService.deletePattern(pattern);
    logInvalidation(pattern, reason, true, pattern);
    return true;
  } catch (error) {
    logger.warn(`Cache pattern invalidation failed for ${pattern}:`, error);
    logInvalidation(pattern, reason, false, pattern);
    return false;
  }
}

function logInvalidation(key: string, reason: string, success: boolean, pattern?: string): void {
  const event: InvalidationEvent = {
    key,
    pattern,
    reason,
    timestamp: new Date(),
    success
  };
  
  invalidationLog.push(event);
  
  // Keep only last 100 events - memory leak protection
  if (invalidationLog.length > 100) {
    invalidationLog.shift();
  }
  
  // Periodic cleanup - remove events older than 1 hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const oldLength = invalidationLog.length;
  
  // Remove old events in batches to avoid blocking
  if (invalidationLog.length > 50) {
    const cutoffIndex = invalidationLog.findIndex(e => e.timestamp > oneHourAgo);
    if (cutoffIndex > 0) {
      invalidationLog.splice(0, cutoffIndex);
      
      if (process.env.NODE_ENV === 'development') {
        const cleaned = oldLength - invalidationLog.length;
        if (cleaned > 0) {
          logger.debug('CACHE_CLEANUP', `Removed ${cleaned} old invalidation events`);
        }
      }
    }
  }
  
  if (process.env.NODE_ENV === 'development') {
    const operation = pattern ? 'PATTERN' : 'KEY';
    const status = success ? '✅' : '❌';
    logger.debug('CACHE_INVALIDATE', `${operation} ${status} ${key} (${reason})`);
  }
}

/**
 * Domain-specific invalidation functions
 */
export const invalidateCache = {
  // Forum invalidations
  async forumStats(forumId: ForumId, reason: string = 'forum stats updated'): Promise<void> {
    await Promise.all([
      invalidateKey(cacheKeys.forumStats(forumId), reason),
      invalidatePattern(`forum:recent:${forumId}:*`, reason)
    ]);
  },
  
  async forumContent(forumId: ForumId, reason: string = 'forum content changed'): Promise<void> {
    await Promise.all([
      this.forumStats(forumId, reason),
      invalidatePattern(`forum:threads:${forumId}:*`, reason),
      invalidateKey(cacheKeys.forumStructure(), reason)
    ]);
  },
  
  async forumStructure(reason: string = 'forum structure changed'): Promise<void> {
    await invalidateKey(cacheKeys.forumStructure(), reason);
  },
  
  // User invalidations
  async userXP(userId: UserId, reason: string = 'user XP changed'): Promise<void> {
    await Promise.all([
      invalidateKey(cacheKeys.userXP(userId), reason),
      invalidateKey(cacheKeys.userLevel(userId), reason),
      this.leaderboards(`user ${userId} XP changed`) // XP changes affect rankings
    ]);
  },
  
  async userProfile(userId: UserId, reason: string = 'user profile updated'): Promise<void> {
    await Promise.all([
      invalidateKey(cacheKeys.userProfile(userId), reason),
      invalidateKey(cacheKeys.userCosmetics(userId), reason),
      invalidateKey(cacheKeys.userPermissions(userId), reason),
      invalidateKey(cacheKeys.userAchievements(userId), reason)
    ]);
  },
  
  async userBalance(userId: UserId, reason: string = 'user balance changed'): Promise<void> {
    await invalidateKey(cacheKeys.userBalance(userId), reason);
  },
  
  async userAchievements(userId: UserId, reason: string = 'user achievements updated'): Promise<void> {
    await Promise.all([
      invalidateKey(cacheKeys.userAchievements(userId), reason),
      invalidateKey(cacheKeys.missionProgress(userId), reason)
    ]);
  },
  
  // Leaderboard invalidations
  async leaderboards(reason: string = 'leaderboard data changed'): Promise<void> {
    await invalidatePattern(cachePatterns.leaderboardAll(), reason);
  },
  
  async weeklyLeaderboard(reason: string = 'weekly rankings changed'): Promise<void> {
    await invalidatePattern('leaderboard:weekly:*', reason);
  },
  
  // Platform/System invalidations  
  async platformStats(reason: string = 'platform stats changed'): Promise<void> {
    await Promise.all([
      invalidateKey(cacheKeys.platformStats(), reason),
      invalidatePattern('platform:active:*', reason),
      invalidateKey(cacheKeys.systemHealth(), reason)
    ]);
  },
  
  async activeUsers(reason: string = 'user activity changed'): Promise<void> {
    await invalidatePattern('platform:active:*', reason);
  },
  
  // Thread/Post invalidations
  async threadContent(threadId: ThreadId, reason: string = 'thread content changed'): Promise<void> {
    await Promise.all([
      invalidateKey(cacheKeys.threadStats(threadId), reason),
      invalidatePattern(`thread:posts:${threadId}:*`, reason)
    ]);
  },
  
  async postInteraction(postId: PostId, reason: string = 'post interaction'): Promise<void> {
    await invalidateKey(cacheKeys.postLikes(postId), reason);
  },
  
  // Shoutbox invalidations
  async shoutboxRoom(roomId: string = 'general', reason: string = 'shoutbox updated'): Promise<void> {
    await Promise.all([
      invalidatePattern(`shoutbox:messages:${roomId}:*`, reason),
      invalidateKey(cacheKeys.shoutboxUsers(roomId), reason)
    ]);
  },
  
  async shoutboxTyping(roomId: string = 'general', reason: string = 'typing status changed'): Promise<void> {
    await invalidateKey(cacheKeys.shoutboxTyping(roomId), reason);
  },
  
  // Shop/Economy invalidations
  async userInventory(userId: UserId, reason: string = 'inventory changed'): Promise<void> {
    await Promise.all([
      invalidateKey(cacheKeys.userInventory(userId), reason),
      invalidateKey(cacheKeys.userCosmetics(userId), reason)
    ]);
  },
  
  async shopItems(reason: string = 'shop inventory updated'): Promise<void> {
    await invalidatePattern('shop:items*', reason);
  },
  
  // Admin invalidations
  async adminData(reason: string = 'admin data changed'): Promise<void> {
    await invalidatePattern(cachePatterns.adminAll(), reason);
  },
  
  async adminAnalytics(metric?: string, reason: string = 'admin analytics updated'): Promise<void> {
    if (metric) {
      await invalidateKey(cacheKeys.adminAnalytics(metric), reason);
    } else {
      await invalidatePattern('admin:analytics:*', reason);
    }
  },
  
  // Bulk invalidation utilities
  async userAllData(userId: UserId, reason: string = 'user data cascade'): Promise<void> {
    await invalidatePattern(cachePatterns.userAll(userId), reason);
  },
  
  async forumAllData(forumId: ForumId, reason: string = 'forum data cascade'): Promise<void> {
    await invalidatePattern(cachePatterns.forumAll(forumId), reason);
  },
  
  // Emergency invalidation
  async clearAll(reason: string = 'emergency cache clear'): Promise<void> {
    logger.warn(`Emergency cache clear triggered: ${reason}`);
    try {
      await redisCacheService.flushAll();
      logInvalidation('*', reason, true, '*');
    } catch (error) {
      logger.error('Emergency cache clear failed:', error);
      logInvalidation('*', reason, false, '*');
    }
  }
};

/**
 * Get invalidation history for debugging
 */
export function getInvalidationLog(): InvalidationEvent[] {
  return [...invalidationLog];
}

/**
 * Clear invalidation history
 */
export function clearInvalidationLog(): void {
  invalidationLog.length = 0;
}

/**
 * Get invalidation statistics
 */
export function getInvalidationStats(): {
  total: number;
  successful: number;
  failed: number;
  recentCount: number;
} {
  const now = Date.now();
  const recentThreshold = now - (5 * 60 * 1000); // Last 5 minutes
  
  return {
    total: invalidationLog.length,
    successful: invalidationLog.filter(e => e.success).length,
    failed: invalidationLog.filter(e => !e.success).length,
    recentCount: invalidationLog.filter(e => e.timestamp.getTime() > recentThreshold).length
  };
}