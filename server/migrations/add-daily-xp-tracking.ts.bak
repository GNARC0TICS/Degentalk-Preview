import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import { logger } from '../src/core/logger';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

export async function addDailyXpTracking() {
  console.log('🚀 Starting Daily XP Tracking Fields Migration');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  try {
    await db.transaction(async (tx) => {
      // Add dailyXpGained and lastXpGainDate columns to users table
      console.log('Adding XP tracking fields to users table...');
      
      // Add dailyXpGained column if it doesn't exist
      await tx.execute(sql`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS daily_xp_gained INTEGER NOT NULL DEFAULT 0;
      `);
      
      // Add lastXpGainDate column if it doesn't exist
      await tx.execute(sql`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS last_xp_gain_date TIMESTAMP WITH TIME ZONE;
      `);
      
      console.log('✅ Successfully added dailyXpGained and lastXpGainDate columns to users table');
    });
    
    console.log('✅ Daily XP Tracking Fields Migration completed successfully');
  } catch (error) {
    console.error('❌ Error in Daily XP Tracking Fields Migration:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// For direct execution from command line (ES Module version)
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  addDailyXpTracking()
    .then(() => {
      console.log('Migration completed successfully.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
} 