/* eslint-disable @typescript-eslint/no-unused-vars */
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import { logger } from '../src/core/logger';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Helper to get DB connection, assuming DATABASE_URL is set
const getDbConnection = () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return { db: drizzle(pool), pool };
};

export async function up() {
  logger.info('🚀 Applying migration: Add Daily XP Tracking Fields');
  const { db, pool } = getDbConnection();

  try {
    await db.transaction(async (tx) => {
      logger.info('Adding XP tracking fields to users table...');
      await tx.execute(sql`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS daily_xp_gained INTEGER NOT NULL DEFAULT 0;
      `);
      await tx.execute(sql`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS last_xp_gain_date TIMESTAMP WITH TIME ZONE;
      `);
      logger.info('✅ Successfully added dailyXpGained and lastXpGainDate columns to users table');
    });
    logger.info('✅ Migration applied successfully: Add Daily XP Tracking Fields');
  } catch (error: unknown) {
    logger.error('❌ Error applying migration (Add Daily XP Tracking Fields):', error);
    throw error; // Re-throw to indicate failure
  } finally {
    await pool.end();
  }
}

export async function down() {
  logger.info('↩️ Reverting migration: Add Daily XP Tracking Fields');
  const { db, pool } = getDbConnection();

  try {
    await db.transaction(async (tx) => {
      logger.info('Removing XP tracking fields from users table...');
      await tx.execute(sql`
        ALTER TABLE users 
        DROP COLUMN IF EXISTS daily_xp_gained;
      `);
      await tx.execute(sql`
        ALTER TABLE users 
        DROP COLUMN IF EXISTS last_xp_gain_date;
      `);
      logger.info('✅ Successfully removed dailyXpGained and lastXpGainDate columns from users table');
    });
    logger.info('✅ Migration reverted successfully: Add Daily XP Tracking Fields');
  } catch (error: unknown) {
    logger.error('❌ Error reverting migration (Add Daily XP Tracking Fields):', error);
    throw error; // Re-throw to indicate failure
  } finally {
    await pool.end();
  }
}

// For direct execution from command line (ES Module version)
// This allows running `node path/to/this/file.ts up` or `node path/to/this/file.ts down`
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  const operation = process.argv[2]; // Expect 'up' or 'down'
  if (operation === 'up') {
    up().then(() => process.exit(0)).catch(() => process.exit(1));
  } else if (operation === 'down') {
    down().then(() => process.exit(0)).catch(() => process.exit(1));
  } else {
    logger.info("Please specify 'up' or 'down' as an argument.");
    process.exit(1);
  }
}
