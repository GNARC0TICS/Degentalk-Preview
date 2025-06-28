import { db } from './db/index.js';
import { threads, users as usersTable, forumStructure } from './db/schema/index.js';
import { eq, desc, count } from 'drizzle-orm';

async function testSimpleThreadQuery() {
	try {
		console.log('Testing simple thread count...');

		// Test 1: Basic count
		const countResult = await db
			.select({ count: count(threads.id) })
			.from(threads)
			.execute();

		console.log('Thread count:', countResult[0]?.count || 0);

		if (countResult[0]?.count === 0) {
			console.log('No threads found in database');
			return;
		}

		// Test 2: Basic thread query
		const basicThreads = await db.select().from(threads).limit(3).execute();

		console.log(`Found ${basicThreads.length} threads:`);
		basicThreads.forEach((thread) => {
			console.log(`- ID: ${thread.id}, Title: ${thread.title}, StructureId: ${thread.structureId}`);
		});

		// Test 3: Join with users
		const threadsWithUsers = await db
			.select()
			.from(threads)
			.leftJoin(usersTable, eq(threads.userId, usersTable.id))
			.limit(2)
			.execute();

		console.log(`Threads with users (${threadsWithUsers.length}):`);
		threadsWithUsers.forEach((row) => {
			console.log(`- Thread: ${row.threads.title}, User: ${row.users?.username || 'No user'}`);
		});
	} catch (error) {
		console.error('Error in test:', error.message);
		console.error('Stack:', error.stack);
	}
}

testSimpleThreadQuery().then(() => process.exit(0));
