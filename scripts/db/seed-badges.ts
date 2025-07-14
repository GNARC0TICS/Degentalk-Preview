import { db } from '../../db/index.ts';
import { badges, type InsertBadge } from './utils/schema';
import { logSeed } from './utils/seedUtils';
import { eq } from 'drizzle-orm';

const SCRIPT_NAME = 'seed-badges';

const DEFAULT_BADGES: InsertBadge[] = [
  {
    name: 'Early Adopter',
    description: 'Joined Degentalk during the first month!',
    iconUrl: '/images/badges/early_adopter.png',
  },
  {
    name: 'First Post',
    description: 'Made your first post on the forum.',
    iconUrl: '/images/badges/first_post.png',
  },
  {
    name: 'Community Helper',
    description: 'Provided a helpful answer marked by the community.',
    iconUrl: '/images/badges/helper.png',
  },
  {
    name: 'Generous Tipper',
    description: 'Tipped other users with DGT.',
    iconUrl: '/images/badges/generous_tipper.png',
  }
];

export async function seedBadges() {
  logSeed(SCRIPT_NAME, 'Seeding default badges...');
  let seededCount = 0;
  let skippedCount = 0;

  try {
    for (const badgeData of DEFAULT_BADGES) {
      const existingBadge = await db
        .select()
        .from(badges)
        .where(eq(badges.name, badgeData.name!))
        .limit(1);

      if (existingBadge.length === 0) {
        await db.insert(badges).values(badgeData);
        logSeed(SCRIPT_NAME, `✅ Seeded badge: ${badgeData.name}`);
        seededCount++;
      } else {
        logSeed(SCRIPT_NAME, `⏭️ Skipped existing badge: ${badgeData.name}`);
        skippedCount++;
      }
    }
    logSeed(SCRIPT_NAME, 'Badges seeded successfully!');
    logSeed(SCRIPT_NAME, `Summary: ${seededCount} badges seeded, ${skippedCount} skipped.`);
  } catch (error) {
    logSeed(SCRIPT_NAME, `Error seeding badges: ${(error as Error).message}`, true);
    logSeed(SCRIPT_NAME, `Summary (before error): ${seededCount} badges seeded, ${skippedCount} skipped.`);
    throw error;
  }
} 