// WALLET FINALIZATION ON HOLD - Do not prioritize wallet-related features.

import { users, userGroups } from '@schema';
import { eq } from "drizzle-orm";
import { pool } from '@db';
import * as crypto from "crypto";
import { logger } from "../src/core/logger";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

export async function seedDevUser() {
  console.log("👤 [SEED-DEV-USER] Starting dev user seeding process...");
  try {
    // Ensure default admin group (group_id = 1) exists
    const groupCheck = await pool.query(`SELECT group_id FROM user_groups WHERE group_id = 1`);
    if (groupCheck.rows.length === 0) {
      // Using 'name' as per shared/schema.ts for the group's name.
      await pool.query(`
        INSERT INTO user_groups (group_id, name, permissions) 
        VALUES (1, 'Administrators', '{"admin": true, "default": false, "isStaff": true, "isAdmin": true}') 
        ON CONFLICT (group_id) DO NOTHING
      `);
      console.log("✅ [SEED-DEV-USER] Ensured default admin group (ID: 1) exists.");
      logger.info("USER_SEED", "✅ Ensured default admin group (ID: 1) exists.");
    }

    const existingResult = await pool.query(
      `SELECT user_id FROM users WHERE username = 'DevUser'`
    );

    if (existingResult.rows.length === 0) {
      const result = await pool.query(`
        INSERT INTO users (
          username,
          email,
          password_hash,
          uuid,
          group_id,
          level,
          xp,
          is_active,
          is_banned,
          is_verified,
          avatar_url,
          role,
          created_at
        ) VALUES (
          'DevUser',
          'dev@degen.io',
          'mocked_hash',
          '${crypto.randomUUID()}',
          1,
          99,
          9999,
          true,
          false,
          true,
          '/images/avatars/default.png',
          'admin',
          NOW()
        ) RETURNING user_id
      `);

      const userId = result.rows[0]?.user_id;
      if (userId) {
        console.log(`✅ [SEED-DEV-USER] DevUser seeded successfully with ID: ${userId}`);
        logger.info("USER_SEED", `✅ DevUser seeded with ID: ${userId}`);
      } else {
        console.error("❌ [SEED-DEV-USER] Failed to seed DevUser, no ID returned.");
        logger.error("USER_SEED", "❌ Failed to seed DevUser, no ID returned.");
      }
    } else {
      const userId = existingResult.rows[0]?.user_id;
      console.log(`⏭️ [SEED-DEV-USER] DevUser already exists with ID: ${userId}. Skipped.`);
      logger.info("USER_SEED", `ℹ️ DevUser already exists with ID: ${userId}`);
    }
  } catch (error) {
    console.error("❌ [SEED-DEV-USER] Error during dev user seeding:", error);
    logger.error("USER_SEED", "❌ Failed to seed DevUser", error as any);
    throw error;
  }
}

// This script is typically imported and run from server/index.ts during development startup.
// To run standalone (e.g., for testing this script directly):
// Ensure you have tsx and tsconfig-paths installed (npm i -D tsx tsconfig-paths)
// Then run: npx tsx -r tsconfig-paths/register server/utils/seed-dev-user.ts
// (Note: if running standalone, you might need to temporarily add execution call like below)
// /*
// seedDevUser()
//   .then(() => { console.log('[SEED-DEV-USER] Standalone run complete.'); process.exit(0); })
//   .catch((e) => { console.error('[SEED-DEV-USER] Standalone run failed:', e); process.exit(1); });
// */

// Example of how it might be called if run directly (add this if it's ever run standalone)
