/**
 * Forum Thread Service
 *
 * QUALITY IMPROVEMENT: Extracted from forum.service.ts god object
 * Handles thread-specific operations with proper separation of concerns
 */

import { db } from '@db';
import { logger } from '@server/src/core/logger';
import {
	threads,
	posts,
	forumStructure,
	users as usersTable,
	threadTags,
	tags,
	userFollows
} from '@schema';
import { sql, desc, asc, eq, and, or, ilike, inArray, count, gte } from 'drizzle-orm';
import type {
	ThreadWithUser,
	ThreadWithPostsAndUser,
	ThreadWithUserAndCategory
} from '../../../../db/types/forum.types';

// Simple in-memory cache for tab content
interface CacheEntry {
	data: any;
	timestamp: number;
	ttl: number;
}

class SimpleCache {
	private cache = new Map<string, CacheEntry>();
	private readonly DEFAULT_TTL = 60 * 1000; // 60 seconds

	get(key: string): any | null {
		const entry = this.cache.get(key);
		if (!entry) return null;

		if (Date.now() - entry.timestamp > entry.ttl) {
			this.cache.delete(key);
			return null;
		}

		return entry.data;
	}

	set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
			ttl
		});
	}

	clear(): void {
		this.cache.clear();
	}

	// Clean up expired entries
	cleanup(): void {
		const now = Date.now();
		for (const [key, entry] of this.cache.entries()) {
			if (now - entry.timestamp > entry.ttl) {
				this.cache.delete(key);
			}
		}
	}
}

export interface ThreadSearchParams {
	structureId?: number;
	userId?: string;
	search?: string;
	tags?: string[];
	page?: number;
	limit?: number;
	sortBy?: 'newest' | 'oldest' | 'mostReplies' | 'mostViews' | 'trending';
	status?: 'active' | 'locked' | 'pinned';
	followingUserId?: string; // For "following" tab - get threads by users that this user follows
}

export type ContentTab = 'trending' | 'recent' | 'following';

export interface TabContentParams {
	tab: ContentTab;
	page?: number;
	limit?: number;
	forumId?: number;
	userId?: string; // For following tab
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
	private cache = new SimpleCache();

	constructor() {
		// Clean up cache every 5 minutes
		setInterval(() => this.cache.cleanup(), 5 * 60 * 1000);
	}

	/**
	 * Fetch threads by tab with caching
	 * Main entry point for the new content system
	 */
	async fetchThreadsByTab(params: TabContentParams): Promise<{
		items: ThreadWithUserAndCategory[];
		meta: {
			hasMore: boolean;
			total: number;
			page: number;
		};
	}> {
		const { tab, page = 1, limit = 20, forumId, userId } = params;

		// Build cache key
		const cacheKey = `${tab}:${forumId ?? 'all'}:${page}:${limit}:${userId ?? 'anon'}`;

		// Try cache first
		const cached = this.cache.get(cacheKey);
		if (cached) {
			logger.debug('ThreadService', 'Cache hit for tab content', { tab, cacheKey });
			return cached;
		}

		// Build search params based on tab type
		const searchParams = this.buildSearchParamsForTab(tab, {
			page,
			limit,
			structureId: forumId,
			followingUserId: tab === 'following' ? userId : undefined
		});

		// Fetch data
		const result = await this.searchThreads(searchParams);

		// Transform to expected format
		const response = {
			items: result.threads,
			meta: {
				hasMore: result.page < result.totalPages,
				total: result.total,
				page: result.page
			}
		};

		// Cache the result (different TTL for different tabs)
		const cacheTTL = this.getCacheTTLForTab(tab);
		this.cache.set(cacheKey, response, cacheTTL);

		logger.info('ThreadService', 'Fetched tab content', {
			tab,
			count: result.threads.length,
			page,
			cached: false
		});

		return response;
	}

	/**
	 * Build search parameters for specific tabs
	 */
	private buildSearchParamsForTab(
		tab: ContentTab,
		baseParams: Partial<ThreadSearchParams>
	): ThreadSearchParams {
		const params: ThreadSearchParams = {
			...baseParams,
			status: 'active' // Only show active threads by default
		};

		switch (tab) {
			case 'trending':
				params.sortBy = 'trending';
				// Only consider threads from last 7 days for trending
				break;
			case 'recent':
				params.sortBy = 'newest';
				break;
			case 'following':
				params.sortBy = 'newest';
				// followingUserId will be used to filter by followed users
				break;
		}

		return params;
	}

	/**
	 * Get cache TTL based on tab type
	 */
	private getCacheTTLForTab(tab: ContentTab): number {
		switch (tab) {
			case 'trending':
				return 60 * 1000; // 1 minute for trending
			case 'recent':
				return 30 * 1000; // 30 seconds for recent
			case 'following':
				return 45 * 1000; // 45 seconds for following
			default:
				return 60 * 1000;
		}
	}

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
				status,
				followingUserId
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
				case 'trending':
					// Simple trending formula: views*0.3 + posts*0.7, weighted by recency
					orderBy = desc(sql`
						(COALESCE(${threads.viewCount}, 0) * 0.3 + COALESCE(${threads.postCount}, 0) * 0.7) * 
						EXP(-EXTRACT(EPOCH FROM (NOW() - ${threads.createdAt}))/86400)
					`);
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

			// Handle following filtering (must be done before tag filtering)
			if (followingUserId) {
				query = query
					.innerJoin(userFollows, eq(userFollows.followeeId, threads.userId))
					.where(
						and(
							...(whereConditions.length > 0 ? whereConditions : []),
							eq(userFollows.followerId, followingUserId)
						)
					);
			}

			// Handle tag filtering
			if (tagFilters && tagFilters.length > 0) {
				query = query
					.leftJoin(threadTags, eq(threads.id, threadTags.threadId))
					.leftJoin(tags, eq(threadTags.tagId, tags.id))
					.where(
						and(
							...(whereConditions.length > 0 ? whereConditions : []),
							...(followingUserId ? [eq(userFollows.followerId, followingUserId)] : []),
							inArray(tags.name, tagFilters)
						)
					)
					.groupBy(
						threads.id,
						usersTable.id,
						forumStructure.id,
						...(followingUserId ? [userFollows.id] : [])
					);
			}

			// Get total count with a separate query to avoid issues with joins
			let countQuery = db.select({ total: count(threads.id) }).from(threads);

			if (whereConditions.length > 0) {
				countQuery = countQuery.where(and(...whereConditions));
			}

			// Add following join to count query if needed
			if (followingUserId) {
				countQuery = countQuery
					.innerJoin(userFollows, eq(userFollows.followeeId, threads.userId))
					.where(
						and(
							...(whereConditions.length > 0 ? whereConditions : []),
							eq(userFollows.followerId, followingUserId)
						)
					);
			}

			if (tagFilters && tagFilters.length > 0) {
				countQuery = countQuery
					.leftJoin(threadTags, eq(threads.id, threadTags.threadId))
					.leftJoin(tags, eq(threadTags.tagId, tags.id))
					.where(
						and(
							...(whereConditions.length > 0 ? whereConditions : []),
							...(followingUserId ? [eq(userFollows.followerId, followingUserId)] : []),
							inArray(tags.name, tagFilters)
						)
					);
			}

			const [{ total }] = await countQuery.execute();

			// Get paginated results
			const threadsData = await query.orderBy(orderBy).limit(limit).offset(offset);

			const totalPages = Math.ceil(total / limit);

			// Transform the flat data into the expected nested structure
			const formattedThreads = threadsData.map((thread) => ({
				id: thread.id,
				title: thread.title,
				slug: thread.slug,
				userId: thread.userId,
				prefixId: null, // TODO: Add prefix support
				isSticky: thread.isPinned,
				isLocked: thread.isLocked,
				isHidden: false, // TODO: Add hidden support
				viewCount: thread.viewCount,
				postCount: thread.postCount,
				firstPostLikeCount: 0, // TODO: Add like count
				lastPostAt: thread.lastPostAt?.toISOString() || null,
				createdAt: thread.createdAt.toISOString(),
				updatedAt: thread.updatedAt?.toISOString() || null,
				isSolved: thread.isSolved,
				solvingPostId: null, // TODO: Add solving post support
				user: {
					id: thread.userId,
					username: thread.authorUsername || 'Unknown',
					avatarUrl: thread.authorAvatar,
					activeAvatarUrl: thread.authorAvatar,
					role: thread.authorRole || 'user'
				},
				category: {
					id: thread.structureId,
					name: thread.categoryName || 'Unknown',
					slug: thread.categorySlug || 'unknown'
				},
				tags: [], // TODO: Add tags support
				canEdit: false, // TODO: Add permission support
				canDelete: false // TODO: Add permission support
			}));

			logger.info(
				'ThreadService',
				`Found ${threadsData.length} threads (page ${page}/${totalPages})`
			);

			return {
				threads: formattedThreads,
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
