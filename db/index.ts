import { drizzle as drizzleNeon, NeonClient } from 'drizzle-orm/neon-serverless';
import { Pool as PoolNeon, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNode, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool as PoolNode } from 'pg';
import * as schema from './schema';
import { config } from 'dotenv';
import ws from 'ws';

// Load environment variables from .env file
config();

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL must be set for PostgreSQL');
}

let pool: PoolNode | NeonClient;
let db: NodePgDatabase<typeof schema>;
if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
	pool = new PoolNode({
		connectionString: process.env.DATABASE_URL
	});
	db = drizzleNode(pool, { schema });
} else {
	pool = new PoolNeon({
		connectionString: process.env.DATABASE_URL
	});
	db = drizzleNeon(pool as NeonClient, { schema });
}
export { pool, db };
export * from './schema'; // optional: re-export schema for convenience
