#!/usr/bin/env tsx

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Load environment variables from env.local
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), 'env.local') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql);

async function diagnoseMentionsTable() {
	console.log('🔍 Diagnosing mentions table structure...\n');

	try {
		// Check table structure
		const tableInfo = await sql`
			SELECT 
				column_name,
				data_type,
				is_nullable,
				column_default
			FROM information_schema.columns 
			WHERE table_name = 'mentions' 
			AND table_schema = 'public'
			ORDER BY ordinal_position;
		`;

		console.log('📊 Current mentions table structure:');
		console.table(tableInfo);

		// Check foreign key constraints
		const constraints = await sql`
			SELECT 
				tc.constraint_name,
				tc.constraint_type,
				kcu.column_name,
				ccu.table_name AS foreign_table_name,
				ccu.column_name AS foreign_column_name
			FROM information_schema.table_constraints AS tc
			JOIN information_schema.key_column_usage AS kcu
				ON tc.constraint_name = kcu.constraint_name
			LEFT JOIN information_schema.constraint_column_usage AS ccu
				ON ccu.constraint_name = tc.constraint_name
			WHERE tc.table_name = 'mentions'
			AND tc.table_schema = 'public';
		`;

		console.log('\n🔗 Current constraints:');
		console.table(constraints);

		// Sample some data to see current thread_id values
		const sampleData = await sql`
			SELECT 
				id,
				thread_id,
				pg_typeof(thread_id) as thread_id_type,
				post_id,
				mention_text
			FROM mentions 
			LIMIT 10;
		`;

		console.log('\n📋 Sample data (first 10 rows):');
		console.table(sampleData);

		// Check for non-integer thread_id values
		const nonIntegerCheck = await sql`
			SELECT 
				COUNT(*) as total_rows,
				COUNT(thread_id) as non_null_thread_ids,
				COUNT(CASE WHEN thread_id ~ '^[0-9]+$' THEN 1 END) as numeric_thread_ids,
				COUNT(CASE WHEN thread_id IS NOT NULL AND thread_id !~ '^[0-9]+$' THEN 1 END) as non_numeric_thread_ids
			FROM mentions;
		`;

		console.log('\n🔢 Thread ID data analysis:');
		console.table(nonIntegerCheck);

		// Check if there are any threads table references
		const threadsCheck = await sql`
			SELECT 
				m.thread_id,
				t.thread_id as threads_table_id,
				CASE WHEN t.thread_id IS NULL THEN 'MISSING' ELSE 'EXISTS' END as thread_exists
			FROM mentions m
			LEFT JOIN threads t ON m.thread_id::text = t.thread_id::text
			WHERE m.thread_id IS NOT NULL
			LIMIT 10;
		`;

		console.log('\n🔍 Thread ID reference check:');
		console.table(threadsCheck);

	} catch (error) {
		console.error('❌ Error diagnosing mentions table:', error);
	} finally {
		// Neon HTTP client doesn't require explicit cleanup
		console.log('✅ Diagnosis complete');
	}
}

diagnoseMentionsTable();