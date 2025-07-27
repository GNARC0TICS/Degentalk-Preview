import { db } from '@db';
import { forumCategories, threads, posts } from '../db/schema';
import { sql, eq, and, asc } from 'drizzle-orm';

async function testForumQuery() {
  console.log('🔍 Testing forum categories query...\n');
  
  try {
    // First, let's check what columns actually exist
    console.log('1️⃣ Checking basic forum categories table...');
    const basicQuery = await db
      .select()
      .from(forumCategories)
      .limit(1);
    
    if (basicQuery.length > 0) {
      console.log('✅ Basic query successful');
      console.log('Available columns:', Object.keys(basicQuery[0]));
    }
    
    // Now test the full query from getCategoriesWithStats
    console.log('\n2️⃣ Testing full query with counts...');
    
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
    
    const categoriesDataRaw = await db
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
    
    console.log('✅ Full query successful!');
    console.log(`Found ${categoriesDataRaw.length} categories`);
    
    // Show a sample
    if (categoriesDataRaw.length > 0) {
      console.log('\nSample category:', {
        name: categoriesDataRaw[0].name,
        type: categoriesDataRaw[0].type,
        threadCount: categoriesDataRaw[0].threadCount,
        postCount: categoriesDataRaw[0].postCount
      });
    }
    
  } catch (error) {
    console.error('❌ Query failed with error:', error);
    
    // Try to identify which field is causing the issue
    if (error instanceof Error && error.message.includes('column')) {
      console.log('\n🔍 The error suggests a missing column. Let me check each field...');
      
      const fieldsToCheck = [
        'parentForumSlug',
        'type', 
        'tippingEnabled',
        'xpMultiplier',
        'minGroupIdRequired',
        'pluginData'
      ];
      
      for (const field of fieldsToCheck) {
        try {
          const testQuery = await db
            .select({ [field]: (forumCategories as any)[field] })
            .from(forumCategories)
            .limit(1);
          console.log(`✅ Field '${field}' exists`);
        } catch (fieldError) {
          console.log(`❌ Field '${field}' is MISSING or has issues`);
        }
      }
    }
  }
  
  process.exit(0);
}

// Run the test
testForumQuery().catch(console.error); 