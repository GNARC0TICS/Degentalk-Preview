import { db } from '../../db'; // Adjust path as necessary
import { forumCategories, threads, posts, users as usersSchema } from '../../db/schema'; // Adjust path
// import { wallets } from '../../db/schema/economy'; // Example: uncomment if you have a wallets table
import { eq, sql } from 'drizzle-orm';
import { slugify } from '../db/utils/seedUtils';
import { faker } from '@faker-js/faker';
import chalk from 'chalk';
import type { ForumRules as ConfigForumRules } from '../../client/src/config/forumMap.config'; // Import ConfigForumRules

// Define the user role type based on your Drizzle schema if it's an enum
// For example, if your schema has: role: text('role', { enum: ['user', 'admin', 'moderator', 'vip'] })
type UserRole = 'user' | 'admin' | 'moderator' | 'vip';
const USER_ROLES: UserRole[] = ['user', 'moderator', 'admin', 'vip']; // Example roles

interface SeededUser {
  id: number;
  username: string;
  role: string;
}

async function truncateDynamicDataIfDev() {
  if (process.env.NODE_ENV === "development") {
    console.log(chalk.yellow("[DEV] Truncating dynamic content tables (users, threads, posts)..."));
    // Add all tables that this script seeds to prevent duplicate key errors on re-runs
    // Be careful with order if there are foreign key constraints without CASCADE DELETE
    await db.delete(posts); // Delete posts first
    await db.delete(threads); // Then threads
    // Truncate users or delete specific seeded users. For full dev reset, truncate is easier.
    // If truncating users, ensure your auth system can handle it or re-seed a default admin.
    // await db.execute(`TRUNCATE TABLE ${usersSchema.table} RESTART IDENTITY CASCADE;`); 
    // For now, let's assume we might want to keep some users, so we'll delete users created by this script later if needed.
    // Or, if users are few and critical, avoid deleting them here and handle conflicts in seedUsers.
  }
}

async function seedUsers(count: number): Promise<SeededUser[]> {
  console.log(chalk.blue(`Seeding ${count} users...`));
  const createdUsers: SeededUser[] = [];

  for (let i = 0; i < count; i++) {
    const username = faker.internet.userName().toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 20) + `_${faker.string.alphanumeric(3)}`;
    const email = faker.internet.email({firstName: username});
    // Hashing passwords should be done here if your schema expects hashed passwords.
    // For simplicity in seeding, we might store plain text or a known dummy hash.
    // const hashedPassword = await hashPassword('password123'); // Example

    try {
      const [newUser] = await db
        .insert(usersSchema)
        .values({
          username: username,
          email: email,
          // passwordHash: hashedPassword, // If using hashed passwords
          role: faker.helpers.arrayElement(USER_ROLES) as UserRole, // Cast to UserRole
          xp: faker.number.int({ min: 0, max: 100000 }),
          lastActiveAt: faker.date.recent({ days: 30 }),
          // Add other necessary fields like createdAt, emailVerified, etc.
          // Example for wallet balance (if direct columns on users table, otherwise seed wallets table)
          // dgtBalance: faker.finance.amount(0, 10000, 2), 
          // usdtBalance: faker.finance.amount(0, 5000, 2),
        })
        .onConflictDoNothing() // Or use onConflictDoUpdate if you want to update existing users by email/username
        .returning({ id: usersSchema.id, username: usersSchema.username, role: usersSchema.role });

      if (newUser) {
        createdUsers.push({id: newUser.id, username: newUser.username, role: newUser.role! });
        console.log(chalk.gray(`  Created user: ${newUser.username} (ID: ${newUser.id}, Role: ${newUser.role})`));
        // TODO: Seed wallet entry if wallets are in a separate table
      } else {
        // If onConflictDoNothing and user existed, try to fetch them to include in createdUsers
        const [existingUser] = await db.select({id: usersSchema.id, username: usersSchema.username, role: usersSchema.role}).from(usersSchema).where(eq(usersSchema.email, email));
        if (existingUser) {
            createdUsers.push({id: existingUser.id, username: existingUser.username, role: existingUser.role!});
        }
      }
    } catch (error) {
      console.error(chalk.red(`Error creating user ${username}:`), error);
    }
  }
  console.log(chalk.green(`Seeded ${createdUsers.length} users.`));
  return createdUsers;
}


async function seedThreadsAndPostsForForums(seededUsers: SeededUser[]) {
  if (!seededUsers.length) {
    console.warn(chalk.yellow("No users available to author threads/posts. Skipping thread/post seeding."));
    return;
  }

  const dbForumCategories = await db.select({ id: forumCategories.id, name: forumCategories.name, slug: forumCategories.slug, pluginData: forumCategories.pluginData })
    .from(forumCategories)
    .where(eq(forumCategories.type, "forum")); // Only seed into actual forums

  if (!dbForumCategories.length) {
    console.warn(chalk.yellow("No forums found in the database. Run seedForumsFromConfig first or ensure forums exist."));
    return;
  }

  const threadsPerForum = faker.number.int({ min: 2, max: 8 }); // Variable threads per forum

  for (const category of dbForumCategories) {
    console.log(chalk.blue(`Seeding threads for forum: '${category.name}' (ID: ${category.id})`));
    const forumRules = (category.pluginData as any)?.rules as ConfigForumRules | undefined;

    for (let i = 1; i <= threadsPerForum; i++) {
      const author = faker.helpers.arrayElement(seededUsers);
      const threadTitle = faker.lorem.sentence({ min: 3, max: 10 }).slice(0, 80);
      const threadSlug = await slugify(`${threadTitle}-${faker.string.alphanumeric(6)}`);
      const firstPostContent = faker.lorem.paragraphs({min:1, max:3});

      try {
        const [newThread] = await db
          .insert(threads)
          .values({
            title: threadTitle,
            slug: threadSlug,
            parentForumSlug: category.slug,
            categoryId: category.id,
            userId: author.id,
            isSticky: faker.datatype.boolean(0.1), // 10% chance of being sticky
            isLocked: faker.datatype.boolean(0.05), // 5% chance of being locked
            isHidden: faker.datatype.boolean(0.02), // 2% chance of being hidden
            viewCount: faker.number.int({ min: 0, max: 5000 }),
            // postCount will be updated after posts are seeded
            // firstPostLikeCount, dgtStaked, hotScore can be seeded later or calculated
            createdAt: faker.date.recent({ days: 90 }), // Threads created in the last 90 days
          })
          .returning({ id: threads.id, createdAt: threads.createdAt });

        if (!newThread) {
          console.error(chalk.red(`  Failed to insert thread: ${threadTitle}`));
          continue;
        }

        const postsInThreadCount = faker.number.int({ min: 0, max: 25 }); // 0 to 25 replies
        let lastPostId: number | null = null; // Explicitly type as number | null
        let lastPostAt: Date | null = newThread.createdAt; // Type as Date | null

        // Seed first post
        if (postsInThreadCount >= 0) { // Always create first post if thread is created
            const [firstPost] = await db
            .insert(posts)
            .values({
              threadId: newThread.id,
              userId: author.id, // First post by thread author
              content: firstPostContent,
              isFirstPost: true,
              createdAt: newThread.createdAt, // First post created at same time as thread
              likeCount: faker.number.int({min: 0, max: 50}),
            })
            .returning({ id: posts.id, createdAt: posts.createdAt });

            if (!firstPost) {
                console.error(chalk.red(`  Failed to insert first post for thread: ${threadTitle}`));
                await db.delete(threads).where(eq(threads.id, newThread.id));
                continue;
            }
            lastPostId = firstPost.id;
            lastPostAt = firstPost.createdAt;
        }
        
        // Seed replies
        for (let j = 0; j < postsInThreadCount; j++) {
          const postAuthor = faker.helpers.arrayElement(seededUsers);
          const postCreatedAt = faker.date.between({ from: lastPostAt!, to: new Date() });
          const [replyPost] = await db.insert(posts).values({
            threadId: newThread.id,
            userId: postAuthor.id,
            content: faker.lorem.paragraph(),
            isFirstPost: false,
            createdAt: postCreatedAt,
            likeCount: faker.number.int({min: 0, max: 20}),
          }).returning({id: posts.id, createdAt: posts.createdAt});

          if(replyPost){
            lastPostId = replyPost.id;
            lastPostAt = replyPost.createdAt;
          }
        }
        
        // Update thread with aggregated post info
        await db
          .update(threads)
          .set({
            lastPostId: lastPostId,
            lastPostAt: lastPostAt,
            postCount: postsInThreadCount + (postsInThreadCount >=0 ? 1: 0), // +1 for the first post
            // TODO: Seed/calculate firstPostLikeCount, hotScore, dgtStaked
          })
          .where(eq(threads.id, newThread.id));

        console.log(chalk.gray(`    Created thread: '${threadTitle}' (ID: ${newThread.id}) with ${postsInThreadCount + 1} post(s)`));
      } catch (error) {
        console.error(chalk.red(`  Error creating thread "${threadTitle}":`), error);
      }
    }
  }
}

async function main() {
  console.log(chalk.bold.magenta('🚀 Starting DegenTalk Dynamic Content Seeder...'));
  
  // Ask user if they want to truncate tables in dev
  // For now, let's always truncate in dev for simplicity during refactor
  await truncateDynamicDataIfDev();

  const numUsersToSeed = 50; // Configurable
  const seededUsers = await seedUsers(numUsersToSeed);

  // TODO: Seed Tags
  // TODO: Seed Prefixes

  await seedThreadsAndPostsForForums(seededUsers);

  // TODO: Seed Wallet Transactions
  // TODO: Seed XP activities
  // TODO: Seed Shop Items / Orders
  // TODO: Seed Announcements / Reports

  console.log(chalk.bold.green('✅ DegenTalk Dynamic Content Seeding Completed Successfully!'));
}

if (import.meta.url === (process.argv[1] ?? '')) {
  main().catch(err => {
    console.error(chalk.red.bold('Seeder failed:'), err);
    process.exit(1);
  }).finally(() => {
    console.log(chalk.gray('Seed script finished.'));
    // process.exit(0); // Drizzle keeps connection open, might need to exit explicitly
  });
}
