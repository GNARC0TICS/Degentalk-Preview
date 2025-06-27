import { db } from '../../db'; // Adjust path
import {
  users,
  forumStructure,
  threads,
  posts,
  threadPrefixes,
  tags,
  threadTags
} from '../../db/schema'; // Adjust paths
import { faker } from '@faker-js/faker';
import { eq, inArray, isNotNull } from 'drizzle-orm'; // Removed sql, Added isNotNull
import { slugify } from '../db/utils/seedUtils'; // Assuming this utility exists and works
import { parseArgs } from 'node:util';
import chalk from 'chalk'; // For better console output

// --- Configuration ---
// Phase 2 lightweight seeding
const THREADS_PER_FORUM = 7;       // Seed seven threads per forum for richer data
const MIN_POSTS_PER_THREAD = 2;    // First post + one reply
const MAX_POSTS_PER_THREAD = 2;
const REPLY_CHANCE_PERCENT = 100; // Guarantee the second post is a reply
const MAX_REPLY_DEPTH = 1;       // No deep nesting
const TAGS_PER_THREAD_MAX = 3;
const DEFAULT_PREFIXES = [ // Prefixes to ensure exist globally
  { name: 'Question', color: 'blue-500' },
  { name: 'Discussion', color: 'green-500' },
  { name: 'Guide', color: 'purple-500' },
  { name: 'Feedback', color: 'yellow-500' },
  { name: 'Bug Report', color: 'red-500' },
  { name: 'Alpha', color: 'orange-500'},
  { name: 'Shill', color: 'pink-500'},
];
const DEFAULT_TAGS_COUNT = 20; // Number of default tags to create

// --- Helper Types (if not already globally available) ---
// (kept for readability / future use; prefixed with '_' to avoid unused-var lint errors)
type _Post = typeof posts.$inferSelect;
type ThreadPrefix = typeof threadPrefixes.$inferSelect;
type Tag = typeof tags.$inferSelect;

// --- Main Seeding Function ---
async function seedRealisticThreads() {
  const options = {
    wipe: { type: 'boolean', short: 'w', default: false },
    forums: { type: 'string', short: 'f', multiple: true, default: [] as string[] }, // Ensure default is string[]
  } as const;

  const { values: { wipe, forums: targetForumSlugs } } = parseArgs({ options, allowPositionals: true });

  if (wipe) {
    console.log(chalk.yellow('Wipe flag detected. Deleting existing posts and threads...'));
    await db.delete(posts);
    await db.delete(threads); // Assuming ON DELETE CASCADE handles threadTags
    console.log(chalk.green('Posts and threads tables wiped.'));
  }

  console.log(chalk.blue('🌱 Starting to seed realistic threads...'));

  try {
    // 1. Fetch Seed Data
    const allUsers = await db.select().from(users);
    if (allUsers.length === 0) {
      console.error(chalk.red('❌ No users found. Please seed users first.'));
      process.exit(1);
    }
    console.log(chalk.gray(`  Fetched ${allUsers.length} users.`));

    let queryTargetForums = db.select().from(forumStructure).where(eq(forumStructure.type, 'forum'));
    if (targetForumSlugs && targetForumSlugs.length > 0) {
      // @ts-expect-error Drizzle inArray typing mismatch when the second arg is string[]; safe to ignore in seed script
      queryTargetForums = queryTargetForums.where(inArray(forumStructure.slug, targetForumSlugs));
      console.log(chalk.gray(`  Targeting specific forums: ${targetForumSlugs.join(', ')}`));
    }
    const allPotentialTargetForums = await queryTargetForums;

    if (allPotentialTargetForums.length === 0) {
      console.error(chalk.red('❌ No forums of type="forum" found. Please seed forum structure first or check slugs.'));
      process.exit(1);
    }
    console.log(chalk.gray(`  Fetched ${allPotentialTargetForums.length} potential target forums/subforums.`));

    // Filter for "leaf" forums (forums that are not parents to other forums)
    const allParentIds = (await db
      .selectDistinct({ parentId: forumStructure.parentId })
      .from(forumStructure)
      .where(isNotNull(forumStructure.parentId)))
      .map(r => r.parentId)
      .filter(id => id !== null) as number[]; // Ensure we have a clean number array

    const targetForums = allPotentialTargetForums.filter(forum => !allParentIds.includes(forum.id));
    
    if (targetForums.length === 0) {
      console.error(chalk.red('❌ No "leaf" forums found to seed threads into. Check your forum structure and ensure some forums do not act as parents.'));
      process.exit(1);
    }
    console.log(chalk.green(`  Identified ${targetForums.length} leaf forums for thread seeding.`));
    
    // 2. Ensure Default Prefixes & Tags Exist
    const seededPrefixes = await ensureDefaultPrefixes();
    const seededTags = await ensureDefaultTags();

    // 3. Thread and Post Creation Loop
    for (const forum of targetForums) {
      console.log(chalk.cyan(`\nSeeding threads for forum: "${forum.name}" (ID: ${forum.id}, Slug: ${forum.slug})`));
      for (let i = 0; i < THREADS_PER_FORUM; i++) {
        await db.transaction(async (tx) => {
          const threadAuthor = faker.helpers.arrayElement(allUsers);
          const threadTitle = faker.lorem.sentence({ min: 5, max: 12 });
          const threadSlug = `${slugify(threadTitle)}-${faker.string.alphanumeric(5)}`;
          const threadCreatedAt = faker.date.recent({ days: 30 });

          let selectedPrefixId: number | null = null;
          const forumPluginData = typeof forum.pluginData === 'object' && forum.pluginData !== null ? forum.pluginData : {};
          
          interface ForumPluginRules { availablePrefixes?: string[] }
          const rules = (forumPluginData as { rules?: ForumPluginRules }).rules;
          const availablePrefixNames = rules?.availablePrefixes;

          if (availablePrefixNames && availablePrefixNames.length > 0) {
            const prefixName = faker.helpers.arrayElement(availablePrefixNames);
            const prefixEntry = seededPrefixes.find(p => p.name === prefixName);
            if (prefixEntry) selectedPrefixId = prefixEntry.id;
          } else if (seededPrefixes.length > 0 && Math.random() < 0.3) {
             selectedPrefixId = faker.helpers.arrayElement(seededPrefixes).id;
          }

          const [newThread] = await tx.insert(threads).values({
            title: threadTitle,
            slug: threadSlug,
            structureId: forum.id,
            userId: threadAuthor.id,
            prefixId: selectedPrefixId,
            isSticky: Math.random() < 0.05,
            isLocked: Math.random() < 0.05,
            viewCount: faker.number.int({ min: 0, max: 2000 }),
            createdAt: threadCreatedAt,
            updatedAt: threadCreatedAt,
          }).returning();

          console.log(chalk.green(`    ↳ Created thread: "${newThread.title}" (ID: ${newThread.id})`));

          const numPosts = faker.number.int({ min: MIN_POSTS_PER_THREAD, max: MAX_POSTS_PER_THREAD });
          const threadPosts: _Post[] = [];
          let lastPostTimestamp = newThread.createdAt || new Date(); // Fallback for createdAt

          for (let j = 0; j < numPosts; j++) {
            const postAuthor = faker.helpers.arrayElement(allUsers);
            lastPostTimestamp = faker.date.soon({ days: 2, refDate: lastPostTimestamp });
            
            let replyToPostId: number | null = null;
            let postDepth = 0;
            if (j > 0 && threadPosts.length > 0 && Math.random() * 100 < REPLY_CHANCE_PERCENT) {
              const postsAtLowerDepth = threadPosts.filter(p => p.depth < MAX_REPLY_DEPTH);
              if (postsAtLowerDepth.length > 0) {
                const potentialParentPost = faker.helpers.arrayElement(postsAtLowerDepth);
                replyToPostId = potentialParentPost.id;
                postDepth = (potentialParentPost.depth ?? 0) + 1; // Nullish coalescing for depth
              }
            }

            const [newPost] = await tx.insert(posts).values({
              threadId: newThread.id,
              userId: postAuthor.id,
              content: faker.lorem.paragraphs({min:1, max:3}),
              isFirstPost: j === 0,
              replyToPostId: replyToPostId,
              depth: postDepth,
              likeCount: faker.number.int({ min: 0, max: 50 }),
              createdAt: lastPostTimestamp,
              updatedAt: lastPostTimestamp,
            }).returning();
            threadPosts.push(newPost as _Post);
          }

          if (threadPosts.length > 0) {
            const lastPostInThread = threadPosts[threadPosts.length - 1];
            await tx.update(threads).set({
              postCount: threadPosts.length,
              lastPostId: lastPostInThread.id,
              lastPostAt: lastPostInThread.createdAt,
              firstPostLikeCount: threadPosts[0]?.likeCount || 0,
            }).where(eq(threads.id, newThread.id));
          }
          
          if (seededTags.length > 0 && Math.random() < 0.7) {
            const numTagsToAssign = faker.number.int({ min: 1, max: TAGS_PER_THREAD_MAX });
            const selectedTags = faker.helpers.arrayElements(seededTags, numTagsToAssign);
            if (selectedTags.length > 0) {
              await tx.insert(threadTags).values(
                selectedTags.map(tag => ({ threadId: newThread.id, tagId: tag.id }))
              ).onConflictDoNothing();
            }
          }
        });
      }
    }
    console.log(chalk.bgGreen.black('\n✅ Realistic thread seeding completed successfully!'));
  } catch (error) {
    console.error(chalk.red('❌ Error during realistic thread seeding:'), error);
    process.exit(1);
  }
}

async function ensureDefaultPrefixes(): Promise<ThreadPrefix[]> {
  console.log(chalk.gray('  Ensuring default prefixes...'));
  const existingPrefixes = await db.select().from(threadPrefixes);
  const prefixesToInsert: (typeof threadPrefixes.$inferInsert)[] = [];

  for (const p of DEFAULT_PREFIXES) {
    if (!existingPrefixes.find(ep => ep.name === p.name)) {
      prefixesToInsert.push({ name: p.name, color: p.color, isActive: true, position: 0 });
    }
  }
  if (prefixesToInsert.length > 0) {
    await db.insert(threadPrefixes).values(prefixesToInsert).onConflictDoNothing();
    console.log(chalk.gray(`    Added ${prefixesToInsert.length} new default prefixes.`));
  }
  return db.select().from(threadPrefixes);
}

async function ensureDefaultTags(): Promise<Tag[]> {
  console.log(chalk.gray('  Ensuring default tags...'));
  const existingTags = await db.select().from(tags);
  const tagsToInsert: (typeof tags.$inferInsert)[] = [];
  let currentTagCount = existingTags.length;

  while (currentTagCount < DEFAULT_TAGS_COUNT) {
    const tagName = faker.lorem.word({ length: { min: 3, max: 10 }, strategy: "closest" });
    if (!tagName) continue; // Skip if faker returns undefined/null
    const tagSlug = slugify(tagName);
    if (!existingTags.find(et => et.slug === tagSlug) && !tagsToInsert.find(nt => nt.slug === tagSlug)) {
      tagsToInsert.push({ name: tagName, slug: tagSlug, description: faker.lorem.sentence() });
      currentTagCount++;
    }
  }

  if (tagsToInsert.length > 0) {
    await db.insert(tags).values(tagsToInsert).onConflictDoNothing();
    console.log(chalk.gray(`    Added ${tagsToInsert.length} new default tags.`));
  }
  return db.select().from(tags);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedRealisticThreads()
    .then(() => {
      console.log(chalk.blue('Script finished.'));
      process.exit(0);
    })
    .catch((err) => {
      console.error(chalk.red('Unhandled error in script execution:'), err);
      process.exit(1);
    });
}
