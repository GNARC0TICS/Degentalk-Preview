/**
 * Forum Cache Service
 *
 * QUALITY IMPROVEMENT: Extracted from forum.service.ts god object
 * Handles caching logic for forum data with proper invalidation
 */

import { logger } from '@core/logger';
import type { ForumCategoryWithStats } from '@shared/types/core/forum.types';

// Cache configuration
const CACHE_DURATION_MS = 30 * 1000; // 30 seconds

interface CacheEntry<T> {
	timestamp: number;
	data: T;
}

export class CacheService {
	private categoriesCache: CacheEntry<ForumCategoryWithStats[]> | null = null;

	/**
	 * Get cached categories if still valid
	 */
	getCachedCategories(): ForumCategoryWithStats[] | null {
		if (
			this.categoriesCache &&
			Date.now() - this.categoriesCache.timestamp < CACHE_DURATION_MS &&
			this.categoriesCache.data.length > 0
		) {
			logger.info('CacheService', 'Returning cached categories');
			return this.categoriesCache.data;
		}
		return null;
	}

	/**
	 * Cache categories data
	 */
	setCachedCategories(categories: ForumCategoryWithStats[]): void {
		if (categories.length > 0) {
			this.categoriesCache = {
				timestamp: Date.now(),
				data: categories
			};
			logger.debug('CacheService', `Cached ${categories.length} categories`);
		}
	}

	/**
	 * Clear categories cache
	 */
	clearCategoriesCache(): void {
		this.categoriesCache = null;
		logger.info('CacheService', 'Categories cache cleared');
	}

	/**
	 * Check if cache is valid
	 */
	isCacheValid(cacheEntry: CacheEntry<any> | null): boolean {
		if (!cacheEntry) {
			return false;
		}
		return Date.now() - cacheEntry.timestamp < CACHE_DURATION_MS;
	}

	/**
	 * Get cache age in seconds
	 */
	getCacheAge(cacheEntry: CacheEntry<any> | null): number {
		if (!cacheEntry) {
			return -1;
		}
		return Math.floor((Date.now() - cacheEntry.timestamp) / 1000);
	}

	/**
	 * Get cache stats for monitoring
	 */
	getCacheStats(): {
		categoriesCache: {
			isValid: boolean;
			ageSeconds: number;
			itemCount: number;
		};
	} {
		return {
			categoriesCache: {
				isValid: this.isCacheValid(this.categoriesCache),
				ageSeconds: this.getCacheAge(this.categoriesCache),
				itemCount: this.categoriesCache?.data?.length || 0
			}
		};
	}

	/**
	 * Clear all caches
	 */
	clearAllCaches(): void {
		this.clearCategoriesCache();
		logger.info('CacheService', 'All caches cleared');
	}
}

// Export singleton instance
export const forumCacheService = new CacheService();
