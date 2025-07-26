import type { Request, Response } from 'express';
import { userService } from '@core/services/user.service';
import { z } from 'zod';
import { cacheService, CacheCategory } from '@core/cache/unified-cache.service';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';
import { validateRequestBody } from '../../admin.validation';

// Mock boundary pattern - replace with actual implementation
class AdminOperationBoundary {
	constructor(private config: any) {}
	async execute(fn: () => Promise<any>) {
		try {
			const data = await fn();
			return { success: true, data };
		} catch (error: any) {
			return { success: false, error: { message: error.message, httpStatus: 500 } };
		}
	}
}

function formatAdminResponse(data: any, operation: string, entityType: string) {
	return data;
}

const clearCacheSchema = z.object({
	pattern: z.string().optional(),
	category: z.enum(['settings', 'users', 'analytics', 'forum', 'all']).optional()
});

const warmupCacheSchema = z.object({
	targets: z.array(z.enum(['settings', 'usergroups', 'forumconfig', 'analytics'])).optional()
});

export class AdminCacheController {
	/**
	 * Get cache metrics and health status
	 */
	async getMetrics(req: Request, res: Response) {
		const boundary =
			req.adminBoundary?.('GET_CACHE_METRICS', 'cache') ||
			new AdminOperationBoundary({
				operation: 'GET_CACHE_METRICS',
				entityType: 'cache',
				userId: (userService.getUserFromRequest(req) as any)?.id,
				timestamp: new Date()
			});

		const result = await boundary.execute(async () => {
			const metrics = cacheService.getMetrics();
			const health = cacheService.getHealth();

			return formatAdminResponse(
				{
					metrics,
					health,
					recommendations: this.generateRecommendations(metrics, health)
				},
				'GET_CACHE_METRICS',
				'cache'
			);
		});

		if (result.success) {
			return sendSuccessResponse(res, result.data);
		} else {
			return sendErrorResponse(
				res,
				result.error?.message || 'Failed to get cache metrics',
				result.error?.httpStatus || 500
			);
		}
	}

	/**
	 * Clear cache by pattern or category
	 */
	async clearCache(req: Request, res: Response) {
		const validatedData = validateRequestBody(req, res, clearCacheSchema);
		if (!validatedData) return;

		const boundary =
			req.adminBoundary?.('CLEAR_CACHE', 'cache') ||
			new AdminOperationBoundary({
				operation: 'CLEAR_CACHE',
				entityType: 'cache',
				userId: (userService.getUserFromRequest(req) as any)?.id,
				timestamp: new Date()
			});

		const result = await boundary.execute(async () => {
			let clearedCount = 0;

			if (validatedData.category === 'all') {
				await cacheService.clear();
				clearedCount = -1; // Indicate full flush
			} else if (validatedData.pattern) {
				clearedCount = await cacheService.deletePattern(validatedData.pattern);
			} else if (validatedData.category) {
				// Map string category to CacheCategory enum
				let category: CacheCategory;
				switch (validatedData.category) {
					case 'settings': category = CacheCategory.SETTINGS; break;
					case 'users': category = CacheCategory.USER; break;
					case 'analytics': category = CacheCategory.ANALYTICS; break;
					case 'forum': category = CacheCategory.FORUM; break;
					default: category = CacheCategory.DEFAULT;
				}
				await cacheService.clear(category);
				clearedCount = -1; // Indicate category clear
			}

			return formatAdminResponse(
				{
					clearedCount,
					pattern: validatedData.pattern,
					category: validatedData.category,
					timestamp: new Date()
				},
				'CLEAR_CACHE',
				'cache'
			);
		});

		if (result.success) {
			const message =
				result.data.clearedCount === -1
					? 'All cache cleared successfully'
					: `${result.data.clearedCount} cache entries cleared`;

			return sendSuccessResponse(res, result.data, message);
		} else {
			return sendErrorResponse(
				res,
				result.error?.message || 'Failed to clear cache',
				result.error?.httpStatus || 500
			);
		}
	}

	/**
	 * Warm up cache with critical data
	 */
	async warmupCache(req: Request, res: Response) {
		const validatedData = validateRequestBody(req, res, warmupCacheSchema);
		if (!validatedData) return;

		const boundary =
			req.adminBoundary?.('WARMUP_CACHE', 'cache') ||
			new AdminOperationBoundary({
				operation: 'WARMUP_CACHE',
				entityType: 'cache',
				userId: (userService.getUserFromRequest(req) as any)?.id,
				timestamp: new Date()
			});

		const result = await boundary.execute(async () => {
			const targets = validatedData.targets || ['settings', 'usergroups', 'forumconfig'];
			const warmupFetchers = this.createWarmupFetchers(targets);

			// Convert warmup fetchers to unified cache format
			const warmupData = [];
			for (const [key, fetcher] of Object.entries(warmupFetchers)) {
				const value = await fetcher();
				const [categoryPart] = key.split(':');
				let category = CacheCategory.DEFAULT;
				
				// Map to appropriate categories
				if (categoryPart === 'settings') category = CacheCategory.SETTINGS;
				else if (categoryPart === 'usergroups') category = CacheCategory.USER;
				else if (categoryPart === 'forumconfig') category = CacheCategory.FORUM;
				else if (categoryPart === 'analytics') category = CacheCategory.ANALYTICS;
				
				warmupData.push({ key, value, options: { category } });
			}
			
			await cacheService.warmup(warmupData);

			return formatAdminResponse(
				{
					targets,
					warmedAt: new Date()
				},
				'WARMUP_CACHE',
				'cache'
			);
		});

		if (result.success) {
			return sendSuccessResponse(res, result.data, 'Cache warmup completed successfully');
		} else {
			return sendErrorResponse(
				res,
				result.error?.message || 'Failed to warm up cache',
				result.error?.httpStatus || 500
			);
		}
	}

	/**
	 * Get cache usage analytics
	 */
	async getAnalytics(req: Request, res: Response) {
		const boundary =
			req.adminBoundary?.('GET_CACHE_ANALYTICS', 'cache') ||
			new AdminOperationBoundary({
				operation: 'GET_CACHE_ANALYTICS',
				entityType: 'cache',
				userId: (userService.getUserFromRequest(req) as any)?.id,
				timestamp: new Date()
			});

		const result = await boundary.execute(async () => {
			const metrics = cacheService.getMetrics();
			const health = cacheService.getHealth();

			// Calculate analytics
			const analytics = {
				performance: {
					hitRate: metrics.hitRate,
					hitRateGrade: this.getHitRateGrade(metrics.hitRate),
					totalRequests: metrics.hits + metrics.misses,
					efficiency: metrics.hits > 0 ? (metrics.hits / (metrics.hits + metrics.misses)) * 100 : 0
				},
				usage: {
					currentSize: metrics.size,
					maxSize: 1000, // From cache config
					utilizationPercent: (metrics.size / 1000) * 100
				},
				categories: metrics.categories,
				recommendations: this.generatePerformanceRecommendations(metrics)
			};

			return formatAdminResponse(analytics, 'GET_CACHE_ANALYTICS', 'cache');
		});

		if (result.success) {
			return sendSuccessResponse(res, result.data);
		} else {
			return sendErrorResponse(
				res,
				result.error?.message || 'Failed to get cache analytics',
				result.error?.httpStatus || 500
			);
		}
	}

	// Private helper methods

	private getCategoryPattern(category: string): string {
		const patterns = {
			settings: 'settings:',
			users: 'usersearch:',
			analytics: 'analytics:',
			forum: 'forumconfig:'
		};
		return patterns[category] || category;
	}

	private createWarmupFetchers(targets: string[]): Record<string, () => Promise<any>> {
		const fetchers: Record<string, () => Promise<any>> = {};

		if (targets.includes('settings')) {
			// Import will be resolved at runtime
			fetchers['settings:all'] = async () => {
				const { settingsQueryService } = await import(
					'../settings/services/settings-query.service'
				);
				return settingsQueryService.getAllSettings();
			};
		}

		if (targets.includes('usergroups')) {
			fetchers['usergroups:all'] = async () => {
				// Mock user groups data - replace with actual service
				return [];
			};
		}

		if (targets.includes('forumconfig')) {
			fetchers['forumconfig:structure'] = async () => {
				// Mock forum config - replace with actual service
				return {};
			};
		}

		return fetchers;
	}

	private generateRecommendations(metrics: any, health: any): string[] {
		const recommendations: string[] = [];

		if (health.status === 'degraded') {
			recommendations.push(
				'Cache performance is degraded - consider investigating hit rate or capacity issues'
			);
		}

		if (metrics.hitRate < 0.5) {
			recommendations.push(
				'Low cache hit rate detected - review caching strategy and TTL settings'
			);
		}

		if (metrics.size > 800) {
			recommendations.push(
				'Cache approaching capacity limit - consider increasing max keys or clearing old entries'
			);
		}

		if (metrics.hits === 0 && metrics.misses > 10) {
			recommendations.push('No cache hits detected - verify cache is properly integrated');
		}

		return recommendations;
	}

	private getHitRateGrade(hitRate: number): string {
		if (hitRate >= 0.8) return 'Excellent';
		if (hitRate >= 0.6) return 'Good';
		if (hitRate >= 0.4) return 'Fair';
		if (hitRate >= 0.2) return 'Poor';
		return 'Critical';
	}

	private generatePerformanceRecommendations(metrics: any): string[] {
		const recommendations: string[] = [];

		if (metrics.hitRate < 0.3) {
			recommendations.push('Consider longer TTL for stable data like settings');
		}

		if (metrics.size < 100) {
			recommendations.push('Cache utilization is low - consider adding more cacheable endpoints');
		}

		if (metrics.sets > metrics.hits * 2) {
			recommendations.push('High set-to-hit ratio indicates potential cache thrashing');
		}

		return recommendations;
	}
}
