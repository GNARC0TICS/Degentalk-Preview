import { db } from '@server/src/core/db';
import { 
  forumCategories, 
  threads, 
  posts, 
  users, 
  threadPrefixes,
  tags,
  threadTags,
  users as usersTable // Alias users
} from '@db/schema';
import { sql, desc, asc, and, eq, isNull, count, like, ilike, or, inArray, SQL } from 'drizzle-orm'; // Added inArray and SQL
import { ForumCategoryWithStats, ThreadWithUser } from '@shared/types';
import type { User } from '@db/schema'; // Import User type from schema
// Import threadPrefixes table to infer type - already imported above

// Define type for ThreadPrefix based on schema
type ThreadPrefixType = typeof threadPrefixes.$inferSelect;

// Define a type for the result of the getCategoriesWithStats Drizzle query
type CategoryWithCountsResult = {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  position: number;
  minGroupIdRequired: number | null;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  pluginData: string | null;
  type: string;
  colorTheme: string | null;
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
  async getCategoriesWithStats(): Promise<ForumCategoryWithStats[]> {
    try {
      // Fetch categories and join with threads and posts to get counts
      const categoriesWithCounts = await db.select({
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
        type: forumCategories.type,
        colorTheme: forumCategories.colorTheme,
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
        forumCategories.colorTheme
      )
      .orderBy(asc(forumCategories.position));

      console.log(`[forumService] getCategoriesWithStats - Raw query result count: ${categoriesWithCounts.length}`);
      console.log('[forumService] getCategoriesWithStats - Raw query result (first 5):', categoriesWithCounts.slice(0, 5));
      console.log('[forumService] getCategoriesWithStats - Raw query result (full):', categoriesWithCounts); // Added full raw result log

      // Map the results to the ForumCategoryWithStats type, handling potential nulls from aggregation
      const categories: ForumCategoryWithStats[] = categoriesWithCounts.map((c: CategoryWithCountsResult) => ({
        ...c,
        parentId: c.parentId,
        pluginData: c.pluginData || {},
        // Ensure counts are numbers, defaulting to 0 if null from aggregation (e.g., no threads/posts)
        threadCount: Number(c.threadCount || 0),
        postCount: Number(c.postCount || 0)
      }));

      console.log(`[forumService] getCategoriesWithStats - Mapped categories count: ${categories.length}`);
      console.log('[forumService] getCategoriesWithStats - Mapped categories (full):', categories); // Added full mapped result log
      // Log counts for a few categories for verification
      categories.slice(0, 5).forEach(cat => {
          console.log(`[forumService] Category ${cat.name} (ID: ${cat.id}): Threads=${cat.threadCount}, Posts=${cat.postCount}`);
      });

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
    
    const allCategories = await this.getCategoriesWithStats();

    if (!allCategories || !Array.isArray(allCategories)) {
        console.error('[SERVICE-FORUM] getCategoriesWithStats did not return a valid array for tree construction.');
        return [];
    }
    
    const visibleCategories = allCategories.filter(cat => cat); 
    
    const categoriesWithStats = includeEmptyStats
      ? visibleCategories.map(cat => ({
          ...(cat || {}), 
          threadCount: Number(cat?.threadCount || 0), 
          postCount: Number(cat?.postCount || 0)
        }))
      : visibleCategories;

    const categoryMap = new Map<number, ForumCategoryWithStats & { children: any[] }>();
    const tree: any[] = [];

    categoriesWithStats.forEach(category => {
        if (!category || typeof category !== 'object' || category.id === undefined) return; 
        categoryMap.set(category.id, { ...category, children: [] });
    });

    categoriesWithStats.forEach(category => {
        if (!category || typeof category !== 'object' || category.id === undefined) return; 
        
        const mappedCategory = categoryMap.get(category.id);
        if (!mappedCategory) return; 

        // Now that parentId is back in the schema, we can restore the original hierarchical logic
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
  
  async getCategoryBySlug(slug: string): Promise<ForumCategoryWithStats | null> {
    const categories = await this.getCategoriesWithStats();
    return categories.find(cat => cat.slug === slug) || null;
  },
  
  async getForumBySlugWithTopics(slug: string): Promise<{
    forum: ForumCategoryWithStats | null,
    topics: ForumCategoryWithStats[]
  }> {
    console.log(`[Forum Service] getForumBySlugWithTopics called with slug: ${slug}`);
    const categories = await this.getCategoriesWithStats();
    const forum = categories.find(cat => cat.slug === slug) || null;
    if (!forum) {
      console.log(`[Forum Service] getForumBySlugWithTopics - Forum not found for slug: ${slug}`);
      return { forum: null, topics: [] };
    }
    // parentId is now fully restored in the schema and queries
    const topics = categories.filter(cat => cat.parentId === forum.id);
    topics.sort((a, b) => a.position - b.position);
    console.log(`[Forum Service] getForumBySlugWithTopics - Found forum "${forum.name}" and ${topics.length} topics for slug: ${slug}`);
    return { forum, topics };
  },
  
  async getCategoryById(id: number): Promise<ForumCategoryWithStats | null> {
    const categories = await this.getCategoriesWithStats();
    return categories.find(cat => cat.id === id) || null;
  },
  
  async getForumsByParentId(parentId: number): Promise<ForumCategoryWithStats[]> {
    try {
      // Get all categories and filter by parent ID
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
      return childForums.map(forum => ({
        ...forum,
        canHaveThreads: true, // Child forums should always be able to have threads
        parentSlug: parentForum?.slug || null,
        parentName: parentForum?.name || null
      }));
    } catch (error) {
      console.error('Error in getForumsByParentId:', error);
      throw error;
    }
  },
  
  // Debug method to verify parent-child relationships in forum structure
  async debugForumRelationships(): Promise<{
    primaryZones: Array<{id: number, name: string, slug: string}>,
    categories: Array<{
      id: number, 
      name: string, 
      slug: string, 
      childForums: Array<{id: number, name: string, slug: string, parentId: number}>
    }>
  }> {
    try {
      const allCategories = await this.getCategoriesWithStats();
      
      // Find primary zones (type is 'zone')
      const primaryZones = allCategories
        .filter(cat => cat.type === 'zone')
        .map(zone => ({
          id: zone.id,
          name: zone.name,
          slug: zone.slug
        }));
      
      // Find categories (type is 'category' and parentId is not null)
      const categories = allCategories
        .filter(cat => cat.type === 'category' && cat.parentId !== null)
        .map(category => {
          // Find child forums (type 'forum') for this category
          const childForums = allCategories
            .filter(forum => forum.parentId === category.id && forum.type === 'forum')
            .map(forum => ({
              id: forum.id,
              name: forum.name,
              slug: forum.slug,
              parentId: forum.parentId || 0
            }));
            
          return {
            id: category.id,
            name: category.name,
            slug: category.slug,
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
};

export default forumService;
