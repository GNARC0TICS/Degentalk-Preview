import { db } from "../../db";
import { forumCategories, threads, posts } from "../../db/schema"; // Ensure posts and threads are imported
import { forumMap, DEFAULT_FORUM_RULES } from "../../client/src/config/forumMap.config"; // Import DEFAULT_FORUM_RULES
import { eq } from "drizzle-orm";
import chalk from "chalk";
import type { ForumTheme, ForumRules as ConfigForumRules, Zone as ConfigZone, ZoneType } from "../../client/src/config/forumMap.config"; // Added ZoneType
import { parseArgs } from 'node:util';

// Define a type for the transaction client that Drizzle uses
type TransactionClient = typeof db | (typeof db & { transaction: (tx: unknown) => Promise<void> }); // More specific transaction type

interface ForumCategoryPluginData {
  rules?: ConfigForumRules;
  bannerImage?: string | null;
  originalTheme?: ForumTheme | Partial<ForumTheme> | null;
  configZoneType?: ZoneType; // Use the imported ZoneType
  configDescription?: string | null;
  
  // Enhanced primary zone features
  components?: string[];
  accessControl?: {
    canPost?: string[];
    canModerate?: string[];
    canCreateEvents?: string[];
  };
  threadRules?: {
    requirePrefix?: boolean;
    allowPolls?: boolean;
    requireDGTEscrow?: boolean;
    minDGTToPost?: number;
  };
  features?: {
    xpChallenges?: boolean;
    airdrops?: boolean;
    zoneShop?: boolean;
    staffBoard?: boolean;
    analytics?: boolean;
    customBadges?: boolean;
  };
  gamification?: {
    xpBoostOnRedMarket?: boolean;
    streakMultipliers?: boolean;
    zoneSpecificBadges?: string[];
  };
  visualIdentity?: {
    glitchEffects?: boolean;
    hoverAnimations?: string;
    gradientOverlays?: boolean;
  };
  
  // Allow other properties but prefer defined ones
  [key: string]: unknown; 
}

// Utility: resolve a forum_categories.id by slug.  Returns null if not found.
async function resolveParentIdBySlug(slug: string, tx: TransactionClient): Promise<number | null> {
  const result = await tx
    .select({ id: forumCategories.id })
    .from(forumCategories)
    .where(eq(forumCategories.slug, slug))
    .limit(1);

  return result.length > 0 ? result[0].id : null;
}

// Internal function to perform seeding, designed to be called within a transaction
async function seedZonesAndForumsInternal(tx: TransactionClient, wipeFlag: boolean) {
  if (wipeFlag) {
    console.log(chalk.yellow("Wipe flag detected. Truncating forum_categories, threads, and posts tables..."));
    await tx.delete(posts);
    await tx.delete(threads);
    await tx.delete(forumCategories);
    console.log(chalk.green("Tables truncated within transaction."));
  }

  const zonesFromConfig: ConfigZone[] = forumMap.zones;
  // Define a more specific type for forums with parentZoneSlug
  type ForumWithParentZoneSlug = ConfigZone['forums'][number] & { parentZoneSlug: string };

  const forumsFromConfig: ForumWithParentZoneSlug[] = zonesFromConfig.flatMap(zone =>
    zone.forums.map(forum => ({ ...forum, parentZoneSlug: zone.slug }))
  );

  console.log(chalk.blue(`Seeding ${zonesFromConfig.length} zones...`));
  for (const zoneConfig of zonesFromConfig) {
    const pluginData: ForumCategoryPluginData = {
      bannerImage: zoneConfig.theme?.bannerImage,
      originalTheme: zoneConfig.theme,
      configZoneType: zoneConfig.type,
      configDescription: zoneConfig.description,
      // Merge default rules with zone-specific partial rules if they exist
      rules: { 
        ...DEFAULT_FORUM_RULES, // Defined in forumMap.config.ts, but we need it here or pass it
        ...(zoneConfig.defaultRules || {}) 
      } as ConfigForumRules, // Assert as ConfigForumRules after merging
    };
    
    // Add enhanced features for primary zones
    if (zoneConfig.type === 'primary') {
      // Extract components from theme if available
      if (zoneConfig.theme?.landingComponent) {
        pluginData.components = [zoneConfig.theme.landingComponent];
      }
      
      // Add zone-specific features based on slug
      switch (zoneConfig.slug) {
        case 'the-pit':
          pluginData.gamification = {
            xpBoostOnRedMarket: true,
            streakMultipliers: false,
          };
          pluginData.visualIdentity = {
            glitchEffects: true,
            hoverAnimations: 'shake',
            gradientOverlays: true,
          };
          break;
          
        case 'mission-control':
          pluginData.components = ['DailyTaskWidget', 'FlashChallengeBar'];
          pluginData.features = {
            xpChallenges: true,
            analytics: true,
            staffBoard: true,
          };
          pluginData.accessControl = {
            canPost: ['registered'],
            canCreateEvents: ['mod', 'admin'],
          };
          break;
          
        case 'casino-floor':
          pluginData.components = ['LiveBetsWidget', 'IsItRiggedPoll'];
          pluginData.gamification = {
            streakMultipliers: true,
            zoneSpecificBadges: ['highroller', 'lucky7', 'housealwayswins'],
          };
          pluginData.visualIdentity = {
            hoverAnimations: 'sparkle',
          };
          break;
          
        case 'briefing-room':
          pluginData.accessControl = {
            canPost: ['admin'],
            canModerate: ['mod', 'admin'],
          };
          pluginData.threadRules = {
            allowPolls: false,
          };
          break;
          
        case 'the-archive':
          pluginData.accessControl = {
            canPost: [], // No one can post
          };
          pluginData.features = {
            analytics: true,
          };
          break;
          
        case 'degenshop':
          pluginData.components = ['ShopCard', 'HotItemsSlider', 'CosmeticsGrid'];
          pluginData.features = {
            zoneShop: true,
            customBadges: true,
          };
          break;
      }
    }
    
    const semanticColorTheme = zoneConfig.type === 'primary' ? zoneConfig.theme?.colorTheme : undefined;
    const zoneValues = {
      slug: zoneConfig.slug, 
      name: zoneConfig.name, 
      description: zoneConfig.description,
      type: "zone" as const, // Use "zone" as const for type safety
      colorTheme: semanticColorTheme, 
      icon: zoneConfig.theme?.icon, 
      color: zoneConfig.theme?.color,
      pluginData: pluginData, 
      isLocked: zoneConfig.defaultRules?.accessLevel === 'mod' || zoneConfig.defaultRules?.accessLevel === 'admin', // Example derivation
      minXp: zoneConfig.defaultRules?.minXpRequired ?? 0, 
      position: zoneConfig.position ?? 0,
    };
    
    await tx.insert(forumCategories).values(zoneValues).onConflictDoUpdate({ target: forumCategories.slug, set: zoneValues });
    console.log(chalk.cyan(`[✓] Synced zone: ${zoneConfig.name} (slug: ${zoneConfig.slug}, type: ${zoneConfig.type})`));
  }

  console.log(chalk.blue(`Seeding ${forumsFromConfig.length} forums...`));
  for (const forumConfig of forumsFromConfig) {
    // Use parentZoneSlug which is guaranteed by ForumWithParentZoneSlug type
    const intendedParentSlug = forumConfig.parentZoneSlug;

    const parentId = await resolveParentIdBySlug(intendedParentSlug, tx);
    if (!parentId) {
      console.error(
        chalk.red(`❌ Parent slug not found for forum '${forumConfig.slug}'. Intended parent: '${intendedParentSlug}'. Skipping insert.`)
      );
      continue;
    }

    const parentZoneDataFromConfig = zonesFromConfig.find(z => z.slug === forumConfig.parentZoneSlug);
    const forumPluginData: ForumCategoryPluginData = {
      rules: forumConfig.rules,
      bannerImage: forumConfig.themeOverride?.bannerImage || parentZoneDataFromConfig?.theme?.bannerImage,
      originalTheme: forumConfig.themeOverride || parentZoneDataFromConfig?.theme,
      configDescription: forumConfig.description, // Access directly
    };
    // Fallback to zone's color when a specific color theme override is not provided
    const forumSemanticColorTheme = forumConfig.themeOverride?.colorTheme || parentZoneDataFromConfig?.theme?.colorTheme;
    const forumValues = {
      slug: forumConfig.slug, name: forumConfig.name, description: forumConfig.description,
      type: "forum" as const, // Use "forum" as const
      parentId,
      colorTheme: forumSemanticColorTheme,
      icon: forumConfig.themeOverride?.icon || parentZoneDataFromConfig?.theme?.icon,
      color: forumConfig.themeOverride?.color || parentZoneDataFromConfig?.theme?.color,
      pluginData: forumPluginData, 
      tippingEnabled: forumConfig.rules.tippingEnabled,
      xpMultiplier: forumConfig.rules.xpMultiplier ?? 1.0,
      isLocked: forumConfig.rules.accessLevel === 'mod' || forumConfig.rules.accessLevel === 'admin', // Example derivation
      minXp: forumConfig.rules.minXpRequired ?? 0,
      position: forumConfig.position ?? 0,
    };
    await tx.insert(forumCategories).values(forumValues).onConflictDoUpdate({ target: forumCategories.slug, set: forumValues });
    console.log(chalk.cyan(`[✓] Synced forum: ${forumConfig.name} (slug: ${forumConfig.slug}) → parentId ${parentId}`));
  }
  console.log(chalk.green("✅ Forum structure and static themes seeded successfully within transaction."));
}

export async function seedForumsFromConfig() {
  const options = {
    wipe: { type: 'boolean', short: 'w', default: false },
  } as const;
  // Ensure 'wipe' is explicitly boolean, defaulting to false if undefined.
  const { values: { wipe = false } } = parseArgs({ options, allowPositionals: true });

  try {
    await db.transaction(async (tx) => {
      await seedZonesAndForumsInternal(tx, wipe); // Pass transaction client and wipe flag
    });
    console.log(chalk.greenBright("Seeding process completed successfully."));
  } catch (error) {
    console.error(chalk.red("Seeding process failed:"), error);
    process.exit(1);
  }
}

// Allows the script to be run directly (ESM-safe)
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      await seedForumsFromConfig();
      process.exit(0);
    } catch (err) {
      console.error(chalk.red("Execution failed:"), err);
      process.exit(1);
    }
  })();
}
