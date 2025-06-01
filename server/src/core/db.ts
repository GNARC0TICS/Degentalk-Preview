import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import ws from "ws";
import * as schema from "@db/schema";
// Removed: import { config } from 'dotenv'; // No longer needed here
import { logger, LogLevel, LogAction } from './logger';

// Environment variables should be loaded by the application entry point (e.g., server/index.ts)
// Removed: config(); 

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const databaseProvider = process.env.DATABASE_PROVIDER || 'postgres'; // Default to postgres

let db: any; // Use 'any' for now, or create a common Drizzle instance type
let pool: Pool | undefined; // Pool is only for Neon/Postgres

if (databaseProvider === 'sqlite') {
  const sqliteDb = new Database(process.env.DATABASE_URL.replace('sqlite:///', ''));
  db = drizzleSqlite(sqliteDb, { schema });
  logger.info("DATABASE", "Using SQLite database provider.");
} else if (databaseProvider === 'postgres' || databaseProvider === 'postgresql') {
  // Configure pool with retry settings
  const poolConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 10,
    connectionTimeoutMillis: 10000,
    retryDelay: 1000,
    maxRetries: 3
  };
  pool = new Pool(poolConfig);

  // Add connection error handling
  pool.on('error', (err) => {
    logger.error("DATABASE", 'Unexpected error on idle database client', err);
    process.exit(-1);
  });

  db = drizzleNeon(pool, { schema });
  logger.info("DATABASE", "Using PostgreSQL (Neon) database provider.");
} else {
  throw new Error(`Unsupported DATABASE_PROVIDER: ${databaseProvider}. Must be 'sqlite' or 'postgres'.`);
}

// Add retry wrapper
const withRetry = async <T>(operation: () => Promise<T>): Promise<T> => {
  let lastError;
  for (let i = 0; i < 3; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      // Specific error code for Neon/Postgres connection issues
      if (databaseProvider === 'postgres' && error.code === '57P01') {
        logger.warn("DATABASE", `Connection error (attempt ${i + 1}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      // For SQLite or other errors, throw immediately
      throw error;
    }
  }
  logger.error("DATABASE", 'Max retries reached for database operation.', lastError);
  throw lastError;
};

export { db, pool, withRetry };
