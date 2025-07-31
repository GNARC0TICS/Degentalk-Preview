/**
 * Forum Structure Service
 *
 * Modern service handling forum structure operations with clear terminology.
 * Replaces the confusing CategoryService with better domain modeling.
 */
import type { PublicForumStructure } from '../types';
import type { StructureId } from '@shared/types/ids';
export declare class ForumStructureService {
    /**
     * Get all forum structures with statistics
     */
    getStructuresWithStats(): Promise<PublicForumStructure[]>;
    /**
     * Get hierarchical forum structure tree
     */
    getStructureTree(options?: {
        includeHidden?: boolean;
        includeEmptyStats?: boolean;
    }): Promise<PublicForumStructure[]>;
    /**
     * Get forum structure by slug
     */
    getStructureBySlug(slug: string): Promise<PublicForumStructure | null>;
    getZoneStats(slug: string): Promise<{
        totalPostsToday: any;
        trendingThreads: any;
    } | null>;
    /**
     * Get forum statistics (modern naming)
     * Supports both parent forums and individual forums
     */
    getForumStats(slug: string): Promise<{
        totalPostsToday: any;
        trendingThreads: any;
    } | null>;
    /**
     * Get structure statistics
     */
    getStructureStats(structureId: StructureId): Promise<{
        threadCount: number;
        postCount: number;
        lastPostAt: Date | null;
    }>;
    /**
     * Get forum hierarchy for API responses (optimized)
     */
    getForumHierarchy(): Promise<any>;
    /**
     * Clear structure cache
     */
    clearCache(): void;
    /**
     * Force refresh structures from database (bypass cache)
     */
    forceRefresh(): Promise<PublicForumStructure[]>;
    /**
     * Sync forum configuration to database (from forumMap.config.ts)
     */
    syncFromConfig(dryRun?: boolean): Promise<{
        created: number;
        updated: number;
        archived: number;
    }>;
}
export declare const forumStructureService: ForumStructureService;
