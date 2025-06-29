// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { Config } from 'drizzle-kit';
import 'dotenv/config'; // Load environment variables from .env files

// For Neon PostgreSQL, ensure DATABASE_URL is set in your .env or env.local
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
	// Throw an error if the variable is not found, providing guidance
	throw new Error('DATABASE_URL environment variable is not set.');
}

// Debug logging
console.log('Database URL:', dbUrl.replace(/:[^:@]+@/, ':****@')); // Hide password in logs
console.log('Environment:', process.env.NODE_ENV || 'development');

export default {
	dialect: 'postgresql',
	schema: './db/schema/index.ts',
	out: './migrations/postgres',
	dbCredentials: { url: dbUrl }
} satisfies Config;
