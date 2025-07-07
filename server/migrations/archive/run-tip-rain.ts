import dotenv from 'dotenv';
dotenv.config();

import { runTipRainMigration } from './tip-rain-features';
import { logger } from "./src/core/logger";

// ARCHIVE: This was a one-off runner for the tip/rain migration. No longer used in active migration flow.
// TODO: Do not use in production. Kept for reference only.

// Run just the tip-rain migration
runTipRainMigration()
  .then((success) => {
    if (success) {
      logger.info('✅ Tip & Rain migration completed successfully');
      process.exit(0);
    } else {
      console.error('❌ Migration process failed');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Unhandled error in migration process:', error);
    process.exit(1);
  }); 