import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import { logger } from '../src/core/logger';
import { config } from 'dotenv';

config();

const getDb = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL env var is not set');
  const pool = new Pool({ connectionString });
  return { db: drizzle(pool), pool };
};

export async function up() {
  console.log('🚀 Applying migration: clout_achievements & user_clout_log');
  const { db, pool } = getDb();
  try {
    await db.transaction(async (tx) => {
      // clout_achievements
      console.log('Creating clout_achievements table...');
      await tx.execute(sql`
        CREATE TABLE IF NOT EXISTS clout_achievements (
          id SERIAL PRIMARY KEY,
          achievement_key VARCHAR(100) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          clout_reward INTEGER NOT NULL DEFAULT 0,
          criteria_type VARCHAR(50),
          criteria_value INTEGER,
          enabled BOOLEAN DEFAULT TRUE,
          icon_url VARCHAR(500),
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);

      // user_clout_log
      console.log('Creating user_clout_log table...');
      await tx.execute(sql`
        CREATE TABLE IF NOT EXISTS user_clout_log (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
          achievement_id INTEGER REFERENCES clout_achievements(id) ON DELETE SET NULL,
          clout_earned INTEGER NOT NULL,
          reason VARCHAR(255),
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      await tx.execute(sql`CREATE INDEX IF NOT EXISTS idx_user_clout ON user_clout_log (user_id, created_at);`);

      // Seed default achievements (optional, safe for idempotent insert)
      console.log('Seeding default clout achievements...');
      await tx.execute(sql`
        INSERT INTO clout_achievements (achievement_key, name, description, clout_reward, criteria_type, criteria_value)
        VALUES
          ('first_viral_thread', 'Gone Viral', 'Your thread received 100+ likes', 500, 'thread_likes', 100),
          ('community_favorite', 'Community Favorite', 'Received 1000 total likes', 1000, 'total_likes_received', 1000),
          ('premium_supporter', 'Premium Degen', 'Purchased premium membership', 300, 'shop_purchase', NULL)
        ON CONFLICT (achievement_key) DO NOTHING;
      `);
    });
    console.log('✅ Migration applied: clout_achievements & user_clout_log');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    logger.error('Migration failed: clout_achievements & user_clout_log', { err });
    throw err;
  } finally {
    const { pool } = getDb();
    await pool.end();
  }
}

export async function down() {
  console.log('↩️ Reverting migration: clout_achievements & user_clout_log');
  const { db, pool } = getDb();
  try {
    await db.transaction(async (tx) => {
      await tx.execute(sql`DROP TABLE IF EXISTS user_clout_log;`);
      await tx.execute(sql`DROP TABLE IF EXISTS clout_achievements;`);
    });
    console.log('✅ Reverted migration: clout_achievements & user_clout_log');
  } catch (err) {
    console.error('❌ Revert failed:', err);
    logger.error('Revert failed: clout_achievements & user_clout_log', { err });
    throw err;
  } finally {
    await pool.end();
  }
} 