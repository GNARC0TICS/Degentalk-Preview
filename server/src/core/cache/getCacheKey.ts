/**
 * Centralized Cache Key Generation
 * 
 * Tech Debt Control: Standardized key patterns prevent collisions
 * and enable pattern-based invalidation
 */

import type { UserId, ForumId, ThreadId, PostId } from '@shared/types/ids';

/**
 * Cache key namespacing and patterns
 * Format: {domain}:{entity}:{identifier}[:{modifier}]
 */
export const cacheKeys = {
  // Forum domain patterns
  forumStats: (forumId: ForumId) => `forum:stats:${forumId}`,
  forumRecent: (forumId: ForumId, limit: number = 10) => `forum:recent:${forumId}:${limit}`,
  forumStructure: () => `forum:structure`,
  forumThreads: (forumId: ForumId, page: number = 1) => `forum:threads:${forumId}:page:${page}`,
  
  // User domain patterns  
  userXP: (userId: UserId) => `user:xp:${userId}`,
  userLevel: (userId: UserId) => `user:level:${userId}`,
  userAchievements: (userId: UserId) => `user:achievements:${userId}`,
  userCosmetics: (userId: UserId) => `user:cosmetics:${userId}`,
  userPermissions: (userId: UserId) => `user:permissions:${userId}`,
  userBalance: (userId: UserId) => `user:balance:${userId}`,
  userProfile: (userId: UserId) => `user:profile:${userId}`,
  
  // Leaderboard patterns
  xpLeaderboard: (limit: number = 50) => `leaderboard:xp:${limit}`,
  weeklyTop: (week?: string) => `leaderboard:weekly:${week || getCurrentWeek()}`,
  monthlyTop: (month?: string) => `leaderboard:monthly:${month || getCurrentMonth()}`,
  cloutLeaderboard: (limit: number = 50) => `leaderboard:clout:${limit}`,
  
  // Platform/System patterns
  platformStats: () => `platform:stats`,
  activeUsers: (timeframe: '5m' | '1h' | '24h' = '5m') => `platform:active:${timeframe}`,
  systemHealth: () => `platform:health`,
  adminAnalytics: (metric: string) => `admin:analytics:${metric}`,
  
  // Shoutbox domain patterns
  shoutboxMessages: (roomId: string = 'general', page: number = 1) => 
    `shoutbox:messages:${roomId}:page:${page}`,
  shoutboxUsers: (roomId: string = 'general') => `shoutbox:users:${roomId}`,
  shoutboxTyping: (roomId: string = 'general') => `shoutbox:typing:${roomId}`,
  
  // Thread/Post patterns
  threadStats: (threadId: ThreadId) => `thread:stats:${threadId}`,
  threadPosts: (threadId: ThreadId, page: number = 1) => `thread:posts:${threadId}:page:${page}`,
  postLikes: (postId: PostId) => `post:likes:${postId}`,
  
  // Shop/Economy patterns
  shopItems: (category?: string) => `shop:items${category ? `:${category}` : ''}`,
  userInventory: (userId: UserId) => `shop:inventory:${userId}`,
  
  // Gamification patterns
  missionProgress: (userId: UserId) => `mission:progress:${userId}`,
  achievementTiers: () => `achievement:tiers`,
  
  // Admin patterns
  adminUserList: (filters: string = 'default') => `admin:users:${filters}`,
  adminReports: (status: string = 'active') => `admin:reports:${status}`,
  
  // Custom key builder for complex scenarios
  custom: (domain: string, ...parts: string[]) => `${domain}:${parts.join(':')}`
} as const;

/**
 * Pattern-based key generators for bulk operations
 */
export const cachePatterns = {
  userAll: (userId: UserId) => `user:*:${userId}`,
  forumAll: (forumId: ForumId) => `forum:*:${forumId}`,
  leaderboardAll: () => `leaderboard:*`,
  shoutboxAll: (roomId?: string) => roomId ? `shoutbox:*:${roomId}` : `shoutbox:*`,
  platformAll: () => `platform:*`,
  adminAll: () => `admin:*`
} as const;

/**
 * Time-based utilities for cache keys
 */
function getCurrentWeek(): string {
  const now = new Date();
  const year = now.getFullYear();
  const firstDay = new Date(year, 0, 1);
  const days = Math.floor((now.getTime() - firstDay.getTime()) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((days + firstDay.getDay() + 1) / 7);
  return `${year}W${week.toString().padStart(2, '0')}`;
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}M${(now.getMonth() + 1).toString().padStart(2, '0')}`;
}

/**
 * Cache key validation
 */
export function validateCacheKey(key: string): boolean {
  // Basic validation: no spaces, reasonable length, proper format
  return !key.includes(' ') && key.length > 3 && key.length < 200 && key.includes(':');
}

/**
 * Extract domain from cache key for metrics/debugging
 */
export function extractDomain(key: string): string {
  return key.split(':')[0] || 'unknown';
}

/**
 * Generate timestamped cache keys for versioning
 */
export function versionedKey(baseKey: string, timestamp?: Date): string {
  const ts = (timestamp || new Date()).toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  return `${baseKey}:v:${ts}`;
}

/**
 * Development helper: log cache key usage
 */
export function debugCacheKey(key: string, operation: 'GET' | 'SET' | 'DEL'): void {
  if (process.env.NODE_ENV === 'development' && process.env.DEBUG_CACHE === 'true') {
    console.log(`[CACHE ${operation}] ${key} [domain: ${extractDomain(key)}]`);
  }
}