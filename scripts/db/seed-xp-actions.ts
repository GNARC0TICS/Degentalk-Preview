/**
 * XP Actions Seed Script
 * 
 * Populates the xp_action_settings table with default values
 * 
 * Usage:
 * npx tsx scripts/seed-xp-actions.ts
 */

import { db } from '../../server/src/core/db';
import { xpActionSettings, type InsertXpActionSetting } from './utils/schema';
import { XP_ACTION } from '../../server/src/domains/xp/xp-actions';
import { eq } from 'drizzle-orm';

const DEFAULT_XP_ACTIONS = [
  {
    action: XP_ACTION.POST_CREATED,
    baseValue: 10,
    description: 'XP for creating a post',
    maxPerDay: 100,
    cooldownSec: 10,
  },
  {
    action: XP_ACTION.THREAD_CREATED,
    baseValue: 30,
    description: 'XP for starting a thread',
    maxPerDay: 10,
    cooldownSec: 60,
  },
  {
    action: XP_ACTION.RECEIVED_LIKE,
    baseValue: 5,
    description: 'XP for receiving a like',
    maxPerDay: 50,
    cooldownSec: null,
  },
  {
    action: XP_ACTION.DAILY_LOGIN,
    baseValue: 5,
    description: 'XP for daily login',
    maxPerDay: 1,
    cooldownSec: 86400, // 24 hours
  },
  {
    action: XP_ACTION.USER_MENTIONED,
    baseValue: 2,
    description: 'XP for mentioning another user',
    maxPerDay: 20,
    cooldownSec: null,
  },
  {
    action: XP_ACTION.REPLY_RECEIVED,
    baseValue: 3,
    description: 'XP for receiving a reply to post',
    maxPerDay: 50,
    cooldownSec: null,
  },
  {
    action: XP_ACTION.PROFILE_COMPLETED,
    baseValue: 50,
    description: 'XP for completing your profile',
    maxPerDay: 1,
    cooldownSec: 604800, // One week
  },
];

export async function seedXpActions() {
  console.log('🌱 [SEED-XP-ACTIONS] Seeding XP action settings...');
  let seededCount = 0;
  let skippedCount = 0;
  
  try {
    for (const config of DEFAULT_XP_ACTIONS) {
      const existingAction = await db
        .select()
        .from(xpActionSettings)
        .where(eq(xpActionSettings.action, config.action))
        .limit(1)
        .execute(); // drizzle-orm v0.29+ uses .execute()
      
      if (existingAction.length === 0) {
        await db.insert(xpActionSettings).values({
          action: config.action,
          baseValue: config.baseValue,
          description: config.description,
          maxPerDay: config.maxPerDay,
          cooldownSec: config.cooldownSec,
          enabled: true,
        } as InsertXpActionSetting).execute(); // drizzle-orm v0.29+ uses .execute()
        console.log(`✅ [SEED-XP-ACTIONS] Seeded XP action: ${config.action}`);
        seededCount++;
      } else {
        console.log(`⏭️ [SEED-XP-ACTIONS] Skipped existing XP action: ${config.action}`);
        skippedCount++;
      }
    }
    
    console.log('🎉 [SEED-XP-ACTIONS] XP action settings seeded successfully!');
    console.log(`ℹ️ [SEED-XP-ACTIONS] Summary: ${seededCount} actions seeded, ${skippedCount} skipped.`);

  } catch (error) {
    console.error('❌ [SEED-XP-ACTIONS] Error seeding XP action settings:', error);
    console.log(`ℹ️ [SEED-XP-ACTIONS] Summary (before error): ${seededCount} actions seeded, ${skippedCount} skipped.`);
    throw error; // Re-throw to allow process.exit(1)
  }
}

/* Removed standalone execution block
seedXpActions().then(() => {
  console.log("✅ [SEED-XP-ACTIONS] Script finished.");
  process.exit(0);
}).catch(error => {
  console.error('💥 [SEED-XP-ACTIONS] Fatal error during seeding:', error);
  process.exit(1);
});
*/ 