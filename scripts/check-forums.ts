#!/usr/bin/env tsx

import '../server/config/loadEnv';
import { db } from '../db';
import { forumStructure, threads } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

async function checkForums() {
  console.log('\n🔍 Checking forums in database...\n');
  
  // Get all forums
  const forums = await db
    .select({
      id: forumStructure.id,
      name: forumStructure.name,
      slug: forumStructure.slug,
      type: forumStructure.type
    })
    .from(forumStructure)
    .where(eq(forumStructure.type, 'forum'))
    .limit(5);
  
  console.log('Forums found:');
  forums.forEach(forum => {
    console.log(`- ${forum.name} (${forum.slug}) - ID: ${forum.id}`);
  });
  
  // Count threads per forum
  console.log('\n📊 Thread counts:');
  for (const forum of forums) {
    const threadCount = await db
      .select({ count: sql`count(*)` })
      .from(threads)
      .where(eq(threads.structureId, forum.id));
    
    console.log(`- ${forum.name}: ${threadCount[0].count} threads`);
  }
  
  // Get a sample thread
  const sampleThread = await db
    .select()
    .from(threads)
    .limit(1);
  
  if (sampleThread.length > 0) {
    console.log('\n📝 Sample thread:');
    console.log(JSON.stringify(sampleThread[0], null, 2));
  }
}

checkForums().catch(console.error).finally(() => process.exit(0));