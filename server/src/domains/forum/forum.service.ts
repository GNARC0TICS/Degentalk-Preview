/**
 * Forum Service - Orchestration Layer
 *
 * QUALITY IMPROVEMENT: Decomposed god object into focused services
 * This file now orchestrates between specialized services rather than handling everything
 */

import { db } from '@db';
import { logger } from '@server/src/core/logger';
import { forumCategories, threads, threadPrefixes, tags } from '@schema';
import { sql, desc, asc, and, eq, inArray } from 'drizzle-orm';
import type { ForumCategoryWithStats, ThreadWithPostsAndUser } from '../../../db/types/forum.types';

// Import specialized services
import { categoryService } from './services/category.service';
import { threadService } from './services/thread.service';
import { postService } from './services/post.service';
import { configService } from './services/config.service';
import { cacheService } from './services/cache.service';

export interface ThreadSearchParams {
	categoryId?: number;
	prefix?: string;
	tag?: string;
	page?: number;
	limit?: number;
	sortBy?: 'latest' | 'hot' | 'staked' | 'popular' | 'recent';
	search?: string;
}

interface CategoriesTreeOptions {
	includeEmptyStats?: boolean;
	includeHidden?: boolean;
}

/**
 * Helper function to get all descendant leaf forum IDs for a given category ID
 */
async function getAllDescendantLeafForumIds(startCategoryId: number): Promise<number[]> {
	const allCategories = await db
		.select({
			id: forumCategories.id,
			parentId: forumCategories.parentId,
			type: forumCategories.type
		})
		.from(forumCategories);

	const categoryMap = new Map<
		number,
		{ id: number; parentId: number | null; type: string; children: number[] }
	>();

	allCategories.forEach((c) => {
		categoryMap.set(c.id, { ...c, children: [] });
	});

	allCategories.forEach((c) => {
		if (c.parentId && categoryMap.has(c.parentId)) {
			categoryMap.get(c.parentId)?.children.push(c.id);
		}
	});

	const leafForumIds: number[] = [];
	const queue: number[] = [startCategoryId];
	const visited = new Set<number>();

	while (queue.length > 0) {
		const currentId = queue.shift()!;
		if (visited.has(currentId)) continue;
		visited.add(currentId);

		const categoryNode = categoryMap.get(currentId);
		if (!categoryNode) continue;

		const isLeafForum =
			categoryNode.type === 'forum' &&
			!categoryNode.children.some((childId) => categoryMap.get(childId)?.type === 'forum');

		if (isLeafForum) {
			leafForumIds.push(currentId);
		} else {
			categoryNode.children.forEach((childId) => {
				if (!visited.has(childId)) {
					queue.push(childId);
				}
			});
		}
	}

	const startCategoryNode = categoryMap.get(startCategoryId);
	if (
		startCategoryNode &&
		startCategoryNode.type === 'forum' &&
		startCategoryNode.children.length === 0 &&
		!leafForumIds.includes(startCategoryId)
	) {
		leafForumIds.push(startCategoryId);
	}

	return [...new Set(leafForumIds)]; // Ensure unique IDs
}

export const forumService = {
	/**
	 * Get complete forum structure with zones and forums
	 */
	async getForumStructure(): Promise<{ zones: ForumCategoryWithStats[] }> {
		try {
			const allItemsFlat: ForumCategoryWithStats[] = await categoryService.getCategoriesWithStats();
			const zoneEntities = allItemsFlat.filter((item) => item.type === 'zone');
			const allForumLikeEntities = allItemsFlat.filter((item) => item.type === 'forum');

			type MappedForum = ForumCategoryWithStats & {
				ownThreadCount?: number;
				ownPostCount?: number;
			};
			const forumMap = new Map<number, MappedForum>();

			// Build forum hierarchy
			allForumLikeEntities.forEach((f) => {
				forumMap.set(f.id, {
					...f,
					childForums: [],
					ownThreadCount: f.threadCount,
					ownPostCount: f.postCount
				});
			});

			// Link parent-child relationships
			allForumLikeEntities.forEach((potentialSubForum) => {
				if (potentialSubForum.parentId) {
					const parentForumFromMap = forumMap.get(potentialSubForum.parentId);
					const parentEntityInFlatList = allItemsFlat.find(
						(item) => item.id === potentialSubForum.parentId
					);

					if (
						parentForumFromMap &&
						parentEntityInFlatList &&
						parentEntityInFlatList.type === 'forum'
					) {
						if (!parentForumFromMap.childForums) {
							parentForumFromMap.childForums = [];
						}
						parentForumFromMap.childForums.push(
							forumMap.get(potentialSubForum.id)! as ForumCategoryWithStats
						);
					}
				}
			});

			// Aggregate stats for parent forums
			Array.from(forumMap.values()).forEach((parentForum) => {
				if (parentForum.childForums && parentForum.childForums.length > 0) {
					let aggregatedThreadCount = parentForum.ownThreadCount || 0;
					let aggregatedPostCount = parentForum.ownPostCount || 0;

					parentForum.childForums.forEach((subForum) => {
						aggregatedThreadCount += subForum.threadCount || 0;
						aggregatedPostCount += subForum.postCount || 0;
					});
					parentForum.threadCount = aggregatedThreadCount;
					parentForum.postCount = aggregatedPostCount;
				}
			});

			// Structure zones with their forums
			const structuredZones = zoneEntities.map((zone) => {
				const { features, customComponents, staffOnly, isPrimary } =
					configService.processZoneFeatures(zone.pluginData);

				const topLevelForumsForZone = Array.from(forumMap.values()).filter(
					(forumInMap) => forumInMap.parentId === zone.id
				);

				let zoneThreadCount = 0;
				let zonePostCount = 0;
				topLevelForumsForZone.forEach((forum) => {
					zoneThreadCount += forum.threadCount || 0;
					zonePostCount += forum.postCount || 0;
				});

				return {
					...zone,
					isPrimary,
					features,
					customComponents,
					staffOnly,
					forums: topLevelForumsForZone,
					childForums: topLevelForumsForZone,
					threadCount: zoneThreadCount,
					postCount: zonePostCount
				};
			});

			return { zones: structuredZones };
		} catch (error) {
			logger.error('ForumService', 'Error in getForumStructure', { err: error });
			throw error;
		}
	},

	/**
	 * Get categories with statistics - delegates to CategoryService
	 */
	async getCategoriesWithStats(includeCounts: boolean = true): Promise<ForumCategoryWithStats[]> {
		return categoryService.getCategoriesWithStats();
	},

	/**
	 * Get categories tree structure - delegates to CategoryService
	 */
	async getCategoriesTree(options: CategoriesTreeOptions = {}) {
		return categoryService.getCategoriesTree(options);
	},

	/**
	 * Get forum by slug - delegates to ConfigService
	 */
	async getForumBySlug(slug: string): Promise<ForumCategoryWithStats | null> {
		const entry = configService.getForumBySlug(slug);
		if (!entry) {
			return null;
		}
		const { forum, zone } = entry;
		return configService.mapConfigForumToCategory(forum, zone);
	},

	/**
	 * Get forum and sub-forums by slug
	 */
	async getForumAndItsSubForumsBySlug(slug: string): Promise<{
		forum: ForumCategoryWithStats | null;
	}> {
		const forum = await this.getForumBySlug(slug);
		return { forum };
	},

	/**
	 * Get forum by ID from structure
	 */
	async getForumById(id: number): Promise<ForumCategoryWithStats | null> {
		const { zones } = await this.getForumStructure();
		for (const zone of zones) {
			for (const parentForum of zone.childForums || []) {
				if (parentForum.id === id) {
					return parentForum;
				}
				if (parentForum.childForums) {
					const subForum = parentForum.childForums.find((sf) => sf.id === id);
					if (subForum) {
						return subForum;
					}
				}
			}
		}
		return null;
	},

	/**
	 * Get sub-forums by parent forum ID
	 */
	async getSubForumsByParentForumId(parentForumId: number): Promise<ForumCategoryWithStats[]> {
		const parentForum = await this.getForumById(parentForumId);
		return parentForum?.childForums || [];
	},

	/**
	 * Debug forum relationships
	 */
	async debugForumRelationships() {
		try {
			const { zones: structuredZones } = await this.getForumStructure();
			const result = structuredZones.map((zone) => ({
				id: zone.id,
				name: zone.name,
				slug: zone.slug,
				isPrimary: zone.isPrimary || false,
				forums: (zone.childForums || []).map((parentForum) => ({
					id: parentForum.id,
					name: parentForum.name,
					slug: parentForum.slug,
					parentId: parentForum.parentId,
					subForums: (parentForum.childForums || []).map((subForum) => ({
						id: subForum.id,
						name: subForum.name,
						slug: subForum.slug,
						parentId: subForum.parentId
					}))
				}))
			}));
			return { zones: result };
		} catch (error) {
			logger.error('ForumService', 'Error in debugForumRelationships', { err: error });
			throw error;
		}
	},

	/**
	 * Get thread prefixes - simple delegation
	 */
	async getPrefixes(forumId?: number) {
		if (forumId) {
			return db
				.select()
				.from(threadPrefixes)
				.where(
					and(
						eq(threadPrefixes.isActive, true),
						sql`${threadPrefixes.categoryId} IS NULL OR ${threadPrefixes.categoryId} = ${forumId}`
					)
				)
				.orderBy(asc(threadPrefixes.position));
		} else {
			return db
				.select()
				.from(threadPrefixes)
				.where(eq(threadPrefixes.isActive, true))
				.orderBy(asc(threadPrefixes.position));
		}
	},

	/**
	 * Get tags - simple delegation
	 */
	async getTags() {
		return db.select().from(tags).orderBy(asc(tags.name));
	},

	/**
	 * Search threads - delegates to ThreadService
	 */
	async searchThreads(params: ThreadSearchParams) {
		return threadService.searchThreads(params);
	},

	/**
	 * Get thread details - delegates to ThreadService and PostService
	 */
	async getThreadDetails(
		slugOrId: string | number,
		page: number = 1,
		requestedLimit: number = 20,
		currentUserId?: string
	): Promise<ThreadWithPostsAndUser | null> {
		// This method is complex and involves multiple services,
		// keeping it here for now as it orchestrates between thread and post services
		try {
			const thread = await threadService.getThreadBySlug(String(slugOrId));
			if (!thread) {
				return null;
			}

			const postsResponse = await postService.getPostsByThread({
				threadId: thread.id,
				page,
				limit: requestedLimit,
				sortBy: 'oldest'
			});

			return {
				thread,
				posts: postsResponse.posts,
				pagination: {
					page: postsResponse.page,
					pageSize: requestedLimit,
					totalItems: postsResponse.total,
					totalPages: postsResponse.totalPages
				}
			};
		} catch (error) {
			logger.error('ForumService', 'Error in getThreadDetails', {
				err: error,
				slugOrId,
				page,
				requestedLimit,
				currentUserId
			});
			throw error;
		}
	},

	/**
	 * Update thread solved status - delegates to ThreadService
	 */
	async updateThreadSolvedStatus(params: { threadId: number; solvingPostId?: number | null }) {
		// For now, keeping this implementation here as it's thread-specific
		// TODO: Move to ThreadService in next iteration
		try {
			const { threadId, solvingPostId } = params;

			const [updatedThread] = await db
				.update(threads)
				.set({
					isSolved: solvingPostId !== null && solvingPostId !== undefined,
					solvingPostId: solvingPostId === undefined ? null : solvingPostId,
					updatedAt: new Date()
				})
				.where(eq(threads.id, threadId))
				.returning({
					id: threads.id,
					title: threads.title,
					isSolved: threads.isSolved,
					solvingPostId: threads.solvingPostId,
					updatedAt: threads.updatedAt
				});
			return updatedThread || null;
		} catch (error) {
			logger.error('ForumService', 'Error in updateThreadSolvedStatus', {
				err: error,
				...params
			});
			throw error;
		}
	},

	/**
	 * Ensure valid leaf forum - delegates to ConfigService
	 */
	ensureValidLeafForum(slug: string) {
		return configService.ensureValidLeafForum(slug);
	},

	/**
	 * Get threads in forum by slug
	 */
	async getThreadsInForum(slug: string) {
		// Validate against config
		configService.ensureValidLeafForum(slug);

		// Resolve the corresponding category ID in the database
		const [categoryRow] = await db
			.select({ id: forumCategories.id })
			.from(forumCategories)
			.where(eq(forumCategories.slug, slug))
			.limit(1);

		if (!categoryRow) {
			throw new Error(
				`Forum with slug '${slug}' not found in database after validation. Did you run sync:forums?`
			);
		}

		return db
			.select()
			.from(threads)
			.where(eq(threads.categoryId, categoryRow.id))
			.orderBy(desc(threads.createdAt));
	},

	/**
	 * Clear all caches - delegates to CacheService
	 */
	clearCache() {
		cacheService.clearAllCaches();
	}
};

export default forumService;
