/**
 * Enhanced Cache Decorators with Feature Flag Support
 *
 * Tech Debt Control: Type-safe decorators with centralized TTL management
 * All caching operations respect the feature.caching flag for safe rollouts
 */
/**
 * Cache operation results for monitoring
 */
interface CacheOperation {
    key: string;
    operation: 'HIT' | 'MISS' | 'SET' | 'ERROR';
    duration?: number;
    error?: string;
}
/**
 * Realtime cache decorators (< 1 minute TTL)
 */
export declare const CacheRealtime: {
    shoutboxMessages: (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
    userSessions: (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
    liveBalances: (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
    typingIndicators: (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
};
/**
 * Standard cache decorators (1-15 minute TTL)
 */
export declare const CacheStandard: {
    forumStats: (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
    userXpProgression: (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
    leaderboards: (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
    achievementCompletion: (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
    userCosmetics: (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
    forumRecent: (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
    platformStats: (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
    adminAnalytics: (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
};
/**
 * Extended cache decorators (15+ minute TTL)
 */
export declare const CacheExtended: {
    systemConfigs: (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
    monthlyAnalytics: (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
    adminSettings: (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
    forumStructure: (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
    userPermissions: (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
};
/**
 * Legacy decorator support - maps to new system
 * @deprecated Use CacheStandard.* instead
 */
export declare function CacheMinute(minutes?: number): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Custom cache decorator for special cases
 */
export declare function CustomCache(ttlSeconds: number, keyPrefix?: string): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Development utilities for cache monitoring
 */
export declare function getCacheOperationStats(): {
    hits: number;
    misses: number;
    sets: number;
    errors: number;
    hitRate: number;
};
/**
 * Clear cache operation history
 */
export declare function clearCacheStats(): void;
/**
 * Get recent cache operations for debugging
 */
export declare function getRecentCacheOperations(limit?: number): CacheOperation[];
export {};
