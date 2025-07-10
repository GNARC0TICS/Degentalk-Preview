import { db } from './db/index.js';
import { threads, users as usersTable, forumStructure } from './db/schema/index.js';
import { eq, desc, count } from 'drizzle-orm';
import { logger } from "server/src/core/logger";

async function testSimpleThreadQuery() {
	try {
		logger.info('Testing simple thread count...');

		// Test 1: Basic count
		const countResult = await db
			.select({ count: count(threads.id) })
			.from(threads)
			.execute();

		logger.info('Thread count:', countResult[0]?.count || 0);

		if (countResult[0]?.count === 0) {
			logger.info('No threads found in database');
			return;
		}

		// Test 2: Basic thread query
		const basicThreads = await db.select().from(threads).limit(3).execute();

		logger.info(`Found ${basicThreads.length} threads:`);
		basicThreads.forEach((thread) => {
			logger.info(`- ID: ${thread.id}, Title: ${thread.title}, StructureId: ${thread.structureId}`);
		});

		// Test 3: Join with users
		const threadsWithUsers = await db
			.select()
			.from(threads)
			.leftJoin(usersTable, eq(threads.userId, usersTable.id))
			.limit(2)
			.execute();

		logger.info(`Threads with users (${threadsWithUsers.length}):`);
		threadsWithUsers.forEach((row) => {
			logger.info(`- Thread: ${row.threads.title}, User: ${row.users?.username || 'No user'}`);
		});
	} catch (error) {
		logger.error('Error in test:', error.message);
		logger.error('Stack:', error.stack);
	}
}

testSimpleThreadQuery().then(() => process.exit(0));
