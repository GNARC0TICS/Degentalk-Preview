import type { HeatEventId } from '@shared/types';
import type { ActionId } from '@shared/types';
import type { AuditLogId } from '@shared/types';
import type { EventId } from '@shared/types';
import type { PrefixId } from '@shared/types';
import type { MessageId } from '@shared/types';
import type { FollowRequestId } from '@shared/types';
import type { FriendRequestId } from '@shared/types';
import type { NotificationId } from '@shared/types';
import type { UnlockId } from '@shared/types';
import type { StoreItemId } from '@shared/types';
import type { OrderId } from '@shared/types';
import type { QuoteId } from '@shared/types';
import type { ReplyId } from '@shared/types';
import type { DraftId } from '@shared/types';
import type { IpLogId } from '@shared/types';
import type { ModActionId } from '@shared/types';
import type { SessionId } from '@shared/types';
import type { BanId } from '@shared/types';
import type { VerificationTokenId } from '@shared/types';
import type { SignatureItemId } from '@shared/types';
import type { ContentId } from '@shared/types';
import type { RequestId } from '@shared/types';
import type { ZoneId } from '@shared/types';
import type { WhaleId } from '@shared/types';
import type { VaultLockId } from '@shared/types';
import type { VaultId } from '@shared/types';
import type { UnlockTransactionId } from '@shared/types';
import type { TipId } from '@shared/types';
import type { TemplateId } from '@shared/types';
import type { TagId } from '@shared/types';
import type { SubscriptionId } from '@shared/types';
import type { StickerId } from '@shared/types';
import type { SettingId } from '@shared/types';
import type { RuleId } from '@shared/types';
import type { ParentZoneId } from '@shared/types';
import type { ParentForumId } from '@shared/types';
import type { PackId } from '@shared/types';
import type { ModeratorId } from '@shared/types';
import type { MentionId } from '@shared/types';
import type { ItemId } from '@shared/types';
import type { InventoryId } from '@shared/types';
import type { GroupId } from '@shared/types';
import type { ForumId } from '@shared/types';
import type { EntryId } from '@shared/types';
import type { EntityId } from '@shared/types';
import type { EmojiPackId } from '@shared/types';
import type { EditorId } from '@shared/types';
import type { CosmeticId } from '@shared/types';
import type { AuthorId } from '@shared/types';
import type { CoinId } from '@shared/types';
import type { CategoryId } from '@shared/types';
import type { BackupId } from '@shared/types';
import type { AnimationFrameId } from '@shared/types';
import type { AirdropId } from '@shared/types';
import type { AdminUserId } from '@shared/types';
import type { RoomId } from '@shared/types';
import type { ConversationId } from '@shared/types';
import type { ReportId } from '@shared/types';
import type { ReporterId } from '@shared/types';
import type { AdminId } from '@shared/types';

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
