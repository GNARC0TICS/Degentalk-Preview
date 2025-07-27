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
import { db } from '@db';
import { users } from '../db/schema/user/users';
import { subscriptions } from '../db/schema/user/subscriptions';
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