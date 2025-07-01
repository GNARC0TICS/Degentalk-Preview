// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { Config } from 'drizzle-kit';
import 'dotenv/config'; // Load environment variables from .env files

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');

// Debug logging
console.log('Database URL:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')); // Hide password in logs
console.log('Environment:', process.env.NODE_ENV || 'development');

export default {
	dialect: 'postgresql',
	schema: ['./db/schema/**/*.ts'],
	out: './migrations/postgres',
	dbCredentials: { url: process.env.DATABASE_URL }
} satisfies Config;
