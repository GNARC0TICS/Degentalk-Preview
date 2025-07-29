/**
 * Enhanced Cache Decorators with Feature Flag Support
 * 
 * Tech Debt Control: Type-safe decorators with centralized TTL management
 * All caching operations respect the feature.caching flag for safe rollouts
 */

import { redisCacheService } from './redis.service';
import { getCachePolicies, isCachingEnabled, type RealtimeKey, type StandardKey, type ExtendedKey } from './cache.config';
import { debugCacheKey } from './getCacheKey';
import { stampedeProtection } from './stampede-protection';
import { logger } from '@core/logger';

/**
 * Cache operation results for monitoring
 */
interface CacheOperation {
  key: string;
  operation: 'HIT' | 'MISS' | 'SET' | 'ERROR';
  duration?: number;
  error?: string;
}

const cacheOperations: CacheOperation[] = [];

function logCacheOperation(operation: CacheOperation): void {
  cacheOperations.push(operation);
  
  // Keep only last 100 operations for memory management
  if (cacheOperations.length > 100) {
    cacheOperations.shift();
  }
  
  // Periodic cleanup every 1000 operations to prevent long-term leaks
  if (cacheOperations.length === 100 && Math.random() < 0.1) { // 10% chance
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    const beforeLength = cacheOperations.length;
    
    // Keep only operations from last 10 minutes
    const recentOps = cacheOperations.filter(op => {
      const opTime = op.duration ? Date.now() - op.duration : Date.now();
      return opTime > tenMinutesAgo;
    });
    
    cacheOperations.length = 0;
    cacheOperations.push(...recentOps);
    
    const cleaned = beforeLength - cacheOperations.length;
    if (cleaned > 0 && process.env.NODE_ENV === 'development') {
      logger.debug('Cache', 'CACHE_CLEANUP', `Cleaned ${cleaned} old cache operations`);
    }
  }
  
  // Development logging
  debugCacheKey(operation.key, operation.operation as any);
}

/**
 * Generate cache key from class, method, and arguments
 */
function generateCacheKey(className: string, methodName: string, args: any[]): string {
  const baseKey = `${className.toLowerCase()}:${methodName}`;
  
  if (args.length === 0) {
    return baseKey;
  }
  
  // Serialize arguments for cache key
  const argKey = args
    .map(arg => {
      if (typeof arg === 'string' || typeof arg === 'number') {
        return String(arg);
      }
      if (typeof arg === 'object' && arg !== null) {
        // For objects, create a stable hash of key properties
        return JSON.stringify(arg, Object.keys(arg).sort());
      }
      return 'unknown';
    })
    .join(':');
    
  return `${baseKey}:${argKey}`;
}

/**
 * Core cache decorator implementation
 */
function createCacheDecorator(policy: 'realtime' | 'standard' | 'extended', policyKey: string) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;
    
    descriptor.value = async function(...args: any[]) {
      // Check feature flag first
      if (!isCachingEnabled()) {
        return await originalMethod.apply(this, args);
      }
      
      const startTime = Date.now();
      const cacheKey = generateCacheKey(className, propertyName, args);
      const policies = getCachePolicies();
      const ttl = (policies[policy] as any)[policyKey];
      
      if (typeof ttl !== 'number') {
        logger.warn('Cache', `Invalid cache policy: ${policy}.${policyKey}, falling back to original method`);
        return await originalMethod.apply(this, args);
      }
      
      try {
        // Try to get from cache
        const cached = await redisCacheService.get(cacheKey);
        
        if (cached !== null && cached !== undefined) {
          logCacheOperation({
            key: cacheKey,
            operation: 'HIT',
            duration: Date.now() - startTime
          });
          return cached;
        }
        
        // Cache miss - execute original method with stampede protection
        logCacheOperation({
          key: cacheKey,
          operation: 'MISS',
          duration: Date.now() - startTime
        });
        
        // Use stampede protection for expensive cache misses
        const stampedeKey = `cache-miss:${cacheKey}`;
        const result = await stampedeProtection.execute(stampedeKey, () => {
          return originalMethod.apply(this, args);
        });
        
        // Store in cache (fire and forget - don't block on cache errors)
        redisCacheService.set(cacheKey, result, ttl).then(() => {
          logCacheOperation({
            key: cacheKey,
            operation: 'SET'
          });
        }).catch(error => {
          logCacheOperation({
            key: cacheKey,
            operation: 'ERROR',
            error: error.message
          });
        });
        
        return result;
        
      } catch (cacheError) {
        // Cache operation failed - fallback to original method
        logger.warn(`Cache operation failed for ${cacheKey}:`, cacheError);
        
        logCacheOperation({
          key: cacheKey,
          operation: 'ERROR',
          error: cacheError instanceof Error ? cacheError.message : String(cacheError)
        });
        
        return await originalMethod.apply(this, args);
      }
    };
    
    return descriptor;
  };
}

/**
 * Realtime cache decorators (< 1 minute TTL)
 */
export const CacheRealtime = {
  shoutboxMessages: createCacheDecorator('realtime', 'shoutboxMessages'),
  userSessions: createCacheDecorator('realtime', 'userSessions'),
  liveBalances: createCacheDecorator('realtime', 'liveBalances'),
  typingIndicators: createCacheDecorator('realtime', 'typingIndicators')
};

/**
 * Standard cache decorators (1-15 minute TTL)
 */
export const CacheStandard = {
  forumStats: createCacheDecorator('standard', 'forumStats'),
  userXpProgression: createCacheDecorator('standard', 'userXpProgression'),
  leaderboards: createCacheDecorator('standard', 'leaderboards'),
  achievementCompletion: createCacheDecorator('standard', 'achievementCompletion'),
  userCosmetics: createCacheDecorator('standard', 'userCosmetics'),
  forumRecent: createCacheDecorator('standard', 'forumRecent'),
  platformStats: createCacheDecorator('standard', 'platformStats'),
  adminAnalytics: createCacheDecorator('standard', 'adminAnalytics')
};

/**
 * Extended cache decorators (15+ minute TTL)
 */
export const CacheExtended = {
  systemConfigs: createCacheDecorator('extended', 'systemConfigs'),
  monthlyAnalytics: createCacheDecorator('extended', 'monthlyAnalytics'),
  adminSettings: createCacheDecorator('extended', 'adminSettings'),
  forumStructure: createCacheDecorator('extended', 'forumStructure'),
  userPermissions: createCacheDecorator('extended', 'userPermissions')
};

/**
 * Legacy decorator support - maps to new system
 * @deprecated Use CacheStandard.* instead
 */
export function CacheMinute(minutes: number = 5) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;
    
    descriptor.value = async function(...args: any[]) {
      if (!isCachingEnabled()) {
        return await originalMethod.apply(this, args);
      }
      
      const cacheKey = generateCacheKey(className, propertyName, args);
      const ttl = minutes * 60; // Convert to seconds
      
      try {
        const cached = await redisCacheService.get(cacheKey);
        if (cached !== null) {
          logCacheOperation({ key: cacheKey, operation: 'HIT' });
          return cached;
        }
        
        logCacheOperation({ key: cacheKey, operation: 'MISS' });
        
        // Use stampede protection for legacy cache misses too
        const stampedeKey = `legacy-cache-miss:${cacheKey}`;
        const result = await stampedeProtection.execute(stampedeKey, () => {
          return originalMethod.apply(this, args);
        });
        
        // Fire and forget cache set
        redisCacheService.set(cacheKey, result, ttl).catch(error => {
          logger.warn(`Legacy cache set failed for ${cacheKey}:`, error);
        });
        
        return result;
      } catch (error) {
        logger.warn(`Legacy cache operation failed for ${cacheKey}:`, error);
        return await originalMethod.apply(this, args);
      }
    };
    
    return descriptor;
  };
}

/**
 * Custom cache decorator for special cases
 */
export function CustomCache(ttlSeconds: number, keyPrefix?: string) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;
    
    descriptor.value = async function(...args: any[]) {
      if (!isCachingEnabled()) {
        return await originalMethod.apply(this, args);
      }
      
      const baseKey = keyPrefix ? `${keyPrefix}:${propertyName}` : generateCacheKey(className, propertyName, args);
      const cacheKey = keyPrefix ? baseKey : generateCacheKey(className, propertyName, args);
      
      try {
        const cached = await redisCacheService.get(cacheKey);
        if (cached !== null) {
          logCacheOperation({ key: cacheKey, operation: 'HIT' });
          return cached;
        }
        
        logCacheOperation({ key: cacheKey, operation: 'MISS' });
        const result = await originalMethod.apply(this, args);
        
        redisCacheService.set(cacheKey, result, ttlSeconds).catch(error => {
          logCacheOperation({ key: cacheKey, operation: 'ERROR', error: error.message });
        });
        
        return result;
      } catch (error) {
        logCacheOperation({ 
          key: cacheKey, 
          operation: 'ERROR', 
          error: error instanceof Error ? error.message : String(error) 
        });
        return await originalMethod.apply(this, args);
      }
    };
    
    return descriptor;
  };
}

/**
 * Development utilities for cache monitoring
 */
export function getCacheOperationStats(): {
  hits: number;
  misses: number;
  sets: number;
  errors: number;
  hitRate: number;
} {
  const hits = cacheOperations.filter(op => op.operation === 'HIT').length;
  const misses = cacheOperations.filter(op => op.operation === 'MISS').length;
  const sets = cacheOperations.filter(op => op.operation === 'SET').length;
  const errors = cacheOperations.filter(op => op.operation === 'ERROR').length;
  
  const total = hits + misses;
  const hitRate = total > 0 ? (hits / total) * 100 : 0;
  
  return { hits, misses, sets, errors, hitRate };
}

/**
 * Clear cache operation history
 */
export function clearCacheStats(): void {
  cacheOperations.length = 0;
}

/**
 * Get recent cache operations for debugging
 */
export function getRecentCacheOperations(limit: number = 20): CacheOperation[] {
  return cacheOperations.slice(-limit);
}