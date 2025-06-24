import { drizzle } from 'drizzle-orm/node-postgres';
import pgPkg from 'pg';
import { sql } from 'drizzle-orm';
import { config } from 'dotenv';

config();

const getDb = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL env var not set');
  }
  const pool = new pgPkg.Pool({ connectionString: process.env.DATABASE_URL });
  return { db: drizzle(pool), pool };
};

export async function up() {
  console.log('🚀 20250624 ‑ Add visual fields to levels');
  const { db, pool } = getDb();

  try {
    await db.transaction(async (tx) => {
      // 1. Add new columns (NO lock by using IF NOT EXISTS)
      await tx.execute(
        sql`ALTER TABLE levels ADD COLUMN IF NOT EXISTS icon_url VARCHAR(255);`
      );
      await tx.execute(
        sql`ALTER TABLE levels ADD COLUMN IF NOT EXISTS rarity VARCHAR(10) DEFAULT 'common';`
      );
      await tx.execute(
        sql`ALTER TABLE levels ADD COLUMN IF NOT EXISTS frame_url VARCHAR(255);`
      );
      await tx.execute(
        sql`ALTER TABLE levels ADD COLUMN IF NOT EXISTS color_theme VARCHAR(25);`
      );
      await tx.execute(
        sql`ALTER TABLE levels ADD COLUMN IF NOT EXISTS animation_effect VARCHAR(30);`
      );
      await tx.execute(
        sql`ALTER TABLE levels ADD COLUMN IF NOT EXISTS unlocks JSONB DEFAULT '{}'::jsonb NOT NULL;`
      );

      // 2. Back-fill defaults for existing rows
      // rarity
      await tx.execute(sql`UPDATE levels SET rarity = 'common' WHERE rarity IS NULL;`);

      // unlocks already defaulted, but ensure not null
      await tx.execute(sql`UPDATE levels SET unlocks = '{}'::jsonb WHERE unlocks IS NULL;`);

      // color_theme mapping based on existing procedural colour logic
      await tx.execute(sql`UPDATE levels SET color_theme = 'emerald' WHERE color_theme IS NULL AND level < 10;`);
      await tx.execute(sql`UPDATE levels SET color_theme = 'cyan' WHERE color_theme IS NULL AND level >= 10 AND level < 25;`);
      await tx.execute(sql`UPDATE levels SET color_theme = 'purple' WHERE color_theme IS NULL AND level >= 25 AND level < 50;`);
      await tx.execute(sql`UPDATE levels SET color_theme = 'amber' WHERE color_theme IS NULL AND level >= 50;`);

      // Add comment on min_xp column for future aliasing (Postgres COMMENT)
      await tx.execute(
        sql`COMMENT ON COLUMN levels.min_xp IS 'Total cumulative XP required to reach this level (alias xp_required planned)';`
      );
    });

    console.log('✅ Migration applied: visual fields added to levels');
  } finally {
    (await getDb()).pool.end();
  }
}

export async function down() {
  console.log('↩️  Reverting 20250624 visual fields migration');
  const { db, pool } = getDb();
  try {
    await db.transaction(async (tx) => {
      await tx.execute(sql`ALTER TABLE levels DROP COLUMN IF EXISTS unlocks;`);
      await tx.execute(sql`ALTER TABLE levels DROP COLUMN IF EXISTS animation_effect;`);
      await tx.execute(sql`ALTER TABLE levels DROP COLUMN IF EXISTS color_theme;`);
      await tx.execute(sql`ALTER TABLE levels DROP COLUMN IF EXISTS frame_url;`);
      await tx.execute(sql`ALTER TABLE levels DROP COLUMN IF EXISTS rarity;`);
      await tx.execute(sql`ALTER TABLE levels DROP COLUMN IF EXISTS icon_url;`);
    });
    console.log('✅ Reverted 20250624 migration');
  } finally {
    (await getDb()).pool.end();
  }
} 