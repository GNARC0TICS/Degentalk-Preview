// TODO: @syncSchema threads
// TODO: @syncSchema posts
// TODO: @syncSchema content_visibility_status_enum
import { db } from '@db';
import {
	forumCategories,
	threads,
	posts,
	users,
	threadPrefixes,
	tags,
	threadTags,
	users as usersTable // Alias users
} from '@schema';
import { sql, desc, asc, and, eq, isNull, count, like, ilike, or, inArray, SQL } from 'drizzle-orm';
import type { ForumCategoryWithStats, ThreadWithUser, ThreadWithPostsAndUser, PostWithUser, ThreadWithUserAndCategory, ForumTag } from '../../../../db/types/forum.types.ts';
import type { User, ForumCategory as ForumCategorySchemaType, Post as PostSchemaType } from '@schema'; 

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
	isZone: boolean;
	canonical: boolean;
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
	async getCategoriesWithStats(): Promise<ForumCategoryWithStats[]> {
		try {
			const categoriesWithCounts = await db
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
					isZone: forumCategories.isZone,
					canonical: forumCategories.canonical,
					minGroupIdRequired: forumCategories.minGroupIdRequired,
					tippingEnabled: forumCategories.tippingEnabled,
					xpMultiplier: forumCategories.xpMultiplier,
					pluginData: forumCategories.pluginData,
					createdAt: forumCategories.createdAt,
					updatedAt: forumCategories.updatedAt,
					threadCount: sql<number>`count(DISTINCT ${threads.id})`.as('threadCount'),
					postCount: sql<number>`count(${posts.id})`.as('postCount')
				})
				.from(forumCategories)
				.leftJoin(threads, eq(forumCategories.id, threads.categoryId))
				.leftJoin(posts, eq(threads.id, posts.threadId))
				.where(
					and(
						or(isNull(threads.id), eq(threads.isDeleted, false)),
						or(isNull(posts.id), eq(posts.isDeleted, false))
					)
				)
				.groupBy(
					forumCategories.id, forumCategories.name, forumCategories.slug, forumCategories.description,
					forumCategories.parentForumSlug, forumCategories.parentId, forumCategories.type, forumCategories.position,
					forumCategories.isVip, forumCategories.isLocked, forumCategories.minXp, forumCategories.color,
					forumCategories.icon, forumCategories.colorTheme, forumCategories.isHidden, forumCategories.isZone,
					forumCategories.canonical, forumCategories.minGroupIdRequired, forumCategories.tippingEnabled,
					forumCategories.xpMultiplier, forumCategories.pluginData, forumCategories.createdAt, forumCategories.updatedAt
				)
				.orderBy(asc(forumCategories.position));

			const categories: ForumCategoryWithStats[] = categoriesWithCounts.map(
				(c: CategoryWithCountsResult): ForumCategoryWithStats => ({
					...c, 
					description: c.description ?? null, // Changed undefined to null for consistency
					parentForumSlug: c.parentForumSlug ?? null, 
					colorTheme: c.colorTheme ?? null,
					pluginData: c.pluginData || {},
					threadCount: Number(c.threadCount || 0),
					postCount: Number(c.postCount || 0),
					lastThread: undefined, 
					canHaveThreads: c.type === 'forum', 
					childForums: [], 
				})
			);
			return categories;
		} catch (error) {
			console.error('Error in forumService.getCategoriesWithStats:', error);
			throw error;
		}
	},

	async getCategoriesTree(options: CategoriesTreeOptions = {}): Promise<any[]> {
		const { includeEmptyStats = false, includeHidden = false } = options;
		const allCategories = await this.getCategoriesWithStats();
		if (!allCategories || !Array.isArray(allCategories)) { return []; }
		const visibleCategories = allCategories.filter((cat) => cat);
		const categoriesWithStats = includeEmptyStats ? visibleCategories.map((cat) => ({...(cat || {}), threadCount: Number(cat?.threadCount || 0), postCount: Number(cat?.postCount || 0)})) : visibleCategories;
		const categoryMap = new Map<number, ForumCategoryWithStats & { children: any[] }>();
		const tree: any[] = [];
		categoriesWithStats.forEach((category) => { if (!category || typeof category !== 'object' || category.id === undefined) return; categoryMap.set(category.id, { ...category, children: [] }); });
		categoriesWithStats.forEach((category) => { if (!category || typeof category !== 'object' || category.id === undefined) return; const mappedCategory = categoryMap.get(category.id); if (!mappedCategory) return; if (category.parentId && categoryMap.has(category.parentId)) { const parent = categoryMap.get(category.parentId); if (parent && parent.children) { parent.children.push(mappedCategory); } } else if (!category.parentId) { tree.push(mappedCategory); } });
		return tree;
	},

	async getCategoryBySlug(slug: string): Promise<ForumCategoryWithStats | null> { const categories = await this.getCategoriesWithStats(); return categories.find((cat) => cat.slug === slug) || null; },
	async getForumBySlugWithTopics(slug: string): Promise<{ forum: ForumCategoryWithStats | null; topics: ForumCategoryWithStats[]; }> { const categories = await this.getCategoriesWithStats(); const forum = categories.find((cat) => cat.slug === slug) || null; if (!forum) { return { forum: null, topics: [] }; } const topics = categories.filter((cat) => cat.parentId === forum.id); topics.sort((a, b) => a.position - b.position); return { forum, topics }; },
	async getCategoryById(id: number): Promise<ForumCategoryWithStats | null> { const categories = await this.getCategoriesWithStats(); return categories.find((cat) => cat.id === id) || null; },
	async getForumsByParentId(parentId: number): Promise<ForumCategoryWithStats[]> { try { const categories = await this.getCategoriesWithStats(); const parentForum = categories.find((cat) => cat.id === parentId); const childForums = categories.filter((cat) => cat.parentId === parentId); return childForums.map((forum) => ({ ...forum, canHaveThreads: true, parentSlug: parentForum?.slug || null, parentName: parentForum?.name || null })); } catch (error) { console.error('Error in getForumsByParentId:', error); throw error; } },
	async debugForumRelationships(): Promise<{ primaryZones: Array<{ id: number; name: string; slug: string }>; categories: Array<{ id: number; name: string; slug: string; childForums: Array<{ id: number; name: string; slug: string; parentId: number; }>; }>; }> { try { const allCategories = await this.getCategoriesWithStats(); const primaryZones = allCategories.filter((cat) => cat.type === 'zone').map((zone) => ({ id: zone.id, name: zone.name, slug: zone.slug })); const categories = allCategories.filter((cat) => cat.type === 'category' && cat.parentId !== null).map((category) => { const childForums = allCategories.filter((forum) => forum.parentId === category.id && forum.type === 'forum').map((forum) => ({ id: forum.id, name: forum.name, slug: forum.slug, parentId: forum.parentId || 0 })); return { id: category.id, name: category.name, slug: category.slug, childForums }; }); return { primaryZones, categories }; } catch (error) { console.error('Error in debugForumRelationships:', error); throw error; } },
	async getPrefixes(categoryId?: number): Promise<any[]> { if (categoryId) { return db.select().from(threadPrefixes).where(and(eq(threadPrefixes.isActive, true), or(isNull(threadPrefixes.categoryId), eq(threadPrefixes.categoryId, categoryId)))).orderBy(asc(threadPrefixes.position)); } else { return db.select().from(threadPrefixes).where(eq(threadPrefixes.isActive, true)).orderBy(asc(threadPrefixes.position)); } },
	async getTags(): Promise<any[]> { return db.select().from(tags).orderBy(asc(tags.name)); },
	
  async searchThreads(params: ThreadSearchParams): Promise<{
		threads: ThreadWithUser[];
		pagination: { page: number; limit: number; totalThreads: number; totalPages: number; };
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
    limit: number = 50,
    currentUserId?: number
  ): Promise<ThreadWithPostsAndUser | null> {
    try {
      let threadCondition: SQL<unknown>;

      if (typeof slugOrId === 'string' && isNaN(Number(slugOrId))) {
        threadCondition = eq(threads.slug, slugOrId);
      } else {
        threadCondition = eq(threads.id, Number(slugOrId));
      }
      
      const threadResult = await db
        .select({
          thread: threads, // Changed from ...threads to nest thread data
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
      const actualThreadId = rawThreadData.thread.id; // Use actualThreadId derived from fetched data

      const threadTagResults = await db
        .select({ 
          id: tags.id, 
          name: tags.name, 
          slug: tags.slug,
          description: tags.description, // Added description
          createdAt: tags.createdAt    // Added createdAt
        })
        .from(threadTags)
        .innerJoin(tags, eq(threadTags.tagId, tags.id))
        .where(eq(threadTags.threadId, actualThreadId)); // Use actualThreadId

      await db.update(threads).set({ viewCount: sql`${threads.viewCount} + 1` }).where(eq(threads.id, actualThreadId)); // Use actualThreadId

      let hasBookmarked = false; // Placeholder

      // categoryData mapping remains largely the same, accesses rawThreadData.categoryRaw
      const categoryData: ForumCategorySchemaType = {
        id: rawThreadData.categoryRaw.id,
        name: rawThreadData.categoryRaw.name,
        slug: rawThreadData.categoryRaw.slug,
        description: rawThreadData.categoryRaw.description ?? null,
        parentForumSlug: rawThreadData.categoryRaw.parentForumSlug ?? null,
        parentId: rawThreadData.categoryRaw.parentId ?? null,
        type: rawThreadData.categoryRaw.type,
        position: rawThreadData.categoryRaw.position,
        isVip: rawThreadData.categoryRaw.isVip,
        isLocked: rawThreadData.categoryRaw.isLocked,
        minXp: rawThreadData.categoryRaw.minXp,
        color: rawThreadData.categoryRaw.color,
        icon: rawThreadData.categoryRaw.icon,
        colorTheme: rawThreadData.categoryRaw.colorTheme ?? null,
        isHidden: rawThreadData.categoryRaw.isHidden,
        isZone: rawThreadData.categoryRaw.isZone,
        canonical: rawThreadData.categoryRaw.canonical,
        minGroupIdRequired: rawThreadData.categoryRaw.minGroupIdRequired ?? null,
        tippingEnabled: rawThreadData.categoryRaw.tippingEnabled,
        xpMultiplier: rawThreadData.categoryRaw.xpMultiplier,
        pluginData: rawThreadData.categoryRaw.pluginData || {},
        createdAt: rawThreadData.categoryRaw.createdAt,
        updatedAt: rawThreadData.categoryRaw.updatedAt,
      };
      
      // Adjust destructuring due to `thread: threads` change
      const { thread, user, categoryRaw } = rawThreadData;

      const threadForResponse: ThreadWithUserAndCategory = {
        ...(thread as typeof threads.$inferSelect), // Use destructured thread object
        user: user as User, 
        category: categoryData,
        tags: threadTagResults.map(t => ({ // Ensure description is handled if nullable
          ...t,
          description: t.description ?? null
        })),
        hasBookmarked,
        lastPost: undefined, 
        // parentForumSlug is inherited from Thread type and should be string (not null)
      };

      const offset = (page - 1) * limit;
      const postConditions = [
        eq(posts.threadId, actualThreadId), // Use actualThreadId
        eq(posts.isDeleted, false),
      ];

      const postListRaw = await db
        .select({ 
          // Explicitly list all fields from posts schema
          id: posts.id, uuid: posts.uuid, threadId: posts.threadId, userId: posts.userId, content: posts.content,
          editorState: posts.editorState, likeCount: posts.likeCount, tipCount: posts.tipCount, totalTips: posts.totalTips,
          isFirstPost: posts.isFirstPost, isHidden: posts.isHidden, isEdited: posts.isEdited, editedAt: posts.editedAt,
          createdAt: posts.createdAt, updatedAt: posts.updatedAt, replyToPostId: posts.replyToPostId, pluginData: posts.pluginData,
          isDeleted: posts.isDeleted, deletedAt: posts.deletedAt, moderationReason: posts.moderationReason,
          visibilityStatus: posts.visibilityStatus, editedBy: posts.editedBy,
          // deletedBy: posts.deletedBy, // Uncomment if in schema
          // quarantineData: posts.quarantineData, // Uncomment if in schema
          // depth: posts.depth, // Uncomment if in schema
          user: usersTable 
        })
        .from(posts)
        .innerJoin(usersTable, eq(posts.userId, usersTable.id))
        .where(and(...postConditions))
        .orderBy(asc(posts.createdAt))
        .limit(limit)
        .offset(offset);

      const totalPostsResult = await db.select({ count: count() }).from(posts).where(and(...postConditions));
      const totalPosts = totalPostsResult[0]?.count || 0;

      const postIds = postListRaw.map(p => p.id);
      let userLikesSet = new Set<number>(); // Placeholder

      const postsForResponse: PostWithUser[] = postListRaw.map(p => {
        const { user: postUser, ...postDataFields } = p;
        // Ensure pluginData is handled if it can be null/undefined from DB but type expects object
        const finalPostData = {
          ...postDataFields,
          pluginData: postDataFields.pluginData || {}, // Assuming pluginData can be null and should default to {}
        };
        return {
          ...(finalPostData as PostSchemaType), // Cast to base Post type
          user: postUser as User, 
          hasLiked: userLikesSet.has(p.id),
        };
      });

      return {
        thread: threadForResponse,
        posts: postsForResponse,
        pagination: {
          page,
          pageSize: limit,
          totalItems: totalPosts,
          totalPages: Math.ceil(totalPosts / limit),
        },
      };

    } catch (error) {
      console.error('Error in forumService.getThreadDetails:', error);
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
			console.error('Error in forumService.updateThreadSolvedStatus:', error);
			throw error;
		}
	}
};

export default forumService;
