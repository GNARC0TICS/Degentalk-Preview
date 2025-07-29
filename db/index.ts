import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import pg from 'pg';
const { Pool: PoolNode, Client } = pg;
import * as schema from './schema/index.js';
import { config } from 'dotenv';
import ws from 'ws';
import { z } from 'zod';

// Load environment variables from .env file
config();

// --- Environment Variable Validation ---
const envSchema = z.object({
	DATABASE_URL: z.string().min(1, 'DATABASE_URL must be set for PostgreSQL'),
	DIRECT_DATABASE_URL: z.string().optional(),
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

// Use pooled connection for normal app operations
if (env.DB_DRIVER === 'node-postgres') {
	console.log('🐘 Using node-postgres driver for database connection.');
	pool = new PoolNode({
		connectionString: env.DATABASE_URL, // Pooled for app
		max: 10
	});
	db = drizzleNode(pool, { schema });
} else if (env.DB_DRIVER === 'neon') {
	console.log('⚡️ Using Neon serverless driver for database connection.');
	const sql = neon(env.DATABASE_URL);
	db = drizzleNeon(sql, { schema });
} else {
	throw new Error(`Unsupported DB_DRIVER: ${env.DB_DRIVER}. Must be 'node-postgres' or 'neon'.`);
}

// Export a direct connection for migrations/admin tasks
export const getDirectDb = async () => {
	const directUrl = env.DIRECT_DATABASE_URL || env.DATABASE_URL;
	
	if (!directUrl) {
		throw new Error('No database URL available for direct connection');
	}
	
	console.log('📡 Creating direct database connection (no pooler)...');
	
	const client = new Client({
		connectionString: directUrl, // Direct for migrations
		ssl: { rejectUnauthorized: false }
	});
	
	await client.connect();
	return {
		db: drizzleNode(client, { schema }),
		client // Return client so caller can close it
	};
};

// Simple retry utility for database operations
export async function withRetry<T>(
	operation: () => Promise<T>, 
	maxRetries: number = 3,
	delay: number = 1000
): Promise<T> {
	let lastError: Error;
	
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			return await operation();
		} catch (error) {
			lastError = error as Error;
			if (attempt === maxRetries) break;
			
			// Wait before retrying
			await new Promise(resolve => setTimeout(resolve, delay * attempt));
		}
	}
	
	throw lastError!;
}

export { pool, db };
export * from './schema'; // optional: re-export schema for convenience
