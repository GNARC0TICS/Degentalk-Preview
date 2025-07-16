/**
 * Comprehensive Database Seeding Script
 *
 * This script populates the database with a complete set of test data for a
 * realistic development environment. It creates users, syncs the forum structure
 * from the config file, and then populates the forums with threads and posts.
 *
 * To run: `pnpm seed`
 */

import { db } from '../db';
import { users } from '../db/schema/user/users';
import { forumStructure, threads, posts } from '../db/schema';
import { ForumStructureService } from '../server/src/domains/forum/services/structure.service';
import bcrypt from 'bcrypt';
import { sql } from 'drizzle-orm';

const SEED_CONFIG = {
	threadsPerForum: 5,
	postsPerThread: 8
};

async function seed() {
	console.log('🌱 Starting database seeding...');

	try {
		// 1. Create Users
		console.log('🔧 Step 1: Creating test users...');
		const passwordHash = await bcrypt.hash('password123', 10);
		const testUsers = [
			{ username: 'admin', email: 'admin@degentalk.com', password: passwordHash, xp: 10000, level: 50, isVerified: true },
			{ username: 'moderator', email: 'mod@degentalk.com', password: passwordHash, xp: 5000, level: 25, isVerified: true },
			{ username: 'testuser', email: 'user@degentalk.com', password: passwordHash, xp: 100, level: 1, isVerified: false }
		];

		const createdUsers = await db
			.insert(users)
			.values(testUsers)
			.onConflictDoUpdate({
				target: users.username,
				set: { email: sql`excluded.email`, password: sql`excluded.password`, updatedAt: sql`now()` }
			})
			.returning();
		console.log(`✅ Created/updated ${createdUsers.length} users.`);

		// 2. Sync Forum Structure
		console.log('\n🔧 Step 2: Syncing forum structure from config...');
		const structureService = new ForumStructureService();
		await structureService.syncFromConfig(false); // false for non-dry-run
		console.log('✅ Forum structure synced.');

		// 3. Create Threads and Posts
		console.log('\n🔧 Step 3: Seeding forums with threads and posts...');
		const allForums = await db.select().from(forumStructure).where(sql`type = 'forum'`);

		if (allForums.length === 0) {
			console.warn('⚠️ No forums found to seed. Skipping thread/post creation.');
			return;
		}

		for (const forum of allForums) {
			console.log(`  - Seeding forum: ${forum.name}`);
			for (let i = 0; i < SEED_CONFIG.threadsPerForum; i++) {
				const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
				const threadTitle = `Test Thread ${i + 1} in ${forum.name}`;
				const threadSlug = threadTitle.toLowerCase().replace(/\s+/g, '-');

				const [newThread] = await db
					.insert(threads)
					.values({
						title: threadTitle,
						slug: threadSlug,
						content: `This is the first post for **${threadTitle}**. Welcome!`,
						authorId: randomUser.id,
						forumId: forum.id,
						isPinned: i === 0, // Pin the first thread
						isLocked: i === 3 // Lock the fourth thread
					})
					.returning();

				// Create posts for the thread
				let parentPostId = null;
				for (let j = 0; j < SEED_CONFIG.postsPerThread; j++) {
					const postUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
					const [newPost] = await db
						.insert(posts)
						.values({
							content: `This is reply #${j + 1} in thread "${newThread.title}".`,
							authorId: postUser.id,
							threadId: newThread.id,
							parentPostId: j > 1 ? parentPostId : null // Reply to previous post after the first two
						})
						.returning();
					parentPostId = newPost.id;
				}
			}
		}
		console.log('✅ Forums seeded successfully.');

		console.log('\n\n✨ Seeding complete!');
		console.log('Login with: username: admin, password: password123');
	} catch (error) {
		console.error('❌ An error occurred during seeding:', error);
		process.exit(1);
	} finally {
		process.exit(0);
	}
}

seed();