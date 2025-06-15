// TODO: @syncSchema threads
// TODO: @syncSchema posts
// TODO: @syncSchema content_visibility_status_enum
import { db } from '@db';
import { logger } from '@server/src/core/logger';
import {
	forumCategories,
	threads,
	posts,
	users,
	threadPrefixes,
	tags,
	threadTags,
	postReactions, // Added import for postReactions
	users as usersTable // Alias users
} from '@schema';
import { sql, desc, asc, and, eq, isNull, count, like, ilike, or, inArray, SQL } from 'drizzle-orm';
import type { ForumCategoryWithStats, ThreadWithUser, ThreadWithPostsAndUser, PostWithUser, ThreadWithUserAndCategory, ForumTag } from '../../../../db/types/forum.types.ts';
import type { User, ForumCategory as ForumCategorySchemaType, Post as PostSchemaType } from '@schema';

// Simple in-memory cache
const CACHE_DURATION_MS = 30 * 1000; // 30 seconds
let categoriesCache: {
	timestamp: number;
	data: ForumCategoryWithStats[];
} | null = null;

type ThreadPrefixType = typeof threadPrefixes.$inferSelect;

type CategoryWithCountsResult = {
	id: number;
	name: string;
	slug: string;
	description: string | null;
	parentForumSlug: string | null; 
	parentId: number | null;
	type: string;
	position: number;
	isVip: boolean;
	isLocked: boolean;
	minXp: number;
	color: string;
	icon: string;
	colorTheme: string | null;
	isHidden: boolean;
	minGroupIdRequired: number | null;
	tippingEnabled: boolean; 
	xpMultiplier: number;   
	pluginData: any; 
	createdAt: Date; 
	updatedAt: Date; 
	threadCount: number | null; 
	postCount: number | null;   
};

export interface ThreadSearchParams {
	categoryId?: number;
	prefix?: string;
	tag?: string;
	page?: number;
	limit?: number;
	sortBy?: 'latest' | 'hot' | 'staked' | 'popular' | 'recent';
	search?: string;
}

interface CategoriesTreeOptions {
	includeEmptyStats?: boolean;
	includeHidden?: boolean;
}

export const forumService = {
	async getCategoriesWithStats(includeCounts: boolean = true): Promise<ForumCategoryWithStats[]> {
		try {
			if (includeCounts && categoriesCache && (Date.now() - categoriesCache.timestamp < CACHE_DURATION_MS) && categoriesCache.data.length > 0) {
				// console.log('Serving categories with counts from cache');
				return categoriesCache.data;
			}
			// console.log(`Fetching categories from DB (includeCounts: ${includeCounts})`);

			let categoriesDataRaw: CategoryWithCountsResult[];

			if (includeCounts) {
				const threadCountsSubquery = db.$with('thread_counts').as(
					db.select({
						categoryId: threads.categoryId,
						count: sql<number>`count(DISTINCT ${threads.id})`.as('thread_count')
					}).from(threads)
						.where(eq(threads.isDeleted, false))
						.groupBy(threads.categoryId)
				);

				const postCountsSubquery = db.$with('post_counts').as(
					db.select({
						categoryId: threads.categoryId,
						count: sql<number>`count(${posts.id})`.as('post_count')
					}).from(posts)
						.innerJoin(threads, eq(posts.threadId, threads.id))
						.where(and(eq(posts.isDeleted, false), eq(threads.isDeleted, false)))
						.groupBy(threads.categoryId)
				);
				
				categoriesDataRaw = await db
					.with(threadCountsSubquery, postCountsSubquery)
					.select({
						id: forumCategories.id,
						name: forumCategories.name,
						slug: forumCategories.slug,
						description: forumCategories.description,
						parentForumSlug: forumCategories.parentForumSlug,
						parentId: forumCategories.parentId,
						type: forumCategories.type,
						position: forumCategories.position,
						isVip: forumCategories.isVip,
						isLocked: forumCategories.isLocked,
						minXp: forumCategories.minXp,
						color: forumCategories.color,
						icon: forumCategories.icon,
						colorTheme: forumCategories.colorTheme,
						isHidden: forumCategories.isHidden,
						minGroupIdRequired: forumCategories.minGroupIdRequired,
						tippingEnabled: forumCategories.tippingEnabled,
						xpMultiplier: forumCategories.xpMultiplier,
						pluginData: forumCategories.pluginData,
						createdAt: forumCategories.createdAt,
						updatedAt: forumCategories.updatedAt,
						threadCount: threadCountsSubquery.count,
						postCount: postCountsSubquery.count
					})
					.from(forumCategories)
					.leftJoin(threadCountsSubquery, eq(forumCategories.id, threadCountsSubquery.categoryId))
					.leftJoin(postCountsSubquery, eq(forumCategories.id, postCountsSubquery.categoryId))
					.orderBy(asc(forumCategories.position));

			} else {
				// Fetch without counts
				categoriesDataRaw = await db
					.select({
						id: forumCategories.id,
						name: forumCategories.name,
						slug: forumCategories.slug,
						description: forumCategories.description,
						parentForumSlug: forumCategories.parentForumSlug,
						parentId: forumCategories.parentId,
						type: forumCategories.type,
						position: forumCategories.position,
						isVip: forumCategories.isVip,
						isLocked: forumCategories.isLocked,
						minXp: forumCategories.minXp,
						color: forumCategories.color,
						icon: forumCategories.icon,
						colorTheme: forumCategories.colorTheme,
						isHidden: forumCategories.isHidden,
						minGroupIdRequired: forumCategories.minGroupIdRequired,
						tippingEnabled: forumCategories.tippingEnabled,
						xpMultiplier: forumCategories.xpMultiplier,
						pluginData: forumCategories.pluginData,
						createdAt: forumCategories.createdAt,
						updatedAt: forumCategories.updatedAt,
						threadCount: sql<null>`null`.as('threadCount'), // Explicitly null when not counting
						postCount: sql<null>`null`.as('postCount')    // Explicitly null when not counting
					})
					.from(forumCategories)
					.orderBy(asc(forumCategories.position));
			}
			
			const categories: ForumCategoryWithStats[] = categoriesDataRaw.map(
				(c: CategoryWithCountsResult): ForumCategoryWithStats => ({ 
					...c, 
					description: c.description ?? null,
					parentForumSlug: c.parentForumSlug ?? null, 
					colorTheme: c.colorTheme ?? null,
					pluginData: c.pluginData || {},
					threadCount: includeCounts ? Number(c.threadCount || 0) : 0, // Set to 0 if not included
					postCount: includeCounts ? Number(c.postCount || 0) : 0,   // Set to 0 if not included
					isZone: c.type === 'zone',
					canonical: c.type === 'zone' && !c.parentId,
					lastThread: undefined, 
					canHaveThreads: c.type === 'forum', 
					childForums: [], 
				})
			);

			// Update cache only if we included counts, as that's the "full" data
			if (includeCounts && categories.length > 0) {
				// console.log('Updating categories cache');
				categoriesCache = {
					timestamp: Date.now(),
					data: categories,
				};
			}
			return categories;
		} catch (error) {
			logger.error('ForumService', 'Error in getCategoriesWithStats', { err: error, includeCounts });
			throw error;
		}
	},

	async getCategoriesTree(options: CategoriesTreeOptions = {}): Promise<any[]> {
		const { includeEmptyStats = false, includeHidden = false } = options;
		// Pass includeCounts=true to getCategoriesWithStats for tree construction,
		// as counts are often relevant for display in trees.
		const allCategories = await this.getCategoriesWithStats(true);
		if (!allCategories || !Array.isArray(allCategories)) { return []; }
		const visibleCategories = allCategories.filter((cat) => cat);
		const categoriesWithStats = includeEmptyStats ? visibleCategories.map((cat) => ({...(cat || {}), threadCount: Number(cat?.threadCount || 0), postCount: Number(cat?.postCount || 0)})) : visibleCategories;
		const categoryMap = new Map<number, ForumCategoryWithStats & { children: any[] }>();
		const tree: any[] = [];
		categoriesWithStats.forEach((category) => { if (!category || typeof category !== 'object' || category.id === undefined) return; categoryMap.set(category.id, { ...category, children: [] }); });
		categoriesWithStats.forEach((category) => { if (!category || typeof category !== 'object' || category.id === undefined) return; const mappedCategory = categoryMap.get(category.id); if (!mappedCategory) return; if (category.parentId && categoryMap.has(category.parentId)) { const parent = categoryMap.get(category.parentId); if (parent && parent.children) { parent.children.push(mappedCategory); } } else if (!category.parentId) { tree.push(mappedCategory); } });
		return tree;
	},

	async getCategoryBySlug(slug: string): Promise<ForumCategoryWithStats | null> { 
		// Assuming counts are usually desired when fetching a single category by slug
		const categories = await this.getCategoriesWithStats(true); 
		return categories.find((cat) => cat.slug === slug) || null; 
	},
	async getForumBySlugWithTopics(slug: string): Promise<{ forum: ForumCategoryWithStats | null; topics: ForumCategoryWithStats[]; }> { 
		// Assuming counts are desired for forum and its topics
		const categories = await this.getCategoriesWithStats(true); 
		const forum = categories.find((cat) => cat.slug === slug) || null; 
		if (!forum) { return { forum: null, topics: [] }; } 
		const topics = categories.filter((cat) => cat.parentId === forum.id); 
		topics.sort((a, b) => a.position - b.position); 
		return { forum, topics }; 
	},
	async getCategoryById(id: number): Promise<ForumCategoryWithStats | null> { 
		// Assuming counts are desired
		const categories = await this.getCategoriesWithStats(true); 
		return categories.find((cat) => cat.id === id) || null; 
	},
	async getForumsByParentId(parentId: number): Promise<ForumCategoryWithStats[]> { 
		try { 
			// Assuming counts are desired
			const categories = await this.getCategoriesWithStats(true); 
			const parentForum = categories.find((cat) => cat.id === parentId); 
			const childForums = categories.filter((cat) => cat.parentId === parentId); 
			return childForums.map((forum) => ({ ...forum, canHaveThreads: true, parentSlug: parentForum?.slug || null, parentName: parentForum?.name || null })); 
		} catch (error) { 
			logger.error('ForumService', 'Error in getForumsByParentId', { err: error, parentId });
			throw error; 
		} 
	},
	async debugForumRelationships(): Promise<{ primaryZones: Array<{ id: number; name: string; slug: string }>; categories: Array<{ id: number; name: string; slug: string; childForums: Array<{ id: number; name: string; slug: string; parentId: number; }>; }>; }> { 
		try { 
			// Assuming counts are not critical for debugging relationships
			const allCategories = await this.getCategoriesWithStats(false); 
			const primaryZones = allCategories.filter((cat) => cat.type === 'zone').map((zone) => ({ id: zone.id, name: zone.name, slug: zone.slug })); 
			const categories = allCategories.filter((cat) => cat.type === 'category' && cat.parentId !== null).map((category) => { 
				const childForums = allCategories.filter((forum) => forum.parentId === category.id && forum.type === 'forum').map((forum) => ({ id: forum.id, name: forum.name, slug: forum.slug, parentId: forum.parentId || 0 })); 
				return { id: category.id, name: category.name, slug: category.slug, childForums }; 
			}); 
			return { primaryZones, categories }; 
		} catch (error) { 
			logger.error('ForumService', 'Error in debugForumRelationships', { err: error });
			throw error; 
		} 
	},
	async getPrefixes(categoryId?: number): Promise<any[]> { if (categoryId) { return db.select().from(threadPrefixes).where(and(eq(threadPrefixes.isActive, true), or(isNull(threadPrefixes.categoryId), eq(threadPrefixes.categoryId, categoryId)))).orderBy(asc(threadPrefixes.position)); } else { return db.select().from(threadPrefixes).where(eq(threadPrefixes.isActive, true)).orderBy(asc(threadPrefixes.position)); } },
	async getTags(): Promise<any[]> { return db.select().from(tags).orderBy(asc(tags.name)); },

	async searchThreads(params: ThreadSearchParams): Promise<{
		threads: ThreadWithUser[];
		pagination: { page: number; limit: number; totalThreads: number; totalPages: number };
	}> {
		const { categoryId, prefix, tag, page = 1, limit = 10, sortBy = 'latest', search } = params;
		const offset = (page - 1) * limit;
		const conditions: (SQL<unknown> | undefined)[] = [eq(threads.isDeleted, false), eq(threads.isHidden, false)];
		if (categoryId) conditions.push(eq(threads.categoryId, categoryId));
		if (prefix) { const prefixResult = await db.select({ id: threadPrefixes.id }).from(threadPrefixes).where(eq(threadPrefixes.name, prefix)).limit(1); if (prefixResult.length > 0) conditions.push(eq(threads.prefixId, prefixResult[0].id)); }
		let tagIdNum: number | undefined;
		if (tag) { const tagResult = await db.select({ id: tags.id }).from(tags).where(eq(tags.name, tag)).limit(1); if (tagResult.length > 0) tagIdNum = tagResult[0].id; }
		if (search) conditions.push(or(ilike(threads.title, `%${search}%`)));
		let orderByClause: (SQL<unknown> | SQL.Aliased<unknown>)[] = [desc(threads.isSticky), desc(threads.createdAt)];
		switch (sortBy) { case 'hot': orderByClause = [desc(threads.isSticky), desc(threads.hotScore), desc(threads.lastPostAt)]; break; case 'staked': orderByClause = [desc(threads.isSticky), desc(threads.dgtStaked), desc(threads.lastPostAt)]; break; case 'popular': orderByClause = [desc(threads.isSticky), desc(threads.postCount), desc(threads.lastPostAt)]; break; case 'recent': orderByClause = [desc(threads.isSticky), desc(threads.lastPostAt)]; break; case 'latest': orderByClause = [desc(threads.isSticky), desc(threads.createdAt)]; break; }
		
		const selectFields = { threadData: threads, userData: usersTable };
		const validConditions = conditions.filter((c) => c !== undefined) as SQL<unknown>[];
		
		let rawResults: Array<{ threadData: typeof threads.$inferSelect; userData: User }>;
		if (tagIdNum) {
			rawResults = await db.select(selectFields).from(threads).innerJoin(usersTable, eq(threads.userId, usersTable.id)).innerJoin(threadTags, and(eq(threadTags.threadId, threads.id), eq(threadTags.tagId, tagIdNum))).where(and(...validConditions)).orderBy(...orderByClause).limit(limit).offset(offset);
		} else {
			rawResults = await db.select(selectFields).from(threads).innerJoin(usersTable, eq(threads.userId, usersTable.id)).where(and(...validConditions)).orderBy(...orderByClause).limit(limit).offset(offset);
		}

		const processedThreads = rawResults.map(r => ({ ...r.threadData, user: r.userData, postCount: r.threadData.postCount || 0 }));

		let totalThreads = 0; 
		const countQueryBase = db.select({ count: count() }).from(threads);
		if (tagIdNum) { const countResult = await countQueryBase.innerJoin(threadTags, and(eq(threadTags.threadId, threads.id), eq(threadTags.tagId, tagIdNum))).where(and(...validConditions)); totalThreads = countResult[0]?.count || 0; }
		else { const countResult = await countQueryBase.where(and(...validConditions)); totalThreads = countResult[0]?.count || 0; }
		
		const prefixIds = processedThreads.map((t) => t.prefixId).filter(id => id != null) as number[];
		const prefixesMap: Record<number, ThreadPrefixType> = {};
		if (prefixIds.length > 0) { const prefixResults = await db.select().from(threadPrefixes).where(inArray(threadPrefixes.id, prefixIds)); prefixResults.forEach((p: ThreadPrefixType) => { prefixesMap[p.id] = p; }); }
		
		const threadsWithPrefixAndUser = processedThreads.map((thread) => ({ ...thread, prefix: thread.prefixId ? prefixesMap[thread.prefixId] : null })) as ThreadWithUser[];
		
		return { threads: threadsWithPrefixAndUser, pagination: { page, limit, totalThreads, totalPages: Math.ceil(totalThreads / limit) } };
	},

	async getThreadDetails(
		slugOrId: string | number,
		page: number = 1,
		requestedLimit: number = 20, // Changed default to 20, matching typical frontend
		currentUserId?: number
	): Promise<ThreadWithPostsAndUser | null> {
		try {
			const MAX_LIMIT = 100;
			const limit = Math.min(requestedLimit, MAX_LIMIT); // Cap the limit

			let threadCondition: SQL<unknown>;

			if (typeof slugOrId === 'string' && isNaN(Number(slugOrId))) {
				threadCondition = eq(threads.slug, slugOrId);
			} else {
				threadCondition = eq(threads.id, Number(slugOrId));
			}
			
			const threadResult = await db
				.select({
					thread: threads, 
					user: usersTable, 
					categoryRaw: forumCategories, 
				})
				.from(threads)
				.innerJoin(usersTable, eq(threads.userId, usersTable.id))
				.innerJoin(forumCategories, eq(threads.categoryId, forumCategories.id))
				.where(threadCondition)
				.limit(1);

			if (threadResult.length === 0) return null;

			const rawThreadData = threadResult[0];
			const actualThreadId = rawThreadData.thread.id; 

			const threadTagResults = await db
				.select({ 
					id: tags.id, 
					name: tags.name, 
					slug: tags.slug,
					description: tags.description, 
					createdAt: tags.createdAt    
				})
				.from(threadTags)
				.innerJoin(tags, eq(threadTags.tagId, tags.id))
				.where(eq(threadTags.threadId, actualThreadId)); 

			await db.update(threads).set({ viewCount: sql`${threads.viewCount} + 1` }).where(eq(threads.id, actualThreadId)); 

			let hasBookmarked = false; 

			const categoryDataFromDb = rawThreadData.categoryRaw;
			
			// Construct the category object for the response, ensuring it matches ForumCategorySchemaType
			// The derived isZone and canonical are not part of the base schema type.
			const categoryForResponse: ForumCategorySchemaType = {
				id: categoryDataFromDb.id,
				name: categoryDataFromDb.name,
				slug: categoryDataFromDb.slug,
				description: categoryDataFromDb.description ?? null,
				parentForumSlug: categoryDataFromDb.parentForumSlug ?? null,
				parentId: categoryDataFromDb.parentId ?? null,
				type: categoryDataFromDb.type,
				position: categoryDataFromDb.position,
				isVip: categoryDataFromDb.isVip,
				isLocked: categoryDataFromDb.isLocked,
				minXp: categoryDataFromDb.minXp,
				color: categoryDataFromDb.color,
				icon: categoryDataFromDb.icon,
				colorTheme: categoryDataFromDb.colorTheme ?? null,
				isHidden: categoryDataFromDb.isHidden,
				minGroupIdRequired: categoryDataFromDb.minGroupIdRequired ?? null,
				tippingEnabled: categoryDataFromDb.tippingEnabled,
				xpMultiplier: categoryDataFromDb.xpMultiplier,
				pluginData: categoryDataFromDb.pluginData || {},
				createdAt: categoryDataFromDb.createdAt,
				updatedAt: categoryDataFromDb.updatedAt,
			};
			
			const { thread, user } = rawThreadData;

			const threadForResponse: ThreadWithUserAndCategory = {
				...(thread as typeof threads.$inferSelect), 
				user: user as User, 
				category: categoryForResponse, // Use the schema-compliant category object
				tags: threadTagResults.map(t => ({ 
					...t,
					description: t.description ?? null
				})),
				hasBookmarked,
				lastPost: undefined,
				// Explicitly set parentForumSlug from the category data
				// If the category is a forum itself, its slug is the parentForumSlug for the thread.
				// If the category is a sub-category (type='category') under a zone, then categoryData.parentForumSlug would be the zone's slug.
				// The logic here assumes categoryForResponse.slug is the direct forum the thread belongs to.
				parentForumSlug: categoryForResponse.slug, 
			};

			const offset = (page - 1) * limit;
			const postConditions = [
				eq(posts.threadId, actualThreadId), 
				eq(posts.isDeleted, false),
			];

			// Subquery to check if the current user has liked a post
			const userReactionSubquery = db.$with('user_reactions').as(
				db.select({
					postId: postReactions.postId,
					liked: sql<boolean>`true`.as('liked')
				})
				.from(postReactions)
				.where(and(
					eq(postReactions.userId, currentUserId || -1), // Use -1 if no user, so no matches
					eq(postReactions.reactionType, 'like')
				))
			);
			
			const postListRaw = await db
				.with(userReactionSubquery)
				.select({ 
					id: posts.id, uuid: posts.uuid, threadId: posts.threadId, userId: posts.userId, content: posts.content,
					editorState: posts.editorState, likeCount: posts.likeCount, tipCount: posts.tipCount, totalTips: posts.totalTips,
					isFirstPost: posts.isFirstPost, isHidden: posts.isHidden, isEdited: posts.isEdited, editedAt: posts.editedAt,
					createdAt: posts.createdAt, updatedAt: posts.updatedAt, replyToPostId: posts.replyToPostId, pluginData: posts.pluginData,
					isDeleted: posts.isDeleted, deletedAt: posts.deletedAt, moderationReason: posts.moderationReason,
					visibilityStatus: posts.visibilityStatus, editedBy: posts.editedBy,
					user: usersTable,
					hasLiked: userReactionSubquery.liked 
				})
				.from(posts)
				.innerJoin(usersTable, eq(posts.userId, usersTable.id))
				.leftJoin(userReactionSubquery, eq(posts.id, userReactionSubquery.postId))
				.where(and(...postConditions))
				.orderBy(asc(posts.createdAt))
				.limit(limit)
				.offset(offset);

			const totalPostsResult = await db.select({ count: count() }).from(posts).where(and(...postConditions));
			const totalPosts = totalPostsResult[0]?.count || 0;

			// const postIds = postListRaw.map(p => p.id); // No longer needed for userLikesSet
			// let userLikesSet = new Set<number>(); // No longer needed

			const postsForResponse: PostWithUser[] = postListRaw.map(p => {
				const { user: postUser, hasLiked, ...postDataFields } = p; // Destructure hasLiked
				const finalPostData = {
					...postDataFields,
					pluginData: postDataFields.pluginData || {}, 
				};
				return {
					...(finalPostData as PostSchemaType), 
					user: postUser as User, 
					hasLiked: !!hasLiked, // Ensure boolean, convert null to false
				};
			});

			return {
				thread: threadForResponse,
				posts: postsForResponse,
				pagination: {
					page,
					pageSize: limit, // Use the capped limit variable
					totalItems: totalPosts,
					totalPages: Math.ceil(totalPosts / limit), // Use the capped limit variable
				},
			};

		} catch (error) {
			logger.error('ForumService', 'Error in getThreadDetails', { err: error, slugOrId, page, limit, currentUserId });
			throw error;
		}
	},

	async updateThreadSolvedStatus({
		threadId,
		solvingPostId
	}: {
		threadId: number;
		solvingPostId?: number | null;
	}): Promise<any | null> {
		try {
			if (solvingPostId !== null && solvingPostId !== undefined) {
				const [postCheck] = await db.select({ id: posts.id }).from(posts)
					.where(and(eq(posts.id, solvingPostId), eq(posts.threadId, threadId), eq(posts.isDeleted, false)))
					.limit(1);
				if (!postCheck) throw new Error('Invalid solving post ID or post does not belong to the thread.');
			}
			const [updatedThread] = await db.update(threads)
				.set({
					isSolved: solvingPostId !== null && solvingPostId !== undefined,
					solvingPostId: solvingPostId === undefined ? null : solvingPostId,
					updatedAt: new Date()
				})
				.where(eq(threads.id, threadId))
				.returning({
					id: threads.id,
					title: threads.title,
					isSolved: threads.isSolved,
					solvingPostId: threads.solvingPostId,
					updatedAt: threads.updatedAt
				});
			return updatedThread || null;
		} catch (error) {
			logger.error('ForumService', 'Error in updateThreadSolvedStatus', { err: error, threadId, solvingPostId });
			throw error;
		}
	}
};

export default forumService;
