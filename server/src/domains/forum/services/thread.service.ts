/**
 * Forum Thread Service
 *
 * QUALITY IMPROVEMENT: Extracted from forum.service.ts god object
 * Handles thread-specific operations with proper separation of concerns
 */

import { db } from '@db';
import { logger } from '@server/src/core/logger';
import { postService } from './post.service';
import { cacheService } from '@server/src/core/cache.service';
import { AchievementEventEmitter } from '../../../core/events/achievement-events.service';
import { getZoneInfoBatch } from './thread.service.batch-optimization';
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
import { eventLogger } from '../../activity/services/event-logger.service';
import type { ForumId, StructureId, ThreadId, UserId, PostId, TagId } from '@shared/types';

// Using centralized cache service (Redis with in-memory fallback)

export interface ThreadSearchParams {
	structureId?: StructureId;
	userId?: UserId;
	search?: string;
	tags?: string[];
	page?: number;
	limit?: number;
	sortBy?: 'newest' | 'oldest' | 'mostReplies' | 'mostViews' | 'trending';
	status?: 'active' | 'locked' | 'pinned';
	followingUserId?: UserId; // For "following" tab - get threads by users that this user follows
}

export type ContentTab = 'trending' | 'recent' | 'following';

export interface TabContentParams {
	tab: ContentTab;
	page?: number;
	limit?: number;
	forumId?: ForumId;
	userId?: UserId; // For following tab
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

export class ThreadService {
	constructor() {
		// Cache is now handled by the centralized cache service
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
		const cached = await cacheService.get(cacheKey);
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
		await cacheService.set(cacheKey, response, cacheTTL);

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
			const whereConditions = [];

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
			// Batch fetch all users and structures instead of N+1 queries
			const userIds = [...new Set(threadsData.map((t) => t.userId))];
			const structureIds = [...new Set(threadsData.map((t) => t.structureId))];
			const threadIds = threadsData.map((t) => t.id);

			// First get the initial structures to find parent IDs
			const initialStructuresData = await db
				.select({
					id: forumStructure.id,
					name: forumStructure.name,
					slug: forumStructure.slug,
					type: forumStructure.type,
					parentId: forumStructure.parentId,
					pluginData: forumStructure.pluginData,
					colorTheme: forumStructure.colorTheme
				})
				.from(forumStructure)
				.where(inArray(forumStructure.id, structureIds));

			// Get unique parent IDs for additional zone lookup
			const parentIds = [
				...new Set(initialStructuresData.map((s) => s.parentId).filter(Boolean))
			] as number[];

			const [usersData, parentStructuresData, excerptData] = await Promise.all([
				// Batch fetch users
				db
					.select({
						id: usersTable.id,
						username: usersTable.username,
						avatarUrl: usersTable.avatarUrl,
						activeAvatarUrl: usersTable.activeAvatarUrl,
						role: usersTable.role
					})
					.from(usersTable)
					.where(inArray(usersTable.id, userIds)),

				// Batch fetch parent structures (potential zones)
				parentIds.length > 0
					? db
							.select({
								id: forumStructure.id,
								name: forumStructure.name,
								slug: forumStructure.slug,
								type: forumStructure.type,
								parentId: forumStructure.parentId,
								pluginData: forumStructure.pluginData,
								colorTheme: forumStructure.colorTheme
							})
							.from(forumStructure)
							.where(inArray(forumStructure.id, parentIds))
					: [],

				// Batch fetch excerpts
				this.getFirstPostExcerptsBatch(threadIds)
			]);

			// Combine all structures
			const structuresData = [...initialStructuresData, ...parentStructuresData];

			// Create lookup maps for O(1) access
			const usersMap = new Map(usersData.map((u) => [u.id, u]));
			const structuresMap = new Map(structuresData.map((s) => [s.id, s]));
			const excerptsMap = new Map(excerptData.map((e) => [e.threadId, e.excerpt]));

			// Batch fetch zone info for all unique structure IDs to eliminate N+1
			let zoneInfoMap: Map<number, any>;
			try {
				zoneInfoMap = await getZoneInfoBatch(structureIds);
			} catch (batchError) {
				logger.warn('ThreadService', 'Batch zone fetch failed, using individual lookups', {
					error: batchError.message,
					structureCount: structureIds.length
				});
				// Fallback to individual lookups
				zoneInfoMap = new Map();
				for (const structureId of structureIds) {
					try {
						const zoneInfo = await this.getZoneInfo(structureId);
						zoneInfoMap.set(structureId, zoneInfo);
					} catch (individualError) {
						logger.warn('ThreadService', `Individual zone lookup failed for ${structureId}`, {
							error: individualError.message
						});
						zoneInfoMap.set(structureId, null);
					}
				}
			}

			// Debug: Log what zone info we got
			logger.info('ThreadService', 'Zone info batch results', {
				requestedIds: structureIds,
				mapSize: zoneInfoMap.size,
				results: Object.fromEntries(
					Array.from(zoneInfoMap.entries()).map(([id, info]) => [
						id,
						info ? `${info.name} (${info.slug})` : 'null'
					])
				)
			});

			const formattedThreads = threadsData.map((thread) => {
				const userResult = usersMap.get(thread.userId);
				const structureResult = structuresMap.get(thread.structureId);
				const excerpt = excerptsMap.get(thread.id);
				let zoneInfo = zoneInfoMap.get(thread.structureId);

				// Fallback: If batch optimization didn't find zone, try direct lookup
				if (!zoneInfo && structureResult?.parentId) {
					const parentStructure = structuresMap.get(structureResult.parentId);
					if (parentStructure) {
						const parentPluginData = (parentStructure.pluginData || {}) as any;
						const parentConfigZoneType = parentPluginData?.configZoneType;
						if (parentConfigZoneType && parentConfigZoneType !== 'none') {
							zoneInfo = {
								id: parentStructure.id,
								name: parentStructure.name,
								slug: parentStructure.slug,
								colorTheme: parentStructure.colorTheme || 'default',
								isPrimary: parentConfigZoneType === 'primary'
							};
							logger.info('ThreadService', `Fallback zone found for thread ${thread.id}`, {
								threadStructureId: thread.structureId,
								threadStructureName: structureResult?.name,
								parentId: structureResult.parentId,
								parentName: parentStructure.name,
								parentConfigZoneType
							});
						}
					}
				}

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
						role: userResult?.role || 'user',
						forumStats: {
							level: 1, // TODO: Calculate actual level from XP
							xp: 0, // TODO: Fetch actual XP
							reputation: 0, // TODO: Fetch actual reputation
							totalPosts: 0, // TODO: Calculate post count
							totalThreads: 0, // TODO: Calculate thread count
							totalLikes: 0, // TODO: Calculate like count
							totalTips: 0 // TODO: Calculate tip count
						},
						isOnline: false, // TODO: Implement online status
						lastSeenAt: null // TODO: Implement last seen tracking
					},
					category: {
						id: thread.structureId,
						name: structureResult?.name || 'Unknown',
						slug: structureResult?.slug || 'unknown'
					},
					zone: zoneInfo
						? {
								id: zoneInfo.id,
								name: zoneInfo.name,
								slug: zoneInfo.slug,
								colorTheme: zoneInfo.colorTheme || 'default',
								isPrimary: zoneInfo.isPrimary || false
							}
						: {
								id: thread.structureId,
								name: structureResult?.name || 'Unknown',
								slug: structureResult?.slug || 'unknown',
								colorTheme: 'default',
								isPrimary: false
							},
					tags: [],
					permissions: {
						canEdit: false, // TODO: Implement proper permission checking
						canDelete: false, // TODO: Implement proper permission checking
						canReply: true, // TODO: Check forum rules and user permissions
						canMarkSolved: false, // TODO: Check if user can mark as solved
						canModerate: userResult?.role === 'admin' || userResult?.role === 'mod'
					},
					// Legacy compatibility fields (deprecated but keeping for now)
					canEdit: false,
					canDelete: false,
					excerpt: excerpt || undefined
				};
			});

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
	async getThreadById(threadId: ThreadId): Promise<ThreadWithUserAndCategory | null> {
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

			// 1️⃣  Create the very first post inside this thread so the UI has content
			await postService.createPost({
				content,
				threadId: newThread.id,
				userId,
				replyToPostId: undefined
			});

			// 2️⃣  Handle tags if provided
			if (tagNames && tagNames.length > 0) {
				await this.addTagsToThread(newThread.id, tagNames);
			}

			// 3️⃣  Emit event-log for analytics / notifications
			try {
				await eventLogger.logThreadCreated(userId, String(newThread.id));
			} catch (err) {
				logger.warn('ThreadService', 'Failed to emit thread_created event', { err });
			}

			// Emit achievement event
			try {
				await AchievementEventEmitter.emitThreadCreated(userId, {
					id: newThread.id,
					forumId: newThread.structureId,
					title: newThread.title,
					tags: tagNames || [],
					createdAt: newThread.createdAt
				});
			} catch (err) {
				logger.warn('ThreadService', 'Failed to emit achievement thread_created event', { err });
			}

			// 4️⃣  Fetch the complete thread with first-post count updated
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
	async incrementViewCount(threadId: ThreadId): Promise<void> {
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
	async updatePostCount(threadId: ThreadId): Promise<void> {
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
		threadId: ThreadId;
		solvingPostId?: PostId | null;
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
	private async addTagsToThread(threadId: ThreadId, tagNames: string[]): Promise<void> {
		try {
			// Get or create tags
			const tagIds: TagId[] = [];

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
	private async getZoneInfo(structureId: StructureId): Promise<{
		id: StructureId;
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
	private async getFirstPostExcerpt(threadId: ThreadId): Promise<string | null> {
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

	/**
	 * Batch fetch first post excerpts for multiple threads (fixes N+1)
	 */
	private async getFirstPostExcerptsBatch(
		threadIds: ThreadId[]
	): Promise<Array<{ threadId: ThreadId; excerpt: string | null }>> {
		if (threadIds.length === 0) return [];

		try {
			// Get first post for each thread using a more compatible approach
			const firstPosts = await db
				.select({
					threadId: posts.threadId,
					content: posts.content
				})
				.from(posts)
				.where(
					and(
						inArray(posts.threadId, threadIds),
						// Only get posts that are the earliest for their thread
						sql`${posts.createdAt} = (SELECT MIN(${posts.createdAt}) FROM ${posts} p2 WHERE p2.${posts.threadId} = ${posts.threadId})`
					)
				);

			return firstPosts.map((post) => ({
				threadId: post.threadId,
				excerpt: post.content ? this.stripMarkup(post.content).substring(0, 150) : null
			}));
		} catch (error) {
			logger.warn('ThreadService', 'Failed to batch fetch excerpts', {
				threadIds: threadIds.length,
				error
			});
			// Fallback: return empty excerpts for all threads
			return threadIds.map((threadId) => ({ threadId, excerpt: null }));
		}
	}
}

// Export singleton instance
export const threadService = new ThreadService();
