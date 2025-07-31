import type { ThreadId, UserId, PostId } from '@shared/types/ids';
export interface PostCreateData {
    content: string;
    threadId: ThreadId;
    userId: UserId;
    replyToPostId?: PostId;
}
export interface PostUpdateData {
    content: string;
    updatedAt?: Date;
}
export interface PostSearchFilters {
    threadId?: ThreadId;
    userId?: UserId;
    sortBy?: 'newest' | 'oldest';
}
/**
 * Repository for forum post operations
 * All database operations for posts should go through this repository
 */
export declare class ForumRepository {
    /**
     * Create a new post
     */
    createPost(data: PostCreateData): Promise<any>;
    /**
     * Find posts by thread with pagination
     */
    findPostsByThread(threadId: ThreadId, limit: number, offset: number, sortBy?: 'newest' | 'oldest'): Promise<any>;
    /**
     * Count posts in a thread
     */
    countPostsByThread(threadId: ThreadId): Promise<number>;
    /**
     * Find post by ID
     */
    findPostById(postId: PostId): Promise<any>;
    /**
     * Update post content
     */
    updatePost(postId: PostId, data: PostUpdateData): Promise<any>;
    /**
     * Delete post (soft delete)
     */
    deletePost(postId: PostId): Promise<void>;
    /**
     * Increment post like count (atomic operation)
     */
    incrementLikeCount(postId: PostId): Promise<void>;
    /**
     * Decrement post like count (atomic operation)
     */
    decrementLikeCount(postId: PostId): Promise<void>;
    /**
     * Find existing post reaction
     */
    findPostReaction(postId: PostId, userId: UserId): Promise<any>;
    /**
     * Find replies to a post
     */
    findPostReplies(postId: PostId, limit?: number): Promise<any>;
    /**
     * Get post statistics for a user
     */
    getUserPostStats(userId: UserId): Promise<any>;
    /**
     * Increment thread view count (atomic operation)
     */
    incrementThreadViewCount(threadId: ThreadId): Promise<void>;
    /**
     * Get earliest posts for multiple threads (for thread previews)
     */
    getEarliestPostsForThreads(threadIds: ThreadId[]): Promise<any>;
    /**
     * Execute recursive CTE query for descendant forums
     */
    getDescendantForumThreads(forumId: string, limit?: number): Promise<any>;
}
export declare const forumRepository: ForumRepository;
