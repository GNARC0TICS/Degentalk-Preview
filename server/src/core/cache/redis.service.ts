/**
 * Redis Cache Service with Decorators
 * 
 * Enhanced Redis service with method decorators for easy caching
 * Features:
 * - Automatic cache key generation
 * - TTL-based expiration
 * - Cache hit/miss metrics
 * - Fallback to in-memory cache
 * - Method decorators for seamless integration
 */

import Redis from 'ioredis';
import { logger } from '@core/logger';

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  prefix?: string; // Cache key prefix
  serialize?: boolean; // Whether to serialize the result
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  errors: number;
  hitRate: number;
}

class RedisCacheService {
  private redis: Redis | null = null;
  private connected = false;
  private fallbackCache = new Map<string, { data: any; expires: number }>();
  private metrics: CacheMetrics = { hits: 0, misses: 0, errors: 0, hitRate: 0 };

  constructor() {
    this.initializeRedis();
    this.startMetricsCalculation();
  }

  private async initializeRedis(): Promise<void> {
    try {
      const redisUrl = process.env.REDIS_URL || process.env.REDIS_CONNECTION;
      
      if (!redisUrl) {
        logger.info('RedisCache', 'Redis not configured, using in-memory fallback');
        return;
      }

      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000,
      });

      this.redis.on('connect', () => {
        logger.info('RedisCache', 'Connected to Redis');
        this.connected = true;
      });

      this.redis.on('error', (err) => {
        logger.warn('RedisCache', 'Redis error, using fallback', { error: err.message });
        this.connected = false;
        this.metrics.errors++;
      });

      this.redis.on('close', () => {
        logger.warn('RedisCache', 'Redis connection closed');
        this.connected = false;
      });

      await this.redis.connect();
    } catch (error) {
      logger.error('RedisCache', 'Failed to initialize Redis', { error });
      this.connected = false;
    }
  }

  private startMetricsCalculation(): void {
    setInterval(() => {
      const total = this.metrics.hits + this.metrics.misses;
      this.metrics.hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;
    }, 30000); // Update every 30 seconds
  }

  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const fullKey = this.generateKey(key, options.prefix);
    
    try {
      // Try Redis first
      if (this.connected && this.redis) {
        const cached = await this.redis.get(fullKey);
        if (cached !== null) {
          this.metrics.hits++;
          return options.serialize === false ? cached : JSON.parse(cached);
        }
      }

      // Fallback to in-memory cache
      const fallbackItem = this.fallbackCache.get(fullKey);
      if (fallbackItem && fallbackItem.expires > Date.now()) {
        this.metrics.hits++;
        return fallbackItem.data;
      }

      // Clean up expired fallback items
      if (fallbackItem && fallbackItem.expires <= Date.now()) {
        this.fallbackCache.delete(fullKey);
      }

      this.metrics.misses++;
      return null;
    } catch (error) {
      logger.error('RedisCache', 'Error getting cache key', { key: fullKey, error });
      this.metrics.errors++;
      return null;
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const fullKey = this.generateKey(key, options.prefix);
    const ttl = options.ttl || 60000; // Default 1 minute
    const serialized = options.serialize === false ? value : JSON.stringify(value);

    try {
      // Try Redis first
      if (this.connected && this.redis) {
        await this.redis.setex(fullKey, Math.ceil(ttl / 1000), serialized as string);
        return;
      }

      // Fallback to in-memory cache
      this.fallbackCache.set(fullKey, {
        data: value,
        expires: Date.now() + ttl
      });

      // Clean up old entries periodically
      if (this.fallbackCache.size > 1000) {
        this.cleanupFallbackCache();
      }
    } catch (error) {
      logger.error('RedisCache', 'Error setting cache key', { key: fullKey, error });
      this.metrics.errors++;
    }
  }

  async delete(key: string, options: CacheOptions = {}): Promise<void> {
    const fullKey = this.generateKey(key, options.prefix);
    
    try {
      if (this.connected && this.redis) {
        await this.redis.del(fullKey);
      }
      this.fallbackCache.delete(fullKey);
    } catch (error) {
      logger.error('RedisCache', 'Error deleting cache key', { key: fullKey, error });
      this.metrics.errors++;
    }
  }

  async clear(prefix?: string): Promise<void> {
    try {
      if (this.connected && this.redis) {
        if (prefix) {
          const keys = await this.redis.keys(`${prefix}:*`);
          if (keys.length > 0) {
            await this.redis.del(...keys);
          }
        } else {
          await this.redis.flushdb();
        }
      }

      // Clear fallback cache
      if (prefix) {
        for (const key of this.fallbackCache.keys()) {
          if (key.startsWith(`${prefix}:`)) {
            this.fallbackCache.delete(key);
          }
        }
      } else {
        this.fallbackCache.clear();
      }
    } catch (error) {
      logger.error('RedisCache', 'Error clearing cache', { prefix, error });
      this.metrics.errors++;
    }
  }

  private generateKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  }

  private cleanupFallbackCache(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.fallbackCache.entries()) {
      if (item.expires <= now) {
        this.fallbackCache.delete(key);
        cleaned++;
      }
    }

    logger.debug('RedisCache', `Cleaned up ${cleaned} expired fallback cache entries`);
  }

  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  getStats() {
    return {
      connected: this.connected,
      redisAvailable: !!this.redis,
      fallbackCacheSize: this.fallbackCache.size,
      metrics: this.getMetrics()
    };
  }
}

// Export singleton instance
export const redisCacheService = new RedisCacheService();

// Cache decorator factory
export function Cache(options: CacheOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Generate cache key from method name and arguments
      const cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;
      
      // Try to get from cache first
      const cached = await redisCacheService.get(cacheKey, options);
      if (cached !== null) {
        logger.debug('Cache', `Cache hit for ${cacheKey}`);
        return cached;
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);
      
      // Cache the result
      await redisCacheService.set(cacheKey, result, options);
      
      logger.debug('Cache', `Cache miss for ${cacheKey}, result cached`);
      return result;
    };

    return descriptor;
  };
}

// Convenience decorator functions
export const CacheMinute = (minutes: number = 1) => Cache({ ttl: minutes * 60 * 1000 });
export const CacheHour = (hours: number = 1) => Cache({ ttl: hours * 60 * 60 * 1000 });
export const CacheDay = (days: number = 1) => Cache({ ttl: days * 24 * 60 * 60 * 1000 });