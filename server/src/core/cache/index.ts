/**
 * Cache Service Exports
 * 
 * Provides unified caching functionality for the entire application
 */

// Export the unified cache service and all related types
export {
  cacheService,
  CacheCategory,
  Cache,
  CacheMinute,
  CacheHour,
  CacheDay,
  CacheAuth,
  CacheUser,
  CacheForum,
  CacheAdmin,
  CacheRealtime,
  type CacheOptions,
  type CacheMetrics,
  type CacheHealth
} from './unified-cache.service';

// Re-export existing Redis service for backward compatibility during migration
export { redisCacheService } from './redis.service';

// Legacy exports for gradual migration
export { redisCacheService as legacyRedisCache } from './redis.service';