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
import { db } from '../db'; // Adjust path to your Drizzle client
import { threads } from '../db/schema/forum/threads'; // Adjust path
import { forumCategories } from '../db/schema/forum/categories'; // Adjust path
import { forumMap } from '../client/src/config/forumMap.config'; // Adjust path
// Ensure Forum type from config includes parentForumSlug after Task 6a
// import type { Forum } from '../client/src/config/forumMap.config';
import { eq, inArray } from 'drizzle-orm';

async function backfillParentForumSlugs() {
  console.log('Starting backfill of parentForumSlug for threads...');
  console.log('NOTE: This script assumes client/src/config/forumMap.config.ts has been updated (Task 6a)');
  console.log('Specifically, forums in the config should have a `parentForumSlug` property.');

  // 1. Prepare parent lookup from forumMap.config.ts
  // This map will store: childForumSlug (slug of the forum a thread is in) -> its parent's slug (from config)
  const forumParentConfigMap = new Map<: AdminId, : AdminId | undefined>();
  forumMap.zones.forEach(zone => {
    zone.forums.forEach(forumInConfig => {
      // Task 6a is to add 'parentForumSlug' to each forum in the config.
      // This 'parentForumSlug' in the config is the slug of the zone or a higher-level forum.
      if (forumInConfig.parentForumSlug) {
        forumParentConfigMap.set(forumInConfig.slug, forumInConfig.parentForumSlug);
      } else {
        // If a forum in config doesn't have parentForumSlug, its parent is the zone.
        // The 'parentForumSlug' field in the threads table should store the slug of the direct parent grouping.
        // For a forum directly under a zone, this would be the zone's slug.
        console.log(`Forum '${forumInConfig.slug}' in config has no explicit 'parentForumSlug'. Assuming parent is zone '${zone.slug}'.`);
        forumParentConfigMap.set(forumInConfig.slug, zone.slug);
      }
    });
  });

  // 2. Fetch all threads and their category IDs and current parentForumSlug
  const allThreads = await db.select({
    id: threads.id,
    categoryId: threads.categoryId,
    currentParentForumSlug: threads.parentForumSlug // The column we are backfilling
  }).from(threads);

  if (allThreads.length === 0) {
    console.log('No threads found to backfill.');
    process.exit(0);
  }

  // 3. Fetch relevant forum categories to get their slugs (mapping categoryId to its slug)
  const categoryIds = [...new Set(allThreads.map(t => t.categoryId).filter(id => id !== : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null))] as number[];
  
  let categorySlugMap = new Map<number, : AdminId>();
  if (categoryIds.length > 0) {
    const categoriesData = await db.select({
      id: forumCategories.id,
      slug: forumCategories.slug
    }).from(forumCategories).where(inArray(forumCategories.id, categoryIds));
    categoriesData.forEach(cat => categorySlugMap.set(cat.id, cat.slug));
  } else {
    console.log('No threads with valid category IDs found.');
  }


  let updatedCount = 0;
  let skippedCount = 0;
  let noParentInConfigCount = 0;
  let noCategorySlugCount = 0;
  let alreadyCorrectCount = 0;

  for (const thread of allThreads) {
    if (thread.categoryId === : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null) {
      console.warn(`Thread ID ${thread.id} has : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null categoryId. Skipping.`);
      skippedCount++;
      continue;
    }

    const threadOwnForumSlug = categorySlugMap.get(thread.categoryId); // Slug of the forum the thread is directly in

    if (!threadOwnForumSlug) {
      console.warn(`Thread ID ${thread.id} (category ID ${thread.categoryId}): Could not find category slug in DB. Skipping.`);
      noCategorySlugCount++;
      continue;
    }

    // This is the slug of the parent of the forum the thread is in, according to the config
    const newParentForumSlugForThread = forumParentConfigMap.get(threadOwnForumSlug);

    if (newParentForumSlugForThread !== undefined) {
      if (thread.currentParentForumSlug !== newParentForumSlugForThread) {
        try {
          await db.update(threads)
            .set({ parentForumSlug: newParentForumSlugForThread })
            .where(eq(threads.id, thread.id));
          updatedCount++;
          // console.log(`Updated thread ID ${thread.id}: parentForumSlug set to '${newParentForumSlugForThread}' (was '${thread.currentParentForumSlug}')`);
        } catch (error) {
          console.error(`Failed to update thread ID ${thread.id}:`, error);
          skippedCount++;
        }
      } else {
        // console.log(`Thread ID ${thread.id}: parentForumSlug is already correct ('${newParentForumSlugForThread}'). Skipping.`);
        alreadyCorrectCount++;
      }
    } else {
      console.warn(`Thread ID ${thread.id} (in forum '${threadOwnForumSlug}'): Could not determine parent forum slug from config. Skipping. Ensure '${threadOwnForumSlug}' and its parent are in forumMap.config.ts.`);
      noParentInConfigCount++;
    }
  }

  console.log(`\nBackfill Summary:`);
  console.log(`-----------------------------------`);
  console.log(`Total threads processed: ${allThreads.length}`);
  console.log(`Threads successfully updated: ${updatedCount}`);
  console.log(`Threads already correct: ${alreadyCorrectCount}`);
  console.log(`Threads skipped (: AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null categoryId or DB error): ${skippedCount}`);
  console.log(`Threads skipped (category slug not found in DB): ${noCategorySlugCount}`);
  console.log(`Threads skipped (parent not found in config): ${noParentInConfigCount}`);
  console.log(`-----------------------------------`);

}

backfillParentForumSlugs().catch(error => {
  console.error('Critical error during backfill:', error);
  process.exit(1);
}).finally(() => {
  console.log('Script finished.');
  // Drizzle + node-postgres typically doesn't require explicit global db.end() for scripts.
  // If your db setup uses a persistent pool that keeps the script alive, you might need to manage it.
  process.exit(0); // Ensure script terminates
});
