import { db } from "../../db";
import { forumCategories, threads, posts } from "../../db/schema"; // Ensure posts and threads are imported
import { forumMap } from "../../client/src/config/forumMap.config";
import { eq } from "drizzle-orm";
import chalk from "chalk";
import type { ForumTheme, ForumRules as ConfigForumRules, Zone as ConfigZone, Forum as ConfigForum } from "../../client/src/config/forumMap.config";
import { parseArgs } from 'node:util';

// Define a type for the transaction client that Drizzle uses
type TransactionClient = typeof db | (typeof db & { transaction: any }); // Simplified, actual type might be more specific

interface ForumCategoryPluginData {
  rules?: ConfigForumRules;
  bannerImage?: string | null;
  originalTheme?: ForumTheme | Partial<ForumTheme> | null;
  configZoneType?: 'primary' | 'general';
  configDescription?: string | null;
  [key: string]: any;
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
  const forumsFromConfig = zonesFromConfig.flatMap(zone =>
    zone.forums.map(forum => ({ ...forum, parentZoneSlug: zone.slug }))
  );

  console.log(chalk.blue(`Seeding ${zonesFromConfig.length} zones...`));
  for (const zoneConfig of zonesFromConfig) {
    const pluginData: ForumCategoryPluginData = {
      bannerImage: zoneConfig.theme?.bannerImage,
      originalTheme: zoneConfig.theme,
      configZoneType: zoneConfig.type,
      configDescription: zoneConfig.description,
      rules: (zoneConfig as any).rules,
    };
    const semanticColorTheme = zoneConfig.type === 'primary' ? zoneConfig.slug : undefined;
    const values = {
      slug: zoneConfig.slug, name: zoneConfig.name, description: zoneConfig.description,
      type: "zone" as "zone" | "forum" | "category", canonical: zoneConfig.type === 'primary',
      colorTheme: semanticColorTheme, icon: zoneConfig.theme?.icon, color: zoneConfig.theme?.color,
      pluginData: pluginData, isLocked: (zoneConfig as any).isLocked ?? false,
      minXp: (zoneConfig as any).minXp ?? 0, position: (zoneConfig as any).position ?? 0,
    };
    await tx.insert(forumCategories).values(values).onConflictDoUpdate({ target: forumCategories.slug, set: values });
    console.log(chalk.cyan(`[✓] Synced zone: ${zoneConfig.name} (slug: ${zoneConfig.slug})`));
  }

  const dbZones = await tx.select({
    id: forumCategories.id, slug: forumCategories.slug, color: forumCategories.color,
    icon: forumCategories.icon, colorTheme: forumCategories.colorTheme, pluginData: forumCategories.pluginData
  }).from(forumCategories).where(eq(forumCategories.type, "zone"));
  const dbZoneMap = new Map(dbZones.map(z => [z.slug, z]));

  console.log(chalk.blue(`Seeding ${forumsFromConfig.length} forums...`));
  for (const forumConfig of forumsFromConfig) {
    const parentZoneDataFromConfig = zonesFromConfig.find(z => z.slug === forumConfig.parentZoneSlug);
    const parentDbZone = dbZoneMap.get(forumConfig.parentZoneSlug);
    if (!parentDbZone) {
      console.warn(chalk.red(`⚠️ Could not find parent zone DB record for forum: ${forumConfig.slug}`));
      continue;
    }
    const dbParentForumSlug = forumConfig.parentForumSlug || forumConfig.parentZoneSlug;
    const forumPluginData: ForumCategoryPluginData = {
      rules: forumConfig.rules,
      bannerImage: forumConfig.themeOverride?.bannerImage || parentZoneDataFromConfig?.theme?.bannerImage,
      originalTheme: forumConfig.themeOverride || parentZoneDataFromConfig?.theme,
      configDescription: (forumConfig as any).description,
    };
    const forumSemanticColorTheme = (forumConfig as any).colorTheme || parentDbZone.colorTheme;
    const values = {
      slug: forumConfig.slug, name: forumConfig.name, description: (forumConfig as any).description,
      type: "forum" as "zone" | "forum" | "category", parentId: parentDbZone.id, parentForumSlug: dbParentForumSlug,
      canonical: false, colorTheme: forumSemanticColorTheme,
      icon: forumConfig.themeOverride?.icon || parentZoneDataFromConfig?.theme?.icon,
      color: forumConfig.themeOverride?.color || parentZoneDataFromConfig?.theme?.color,
      pluginData: forumPluginData, tippingEnabled: forumConfig.rules.tippingEnabled,
      xpMultiplier: forumConfig.rules.xpMultiplier ?? 1.0,
      isLocked: (forumConfig.rules as any).isLocked ?? (forumConfig as any).isLocked ?? false,
      minXp: (forumConfig.rules as any).minXp ?? (forumConfig as any).minXp ?? 0,
      position: (forumConfig as any).position ?? 0,
    };
    await tx.insert(forumCategories).values(values).onConflictDoUpdate({ target: forumCategories.slug, set: values });
    console.log(chalk.cyan(`[✓] Synced forum: ${forumConfig.name} (slug: ${forumConfig.slug}) → Parent Slug in DB: ${dbParentForumSlug}`));
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
