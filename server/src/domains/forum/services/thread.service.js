/**
 * Forum Thread Service
 *
 * QUALITY IMPROVEMENT: Extracted from forum.service.ts god object
 * Handles thread-specific operations with proper separation of concerns
 */
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { db } from '@db';
import { logger } from '@core/logger';
import { postService } from './post.service';
import { cacheService, CacheCategory, CacheMinute } from '@core/cache/unified-cache.service';
import { AchievementEventEmitter } from '@core/events/achievement-events.service';
import { getForumInfoBatch } from './thread.service.forum-batch-optimization';
import { threads, posts, forumStructure, users as usersTable, threadTags, tags } from '@schema';
import { sql, desc, asc, eq, and, ilike, inArray, count } from 'drizzle-orm';
import { eventLogger } from '../../activity/services/event-logger.service';
import { MentionsService } from '../../social/mentions.service';
import { getThreadRepository } from '@core/repository/repository-factory';
let ThreadService = (() => {
    let _instanceExtraInitializers = [];
    let _getZoneInfo_decorators;
    return class ThreadService {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getZoneInfo_decorators = [CacheMinute(CacheCategory.FORUM)];
            __esDecorate(this, null, _getZoneInfo_decorators, { kind: "method", name: "getZoneInfo", static: false, private: false, access: { has: obj => "getZoneInfo" in obj, get: obj => obj.getZoneInfo }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        threadRepository = (__runInitializers(this, _instanceExtraInitializers), getThreadRepository());
        constructor() {
            // Cache is now handled by the centralized cache service
        }
        /**
         * Fetch threads by tab with enhanced caching
         * Main entry point for the new content system
         */
        async fetchThreadsByTab(params) {
            const { tab, page = 1, limit = 20, forumId, userId } = params;
            // Build cache key with versioning for cache invalidation
            const cacheKey = `thread_tab:${tab}:${forumId ?? 'all'}:${page}:${limit}:${userId ?? 'anon'}:v2`;
            // Try enhanced Redis cache first
            const cached = await cacheService.get(cacheKey, { category: CacheCategory.THREAD });
            if (cached) {
                logger.debug('ThreadService', 'Redis cache hit for tab content', { tab, cacheKey });
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
            // Cache the result with 1-minute TTL for forum threads
            const cacheTTL = this.getCacheTTLForTab(tab);
            await cacheService.set(cacheKey, response, { ttl: cacheTTL, category: CacheCategory.THREAD });
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
        buildSearchParamsForTab(tab, baseParams) {
            const params = {
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
        getCacheTTLForTab(tab) {
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
        async searchThreads(params) {
            try {
                const { structureId, userId, search, tags: tagFilters, page = 1, limit = 20, sortBy = 'newest', status, followingUserId } = params;
                const offset = (page - 1) * limit;
                // Build WHERE conditions
                const whereConditions = [];
                // Filter by structureId if provided
                if (structureId) {
                    // Check if this forum has children - if so, include threads from children too
                    const childStructureIds = await this.getChildStructureIds(structureId);
                    if (childStructureIds.length > 0) {
                        // Include threads from parent and all children
                        const allStructureIds = [structureId, ...childStructureIds];
                        whereConditions.push(inArray(threads.structureId, allStructureIds));
                    }
                    else {
                        // Just this forum
                        whereConditions.push(eq(threads.structureId, structureId));
                    }
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
                ];
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
                let zoneInfoMap;
                try {
                    zoneInfoMap = await getForumInfoBatch(structureIds);
                }
                catch (batchError) {
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
                        }
                        catch (individualError) {
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
                    results: Object.fromEntries(Array.from(zoneInfoMap.entries()).map(([id, info]) => [
                        id,
                        info ? `${info.name} (${info.slug})` : 'null'
                    ]))
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
                            const parentPluginData = (parentStructure.pluginData || {});
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
                            canModerate: userResult?.role === 'admin' || userResult?.role === 'moderator'
                        },
                        // Legacy compatibility fields (deprecated but keeping for now)
                        canEdit: false,
                        canDelete: false,
                        excerpt: excerpt || undefined
                    };
                });
                logger.info('ThreadService', `Found ${threadsData.length} threads (page ${page}/${totalPages})`);
                return {
                    threads: formattedThreads,
                    total,
                    page,
                    totalPages
                };
            }
            catch (error) {
                logger.error('ThreadService', 'Error searching threads', {
                    params,
                    message: error?.message,
                    stack: error?.stack
                });
                // EMERGENCY: Throw the error so we can see what's happening
                throw error;
            }
        }
        /**
         * Get thread by ID with author and category details
         * Returns ThreadDisplay compatible format with proper zone data
         */
        async getThreadById(threadId) {
            try {
                const [threadResult] = await db.select().from(threads).where(eq(threads.id, threadId));
                if (!threadResult)
                    return null;
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
            }
            catch (error) {
                logger.error('ThreadService', 'Error fetching thread by ID', { threadId, error });
                throw error;
            }
        }
        /**
         * Get thread by slug with author and zone details
         * Returns ThreadDisplay compatible format with proper zone data
         */
        async getThreadBySlug(slug) {
            try {
                // First, try a simple query to isolate the issue
                const [threadResult] = await db.select().from(threads).where(eq(threads.slug, slug));
                if (!threadResult)
                    return null;
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
            }
            catch (error) {
                logger.error('ThreadService', 'Error fetching thread by slug', { slug, error });
                throw error;
            }
        }
        /**
         * Create a new thread
         */
        async createThread(input) {
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
                const firstPost = await postService.createPost({
                    content,
                    threadId: newThread.id,
                    userId,
                    replyToPostId: undefined
                });
                // 2️⃣  Handle tags if provided
                if (tagNames && tagNames.length > 0) {
                    await this.addTagsToThread(newThread.id, tagNames);
                }
                // 3️⃣  Process mentions in thread title and first post content
                try {
                    // Process mentions in thread title
                    await MentionsService.processMentions({
                        content: title,
                        mentioningUserId: userId,
                        type: 'thread',
                        threadId: newThread.id,
                        context: title
                    });
                    // Process mentions in first post content
                    if (firstPost && firstPost.id) {
                        await MentionsService.processMentions({
                            content: content,
                            mentioningUserId: userId,
                            type: 'post',
                            threadId: newThread.id,
                            postId: firstPost.id,
                            context: content.slice(0, 200)
                        });
                    }
                }
                catch (err) {
                    logger.warn('ThreadService', 'Failed to process mentions', { err });
                }
                // 4️⃣  Emit event-log for analytics / notifications
                try {
                    await eventLogger.logThreadCreated(userId, String(newThread.id));
                }
                catch (err) {
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
                }
                catch (err) {
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
                // Invalidate thread caches since new thread was created
                await this.invalidateThreadCaches(structureId);
                return completeThread;
            }
            catch (error) {
                logger.error('ThreadService', 'Error creating thread', { input, error });
                throw error;
            }
        }
        /**
         * Update thread view count
         */
        async incrementViewCount(threadId) {
            try {
                await db
                    .update(threads)
                    .set({
                    viewCount: sql `${threads.viewCount} + 1`,
                    updatedAt: new Date()
                })
                    .where(eq(threads.id, threadId));
                logger.debug('ThreadService', 'Thread view count incremented', { threadId });
            }
            catch (error) {
                logger.error('ThreadService', 'Error incrementing view count', { threadId, error });
                // Don't throw error for view count updates
            }
        }
        /**
         * Update thread post count
         */
        async updatePostCount(threadId) {
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
            }
            catch (error) {
                logger.error('ThreadService', 'Error updating post count', { threadId, error });
                throw error;
            }
        }
        /**
         * Update thread solved status
         */
        async updateThreadSolvedStatus(params) {
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
            }
            catch (error) {
                logger.error('ThreadService', 'Error updating thread solved status', { params, error });
                throw error;
            }
        }
        /**
         * Add tags to thread
         */
        async addTagsToThread(threadId, tagNames) {
            try {
                // Get or create tags
                const tagIds = [];
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
            }
            catch (error) {
                logger.error('ThreadService', 'Error adding tags to thread', { threadId, tagNames, error });
                throw error;
            }
        }
        /**
         * Generate URL-friendly slug from title
         */
        generateSlug(title) {
            return title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
                .substring(0, 100);
        }
        /**
         * Get all child structure IDs for a given parent structure
         */
        async getChildStructureIds(parentId) {
            try {
                const children = await db
                    .select({ id: forumStructure.id })
                    .from(forumStructure)
                    .where(eq(forumStructure.parentId, parentId));
                return children.map(child => child.id);
            }
            catch (error) {
                logger.error('ThreadService', 'Error getting child structure IDs', { parentId, error });
                return [];
            }
        }
        /**
         * Get zone information for a given structure ID with caching
         * Traverses up the hierarchy to find the top-level zone
         */
        async getZoneInfo(structureId) {
            try {
                // First get the structure node
                const [structure] = await db
                    .select()
                    .from(forumStructure)
                    .where(eq(forumStructure.id, structureId));
                if (!structure)
                    return null;
                // If it's already a zone, return it
                if (structure.parentId === null) {
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
                    if (!parent)
                        break;
                    if (parent.parentId === null) {
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
            }
            catch (error) {
                logger.error('ThreadService', 'Error fetching zone info', { structureId, error });
                return null;
            }
        }
        stripMarkup(raw) {
            // Removes HTML tags
            let text = raw.replace(/<[^>]*>/g, '');
            // Removes simple BBCode tags like [b], [/url], etc.
            text = text.replace(/\[.*?\]/g, '');
            return text;
        }
        /**
         * Fetch first post excerpt (plain-text, 150 chars max) for a thread
         */
        async getFirstPostExcerpt(threadId) {
            try {
                const [firstPost] = await db
                    .select({ content: posts.content })
                    .from(posts)
                    .where(eq(posts.threadId, threadId))
                    .orderBy(asc(posts.createdAt))
                    .limit(1);
                if (!firstPost)
                    return null;
                const plain = this.stripMarkup(firstPost.content || '');
                return plain.substring(0, 150);
            }
            catch (error) {
                logger.warn('ThreadService', 'Failed to fetch excerpt', { threadId, error });
                return null;
            }
        }
        /**
         * Batch fetch first post excerpts for multiple threads (fixes N+1)
         */
        async getFirstPostExcerptsBatch(threadIds) {
            if (threadIds.length === 0)
                return [];
            try {
                // Get first post for each thread using a more compatible approach
                const firstPosts = await db
                    .select({
                    threadId: posts.threadId,
                    content: posts.content
                })
                    .from(posts)
                    .where(and(inArray(posts.threadId, threadIds), 
                // Only get posts that are the earliest for their thread
                sql `${posts.createdAt} = (SELECT MIN(${posts.createdAt}) FROM ${posts} p2 WHERE p2.${posts.threadId} = ${posts.threadId})`));
                return firstPosts.map((post) => ({
                    threadId: post.threadId,
                    excerpt: post.content ? this.stripMarkup(post.content).substring(0, 150) : null
                }));
            }
            catch (error) {
                logger.warn('ThreadService', 'Failed to batch fetch excerpts', {
                    threadIds: threadIds.length,
                    error
                });
                // Fallback: return empty excerpts for all threads
                return threadIds.map((threadId) => ({ threadId, excerpt: null }));
            }
        }
        /**
         * Get all child structure IDs for a given parent structure
         * Used to aggregate threads from subforums when viewing parent forum
         */
        async getChildStructureIds(parentId) {
            try {
                // Use recursive CTE to get all descendant forum IDs
                const result = await db.execute(sql `
				WITH RECURSIVE forum_tree AS (
					-- Start with direct children
					SELECT id
					FROM forum_structure
					WHERE parent_id = ${parentId}
					
					UNION ALL
					
					-- Recursively get children of children
					SELECT fs.id
					FROM forum_structure fs
					INNER JOIN forum_tree ft ON fs.parent_id = ft.id
				)
				SELECT id FROM forum_tree
			`);
                return result.rows.map((row) => row.id);
            }
            catch (error) {
                logger.error('ThreadService', 'Error fetching child structure IDs', { parentId, error });
                return [];
            }
        }
        /**
         * Invalidate thread caches when threads are created or updated
         */
        async invalidateThreadCaches(forumId) {
            try {
                // Clear all thread tab caches
                await cacheService.deletePattern('thread_tab', CacheCategory.THREAD);
                // Clear zone info caches if forum specific
                if (forumId) {
                    await cacheService.delete(`ThreadService:getZoneInfo:${JSON.stringify([forumId])}`, {
                        category: CacheCategory.FORUM
                    });
                }
                logger.debug('ThreadService', 'Thread caches invalidated', { forumId });
            }
            catch (error) {
                logger.error('ThreadService', 'Error invalidating thread caches', { error });
            }
        }
    };
})();
export { ThreadService };
// Export singleton instance
export const threadService = new ThreadService();
