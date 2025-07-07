/* eslint-disable @typescript-eslint/no-unused-vars */
import { sql } from "drizzle-orm";
import { db } from '../src/core/db';
import { xpActionSettings } from "../../shared/schema";
import { logger } from "../src/core/logger";

export async function up() {
  logger.info('Running migration: Create XP action settings table');

  await db.execute(sql`
    -- Create the xp_action_settings table for storing configurable XP action values
    CREATE TABLE IF NOT EXISTS xp_action_settings (
      action TEXT PRIMARY KEY,
      base_value INTEGER NOT NULL,
      description TEXT NOT NULL,
      max_per_day INTEGER,
      cooldown_sec INTEGER,
      enabled BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    
    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_xp_action_settings_enabled ON xp_action_settings(enabled);
  `);
}

export async function down() {
  logger.info('Reverting migration: Create XP action settings table');
  
  await db.execute(sql`
    DROP TABLE IF EXISTS xp_action_settings;
  `);
} 