import { db } from '@db';
import { logSeed } from './utils/seedUtils';
import { seedXpActions } from './seed-xp-actions';
import { seedBadges } from './seed-badges';
import { seedTreasurySettings } from './seed-treasury';
import { seedVaults } from './seed-vaults';
import { sql } from 'drizzle-orm';
import * as schema from './utils/schema';

// Dynamically import child_process to avoid 'require is not defined' error
// const { exec } = await import('child_process');

// Import other seed functions as they are created
// e.g., import { seedUsers } from './seed-users';

const SCRIPT_NAME = 'reset-and-seed';

async function main() {
  logSeed(SCRIPT_NAME, 'Starting database reset and seed process...');

  const quickMode = process.argv.includes('--quick');
  if (quickMode) {
    logSeed(SCRIPT_NAME, 'Running in --quick mode. Some seeds might be skipped.');
  }

  try {
    logSeed(SCRIPT_NAME, 'Starting database cleanup...');

    // Drop tables that are being re-created or significantly altered in new migrations
    await db.execute(sql`DROP TABLE IF EXISTS admin_manual_airdrop_logs CASCADE;`);
    logSeed(SCRIPT_NAME, '🗑️ Dropped admin_manual_airdrop_logs (if exists)');
    await db.execute(sql`DROP TABLE IF EXISTS inventory_transaction_links CASCADE;`);
    logSeed(SCRIPT_NAME, '🗑️ Dropped inventory_transaction_links (if exists)');
    await db.execute(sql`DROP TABLE IF EXISTS user_inventory CASCADE;`);
    logSeed(SCRIPT_NAME, '🗑️ Dropped user_inventory (if exists)');
    await db.execute(sql`DROP TABLE IF EXISTS platform_treasury_settings CASCADE;`);
    logSeed(SCRIPT_NAME, '🗑️ Dropped platform_treasury_settings (if exists)');
    await db.execute(sql`DROP TABLE IF EXISTS thread_feature_permissions CASCADE;`);
    logSeed(SCRIPT_NAME, '🗑️ Dropped thread_feature_permissions (if exists)');
    await db.execute(sql`DROP TABLE IF EXISTS notifications CASCADE;`);
    logSeed(SCRIPT_NAME, '🗑️ Dropped notifications (if exists)');
    await db.execute(sql`DROP TABLE IF EXISTS post_reactions CASCADE;`);
    logSeed(SCRIPT_NAME, '🗑️ Dropped post_reactions (if exists)');
    await db.execute(sql`DROP TYPE IF EXISTS reaction_type CASCADE;`);
    logSeed(SCRIPT_NAME, '🗑️ Dropped reaction_type enum (if exists)');

    // Existing DELETE statements for seeded tables (commented out as drops handle full reset)
    // await db.delete(schema.xpActionSettings);
    // logSeed(SCRIPT_NAME, '🧼 Cleaned xp_action_settings');
    // await db.delete(schema.badges);
    // logSeed(SCRIPT_NAME, '🧼 Cleaned badges');
    // await db.delete(schema.platformTreasurySettings);
    // logSeed(SCRIPT_NAME, '🧼 Cleaned platform_treasury_settings');
    // await db.delete(schema.vaults);
    // logSeed(SCRIPT_NAME, '🧼 Cleaned vaults');
    logSeed(SCRIPT_NAME, '✅ Database cleanup complete.');

    // Apply migrations after cleanup but before seeding
    logSeed(SCRIPT_NAME, 'Applying database migrations...');
    const { spawn } = await import('child_process');
    await new Promise((resolve, reject) => {
      const child = spawn('npm', ['run', 'db:migrate:apply', '--silent'], {
        stdio: 'inherit',
        env: process.env,
      });

      child.on('close', (code: number) => {
        if (code === 0) {
          logSeed(SCRIPT_NAME, '✅ Database migrations applied.');
          resolve(null);
        } else {
          reject(new Error(`Migration process exited with code ${code}`));
        }
      });

      child.on('error', (err: Error) => {
        reject(err);
      });
    });
    logSeed(SCRIPT_NAME, '✅ Database migrations promise successfully completed and resolved.');

    await seedXpActions();
    await seedBadges();
    await seedTreasurySettings();
    await seedVaults();
    // Seed Zones & Forums using canonical config-driven seeder
    logSeed(SCRIPT_NAME, 'Seeding forum zones & forums from forumMap.config...');
    await new Promise((resolve, reject) => {
      const child = spawn('tsx', ['scripts/seed/seedForumsFromConfig.ts'], {
        stdio: 'inherit',
        env: process.env,
      });
      child.on('close', (code: number) => {
        if (code === 0) resolve(null);
        else reject(new Error(`Forum seeder exited with code ${code}`));
      });
      child.on('error', reject);
    });
    logSeed(SCRIPT_NAME, '✅ Forum structure seeded via seedForumsFromConfig');
    // Add calls to other seed functions here
    // if (!quickMode) { await seedSomeLargeTestData(); }

    logSeed(SCRIPT_NAME, '🎉 All seed scripts completed successfully!');
    process.exit(0);
  } catch (error) {
    logSeed(SCRIPT_NAME, `💀 Fatal error during seeding: ${(error as Error).message}`, true);
    console.error(error);
    process.exit(1);
  }
}

main(); 