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
import { sql, desc, asc, and, eq, isNull, count, like, ilike, or, inArray, SQL } from 'drizzle-orm'; // Added inArray and SQL
// Removed: import { ForumCategoryWithStats, ThreadWithUser } from '@shared/types';
import type { User } from '@schema'; // Import User type from schema
// Import threadPrefixes table to infer type - already imported above

// Import shared Zod schemas and types
import { 
  ForumCategorySharedSchema,
  type ForumCategoryShared,
  ThreadRulesSchema,
  type ThreadRules,
  AccessControlSchema,
  type AccessControl,
  SEOSchema,
  type SEO,
  ForumStatsSchema,
  type ForumStats
} from '../../../../shared/schemas/forum'; // Adjust path if necessary
import { ThreadWithUser } from '@shared/types'; // Keep this if used elsewhere


// Define type for ThreadPrefix based on schema
type ThreadPrefixType = typeof threadPrefixes.$inferSelect;

// Define a type for the result of the getCategoriesWithStats Drizzle query
type CategoryWithCountsResult = {
  id: number; // from forumCategories.id (aliased from category_id)
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
  type: string; // existing 'type' field from db
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
  pluginData: any; 
  createdAt: Date; 
  updatedAt: Date;

  // New fields from schema
  forumType: string; 
  slugOverride: string | null;
  components: string[]; 
  threadRules: ThreadRules; 
  accessControl: AccessControl; 
  displayPriority: number;
  seo: SEO; 

  // Aggregated fields
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
  // Get all forum categories with forum stats
  async getCategoriesWithStats(): Promise<ForumCategoryShared[]> {
    try {
      // Fetch categories and join with threads and posts to get counts
      const categoriesWithCountsDb = await db.select({
        // Existing fields (ensure all are covered)
        id: forumCategories.id,
        name: forumCategories.name,
        description: forumCategories.description,
        slug: forumCategories.slug,
        position: forumCategories.position,
        minGroupIdRequired: forumCategories.minGroupIdRequired,
        parentId: forumCategories.parentId,
        createdAt: forumCategories.createdAt,
        updatedAt: forumCategories.updatedAt,
        pluginData: forumCategories.pluginData,
        type: forumCategories.type, // existing 'type' field
        colorTheme: forumCategories.colorTheme,
        isVip: forumCategories.isVip,
        isLocked: forumCategories.isLocked,
        minXp: forumCategories.minXp,
        color: forumCategories.color,
        icon: forumCategories.icon,
        isHidden: forumCategories.isHidden,
        isZone: forumCategories.isZone,
        canonical: forumCategories.canonical,

        // New fields
        forumType: forumCategories.forumType,
        slugOverride: forumCategories.slugOverride,
        components: forumCategories.components,
        threadRules: forumCategories.threadRules,
        accessControl: forumCategories.accessControl,
        displayPriority: forumCategories.displayPriority,
        seo: forumCategories.seo,
        
        // Calculate thread count for each category
        threadCount: sql<number>`count(DISTINCT ${threads.id})`.as('threadCount'),
        // Calculate total post count for each category by joining with posts
        postCount: sql<number>`count(${posts.id})`.as('postCount'),
      })
      .from(forumCategories)
      // Left join with threads to include categories even if they have no threads
      .leftJoin(threads, eq(forumCategories.id, threads.categoryId))
      // Left join with posts to count total posts per category
      .leftJoin(posts, eq(threads.id, posts.threadId))
      // Filter out deleted threads and posts for counts
      .where(and(
        or(isNull(threads.id), eq(threads.isDeleted, false)),
        or(isNull(posts.id), eq(posts.isDeleted, false))
      ))
      // Group by category fields to aggregate counts per category
      .groupBy(
        forumCategories.id,
        forumCategories.name,
        forumCategories.description,
        forumCategories.slug,
        forumCategories.position,
        forumCategories.minGroupIdRequired,
        forumCategories.parentId,
        forumCategories.createdAt,
        forumCategories.updatedAt,
        forumCategories.pluginData,
        forumCategories.type,
        forumCategories.colorTheme,
        forumCategories.isVip,
        forumCategories.isLocked,
        forumCategories.minXp,
        forumCategories.color,
        forumCategories.icon,
        forumCategories.isHidden,
        forumCategories.isZone,
        forumCategories.canonical,
        // New fields for groupBy
        forumCategories.forumType,
        forumCategories.slugOverride,
        forumCategories.components,
        forumCategories.threadRules,
        forumCategories.accessControl,
        forumCategories.displayPriority,
        forumCategories.seo
      )
      .orderBy(asc(forumCategories.position));

      // Cast to the internal result type
      const categoriesWithCounts = categoriesWithCountsDb as unknown as CategoryWithCountsResult[];

      console.log(`[forumService] getCategoriesWithStats - Raw query result count: ${categoriesWithCounts.length}`);
      // console.log('[forumService] getCategoriesWithStats - Raw query result (first 5):', categoriesWithCounts.slice(0, 5));
      // console.log('[forumService] getCategoriesWithStats - Raw query result (full):', categoriesWithCounts);

      // Map the results to the ForumCategoryShared type
      const categories: ForumCategoryShared[] = categoriesWithCounts.map((c) => {
        // Ensure defaults for complex objects if DB returns null or empty JSON string for them
        // Drizzle's $type and default values in schema (e.g., default('{}')) should handle most of this.
        const parsedPluginData = typeof c.pluginData === 'string' ? JSON.parse(c.pluginData || '{}') : c.pluginData || {};
        const parsedComponents = Array.isArray(c.components) ? c.components : (typeof c.components === 'string' ? JSON.parse(c.components || '[]') : []);
        const parsedThreadRules = (c.threadRules && typeof c.threadRules === 'object' && Object.keys(c.threadRules).length > 0) ? c.threadRules : ThreadRulesSchema.parse({});
        const parsedAccessControl = (c.accessControl && typeof c.accessControl === 'object' && Object.keys(c.accessControl).length > 0) ? c.accessControl : AccessControlSchema.parse({});
        const parsedSeo = (c.seo && typeof c.seo === 'object' && Object.keys(c.seo).length > 0) ? c.seo : SEOSchema.parse({});

        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          parentId: c.parentId,
          type: c.type, // existing db 'type' field
          position: c.position,
          isVip: c.isVip,
          isLocked: c.isLocked,
          minXp: c.minXp,
          color: c.color,
          icon: c.icon,
          colorTheme: c.colorTheme,
          isHidden: c.isHidden,
          isZone: c.isZone,
          canonical: c.canonical,
          minGroupIdRequired: c.minGroupIdRequired,
          pluginData: parsedPluginData,
          createdAt: new Date(c.createdAt), // Ensure Date object
          updatedAt: new Date(c.updatedAt), // Ensure Date object

          // New fields
          forumType: c.forumType as ForumCategoryShared['forumType'], // Cast to specific enum
          slugOverride: c.slugOverride,
          components: parsedComponents,
          threadRules: parsedThreadRules,
          accessControl: parsedAccessControl,
          displayPriority: c.displayPriority,
          seo: parsedSeo,
          
          stats: {
            threadCount: Number(c.threadCount || 0),
            postCount: Number(c.postCount || 0),
            activeUsersCount: 0, // Placeholder - requires separate calculation or source
          },
        };
      });

      console.log(`[forumService] getCategoriesWithStats - Mapped categories count: ${categories.length}`);
      // console.log('[forumService] getCategoriesWithStats - Mapped categories (full):', categories);
      // categories.slice(0, 5).forEach(cat => {
      //     console.log(`[forumService] Category ${cat.name} (ID: ${cat.id}): Threads=${cat.stats.threadCount}, Posts=${cat.stats.postCount}`);
      // });

      return categories;
    } catch (error) {
      console.error('Error in forumService.getCategoriesWithStats:', error);
      // Log the error object with more detail if possible
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Error cause:', error.cause); // Added error cause
      } else {
        console.error('Unknown error type:', error);
      }
      throw error;
    }
  },
  
  async getCategoriesTree(options: CategoriesTreeOptions = {}): Promise<any[]> {
    const { includeEmptyStats = false, includeHidden = false } = options;
    
    const allCategoriesShared: ForumCategoryShared[] = await this.getCategoriesWithStats();

    if (!allCategoriesShared || !Array.isArray(allCategoriesShared)) {
        console.error('[SERVICE-FORUM] getCategoriesWithStats did not return a valid array for tree construction.');
        return [];
    }
    
    // Assuming isHidden is a property on ForumCategoryShared
    const visibleCategories = includeHidden ? allCategoriesShared : allCategoriesShared.filter(cat => cat && !cat.isHidden); 
    
    const categoriesWithLocalStats = visibleCategories.map(cat => ({
      ...(cat || {}), 
      // stats object is already part of ForumCategoryShared
    }));

    const categoryMap = new Map<number, ForumCategoryShared & { children: any[] }>();
    const tree: any[] = [];

    categoriesWithLocalStats.forEach(category => {
        if (!category || typeof category !== 'object' || category.id === undefined) return; 
        categoryMap.set(category.id, { ...category, children: [] });
    });

    categoriesWithLocalStats.forEach(category => {
        if (!category || typeof category !== 'object' || category.id === undefined) return; 
        
        const mappedCategory = categoryMap.get(category.id);
        if (!mappedCategory) return; 

        if (category.parentId && categoryMap.has(category.parentId)) {
            const parent = categoryMap.get(category.parentId);
            if (parent && parent.children) { 
                parent.children.push(mappedCategory);
            }
        } else if (!category.parentId) { 
            tree.push(mappedCategory);
        }
    });
      
    return tree;
  },
  
  async getCategoryBySlug(slug: string): Promise<ForumCategoryShared | null> {
    const categories = await this.getCategoriesWithStats();
    // Logic needs to be updated to consider forumType and slugOverride
    const foundCategory = categories.find(cat => {
      if (cat.forumType === 'primary') {
        return cat.slugOverride === slug || cat.slug === slug;
      }
      return cat.slug === slug;
    });
    return foundCategory || null;
  },
  
  async getForumBySlugWithTopics(slug: string): Promise<{
    forum: ForumCategoryShared | null,
    topics: ForumCategoryShared[] // Changed from ForumCategoryWithStats
  }> {
    console.log(`[Forum Service] getForumBySlugWithTopics called with slug: ${slug}`);
    const categories = await this.getCategoriesWithStats();
    // Logic needs to be updated to consider forumType and slugOverride for the main forum
    const forum = categories.find(cat => {
      if (cat.forumType === 'primary') {
        return cat.slugOverride === slug || cat.slug === slug;
      }
      return cat.slug === slug;
    }) || null;

    if (!forum) {
      console.log(`[Forum Service] getForumBySlugWithTopics - Forum not found for slug: ${slug}`);
      return { forum: null, topics: [] };
    }
    const topics = categories.filter(cat => cat.parentId === forum.id);
    // topics.sort((a, b) => a.position - b.position); // position is on ForumCategoryShared
    console.log(`[Forum Service] getForumBySlugWithTopics - Found forum "${forum.name}" and ${topics.length} topics for slug: ${slug}`);
    return { forum, topics };
  },
  
  async getCategoryById(id: number): Promise<ForumCategoryShared | null> {
    const categories = await this.getCategoriesWithStats();
    return categories.find(cat => cat.id === id) || null;
  },
  
  async getForumsByParentId(parentId: number): Promise<ForumCategoryShared[]> {
    try {
      const categories = await this.getCategoriesWithStats();
      const parentForum = categories.find(cat => cat.id === parentId);
      const childForums = categories.filter(cat => cat.parentId === parentId);
      
      console.log(`[forumService] Found ${childForums.length} child forums for parentId ${parentId} (${parentForum?.name || 'unknown parent'})`);
      
      if (childForums.length > 0) {
        console.log(`[forumService] Child forum names:`, childForums.map(f => `${f.name} (ID: ${f.id})`));
      } else {
        console.log(`[forumService] No child forums found for parentId ${parentId}`);
      }
      
      // Add canHaveThreads property and parent info to each child forum
      // canHaveThreads is part of ForumCategoryShared (via Drizzle schema defaults)
      // Parent slug/name can be derived if needed, or added to ForumCategoryShared if frequently used
      return childForums.map(forum => ({
        ...forum,
        // parentSlug: parentForum?.slug || null, // Example: add if needed
        // parentName: parentForum?.name || null  // Example: add if needed
      }));
    } catch (error) {
      console.error('Error in getForumsByParentId:', error);
      throw error;
    }
  },
  
  // Debug method to verify parent-child relationships in forum structure
  async debugForumRelationships(): Promise<{
    primaryZones: Array<{id: number, name: string, slug: string, forumType?: string}>, // Added forumType
    categories: Array<{
      id: number, 
      name: string, 
      slug: string, 
      forumType?: string, // Added forumType
      childForums: Array<{id: number, name: string, slug: string, parentId: number, forumType?: string}> // Added forumType
    }>
  }> {
    try {
      const allCategories = await this.getCategoriesWithStats();
      
      // Find primary zones (forumType is 'primary')
      const primaryZones = allCategories
        .filter(cat => cat.forumType === 'primary')
        .map(zone => ({
          id: zone.id,
          name: zone.name,
          slug: zone.slugOverride || zone.slug, // Use slugOverride if available
          forumType: zone.forumType
        }));
      
      // Find categories (forumType is 'general' and has child forums, or is a parent without being primary)
      // This logic might need refinement based on exact definition of "category" in new structure
      const categories = allCategories
        .filter(cat => cat.forumType === 'general' && allCategories.some(child => child.parentId === cat.id)) // Example: General forums that are parents
        .map(category => {
          const childForums = allCategories
            .filter(forum => forum.parentId === category.id) // Children can be 'general' forums
            .map(forum => ({
              id: forum.id,
              name: forum.name,
              slug: forum.slug,
              parentId: forum.parentId || 0, // parentId should exist
              forumType: forum.forumType
            }));
            
          return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            forumType: category.forumType,
            childForums
          };
        });
        
      return { primaryZones, categories };
    } catch (error) {
      console.error('Error in debugForumRelationships:', error);
      throw error;
    }
  },
  
  async getPrefixes(categoryId?: number): Promise<any[]> {
    if (categoryId) {
      return db.select()
        .from(threadPrefixes)
        .where(and(
          eq(threadPrefixes.isActive, true),
          or(
            isNull(threadPrefixes.categoryId),
            eq(threadPrefixes.categoryId, categoryId)
          )
        ))
        .orderBy(asc(threadPrefixes.position));
    } else {
      return db.select()
        .from(threadPrefixes)
        .where(eq(threadPrefixes.isActive, true))
        .orderBy(asc(threadPrefixes.position));
    }
  },
  
  async getTags(): Promise<any[]> {
    return db.select()
      .from(tags)
      .orderBy(asc(tags.name));
  },
  
  async searchThreads(params: ThreadSearchParams): Promise<{
    threads: ThreadWithUser[],
    pagination: {
      page: number,
      limit: number,
      totalThreads: number,
      totalPages: number
    }
  }> {
    const { 
      categoryId,
      prefix,
      tag,
      page = 1, 
      limit = 10, 
      sortBy = 'latest',
      search
    } = params;
    
    const offset = (page - 1) * limit;
    const conditions: (SQL<unknown> | undefined)[] = [ 
      eq(threads.isDeleted, false),
      eq(threads.isHidden, false),
    ];
    if (categoryId) conditions.push(eq(threads.categoryId, categoryId));
    if (prefix) {
      const prefixResult = await db.select({ id: threadPrefixes.id }).from(threadPrefixes).where(eq(threadPrefixes.name, prefix)).limit(1);
      if (prefixResult.length > 0) conditions.push(eq(threads.prefixId, prefixResult[0].id));
    }
    let tagId: number | undefined;
    if (tag) {
      const tagResult = await db.select({ id: tags.id }).from(tags).where(eq(tags.name, tag)).limit(1);
      if (tagResult.length > 0) tagId = tagResult[0].id;
    }
    if (search) conditions.push(or(ilike(threads.title, `%${search}%`)));

    let orderByClause: (SQL<unknown> | SQL.Aliased<unknown>)[] = [desc(threads.isSticky), desc(threads.createdAt)]; 
    switch (sortBy) {
      case 'hot': 
        orderByClause = [desc(threads.isSticky), desc(threads.hotScore), desc(threads.lastPostAt)]; 
        break;
      case 'staked': 
        orderByClause = [desc(threads.isSticky), desc(threads.dgtStaked), desc(threads.lastPostAt)]; 
        break;
      case 'popular': 
        orderByClause = [desc(threads.isSticky), desc(threads.postCount), desc(threads.lastPostAt)]; 
        break;
      case 'recent': 
        orderByClause = [desc(threads.isSticky), desc(threads.lastPostAt)]; 
        break;
      case 'latest': 
        orderByClause = [desc(threads.isSticky), desc(threads.createdAt)];
        break;
    }
    
    const selectFields = {
      id: threads.id, uuid: threads.uuid, title: threads.title, slug: threads.slug,
      categoryId: threads.categoryId, userId: threads.userId, prefixId: threads.prefixId,
      isSticky: threads.isSticky, isLocked: threads.isLocked, isHidden: threads.isHidden,
      isFeatured: threads.isFeatured, featuredAt: threads.featuredAt, featuredBy: threads.featuredBy,
      featuredExpiresAt: threads.featuredExpiresAt, isDeleted: threads.isDeleted, deletedAt: threads.deletedAt,
      deletedBy: threads.deletedBy, viewCount: threads.viewCount, postCount: threads.postCount,
      firstPostLikeCount: threads.firstPostLikeCount, dgtStaked: threads.dgtStaked, hotScore: threads.hotScore,
      isBoosted: threads.isBoosted, boostAmountDgt: threads.boostAmountDgt, boostExpiresAt: threads.boostExpiresAt,
      lastPostId: threads.lastPostId, lastPostAt: threads.lastPostAt, createdAt: threads.createdAt,
      updatedAt: threads.updatedAt, isArchived: threads.isArchived, pollId: threads.pollId,
      isSolved: threads.isSolved, solvingPostId: threads.solvingPostId, pluginData: threads.pluginData,
      user: usersTable
    };

    const validConditions = conditions.filter(c => c !== undefined) as SQL<unknown>[]; 

    let threadResults: any[]; 
    if (tagId) {
      threadResults = await db.select(selectFields)
        .from(threads)
        .innerJoin(users, eq(threads.userId, users.id))
        .innerJoin(threadTags, and(eq(threadTags.threadId, threads.id), eq(threadTags.tagId, tagId)))
        .where(and(...validConditions))
        .orderBy(...orderByClause)
        .limit(limit)
        .offset(offset);
    } else {
      threadResults = await db.select(selectFields)
        .from(threads)
        .innerJoin(users, eq(threads.userId, users.id))
        .where(and(...validConditions))
        .orderBy(...orderByClause)
        .limit(limit)
        .offset(offset);
    }
    
    let totalThreads = 0;
    if (tagId) {
      const countResult = await db.select({ count: count() }).from(threads).innerJoin(threadTags, and(eq(threadTags.threadId, threads.id), eq(threadTags.tagId, tagId))).where(and(...validConditions));
      totalThreads = countResult[0]?.count || 0;
    } else {
      const countResult = await db.select({ count: count() }).from(threads).where(and(...validConditions));
      totalThreads = countResult[0]?.count || 0;
    }
    
    const prefixIds = threadResults.map(t => t.prefixId).filter(id => id !== null && id !== undefined) as number[];
    const prefixesMap: Record<number, ThreadPrefixType> = {};
    if (prefixIds.length > 0) {
      const prefixResults = await db.select().from(threadPrefixes).where(inArray(threadPrefixes.id, prefixIds));
      prefixResults.forEach((prefix: ThreadPrefixType) => { prefixesMap[prefix.id] = prefix; });
    }
    
    const threadsWithPrefixAndUser = threadResults.map(thread => ({
      ...thread,
      prefix: thread.prefixId ? prefixesMap[thread.prefixId] : null
    }));
    
    return {
      threads: threadsWithPrefixAndUser as ThreadWithUser[],
      pagination: { page, limit, totalThreads, totalPages: Math.ceil(totalThreads / limit) }
    };
  },

  async updateThreadSolvedStatus({
    threadId,
    solvingPostId,
  }: { threadId: number; solvingPostId?: number | null }): Promise<any | null> {
    try {
      if (solvingPostId !== null && solvingPostId !== undefined) {
          const [postCheck] = await db.select({id: posts.id})
              .from(posts)
              .where(and(eq(posts.id, solvingPostId), eq(posts.threadId, threadId), eq(posts.isDeleted, false)))
              .limit(1);
          if (!postCheck) throw new Error("Invalid solving post ID or post does not belong to the thread.");
      }
      const [updatedThread] = await db.update(threads)
        .set({
          isSolved: solvingPostId !== null && solvingPostId !== undefined,
          solvingPostId: solvingPostId === undefined ? null : solvingPostId,
          updatedAt: new Date(),
        })
        .where(eq(threads.id, threadId))
        .returning({
          id: threads.id, title: threads.title, isSolved: threads.isSolved,
          solvingPostId: threads.solvingPostId, updatedAt: threads.updatedAt,
        });
      return updatedThread || null;
    } catch (error) {
      console.error('Error in forumService.updateThreadSolvedStatus:', error);
      throw error;
    }
  },

  async getZoneMetricsBySlug(slug: string): Promise<{
    zoneId: number;
    threadCount: number;
    postCount: number;
    totalXp: number;
    totalDgt: number;
    activeUsers: number;
    hotThreads: Array<{
      id: number;
      title: string;
      replies: number;
      views: number;
      lastActivity: string;
    }>;
  } | null> {
    try {
      const zone = await this.getCategoryBySlug(slug);
      if (!zone) {
        console.log(`[forumService] getZoneMetricsBySlug - Zone not found for slug: ${slug}`);
        return null;
      }
      const zoneId = zone.id;
      // 1. Get all thread IDs in this zone
      const threadRows = await db.select({ id: threads.id, title: threads.title, postCount: threads.postCount, viewCount: threads.viewCount, lastPostAt: threads.lastPostAt })
        .from(threads)
        .where(eq(threads.categoryId, zoneId));
      const threadIds = threadRows.map(t => t.id);
      // 2. XP: Sum all xp_awards for posts/threads in this zone
      let totalXp = 0;
      if (threadIds.length > 0) {
        // XP from xp_awards.thread_id directly
        const xpFromThreads = await db.select({ value: sql`COALESCE(SUM(amount),0)` })
          .from('xp_awards')
          .where(sql`thread_id IN (${threadIds.join(',')})`);
        // XP from xp_awards.post_id (join posts to get thread_id)
        const xpFromPosts = await db.select({ value: sql`COALESCE(SUM(xa.amount),0)` })
          .from(sql`xp_awards xa`)
          .innerJoin(posts, sql`xa.post_id = ${posts.id}`)
          .where(sql`posts.thread_id IN (${threadIds.join(',')})`);
        totalXp = Number(xpFromThreads[0]?.value || 0) + Number(xpFromPosts[0]?.value || 0);
      }
      // 3. DGT: Sum all DGT transactions for posts/threads in this zone
      let totalDgt = 0;
      if (threadIds.length > 0) {
        // DGT from transactions.thread_id
        const dgtFromThreads = await db.select({ value: sql`COALESCE(SUM(amount),0)` })
          .from('transactions')
          .where(sql`thread_id IN (${threadIds.join(',')}) AND currency = 'DGT' AND type IN ('tip','boost','creation_fee','stake')`);
        // DGT from transactions.post_id (join posts to get thread_id)
        const dgtFromPosts = await db.select({ value: sql`COALESCE(SUM(t.amount),0)` })
          .from(sql`transactions t`)
          .innerJoin(posts, sql`t.post_id = ${posts.id}`)
          .where(sql`posts.thread_id IN (${threadIds.join(',')}) AND t.currency = 'DGT' AND t.type IN ('tip','boost','creation_fee','stake')`);
        totalDgt = Number(dgtFromThreads[0]?.value || 0) + Number(dgtFromPosts[0]?.value || 0);
      }
      // 4. Hot Threads: Top 5 by score
      const now = new Date();
      const hotThreads = threadRows
        .map(t => {
          // Score = (views * 0.3) + (replies * 0.5) + (recent activity * 0.2)
          const hoursSinceLast = t.lastPostAt ? (now.getTime() - new Date(t.lastPostAt).getTime()) / (1000 * 60 * 60) : 9999;
          const recencyScore = Math.max(0, 48 - hoursSinceLast) / 48; // 1 if <1h, 0 if >48h
          const score = (Number(t.viewCount || 0) * 0.3) + (Number(t.postCount || 0) * 0.5) + (recencyScore * 0.2 * 100);
          return {
            id: t.id,
            title: t.title,
            replies: t.postCount || 0,
            views: t.viewCount || 0,
            lastActivity: t.lastPostAt ? new Date(t.lastPostAt).toISOString() : '',
            score
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(({ score, ...rest }) => rest); // Remove score from output
      // 5. Active Users: Distinct users who posted in this zone in last 48h
      let activeUsers = 0;
      if (threadIds.length > 0) {
        const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
        const activeUserRows = await db.select({ userId: posts.userId })
          .from(posts)
          .where(sql`posts.thread_id IN (${threadIds.join(',')}) AND posts.created_at > ${since}`)
          .groupBy(posts.userId);
        activeUsers = activeUserRows.length;
      }
      // 6. Thread/Post counts
      const threadCount = threadRows.length;
      const postCount = threadRows.reduce((sum, t) => sum + (t.postCount || 0), 0);
      return {
        zoneId,
        threadCount,
        postCount,
        totalXp,
        totalDgt,
        activeUsers,
        hotThreads
      };
    } catch (error) {
      console.error(`Error in forumService.getZoneMetricsBySlug for slug ${slug}:`, error);
      throw error;
    }
  },
};

export default forumService;
