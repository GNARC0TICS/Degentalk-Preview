import { db } from '../db';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { threads } from './utils/schema';
import { eq } from 'drizzle-orm';

async function main() {
  try {
    const threadId = 973;
    const thread = await db.select({
      id: threads.id,
      title: threads.title,
      slug: threads.slug,
      isDeleted: threads.isDeleted,
      isHidden: threads.isHidden,
    })
    .from(threads)
    .where(eq(threads.id, threadId));

    if (thread.length === 0) {
      console.log(`Thread with ID ${threadId} not found.`);
    } else {
      console.log(`Thread with ID ${threadId}:`);
      console.log(thread[0]);
    }
  } catch (error) {
    console.error('Error reading thread:', error);
  }
}

main();
