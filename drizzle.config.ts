import { defineConfig } from 'drizzle-kit';
import 'dotenv/config'; // Load environment variables from .env files

// For Neon PostgreSQL, ensure DATABASE_URL is set in your .env or env.local
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
	// Throw an error if the variable is not found, providing guidance
	throw new Error("DATABASE_URL environment variable is not set.");
}

// Debug logging
console.log('Database URL:', dbUrl.replace(/:[^:@]+@/, ':****@')); // Hide password in logs
console.log('Environment:', process.env.NODE_ENV || 'development');

export default defineConfig({
	dialect: 'postgresql', // Explicitly set to PostgreSQL
	dbCredentials: { url: dbUrl },
	schema: './db/schema/index.ts', // Or "./db/schema/"
	out: './migrations/postgres', // Output migrations to a PostgreSQL-specific directory
	verbose: true,
	strict: true,
	// Temporarily commenting out ignorePatterns to debug migration issues
	// ignorePatterns: [
	// 	'session',
	// 	'stickers',
	// 	'users.unlocked_emojis',
	// 	'users.unlocked_stickers',
	// 	'users.equipped_flair_emoji',
	// 	'forum_categories.forum_type',
	// 	'forum_categories.slug_override',
	// 	'forum_categories.components',
	// 	'forum_categories.thread_rules',
	// 	'forum_categories.access_control',
	// 	'forum_categories.display_priority',
	// 	'forum_categories.seo',
	// 	'notification_type',
	// 	'reaction_type',
	// 	'transaction_type',
	// 	'vault_status',
	// 	'withdrawal_status',
	// 	'content_edit_status'
	// ]
	// Add connection timeout
	connectionTimeout: 30000, // 30 seconds
});
