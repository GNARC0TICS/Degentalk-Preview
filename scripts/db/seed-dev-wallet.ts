import type { HeatEventId } from '../shared/types/ids';
import type { ActionId } from '../shared/types/ids';
import type { AuditLogId } from '../shared/types/ids';
import type { EventId } from '../shared/types/ids';
import type { PrefixId } from '../shared/types/ids';
import type { MessageId } from '../shared/types/ids';
import type { FollowRequestId } from '../shared/types/ids';
import type { FriendRequestId } from '../shared/types/ids';
import type { NotificationId } from '../shared/types/ids';
import type { UnlockId } from '../shared/types/ids';
import type { StoreItemId } from '../shared/types/ids';
import type { OrderId } from '../shared/types/ids';
import type { QuoteId } from '../shared/types/ids';
import type { ReplyId } from '../shared/types/ids';
import type { DraftId } from '../shared/types/ids';
import type { IpLogId } from '../shared/types/ids';
import type { ModActionId } from '../shared/types/ids';
import type { SessionId } from '../shared/types/ids';
import type { BanId } from '../shared/types/ids';
import type { VerificationTokenId } from '../shared/types/ids';
import type { SignatureItemId } from '../shared/types/ids';
import type { ContentId } from '../shared/types/ids';
import type { RequestId } from '../shared/types/ids';
import type { ZoneId } from '../shared/types/ids';
import type { WhaleId } from '../shared/types/ids';
import type { VaultLockId } from '../shared/types/ids';
import type { VaultId } from '../shared/types/ids';
import type { UnlockTransactionId } from '../shared/types/ids';
import type { TipId } from '../shared/types/ids';
import type { TemplateId } from '../shared/types/ids';
import type { TagId } from '../shared/types/ids';
import type { SubscriptionId } from '../shared/types/ids';
import type { StickerId } from '../shared/types/ids';
import type { SettingId } from '../shared/types/ids';
import type { RuleId } from '../shared/types/ids';
import type { ParentZoneId } from '../shared/types/ids';
import type { ParentForumId } from '../shared/types/ids';
import type { PackId } from '../shared/types/ids';
import type { ModeratorId } from '../shared/types/ids';
import type { MentionId } from '../shared/types/ids';
import type { ItemId } from '../shared/types/ids';
import type { InventoryId } from '../shared/types/ids';
import type { GroupId } from '../shared/types/ids';
import type { ForumId } from '../shared/types/ids';
import type { EntryId } from '../shared/types/ids';
import type { EntityId } from '../shared/types/ids';
import type { EmojiPackId } from '../shared/types/ids';
import type { EditorId } from '../shared/types/ids';
import type { CosmeticId } from '../shared/types/ids';
import type { AuthorId } from '../shared/types/ids';
import type { CoinId } from '../shared/types/ids';
import type { CategoryId } from '../shared/types/ids';
import type { BackupId } from '../shared/types/ids';
import type { AnimationFrameId } from '../shared/types/ids';
import type { AirdropId } from '../shared/types/ids';
import type { AdminUserId } from '../shared/types/ids';
import type { RoomId } from '../shared/types/ids';
import type { ConversationId } from '../shared/types/ids';
import type { ReportId } from '../shared/types/ids';
import type { ReporterId } from '../shared/types/ids';
import type { AdminId } from '../shared/types/ids';
import { db } from '../db';
import { users } from '../db/schema/user/users';
import { depositRecords } from '../db/schema/wallet/deposit-records';
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