import { db } from '../db/index.js';
import { threads, posts, users, forumStructure } from '../db/schema/index.js';
import { eq, desc } from 'drizzle-orm';

async function debugThreads() {
  // First, let's check what structure IDs actually exist
  const structures = await db.select().from(forumStructure).limit(20);
  console.log('\n=== All Forum Structures ===');
  structures.forEach(struct => {
    console.log(`- ${struct.name} (${struct.id}) - Type: ${struct.type}, Slug: ${struct.slug}`);
  });

  // Find the market-analysis structure
  const marketAnalysisStruct = structures.find(s => s.slug === 'market-analysis');
  if (!marketAnalysisStruct) {
    console.log('\n❌ No market-analysis forum found!');
    return;
  }

  console.log(`\n✅ Found market-analysis forum with ID: ${marketAnalysisStruct.id}`);

  // Check threads in market-analysis forum
  const marketAnalysisThreads = await db.select({
    id: threads.id,
    title: threads.title,
    structureId: threads.structureId,
    isSticky: threads.isSticky,
    userId: threads.userId,
    createdAt: threads.createdAt,
    postCount: threads.postCount
  }).from(threads)
    .where(eq(threads.structureId, marketAnalysisStruct.id))
    .orderBy(desc(threads.createdAt))
    .limit(10);

  console.log('\n=== Threads in Market Analysis Forum ===');
  console.log(`Found ${marketAnalysisThreads.length} threads`);
  marketAnalysisThreads.forEach(thread => {
    console.log(`- ${thread.title} (ID: ${thread.id}, Posts: ${thread.postCount})`);
  });


  // Check thread distribution
  const threadCounts = await db.query.threads.findMany({
    columns: {
      structureId: true
    }
  });
  
  const distribution = threadCounts.reduce((acc, thread) => {
    acc[thread.structureId] = (acc[thread.structureId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n=== Thread Distribution by Structure ===');
  Object.entries(distribution).forEach(([structId, count]) => {
    console.log(`${structId}: ${count} threads`);
  });
}

debugThreads().catch(console.error);