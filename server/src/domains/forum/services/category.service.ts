/**
 * Forum Category Service
 *
 * QUALITY IMPROVEMENT: Extracted from forum.service.ts god object
 * Handles category-specific operations with proper separation of concerns
 */

import { db } from '@db';
import { logger } from '@server/src/core/logger';
import { forumCategories, threads, posts, users as usersTable } from '@schema';
import { sql, desc, eq, count, isNull } from 'drizzle-orm';
import type { ForumCategoryWithStats } from '../../../../db/types/forum.types';

// Simple in-memory cache for categories
const CACHE_DURATION_MS = 30 * 1000; // 30 seconds
let categoriesCache: {
	timestamp: number;
	data: ForumCategoryWithStats[];
} | null = null;

export class CategoryService {
	/**
	 * Get all categories with forum statistics
	 */
	async getCategoriesWithStats(): Promise<ForumCategoryWithStats[]> {
		try {
			// Check cache first
			if (categoriesCache && Date.now() - categoriesCache.timestamp < CACHE_DURATION_MS) {
				logger.info('CategoryService', 'Returning cached categories');
				return categoriesCache.data;
			}

			logger.info('CategoryService', 'Fetching categories with stats from database');

			const categoriesWithStats = await db
				.select({
					id: forumCategories.id,
					name: forumCategories.name,
					slug: forumCategories.slug,
					description: forumCategories.description,
					position: forumCategories.position,
					isVisible: forumCategories.isVisible,
					parentId: forumCategories.parentId,
					threadCount: sql<number>`COALESCE(${count(threads.id)}, 0)`,
					postCount: sql<number>`COALESCE(SUM(${threads.postCount}), 0)`,
					lastPostAt: sql<Date | null>`MAX(${posts.createdAt})`,
					createdAt: forumCategories.createdAt,
					updatedAt: forumCategories.updatedAt,
					pluginData: forumCategories.pluginData
				})
				.from(forumCategories)
				.leftJoin(threads, eq(forumCategories.id, threads.categoryId))
				.leftJoin(posts, eq(threads.id, posts.threadId))
				.groupBy(forumCategories.id)
				.orderBy(forumCategories.position, forumCategories.name);

			// Update cache
			categoriesCache = {
				timestamp: Date.now(),
				data: categoriesWithStats
			};

			logger.info(
				'CategoryService',
				`Successfully fetched ${categoriesWithStats.length} categories`
			);
			return categoriesWithStats;
		} catch (error) {
			logger.error('CategoryService', 'Error fetching categories with stats', { error });
			throw error;
		}
	}

	/**
	 * Get hierarchical category tree
	 */
	async getCategoriesTree(
		options: {
			includeHidden?: boolean;
			includeEmptyStats?: boolean;
		} = {}
	): Promise<ForumCategoryWithStats[]> {
		try {
			const { includeHidden = false } = options;

			const baseQuery = db
				.select({
					id: forumCategories.id,
					name: forumCategories.name,
					slug: forumCategories.slug,
					description: forumCategories.description,
					position: forumCategories.position,
					isVisible: forumCategories.isVisible,
					parentId: forumCategories.parentId,
					threadCount: sql<number>`COALESCE(${count(threads.id)}, 0)`,
					postCount: sql<number>`COALESCE(SUM(${threads.postCount}), 0)`,
					lastPostAt: sql<Date | null>`MAX(${posts.createdAt})`,
					createdAt: forumCategories.createdAt,
					updatedAt: forumCategories.updatedAt,
					pluginData: forumCategories.pluginData
				})
				.from(forumCategories)
				.leftJoin(threads, eq(forumCategories.id, threads.categoryId))
				.leftJoin(posts, eq(threads.id, posts.threadId))
				.groupBy(forumCategories.id);

			if (!includeHidden) {
				baseQuery.where(eq(forumCategories.isVisible, true));
			}

			const categories = await baseQuery.orderBy(forumCategories.position, forumCategories.name);

			// Build tree structure
			const rootCategories = categories.filter((cat) => cat.parentId === null);
			const childCategories = categories.filter((cat) => cat.parentId !== null);

			// Attach children to parents
			const buildTree = (parentCategories: ForumCategoryWithStats[]): ForumCategoryWithStats[] => {
				return parentCategories.map((parent) => ({
					...parent,
					children: childCategories.filter((child) => child.parentId === parent.id)
				}));
			};

			return buildTree(rootCategories);
		} catch (error) {
			logger.error('CategoryService', 'Error fetching category tree', { error });
			throw error;
		}
	}

	/**
	 * Get category by slug
	 */
	async getCategoryBySlug(slug: string): Promise<ForumCategoryWithStats | null> {
		try {
			const [category] = await db
				.select({
					id: forumCategories.id,
					name: forumCategories.name,
					slug: forumCategories.slug,
					description: forumCategories.description,
					position: forumCategories.position,
					isVisible: forumCategories.isVisible,
					parentId: forumCategories.parentId,
					threadCount: sql<number>`COALESCE(${count(threads.id)}, 0)`,
					postCount: sql<number>`COALESCE(SUM(${threads.postCount}), 0)`,
					lastPostAt: sql<Date | null>`MAX(${posts.createdAt})`,
					createdAt: forumCategories.createdAt,
					updatedAt: forumCategories.updatedAt,
					pluginData: forumCategories.pluginData
				})
				.from(forumCategories)
				.leftJoin(threads, eq(forumCategories.id, threads.categoryId))
				.leftJoin(posts, eq(threads.id, posts.threadId))
				.where(eq(forumCategories.slug, slug))
				.groupBy(forumCategories.id);

			return category || null;
		} catch (error) {
			logger.error('CategoryService', 'Error fetching category by slug', { slug, error });
			throw error;
		}
	}

	/**
	 * Clear categories cache
	 */
	clearCache(): void {
		categoriesCache = null;
		logger.info('CategoryService', 'Categories cache cleared');
	}

	/**
	 * Get category statistics
	 */
	async getCategoryStats(categoryId: number): Promise<{
		threadCount: number;
		postCount: number;
		lastPostAt: Date | null;
	}> {
		try {
			const [stats] = await db
				.select({
					threadCount: sql<number>`COALESCE(${count(threads.id)}, 0)`,
					postCount: sql<number>`COALESCE(SUM(${threads.postCount}), 0)`,
					lastPostAt: sql<Date | null>`MAX(${posts.createdAt})`
				})
				.from(forumCategories)
				.leftJoin(threads, eq(forumCategories.id, threads.categoryId))
				.leftJoin(posts, eq(threads.id, posts.threadId))
				.where(eq(forumCategories.id, categoryId))
				.groupBy(forumCategories.id);

			return stats || { threadCount: 0, postCount: 0, lastPostAt: null };
		} catch (error) {
			logger.error('CategoryService', 'Error fetching category stats', { categoryId, error });
			throw error;
		}
	}
}

// Export singleton instance
export const categoryService = new CategoryService();
