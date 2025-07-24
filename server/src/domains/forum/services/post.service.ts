/**
 * Forum Post Service
 *
 * QUALITY IMPROVEMENT: Extracted from forum.service.ts god object
 * Handles post-specific operations with proper separation of concerns
 */

import { db } from '@db';
import { logger } from '@core/logger';
import { eventLogger } from '../../activity/services/event-logger.service';
import { AchievementEventEmitter } from '@core/events/achievement-events.service';
import { posts, threads, users as usersTable, postReactions } from '@schema';
import { sql, desc, asc, eq, and, count } from 'drizzle-orm';
import type { PostWithUser } from '@shared/types/core/forum.types';
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
			const { threadId, userId, page = 1, limit = 20, sortBy = 'oldest' } = params;

			const offset = (page - 1) * limit;

			// Build where conditions
			const whereConditions = [];

			if (threadId) {
				whereConditions.push(eq(posts.threadId, threadId));
			}

			if (userId) {
				whereConditions.push(eq(posts.userId, userId));
			}

			// Build sort order
			const orderBy = sortBy === 'newest' ? desc(posts.createdAt) : asc(posts.createdAt);

			// Base query
			let query = db
				.select({
					id: posts.id,
					content: posts.content,
					threadId: posts.threadId,
					userId: posts.userId,
					replyToPostId: posts.replyToPostId,
					createdAt: posts.createdAt,
					updatedAt: posts.updatedAt,
					likeCount: posts.likeCount,
					isEdited: posts.isEdited,
					editedAt: posts.editedAt,

					authorUsername: usersTable.username,
					authorAvatar: usersTable.avatarUrl
				})
				.from(posts)
				.leftJoin(usersTable, eq(posts.userId, usersTable.id));

			// Apply where conditions
			if (whereConditions.length > 0) {
				query = query.where(and(...whereConditions));
			}

			// --- Fix: build a separate count query (Drizzle builders are immutable)
			let countQuery = db.select({ total: count(posts.id) }).from(posts);
			if (whereConditions.length > 0) {
				countQuery = countQuery.where(and(...whereConditions));
			}
			const [{ total }] = await countQuery.execute();

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
	async getPostById(postId: PostId): Promise<PostWithUser | null> {
		try {
			const [post] = await db
				.select({
					id: posts.id,
					content: posts.content,
					threadId: posts.threadId,
					userId: posts.userId,
					replyToPostId: posts.replyToPostId,
					createdAt: posts.createdAt,
					updatedAt: posts.updatedAt,
					likeCount: posts.likeCount,
					isEdited: posts.isEdited,
					editedAt: posts.editedAt,

					authorUsername: usersTable.username,
					authorAvatar: usersTable.avatarUrl
				})
				.from(posts)
				.leftJoin(usersTable, eq(posts.userId, usersTable.id))
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
			const { content, threadId, userId, replyToPostId } = input;

			// Create post
			const [newPost] = await db
				.insert(posts)
				.values({
					content,
					threadId,
					userId,
					replyToPostId: replyToPostId || null,
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

			// Emit event for notifications/analytics
			try {
				await eventLogger.logPostCreated(userId, String(newPost.id), String(threadId));
			} catch (err) {
				logger.warn('PostService', 'Failed to emit post_created event', { err });
			}

			// Emit achievement event
			try {
				await AchievementEventEmitter.emitPostCreated(userId, {
					id: newPost.id,
					threadId: newPost.threadId,
					content: newPost.content,
					createdAt: newPost.createdAt
				});
			} catch (err) {
				logger.warn('PostService', 'Failed to emit achievement post_created event', { err });
			}

			logger.info('PostService', 'Post created successfully', {
				postId: newPost.id,
				threadId,
				userId
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
	async updatePost(postId: PostId, input: PostUpdateInput): Promise<PostWithUser> {
		try {
			const { content } = input;

			// Update post
			await db
				.update(posts)
				.set({
					content,
					editedAt: new Date(),
					isEdited: true,
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
	async deletePost(postId: PostId): Promise<void> {
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
	async likePost(postId: PostId, userId: UserId): Promise<void> {
		try {
			// Check if user already liked this post
			const [existingReaction] = await db
				.select()
				.from(postReactions)
				.where(
					and(
						eq(postReactions.postId, postId),
						eq(postReactions.userId, userId),
						eq(postReactions.reactionType, 'like')
					)
				);

			if (existingReaction) {
				throw new Error('User already liked this post');
			}

			// Add reaction
			await db.insert(postReactions).values({
				postId,
				userId,
				reactionType: 'like',
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
	async unlikePost(postId: PostId, userId: UserId): Promise<void> {
		try {
			// Remove reaction
			const deletedRows = await db
				.delete(postReactions)
				.where(
					and(
						eq(postReactions.postId, postId),
						eq(postReactions.userId, userId),
						eq(postReactions.reactionType, 'like')
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
	 * Tip a post with DGT and award XP
	 */
	async tipPost(postId: PostId, tipperId: UserId, amount: number): Promise<void> {
		try {
			// Get the post to find the recipient
			const post = await this.getPostById(postId);
			if (!post) {
				throw new Error('Post not found');
			}

			// Don't allow self-tipping
			if (tipperId === post.userId) {
				throw new Error('Cannot tip your own post');
			}

			// Import tip service
			const { tipService } = await import('../../engagement/tip/tip.service');

			// Send the tip using the tip service
			await tipService.sendTip({
				fromUserId: tipperId,
				toUserId: post.userId,
				amount: amount,
				currency: 'DGT',
				source: 'forum_post',
				contextId: postId,
				message: `Tip for post #${postId}`
			});

			// Import XP service for rewards
			const { xpService } = await import('../../xp/xp.service');

			// Award XP to the tipper for being generous (small amount)
			await xpService.awardXp(tipperId, 'TIP_GIVEN', {
				postId,
				amount,
				recipientId: post.userId
			});

			// Award XP to the post author for receiving a tip (larger amount)
			await xpService.awardXp(post.userId, 'TIP_RECEIVED', {
				postId,
				amount,
				tipperId
			});

			logger.info('PostService', 'Post tipped successfully', {
				postId,
				tipperId,
				recipientId: post.userId,
				amount
			});
		} catch (error) {
			logger.error('PostService', 'Error tipping post', { postId, tipperId, amount, error });
			throw error;
		}
	}

	/**
	 * Get post replies (nested posts)
	 */
	async getPostReplies(parentPostId: PostId): Promise<PostWithUser[]> {
		try {
			const replies = await db
				.select({
					id: posts.id,
					content: posts.content,
					threadId: posts.threadId,
					userId: posts.userId,
					replyToPostId: posts.replyToPostId,
					createdAt: posts.createdAt,
					updatedAt: posts.updatedAt,
					editedAt: posts.editedAt,
					isEdited: posts.isEdited,
					likeCount: posts.likeCount,

					authorUsername: usersTable.username,
					authorAvatar: usersTable.avatarUrl
				})
				.from(posts)
				.leftJoin(usersTable, eq(posts.userId, usersTable.id))
				.where(eq(posts.replyToPostId, parentPostId))
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
	private async updateThreadStats(threadId: ThreadId): Promise<void> {
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
