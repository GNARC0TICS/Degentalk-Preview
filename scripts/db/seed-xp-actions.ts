import type { HeatEventId } from '@db/types';
import type { ActionId } from '@db/types';
import type { AuditLogId } from '@db/types';
import type { EventId } from '@db/types';
import type { PrefixId } from '@db/types';
import type { MessageId } from '@db/types';
import type { FollowRequestId } from '@db/types';
import type { FriendRequestId } from '@db/types';
import type { NotificationId } from '@db/types';
import type { UnlockId } from '@db/types';
import type { StoreItemId } from '@db/types';
import type { OrderId } from '@db/types';
import type { QuoteId } from '@db/types';
import type { ReplyId } from '@db/types';
import type { DraftId } from '@db/types';
import type { IpLogId } from '@db/types';
import type { ModActionId } from '@db/types';
import type { SessionId } from '@db/types';
import type { BanId } from '@db/types';
import type { VerificationTokenId } from '@db/types';
import type { SignatureItemId } from '@db/types';
import type { ContentId } from '@db/types';
import type { RequestId } from '@db/types';
import type { ZoneId } from '@db/types';
import type { WhaleId } from '@db/types';
import type { VaultLockId } from '@db/types';
import type { VaultId } from '@db/types';
import type { UnlockTransactionId } from '@db/types';
import type { TipId } from '@db/types';
import type { TemplateId } from '@db/types';
import type { TagId } from '@db/types';
import type { SubscriptionId } from '@db/types';
import type { StickerId } from '@db/types';
import type { SettingId } from '@db/types';
import type { RuleId } from '@db/types';
import type { ParentZoneId } from '@db/types';
import type { ParentForumId } from '@db/types';
import type { PackId } from '@db/types';
import type { ModeratorId } from '@db/types';
import type { MentionId } from '@db/types';
import type { ItemId } from '@db/types';
import type { InventoryId } from '@db/types';
import type { GroupId } from '@db/types';
import type { ForumId } from '@db/types';
import type { EntryId } from '@db/types';
import type { EntityId } from '@db/types';
import type { EmojiPackId } from '@db/types';
import type { EditorId } from '@db/types';
import type { CosmeticId } from '@db/types';
import type { AuthorId } from '@db/types';
import type { CoinId } from '@db/types';
import type { CategoryId } from '@db/types';
import type { BackupId } from '@db/types';
import type { AnimationFrameId } from '@db/types';
import type { AirdropId } from '@db/types';
import type { AdminUserId } from '@db/types';
import type { RoomId } from '@db/types';
import type { ConversationId } from '@db/types';
import type { ReportId } from '@db/types';
import type { ReporterId } from '@db/types';
import type { AdminId } from '@db/types';
/**
 * XP Actions Seed Script
 * 
 * Populates the xp_action_settings table with default values
 * 
 * Usage:
 * npx tsx scripts/seed-xp-actions.ts
 */

import { db } from '@db';
import { xpActionSettings, type InsertXpActionSetting } from '@schema/economy/xpActionSettings.ts';
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
    cooldownSec: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null,
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
    cooldownSec: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null,
  },
  {
    action: XP_ACTION.REPLY_RECEIVED,
    baseValue: 3,
    description: 'XP for receiving a reply to post',
    maxPerDay: 50,
    cooldownSec: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null,
  },
  {
    action: XP_ACTION.PROFILE_COMPLETED,
    baseValue: 50,
    description: 'XP for completing your profile',
    maxPerDay: 1,
    cooldownSec: 604800, // One week
  },
  {
    action: XP_ACTION.FRAME_EQUIPPED,
    baseValue: 5,
    description: 'XP for equipping an avatar frame',
    maxPerDay: 50,
    cooldownSec: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null,
  },
  {
    action: 'DICTIONARY_ENTRY_SUBMITTED',
    baseValue: 5,
    description: 'XP for submitting dictionary entry',
    maxPerDay: 20,
    cooldownSec: 10
  },
  {
    action: 'DICTIONARY_ENTRY_APPROVED',
    baseValue: 15,
    description: 'XP for dictionary entry approval',
    maxPerDay: 100,
    cooldownSec: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null
  },
  {
    action: 'DICTIONARY_ENTRY_UPVOTED',
    baseValue: 1,
    description: 'XP when your dictionary entry is upvoted',
    maxPerDay: 200,
    cooldownSec: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null
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
