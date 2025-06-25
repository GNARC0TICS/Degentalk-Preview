import { db } from '../../db'; // Adjust path as necessary
import { forumStructure, threads, posts, users } from '../../db/schema'; // Adjust path
import { eq, sql } from 'drizzle-orm';
import { slugify } from '../db/utils/seedUtils'; // Use slugify from local seed utils
import { parseArgs } from 'node:util';

async function seedDummyThreads() {
  const options = {
    wipe: { type: 'boolean', short: 'w', default: false },
  } as const;

  const { values: { wipe } } = parseArgs({ options, allowPositionals: true });

  if (wipe) {
    console.log('Wipe flag detected. Truncating threads and posts tables...');
    // Order matters due to foreign key constraints. Posts depend on threads.
    // However, if posts have FK to threads with ON DELETE CASCADE, truncating threads might be enough.
    // For explicit control:
    await db.delete(posts); // Delete all posts first
    await db.delete(threads); // Then delete all threads
    // Alternatively, if FKs are set up with CASCADE:
    // await db.execute(sql`TRUNCATE TABLE threads RESTART IDENTITY CASCADE;`);
    // await db.execute(sql`TRUNCATE TABLE posts RESTART IDENTITY CASCADE;`); // Or just threads if posts cascade
    console.log('Tables truncated.');
  }

  console.log('Starting to seed dummy threads...');

  try {
    // 1. Get a user to be the author of the threads/posts
    const [testUser] = await db.select({ id: users.id }).from(users).limit(1);
    if (!testUser) {
      console.error('No users found in the database. Please seed users first.');
      return;
    }
    const userId = testUser.id;
    console.log(`Using user ID: ${userId} as author.`);

    // 2. Define forum slugs to seed threads into
    const forumSlugsToSeed = ['general-brawls', 'alpha-leaks'];
    const threadsPerForum = 3;

    for (const forumSlug of forumSlugsToSeed) {
      // 3. Get the structure ID for the current forum slug
      const [structure] = await db
        .select({ id: forumStructure.id, name: forumStructure.name })
        .from(forumStructure)
        .where(eq(forumStructure.slug, forumSlug))
        .limit(1);

      if (!structure) {
        console.warn(`Forum structure with slug '${forumSlug}' not found. Skipping.`);
        continue;
      }
      const structureId = structure.id;
      console.log(`Seeding threads for forum: '${structure.name}' (ID: ${structureId})`);

      for (let i = 1; i <= threadsPerForum; i++) {
        const threadTitle = `Dummy Thread ${i} in ${structure.name}`;
        const threadSlug = await slugify(`${threadTitle}-${Date.now()}`); // Ensure unique slug
        const firstPostContent = `This is the first post for ${threadTitle}. Seeded at ${new Date().toISOString()}`;

        try {
          await db.transaction(async (tx) => {
            const [newThread] = await tx
              .insert(threads)
              .values({
                title: threadTitle,
                slug: threadSlug,
                structureId: structureId,
                userId: userId,
                // other required fields can be defaulted if schema allows, or set explicitly
              })
              .returning({ id: threads.id, createdAt: threads.createdAt });

            if (!newThread) {
              console.error(`Failed to insert thread: ${threadTitle}`);
              throw new Error(`Failed to insert thread: ${threadTitle}`); // Will cause rollback
            }

            const [firstPost] = await tx
              .insert(posts)
              .values({
                threadId: newThread.id,
                userId: userId,
                content: firstPostContent,
                isFirstPost: true,
              })
              .returning({ id: posts.id });

            if (!firstPost) {
              console.error(`Failed to insert first post for thread: ${threadTitle}`);
              throw new Error(`Failed to insert first post for thread: ${threadTitle}`); // Will cause rollback
            }
            
            // Update thread with first post info (lastPostId, lastPostAt, postCount)
            await tx
              .update(threads)
              .set({
                lastPostId: firstPost.id,
                lastPostAt: newThread.createdAt, 
                postCount: 1,
              })
              .where(eq(threads.id, newThread.id));

            console.log(`  Created thread: '${threadTitle}' (ID: ${newThread.id}) with first post (ID: ${firstPost.id})`);
          });
        } catch (transactionError) {
          console.error(`Transaction failed for thread '${threadTitle}':`, transactionError);
          // The transaction will automatically roll back on error.
          // Continue to the next iteration.
          continue;
        }
      }
    }

    console.log('Dummy thread seeding completed.');
  } catch (error) {
    console.error('Error seeding dummy threads:', error);
  } finally {
    // If your db connection needs to be closed, do it here.
    // For Drizzle with serverless drivers, explicit closing might not be needed.
    // Example: await db.session?.end(); 
    console.log('Seed script finished.');
  }
}

seedDummyThreads().catch(console.error);
