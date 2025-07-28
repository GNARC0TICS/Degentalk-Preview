import { db } from '@db';
import { threads, forumStructure } from '@schema';

async function checkThreads() {
  console.log('Checking threads in database...\n');

  // Count total threads
  const allThreads = await db.select().from(threads);
  console.log(`Total threads in database: ${allThreads.length}`);

  if (allThreads.length > 0) {
    console.log('\nFirst 5 threads:');
    allThreads.slice(0, 5).forEach(thread => {
      console.log(`- ID: ${thread.id}, Title: "${thread.title}", StructureID: ${thread.structureId}`);
    });
  }

  // Check forum structures
  console.log('\n\nChecking forum structures...');
  const structures = await db.select().from(forumStructure);
  console.log(`Total forum structures: ${structures.length}`);

  if (structures.length > 0) {
    console.log('\nForum structures:');
    structures.forEach(struct => {
      console.log(`- ID: ${struct.id}, Name: "${struct.name}", Slug: "${struct.slug}", Type: ${struct.type}, ParentID: ${struct.parentId || 'null'}`);
    });
  }

  // Check thread distribution
  if (allThreads.length > 0 && structures.length > 0) {
    console.log('\n\nThread distribution by forum:');
    const threadsByForum = new Map<string, number>();
    
    allThreads.forEach(thread => {
      const count = threadsByForum.get(thread.structureId) || 0;
      threadsByForum.set(thread.structureId, count + 1);
    });

    threadsByForum.forEach((count, structureId) => {
      const forum = structures.find(s => s.id === structureId);
      console.log(`- ${forum?.name || 'Unknown'} (${structureId}): ${count} threads`);
    });
  }

  process.exit(0);
}

checkThreads().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});