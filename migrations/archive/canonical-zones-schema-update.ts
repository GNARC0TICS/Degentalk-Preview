import { sql } from "drizzle-orm";
import { db } from "../db";
import { logger } from "../../server/src/core/logger";

/**
 * ForumFusion - Add Canonical Zone Fields Migration
 * 
 * This migration adds support for the new canonical zone structure as defined in
 * docs/forum/implementation-plan-canon-v1.md
 * 
 * Changes:
 * - Add `isZone` column (boolean) to forumCategories
 * - Add `canonical` column (boolean) to forumCategories
 * - Add `colorTheme` column (string) to forumCategories (already exists as 'color')
 * - Add `icon` column (string) to forumCategories (already exists)
 */

export async function up() {
  logger.info("Running migration: Add Canonical Zone Fields");
  
  try {
    // Add isZone column if it doesn't exist
    await db.execute(sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'forum_categories' AND column_name = 'is_zone'
        ) THEN
          ALTER TABLE forum_categories ADD COLUMN is_zone BOOLEAN NOT NULL DEFAULT false;
        END IF;
      END $$;
    `);
    
    // Add canonical column if it doesn't exist
    await db.execute(sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'forum_categories' AND column_name = 'canonical'
        ) THEN
          ALTER TABLE forum_categories ADD COLUMN canonical BOOLEAN NOT NULL DEFAULT false;
        END IF;
      END $$;
    `);
    
    // Re-purpose existing 'color' column as 'colorTheme'
    // Add 'threadsCount', 'postsCount', and 'lastThreadId' columns if they don't exist
    await db.execute(sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'forum_categories' AND column_name = 'threads_count'
        ) THEN
          ALTER TABLE forum_categories ADD COLUMN threads_count INTEGER NOT NULL DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'forum_categories' AND column_name = 'posts_count'
        ) THEN
          ALTER TABLE forum_categories ADD COLUMN posts_count INTEGER NOT NULL DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'forum_categories' AND column_name = 'last_thread_id'
        ) THEN
          ALTER TABLE forum_categories ADD COLUMN last_thread_id TEXT;
        END IF;
      END $$;
    `);
    
    logger.info("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

export async function down() {
  logger.info("Rolling back migration: Add Canonical Zone Fields");
  
  try {
    // Remove added columns
    await db.execute(sql`
      ALTER TABLE forum_categories 
        DROP COLUMN IF EXISTS is_zone,
        DROP COLUMN IF EXISTS canonical,
        DROP COLUMN IF EXISTS threads_count,
        DROP COLUMN IF EXISTS posts_count,
        DROP COLUMN IF EXISTS last_thread_id;
    `);
    
    logger.info("Rollback completed successfully");
  } catch (error) {
    console.error("Rollback failed:", error);
    throw error;
  }
} 