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
export declare enum CacheCategory {
    DEFAULT = "default",
    AUTH = "auth",
    USER = "user",
    FORUM = "forum",
    THREAD = "thread",
    SHOUTBOX = "shoutbox",
    ANALYTICS = "analytics",
    SETTINGS = "settings",
    ADMIN = "admin",
    REALTIME = "realtime",
    SESSION = "session",
    RATE_LIMIT = "rate_limit"
}
export interface CacheOptions {
    ttl?: number;
    category?: CacheCategory;
    prefix?: string;
    serialize?: boolean;
    fallbackToMemory?: boolean;
}
export interface CacheMetrics {
    hits: number;
    misses: number;
    errors: number;
    evictions: number;
    hitRate: number;
    memoryUsage: number;
    redisConnected: boolean;
    categories: Record<string, {
        hits: number;
        misses: number;
        size: number;
    }>;
}
export interface CacheHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    redisAvailable: boolean;
    memoryPressure: number;
    errorRate: number;
    hitRate: number;
}
declare class UnifiedCacheService {
    private redis;
    private memoryCache;
    private redisConnected;
    private metrics;
    private readonly maxMemoryMB;
    constructor();
    private initializeRedis;
    private startMetricsCalculation;
    private generateKey;
    private updateCategoryMetrics;
    get<T>(key: string, options?: CacheOptions): Promise<T | null>;
    set(key: string, value: any, options?: CacheOptions): Promise<void>;
    delete(key: string, options?: CacheOptions): Promise<void>;
    deletePattern(pattern: string, category?: CacheCategory): Promise<number>;
    clear(category?: CacheCategory): Promise<void>;
    getMetrics(): CacheMetrics;
    getHealth(): CacheHealth;
    createMethodCacheKey(className: string, methodName: string, args: any[]): string;
    warmup(data: Array<{
        key: string;
        value: any;
        options?: CacheOptions;
    }>): Promise<void>;
}
export declare const cacheService: UnifiedCacheService;
export declare function Cache(options?: CacheOptions): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function CacheMinute(category?: CacheCategory): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function CacheHour(category?: CacheCategory): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function CacheDay(category?: CacheCategory): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const CacheAuth: () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const CacheUser: () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const CacheForum: () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const CacheAdmin: () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const CacheRealtime: () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export type { CacheOptions, CacheMetrics, CacheHealth };
