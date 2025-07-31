import { eq, and, desc, sql, count, asc } from 'drizzle-orm';
import { db } from '@degentalk/db';
import { posts, threads, postReactions } from '@schema';
/**
 * Repository for forum post operations
 * All database operations for posts should go through this repository
 */
export class ForumRepository {
    /**
     * Create a new post
     */
    async createPost(data) {
        const [newPost] = await db
            .insert(posts)
            .values({
            id: data.threadId + '-' + Date.now(), // Simple ID generation
            content: data.content,
            threadId: data.threadId,
            userId: data.userId,
            replyToPostId: data.replyToPostId || null,
            createdAt: new Date(),
            updatedAt: new Date(),
            likeCount: 0,
            isDeleted: false
        })
            .returning();
        return newPost;
    }
    /**
     * Find posts by thread with pagination
     */
    async findPostsByThread(threadId, limit, offset, sortBy = 'oldest') {
        const orderBy = sortBy === 'newest' ? desc(posts.createdAt) : asc(posts.createdAt);
        return await db
            .select({
            id: posts.id,
            content: posts.content,
            threadId: posts.threadId,
            userId: posts.userId,
            replyToPostId: posts.replyToPostId,
            createdAt: posts.createdAt,
            updatedAt: posts.updatedAt,
            likeCount: posts.likeCount,
            isDeleted: posts.isDeleted
        })
            .from(posts)
            .where(and(eq(posts.threadId, threadId), eq(posts.isDeleted, false)))
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset);
    }
    /**
     * Count posts in a thread
     */
    async countPostsByThread(threadId) {
        const [result] = await db
            .select({ total: count(posts.id) })
            .from(posts)
            .where(and(eq(posts.threadId, threadId), eq(posts.isDeleted, false)));
        return result.total;
    }
    /**
     * Find post by ID
     */
    async findPostById(postId) {
        const [post] = await db
            .select()
            .from(posts)
            .where(and(eq(posts.id, postId), eq(posts.isDeleted, false)))
            .limit(1);
        return post || null;
    }
    /**
     * Update post content
     */
    async updatePost(postId, data) {
        const [updatedPost] = await db
            .update(posts)
            .set({
            content: data.content,
            updatedAt: data.updatedAt || new Date()
        })
            .where(eq(posts.id, postId))
            .returning();
        return updatedPost;
    }
    /**
     * Delete post (soft delete)
     */
    async deletePost(postId) {
        await db
            .update(posts)
            .set({
            isDeleted: true,
            updatedAt: new Date()
        })
            .where(eq(posts.id, postId));
    }
    /**
     * Increment post like count (atomic operation)
     */
    async incrementLikeCount(postId) {
        await db
            .update(posts)
            .set({
            likeCount: sql `${posts.likeCount} + 1`,
            updatedAt: new Date()
        })
            .where(eq(posts.id, postId));
    }
    /**
     * Decrement post like count (atomic operation)
     */
    async decrementLikeCount(postId) {
        await db
            .update(posts)
            .set({
            likeCount: sql `${posts.likeCount} - 1`,
            updatedAt: new Date()
        })
            .where(eq(posts.id, postId));
    }
    /**
     * Find existing post reaction
     */
    async findPostReaction(postId, userId) {
        const [reaction] = await db
            .select()
            .from(postReactions)
            .where(and(eq(postReactions.postId, postId), eq(postReactions.userId, userId)))
            .limit(1);
        return reaction || null;
    }
    /**
     * Find replies to a post
     */
    async findPostReplies(postId, limit = 50) {
        return await db
            .select()
            .from(posts)
            .where(and(eq(posts.replyToPostId, postId), eq(posts.isDeleted, false)))
            .orderBy(asc(posts.createdAt))
            .limit(limit);
    }
    /**
     * Get post statistics for a user
     */
    async getUserPostStats(userId) {
        const [stats] = await db
            .select({
            postCount: count(posts.id),
            totalLikes: sql `COALESCE(SUM(${posts.likeCount}), 0)`
        })
            .from(posts)
            .where(and(eq(posts.userId, userId), eq(posts.isDeleted, false)));
        return stats;
    }
    // ============ THREAD OPERATIONS ============
    /**
     * Increment thread view count (atomic operation)
     */
    async incrementThreadViewCount(threadId) {
        await db
            .update(threads)
            .set({
            viewCount: sql `${threads.viewCount} + 1`,
            updatedAt: new Date()
        })
            .where(eq(threads.id, threadId));
    }
    /**
     * Get earliest posts for multiple threads (for thread previews)
     */
    async getEarliestPostsForThreads(threadIds) {
        return await db
            .select()
            .from(posts)
            .where(and(sql `${posts.threadId} = ANY(${threadIds})`, 
        // Only get posts that are the earliest for their thread
        sql `${posts.createdAt} = (SELECT MIN(${posts.createdAt}) FROM ${posts} p2 WHERE p2.${posts.threadId} = ${posts.threadId})`));
    }
    /**
     * Execute recursive CTE query for descendant forums
     */
    async getDescendantForumThreads(forumId, limit = 50) {
        const result = await db.execute(sql `
			WITH RECURSIVE forum_tree AS (
				-- Start with direct children
				SELECT id, parent_id, 1 as depth
				FROM forums 
				WHERE parent_id = ${forumId}
				
				UNION ALL
				
				-- Recursively find all descendants
				SELECT f.id, f.parent_id, ft.depth + 1
				FROM forums f
				INNER JOIN forum_tree ft ON f.parent_id = ft.id
				WHERE ft.depth < 10  -- Prevent infinite loops
			)
			SELECT t.*, f.name as forum_name
			FROM threads t
			INNER JOIN forum_tree ft ON t.forum_id = ft.id
			INNER JOIN forums f ON t.forum_id = f.id
			WHERE t.is_deleted = false
			ORDER BY t.created_at DESC
			LIMIT ${limit}
		`);
        return result.rows;
    }
}
// Export singleton instance
export const forumRepository = new ForumRepository();
