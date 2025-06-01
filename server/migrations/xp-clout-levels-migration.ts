import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import { logger } from '../src/core/logger';

export async function runXpCloutLevelsMigration() {
  console.log('🚀 Starting XP, Clout, Levels & Titles Migration');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  try {
    await db.transaction(async (tx) => {
      // --- customEmojis Enhancements ---
      console.log('Updating custom_emojis table...');
      await tx.execute(sql`ALTER TABLE custom_emojis ADD COLUMN IF NOT EXISTS xp_value INTEGER NOT NULL DEFAULT 0;`);
      await tx.execute(sql`ALTER TABLE custom_emojis ADD COLUMN IF NOT EXISTS clout_value INTEGER NOT NULL DEFAULT 0;`);

      // --- xpCloutSettings Table ---
      console.log('Creating xp_clout_settings table...');
      await tx.execute(sql`
        CREATE TABLE IF NOT EXISTS xp_clout_settings (
          action_key VARCHAR(100) PRIMARY KEY,
          xp_value INTEGER NOT NULL DEFAULT 0,
          clout_value INTEGER NOT NULL DEFAULT 0,
          description TEXT
        );
      `);
      // Optional: Seed default values
      console.log('Seeding default XP/Clout settings...');
      await tx.execute(sql`
        INSERT INTO xp_clout_settings (action_key, xp_value, clout_value, description) VALUES 
          ('POST_CREATE', 10, 1, 'XP/Clout gained for creating a post'),
          ('THREAD_CREATE', 25, 2, 'XP/Clout gained for creating a thread'),
          ('REACTION_RECEIVE_LIKE', 2, 1, 'XP/Clout gained when someone likes your post'),
          ('TIP_RECEIVE', 5, 1, 'XP/Clout gained per DGT received as tip (multiplier)'),
          ('TIP_SEND', 1, 0, 'XP gained per DGT sent as tip (multiplier)')
        ON CONFLICT (action_key) DO NOTHING;
      `);
      
      // --- titles Table ---
      console.log('Creating titles table...');
      await tx.execute(sql`
        CREATE TABLE IF NOT EXISTS titles (
          title_id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          icon_url VARCHAR(255),
          rarity VARCHAR(50) DEFAULT 'common',
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      
      // --- badges Table ---
      console.log('Creating badges table...');
      await tx.execute(sql`
        CREATE TABLE IF NOT EXISTS badges (
          badge_id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          icon_url VARCHAR(255) NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      
      // --- levels Table Enhancements ---
      console.log('Updating levels table...');
      // Add new columns
      await tx.execute(sql`ALTER TABLE levels ADD COLUMN IF NOT EXISTS name VARCHAR(100);`);
      await tx.execute(sql`ALTER TABLE levels ADD COLUMN IF NOT EXISTS reward_dgt INTEGER DEFAULT 0;`);
      await tx.execute(sql`ALTER TABLE levels ADD COLUMN IF NOT EXISTS reward_title_id INTEGER REFERENCES titles(title_id) ON DELETE SET NULL;`);
      await tx.execute(sql`ALTER TABLE levels ADD COLUMN IF NOT EXISTS reward_badge_id INTEGER REFERENCES badges(badge_id) ON DELETE SET NULL;`);
      // Remove old column if desired
      // await tx.execute(sql`ALTER TABLE levels DROP COLUMN IF EXISTS badge_icon_url;`);
      // await tx.execute(sql`ALTER TABLE levels DROP COLUMN IF EXISTS reward_points;`); // If replacing rewardPoints with DGT

      // --- users Table Enhancements ---
      console.log('Updating users table...');
      await tx.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS clout INTEGER NOT NULL DEFAULT 0;`);
      await tx.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS active_title_id INTEGER REFERENCES titles(title_id) ON DELETE SET NULL;`);
      await tx.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS active_badge_id INTEGER REFERENCES badges(badge_id) ON DELETE SET NULL;`);

      console.log('XP/Clout/Levels enhancements applied successfully.');
    });

    console.log('✅ XP, Clout, Levels & Titles Migration Completed Successfully');
    return true;

  } catch (error) {
    console.error('❌ XP, Clout, Levels & Titles Migration Failed:', error);
    logger.error('Migration failed:', { error });
    return false;
  } finally {
    await pool.end();
  }
}

// TODO: Implement migration logic if not present
// export async function runXpCloutLevelsMigration() {} 