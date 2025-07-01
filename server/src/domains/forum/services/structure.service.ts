/**
 * Forum Structure Service
 *
 * Modern service handling forum structure operations with clear terminology.
 * Replaces the confusing CategoryService with better domain modeling.
 */

import { db } from '@db';
import { logger } from '@server/src/core/logger';
import { forumStructure, threads, posts, users as usersTable } from '@schema';
import { sql, desc, eq, count, isNull } from 'drizzle-orm';
import type { ForumStructureWithStats } from '../../../../db/types/forum.types';
import type { StructureId } from '@/db/types';

// Simple in-memory cache for forum structure
const CACHE_DURATION_MS = 30 * 1000; // 30 seconds
let structureCache: {
	timestamp: number;
	data: ForumStructureWithStats[];
} | null = null;

export class ForumStructureService {
	/**
	 * Get all forum structures with statistics
	 */
	async getStructuresWithStats(): Promise<ForumStructureWithStats[]> {
		try {
			// Check cache first
			if (structureCache && Date.now() - structureCache.timestamp < CACHE_DURATION_MS) {
				logger.info('ForumStructureService', 'Returning cached structures');
				return structureCache.data;
			}

			logger.info('ForumStructureService', 'Fetching forum structures with stats from database');

			// Query with stats calculation - FILTER OUT HIDDEN FORUMS BY DEFAULT
			const structuresWithStats = await db
				.select({
					id: forumStructure.id,
					name: forumStructure.name,
					slug: forumStructure.slug,
					description: forumStructure.description,
					type: forumStructure.type,
					position: forumStructure.position,
					parentId: forumStructure.parentId,
					parentForumSlug: forumStructure.parentForumSlug,
					isVip: forumStructure.isVip,
					isLocked: forumStructure.isLocked,
					isHidden: forumStructure.isHidden,
					minXp: forumStructure.minXp,
					minGroupIdRequired: forumStructure.minGroupIdRequired,
					color: forumStructure.color,
					icon: forumStructure.icon,
					colorTheme: forumStructure.colorTheme,
					tippingEnabled: forumStructure.tippingEnabled,
					xpMultiplier: forumStructure.xpMultiplier,
					pluginData: forumStructure.pluginData,
					createdAt: forumStructure.createdAt,
					updatedAt: forumStructure.updatedAt,
					threadCount: sql<number>`COALESCE(${count(threads.id)}, 0)`,
					postCount: sql<number>`COALESCE(SUM(${threads.postCount}), 0)`,
					lastPostAt: sql<Date | null>`MAX(${posts.createdAt})`
				})
				.from(forumStructure)
				.leftJoin(threads, eq(forumStructure.id, threads.structureId))
				.leftJoin(posts, eq(threads.id, posts.threadId))
				.where(eq(forumStructure.isHidden, false))
				.groupBy(forumStructure.id)
				.orderBy(forumStructure.position, forumStructure.name);

			// Transform to domain model
			const structures: ForumStructureWithStats[] = structuresWithStats.map((item) => ({
				...item,
				canHaveThreads: item.type === 'forum', // Only forums can have threads, not zones
				isZone: item.type === 'zone',
				canonical: item.type === 'zone', // Zones are canonical in the hierarchy
				childStructures: [], // Will be populated in tree methods
				// Plugin data parsing for additional properties
				isPrimary: item.type === 'zone' && (item.pluginData as any)?.configZoneType === 'primary',
				features: (item.pluginData as any)?.features || [],
				customComponents: (item.pluginData as any)?.customComponents || [],
				staffOnly: (item.pluginData as any)?.staffOnly || false
			}));

			// Update cache
			structureCache = {
				timestamp: Date.now(),
				data: structures
			};

			logger.info(
				'ForumStructureService',
				`Successfully fetched ${structures.length} forum structures`
			);
			return structures;
		} catch (error) {
			logger.error('ForumStructureService', 'Error fetching structures with stats', { error });
			throw error;
		}
	}

	/**
	 * Get hierarchical forum structure tree
	 */
	async getStructureTree(
		options: {
			includeHidden?: boolean;
			includeEmptyStats?: boolean;
		} = {}
	): Promise<ForumStructureWithStats[]> {
		try {
			const { includeHidden = false } = options;

			// Get all structures
			const allStructures = await this.getStructuresWithStats();

			// Filter out hidden structures if requested
			const filteredStructures = includeHidden
				? allStructures
				: allStructures.filter((structure) => !structure.isHidden);

			// Build tree structure
			const rootStructures = filteredStructures.filter((structure) => structure.parentId === null);
			const childStructures = filteredStructures.filter((structure) => structure.parentId !== null);

			// Recursive tree building
			const buildTree = (
				parentStructures: ForumStructureWithStats[]
			): ForumStructureWithStats[] => {
				return parentStructures.map((parent) => ({
					...parent,
					childStructures: buildTree(
						childStructures.filter((child) => child.parentId === parent.id)
					)
				}));
			};

			return buildTree(rootStructures);
		} catch (error) {
			logger.error('ForumStructureService', 'Error fetching structure tree', { error });
			throw error;
		}
	}

	/**
	 * Get forum structure by slug
	 */
	async getStructureBySlug(slug: string): Promise<ForumStructureWithStats | null> {
		try {
			const [structure] = await db
				.select({
					id: forumStructure.id,
					name: forumStructure.name,
					slug: forumStructure.slug,
					description: forumStructure.description,
					type: forumStructure.type,
					position: forumStructure.position,
					parentId: forumStructure.parentId,
					parentForumSlug: forumStructure.parentForumSlug,
					isVip: forumStructure.isVip,
					isLocked: forumStructure.isLocked,
					isHidden: forumStructure.isHidden,
					minXp: forumStructure.minXp,
					minGroupIdRequired: forumStructure.minGroupIdRequired,
					color: forumStructure.color,
					icon: forumStructure.icon,
					colorTheme: forumStructure.colorTheme,
					tippingEnabled: forumStructure.tippingEnabled,
					xpMultiplier: forumStructure.xpMultiplier,
					pluginData: forumStructure.pluginData,
					createdAt: forumStructure.createdAt,
					updatedAt: forumStructure.updatedAt,
					threadCount: sql<number>`COALESCE(${count(threads.id)}, 0)`,
					postCount: sql<number>`COALESCE(SUM(${threads.postCount}), 0)`,
					lastPostAt: sql<Date | null>`MAX(${posts.createdAt})`
				})
				.from(forumStructure)
				.leftJoin(threads, eq(forumStructure.id, threads.structureId))
				.leftJoin(posts, eq(threads.id, posts.threadId))
				.where(eq(forumStructure.slug, slug))
				.groupBy(forumStructure.id);

			if (!structure) return null;

			return {
				...structure,
				canHaveThreads: structure.type === 'forum',
				isZone: structure.type === 'zone',
				canonical: structure.type === 'zone',
				childStructures: [],
				isPrimary:
					structure.type === 'zone' && (structure.pluginData as any)?.configZoneType === 'primary',
				features: (structure.pluginData as any)?.features || [],
				customComponents: (structure.pluginData as any)?.customComponents || [],
				staffOnly: (structure.pluginData as any)?.staffOnly || false
			};
		} catch (error) {
			logger.error('ForumStructureService', 'Error fetching structure by slug', { slug, error });
			throw error;
		}
	}

	/**
	 * Get structure statistics
	 */
	async getStructureStats(structureId: StructureId): Promise<{
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
				.where(eq(forumStructure.id, structureId))
				.groupBy(forumStructure.id);

			return stats || { threadCount: 0, postCount: 0, lastPostAt: null };
		} catch (error) {
			logger.error('ForumStructureService', 'Error fetching structure stats', {
				structureId,
				error
			});
			throw error;
		}
	}

	/**
	 * Get forum hierarchy for API responses (optimized)
	 */
	async getForumHierarchy(): Promise<any> {
		try {
			const tree = await this.getStructureTree({ includeHidden: false });

			// Transform to the expected API format
			return tree.map((zone) => ({
				id: zone.id,
				name: zone.name,
				slug: zone.slug,
				description: zone.description,
				type: zone.type,
				position: zone.position,
				color: zone.color,
				icon: zone.icon,
				isZone: zone.isZone,
				canonical: zone.canonical,
				isPrimary: zone.isPrimary,
				features: zone.features,
				customComponents: zone.customComponents,
				staffOnly: zone.staffOnly,
				forums:
					zone.childStructures?.map((forum) => ({
						id: forum.id,
						name: forum.name,
						slug: forum.slug,
						description: forum.description,
						type: forum.type,
						position: forum.position,
						color: forum.color,
						icon: forum.icon,
						threadCount: forum.threadCount,
						postCount: forum.postCount,
						lastPostAt: forum.lastPostAt,
						canHaveThreads: forum.canHaveThreads,
						tippingEnabled: forum.tippingEnabled,
						xpMultiplier: forum.xpMultiplier,
						isLocked: forum.isLocked,
						isVip: forum.isVip,
						minXp: forum.minXp,
						// Recursive for subforums
						forums:
							forum.childStructures?.map((subforum) => ({
								id: subforum.id,
								name: subforum.name,
								slug: subforum.slug,
								description: subforum.description,
								type: subforum.type,
								position: subforum.position,
								color: subforum.color,
								icon: subforum.icon,
								threadCount: subforum.threadCount,
								postCount: subforum.postCount,
								lastPostAt: subforum.lastPostAt,
								canHaveThreads: subforum.canHaveThreads,
								tippingEnabled: subforum.tippingEnabled,
								xpMultiplier: subforum.xpMultiplier,
								isLocked: subforum.isLocked,
								isVip: subforum.isVip,
								minXp: subforum.minXp
							})) || []
					})) || []
			}));
		} catch (error) {
			logger.error('ForumStructureService', 'Error getting forum hierarchy', { error });
			throw error;
		}
	}

	/**
	 * Clear structure cache
	 */
	clearCache(): void {
		structureCache = null;
		logger.info('ForumStructureService', 'Forum structure cache cleared');
	}

	/**
	 * Force refresh structures from database (bypass cache)
	 */
	async forceRefresh(): Promise<ForumStructureWithStats[]> {
		this.clearCache();
		return await this.getStructuresWithStats();
	}

	/**
	 * Sync forum configuration to database (from forumMap.config.ts)
	 */
	async syncFromConfig(): Promise<void> {
		// This method will be implemented to replace the old sync script
		// For now, we reference the existing sync functionality
		logger.info('ForumStructureService', 'Forum config sync not yet implemented in service layer');
		throw new Error('Use npm run sync:forums script for now');
	}
}

// Export singleton instance
export const forumStructureService = new ForumStructureService();
