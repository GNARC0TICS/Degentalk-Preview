/**
 * Forum Service - Orchestration Layer
 *
 * QUALITY IMPROVEMENT: Decomposed god object into focused services
 * This file now orchestrates between specialized services rather than handling everything
 */
import type { ThreadWithPostsAndUser } from '@shared/types/forum.types';
import type { PublicForumStructure } from './types';
import type { ForumId, StructureId, ThreadId, PostId } from '@shared/types/ids';
export interface ThreadSearchParams {
    categoryId?: StructureId;
    structureId?: StructureId;
    prefix?: string;
    tag?: string;
    page?: number;
    limit?: number;
    sortBy?: 'latest' | 'hot' | 'staked' | 'popular' | 'recent';
    search?: string;
}
interface StructureTreeOptions {
    includeEmptyStats?: boolean;
    includeHidden?: boolean;
}
export declare const forumService: {
    /**
     * Get complete forum structure with zones and forums
     */
    getForumStructure(): Promise<{
        zones: PublicForumStructure[];
        forums: PublicForumStructure[];
    }>;
    /**
     * Get structures with statistics - delegates to StructureService
     */
    getStructuresWithStats(includeCounts?: boolean): Promise<PublicForumStructure[]>;
    /**
     * Get structure tree - delegates to StructureService
     */
    getStructureTree(options?: StructureTreeOptions): Promise<PublicForumStructure[]>;
    /**
     * Get forum by slug - delegates to StructureService
     */
    getForumBySlug(slug: string): Promise<PublicForumStructure | null>;
    /**
     * Get categories tree - delegates to StructureService
     */
    getCategoriesTree(options?: StructureTreeOptions): Promise<PublicForumStructure[]>;
    /**
     * Get categories with stats - delegates to StructureService
     */
    getCategoriesWithStats(): Promise<PublicForumStructure[]>;
    /**
     * Get forum with topics by slug
     */
    getForumBySlugWithTopics(slug: string): Promise<{
        forum: PublicForumStructure | null;
    }>;
    /**
     * Get forum and sub-forums by slug
     */
    getForumAndItsSubForumsBySlug(slug: string): Promise<{
        forum: PublicForumStructure | null;
    }>;
    /**
     * Get category by ID from structure
     */
    getCategoryById(id: StructureId): Promise<PublicForumStructure | null>;
    /**
     * Get structures by parent ID
     */
    getForumsByParentId(parentId: StructureId): Promise<PublicForumStructure[]>;
    /**
     * Debug forum relationships
     */
    debugForumRelationships(): Promise<{
        zones: {
            id: ForumId;
            name: string;
            slug: string;
            isPrimary: boolean;
            forums: any;
        }[];
    }>;
    /**
     * Get thread prefixes - simple delegation
     */
    getPrefixes(forumId?: StructureId): Promise<any>;
    /**
     * Get tags - simple delegation
     */
    getTags(): Promise<any>;
    /**
     * Search threads - delegates to ThreadService
     */
    searchThreads(params: ThreadSearchParams): Promise<{
        threads: ThreadWithPostsAndUser[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    /**
     * Get thread details - delegates to ThreadService and PostService
     */
    getThreadDetails(slugOrId: string | number, page?: number, requestedLimit?: number, currentUserId?: string): Promise<ThreadWithPostsAndUser | null>;
    /**
     * Update thread solved status - delegates to ThreadService
     */
    updateThreadSolvedStatus(params: {
        threadId: ThreadId;
        solvingPostId?: PostId | null;
    }): Promise<any>;
    /**
     * Ensure valid leaf forum - delegates to ConfigService
     */
    ensureValidLeafForum(slug: string): import("@shared/config/forum-map.config").Forum;
    /**
     * Get threads in forum by slug
     */
    getThreadsInForum(slug: string, limit?: number, offset?: number): Promise<any>;
    /**
     * Clear all caches - delegates to CacheService
     */
    clearCache(): Promise<void>;
};
export default forumService;
