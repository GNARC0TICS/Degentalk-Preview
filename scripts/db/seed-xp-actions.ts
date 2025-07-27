import { db } from '@db';
import { xpActionSettings, type InsertXpActionSetting } from '../../db/schema/economy/xpActionSettings';
import { eq } from 'drizzle-orm';
import { logger } from '@server/src/core/logger.ts';

// ACTION ENUM – source-of-truth lives in server domain, but re-declare subset here to avoid heavy imports
export enum XP_ACTION {
  POST_CREATED = 'POST_CREATED',
  THREAD_CREATED = 'THREAD_CREATED',
  RECEIVED_LIKE = 'RECEIVED_LIKE',
  DAILY_LOGIN = 'DAILY_LOGIN',
  USER_MENTIONED = 'USER_MENTIONED',
  REPLY_RECEIVED = 'REPLY_RECEIVED',
  PROFILE_COMPLETED = 'PROFILE_COMPLETED',
  FRAME_EQUIPPED = 'FRAME_EQUIPPED',
  DICTIONARY_ENTRY_SUBMITTED = 'DICTIONARY_ENTRY_SUBMITTED',
  DICTIONARY_ENTRY_APPROVED = 'DICTIONARY_ENTRY_APPROVED',
  DICTIONARY_ENTRY_UPVOTED = 'DICTIONARY_ENTRY_UPVOTED'
}

const DEFAULT_XP_ACTIONS: InsertXpActionSetting[] = [
  { action: XP_ACTION.POST_CREATED,                 baseValue: 10,  description: 'XP for creating a post',             maxPerDay: 100, cooldownSec: 10,  enabled: true },
  { action: XP_ACTION.THREAD_CREATED,               baseValue: 30,  description: 'XP for starting a thread',           maxPerDay: 10,  cooldownSec: 60,  enabled: true },
  { action: XP_ACTION.RECEIVED_LIKE,                baseValue: 5,   description: 'XP for receiving a like',            maxPerDay: 50,  cooldownSec: 10,  enabled: true },
  { action: XP_ACTION.DAILY_LOGIN,                  baseValue: 5,   description: 'XP for daily login',                 maxPerDay: 1,   cooldownSec: 86_400, enabled: true },
  { action: XP_ACTION.USER_MENTIONED,               baseValue: 2,   description: 'XP for mentioning another user',    maxPerDay: 20,  cooldownSec: 5,   enabled: true },
  { action: XP_ACTION.REPLY_RECEIVED,               baseValue: 3,   description: 'XP for receiving a reply',          maxPerDay: 50,  cooldownSec: 5,   enabled: true },
  { action: XP_ACTION.PROFILE_COMPLETED,            baseValue: 50,  description: 'XP for completing your profile',     maxPerDay: 1,   cooldownSec: 604_800, enabled: true },
  { action: XP_ACTION.FRAME_EQUIPPED,               baseValue: 5,   description: 'XP for equipping an avatar frame',  maxPerDay: 50,  cooldownSec: 5,   enabled: true },
  { action: XP_ACTION.DICTIONARY_ENTRY_SUBMITTED,   baseValue: 5,   description: 'XP for submitting dictionary entry', maxPerDay: 20,  cooldownSec: 10,  enabled: true },
  { action: XP_ACTION.DICTIONARY_ENTRY_APPROVED,    baseValue: 15,  description: 'XP for dictionary entry approval',   maxPerDay: 100, cooldownSec: 10,  enabled: true },
  { action: XP_ACTION.DICTIONARY_ENTRY_UPVOTED,     baseValue: 1,   description: 'XP when your dictionary entry is up-voted', maxPerDay: 200, cooldownSec: 5, enabled: true }
];

export async function seedXpActions(): Promise<void> {
  logger.info('[SEED-XP-ACTIONS] Seeding XP action settings...');

  for (const action of DEFAULT_XP_ACTIONS) {
    await db
      .insert(xpActionSettings)
      .values(action)
      .onConflictDoUpdate({ target: xpActionSettings.action, set: action })
      .execute();
  }

  logger.info('[SEED-XP-ACTIONS] Done');
}

if (process.argv[1] && process.argv[1].endsWith('seed-xp-actions.ts')) {
  seedXpActions().then(() => process.exit(0)).catch((e) => {
    logger.error('[SEED-XP-ACTIONS] Error:', e);
    process.exit(1);
  });
}
