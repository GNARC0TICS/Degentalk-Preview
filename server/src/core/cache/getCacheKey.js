/**
 * Centralized Cache Key Generation
 *
 * Tech Debt Control: Standardized key patterns prevent collisions
 * and enable pattern-based invalidation
 */
import { debug } from '@core/logger';
/**
 * Cache key namespacing and patterns
 * Format: {domain}:{entity}:{identifier}[:{modifier}]
 */
export const cacheKeys = {
    // Forum domain patterns
    forumStats: (forumId) => `forum:stats:${forumId}`,
    forumRecent: (forumId, limit = 10) => `forum:recent:${forumId}:${limit}`,
    forumStructure: () => `forum:structure`,
    forumThreads: (forumId, page = 1) => `forum:threads:${forumId}:page:${page}`,
    // User domain patterns  
    userXP: (userId) => `user:xp:${userId}`,
    userLevel: (userId) => `user:level:${userId}`,
    userAchievements: (userId) => `user:achievements:${userId}`,
    userCosmetics: (userId) => `user:cosmetics:${userId}`,
    userPermissions: (userId) => `user:permissions:${userId}`,
    userBalance: (userId) => `user:balance:${userId}`,
    userProfile: (userId) => `user:profile:${userId}`,
    // Leaderboard patterns
    xpLeaderboard: (limit = 50) => `leaderboard:xp:${limit}`,
    weeklyTop: (week) => `leaderboard:weekly:${week || getCurrentWeek()}`,
    monthlyTop: (month) => `leaderboard:monthly:${month || getCurrentMonth()}`,
    reputationLeaderboard: (limit = 50) => `leaderboard:reputation:${limit}`,
    // Platform/System patterns
    platformStats: () => `platform:stats`,
    activeUsers: (timeframe = '5m') => `platform:active:${timeframe}`,
    systemHealth: () => `platform:health`,
    adminAnalytics: (metric) => `admin:analytics:${metric}`,
    // Shoutbox domain patterns
    shoutboxMessages: (roomId = 'general', page = 1) => `shoutbox:messages:${roomId}:page:${page}`,
    shoutboxUsers: (roomId = 'general') => `shoutbox:users:${roomId}`,
    shoutboxTyping: (roomId = 'general') => `shoutbox:typing:${roomId}`,
    // Thread/Post patterns
    threadStats: (threadId) => `thread:stats:${threadId}`,
    threadPosts: (threadId, page = 1) => `thread:posts:${threadId}:page:${page}`,
    postLikes: (postId) => `post:likes:${postId}`,
    // Shop/Economy patterns
    shopItems: (category) => `shop:items${category ? `:${category}` : ''}`,
    userInventory: (userId) => `shop:inventory:${userId}`,
    // Gamification patterns
    missionProgress: (userId) => `mission:progress:${userId}`,
    achievementTiers: () => `achievement:tiers`,
    // Admin patterns
    adminUserList: (filters = 'default') => `admin:users:${filters}`,
    adminReports: (status = 'active') => `admin:reports:${status}`,
    // Custom key builder for complex scenarios
    custom: (domain, ...parts) => `${domain}:${parts.join(':')}`
};
/**
 * Pattern-based key generators for bulk operations
 */
export const cachePatterns = {
    userAll: (userId) => `user:*:${userId}`,
    forumAll: (forumId) => `forum:*:${forumId}`,
    leaderboardAll: () => `leaderboard:*`,
    shoutboxAll: (roomId) => roomId ? `shoutbox:*:${roomId}` : `shoutbox:*`,
    platformAll: () => `platform:*`,
    adminAll: () => `admin:*`
};
/**
 * Time-based utilities for cache keys
 */
function getCurrentWeek() {
    const now = new Date();
    const year = now.getFullYear();
    const firstDay = new Date(year, 0, 1);
    const days = Math.floor((now.getTime() - firstDay.getTime()) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((days + firstDay.getDay() + 1) / 7);
    return `${year}W${week.toString().padStart(2, '0')}`;
}
function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}M${(now.getMonth() + 1).toString().padStart(2, '0')}`;
}
/**
 * Cache key validation
 */
export function validateCacheKey(key) {
    // Basic validation: no spaces, reasonable length, proper format
    return !key.includes(' ') && key.length > 3 && key.length < 200 && key.includes(':');
}
/**
 * Extract domain from cache key for metrics/debugging
 */
export function extractDomain(key) {
    return key.split(':')[0] || 'unknown';
}
/**
 * Generate timestamped cache keys for versioning
 */
export function versionedKey(baseKey, timestamp) {
    const ts = (timestamp || new Date()).toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
    return `${baseKey}:v:${ts}`;
}
/**
 * Development helper: log cache key usage
 */
export function debugCacheKey(key, operation) {
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG_CACHE === 'true') {
        debug('CACHE', `${operation} ${key} [domain: ${extractDomain(key)}]`);
    }
}
