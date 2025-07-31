/**
 * Unified Cache Service
 *
 * Consolidates all caching functionality into a single, flexible service
 * that supports multiple storage backends and use cases.
 *
 * Features:
 * - Multiple storage backends (Redis, In-Memory)
 * - Domain-specific cache categories with configurable TTLs
 * - Method decorators for easy integration
 * - Comprehensive metrics and monitoring
 * - Pattern-based invalidation
 * - LRU eviction for memory caches
 * - Automatic fallback strategies
 */
import Redis from 'ioredis';
import NodeCache from 'node-cache';
import { logger } from '@core/logger';
import { createHash } from 'crypto';
// Cache categories with default TTLs
export var CacheCategory;
(function (CacheCategory) {
    // General purpose
    CacheCategory["DEFAULT"] = "default";
    // Domain-specific categories
    CacheCategory["AUTH"] = "auth";
    CacheCategory["USER"] = "user";
    CacheCategory["FORUM"] = "forum";
    CacheCategory["THREAD"] = "thread";
    CacheCategory["SHOUTBOX"] = "shoutbox";
    CacheCategory["ANALYTICS"] = "analytics";
    CacheCategory["SETTINGS"] = "settings";
    CacheCategory["ADMIN"] = "admin";
    // Performance-critical
    CacheCategory["REALTIME"] = "realtime";
    CacheCategory["SESSION"] = "session";
    CacheCategory["RATE_LIMIT"] = "rate_limit";
})(CacheCategory || (CacheCategory = {}));
// Default TTLs by category (in seconds)
const CATEGORY_TTLS = {
    [CacheCategory.DEFAULT]: 300, // 5 minutes
    [CacheCategory.AUTH]: 3600, // 1 hour
    [CacheCategory.USER]: 1800, // 30 minutes
    [CacheCategory.FORUM]: 1800, // 30 minutes
    [CacheCategory.THREAD]: 300, // 5 minutes
    [CacheCategory.SHOUTBOX]: 300, // 5 minutes
    [CacheCategory.ANALYTICS]: 300, // 5 minutes
    [CacheCategory.SETTINGS]: 3600, // 1 hour
    [CacheCategory.ADMIN]: 1800, // 30 minutes
    [CacheCategory.REALTIME]: 10, // 10 seconds
    [CacheCategory.SESSION]: 1800, // 30 minutes
    [CacheCategory.RATE_LIMIT]: 60 // 1 minute
};
class UnifiedCacheService {
    redis = null;
    memoryCache;
    redisConnected = false;
    metrics;
    maxMemoryMB = 100; // Max memory usage for in-memory cache
    constructor() {
        // Initialize memory cache with default settings
        this.memoryCache = new NodeCache({
            stdTTL: 300,
            checkperiod: 60,
            useClones: false,
            maxKeys: 10000
        });
        // Initialize metrics
        this.metrics = {
            hits: 0,
            misses: 0,
            errors: 0,
            evictions: 0,
            hitRate: 0,
            memoryUsage: 0,
            redisConnected: false,
            categories: {}
        };
        // Setup event handlers
        this.memoryCache.on('expired', (key) => {
            this.metrics.evictions++;
        });
        this.memoryCache.on('del', (key) => {
            this.metrics.evictions++;
        });
        // Initialize Redis if configured
        this.initializeRedis();
        // Start metrics calculation
        this.startMetricsCalculation();
    }
    async initializeRedis() {
        try {
            const redisUrl = process.env.REDIS_URL || process.env.REDIS_CONNECTION;
            if (!redisUrl) {
                logger.info('UnifiedCache', 'Redis not configured, using in-memory only');
                return;
            }
            this.redis = new Redis(redisUrl, {
                maxRetriesPerRequest: 3,
                lazyConnect: true,
                keepAlive: 30000,
                connectTimeout: 10000,
                commandTimeout: 5000,
                enableOfflineQueue: false
            });
            this.redis.on('connect', () => {
                logger.info('UnifiedCache', 'Connected to Redis');
                this.redisConnected = true;
                this.metrics.redisConnected = true;
            });
            this.redis.on('error', (err) => {
                logger.warn('UnifiedCache', 'Redis error', { error: err.message });
                this.redisConnected = false;
                this.metrics.redisConnected = false;
                this.metrics.errors++;
            });
            this.redis.on('close', () => {
                logger.warn('UnifiedCache', 'Redis connection closed');
                this.redisConnected = false;
                this.metrics.redisConnected = false;
            });
            await this.redis.connect();
        }
        catch (error) {
            logger.error('UnifiedCache', 'Failed to initialize Redis', { error });
            this.redisConnected = false;
        }
    }
    startMetricsCalculation() {
        setInterval(() => {
            const total = this.metrics.hits + this.metrics.misses;
            this.metrics.hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;
            // Calculate memory usage
            const stats = this.memoryCache.getStats();
            this.metrics.memoryUsage = (stats.vsize || 0) / 1024 / 1024; // Convert to MB
        }, 30000); // Update every 30 seconds
    }
    generateKey(key, category, prefix) {
        const parts = ['degentalk'];
        if (category)
            parts.push(category);
        if (prefix)
            parts.push(prefix);
        parts.push(key);
        return parts.join(':');
    }
    updateCategoryMetrics(category, hit) {
        if (!this.metrics.categories[category]) {
            this.metrics.categories[category] = { hits: 0, misses: 0, size: 0 };
        }
        if (hit) {
            this.metrics.categories[category].hits++;
        }
        else {
            this.metrics.categories[category].misses++;
        }
    }
    async get(key, options = {}) {
        const category = options.category || CacheCategory.DEFAULT;
        const fullKey = this.generateKey(key, category, options.prefix);
        try {
            // Try Redis first if connected
            if (this.redisConnected && this.redis) {
                const cached = await this.redis.get(fullKey);
                if (cached !== null) {
                    this.metrics.hits++;
                    this.updateCategoryMetrics(category, true);
                    return options.serialize === false ? cached : JSON.parse(cached);
                }
            }
            // Fallback to memory cache
            if (options.fallbackToMemory !== false) {
                const memoryCached = this.memoryCache.get(fullKey);
                if (memoryCached !== undefined) {
                    this.metrics.hits++;
                    this.updateCategoryMetrics(category, true);
                    return memoryCached;
                }
            }
            this.metrics.misses++;
            this.updateCategoryMetrics(category, false);
            return null;
        }
        catch (error) {
            logger.error('UnifiedCache', 'Get error', { key: fullKey, error });
            this.metrics.errors++;
            return null;
        }
    }
    async set(key, value, options = {}) {
        const category = options.category || CacheCategory.DEFAULT;
        const fullKey = this.generateKey(key, category, options.prefix);
        const ttl = options.ttl || CATEGORY_TTLS[category];
        try {
            const serialized = options.serialize === false ? value : JSON.stringify(value);
            // Try Redis first if connected
            if (this.redisConnected && this.redis) {
                await this.redis.setex(fullKey, ttl, serialized);
            }
            // Also set in memory cache if Redis fails or as fallback
            if (!this.redisConnected || options.fallbackToMemory !== false) {
                this.memoryCache.set(fullKey, value, ttl);
            }
            // Update category size
            if (this.metrics.categories[category]) {
                this.metrics.categories[category].size = this.memoryCache.keys().filter(k => k.includes(category)).length;
            }
        }
        catch (error) {
            logger.error('UnifiedCache', 'Set error', { key: fullKey, error });
            this.metrics.errors++;
            // Try memory cache as fallback
            try {
                this.memoryCache.set(fullKey, value, ttl);
            }
            catch (memError) {
                logger.error('UnifiedCache', 'Memory cache set error', { key: fullKey, error: memError });
            }
        }
    }
    async delete(key, options = {}) {
        const category = options.category || CacheCategory.DEFAULT;
        const fullKey = this.generateKey(key, category, options.prefix);
        try {
            // Delete from Redis
            if (this.redisConnected && this.redis) {
                await this.redis.del(fullKey);
            }
            // Delete from memory cache
            this.memoryCache.del(fullKey);
        }
        catch (error) {
            logger.error('UnifiedCache', 'Delete error', { key: fullKey, error });
            this.metrics.errors++;
        }
    }
    async deletePattern(pattern, category) {
        let deletedCount = 0;
        try {
            const searchPattern = category
                ? `degentalk:${category}:${pattern}*`
                : `degentalk:*${pattern}*`;
            // Delete from Redis
            if (this.redisConnected && this.redis) {
                const keys = await this.redis.keys(searchPattern);
                if (keys.length > 0) {
                    deletedCount += await this.redis.del(...keys);
                }
            }
            // Delete from memory cache
            const memoryKeys = this.memoryCache.keys().filter(key => key.includes(pattern) && (!category || key.includes(category)));
            memoryKeys.forEach(key => this.memoryCache.del(key));
            deletedCount += memoryKeys.length;
            logger.info('UnifiedCache', 'Pattern deleted', { pattern, category, count: deletedCount });
        }
        catch (error) {
            logger.error('UnifiedCache', 'Delete pattern error', { pattern, error });
            this.metrics.errors++;
        }
        return deletedCount;
    }
    async clear(category) {
        try {
            if (category) {
                await this.deletePattern('*', category);
            }
            else {
                // Clear Redis
                if (this.redisConnected && this.redis) {
                    const keys = await this.redis.keys('degentalk:*');
                    if (keys.length > 0) {
                        await this.redis.del(...keys);
                    }
                }
                // Clear memory cache
                this.memoryCache.flushAll();
            }
            logger.info('UnifiedCache', 'Cache cleared', { category });
        }
        catch (error) {
            logger.error('UnifiedCache', 'Clear error', { category, error });
            this.metrics.errors++;
        }
    }
    getMetrics() {
        return { ...this.metrics };
    }
    getHealth() {
        const errorRate = this.metrics.errors / (this.metrics.hits + this.metrics.misses + this.metrics.errors) * 100;
        const memoryPressure = this.metrics.memoryUsage / this.maxMemoryMB * 100;
        let status = 'healthy';
        if (!this.redisConnected || errorRate > 10 || memoryPressure > 90) {
            status = 'unhealthy';
        }
        else if (errorRate > 5 || memoryPressure > 70) {
            status = 'degraded';
        }
        return {
            status,
            redisAvailable: this.redisConnected,
            memoryPressure,
            errorRate,
            hitRate: this.metrics.hitRate
        };
    }
    // Method to create cache key from method arguments
    createMethodCacheKey(className, methodName, args) {
        const argsHash = createHash('md5')
            .update(JSON.stringify(args))
            .digest('hex')
            .substring(0, 8);
        return `${className}:${methodName}:${argsHash}`;
    }
    // Warmup cache with predefined data
    async warmup(data) {
        logger.info('UnifiedCache', 'Starting cache warmup', { items: data.length });
        for (const item of data) {
            await this.set(item.key, item.value, item.options);
        }
        logger.info('UnifiedCache', 'Cache warmup completed');
    }
}
// Export singleton instance
export const cacheService = new UnifiedCacheService();
// Cache decorators
export function Cache(options = {}) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const className = target.constructor.name;
        descriptor.value = async function (...args) {
            const cacheKey = cacheService.createMethodCacheKey(className, propertyKey, args);
            // Try to get from cache
            const cached = await cacheService.get(cacheKey, options);
            if (cached !== null) {
                return cached;
            }
            // Execute method and cache result
            const result = await originalMethod.apply(this, args);
            if (result !== null && result !== undefined) {
                await cacheService.set(cacheKey, result, options);
            }
            return result;
        };
        return descriptor;
    };
}
// Convenience decorators with preset TTLs
export function CacheMinute(category) {
    return Cache({ ttl: 60, category });
}
export function CacheHour(category) {
    return Cache({ ttl: 3600, category });
}
export function CacheDay(category) {
    return Cache({ ttl: 86400, category });
}
// Category-specific decorators
export const CacheAuth = () => Cache({ category: CacheCategory.AUTH });
export const CacheUser = () => Cache({ category: CacheCategory.USER });
export const CacheForum = () => Cache({ category: CacheCategory.FORUM });
export const CacheAdmin = () => Cache({ category: CacheCategory.ADMIN });
export const CacheRealtime = () => Cache({ category: CacheCategory.REALTIME });
