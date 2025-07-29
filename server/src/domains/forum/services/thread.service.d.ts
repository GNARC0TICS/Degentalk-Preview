/**
 * Forum Thread Service
 *
 * QUALITY IMPROVEMENT: Extracted from forum.service.ts god object
 * Handles thread-specific operations with proper separation of concerns
 */
import type { ThreadWithUserAndCategory } from '@shared/types/forum.types';
import type { ForumId, StructureId, ThreadId, UserId, PostId } from '@shared/types/ids';
export interface ThreadSearchParams {
    structureId?: StructureId;
    userId?: UserId;
    search?: string;
    tags?: string[];
    page?: number;
    limit?: number;
    sortBy?: 'newest' | 'oldest' | 'mostReplies' | 'mostViews' | 'trending';
    status?: 'active' | 'locked' | 'pinned';
    followingUserId?: UserId;
}
export type ContentTab = 'trending' | 'recent' | 'following';
export interface TabContentParams {
    tab: ContentTab;
    page?: number;
    limit?: number;
    forumId?: ForumId;
    userId?: UserId;
}
export interface ThreadCreateInput {
    title: string;
    content: string;
    structureId: StructureId;
    userId: UserId;
    tags?: string[];
    isLocked?: boolean;
    isPinned?: boolean;
    prefix?: string;
}
export declare class ThreadService {
    private threadRepository;
    constructor();
    /**
     * Fetch threads by tab with enhanced caching
     * Main entry point for the new content system
     */
    fetchThreadsByTab(params: TabContentParams): Promise<{
        items: ThreadWithUserAndCategory[];
        meta: {
            hasMore: boolean;
            total: number;
            page: number;
        };
    }>;
    /**
     * Build search parameters for specific tabs
     */
    private buildSearchParamsForTab;
    /**
     * Get cache TTL based on tab type
     */
    private getCacheTTLForTab;
    /**
     * Search and filter threads with pagination
     */
    searchThreads(params: ThreadSearchParams): Promise<{
        threads: ThreadWithUserAndCategory[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    /**
     * Get thread by ID with author and category details
     * Returns ThreadDisplay compatible format with proper zone data
     */
    getThreadById(threadId: ThreadId): Promise<ThreadWithUserAndCategory | null>;
    /**
     * Get thread by slug with author and zone details
     * Returns ThreadDisplay compatible format with proper zone data
     */
    getThreadBySlug(slug: string): Promise<ThreadWithUserAndCategory | null>;
    /**
     * Create a new thread
     */
    createThread(input: ThreadCreateInput): Promise<ThreadWithUserAndCategory>;
    /**
     * Update thread view count
     */
    incrementViewCount(threadId: ThreadId): Promise<void>;
    /**
     * Update thread post count
     */
    updatePostCount(threadId: ThreadId): Promise<void>;
    /**
     * Update thread solved status
     */
    updateThreadSolvedStatus(params: {
        threadId: ThreadId;
        solvingPostId?: PostId | null;
    }): Promise<ThreadWithUserAndCategory | null>;
    /**
     * Add tags to thread
     */
    private addTagsToThread;
    /**
     * Generate URL-friendly slug from title
     */
    private generateSlug;
    /**
     * Get zone information for a given structure ID with caching
     * Traverses up the hierarchy to find the top-level zone
     */
    private getZoneInfo;
    private stripMarkup;
    /**
     * Fetch first post excerpt (plain-text, 150 chars max) for a thread
     */
    private getFirstPostExcerpt;
    /**
     * Batch fetch first post excerpts for multiple threads (fixes N+1)
     */
    private getFirstPostExcerptsBatch;
    /**
     * Invalidate thread caches when threads are created or updated
     */
    invalidateThreadCaches(forumId?: StructureId): Promise<void>;
}
export declare const threadService: ThreadService;
