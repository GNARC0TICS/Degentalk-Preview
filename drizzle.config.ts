// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { Config } from 'drizzle-kit';
import 'dotenv/config';
import { logger } from "server/src/core/logger";

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');

// Debug logging
logger.info('Database URL:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')); // Hide password in logs
logger.info('Environment:', process.env.NODE_ENV || 'development');

export default {
	dialect: 'postgresql',
	schema: ['./db/schema/**/*.ts'],
	out: './migrations/postgres',
	dbCredentials: { url: process.env.DATABASE_URL }
} satisfies Config;
