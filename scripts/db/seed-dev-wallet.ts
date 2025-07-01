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
import { depositRecords } from '@schema/wallet/deposit-records';
import { eq } from 'drizzle-orm';

/**
 * Seeds wallet data for development users with realistic balances
 */
export async function seedDevWallet() {
  console.log('💰 Seeding dev user wallet data...');

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

    // Create a large DGT deposit for the admin user to simulate purchased balance
    await db.insert(depositRecords).values({
      userId: adminUser.id,
      recordId: 'dev-admin-initial-balance',
      coinId: 1,
      coinSymbol: 'DGT',
      chain: 'ethereum',
      contract: '0xDGTContractAddress',
      amount: '100000',
      serviceFee: '0',
      coinUSDPrice: '0.10',
      usdtAmount: '10000',
      dgtAmount: '100000',
      conversionRate: '0.10',
      originalToken: 'DGT',
      fromAddress: '0xDevDepositAddress',
      toAddress: '0xAdminWalletAddress',
      txId: '0xdev-admin-deposit-hash',
      status: 'Success',
      isFlaggedRisky: false,
      arrivedAt: new Date(),
      createdAt: new Date()
    }).onConflictDoNothing();

    // Add some crypto balances through additional deposit records
    const cryptoDeposits = [
      {
        coinId: 2,
        coinSymbol: 'ETH',
        chain: 'ethereum',
        contract: '0xETHContract',
        amount: '10',
        coinUSDPrice: '2000',
        usdtAmount: '20000',
        dgtAmount: '200000' // Converted to DGT at $0.10
      },
      {
        coinId: 3,
        coinSymbol: 'USDT',
        chain: 'ethereum',
        contract: '0xUSDTContract',
        amount: '5000',
        coinUSDPrice: '1',
        usdtAmount: '5000',
        dgtAmount: '50000' // Converted to DGT at $0.10
      },
      {
        coinId: 4,
        coinSymbol: 'BTC',
        chain: 'bitcoin',
        contract: : AdminId | : ReporterId | : ReportId | : ConversationId | : RoomId | : AdminUserId | : AirdropId | : AnimationFrameId | : BackupId | : CategoryId | : CoinId | : AuthorId | : CosmeticId | : EditorId | : EmojiPackId | : EntityId | : EntryId | : ForumId | : GroupId | : InventoryId | : ItemId | : MentionId | : ModeratorId | : PackId | : ParentForumId | : ParentZoneId | : RuleId | : SettingId | : StickerId | : SubscriptionId | : TagId | : TemplateId | : TipId | : UnlockTransactionId | : VaultId | : VaultLockId | : WhaleId | : ZoneId | : RequestId | : ContentId | : SignatureItemId | : VerificationTokenId | : BanId | : SessionId | : ModActionId | : IpLogId | : DraftId | : ReplyId | : QuoteId | : OrderId | : StoreItemId | : UnlockId | : NotificationId | : FriendRequestId | : FollowRequestId | : MessageId | : PrefixId | : EventId | : AuditLogId | : ActionId | : HeatEventId | null,
        amount: '0.5',
        coinUSDPrice: '30000',
        usdtAmount: '15000',
        dgtAmount: '150000' // Converted to DGT at $0.10
      }
    ];

    for (const [index, crypto] of cryptoDeposits.entries()) {
      await db.insert(depositRecords).values({
        userId: adminUser.id,
        recordId: `dev-admin-${crypto.coinSymbol.toLowerCase()}-${index}`,
        coinId: crypto.coinId,
        coinSymbol: crypto.coinSymbol,
        chain: crypto.chain,
        contract: crypto.contract,
        amount: crypto.amount,
        serviceFee: '0',
        coinUSDPrice: crypto.coinUSDPrice,
        usdtAmount: crypto.usdtAmount,
        dgtAmount: crypto.dgtAmount,
        conversionRate: '0.10',
        originalToken: crypto.coinSymbol,
        fromAddress: `0xDev${crypto.coinSymbol}Address`,
        toAddress: '0xAdminWalletAddress',
        txId: `0xdev-admin-${crypto.coinSymbol.toLowerCase()}-hash`,
        status: 'Success',
        isFlaggedRisky: false,
        arrivedAt: new Date(),
        createdAt: new Date()
      }).onConflictDoNothing();
    }

    console.log(`✅ Seeded wallet data for admin user: ${adminUser.username}`);
    console.log('   💰 100,000 DGT ($10,000)');
    console.log('   🔹 10 ETH ($20,000)');
    console.log('   💵 5,000 USDT ($5,000)');
    console.log('   ₿ 0.5 BTC ($15,000)');
    console.log('   📊 Total Portfolio: ~$50,000');

  } catch (error) {
    console.error('❌ Error seeding dev wallet data:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDevWallet()
    .then(() => {
      console.log('🎉 Dev wallet seeding completed!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('💥 Dev wallet seeding failed:', err);
      process.exit(1);
    });
}