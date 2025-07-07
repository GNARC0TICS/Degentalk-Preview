/**
 * Admin Caching Service
 *
 * Provides intelligent caching for admin panel data with automatic invalidation
 * and performance optimization for frequently accessed data
 */

import NodeCache from 'node-cache';
import { AdminError, AdminErrorCodes } from '../admin.errors';
import type { EntityId } from '@shared/types';
import { logger } from "../../../core/logger";

export interface CacheConfig {
	defaultTTL: number; // Time to live in seconds
	checkPeriod: number; // Check for expired keys interval
	maxKeys: number; // Maximum number of cached keys
}

export interface CacheMetrics {
	hits: number;
	misses: number;
	sets: number;
	deletes: number;
	size: number;
	hitRate: number;
}

export class AdminCacheService {
	private cache: NodeCache;
	private metrics: CacheMetrics;

	// Cache categories with different TTL strategies
	private static readonly CACHE_CATEGORIES = {
		SETTINGS: {
			prefix: 'settings:',
			ttl: 3600, // 1 hour - settings change rarely
			description: 'Site settings and configuration'
		},
		USER_GROUPS: {
			prefix: 'usergroups:',
			ttl: 1800, // 30 minutes - groups change occasionally
			description: 'User groups and roles'
		},
		ANALYTICS: {
			prefix: 'analytics:',
			ttl: 300, // 5 minutes - analytics need to be relatively fresh
			description: 'Dashboard analytics and stats'
		},
		USER_SEARCH: {
			prefix: 'usersearch:',
			ttl: 300, // 5 minutes - user data changes frequently
			description: 'User search results'
		},
		FORUM_CONFIG: {
			prefix: 'forumconfig:',
			ttl: 1800, // 30 minutes - forum structure changes rarely
			description: 'Forum categories and configuration'
		},
		AUDIT_SUMMARY: {
			prefix: 'auditsummary:',
			ttl: 900, // 15 minutes - audit summaries for dashboards
			description: 'Audit log summaries and counts'
		}
	} as const;

	constructor(config: Partial<CacheConfig> = {}) {
		const defaultConfig: CacheConfig = {
			defaultTTL: 600, // 10 minutes default
			checkPeriod: 120, // Check every 2 minutes
			maxKeys: 1000
		};

		const finalConfig = { ...defaultConfig, ...config };

		this.cache = new NodeCache({
			stdTTL: finalConfig.defaultTTL,
			checkperiod: finalConfig.checkPeriod,
			maxKeys: finalConfig.maxKeys,
			deleteOnExpire: true,
			useClones: false // Better performance, but be careful with object mutations
		});

		this.metrics = {
			hits: 0,
			misses: 0,
			sets: 0,
			deletes: 0,
			size: 0,
			hitRate: 0
		};

		// Set up cache event listeners for metrics
		this.setupEventListeners();
	}

	/**
	 * Get data from cache with automatic metrics tracking
	 */
	async get<T>(key: string): Promise<T | null> {
		try {
			const value = this.cache.get<T>(key);

			if (value !== undefined) {
				this.metrics.hits++;
				this.updateHitRate();
				return value;
			} else {
				this.metrics.misses++;
				this.updateHitRate();
				return null;
			}
		} catch (error) {
			logger.error('Cache get error:', error);
			return null;
		}
	}

	/**
	 * Set data in cache with category-specific TTL
	 */
	async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
		try {
			// Determine TTL based on key prefix if not explicitly provided
			const finalTTL = ttl || this.getTTLForKey(key);

			const success = this.cache.set(key, value, finalTTL);

			if (success) {
				this.metrics.sets++;
				this.updateSize();
			}

			return success;
		} catch (error) {
			logger.error('Cache set error:', error);
			return false;
		}
	}

	/**
	 * Delete specific cache entry
	 */
	async delete(key: string): Promise<boolean> {
		try {
			const deleted = this.cache.del(key);

			if (deleted > 0) {
				this.metrics.deletes++;
				this.updateSize();
				return true;
			}

			return false;
		} catch (error) {
			logger.error('Cache delete error:', error);
			return false;
		}
	}

	/**
	 * Clear cache by pattern (category-based invalidation)
	 */
	async clearByPattern(pattern: string): Promise<number> {
		try {
			const keys = this.cache.keys();
			const matchingKeys = keys.filter((key) => key.includes(pattern));

			let deletedCount = 0;
			for (const key of matchingKeys) {
				if (this.cache.del(key)) {
					deletedCount++;
				}
			}

			this.metrics.deletes += deletedCount;
			this.updateSize();

			return deletedCount;
		} catch (error) {
			logger.error('Cache clear by pattern error:', error);
			return 0;
		}
	}

	/**
	 * Get or set pattern - retrieval with fallback
	 */
	async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
		try {
			// Try to get from cache first
			const cached = await this.get<T>(key);

			if (cached !== null) {
				return cached;
			}

			// Cache miss - fetch data
			const data = await fetcher();

			// Cache the result
			await this.set(key, data, ttl);

			return data;
		} catch (error) {
			logger.error('Cache getOrSet error:', error);
			// On error, still try to return fresh data
			return await fetcher();
		}
	}

	/**
	 * Invalidate caches related to specific entities
	 */
	async invalidateEntity(entityType: string, entityId?: string | EntityId): Promise<void> {
		const patterns = this.getInvalidationPatterns(entityType, entityId);

		for (const pattern of patterns) {
			await this.clearByPattern(pattern);
		}
	}

	/**
	 * Get cache statistics and health metrics
	 */
	getMetrics(): CacheMetrics & { categories: typeof AdminCacheService.CACHE_CATEGORIES } {
		return {
			...this.metrics,
			categories: AdminCacheService.CACHE_CATEGORIES
		};
	}

	/**
	 * Warm up cache with critical admin data
	 */
	async warmup(dataFetchers: Record<string, () => Promise<any>>): Promise<void> {
		const promises = Object.entries(dataFetchers).map(async ([key, fetcher]) => {
			try {
				const data = await fetcher();
				await this.set(key, data);
			} catch (error) {
				logger.error(`Cache warmup failed for ${key}:`, error);
			}
		});

		await Promise.allSettled(promises);
	}

	/**
	 * Health check for cache service
	 */
	getHealth(): { status: 'healthy' | 'degraded' | 'unhealthy'; details: any } {
		const stats = this.cache.getStats();
		const hitRate = this.metrics.hitRate;

		let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

		if (hitRate < 0.3) {
			// Less than 30% hit rate
			status = 'degraded';
		}

		if (stats.keys > 900) {
			// Near max capacity
			status = 'degraded';
		}

		return {
			status,
			details: {
				...stats,
				metrics: this.metrics,
				memoryUsage: process.memoryUsage()
			}
		};
	}

	/**
	 * Administrative cache management
	 */
	async flush(): Promise<void> {
		this.cache.flushAll();
		this.resetMetrics();
	}

	// Private helper methods

	private getTTLForKey(key: string): number {
		for (const category of Object.values(AdminCacheService.CACHE_CATEGORIES)) {
			if (key.startsWith(category.prefix)) {
				return category.ttl;
			}
		}
		return 600; // Default 10 minutes
	}

	private getInvalidationPatterns(entityType: string, entityId?: string | EntityId): string[] {
		const patterns: string[] = [];

		switch (entityType) {
			case 'user':
				patterns.push('usersearch:', 'analytics:users');
				if (entityId) patterns.push(`user:${entityId}`);
				break;
			case 'setting':
				patterns.push('settings:');
				break;
			case 'usergroup':
				patterns.push('usergroups:', 'usersearch:');
				break;
			case 'forum':
				patterns.push('forumconfig:', 'analytics:forum');
				break;
			case 'audit':
				patterns.push('auditsummary:');
				break;
			default:
				patterns.push('analytics:'); // Invalidate analytics for unknown entities
		}

		return patterns;
	}

	private setupEventListeners(): void {
		this.cache.on('set', () => {
			this.updateSize();
		});

		this.cache.on('del', () => {
			this.updateSize();
		});

		this.cache.on('expired', () => {
			this.updateSize();
		});
	}

	private updateHitRate(): void {
		const totalRequests = this.metrics.hits + this.metrics.misses;
		this.metrics.hitRate = totalRequests > 0 ? this.metrics.hits / totalRequests : 0;
	}

	private updateSize(): void {
		this.metrics.size = this.cache.keys().length;
	}

	private resetMetrics(): void {
		this.metrics = {
			hits: 0,
			misses: 0,
			sets: 0,
			deletes: 0,
			size: 0,
			hitRate: 0
		};
	}
}

// Cache key builders for consistency
export class AdminCacheKeys {
	static settings(group?: string, key?: string): string {
		if (group && key) return `settings:${group}:${key}`;
		if (group) return `settings:${group}`;
		return 'settings:all';
	}

	static userGroups(): string {
		return 'usergroups:all';
	}

	static userSearch(term: string, filters?: Record<string, any>): string {
		const filterHash = filters
			? Buffer.from(JSON.stringify(filters)).toString('base64').slice(0, 10)
			: '';
		return `usersearch:${term}:${filterHash}`;
	}

	static analytics(type: string, timeframe: string): string {
		return `analytics:${type}:${timeframe}`;
	}

	static forumConfig(): string {
		return 'forumconfig:structure';
	}

	static auditSummary(period: string): string {
		return `auditsummary:${period}`;
	}
}

// Export singleton instance
export const adminCacheService = new AdminCacheService();

// Export cache decorator for easy integration
export function CacheResult(ttl?: number) {
	return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
		const method = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			const cacheKey = `method:${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;

			return await adminCacheService.getOrSet(cacheKey, () => method.apply(this, args), ttl);
		};
	};
}
