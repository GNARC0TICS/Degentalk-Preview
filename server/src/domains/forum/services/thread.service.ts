/**
 * Forum Thread Service
 *
 * QUALITY IMPROVEMENT: Extracted from forum.service.ts god object
 * Handles thread-specific operations with proper separation of concerns
 */

import { db } from '@db';
import { logger } from '@server/src/core/logger';
import { threads, posts, forumStructure, users as usersTable, threadTags, tags } from '@schema';
import { sql, desc, asc, eq, and, or, ilike, inArray, count } from 'drizzle-orm';
import type {
	ThreadWithUser,
	ThreadWithPostsAndUser,
	ThreadWithUserAndCategory
} from '../../../../db/types/forum.types';

export interface ThreadSearchParams {
	structureId?: number;
	userId?: string;
	search?: string;
	tags?: string[];
	page?: number;
	limit?: number;
	sortBy?: 'newest' | 'oldest' | 'mostReplies' | 'mostViews';
	status?: 'active' | 'locked' | 'pinned';
}

export interface ThreadCreateInput {
	title: string;
	content: string;
	structureId: number;
	userId: string;
	tags?: string[];
	isLocked?: boolean;
	isPinned?: boolean;
	prefix?: string;
}

export class ThreadService {
	/**
	 * Search and filter threads with pagination
	 */
	async searchThreads(params: ThreadSearchParams): Promise<{
		threads: ThreadWithUserAndCategory[];
		total: number;
		page: number;
		totalPages: number;
	}> {
		try {
			const {
				structureId,
				userId,
				search,
				tags: tagFilters,
				page = 1,
				limit = 20,
				sortBy = 'newest',
				status
			} = params;

			const offset = (page - 1) * limit;

			// Build where conditions
			const whereConditions = [];

			if (structureId) {
				whereConditions.push(eq(threads.structureId, structureId));
			}

			if (userId) {
				whereConditions.push(eq(threads.userId, userId));
			}

			if (search) {
				whereConditions.push(
					or(ilike(threads.title, `%${search}%`), ilike(threads.content, `%${search}%`))
				);
			}

			if (status) {
				switch (status) {
					case 'locked':
						whereConditions.push(eq(threads.isLocked, true));
						break;
					case 'pinned':
						whereConditions.push(eq(threads.isPinned, true));
						break;
					case 'active':
						whereConditions.push(and(eq(threads.isLocked, false), eq(threads.isPinned, false)));
						break;
				}
			}

			// Build sort order
			let orderBy;
			switch (sortBy) {
				case 'oldest':
					orderBy = asc(threads.createdAt);
					break;
				case 'mostReplies':
					orderBy = desc(threads.postCount);
					break;
				case 'mostViews':
					orderBy = desc(threads.viewCount);
					break;
				case 'newest':
				default:
					orderBy = desc(threads.createdAt);
					break;
			}

			// Base query
			let query = db
				.select({
					// Thread fields
					id: threads.id,
					title: threads.title,
					content: threads.content,
					slug: threads.slug,
					structureId: threads.structureId,
					userId: threads.userId,
					postCount: threads.postCount,
					viewCount: threads.viewCount,
					isLocked: threads.isLocked,
					isPinned: threads.isPinned,
					isSolved: threads.isSolved,
					createdAt: threads.createdAt,
					updatedAt: threads.updatedAt,
					lastPostAt: threads.lastPostAt,

					// Author fields
					authorUsername: usersTable.username,
					authorAvatar: usersTable.avatar,
					authorRole: usersTable.role,

					// Category fields
					categoryName: forumStructure.name,
					categorySlug: forumStructure.slug
				})
				.from(threads)
				.leftJoin(usersTable, eq(threads.userId, usersTable.id))
				.leftJoin(forumStructure, eq(threads.structureId, forumStructure.id));

			// Apply where conditions
			if (whereConditions.length > 0) {
				query = query.where(and(...whereConditions));
			}

			// Handle tag filtering
			if (tagFilters && tagFilters.length > 0) {
				query = query
					.leftJoin(threadTags, eq(threads.id, threadTags.threadId))
					.leftJoin(tags, eq(threadTags.tagId, tags.id))
					.where(
						and(
							...(whereConditions.length > 0 ? whereConditions : []),
							inArray(tags.name, tagFilters)
						)
					)
					.groupBy(threads.id, usersTable.id, forumStructure.id);
			}

			// Get total count
			const [{ total }] = await query.select({ total: count(threads.id) }).execute();

			// Get paginated results
			const threadsData = await query.orderBy(orderBy).limit(limit).offset(offset);

			const totalPages = Math.ceil(total / limit);

			logger.info(
				'ThreadService',
				`Found ${threadsData.length} threads (page ${page}/${totalPages})`
			);

			return {
				threads: threadsData as ThreadWithUserAndCategory[],
				total,
				page,
				totalPages
			};
		} catch (error) {
			logger.error('ThreadService', 'Error searching threads', { params, error });
			throw error;
		}
	}

	/**
	 * Get thread by ID with author and category details
	 */
	async getThreadById(threadId: number): Promise<ThreadWithUserAndCategory | null> {
		try {
			const [thread] = await db
				.select({
					// Thread fields
					id: threads.id,
					title: threads.title,
					content: threads.content,
					slug: threads.slug,
					structureId: threads.structureId,
					userId: threads.userId,
					postCount: threads.postCount,
					viewCount: threads.viewCount,
					isLocked: threads.isLocked,
					isPinned: threads.isPinned,
					isSolved: threads.isSolved,
					createdAt: threads.createdAt,
					updatedAt: threads.updatedAt,
					lastPostAt: threads.lastPostAt,

					// Author fields
					authorUsername: usersTable.username,
					authorAvatar: usersTable.avatar,
					authorRole: usersTable.role,

					// Category fields
					categoryName: forumStructure.name,
					categorySlug: forumStructure.slug
				})
				.from(threads)
				.leftJoin(usersTable, eq(threads.userId, usersTable.id))
				.leftJoin(forumStructure, eq(threads.structureId, forumStructure.id))
				.where(eq(threads.id, threadId));

			return thread || null;
		} catch (error) {
			logger.error('ThreadService', 'Error fetching thread by ID', { threadId, error });
			throw error;
		}
	}

	/**
	 * Get thread by slug
	 */
	async getThreadBySlug(slug: string): Promise<ThreadWithUserAndCategory | null> {
		try {
			const [thread] = await db
				.select({
					// Thread fields
					id: threads.id,
					title: threads.title,
					content: threads.content,
					slug: threads.slug,
					structureId: threads.structureId,
					userId: threads.userId,
					postCount: threads.postCount,
					viewCount: threads.viewCount,
					isLocked: threads.isLocked,
					isPinned: threads.isPinned,
					isSolved: threads.isSolved,
					createdAt: threads.createdAt,
					updatedAt: threads.updatedAt,
					lastPostAt: threads.lastPostAt,

					// Author fields
					authorUsername: usersTable.username,
					authorAvatar: usersTable.avatar,
					authorRole: usersTable.role,

					// Category fields
					categoryName: forumStructure.name,
					categorySlug: forumStructure.slug
				})
				.from(threads)
				.leftJoin(usersTable, eq(threads.userId, usersTable.id))
				.leftJoin(forumStructure, eq(threads.structureId, forumStructure.id))
				.where(eq(threads.slug, slug));

			return thread || null;
		} catch (error) {
			logger.error('ThreadService', 'Error fetching thread by slug', { slug, error });
			throw error;
		}
	}

	/**
	 * Create a new thread
	 */
	async createThread(input: ThreadCreateInput): Promise<ThreadWithUserAndCategory> {
		try {
			const { title, content, categoryId, authorId, tags: tagNames, ...options } = input;

			// Generate slug from title
			const slug = this.generateSlug(title);

			// Create thread
			const [newThread] = await db
				.insert(threads)
				.values({
					title,
					content,
					slug,
					categoryId,
					authorId,
					isLocked: options.isLocked || false,
					isPinned: options.isPinned || false,
					postCount: 0,
					viewCount: 0,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();

			// Handle tags if provided
			if (tagNames && tagNames.length > 0) {
				await this.addTagsToThread(newThread.id, tagNames);
			}

			// Fetch the complete thread with relations
			const completeThread = await this.getThreadById(newThread.id);

			if (!completeThread) {
				throw new Error('Failed to retrieve created thread');
			}

			logger.info('ThreadService', 'Thread created successfully', {
				threadId: newThread.id,
				title,
				categoryId
			});

			return completeThread;
		} catch (error) {
			logger.error('ThreadService', 'Error creating thread', { input, error });
			throw error;
		}
	}

	/**
	 * Update thread view count
	 */
	async incrementViewCount(threadId: number): Promise<void> {
		try {
			await db
				.update(threads)
				.set({
					viewCount: sql`${threads.viewCount} + 1`,
					updatedAt: new Date()
				})
				.where(eq(threads.id, threadId));

			logger.debug('ThreadService', 'Thread view count incremented', { threadId });
		} catch (error) {
			logger.error('ThreadService', 'Error incrementing view count', { threadId, error });
			// Don't throw error for view count updates
		}
	}

	/**
	 * Update thread post count
	 */
	async updatePostCount(threadId: number): Promise<void> {
		try {
			const [{ postCount }] = await db
				.select({ postCount: count(posts.id) })
				.from(posts)
				.where(eq(posts.threadId, threadId));

			await db
				.update(threads)
				.set({
					postCount,
					updatedAt: new Date(),
					lastPostAt: new Date()
				})
				.where(eq(threads.id, threadId));

			logger.debug('ThreadService', 'Thread post count updated', { threadId, postCount });
		} catch (error) {
			logger.error('ThreadService', 'Error updating post count', { threadId, error });
			throw error;
		}
	}

	/**
	 * Add tags to thread
	 */
	private async addTagsToThread(threadId: number, tagNames: string[]): Promise<void> {
		try {
			// Get or create tags
			const tagIds: number[] = [];

			for (const tagName of tagNames) {
				let [tag] = await db.select({ id: tags.id }).from(tags).where(eq(tags.name, tagName));

				if (!tag) {
					[tag] = await db
						.insert(tags)
						.values({ name: tagName, slug: this.generateSlug(tagName) })
						.returning({ id: tags.id });
				}

				tagIds.push(tag.id);
			}

			// Link tags to thread
			const threadTagValues = tagIds.map((tagId) => ({
				threadId,
				tagId
			}));

			await db.insert(threadTags).values(threadTagValues);

			logger.debug('ThreadService', 'Tags added to thread', { threadId, tagNames });
		} catch (error) {
			logger.error('ThreadService', 'Error adding tags to thread', { threadId, tagNames, error });
			throw error;
		}
	}

	/**
	 * Generate URL-friendly slug from title
	 */
	private generateSlug(title: string): string {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim()
			.substring(0, 100);
	}
}

// Export singleton instance
export const threadService = new ThreadService();
