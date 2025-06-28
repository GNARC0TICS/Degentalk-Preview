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
        contract: null,
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