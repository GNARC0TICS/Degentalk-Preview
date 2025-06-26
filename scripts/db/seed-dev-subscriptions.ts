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
      endDate: null, // Lifetime
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