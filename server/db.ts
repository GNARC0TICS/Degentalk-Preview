import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import Database from 'better-sqlite3';
import * as schema from '../db/schema';
import { config } from 'dotenv';
import ws from 'ws';

// Load environment variables from .env file
config();

neonConfig.webSocketConstructor = ws;

const databaseProvider = process.env.DATABASE_PROVIDER || 'postgres';

let db: any;

if (databaseProvider === 'sqlite') {
  const sqlite = new Database(process.env.DATABASE_URL || 'db/dev.db');
  db = drizzleSqlite(sqlite, { schema });
} else if (databaseProvider === 'postgres' || databaseProvider === 'postgresql') {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set for PostgreSQL");
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNeon(pool, { schema });
} else {
  throw new Error(`Unsupported DATABASE_PROVIDER: ${databaseProvider}`);
}

export { db };
