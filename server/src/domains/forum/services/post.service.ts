/**
 * Forum Post Service
 *
 * QUALITY IMPROVEMENT: Extracted from forum.service.ts god object
 * Handles post-specific operations with proper separation of concerns
 */

import { db } from '@db';
import { logger } from '@server/src/core/logger';
import { posts, threads, users as usersTable, postReactions } from '@schema';
import { sql, desc, asc, eq, and, count } from 'drizzle-orm';
import type { PostWithUser } from '../../../../db/types/forum.types';

export interface PostCreateInput {
	content: string;
	threadId: number;
	authorId: number;
	parentPostId?: number;
}

export interface PostUpdateInput {
	content: string;
	editReason?: string;
}

export interface PostSearchParams {
	threadId?: number;
	authorId?: number;
	page?: number;
	limit?: number;
	sortBy?: 'newest' | 'oldest';
}

export class PostService {
	/**
	 * Get posts for a thread with pagination
	 */
	async getPostsByThread(params: PostSearchParams): Promise<{
		posts: PostWithUser[];
		total: number;
		page: number;
		totalPages: number;
	}> {
		try {
			const { threadId, authorId, page = 1, limit = 20, sortBy = 'oldest' } = params;

			const offset = (page - 1) * limit;

			// Build where conditions
			const whereConditions = [];

			if (threadId) {
				whereConditions.push(eq(posts.threadId, threadId));
			}

			if (authorId) {
				whereConditions.push(eq(posts.authorId, authorId));
			}

			// Build sort order
			const orderBy = sortBy === 'newest' ? desc(posts.createdAt) : asc(posts.createdAt);

			// Base query
			let query = db
				.select({
					// Post fields
					id: posts.id,
					content: posts.content,
					threadId: posts.threadId,
					authorId: posts.authorId,
					parentPostId: posts.parentPostId,
					createdAt: posts.createdAt,
					updatedAt: posts.updatedAt,
					editedAt: posts.editedAt,
					editReason: posts.editReason,
					likeCount: posts.likeCount,

					// Author fields
					authorUsername: usersTable.username,
					authorAvatar: usersTable.avatar,
					authorRole: usersTable.role
				})
				.from(posts)
				.leftJoin(usersTable, eq(posts.authorId, usersTable.id));

			// Apply where conditions
			if (whereConditions.length > 0) {
				query = query.where(and(...whereConditions));
			}

			// Get total count
			const [{ total }] = await query.select({ total: count(posts.id) }).execute();

			// Get paginated results
			const postsData = await query.orderBy(orderBy).limit(limit).offset(offset);

			const totalPages = Math.ceil(total / limit);

			logger.info('PostService', `Found ${postsData.length} posts (page ${page}/${totalPages})`);

			return {
				posts: postsData as PostWithUser[],
				total,
				page,
				totalPages
			};
		} catch (error) {
			logger.error('PostService', 'Error getting posts by thread', { params, error });
			throw error;
		}
	}

	/**
	 * Get post by ID with author details
	 */
	async getPostById(postId: number): Promise<PostWithUser | null> {
		try {
			const [post] = await db
				.select({
					// Post fields
					id: posts.id,
					content: posts.content,
					threadId: posts.threadId,
					authorId: posts.authorId,
					parentPostId: posts.parentPostId,
					createdAt: posts.createdAt,
					updatedAt: posts.updatedAt,
					editedAt: posts.editedAt,
					editReason: posts.editReason,
					likeCount: posts.likeCount,

					// Author fields
					authorUsername: usersTable.username,
					authorAvatar: usersTable.avatar,
					authorRole: usersTable.role
				})
				.from(posts)
				.leftJoin(usersTable, eq(posts.authorId, usersTable.id))
				.where(eq(posts.id, postId));

			return post || null;
		} catch (error) {
			logger.error('PostService', 'Error fetching post by ID', { postId, error });
			throw error;
		}
	}

	/**
	 * Create a new post
	 */
	async createPost(input: PostCreateInput): Promise<PostWithUser> {
		try {
			const { content, threadId, authorId, parentPostId } = input;

			// Create post
			const [newPost] = await db
				.insert(posts)
				.values({
					content,
					threadId,
					authorId,
					parentPostId: parentPostId || null,
					likeCount: 0,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();

			// Update thread post count and last post time
			await this.updateThreadStats(threadId);

			// Fetch the complete post with relations
			const completePost = await this.getPostById(newPost.id);

			if (!completePost) {
				throw new Error('Failed to retrieve created post');
			}

			logger.info('PostService', 'Post created successfully', {
				postId: newPost.id,
				threadId,
				authorId
			});

			return completePost;
		} catch (error) {
			logger.error('PostService', 'Error creating post', { input, error });
			throw error;
		}
	}

	/**
	 * Update a post
	 */
	async updatePost(postId: number, input: PostUpdateInput): Promise<PostWithUser> {
		try {
			const { content, editReason } = input;

			// Update post
			await db
				.update(posts)
				.set({
					content,
					editedAt: new Date(),
					editReason: editReason || null,
					updatedAt: new Date()
				})
				.where(eq(posts.id, postId));

			// Fetch the updated post
			const updatedPost = await this.getPostById(postId);

			if (!updatedPost) {
				throw new Error('Failed to retrieve updated post');
			}

			logger.info('PostService', 'Post updated successfully', { postId });

			return updatedPost;
		} catch (error) {
			logger.error('PostService', 'Error updating post', { postId, input, error });
			throw error;
		}
	}

	/**
	 * Delete a post
	 */
	async deletePost(postId: number): Promise<void> {
		try {
			// Get post to get thread ID
			const post = await this.getPostById(postId);
			if (!post) {
				throw new Error('Post not found');
			}

			// Delete post
			await db.delete(posts).where(eq(posts.id, postId));

			// Update thread stats
			await this.updateThreadStats(post.threadId);

			logger.info('PostService', 'Post deleted successfully', { postId, threadId: post.threadId });
		} catch (error) {
			logger.error('PostService', 'Error deleting post', { postId, error });
			throw error;
		}
	}

	/**
	 * Add like to post
	 */
	async likePost(postId: number, userId: number): Promise<void> {
		try {
			// Check if user already liked this post
			const [existingReaction] = await db
				.select()
				.from(postReactions)
				.where(
					and(
						eq(postReactions.postId, postId),
						eq(postReactions.userId, userId),
						eq(postReactions.type, 'like')
					)
				);

			if (existingReaction) {
				throw new Error('User already liked this post');
			}

			// Add reaction
			await db.insert(postReactions).values({
				postId,
				userId,
				type: 'like',
				createdAt: new Date()
			});

			// Update post like count
			await db
				.update(posts)
				.set({
					likeCount: sql`${posts.likeCount} + 1`,
					updatedAt: new Date()
				})
				.where(eq(posts.id, postId));

			logger.debug('PostService', 'Post liked successfully', { postId, userId });
		} catch (error) {
			logger.error('PostService', 'Error liking post', { postId, userId, error });
			throw error;
		}
	}

	/**
	 * Remove like from post
	 */
	async unlikePost(postId: number, userId: number): Promise<void> {
		try {
			// Remove reaction
			const deletedRows = await db
				.delete(postReactions)
				.where(
					and(
						eq(postReactions.postId, postId),
						eq(postReactions.userId, userId),
						eq(postReactions.type, 'like')
					)
				);

			if (deletedRows === 0) {
				throw new Error('Like not found');
			}

			// Update post like count
			await db
				.update(posts)
				.set({
					likeCount: sql`${posts.likeCount} - 1`,
					updatedAt: new Date()
				})
				.where(eq(posts.id, postId));

			logger.debug('PostService', 'Post unliked successfully', { postId, userId });
		} catch (error) {
			logger.error('PostService', 'Error unliking post', { postId, userId, error });
			throw error;
		}
	}

	/**
	 * Get post replies (nested posts)
	 */
	async getPostReplies(parentPostId: number): Promise<PostWithUser[]> {
		try {
			const replies = await db
				.select({
					// Post fields
					id: posts.id,
					content: posts.content,
					threadId: posts.threadId,
					authorId: posts.authorId,
					parentPostId: posts.parentPostId,
					createdAt: posts.createdAt,
					updatedAt: posts.updatedAt,
					editedAt: posts.editedAt,
					editReason: posts.editReason,
					likeCount: posts.likeCount,

					// Author fields
					authorUsername: usersTable.username,
					authorAvatar: usersTable.avatar,
					authorRole: usersTable.role
				})
				.from(posts)
				.leftJoin(usersTable, eq(posts.authorId, usersTable.id))
				.where(eq(posts.parentPostId, parentPostId))
				.orderBy(asc(posts.createdAt));

			return replies as PostWithUser[];
		} catch (error) {
			logger.error('PostService', 'Error getting post replies', { parentPostId, error });
			throw error;
		}
	}

	/**
	 * Update thread statistics after post changes
	 */
	private async updateThreadStats(threadId: number): Promise<void> {
		try {
			const [stats] = await db
				.select({
					postCount: count(posts.id),
					lastPostAt: sql<Date | null>`MAX(${posts.createdAt})`
				})
				.from(posts)
				.where(eq(posts.threadId, threadId));

			await db
				.update(threads)
				.set({
					postCount: stats.postCount,
					lastPostAt: stats.lastPostAt,
					updatedAt: new Date()
				})
				.where(eq(threads.id, threadId));

			logger.debug('PostService', 'Thread stats updated', { threadId, stats });
		} catch (error) {
			logger.error('PostService', 'Error updating thread stats', { threadId, error });
			// Don't throw error for stats updates
		}
	}
}

// Export singleton instance
export const postService = new PostService();
