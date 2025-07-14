import { addDailyXpTracking } from '../../server/migrations/add-daily-xp-tracking';
import { seedDefaultLevels } from './seed-default-levels';
import { db } from '../db';
import { users } from '../../shared/schema';
import { sql } from 'drizzle-orm';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { trackUserXpByDay, sqlSafe, sqlDate } from '../../shared/utils/sql-helpers';

// Load environment variables from .env file
config();

/**
 * Initialize the XP/Level system by:
 * 1. Running the migration to add necessary fields
 * 2. Seeding the default level configurations
 * 3. Updating existing users' levels based on their XP
 */
async function initializeXpSystem() {
  console.log('🚀 Starting XP System Initialization');
  
  try {
    // Step 1: Run the migration to add daily XP tracking fields
    console.log('Running migration to add daily XP tracking fields...');
    await addDailyXpTracking();
    
    // Step 2: Seed default levels, titles, badges, and economy settings
    console.log('Seeding default level system data...');
    await seedDefaultLevels();
    
    // Step 3: Update existing users' levels based on their XP
    console.log('Updating existing users\' levels based on their XP...');
    await db.execute(sql`
      WITH user_levels AS (
        SELECT 
          u.user_id,
          u.xp,
          COALESCE(
            (SELECT MAX(l.level) 
             FROM levels l 
             WHERE l.min_xp <= u.xp),
            1
          ) as calculated_level
        FROM users u
      )
      UPDATE users u
      SET level = ul.calculated_level
      FROM user_levels ul
      WHERE u.user_id = ul.user_id AND u.level != ul.calculated_level
    `);
    
    console.log('✅ XP System initialization completed successfully');
  } catch (error) {
    console.error('❌ Error initializing XP system:', error);
    throw error;
  }
}

// Run the initialization if this script is executed directly (ES Module version)
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  initializeXpSystem()
    .then(() => {
      console.log('All XP system initialization steps completed successfully.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('XP system initialization failed:', error);
      process.exit(1);
    });
}

export { initializeXpSystem }; 