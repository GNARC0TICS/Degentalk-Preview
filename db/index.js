import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import pg from 'pg';
const { Pool: PoolNode } = pg;
import * as schema from './schema';
import { config } from 'dotenv';
import ws from 'ws';
// Load environment variables from .env file
config();
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set for PostgreSQL');
}
let pool;
// Use `any` here because the returned database type differs between node-postgres and neon-http drivers.
// Consumers should import a typed instance directly if they need stricter types.
let db;
if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
    pool = new PoolNode({
        connectionString: process.env.DATABASE_URL
    });
    db = drizzleNode(pool, { schema });
}
else {
    const sql = neon(process.env.DATABASE_URL);
    db = drizzleNeon(sql, { schema });
}
export { pool, db };
export * from './schema'; // optional: re-export schema for convenience
//# sourceMappingURL=index.js.map