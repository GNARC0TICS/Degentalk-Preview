/* eslint-disable @typescript-eslint/no-unused-vars */
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
  logger.info('🚀 Applying migration: reputation_achievements & user_reputation_log');
  const { db, pool } = getDb();
  try {
    await db.transaction(async (tx) => {
      // reputation_achievements
      logger.info('Creating reputation_achievements table...');
      await tx.execute(sql`
        CREATE TABLE IF NOT EXISTS reputation_achievements (
          id SERIAL PRIMARY KEY,
          achievement_key VARCHAR(100) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          reputation_reward INTEGER NOT NULL DEFAULT 0,
          criteria_type VARCHAR(50),
          criteria_value INTEGER,
          enabled BOOLEAN DEFAULT TRUE,
          icon_url VARCHAR(500),
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);

      // user_reputation_log
      logger.info('Creating user_reputation_log table...');
      await tx.execute(sql`
        CREATE TABLE IF NOT EXISTS user_reputation_log (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
          achievement_id INTEGER REFERENCES reputation_achievements(id) ON DELETE SET NULL,
          reputation_earned INTEGER NOT NULL,
          reason VARCHAR(255),
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      await tx.execute(sql`CREATE INDEX IF NOT EXISTS idx_user_reputation ON user_reputation_log (user_id, created_at);`);

      // Seed default achievements (optional, safe for idempotent insert)
      logger.info('Seeding default reputation achievements...');
      await tx.execute(sql`
        INSERT INTO reputation_achievements (achievement_key, name, description, reputation_reward, criteria_type, criteria_value)
        VALUES
          ('first_viral_thread', 'Gone Viral', 'Your thread received 100+ likes', 500, 'thread_likes', 100),
          ('community_favorite', 'Community Favorite', 'Received 1000 total likes', 1000, 'total_likes_received', 1000),
          ('premium_supporter', 'Premium Degen', 'Purchased premium membership', 300, 'shop_purchase', NULL)
        ON CONFLICT (achievement_key) DO NOTHING;
      `);
    });
    logger.info('✅ Migration applied: reputation_achievements & user_reputation_log');
  } catch (err) {
    logger.error('❌ Migration failed:', err);
    logger.error('Migration failed: reputation_achievements & user_reputation_log', { err });
    throw err;
  } finally {
    const { pool } = getDb();
    await pool.end();
  }
}

export async function down() {
  logger.info('↩️ Reverting migration: reputation_achievements & user_reputation_log');
  const { db, pool } = getDb();
  try {
    await db.transaction(async (tx) => {
      await tx.execute(sql`DROP TABLE IF EXISTS user_reputation_log;`);
      await tx.execute(sql`DROP TABLE IF EXISTS reputation_achievements;`);
    });
    logger.info('✅ Reverted migration: reputation_achievements & user_reputation_log');
  } catch (err) {
    logger.error('❌ Revert failed:', err);
    logger.error('Revert failed: reputation_achievements & user_reputation_log', { err });
    throw err;
  } finally {
    await pool.end();
  }
} 