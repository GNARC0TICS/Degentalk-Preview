/**
 * Centralized Cache Policies & TTL Configuration
 * 
 * Tech Debt Control Matrix: Single source of truth for all cache TTLs
 * All decorators and services reference these values for consistency
 */

export const CachePolicies = {
  // Hot Data (< 1 minute) - Real-time features
  realtime: {
    shoutboxMessages: 30,      // 30s - Live chat
    userSessions: 60,          // 1min - Active sessions
    liveBalances: 45,          // 45s - Wallet balances
    typingIndicators: 10       // 10s - Shoutbox typing
  },
  
  // Warm Data (1-15 minutes) - Frequently accessed
  standard: {
    forumStats: 300,           // 5min - Thread/post counts per forum
    userXpProgression: 120,    // 2min - User level/XP data
    leaderboards: 600,         // 10min - Top users rankings
    achievementCompletion: 300, // 5min - Achievement progress
    userCosmetics: 180,        // 3min - Avatar frames, titles
    forumRecent: 240,          // 4min - Recent posts/threads
    platformStats: 180,        // 3min - Active users, growth metrics
    adminAnalytics: 300        // 5min - Admin dashboard data
  },
  
  // Cold Data (15+ minutes) - Stable configurations
  extended: {
    systemConfigs: 1800,       // 30min - Feature flags, settings
    monthlyAnalytics: 3600,    // 1hr - Historical reports
    adminSettings: 2400,       // 40min - Admin panel configs
    forumStructure: 900,       // 15min - Forum hierarchy
    userPermissions: 1200      // 20min - Role-based permissions
  }
} as const;

export type CachePolicy = keyof typeof CachePolicies;
export type RealtimeKey = keyof typeof CachePolicies.realtime;
export type StandardKey = keyof typeof CachePolicies.standard;
export type ExtendedKey = keyof typeof CachePolicies.extended;

/**
 * Get TTL value from policy configuration
 */
export function getTTL(policy: CachePolicy, key: string): number {
  const policyGroup = CachePolicies[policy];
  const ttl = (policyGroup as any)[key];
  
  if (typeof ttl !== 'number') {
    throw new Error(`Invalid cache policy: ${policy}.${key}`);
  }
  
  return ttl;
}

/**
 * Feature flag check for cache operations
 */
export function isCachingEnabled(): boolean {
  // Environment variable override (for CI/testing)
  const envOverride = process.env.FEATURE_CACHING;
  if (envOverride !== undefined) {
    return envOverride === 'true';
  }
  
  // Default: disabled in development, enabled in production
  // Can be overridden by importing featureFlags and checking
  return process.env.NODE_ENV === 'production';
}

/**
 * Development cache policy overrides
 * Shorter TTLs in dev for faster iteration
 */
export const DevCachePolicies = {
  realtime: Object.fromEntries(
    Object.entries(CachePolicies.realtime).map(([k, v]) => [k, Math.max(5, v / 2)])
  ),
  standard: Object.fromEntries(
    Object.entries(CachePolicies.standard).map(([k, v]) => [k, Math.max(10, v / 3)])
  ),
  extended: Object.fromEntries(
    Object.entries(CachePolicies.extended).map(([k, v]) => [k, Math.max(30, v / 4)])
  )
} as typeof CachePolicies;

/**
 * Get environment-appropriate cache policies
 */
export function getCachePolicies(): typeof CachePolicies {
  return process.env.NODE_ENV === 'development' ? DevCachePolicies : CachePolicies;
}