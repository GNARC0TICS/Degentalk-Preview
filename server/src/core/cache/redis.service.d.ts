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
export interface CacheOptions {
    ttl?: number;
    prefix?: string;
    serialize?: boolean;
}
export interface CacheMetrics {
    hits: number;
    misses: number;
    errors: number;
    hitRate: number;
}
declare class RedisCacheService {
    private redis;
    private connected;
    private fallbackCache;
    private metrics;
    constructor();
    private initializeRedis;
    private startMetricsCalculation;
    get<T>(key: string, options?: CacheOptions): Promise<T | null>;
    set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
    delete(key: string, options?: CacheOptions): Promise<void>;
    clear(prefix?: string): Promise<void>;
    private generateKey;
    private cleanupFallbackCache;
    getMetrics(): CacheMetrics;
    getStats(): {
        connected: boolean;
        redisAvailable: boolean;
        fallbackCacheSize: number;
        metrics: CacheMetrics;
    };
}
export declare const redisCacheService: RedisCacheService;
export declare function Cache(options?: CacheOptions): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const CacheMinute: (minutes?: number) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const CacheHour: (hours?: number) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const CacheDay: (days?: number) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export {};
