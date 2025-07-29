/**
 * Forum Post Service
 *
 * QUALITY IMPROVEMENT: Extracted from forum.service.ts god object
 * Handles post-specific operations with proper separation of concerns
 */
import type { PostWithUser } from '@shared/types/forum.types';
import type { ThreadId, UserId, PostId } from '@shared/types/ids';
export interface PostCreateInput {
    content: string;
    threadId: ThreadId;
    userId: UserId;
    replyToPostId?: PostId;
}
export interface PostUpdateInput {
    content: string;
}
export interface PostSearchParams {
    threadId?: ThreadId;
    userId?: UserId;
    page?: number;
    limit?: number;
    sortBy?: 'newest' | 'oldest';
}
export declare class PostService {
    /**
     * Get posts for a thread with pagination
     */
    getPostsByThread(params: PostSearchParams): Promise<{
        posts: PostWithUser[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    /**
     * Get post by ID with author details
     */
    getPostById(postId: PostId): Promise<PostWithUser | null>;
    /**
     * Create a new post
     */
    createPost(input: PostCreateInput): Promise<PostWithUser>;
    /**
     * Update a post
     */
    updatePost(postId: PostId, input: PostUpdateInput): Promise<PostWithUser>;
    /**
     * Delete a post
     */
    deletePost(postId: PostId): Promise<void>;
    /**
     * Add like to post
     */
    likePost(postId: PostId, userId: UserId): Promise<void>;
    /**
     * Remove like from post
     */
    unlikePost(postId: PostId, userId: UserId): Promise<void>;
    /**
     * Tip a post with DGT and award XP
     */
    tipPost(postId: PostId, tipperId: UserId, amount: number): Promise<void>;
    /**
     * Get post replies (nested posts)
     */
    getPostReplies(parentPostId: PostId): Promise<PostWithUser[]>;
    /**
     * Update thread statistics after post changes
     */
    private updateThreadStats;
}
export declare const postService: PostService;
