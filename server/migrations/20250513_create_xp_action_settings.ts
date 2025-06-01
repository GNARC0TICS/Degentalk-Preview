import { sql } from "drizzle-orm";
import { db } from "../src/core/db";
import { xpActionSettings } from "../../shared/schema";

export async function up() {
  console.log('Running migration: Create XP action settings table');

  await sql`
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
  `;
}

export async function down() {
  console.log('Reverting migration: Create XP action settings table');
  
  await sql`
    DROP TABLE IF EXISTS xp_action_settings;
  `;
} 