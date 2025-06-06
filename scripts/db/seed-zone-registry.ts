import { db } from '../../db';
import { forumCategories } from '../../db/schema/forum/categories';
import { zoneRegistry, ForumType, ZoneConfig } from '../../client/src/constants/zoneRegistry';
import { sql } from 'drizzle-orm';

async function seedZoneRegistry() {
  console.log('Starting zone registry seeding...');

  const clearTable = process.argv.includes('--clear');

  try {
    await db.transaction(async (tx) => {
      if (clearTable) {
        console.log('Clearing existing data from forumCategories table...');
        await tx.delete(forumCategories);
        console.log('Cleared existing forumCategories.');
      }

      const idMap: Record<string, number> = {};
      let topLevelZonesInserted = 0;
      let subforumsInserted = 0;

      const allZones = Object.values(zoneRegistry);

      // First pass: Insert top-level zones
      console.log('Starting first pass: Inserting top-level zones...');
      for (const zone of allZones) {
        if (!zone.parent_id) {
          const pluginData = {
            seo: zone.seo,
            components: zone.components,
            threadRules: zone.threadRules,
            unrestrictedThreadPerMonth: zone.unrestrictedThreadPerMonth,
            postingLimits: zone.postingLimits,
          };

          const [insertedZone] = await tx
            .insert(forumCategories)
            .values({
              name: zone.name,
              slug: zone.slug_override || zone.slug,
              description: zone.description,
              type: zone.forum_type, // Directly use ForumType enum
              isZone: zone.forum_type === ForumType.Primary,
              position: zone.displayPriority,
              colorTheme: zone.theme,
              isLocked: zone.threadRules?.readOnly === true,
              isVip: zone.slug === 'the-vault', // Example VIP logic
              pluginData: pluginData,
              // Default or stub other fields as per schema
              // color: 'gray', // Default from schema
              // icon: 'hash', // Default from schema
              // isHidden: false, // Default from schema
              // canonical: false, // Default from schema
              // minXp: 0, // Default from schema
            })
            .returning({ id: forumCategories.id });

          if (insertedZone) {
            idMap[zone.id] = insertedZone.id;
            topLevelZonesInserted++;
          } else {
            console.error(`Failed to insert top-level zone: ${zone.name} (ID: ${zone.id})`);
          }
        }
      }
      console.log(`Inserted ${topLevelZonesInserted} top-level zones.`);

      // Second pass: Insert subforums
      console.log('Starting second pass: Inserting subforums...');
      for (const zone of allZones) {
        if (zone.parent_id) {
          const parentDbId = idMap[zone.parent_id];
          if (!parentDbId) {
            console.error(`Error: Parent zone with registry ID '${zone.parent_id}' not found for subforum '${zone.name}'. Skipping.`);
            continue;
          }

          const pluginData = {
            seo: zone.seo,
            components: zone.components,
            threadRules: zone.threadRules,
            unrestrictedThreadPerMonth: zone.unrestrictedThreadPerMonth,
            postingLimits: zone.postingLimits,
          };

          await tx.insert(forumCategories).values({
            name: zone.name,
            slug: zone.slug_override || zone.slug,
            description: zone.description,
            parentId: parentDbId,
            type: zone.forum_type,
            isZone: zone.forum_type === ForumType.Primary, // Subforums of primary zones are still primary type
            position: zone.displayPriority,
            colorTheme: zone.theme,
            isLocked: zone.threadRules?.readOnly === true,
            isVip: false, // Subforums typically don't have separate VIP status from parent
            pluginData: pluginData,
          });
          subforumsInserted++;
        }
      }
      console.log(`Inserted ${subforumsInserted} subforums.`);
    });

    console.log('Zone registry seeding completed successfully.');
  } catch (error) {
    console.error('Zone seeding failed:', error);
    process.exit(1);
  } finally {
    // Ensure the pool is closed if your db setup requires it.
    // For neon serverless, it might not be necessary to explicitly close.
    // await pool.end(); // If using a pool that needs explicit closing
    console.log('Seeding process finished.');
  }
}

seedZoneRegistry();
