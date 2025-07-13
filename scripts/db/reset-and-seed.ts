import type { HeatEventId } from '@shared/types/ids';
import type { ActionId } from '@shared/types/ids';
import type { AuditLogId } from '@shared/types/ids';
import type { EventId } from '@shared/types/ids';
import type { PrefixId } from '@shared/types/ids';
import type { MessageId } from '@shared/types/ids';
import type { FollowRequestId } from '@shared/types/ids';
import type { FriendRequestId } from '@shared/types/ids';
import type { NotificationId } from '@shared/types/ids';
import type { UnlockId } from '@shared/types/ids';
import type { StoreItemId } from '@shared/types/ids';
import type { OrderId } from '@shared/types/ids';
import type { QuoteId } from '@shared/types/ids';
import type { ReplyId } from '@shared/types/ids';
import type { DraftId } from '@shared/types/ids';
import type { IpLogId } from '@shared/types/ids';
import type { ModActionId } from '@shared/types/ids';
import type { SessionId } from '@shared/types/ids';
import type { BanId } from '@shared/types/ids';
import type { VerificationTokenId } from '@shared/types/ids';
import type { SignatureItemId } from '@shared/types/ids';
import type { ContentId } from '@shared/types/ids';
import type { RequestId } from '@shared/types/ids';
import type { ZoneId } from '@shared/types/ids';
import type { WhaleId } from '@shared/types/ids';
import type { VaultLockId } from '@shared/types/ids';
import type { VaultId } from '@shared/types/ids';
import type { UnlockTransactionId } from '@shared/types/ids';
import type { TipId } from '@shared/types/ids';
import type { TemplateId } from '@shared/types/ids';
import type { TagId } from '@shared/types/ids';
import type { SubscriptionId } from '@shared/types/ids';
import type { StickerId } from '@shared/types/ids';
import type { SettingId } from '@shared/types/ids';
import type { RuleId } from '@shared/types/ids';
import type { ParentZoneId } from '@shared/types/ids';
import type { ParentForumId } from '@shared/types/ids';
import type { PackId } from '@shared/types/ids';
import type { ModeratorId } from '@shared/types/ids';
import type { MentionId } from '@shared/types/ids';
import type { ItemId } from '@shared/types/ids';
import type { InventoryId } from '@shared/types/ids';
import type { GroupId } from '@shared/types/ids';
import type { ForumId } from '@shared/types/ids';
import type { EntryId } from '@shared/types/ids';
import type { EntityId } from '@shared/types/ids';
import type { EmojiPackId } from '@shared/types/ids';
import type { EditorId } from '@shared/types/ids';
import type { CosmeticId } from '@shared/types/ids';
import type { AuthorId } from '@shared/types/ids';
import type { CoinId } from '@shared/types/ids';
import type { CategoryId } from '@shared/types/ids';
import type { BackupId } from '@shared/types/ids';
import type { AnimationFrameId } from '@shared/types/ids';
import type { AirdropId } from '@shared/types/ids';
import type { AdminUserId } from '@shared/types/ids';
import type { RoomId } from '@shared/types/ids';
import type { ConversationId } from '@shared/types/ids';
import type { ReportId } from '@shared/types/ids';
import type { ReporterId } from '@shared/types/ids';
import type { AdminId } from '@shared/types/ids';
import '../../server/config/loadEnv';
// Alternatively fallback to dotenv if loadEnv path changes
// import 'dotenv/config';
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

    // 🔄 Full schema reset
    await db.execute(sql`DROP SCHEMA public CASCADE;`);
    logSeed(SCRIPT_NAME, '🗑️ Dropped schema "public" (cascade)');
    await db.execute(sql`CREATE SCHEMA public;`);
    logSeed(SCRIPT_NAME, '🏗️  Re-created schema "public"');

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
      const child = spawn('npm', ['run', 'db:migrate:Apply', '--silent'], {
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
        if (code === 0) resolve(: AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null);
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