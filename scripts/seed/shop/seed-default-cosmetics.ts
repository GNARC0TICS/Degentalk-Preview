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
 * Seed Default Cosmetics
 * Seeds the database with default shop items from the configuration
 */

import { db } from '../../../server/src/core/db';
import { products } from '../../../db/schema/shop/products';
import { defaultShopItems, isUsernameColorItem, isAvatarFrameItem, isUserTitleItem } from '../../../client/src/config/shop-items.config';
import { sql } from 'drizzle-orm';
import { fileURLToPath } from 'url';

export async function seedDefaultCosmetics() {
  console.log('🎨 Seeding default cosmetic shop items...');
  
  let successCount = 0;
  let errorCount = 0;

  for (const item of defaultShopItems) {
    try {
      // Generate a slug from the ID
      const slug = item.id;
      
      // Prepare plugin reward data based on item type
      const pluginReward: any = {
        type: item.type,
        rarity: item.rarity,
        label: item.name
      };

      // Add type-specific data
      if (isUsernameColorItem(item)) {
        pluginReward.value = item.hex;
      } else if (isAvatarFrameItem(item)) {
        pluginReward.cssClass = item.cssClass;
      } else if (isUserTitleItem(item)) {
        pluginReward.titleText = item.titleText;
      }

      // Prepare metadata
      const metadata = {
        rarity: item.rarity,
        type: item.type,
        isAlwaysAvailable: item.isAlwaysAvailable
      };

      // Insert the product
      await db.insert(products).values({
        name: item.name,
        slug: slug,
        description: item.description || `${item.name} - ${item.type}`,
        price: item.price,
        status: 'published',
        pluginReward: pluginReward,
        isDigital: true,
        stockLimit: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null, // Unlimited stock for default items
        metadata: metadata,
        createdAt: sql`now()`,
        updatedAt: sql`now()`
      }).onConflictDoUpdate({
        target: products.slug,
        set: {
          name: item.name,
          description: item.description || `${item.name} - ${item.type}`,
          price: item.price,
          pluginReward: pluginReward,
          metadata: metadata,
          updatedAt: sql`now()`
        }
      });
      
      console.log(`✅ Created/Updated: ${item.name} (${item.type})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to create ${item.name}:`, error);
      errorCount++;
    }
  }
  
  console.log(`\n🎨 Default cosmetics seeding complete!`);
  console.log(`✅ Success: ${successCount} items`);
  console.log(`❌ Errors: ${errorCount} items`);
  console.log(`📦 Total items processed: ${defaultShopItems.length}`);
}

// Main execution (ESM-friendly)
const isExecutedDirectly = process.argv[1] === fileURLToPath(import.meta.url);

if (isExecutedDirectly) {
  seedDefaultCosmetics()
    .then(() => {
      console.log('✨ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

// Export for use in other seed scripts
export default seedDefaultCosmetics;
