// New wrapper – alias script formerly seed-dummy-threads.ts
// Seeding a couple of sample threads into specific forums for smoke-tests.
// Usage:  ts-node scripts/seed/seed-sample-threads.ts [-w]

import { db } from '../../db';
import { forumStructure, threads, posts, users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { slugify } from '../db/utils/seedUtils';
import { parseArgs } from 'node:util';

async function seedSampleThreads() {
  const { values: { wipe } } = parseArgs({ options: { wipe: { type: 'boolean', short: 'w', default: false } }, allowPositionals: true });

  if (wipe) {
    await db.delete(posts);
    await db.delete(threads);
    console.log('[seed-sample-threads] wiped existing posts & threads');
  }

  const [author] = await db.select({ id: users.id }).from(users).limit(1);
  if (!author) {
    console.error('No users found – seed users first.');
    return;
  }

  const forumSlugs = ['general-brawls', 'alpha-leaks'];
  for (const slug of forumSlugs) {
    const [forum] = await db
      .select({ id: forumStructure.id, name: forumStructure.name })
      .from(forumStructure)
      .where(eq(forumStructure.slug, slug))
      .limit(1);
    if (!forum) {
      console.warn(`[seed-sample-threads] forum ${slug} missing – skipping`);
      continue;
    }

    const title = `Sample thread in ${forum.name}`;
    const [thread] = await db
      .insert(threads)
      .values({
        title,
        slug: await slugify(`${title}-${Date.now()}`),
        structureId: forum.id,
        userId: author.id
      })
      .returning();

    await db.insert(posts).values({
      threadId: thread.id,
      userId: author.id,
      content: 'Hello world – seeded content',
      isFirstPost: true
    });

    console.log(`[seed-sample-threads] thread ${thread.id} created in ${slug}`);
  }

  console.log('[seed-sample-threads] done.');
}

seedSampleThreads().catch(console.error); 