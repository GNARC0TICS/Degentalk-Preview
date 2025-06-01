import { db } from '../../server/src/core/db';
import { logSeed } from './utils/seedUtils';
import { seedXpActions } from './seed-xp-actions';
import { seedBadges } from './seed-badges';
import { seedTreasurySettings } from './seed-treasury';
import { seedVaults } from './seed-vaults';
import { sql } from 'drizzle-orm';
import * as schema from './utils/schema';
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

    await db.delete(schema.xpActionSettings);
    logSeed(SCRIPT_NAME, '🧼 Cleaned xp_action_settings');
    await db.delete(schema.badges);
    logSeed(SCRIPT_NAME, '🧼 Cleaned badges');
    await db.delete(schema.platformTreasurySettings);
    logSeed(SCRIPT_NAME, '🧼 Cleaned platform_treasury_settings');
    await db.delete(schema.vaults);
    logSeed(SCRIPT_NAME, '🧼 Cleaned vaults');
    // Add other tables to clean if necessary, respecting foreign key constraints
    logSeed(SCRIPT_NAME, '✅ Database cleanup complete.');

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