/**
 * Centralized Cache Policies & TTL Configuration
 *
 * Tech Debt Control Matrix: Single source of truth for all cache TTLs
 * All decorators and services reference these values for consistency
 */
export declare const CachePolicies: {
    readonly realtime: {
        readonly shoutboxMessages: 30;
        readonly userSessions: 60;
        readonly liveBalances: 45;
        readonly typingIndicators: 10;
    };
    readonly standard: {
        readonly forumStats: 300;
        readonly userXpProgression: 120;
        readonly leaderboards: 600;
        readonly achievementCompletion: 300;
        readonly userCosmetics: 180;
        readonly forumRecent: 240;
        readonly platformStats: 180;
        readonly adminAnalytics: 300;
    };
    readonly extended: {
        readonly systemConfigs: 1800;
        readonly monthlyAnalytics: 3600;
        readonly adminSettings: 2400;
        readonly forumStructure: 900;
        readonly userPermissions: 1200;
    };
};
export type CachePolicy = keyof typeof CachePolicies;
export type RealtimeKey = keyof typeof CachePolicies.realtime;
export type StandardKey = keyof typeof CachePolicies.standard;
export type ExtendedKey = keyof typeof CachePolicies.extended;
/**
 * Get TTL value from policy configuration
 */
export declare function getTTL(policy: CachePolicy, key: string): number;
/**
 * Feature flag check for cache operations
 */
export declare function isCachingEnabled(): boolean;
/**
 * Development cache policy overrides
 * Shorter TTLs in dev for faster iteration
 */
export declare const DevCachePolicies: typeof CachePolicies;
/**
 * Get environment-appropriate cache policies
 */
export declare function getCachePolicies(): typeof CachePolicies;
