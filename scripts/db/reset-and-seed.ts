import { db } from '../../server/src/core/db';
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
    const { exec } = await import('child_process');
    await new Promise((resolve, reject) => {
      // Increased maxBuffer and added a timeout
      const child = exec('npm run db:migrate:apply', { maxBuffer: 1024 * 500, timeout: 120000 }, (error: any, stdout: any, stderr: any) => {
        console.log('exec callback invoked.');
        if (error) {
          console.error(`exec error: ${error}`);
          logSeed(SCRIPT_NAME, `❌ Error applying migrations: ${error.message}`, true);
          reject(error);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          logSeed(SCRIPT_NAME, `⚠️ Stderr during migrations: ${stderr}`, true);
        }
        logSeed(SCRIPT_NAME, `stdout: ${stdout}`);
        logSeed(SCRIPT_NAME, '✅ Database migrations applied successfully within exec callback.');
        resolve(null);
      });

      child.on('close', (code: number) => {
        console.log(`child process exited with code ${code}`);
        if (code !== 0) {
          reject(new Error(`Migration process exited with non-zero code ${code}`));
        }
      });

      child.on('error', (err: Error) => {
        console.error(`child process failed to start or encountered an error: ${err.message}`);
        reject(err);
      });

    });
    logSeed(SCRIPT_NAME, '✅ Database migrations promise resolved.');

    await seedXpActions();
    await seedBadges();
    await seedTreasurySettings();
    await seedVaults();
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