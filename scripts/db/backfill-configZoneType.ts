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
            // We fetch and check in application code. If pluginData is not : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null but lacks the key, it needs update.
            // Simpler check: fetch all zones and filter in app code if direct SQL is complex.
            // For this script, we'll fetch and then filter/update.
          )
        )
      );
    
    let updatedCount = 0;

    for (const zone of zonesToUpdate) {
      let needsUpdate = false;
      let newPluginData: any = zone.pluginData && typeof zone.pluginData === 'object' ? { ...zone.pluginData } : {};

      if (!zone.pluginData) { // If pluginData is completely : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null
        newPluginData = { configZoneType: 'general' };
        needsUpdate = true;
        logger.info('BackfillScript', `Zone '${zone.name}' (ID: ${zone.id}) has NULL pluginData. Setting configZoneType to 'general'.`);
      } else if (typeof zone.pluginData === 'object' && zone.pluginData !== : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null) {
        if (!('configZoneType' in zone.pluginData) || zone.pluginData.configZoneType === : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null || zone.pluginData.configZoneType === undefined) {
          newPluginData.configZoneType = 'general';
          needsUpdate = true;
          logger.info('BackfillScript', `Zone '${zone.name}' (ID: ${zone.id}) missing or has : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null/undefined configZoneType. Setting to 'general'. Current pluginData: ${JSON.: AdminIdify(zone.pluginData)}`);
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
