/**
 * Forum Service - Orchestration Layer
 *
 * QUALITY IMPROVEMENT: Decomposed god object into focused services
 * This file now orchestrates between specialized services rather than handling everything
 */
import { db } from '@db';
import { logger } from '@core/logger';
import { forumStructure, threads, threadPrefixes, tags } from '@schema';
import { sql, desc, asc, and, eq } from 'drizzle-orm';
// Import specialized services
import { forumStructureService } from './services/structure.service';
import { threadService } from './services/thread.service';
import { postService } from './services/post.service';
import { configService } from './services/config.service';
import { cacheService, CacheCategory } from '@core/cache/unified-cache.service';
/**
 * Helper function to get all descendant leaf forum IDs for a given structure ID
 */
async function getAllDescendantLeafForumIds(startStructureId) {
    const allStructures = await db
        .select({
        id: forumStructure.id,
        parentId: forumStructure.parentId,
        type: forumStructure.type
    })
        .from(forumStructure);
    const structureMap = new Map();
    allStructures.forEach((s) => {
        structureMap.set(s.id, { ...s, children: [] });
    });
    allStructures.forEach((s) => {
        if (s.parentId && structureMap.has(s.parentId)) {
            structureMap.get(s.parentId)?.children.push(s.id);
        }
    });
    const leafForumIds = [];
    const queue = [startStructureId];
    const visited = new Set();
    while (queue.length > 0) {
        const currentId = queue.shift();
        if (visited.has(currentId))
            continue;
        visited.add(currentId);
        const structureNode = structureMap.get(currentId);
        if (!structureNode)
            continue;
        const isLeafForum = structureNode.type === 'forum' &&
            !structureNode.children.some((childId) => structureMap.get(childId)?.type === 'forum');
        if (isLeafForum) {
            leafForumIds.push(currentId);
        }
        else {
            structureNode.children.forEach((childId) => {
                if (!visited.has(childId)) {
                    queue.push(childId);
                }
            });
        }
    }
    const startStructureNode = structureMap.get(startStructureId);
    if (startStructureNode &&
        startStructureNode.type === 'forum' &&
        startStructureNode.children.length === 0 &&
        !leafForumIds.includes(startStructureId)) {
        leafForumIds.push(startStructureId);
    }
    return [...new Set(leafForumIds)]; // Ensure unique IDs
}
export const forumService = {
    /**
     * Get complete forum structure with zones and forums
     */
    async getForumStructure() {
        try {
            // Delegate to the new structure service
            return {
                zones: await forumStructureService.getForumHierarchy(),
                forums: await forumStructureService.getStructuresWithStats()
            };
        }
        catch (error) {
            logger.error('ForumService', 'Error in getForumStructure', { err: error });
            throw error;
        }
    },
    /**
     * Get structures with statistics - delegates to StructureService
     */
    async getStructuresWithStats(includeCounts = true) {
        return forumStructureService.getStructuresWithStats();
    },
    /**
     * Get structure tree - delegates to StructureService
     */
    async getStructureTree(options = {}) {
        return forumStructureService.getStructureTree(options);
    },
    /**
     * Get forum by slug - delegates to StructureService
     */
    async getForumBySlug(slug) {
        return forumStructureService.getStructureBySlug(slug);
    },
    /**
     * Get categories tree - delegates to StructureService
     */
    async getCategoriesTree(options = {}) {
        return forumStructureService.getStructureTree(options);
    },
    /**
     * Get categories with stats - delegates to StructureService
     */
    async getCategoriesWithStats() {
        return forumStructureService.getStructuresWithStats();
    },
    /**
     * Get forum with topics by slug
     */
    async getForumBySlugWithTopics(slug) {
        const forum = await this.getCategoryBySlug(slug);
        return { forum };
    },
    /**
     * Get forum and sub-forums by slug
     */
    async getForumAndItsSubForumsBySlug(slug) {
        const forum = await this.getForumBySlug(slug);
        return { forum };
    },
    /**
     * Get category by ID from structure
     */
    async getCategoryById(id) {
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
     * Get structures by parent ID
     */
    async getForumsByParentId(parentId) {
        const parentStructure = await this.getCategoryById(parentId);
        return parentStructure?.childForums || [];
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
        }
        catch (error) {
            logger.error('ForumService', 'Error in debugForumRelationships', { err: error });
            throw error;
        }
    },
    /**
     * Get thread prefixes - simple delegation
     */
    async getPrefixes(forumId) {
        if (forumId) {
            return db
                .select()
                .from(threadPrefixes)
                .where(and(eq(threadPrefixes.isActive, true), sql `${threadPrefixes.structureId} IS NULL OR ${threadPrefixes.structureId} = ${forumId}`))
                .orderBy(asc(threadPrefixes.position));
        }
        else {
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
    async searchThreads(params) {
        return threadService.searchThreads(params);
    },
    /**
     * Get thread details - delegates to ThreadService and PostService
     */
    async getThreadDetails(slugOrId, page = 1, requestedLimit = 20, currentUserId) {
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
        }
        catch (error) {
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
    async updateThreadSolvedStatus(params) {
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
        }
        catch (error) {
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
    ensureValidLeafForum(slug) {
        return configService.ensureValidLeafForum(slug);
    },
    /**
     * Get threads in forum by slug
     */
    async getThreadsInForum(slug, limit = 50, offset = 0) {
        // Validate against config
        configService.ensureValidLeafForum(slug);
        // Resolve the corresponding structure ID in the database
        const [structureRow] = await db
            .select({ id: forumStructure.id })
            .from(forumStructure)
            .where(eq(forumStructure.slug, slug))
            .limit(1);
        if (!structureRow) {
            throw new Error(`Forum with slug '${slug}' not found in database after validation. Did you run sync:forums?`);
        }
        return db
            .select()
            .from(threads)
            .where(eq(threads.structureId, structureRow.id))
            .orderBy(desc(threads.createdAt))
            .limit(Math.min(limit, 100)) // Cap at 100 for performance
            .offset(offset);
    },
    /**
     * Clear all caches - delegates to CacheService
     */
    async clearCache() {
        await cacheService.clear(CacheCategory.FORUM);
    }
};
export default forumService;
