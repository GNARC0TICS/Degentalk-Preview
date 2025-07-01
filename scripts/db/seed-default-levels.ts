import { randomUUID } from 'node:crypto';
import { createId } from '@paralleldrive/cuid2';
import { db } from '@/db';
import { badges, titles, levels, economySettings } from '@/schema';
import { eq } from 'drizzle-orm';

type BadgeId = string;
type TitleId = string;

/**
 * Helper – deterministic XP formula (same one the legacy script used)
 */
function calculateXpForLevel(level: number): number {
  return Math.floor(500 * Math.pow(level, 1.5));
}

/**
 * Default badge catalogue – IDs are generated on the fly with `createId()`
 */
const DEFAULT_BADGES = [
  { name: 'Early Adopter', description: 'Awarded for reaching level 5', iconUrl: '/images/badges/early-adopter.png' },
  { name: 'Dedicated', description: 'Awarded for reaching level 10', iconUrl: '/images/badges/dedicated.png' },
  { name: 'Expert', description: 'Awarded for reaching level 25', iconUrl: '/images/badges/expert.png' },
  { name: 'Legend', description: 'Awarded for reaching level 50', iconUrl: '/images/badges/legend.png' },
  { name: 'Mythic', description: 'Awarded for reaching level 100', iconUrl: '/images/badges/mythic.png' }
] as const;

/**
 * Level milestones – business values kept intact.  Legacy numeric badge references
 * are removed (rewardBadgeId is left null for now – the badge-grant happens in the
 * runtime XP service).
 */
const LEVEL_CONFIG = [
  { level: 0,  title: 'Lurker',              dgtReward: 0  },
  { level: 1,  title: 'Newcomer',           dgtReward: 100 },
  { level: 2,  title: 'Mingler',            dgtReward: 150 },
  { level: 3,  title: 'Contributor',        dgtReward: 200 },
  { level: 4,  title: 'Regular',            dgtReward: 250 },
  { level: 5,  title: 'Active Member',      dgtReward: 300 },
  { level: 6,  title: 'Engaged Member',     dgtReward: 350 },
  { level: 7,  title: 'Established Member', dgtReward: 400 },
  { level: 8,  title: 'Forum Friend',       dgtReward: 450 },
  { level: 9,  title: 'Dedicated Member',   dgtReward: 500 },
  { level: 10, title: 'Trusted Member',     dgtReward: 1000 },
  { level: 15, title: 'Community Pillar',   dgtReward: 1500 },
  { level: 20, title: 'Knowledge Keeper',   dgtReward: 2000 },
  { level: 25, title: 'Forum Sage',         dgtReward: 2500 },
  { level: 30, title: 'Respected Degen',    dgtReward: 3000 },
  { level: 40, title: 'Elder Degen',        dgtReward: 4000 },
  { level: 50, title: 'Forum Legend',       dgtReward: 5000 },
  { level: 60, title: 'Wisdom Guardian',    dgtReward: 6000 },
  { level: 75, title: 'Forum Oracle',       dgtReward: 7500 },
  { level: 90, title: 'Degen Icon',         dgtReward: 9000 },
  { level: 99, title: 'Degen Master',       dgtReward: 10000 },
  { level: 100, title: 'Degen Legend',      dgtReward: 20000 }
] as const;

const DEFAULT_ECONOMY_SETTINGS = [
  { key: 'POST_CREATED', value: 50 },
  { key: 'REPLY_CREATED', value: 25 },
  { key: 'HELPFUL_REACTION_RECEIVED', value: 10 },
  { key: 'LIKE_REACTION_RECEIVED', value: 5 },
  { key: 'TIP_XP_PER_UNIT', value: 1 },
  { key: 'TIP_XP_MAX_PER_EVENT', value: 100 },
  { key: 'DAILY_XP_CAP', value: 500 }
] as const;

/**
 * Main entry – exposed for programmatic usage and imported by the server bootstrap.
 */
export async function seedDefaultLevels(): Promise<void> {
  console.log('🌱 [SEED-LEVELS] Seeding badges, titles, levels, economy settings…');

  /** 1️⃣  Badges */
  const badgeIdByName = new Map<string, BadgeId>();
  for (const badge of DEFAULT_BADGES) {
    const existing = await db.select().from(badges).where(eq(badges.name, badge.name)).execute();
    if (existing.length === 0) {
      const id = createId() as BadgeId;
      await db.insert(badges).values({ id, ...badge }).execute();
      badgeIdByName.set(badge.name, id);
    } else {
      badgeIdByName.set(badge.name, existing[0].id as BadgeId);
    }
  }

  /** 2️⃣  Titles (one-to-one with levels) */
  const titleIdByLevel = new Map<number, TitleId>();
  for (const cfg of LEVEL_CONFIG) {
    const existing = await db
      .select({ id: titles.id })
      .from(titles)
      .where(eq(titles.name, cfg.title))
      .execute();

    if (existing.length === 0) {
      const id = createId() as TitleId;
      await db.insert(titles).values({
        id,
        name: cfg.title,
        description: `Awarded for reaching level ${cfg.level}`,
        rarity: cfg.level >= 90 ? 'legendary' : cfg.level >= 60 ? 'epic' : cfg.level >= 30 ? 'rare' : cfg.level >= 10 ? 'uncommon' : 'common'
      }).execute();
      titleIdByLevel.set(cfg.level, id);
    } else {
      titleIdByLevel.set(cfg.level, existing[0].id as TitleId);
    }
  }

  /** 3️⃣  Levels */
  for (const cfg of LEVEL_CONFIG) {
    const minXp = cfg.level === 0 ? 0 : calculateXpForLevel(cfg.level);

    // rewardTitleId / rewardBadgeId are optional ‑ leave them null until schema is updated to UUIDs
    await db
      .insert(levels)
      .values({
        id: randomUUID(),
        level: cfg.level,
        minXp,
        name: cfg.title,
        rewardDgt: cfg.dgtReward,
        rewardTitleId: null,
        rewardBadgeId: null
      })
      .onConflictDoUpdate({ target: levels.level, set: { minXp, name: cfg.title, rewardDgt: cfg.dgtReward } })
      .execute();
  }

  /** 4️⃣  Economy settings */
  for (const setting of DEFAULT_ECONOMY_SETTINGS) {
    await db
      .insert(economySettings)
      .values(setting)
      .onConflictDoUpdate({ target: economySettings.key, set: { value: setting.value } })
      .execute();
  }

  console.log('✅ [SEED-LEVELS] Done');
}

// CLI execution support
if (process.argv[1] && process.argv[1].endsWith('seed-default-levels.ts')) {
  seedDefaultLevels().then(() => process.exit(0)).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
