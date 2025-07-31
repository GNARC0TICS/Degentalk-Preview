/**
 * Forum Structure Service
 *
 * Modern service handling forum structure operations with clear terminology.
 * Replaces the confusing CategoryService with better domain modeling.
 */
import { db } from '@degentalk/db';
import { logger } from '@core/logger';
import { forumStructure, threads, posts } from '@schema';
import { sql, desc, eq, count, and, inArray, gt } from 'drizzle-orm';
import { forumMap } from '@config/forumMap';
// Simple in-memory cache for forum structure
const CACHE_DURATION_MS = 30 * 1000; // 30 seconds
let structureCache = null;
export class ForumStructureService {
    /**
     * Get all forum structures with statistics
     */
    async getStructuresWithStats() {
        try {
            // Check cache first
            if (structureCache && Date.now() - structureCache.timestamp < CACHE_DURATION_MS) {
                logger.info('ForumStructureService', 'Returning cached structures');
                return structureCache.data;
            }
            logger.info('ForumStructureService', 'Fetching forum structures with stats from database');
            // Query with stats calculation - simple subqueries for child counts
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
                isFeatured: forumStructure.isFeatured,
                themePreset: forumStructure.themePreset,
                tippingEnabled: forumStructure.tippingEnabled,
                xpMultiplier: forumStructure.xpMultiplier,
                pluginData: forumStructure.pluginData,
                createdAt: forumStructure.createdAt,
                updatedAt: forumStructure.updatedAt,
                // Direct counts
                directThreadCount: sql `COALESCE(COUNT(DISTINCT ${threads.id}), 0)`,
                directPostCount: sql `COALESCE(SUM(${threads.postCount}), 0)`,
                // Child forum counts using simple subqueries
                childThreadCount: sql `(
						SELECT COALESCE(COUNT(*), 0) 
						FROM ${threads} t 
						JOIN ${forumStructure} fs ON t.structure_id = fs.id 
						WHERE fs.parent_id = ${forumStructure.id}
					)`,
                childPostCount: sql `(
						SELECT COALESCE(SUM(t.post_count), 0) 
						FROM ${threads} t 
						JOIN ${forumStructure} fs ON t.structure_id = fs.id 
						WHERE fs.parent_id = ${forumStructure.id}
					)`,
                lastPostAt: sql `MAX(${posts.createdAt})`
            })
                .from(forumStructure)
                .leftJoin(threads, eq(forumStructure.id, threads.structureId))
                .leftJoin(posts, eq(threads.id, posts.threadId))
                .where(eq(forumStructure.isHidden, false))
                .groupBy(forumStructure.id)
                .orderBy(forumStructure.position, forumStructure.name);
            // Transform to domain model maintaining hierarchy
            const structures = structuresWithStats.map((item) => ({
                id: item.id,
                name: item.name,
                slug: item.slug,
                description: item.description,
                type: item.type,
                position: item.position,
                parentId: item.parentId,
                parentForumSlug: item.parentForumSlug,
                isVip: item.isVip,
                isLocked: item.isLocked,
                isHidden: item.isHidden,
                minXp: item.minXp,
                minGroupIdRequired: item.minGroupIdRequired,
                color: item.color,
                icon: item.icon,
                colorTheme: item.colorTheme,
                isFeatured: item.isFeatured || false,
                themePreset: item.themePreset || null,
                tippingEnabled: item.tippingEnabled,
                xpMultiplier: item.xpMultiplier,
                pluginData: item.pluginData,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                // Combine direct + child counts
                threadCount: Number(item.directThreadCount) + Number(item.childThreadCount),
                postCount: Number(item.directPostCount) + Number(item.childPostCount),
                lastPostAt: item.lastPostAt,
                // Determine if forum can have threads (leaf forums only)
                canHaveThreads: true, // Will be updated after hierarchy is built
                isZone: item.parentId === null && item.type === 'zone',
                canonical: item.parentId === null,
                childStructures: [], // Will be populated below
                // Plugin data parsing for additional properties
                isPrimary: item.parentId === null && item.pluginData?.configZoneType === 'primary',
                features: item.pluginData?.features || [],
                customComponents: item.pluginData?.customComponents || [],
                staffOnly: item.pluginData?.staffOnly || false
            }));
            // Build hierarchy and determine which forums can have threads
            const structureMap = new Map(structures.map(s => [s.id, s]));
            const rootStructures = [];
            structures.forEach(structure => {
                if (structure.parentId) {
                    const parent = structureMap.get(structure.parentId);
                    if (parent) {
                        parent.childStructures = parent.childStructures || [];
                        parent.childStructures.push(structure);
                    }
                }
                else {
                    rootStructures.push(structure);
                }
            });
            // Mark parent forums as not being able to have threads
            structures.forEach(structure => {
                if (structure.childStructures && structure.childStructures.length > 0) {
                    structure.canHaveThreads = false;
                }
            });
            // Sort by featured status first, then position
            rootStructures.sort((a, b) => {
                // Featured forums come first
                if (a.isFeatured && !b.isFeatured)
                    return -1;
                if (!a.isFeatured && b.isFeatured)
                    return 1;
                // Then sort by position
                return a.position - b.position;
            });
            // Update cache with ALL structures for tree building
            structureCache = {
                timestamp: Date.now(),
                data: structures // Cache all structures, not just root
            };
            logger.info('ForumStructureService', `Successfully fetched ${structures.length} forum structures with aggregated counts`);
            return structures; // Return all structures, not just root
        }
        catch (error) {
            logger.error('ForumStructureService', 'Error fetching structures with stats', { error });
            throw error;
        }
    }
    /**
     * Get hierarchical forum structure tree
     */
    async getStructureTree(options = {}) {
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
            const buildTree = (parentStructures) => {
                return parentStructures.map((parent) => ({
                    ...parent,
                    childStructures: buildTree(childStructures.filter((child) => child.parentId === parent.id))
                }));
            };
            return buildTree(rootStructures);
        }
        catch (error) {
            logger.error('ForumStructureService', 'Error fetching structure tree', { error });
            throw error;
        }
    }
    /**
     * Get forum structure by slug
     */
    async getStructureBySlug(slug) {
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
                threadCount: sql `COALESCE(${count(threads.id)}, 0)`,
                postCount: sql `COALESCE(SUM(${threads.postCount}), 0)`,
                lastPostAt: sql `MAX(${posts.createdAt})`
            })
                .from(forumStructure)
                .leftJoin(threads, eq(forumStructure.id, threads.structureId))
                .leftJoin(posts, eq(threads.id, posts.threadId))
                .where(eq(forumStructure.slug, slug))
                .groupBy(forumStructure.id);
            if (!structure)
                return null;
            return {
                ...structure,
                canHaveThreads: structure.type === 'forum',
                isZone: structure.parentId === null,
                canonical: structure.parentId === null,
                childStructures: [],
                isPrimary: structure.parentId === null && structure.pluginData?.configZoneType === 'primary',
                features: structure.pluginData?.features || [],
                customComponents: structure.pluginData?.customComponents || [],
                staffOnly: structure.pluginData?.staffOnly || false
            };
        }
        catch (error) {
            logger.error('ForumStructureService', 'Error fetching structure by slug', { slug, error });
            throw error;
        }
    }
    async getZoneStats(slug) {
        // Fetch the zone node
        const [zone] = await db
            .select()
            .from(forumStructure)
            .where(eq(forumStructure.slug, slug))
            .limit(1);
        if (!zone || zone.parentId !== null) {
            return null;
        }
        // Find forums under this zone
        const forumRows = await db
            .select({ id: forumStructure.id })
            .from(forumStructure)
            .where(eq(forumStructure.parentId, zone.id));
        const forumIds = forumRows.map((row) => row.id);
        if (forumIds.length === 0) {
            return {
                totalPostsToday: 0,
                trendingThreads: []
            };
        }
        // Get total posts today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const postsTodayResult = await db
            .select({ count: sql `count(*)` })
            .from(posts)
            .where(and(inArray(posts.threadId, db
            .select({ id: threads.id })
            .from(threads)
            .where(inArray(threads.structureId, forumIds))), gt(posts.createdAt, today)));
        const totalPostsToday = postsTodayResult[0]?.count || 0;
        // Get trending threads (simplified: latest 5 for now)
        const trendingThreads = await db
            .select()
            .from(threads)
            .where(inArray(threads.structureId, forumIds))
            .orderBy(desc(threads.lastPostAt))
            .limit(5);
        return {
            totalPostsToday,
            trendingThreads
        };
    }
    /**
     * Get forum statistics (modern naming)
     * Supports both parent forums and individual forums
     */
    async getForumStats(slug) {
        // Fetch the forum node
        const [forum] = await db
            .select()
            .from(forumStructure)
            .where(eq(forumStructure.slug, slug))
            .limit(1);
        if (!forum) {
            return null;
        }
        // Find child forums if this is a parent forum
        const childForumRows = await db
            .select({ id: forumStructure.id })
            .from(forumStructure)
            .where(eq(forumStructure.parentId, forum.id));
        const forumIds = [forum.id, ...childForumRows.map((row) => row.id)];
        // Get total posts today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const postsTodayResult = await db
            .select({ count: sql `count(*)` })
            .from(posts)
            .where(and(inArray(posts.threadId, db
            .select({ id: threads.id })
            .from(threads)
            .where(inArray(threads.structureId, forumIds))), gt(posts.createdAt, today)));
        const totalPostsToday = postsTodayResult[0]?.count || 0;
        // Get trending threads (latest 5)
        const trendingThreads = await db
            .select()
            .from(threads)
            .where(inArray(threads.structureId, forumIds))
            .orderBy(desc(threads.lastPostAt))
            .limit(5);
        return {
            totalPostsToday,
            trendingThreads
        };
    }
    /**
     * Get structure statistics
     */
    async getStructureStats(structureId) {
        try {
            const [stats] = await db
                .select({
                threadCount: sql `COALESCE(${count(threads.id)}, 0)`,
                postCount: sql `COALESCE(SUM(${threads.postCount}), 0)`,
                lastPostAt: sql `MAX(${posts.createdAt})`
            })
                .from(forumStructure)
                .leftJoin(threads, eq(forumStructure.id, threads.structureId))
                .leftJoin(posts, eq(threads.id, posts.threadId))
                .where(eq(forumStructure.id, structureId))
                .groupBy(forumStructure.id);
            return stats || { threadCount: 0, postCount: 0, lastPostAt: null };
        }
        catch (error) {
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
    async getForumHierarchy() {
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
                forums: zone.childStructures?.map((forum) => ({
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
                    forums: forum.childStructures?.map((subforum) => ({
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
        }
        catch (error) {
            logger.error('ForumStructureService', 'Error getting forum hierarchy', { error });
            throw error;
        }
    }
    /**
     * Clear structure cache
     */
    clearCache() {
        structureCache = null;
        logger.info('ForumStructureService', 'Forum structure cache cleared');
    }
    /**
     * Force refresh structures from database (bypass cache)
     */
    async forceRefresh() {
        this.clearCache();
        return await this.getStructuresWithStats();
    }
    /**
     * Sync forum configuration to database (from forumMap.config.ts)
     */
    async syncFromConfig(dryRun = false) {
        logger.info('ForumStructureService', `Starting forum config sync (Dry Run: ${dryRun})`);
        const results = {
            created: 0,
            updated: 0,
            archived: 0
        };
        // 1. Flatten the config structure
        const configForums = new Map();
        const flattenForums = (forums, parentSlug = null, zoneSlug) => {
            forums.forEach((forum) => {
                const flatForum = {
                    ...forum,
                    parentForumSlug: parentSlug,
                    zoneSlug: zoneSlug,
                    type: 'forum'
                };
                configForums.set(forum.slug, flatForum);
                if (forum.forums) {
                    flattenForums(forum.forums, forum.slug, zoneSlug);
                }
            });
        };
        forumMap.forums.forEach((zone) => {
            configForums.set(zone.slug, { ...zone, type: 'zone', parentForumSlug: null });
            if (zone.forums) {
                flattenForums(zone.forums, zone.slug, zone.slug);
            }
        });
        try {
            return await db.transaction(async (tx) => {
                // 2. Get all existing structures from the DB
                const dbStructures = await tx.select().from(forumStructure);
                const dbStructuresMap = new Map(dbStructures.map((s) => [s.slug, s]));
                // 3. Diff and process updates/creates
                for (const [slug, configNode] of configForums.entries()) {
                    const dbNode = dbStructuresMap.get(slug);
                    const nodeData = {
                        name: configNode.name,
                        slug: configNode.slug,
                        description: configNode.description,
                        parentForumSlug: configNode.parentForumSlug,
                        type: configNode.type,
                        position: configNode.position || 0,
                        isVip: configNode.rules?.accessLevel === 'vip',
                        isLocked: configNode.rules?.allowPosting === false,
                        isHidden: false,
                        minXp: configNode.rules?.minXpRequired || 0,
                        color: configNode.theme?.color || configNode.themeOverride?.color || 'gray',
                        icon: configNode.theme?.icon || configNode.themeOverride?.icon || 'hash',
                        colorTheme: configNode.theme?.colorTheme || configNode.themeOverride?.colorTheme,
                        tippingEnabled: configNode.rules?.tippingEnabled === true,
                        xpMultiplier: configNode.rules?.xpMultiplier || 1.0,
                        pluginData: {
                            ...configNode.rules?.customRules,
                            availablePrefixes: configNode.rules?.availablePrefixes,
                            requiredPrefix: configNode.rules?.requiredPrefix,
                            landingComponent: configNode.theme?.landingComponent
                        }
                    };
                    if (dbNode) {
                        // UPDATE
                        const hasChanged = Object.keys(nodeData).some((key) => JSON.stringify(dbNode[key]) !== JSON.stringify(nodeData[key]));
                        if (hasChanged) {
                            results.updated++;
                            logger.info(`Updating forum/zone: ${slug}`);
                            if (!dryRun) {
                                await tx.update(forumStructure).set(nodeData).where(eq(forumStructure.id, dbNode.id));
                            }
                        }
                    }
                    else {
                        // CREATE
                        results.created++;
                        logger.info(`Creating forum/zone: ${slug}`);
                        if (!dryRun) {
                            await tx.insert(forumStructure).values(nodeData);
                        }
                    }
                }
                // 4. Diff and process archives
                for (const [slug, dbNode] of dbStructuresMap.entries()) {
                    if (!configForums.has(slug)) {
                        if (!dbNode.isHidden) {
                            results.archived++;
                            logger.info(`Archiving forum/zone: ${slug}`);
                            if (!dryRun) {
                                await tx
                                    .update(forumStructure)
                                    .set({ isHidden: true })
                                    .where(eq(forumStructure.id, dbNode.id));
                            }
                        }
                    }
                }
                // 5. Second pass to link parentId
                const allNodes = await tx
                    .select({ id: forumStructure.id, slug: forumStructure.slug })
                    .from(forumStructure);
                const slugToIdMap = new Map(allNodes.map((n) => [n.slug, n.id]));
                for (const node of allNodes) {
                    const configNode = configForums.get(node.slug);
                    if (configNode && configNode.parentForumSlug) {
                        const parentId = slugToIdMap.get(configNode.parentForumSlug);
                        if (parentId) {
                            await tx.update(forumStructure).set({ parentId }).where(eq(forumStructure.id, node.id));
                        }
                    }
                }
                if (dryRun) {
                    logger.info('Dry run finished. No changes were made.');
                    // In a dry run, we must rollback to not commit any potential changes.
                    throw new Error('DRY_RUN_ROLLBACK');
                }
                else {
                    this.clearCache();
                }
                logger.info('ForumStructureService', 'Forum config sync finished.', results);
                return results;
            });
        }
        catch (error) {
            if (error.message === 'DRY_RUN_ROLLBACK') {
                // This is expected for dry runs
                return results;
            }
            throw error;
        }
    }
}
// Export singleton instance
export const forumStructureService = new ForumStructureService();
