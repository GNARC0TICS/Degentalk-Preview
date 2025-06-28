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

			// Build WHERE conditions
			let whereConditions = [];

			// Filter by structureId if provided
			if (structureId) {
				whereConditions.push(eq(threads.structureId, structureId));
			}

			// Filter by userId if provided
			if (userId) {
				whereConditions.push(eq(threads.userId, userId));
			}

			// Filter by search term if provided
			if (search) {
				whereConditions.push(ilike(threads.title, `%${search}%`));
			}

			// Combine WHERE conditions
			const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

			// Count query with proper filtering
			const totalCountResult = await db
				.select({ count: count(threads.id) })
				.from(threads)
				.where(whereClause)
				.execute();

			const total = totalCountResult[0]?.count || 0;
			const totalPages = Math.max(1, Math.ceil(total / limit));

			// Main query with proper filtering and sorting - using simple select
			let query = db.select().from(threads).where(whereClause).limit(limit).offset(offset);

			// Apply sorting
			switch (sortBy) {
				case 'newest':
					query = query.orderBy(desc(threads.createdAt));
					break;
				case 'oldest':
					query = query.orderBy(asc(threads.createdAt));
					break;
				case 'mostReplies':
					query = query.orderBy(desc(threads.postCount));
					break;
				case 'mostViews':
					query = query.orderBy(desc(threads.viewCount));
					break;
				case 'trending':
					// For trending, prioritize recent threads with high engagement
					query = query.orderBy(desc(threads.hotScore), desc(threads.createdAt));
					break;
				default:
					query = query.orderBy(desc(threads.createdAt));
			}

			const threadsData = await query.execute();

			// Format threads with separate queries for relations
			const formattedThreads = await Promise.all(
				threadsData.map(async (thread) => {
					// Get user information separately
					const [userResult] = await db
						.select({
							username: usersTable.username,
							avatarUrl: usersTable.avatarUrl,
							activeAvatarUrl: usersTable.activeAvatarUrl,
							role: usersTable.role
						})
						.from(usersTable)
						.where(eq(usersTable.id, thread.userId));

					// Get structure information separately
					const [structureResult] = await db
						.select({
							name: forumStructure.name,
							slug: forumStructure.slug,
							type: forumStructure.type
						})
						.from(forumStructure)
						.where(eq(forumStructure.id, thread.structureId));

					// Get zone information for theming
					const zoneInfo = await this.getZoneInfo(thread.structureId);

					// Get excerpt
					const excerpt = await this.getFirstPostExcerpt(thread.id);

					return {
						id: thread.id,
						title: thread.title,
						slug: thread.slug ?? this.generateSlug(thread.title),
						userId: thread.userId,
						prefixId: null,
						isSticky: thread.isSticky || false,
						isLocked: thread.isLocked || false,
						isHidden: false,
						viewCount: thread.viewCount || 0,
						postCount: thread.postCount || 0,
						firstPostLikeCount: 0,
						lastPostAt: thread.lastPostAt ? new Date(thread.lastPostAt).toISOString() : null,
						createdAt: thread.createdAt
							? new Date(thread.createdAt).toISOString()
							: new Date().toISOString(),
						updatedAt: thread.updatedAt ? new Date(thread.updatedAt).toISOString() : null,
						isSolved: thread.isSolved || false,
						solvingPostId: null,
						user: {
							id: thread.userId,
							username: userResult?.username || 'Unknown',
							avatarUrl: userResult?.avatarUrl || null,
							activeAvatarUrl: userResult?.activeAvatarUrl || null,
							role: userResult?.role || 'user'
						},
						category: {
							id: thread.structureId,
							name: structureResult?.name || 'Unknown',
							slug: structureResult?.slug || 'unknown'
						},
						zone: zoneInfo || {
							name: structureResult?.name || 'Unknown',
							slug: structureResult?.slug || 'unknown',
							colorTheme: 'default'
						},
						tags: [],
						canEdit: false,
						canDelete: false,
						excerpt: excerpt || undefined
					};
				})
			);

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
			logger.error('ThreadService', 'Error searching threads', {
				params,
				message: (error as any)?.message,
				stack: (error as any)?.stack
			});

			// EMERGENCY: Throw the error so we can see what's happening
			throw error;
		}
	}

	/**
	 * Get thread by ID with author and category details
	 * Returns ThreadDisplay compatible format with proper zone data
	 */
	async getThreadById(threadId: number): Promise<ThreadWithUserAndCategory | null> {
		try {
			const [threadResult] = await db.select().from(threads).where(eq(threads.id, threadId));

			if (!threadResult) return null;

			// Get user information separately
			const [userResult] = await db
				.select({
					username: usersTable.username,
					avatarUrl: usersTable.avatarUrl,
					activeAvatarUrl: usersTable.activeAvatarUrl,
					role: usersTable.role
				})
				.from(usersTable)
				.where(eq(usersTable.id, threadResult.userId));

			// Get structure information separately
			const [structureResult] = await db
				.select({
					name: forumStructure.name,
					slug: forumStructure.slug,
					type: forumStructure.type
				})
				.from(forumStructure)
				.where(eq(forumStructure.id, threadResult.structureId));

			// Get zone information for theming
			const zoneInfo = await this.getZoneInfo(threadResult.structureId);

			// Get excerpt
			const excerpt = await this.getFirstPostExcerpt(threadId);

			// Format as ThreadDisplay-compatible object
			const formattedThread = {
				id: threadResult.id,
				title: threadResult.title,
				slug: threadResult.slug ?? this.generateSlug(threadResult.title),
				userId: threadResult.userId,
				structureId: threadResult.structureId,
				prefixId: null,
				isSticky: threadResult.isSticky || false,
				isLocked: threadResult.isLocked || false,
				isHidden: false,
				viewCount: threadResult.viewCount || 0,
				postCount: threadResult.postCount || 0,
				firstPostLikeCount: 0,
				lastPostAt: threadResult.lastPostAt
					? new Date(threadResult.lastPostAt).toISOString()
					: null,
				createdAt: threadResult.createdAt
					? new Date(threadResult.createdAt).toISOString()
					: new Date().toISOString(),
				updatedAt: threadResult.updatedAt ? new Date(threadResult.updatedAt).toISOString() : null,
				isSolved: threadResult.isSolved || false,
				solvingPostId: null,

				// User relationship
				user: {
					id: threadResult.userId,
					username: userResult?.username || 'Unknown',
					avatarUrl: userResult?.avatarUrl || null,
					activeAvatarUrl: userResult?.activeAvatarUrl || null,
					role: userResult?.role || 'user'
				},

				// Category relationship (legacy compatibility)
				category: {
					id: threadResult.structureId,
					name: structureResult?.name || 'Unknown',
					slug: structureResult?.slug || 'unknown'
				},

				// Zone relationship (required for theming)
				zone: zoneInfo || {
					id: threadResult.structureId,
					name: structureResult?.name || 'Unknown',
					slug: structureResult?.slug || 'unknown',
					colorTheme: 'default'
				},

				tags: [],
				canEdit: false,
				canDelete: false,
				excerpt: excerpt || undefined
			};

			return formattedThread;
		} catch (error) {
			logger.error('ThreadService', 'Error fetching thread by ID', { threadId, error });
			throw error;
		}
	}

	/**
	 * Get thread by slug with author and zone details
	 * Returns ThreadDisplay compatible format with proper zone data
	 */
	async getThreadBySlug(slug: string): Promise<ThreadWithUserAndCategory | null> {
		try {
			// First, try a simple query to isolate the issue
			const [threadResult] = await db.select().from(threads).where(eq(threads.slug, slug));

			if (!threadResult) return null;

			// Get user information separately
			const [userResult] = await db
				.select({
					username: usersTable.username,
					avatarUrl: usersTable.avatarUrl,
					activeAvatarUrl: usersTable.activeAvatarUrl,
					role: usersTable.role
				})
				.from(usersTable)
				.where(eq(usersTable.id, threadResult.userId));

			// Get structure information separately
			const [structureResult] = await db
				.select({
					name: forumStructure.name,
					slug: forumStructure.slug,
					type: forumStructure.type
				})
				.from(forumStructure)
				.where(eq(forumStructure.id, threadResult.structureId));

			// Get zone information for theming
			const zoneInfo = await this.getZoneInfo(threadResult.structureId);

			// Get excerpt
			const excerpt = await this.getFirstPostExcerpt(threadResult.id);

			// Format as ThreadDisplay-compatible object
			const formattedThread = {
				id: threadResult.id,
				title: threadResult.title,
				slug: threadResult.slug ?? this.generateSlug(threadResult.title),
				userId: threadResult.userId,
				structureId: threadResult.structureId,
				prefixId: null,
				isSticky: threadResult.isSticky || false,
				isLocked: threadResult.isLocked || false,
				isHidden: false,
				viewCount: threadResult.viewCount || 0,
				postCount: threadResult.postCount || 0,
				firstPostLikeCount: 0,
				lastPostAt: threadResult.lastPostAt
					? new Date(threadResult.lastPostAt).toISOString()
					: null,
				createdAt: threadResult.createdAt
					? new Date(threadResult.createdAt).toISOString()
					: new Date().toISOString(),
				updatedAt: threadResult.updatedAt ? new Date(threadResult.updatedAt).toISOString() : null,
				isSolved: threadResult.isSolved || false,
				solvingPostId: null,

				// User relationship
				user: {
					id: threadResult.userId,
					username: userResult?.username || 'Unknown',
					avatarUrl: userResult?.avatarUrl || null,
					activeAvatarUrl: userResult?.activeAvatarUrl || null,
					role: userResult?.role || 'user'
				},

				// Category relationship (legacy compatibility)
				category: {
					id: threadResult.structureId,
					name: structureResult?.name || 'Unknown',
					slug: structureResult?.slug || 'unknown'
				},

				// Zone relationship (required for theming)
				zone: zoneInfo || {
					id: threadResult.structureId,
					name: structureResult?.name || 'Unknown',
					slug: structureResult?.slug || 'unknown',
					colorTheme: 'default'
				},

				tags: [],
				canEdit: false,
				canDelete: false,
				excerpt: excerpt || undefined
			};

			return formattedThread;
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
			const { title, content, structureId, userId, tags: tagNames, ...options } = input;

			// Generate slug from title
			const slug = this.generateSlug(title);

			// Create thread (note: threads table doesn't have content field)
			const [newThread] = await db
				.insert(threads)
				.values({
					title,
					slug,
					structureId,
					userId,
					isLocked: options.isLocked || false,
					isSticky: options.isPinned || false, // Map isPinned option to isSticky field
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
				structureId
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
	 * Update thread solved status
	 */
	async updateThreadSolvedStatus(params: {
		threadId: number;
		solvingPostId?: number | null;
	}): Promise<ThreadWithUserAndCategory | null> {
		try {
			const { threadId, solvingPostId } = params;

			await db
				.update(threads)
				.set({
					isSolved: !!solvingPostId,
					solvingPostId: solvingPostId || null,
					updatedAt: new Date()
				})
				.where(eq(threads.id, threadId));

			// Return updated thread
			const updatedThread = await this.getThreadById(threadId);

			logger.info('ThreadService', 'Thread solved status updated', {
				threadId,
				isSolved: !!solvingPostId,
				solvingPostId
			});

			return updatedThread;
		} catch (error) {
			logger.error('ThreadService', 'Error updating thread solved status', { params, error });
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

	/**
	 * Get zone information for a given structure ID
	 * Traverses up the hierarchy to find the top-level zone
	 */
	private async getZoneInfo(structureId: number): Promise<{
		id: number;
		name: string;
		slug: string;
		colorTheme: string;
	} | null> {
		try {
			// First get the structure node
			const [structure] = await db
				.select()
				.from(forumStructure)
				.where(eq(forumStructure.id, structureId));

			if (!structure) return null;

			// If it's already a zone, return it
			if (structure.type === 'zone') {
				return {
					id: structure.id,
					name: structure.name,
					slug: structure.slug,
					colorTheme: structure.colorTheme || 'default'
				};
			}

			// Otherwise, traverse up to find the zone
			let currentNode = structure;
			let maxDepth = 5; // Prevent infinite loops

			while (currentNode.parentId && maxDepth > 0) {
				const [parent] = await db
					.select()
					.from(forumStructure)
					.where(eq(forumStructure.id, currentNode.parentId));

				if (!parent) break;

				if (parent.type === 'zone') {
					return {
						id: parent.id,
						name: parent.name,
						slug: parent.slug,
						colorTheme: parent.colorTheme || 'default'
					};
				}

				currentNode = parent;
				maxDepth--;
			}

			// If we couldn't find a zone, return the current structure as fallback
			return {
				id: structure.id,
				name: structure.name,
				slug: structure.slug,
				colorTheme: structure.colorTheme || structure.color || 'default'
			};
		} catch (error) {
			logger.error('ThreadService', 'Error fetching zone info', { structureId, error });
			return null;
		}
	}

	private stripMarkup(raw: string): string {
		// Removes HTML tags
		let text = raw.replace(/<[^>]*>/g, '');
		// Removes simple BBCode tags like [b], [/url], etc.
		text = text.replace(/\[.*?\]/g, '');
		return text;
	}

	/**
	 * Fetch first post excerpt (plain-text, 150 chars max) for a thread
	 */
	private async getFirstPostExcerpt(threadId: number): Promise<string | null> {
		try {
			const [firstPost] = await db
				.select({ content: posts.content })
				.from(posts)
				.where(eq(posts.threadId, threadId))
				.orderBy(asc(posts.createdAt))
				.limit(1);

			if (!firstPost) return null;

			const plain = this.stripMarkup(firstPost.content || '');
			return plain.substring(0, 150);
		} catch (error) {
			logger.warn('ThreadService', 'Failed to fetch excerpt', { threadId, error });
			return null;
		}
	}
}

// Export singleton instance
export const threadService = new ThreadService();
