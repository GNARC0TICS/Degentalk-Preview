import { db } from '../../db'; // Adjust path as necessary
import { forumCategories, threads, posts, users } from '../../db/schema'; // Adjust path
import { eq, sql } from 'drizzle-orm';
import { slugify } from '../db/utils/seedUtils'; // Use slugify from local seed utils

async function seedDummyThreads() {
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
      // 3. Get the category ID for the current forum slug
      const [category] = await db
        .select({ id: forumCategories.id, name: forumCategories.name })
        .from(forumCategories)
        .where(eq(forumCategories.slug, forumSlug))
        .limit(1);

      if (!category) {
        console.warn(`Category with slug '${forumSlug}' not found. Skipping.`);
        continue;
      }
      const categoryId = category.id;
      console.log(`Seeding threads for category: '${category.name}' (ID: ${categoryId})`);

      for (let i = 1; i <= threadsPerForum; i++) {
        const threadTitle = `Dummy Thread ${i} in ${category.name}`;
        const threadSlug = await slugify(`${threadTitle}-${Date.now()}`); // Ensure unique slug
        const firstPostContent = `This is the first post for ${threadTitle}. Seeded at ${new Date().toISOString()}`;

        // Insert thread and first post in a transaction (simplified)
        // The actual POST /threads route does more (tags, XP, etc.)
        
        const [newThread] = await db
          .insert(threads)
          .values({
            title: threadTitle,
            slug: threadSlug,
            parentForumSlug: forumSlug, // Added parentForumSlug
            categoryId: categoryId,
            userId: userId,
            // other required fields can be defaulted if schema allows, or set explicitly
            // isSticky, isLocked, isHidden, viewCount, postCount, etc.
          })
          .returning({ id: threads.id, createdAt: threads.createdAt });

        if (!newThread) {
          console.error(`Failed to insert thread: ${threadTitle}`);
          continue;
        }

        const [firstPost] = await db
          .insert(posts)
          .values({
            threadId: newThread.id,
            userId: userId,
            content: firstPostContent,
            isFirstPost: true,
            // editorState, likeCount, tipCount, etc.
          })
          .returning({ id: posts.id });

        if (!firstPost) {
          console.error(`Failed to insert first post for thread: ${threadTitle}`);
          // Optionally delete the created thread if first post fails
          await db.delete(threads).where(eq(threads.id, newThread.id));
          continue;
        }
        
        // Update thread with first post info (lastPostId, lastPostAt, postCount)
        await db
          .update(threads)
          .set({
            lastPostId: firstPost.id,
            lastPostAt: newThread.createdAt, // Or post's createdAt if different
            postCount: 1,
          })
          .where(eq(threads.id, newThread.id));

        console.log(`  Created thread: '${threadTitle}' (ID: ${newThread.id}) with first post (ID: ${firstPost.id})`);
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
