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