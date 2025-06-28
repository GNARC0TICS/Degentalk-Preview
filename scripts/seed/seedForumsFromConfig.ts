import { db } from "../../db";
import { forumStructure, threads, posts, users } from "../../db/schema"; // Ensure posts, threads, users imported
import { eq } from "drizzle-orm";
import { forumMap, DEFAULT_FORUM_RULES } from "../../client/src/config/forumMap.config"; // Import DEFAULT_FORUM_RULES
// import { eq } from "drizzle-orm"; // No longer used directly
import chalk from "chalk";
import type { ForumTheme, ForumRules as ConfigForumRules, Zone as ConfigZone, ZoneType } from "../../client/src/config/forumMap.config"; // Added ZoneType
import { parseArgs } from 'node:util';

// Define a type for the transaction client that Drizzle uses
type TransactionClient = typeof db | (typeof db & { transaction: (tx: unknown) => Promise<void> }); // More specific transaction type

// Generate forum-specific welcome content
function getWelcomeContent(forumSlug: string, forumName: string): { title: string; content: string } {
  const welcomeMessages: Record<string, { title: string; content: string }> = {
    'live-trade-reacts': {
      title: '🚀 Welcome to Live Trade Reacts!',
      content: `Welcome to the most intense trading forum on Degentalk! 

This is where we share our live reactions to market moves, celebrate our wins, and commiserate our losses. 

**Guidelines:**
• Share your real-time trading thoughts and reactions
• Use prefixes like [LIVE], [TRADE], [🔺UP], [🧂SALT], [🪦REKT]
• Screenshots of positions are encouraged (blur sensitive info)
• No financial advice - just raw reactions!

Let's make some money! 💎🙌`
    },
    'shill-zone': {
      title: '💎 Welcome to the Shill Zone!',
      content: `Welcome to the official shill headquarters! 

This is where you can promote your favorite gems, share moonshot predictions, and pump your bags to fellow degens.

**Rules:**
• Use required prefixes: [SHILL], [GEM], [MOON], [PUMP]
• DYOR always applies - we're just having fun
• No rugpull coins or obvious scams
• Back up your shills with reasoning

Ready to find the next 100x? Let's go! 🚀`
    },
    'alpha-channel': {
      title: '🎯 Welcome to Alpha Channel',
      content: `Welcome to the exclusive Alpha Channel! 

This is where premium alpha drops and insider intel are shared. Access is restricted to level 10+ members only.

**What you'll find here:**
• Confirmed alpha leaks and insider information
• Early project announcements
• Whale movement analysis
• Institutional adoption news

Remember: Alpha shared here is time-sensitive. Act fast! ⚡`
    },
    'strategy-scripts': {
      title: '🎲 Welcome to Strategy & Scripts!',
      content: `Welcome to the gambling strategy hub!

Share your betting strategies, automation scripts, and mathematical analysis for casino games.

**Topics include:**
• Dice and Limbo strategies
• Bankroll management systems
• Script development and sharing
• RTP analysis and discussions

Gamble responsibly and may the odds be in your favor! 🍀`
    },
    'announcements': {
      title: '📢 Official Degentalk Announcements',
      content: `Welcome to the official announcements forum.

This forum is reserved for official platform updates, feature releases, and important community notices from the Degentalk team.

All posts here are from verified staff members. Stay tuned for the latest updates! 

For discussions about announcements, please use the appropriate discussion forums.`
    }
  };

  return welcomeMessages[forumSlug] || {
    title: `Welcome to ${forumName}!`,
    content: `Welcome to ${forumName}!

This forum is part of the Degentalk community. Feel free to start discussions, ask questions, and engage with fellow community members.

Please follow the community guidelines and enjoy your time here! 🎉`
  };
}

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
      .insert(forumStructure)
      .values(forumValues)
      .onConflictDoUpdate({ target: forumStructure.slug, set: forumValues })
      .returning({ id: forumStructure.id });
    
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
        .where(eq(threads.structureId, newForumDbId))
        .limit(1);
      if (existingThreads.length === 0) {
        const welcomeContent = getWelcomeContent(forumConfig.slug, forumConfig.name);
        
        const [welcomeThread] = await tx.insert(threads).values({
          title: welcomeContent.title,
          slug: `${forumConfig.slug}-welcome`,
          structureId: newForumDbId,
          userId: defaultUserId,
          isSticky: true
        }).onConflictDoNothing().returning();

        // Add a welcome post
        if (welcomeThread) {
          await tx.insert(posts).values({
            threadId: welcomeThread.id,
            userId: defaultUserId,
            content: welcomeContent.content,
            isFirstPost: true
          }).onConflictDoNothing();
        }
        
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
    await tx.delete(forumStructure);
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
      .insert(forumStructure)
      .values(zoneValues)
      .onConflictDoUpdate({ target: forumStructure.slug, set: zoneValues })
      .returning({ id: forumStructure.id });

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
