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
export declare const cacheKeys: {
    readonly forumStats: (forumId: ForumId) => string;
    readonly forumRecent: (forumId: ForumId, limit?: number) => string;
    readonly forumStructure: () => string;
    readonly forumThreads: (forumId: ForumId, page?: number) => string;
    readonly userXP: (userId: UserId) => string;
    readonly userLevel: (userId: UserId) => string;
    readonly userAchievements: (userId: UserId) => string;
    readonly userCosmetics: (userId: UserId) => string;
    readonly userPermissions: (userId: UserId) => string;
    readonly userBalance: (userId: UserId) => string;
    readonly userProfile: (userId: UserId) => string;
    readonly xpLeaderboard: (limit?: number) => string;
    readonly weeklyTop: (week?: string) => string;
    readonly monthlyTop: (month?: string) => string;
    readonly reputationLeaderboard: (limit?: number) => string;
    readonly platformStats: () => string;
    readonly activeUsers: (timeframe?: "5m" | "1h" | "24h") => string;
    readonly systemHealth: () => string;
    readonly adminAnalytics: (metric: string) => string;
    readonly shoutboxMessages: (roomId?: string, page?: number) => string;
    readonly shoutboxUsers: (roomId?: string) => string;
    readonly shoutboxTyping: (roomId?: string) => string;
    readonly threadStats: (threadId: ThreadId) => string;
    readonly threadPosts: (threadId: ThreadId, page?: number) => string;
    readonly postLikes: (postId: PostId) => string;
    readonly shopItems: (category?: string) => string;
    readonly userInventory: (userId: UserId) => string;
    readonly missionProgress: (userId: UserId) => string;
    readonly achievementTiers: () => string;
    readonly adminUserList: (filters?: string) => string;
    readonly adminReports: (status?: string) => string;
    readonly custom: (domain: string, ...parts: string[]) => string;
};
/**
 * Pattern-based key generators for bulk operations
 */
export declare const cachePatterns: {
    readonly userAll: (userId: UserId) => string;
    readonly forumAll: (forumId: ForumId) => string;
    readonly leaderboardAll: () => string;
    readonly shoutboxAll: (roomId?: string) => string;
    readonly platformAll: () => string;
    readonly adminAll: () => string;
};
/**
 * Cache key validation
 */
export declare function validateCacheKey(key: string): boolean;
/**
 * Extract domain from cache key for metrics/debugging
 */
export declare function extractDomain(key: string): string;
/**
 * Generate timestamped cache keys for versioning
 */
export declare function versionedKey(baseKey: string, timestamp?: Date): string;
/**
 * Development helper: log cache key usage
 */
export declare function debugCacheKey(key: string, operation: 'GET' | 'SET' | 'DEL'): void;
