import { db } from '@db';
import { platformTreasurySettings, type InsertPlatformTreasurySetting } from './utils/schema';
import { logSeed } from './utils/seedUtils';
import { eq } from 'drizzle-orm';

const SCRIPT_NAME = 'seed-treasury';

const DEFAULT_PLATFORM_TREASURY_SETTINGS: InsertPlatformTreasurySetting[] = [
  {
    currency: 'USDT',
    balance: '1000000.00', // Example balance
    hotWalletAddress: 'usdt-hot-wallet-address-placeholder',
    coldWalletAddress: 'usdt-cold-wallet-address-placeholder',
    minDepositAmount: '10.00',
    maxDepositAmount: '100000.00',
    minWithdrawalAmount: '10.00',
    maxWithdrawalAmount: '50000.00',
    depositFeePercent: 0.1,
    withdrawalFeePercent: 0.5,
    isEnabled: true,
    notes: 'Initial USDT treasury settings for platform payments.',
  },
  {
    currency: 'DGT', // Also track DGT platform wide if needed for consistency, separate from game economy parameters
    balance: '50000000.00', 
    hotWalletAddress: 'dgt-platform-hot-wallet-address-placeholder',
    coldWalletAddress: 'dgt-platform-cold-wallet-address-placeholder',
    minDepositAmount: '100.00',
    maxDepositAmount: '10000000.00',
    minWithdrawalAmount: '100.00',
    maxWithdrawalAmount: '5000000.00',
    depositFeePercent: 0,
    withdrawalFeePercent: 0.1,
    isEnabled: true,
    notes: 'Initial DGT treasury settings for platform operations.',
  }
];

export async function seedTreasurySettings() {
  logSeed(SCRIPT_NAME, 'Seeding platform treasury settings...');
  let seededCount = 0;
  let skippedCount = 0;

  try {
    for (const settingsData of DEFAULT_PLATFORM_TREASURY_SETTINGS) {
      const existingSetting = await db
        .select()
        .from(platformTreasurySettings)
        .where(eq(platformTreasurySettings.currency, settingsData.currency!))
        .limit(1);

      if (existingSetting.length === 0) {
        await db.insert(platformTreasurySettings).values(settingsData);
        logSeed(SCRIPT_NAME, `✅ Seeded platform treasury for: ${settingsData.currency}`);
        seededCount++;
      } else {
        logSeed(SCRIPT_NAME, `⏭️ Skipped existing platform treasury for: ${settingsData.currency}`);
        skippedCount++;
      }
    }
    logSeed(SCRIPT_NAME, 'Platform treasury settings seeded successfully!');
    logSeed(SCRIPT_NAME, `Summary: ${seededCount} settings seeded, ${skippedCount} skipped.`);
  } catch (error) {
    logSeed(SCRIPT_NAME, `Error seeding platform treasury settings: ${(error as Error).message}`, true);
    logSeed(SCRIPT_NAME, `Summary (before error): ${seededCount} settings seeded, ${skippedCount} skipped.`);
    throw error;
  }
} 