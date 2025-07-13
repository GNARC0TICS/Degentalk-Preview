import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import pg from 'pg';
const { Pool: PoolNode } = pg;
import * as schema from './schema/index.js';
import { config } from 'dotenv';
import ws from 'ws';
import { z } from 'zod';

// Load environment variables from .env file
config();

// --- Environment Variable Validation ---
const envSchema = z.object({
	DATABASE_URL: z.string().min(1, 'DATABASE_URL must be set for PostgreSQL'),
	DB_DRIVER: z.enum(['node-postgres', 'neon']).default('node-postgres')
});

const env = envSchema.parse(process.env);
// --- End Validation ---

neonConfig.webSocketConstructor = ws;

import type { Pool as PgPool } from 'pg';

let pool: PgPool | undefined;
// Use `any` here because the returned database type differs between node-postgres and neon-http drivers.
// Consumers should import a typed instance directly if they need stricter types.
let db: any;

if (env.DB_DRIVER === 'node-postgres') {
	console.log('🐘 Using node-postgres driver for database connection.');
	pool = new PoolNode({
		connectionString: env.DATABASE_URL
	});
	db = drizzleNode(pool, { schema });
} else if (env.DB_DRIVER === 'neon') {
	console.log('⚡️ Using Neon serverless driver for database connection.');
	const sql = neon(env.DATABASE_URL);
	db = drizzleNeon(sql, { schema });
} else {
	throw new Error(`Unsupported DB_DRIVER: ${env.DB_DRIVER}. Must be 'node-postgres' or 'neon'.`);
}
export { pool, db };
export * from './schema'; // optional: re-export schema for convenience
