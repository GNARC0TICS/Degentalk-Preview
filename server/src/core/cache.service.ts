/**
 * Redis Cache Service for Development
 *
 * Replaces unbounded in-memory cache with Redis for better development experience.
 * Falls back to in-memory cache if Redis is unavailable.
 */

import { logger } from './logger';

interface CacheEntry {
	data: any;
	timestamp: number;
	ttl: number;
}

class InMemoryCache {
	private cache = new Map<string, CacheEntry>();
	private readonly DEFAULT_TTL = 60 * 1000; // 60 seconds

	get(key: string): any | null {
		const entry = this.cache.get(key);
		if (!entry) return null;

		if (Date.now() - entry.timestamp > entry.ttl) {
			this.cache.delete(key);
			return null;
		}

		return entry.data;
	}

	set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
			ttl
		});
	}

	delete(key: string): void {
		this.cache.delete(key);
	}

	clear(): void {
		this.cache.clear();
	}

	// Clean up expired entries
	cleanup(): void {
		const now = Date.now();
		for (const [key, entry] of this.cache.entries()) {
			if (now - entry.timestamp > entry.ttl) {
				this.cache.delete(key);
			}
		}
	}

	// Get cache statistics
	getStats() {
		return {
			type: 'memory',
			size: this.cache.size,
			keys: Array.from(this.cache.keys())
		};
	}
}

class RedisCacheAdapter {
	private redis: any = null;
	private fallback = new InMemoryCache();
	private connected = false;

	constructor() {
		this.initRedis();
	}

	private async initRedis() {
		try {
			// Only try Redis if explicitly configured
			const redisUrl = process.env.REDIS_URL || process.env.REDIS_CONNECTION;

			if (!redisUrl) {
				logger.info('CacheService', 'Redis not configured, using in-memory cache');
				return;
			}

			// Dynamic import to avoid requiring Redis in all environments
			const Redis = (await import('ioredis')).default;

			this.redis = new Redis(redisUrl);

			this.redis.on('error', (err: Error) => {
				logger.warn('CacheService', 'Redis error, falling back to memory', { error: err.message });
				this.connected = false;
			});

			this.redis.on('connect', () => {
				logger.info('CacheService', 'Redis connected successfully');
				this.connected = true;
			});

			// ioredis doesn't need explicit connect() call - it auto-connects
		} catch (error) {
			logger.info('CacheService', 'Redis unavailable, using in-memory cache', {
				error: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	async get(key: string): Promise<any | null> {
		if (this.connected && this.redis) {
			try {
				const cached = await this.redis.get(key);
				if (cached) {
					const parsed = JSON.parse(cached);
					// Check TTL
					if (Date.now() - parsed.timestamp <= parsed.ttl) {
						return parsed.data;
					} else {
						// Expired, clean up
						await this.redis.del(key);
					}
				}
				return null;
			} catch (error) {
				logger.warn('CacheService', 'Redis get failed, using fallback', { key });
				return this.fallback.get(key);
			}
		}

		return this.fallback.get(key);
	}

	async set(key: string, data: any, ttl: number = 60000): Promise<void> {
		const entry = {
			data,
			timestamp: Date.now(),
			ttl
		};

		if (this.connected && this.redis) {
			try {
				await this.redis.setex(key, Math.ceil(ttl / 1000), JSON.stringify(entry));
				return;
			} catch (error) {
				logger.warn('CacheService', 'Redis set failed, using fallback', { key });
			}
		}

		this.fallback.set(key, data, ttl);
	}

	async delete(key: string): Promise<void> {
		if (this.connected && this.redis) {
			try {
				await this.redis.del(key);
			} catch (error) {
				logger.warn('CacheService', 'Redis delete failed', { key });
			}
		}

		this.fallback.delete(key);
	}

	async clear(): Promise<void> {
		if (this.connected && this.redis) {
			try {
				await this.redis.flushdb();
			} catch (error) {
				logger.warn('CacheService', 'Redis clear failed', error);
			}
		}

		this.fallback.clear();
	}

	getStats() {
		if (this.connected) {
			return {
				type: 'redis',
				connected: true,
				fallback: this.fallback.getStats()
			};
		}

		return this.fallback.getStats();
	}
}

// Export singleton instances
export const legacyCacheService = new RedisCacheAdapter();
export const memoryCache = new InMemoryCache();

// Re-export new Redis service for enhanced functionality
export { redisCacheService, Cache, CacheMinute, CacheHour, CacheDay } from './cache/redis.service';

// Clean up memory cache every 5 minutes
setInterval(
	() => {
		memoryCache.cleanup();
	},
	5 * 60 * 1000
);
