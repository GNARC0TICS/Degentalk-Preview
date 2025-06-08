// WALLET FINALIZATION ON HOLD - Do not prioritize wallet-related features.

import { db } from '@db';
import { economySettings } from '@schema';
import { eq } from 'drizzle-orm'; // Import eq for precise updates

const defaultSettings = [
  { key: 'xp_per_post', value: 3 },
  { key: 'xp_per_reply', value: 2 },
  { key: 'clout_per_upvote', value: 1 }, 
  { key: 'clout_per_helpful', value: 2 },
  { key: 'clout_max_cap', value: 999 },
];

export async function seedEconomySettings() {
  console.log('⚙️ [SEED-ECONOMY] Seeding economy settings...');
  let seededCount = 0;
  let updatedCount = 0;

  try {
    for (const setting of defaultSettings) {
      const existing = await db.select().from(economySettings).where(eq(economySettings.key, setting.key)).limit(1).execute();
      if (existing.length === 0) {
        await db.insert(economySettings).values(setting).execute();
        console.log(`✅ [SEED-ECONOMY] Seeded new setting: ${setting.key} = ${setting.value}`);
        seededCount++;
      } else if (existing[0].value !== setting.value) {
        await db.update(economySettings).set({ value: setting.value }).where(eq(economySettings.key, setting.key)).execute();
        console.log(`🔄 [SEED-ECONOMY] Updated setting: ${setting.key} from ${existing[0].value} to ${setting.value}`);
        updatedCount++;
      } else {
        console.log(`⏭️ [SEED-ECONOMY] Skipped existing setting (no change): ${setting.key} = ${setting.value}`);
        // Optionally count these as skipped if needed for summary
      }
    }
    console.log('🎉 [SEED-ECONOMY] Economy settings seeding completed.');
    console.log(`ℹ️ [SEED-ECONOMY] Summary: ${seededCount} settings newly seeded, ${updatedCount} settings updated.`);

  } catch (err) {
    console.error('❌ [SEED-ECONOMY] Seeding failed:', err);
    console.log(`ℹ️ [SEED-ECONOMY] Partial Summary (before error): ${seededCount} settings newly seeded, ${updatedCount} settings updated.`);
    throw err; // Re-throw
  }
}

/* Removed standalone execution block
seed().then(() => {
  console.log("✅ [SEED-ECONOMY] Script finished.");
  process.exit(0);
}).catch((err) => {
  console.error('💥 [SEED-ECONOMY] Fatal error during seeding:', err);
  process.exit(1);
});
*/
