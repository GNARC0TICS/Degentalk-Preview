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
import { db } from '@db';
import { users } from '@schema/user/users';
import { subscriptions } from '@schema/user/subscriptions';
import { eq } from 'drizzle-orm';

/**
 * Seeds VIP subscription data for development users
 */
export async function seedDevSubscriptions() {
  console.log('💎 Seeding dev user VIP subscriptions...');

  try {
    // Find our dev users
    const devUsers = await db
      .select({ id: users.id, username: users.username })
      .from(users)
      .where(
        eq(users.username, 'cryptoadmin')
      );

    if (devUsers.length === 0) {
      console.log('⚠️  No dev users found. Run seed:users first.');
      return;
    }

    const adminUser = devUsers[0];

    // Give admin user a VIP Pass (lifetime subscription)
    await db.insert(subscriptions).values({
      userId: adminUser.id,
      type: 'vip_pass',
      status: 'active',
      pricePaid: 500, // 500 DGT
      paymentMethod: 'dgt',
      startDate: new Date(),
      endDate: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null, // Lifetime
      autoRenew: false, // Lifetime doesn't renew
      metadata: {
        type: 'development-seed',
        description: 'VIP Pass for development testing',
        features: [
          'exclusive-access',
          'priority-support', 
          'advanced-features',
          'cosmetic-perks',
          'xp-multipliers'
        ],
        benefits: {
          xpMultiplier: 1.5,
          exclusiveForums: true,
          prioritySupport: true,
          monthlyCosmetics: true,
          specialBadge: true
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }).onConflictDoNothing();

    console.log(`✅ Seeded VIP subscription for admin user: ${adminUser.username}`);
    console.log('   💎 VIP Pass (Lifetime) - 500 DGT');
    console.log('   ⚡ XP Multiplier: 1.5x');
    console.log('   🎨 Monthly Cosmetic Drops');
    console.log('   🔒 Exclusive Forum Access');
    console.log('   🛎️  Priority Support');

  } catch (error) {
    console.error('❌ Error seeding dev subscription data:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDevSubscriptions()
    .then(() => {
      console.log('🎉 Dev subscription seeding completed!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('💥 Dev subscription seeding failed:', err);
      process.exit(1);
    });
}