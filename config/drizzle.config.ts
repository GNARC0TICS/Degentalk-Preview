// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { Config } from 'drizzle-kit';
import 'dotenv/config';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL not set');

export default {
	dialect: 'postgresql',
	schema: ['../db/schema/**/*.ts'],
	out: '../migrations/postgres',
	dbCredentials: { url: process.env.DATABASE_URL }
} satisfies Config;
