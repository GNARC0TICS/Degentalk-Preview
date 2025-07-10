// WALLET FINALIZATION ON HOLD - Do not prioritize wallet-related features.

import { users, roles } from '@schema';
import { eq } from 'drizzle-orm';
import { pool } from '../src/core/db';
import * as crypto from 'crypto';
import { logger } from '../src/core/logger';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

export async function seedDevUser() {
	logger.info({ context: 'SEED_DEV_USER' }, 'Starting dev user seeding process...');
	try {
		// Ensure default admin role (role_id = 1) exists
		const roleCheck = await pool.query(`SELECT role_id FROM roles WHERE role_id = 1`);
		if (roleCheck.rows.length === 0) {
			await pool.query(`
        INSERT INTO roles (role_id, name, slug, is_admin, is_staff, permissions) 
        VALUES (1, 'Administrator', 'admin', true, true, '{"admin": true, "manage_users": true, "manage_content": true}') 
        ON CONFLICT (role_id) DO NOTHING
      `);
			logger.info({ context: 'SEED_DEV_USER' }, 'Ensured default admin role (ID: 1) exists.');
			logger.info({ context: 'USER_SEED' }, '✅ Ensured default admin role (ID: 1) exists.');
		}

		const existingResult = await pool.query(`SELECT user_id FROM users WHERE username = 'DevUser'`);

		if (existingResult.rows.length === 0) {
			const result = await pool.query(`
        INSERT INTO users (
          username,
          email,
          password_hash,
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
				logger.info({ context: 'SEED_DEV_USER', userId }, `DevUser seeded successfully with ID: ${userId}`);
				logger.info({ context: 'USER_SEED', userId }, `✅ DevUser seeded with ID: ${userId}`);
			} else {
				logger.error({ context: 'SEED_DEV_USER' }, 'Failed to seed DevUser, no ID returned.');
				logger.error({ context: 'USER_SEED' }, '❌ Failed to seed DevUser, no ID returned.');
			}
		} else {
			const userId = existingResult.rows[0]?.user_id;
			logger.info({ context: 'SEED_DEV_USER', userId }, `DevUser already exists with ID: ${userId}. Skipped.`);
			logger.info({ context: 'USER_SEED', userId }, `ℹ️ DevUser already exists with ID: ${userId}`);
		}
	} catch (error) {
		logger.error({ context: 'SEED_DEV_USER', err: error }, 'Error during dev user seeding');
		logger.error({ context: 'USER_SEED', err: error }, '❌ Failed to seed DevUser');
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
