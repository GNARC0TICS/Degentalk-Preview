
import { db } from '../../db';
import { forumCategories } from '../../db/schema';
import { eq, and, isNull, or, sql } from 'drizzle-orm';
import { logger } from '../../server/src/core/logger'; // Assuming logger is accessible
import chalk from 'chalk';

async function backfillConfigZoneType() {
  logger.info('BackfillScript', 'Starting backfill for configZoneType in forum_categories...');

  try {
    const zonesToUpdate = await db
      .select({
        id: forumCategories.id,
        name: forumCategories.name,
        slug: forumCategories.slug,
        pluginData: forumCategories.pluginData,
      })
      .from(forumCategories)
      .where(
        and(
          eq(forumCategories.type, 'zone'),
          or(
            isNull(forumCategories.pluginData),
            // Check if pluginData is a JSONB object that does NOT contain the key 'configZoneType'
            // Drizzle/Postgres specific way to check for key in JSONB: (plugin_data->>'configZoneType') IS NULL
            // For a more general check or if direct JSON operators are tricky in Drizzle without raw SQL:
            // We fetch and check in application code. If pluginData is not null but lacks the key, it needs update.
            // Simpler check: fetch all zones and filter in app code if direct SQL is complex.
            // For this script, we'll fetch and then filter/update.
          )
        )
      );
    
    let updatedCount = 0;

    for (const zone of zonesToUpdate) {
      let needsUpdate = false;
      let newPluginData: any = zone.pluginData && typeof zone.pluginData === 'object' ? { ...zone.pluginData } : {};

      if (!zone.pluginData) { // If pluginData is completely null
        newPluginData = { configZoneType: 'general' };
        needsUpdate = true;
        logger.info('BackfillScript', `Zone '${zone.name}' (ID: ${zone.id}) has NULL pluginData. Setting configZoneType to 'general'.`);
      } else if (typeof zone.pluginData === 'object' && zone.pluginData !== null) {
        if (!('configZoneType' in zone.pluginData) || zone.pluginData.configZoneType === null || zone.pluginData.configZoneType === undefined) {
          newPluginData.configZoneType = 'general';
          needsUpdate = true;
          logger.info('BackfillScript', `Zone '${zone.name}' (ID: ${zone.id}) missing or has null/undefined configZoneType. Setting to 'general'. Current pluginData: ${JSON.stringify(zone.pluginData)}`);
        } else if (zone.pluginData.configZoneType !== 'primary' && zone.pluginData.configZoneType !== 'general') {
          // It has a configZoneType, but it's not valid
          logger.warn('BackfillScript', `Zone '${zone.name}' (ID: ${zone.id}) has invalid configZoneType: '${zone.pluginData.configZoneType}'. Setting to 'general'.`);
          newPluginData.configZoneType = 'general';
          needsUpdate = true;
        }
      } else {
        // pluginData is not an object or is some other unexpected type, treat as needing default
        logger.warn('BackfillScript', `Zone '${zone.name}' (ID: ${zone.id}) has unexpected pluginData type: ${typeof zone.pluginData}. Setting configZoneType to 'general'.`);
        newPluginData = { configZoneType: 'general' };
        needsUpdate = true;
      }

      if (needsUpdate) {
        await db
          .update(forumCategories)
          .set({ pluginData: newPluginData })
          .where(eq(forumCategories.id, zone.id));
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      logger.info('BackfillScript', chalk.green(`Successfully updated ${updatedCount} zones with default configZoneType.`));
    } else {
      logger.info('BackfillScript', chalk.blue('No zones required updates for configZoneType. Data is clean.'));
    }

  } catch (error) {
    logger.error('BackfillScript', 'Error during configZoneType backfill:', { 
      err: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    console.error(chalk.red('Backfill process failed:'), error);
    process.exit(1);
  }
}

// Execute the backfill
(async () => {
  try {
    await backfillConfigZoneType();
    process.exit(0);
  } catch (err) {
    console.error(chalk.red("Execution failed:"), err);
    process.exit(1);
  }
})();
