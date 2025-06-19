import { db } from "../../db";
import { forumCategories, threads, posts, users } from "../../db/schema"; // Ensure posts, threads, users imported
import { eq } from "drizzle-orm";
import { forumMap, DEFAULT_FORUM_RULES } from "../../client/src/config/forumMap.config"; // Import DEFAULT_FORUM_RULES
// import { eq } from "drizzle-orm"; // No longer used directly
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

// Recursive function to seed forums and their subforums
async function seedForumLevel(
  forumsToProcess: ConfigZone['forums'][number][], // Type for forums from config (can include nested forums)
  currentParentIdInDB: number,
  parentConfigSlug: string, // ADDED: Slug of the parent (zone or forum) from config
  parentConfigTheme: ForumTheme | Partial<ForumTheme> | undefined, // Theme from parent zone or parent forum
  tx: TransactionClient,
  defaultUserId: string | null | undefined
) {
  for (const forumConfig of forumsToProcess) {
    const forumPluginData: ForumCategoryPluginData = {
      rules: forumConfig.rules,
      bannerImage: forumConfig.themeOverride?.bannerImage || parentConfigTheme?.bannerImage,
      originalTheme: forumConfig.themeOverride || parentConfigTheme,
      configDescription: forumConfig.description,
    };

    const forumSemanticColorTheme = forumConfig.themeOverride?.colorTheme || parentConfigTheme?.colorTheme;
    const forumIcon = forumConfig.themeOverride?.icon || parentConfigTheme?.icon;
    const forumColor = forumConfig.themeOverride?.color || parentConfigTheme?.color;

    const forumValues = {
      slug: forumConfig.slug,
      name: forumConfig.name,
      description: forumConfig.description,
      type: "forum" as const,
      parentId: currentParentIdInDB,
      parentForumSlug: parentConfigSlug, // ADDED
      colorTheme: forumSemanticColorTheme,
      icon: forumIcon,
      color: forumColor,
      pluginData: forumPluginData,
      tippingEnabled: forumConfig.rules.tippingEnabled,
      xpMultiplier: forumConfig.rules.xpMultiplier ?? 1.0,
      isLocked: forumConfig.rules.accessLevel === 'mod' || forumConfig.rules.accessLevel === 'admin',
      minXp: forumConfig.rules.minXpRequired ?? 0,
      position: forumConfig.position ?? 0,
    };

    const result = await tx
      .insert(forumCategories)
      .values(forumValues)
      .onConflictDoUpdate({ target: forumCategories.slug, set: forumValues })
      .returning({ id: forumCategories.id });
    
    const newForumDbId = result[0]?.id;

    if (!newForumDbId) {
      console.error(chalk.red(`❌ Failed to insert or get ID for forum '${forumConfig.slug}'. Skipping its subforums.`));
      continue;
    }
    console.log(chalk.cyan(`[✓] Synced forum: ${forumConfig.name} (slug: ${forumConfig.slug}) → parentId ${currentParentIdInDB}`));

    // Seed a simple welcome thread if a default user exists and no threads yet
    if (defaultUserId) {
      const existingThreads = await tx
        .select({ id: threads.id })
        .from(threads)
        .where(eq(threads.categoryId, newForumDbId))
        .limit(1);
      if (existingThreads.length === 0) {
        const threadSlug = `${forumConfig.slug}-welcome`;
        await tx.insert(threads).values({
          title: `Welcome to ${forumConfig.name}`,
          slug: threadSlug,
          categoryId: newForumDbId,
          userId: defaultUserId,
        }).onConflictDoNothing();
        console.log(chalk.gray(`    └─ Added welcome thread to ${forumConfig.slug}`));
      }
    }

    // Recursively process subforums, if any
    if (forumConfig.forums && forumConfig.forums.length > 0) {
      console.log(chalk.blue(`  ↳ Seeding ${forumConfig.forums.length} subforums for '${forumConfig.name}'...`));
      // Pass the current forum's theme (override or inherited) as parent theme for subforums
      const currentForumEffectiveTheme = forumConfig.themeOverride || parentConfigTheme;
      // Pass current forum's slug as parentConfigSlug for its children
      await seedForumLevel(forumConfig.forums, newForumDbId, forumConfig.slug, currentForumEffectiveTheme, tx, defaultUserId);
    }
  }
}

// Internal function to perform seeding, designed to be called within a transaction
async function seedZonesAndForumsInternal(tx: TransactionClient, wipeFlag: boolean) {
  if (wipeFlag) {
    console.log(chalk.yellow("Wipe flag detected. Truncating forum_categories, threads, and posts tables..."));
    // Order matters for foreign key constraints if they exist and are enforced during delete
    await tx.delete(posts);
    await tx.delete(threads);
    await tx.delete(forumCategories);
    console.log(chalk.green("Tables truncated within transaction."));
  }

  const zonesFromConfig: ConfigZone[] = forumMap.zones;

  // Fetch a default user to use as author for welcome threads
  const [defaultUser] = await tx.select({ id: users.id }).from(users).limit(1);
  const defaultUserId = defaultUser?.id;
  if (!defaultUserId) {
    console.warn(chalk.yellow("⚠️  No users found in DB – welcome threads will not be created."));
  }

  console.log(chalk.blue(`Seeding ${zonesFromConfig.length} zones...`));
  for (const zoneConfig of zonesFromConfig) {
    const pluginData: ForumCategoryPluginData = {
      bannerImage: zoneConfig.theme?.bannerImage,
      originalTheme: zoneConfig.theme,
      configZoneType: zoneConfig.type,
      configDescription: zoneConfig.description,
      rules: { 
        ...DEFAULT_FORUM_RULES,
        ...(zoneConfig.defaultRules || {}) 
      } as ConfigForumRules,
    };
    
    if (zoneConfig.theme?.landingComponent && zoneConfig.type === 'primary') {
      pluginData.components = [zoneConfig.theme.landingComponent];
    }

    // Apply slug-specific pluginData, regardless of zone type
    switch (zoneConfig.slug) {
      case 'the-pit':
        pluginData.gamification = { xpBoostOnRedMarket: true, streakMultipliers: false };
        pluginData.visualIdentity = { glitchEffects: true, hoverAnimations: 'shake', gradientOverlays: true };
        break;
      case 'mission-control':
        pluginData.components = ['DailyTaskWidget', 'FlashChallengeBar'];
        pluginData.features = { xpChallenges: true, analytics: true, staffBoard: true };
        pluginData.accessControl = { canPost: ['registered'], canCreateEvents: ['mod', 'admin'] };
        break;
      case 'casino-floor':
        pluginData.components = ['LiveBetsWidget', 'IsItRiggedPoll'];
        pluginData.gamification = { streakMultipliers: true, zoneSpecificBadges: ['highroller', 'lucky7', 'housealwayswins'] };
        pluginData.visualIdentity = { hoverAnimations: 'sparkle' };
        break;
      case 'briefing-room':
        pluginData.accessControl = { canPost: ['admin'], canModerate: ['mod', 'admin'] };
        pluginData.threadRules = { allowPolls: false };
        break;
      case 'the-archive':
        pluginData.accessControl = { canPost: [] };
        pluginData.features = { analytics: true };
        break;
      case 'degenshop':
        pluginData.components = ['ShopCard', 'HotItemsSlider', 'CosmeticsGrid'];
        pluginData.features = { zoneShop: true, customBadges: true };
        break;
    }
    
    const semanticColorTheme = zoneConfig.type === 'primary' ? zoneConfig.theme?.colorTheme : undefined;
    const zoneValues = {
      slug: zoneConfig.slug, 
      name: zoneConfig.name, 
      description: zoneConfig.description,
      type: "zone" as const,
      parentId: null, // Zones have no parent
      parentForumSlug: null, // ADDED: Zones have no parent slug
      colorTheme: semanticColorTheme, 
      icon: zoneConfig.theme?.icon, 
      color: zoneConfig.theme?.color,
      pluginData: pluginData, 
      isLocked: zoneConfig.defaultRules?.accessLevel === 'mod' || zoneConfig.defaultRules?.accessLevel === 'admin',
      minXp: zoneConfig.defaultRules?.minXpRequired ?? 0, 
      position: zoneConfig.position ?? 0,
    };
    
    const result = await tx
      .insert(forumCategories)
      .values(zoneValues)
      .onConflictDoUpdate({ target: forumCategories.slug, set: zoneValues })
      .returning({ id: forumCategories.id });

    const zoneDbId = result[0]?.id;
    if (!zoneDbId) {
      console.error(chalk.red(`❌ Failed to insert or get ID for zone '${zoneConfig.slug}'. Skipping its forums.`));
      continue;
    }
    console.log(chalk.cyan(`[✓] Synced zone: ${zoneConfig.name} (slug: ${zoneConfig.slug}, type: ${zoneConfig.type}) - DB ID: ${zoneDbId}`));

    // Seed top-level forums for this zone
    if (zoneConfig.forums && zoneConfig.forums.length > 0) {
      console.log(chalk.blue(`  ↳ Seeding ${zoneConfig.forums.length} top-level forums for zone '${zoneConfig.name}'...`));
      // Pass zone's slug as parentConfigSlug for its direct child forums
      await seedForumLevel(zoneConfig.forums, zoneDbId, zoneConfig.slug, zoneConfig.theme, tx, defaultUserId);
    }
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
