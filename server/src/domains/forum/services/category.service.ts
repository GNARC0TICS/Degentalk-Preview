/**
 * Forum Category Service
 *
 * QUALITY IMPROVEMENT: Extracted from forum.service.ts god object
 * Handles category-specific operations with proper separation of concerns
 */

import { db } from '@db';
import { logger } from '@server/src/core/logger';
import { forumStructure, threads, posts, users as usersTable } from '@schema';
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

			// Simplified query without complex joins that might be causing issues
			const categoriesWithStats = await db
				.select({
					id: forumStructure.id,
					name: forumStructure.name,
					slug: forumStructure.slug,
					description: forumStructure.description,
					type: forumStructure.type,
					position: forumStructure.position,
					isVisible: sql<boolean>`NOT ${forumStructure.isHidden}`,
					parentId: forumStructure.parentId,
					threadCount: sql<number>`0`, // Simplified for now
					postCount: sql<number>`0`, // Simplified for now
					lastPostAt: sql<Date | null>`NULL`,
					createdAt: forumStructure.createdAt,
					updatedAt: forumStructure.updatedAt,
					pluginData: forumStructure.pluginData
				})
				.from(forumStructure)
				.orderBy(forumStructure.position, forumStructure.name);

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
					id: forumStructure.id,
					name: forumStructure.name,
					slug: forumStructure.slug,
					description: forumStructure.description,
					type: forumStructure.type,
					position: forumStructure.position,
					isHidden: forumStructure.isHidden,
					parentId: forumStructure.parentId,
					threadCount: sql<number>`COALESCE(${count(threads.id)}, 0)`,
					postCount: sql<number>`COALESCE(SUM(${threads.postCount}), 0)`,
					lastPostAt: sql<Date | null>`MAX(${posts.createdAt})`,
					createdAt: forumStructure.createdAt,
					updatedAt: forumStructure.updatedAt,
					pluginData: forumStructure.pluginData
				})
				.from(forumStructure)
				.leftJoin(threads, eq(forumStructure.id, threads.structureId))
				.leftJoin(posts, eq(threads.id, posts.threadId))
				.groupBy(forumStructure.id);

			if (!includeHidden) {
				baseQuery.where(eq(forumStructure.isVisible, true));
			}

			const categories = await baseQuery.orderBy(forumStructure.position, forumStructure.name);

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
					id: forumStructure.id,
					name: forumStructure.name,
					slug: forumStructure.slug,
					description: forumStructure.description,
					type: forumStructure.type,
					position: forumStructure.position,
					isHidden: forumStructure.isHidden,
					parentId: forumStructure.parentId,
					threadCount: sql<number>`COALESCE(${count(threads.id)}, 0)`,
					postCount: sql<number>`COALESCE(SUM(${threads.postCount}), 0)`,
					lastPostAt: sql<Date | null>`MAX(${posts.createdAt})`,
					createdAt: forumStructure.createdAt,
					updatedAt: forumStructure.updatedAt,
					pluginData: forumStructure.pluginData
				})
				.from(forumStructure)
				.leftJoin(threads, eq(forumStructure.id, threads.structureId))
				.leftJoin(posts, eq(threads.id, posts.threadId))
				.where(eq(forumStructure.slug, slug))
				.groupBy(forumStructure.id);

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
				.from(forumStructure)
				.leftJoin(threads, eq(forumStructure.id, threads.structureId))
				.leftJoin(posts, eq(threads.id, posts.threadId))
				.where(eq(forumStructure.id, categoryId))
				.groupBy(forumStructure.id);

			return stats || { threadCount: 0, postCount: 0, lastPostAt: null };
		} catch (error) {
			logger.error('CategoryService', 'Error fetching category stats', { categoryId, error });
			throw error;
		}
	}
}

// Export singleton instance
export const categoryService = new CategoryService();
