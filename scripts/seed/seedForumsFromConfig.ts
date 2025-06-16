import { db } from "../../db";
import { forumCategories, threads, posts } from "../../db/schema"; // Ensure posts and threads are imported
import { forumMap } from "../../client/src/config/forumMap.config";
import { eq } from "drizzle-orm";
import chalk from "chalk";
import type { ForumTheme, ForumRules as ConfigForumRules, Zone as ConfigZone } from "../../client/src/config/forumMap.config";
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
    const values: any = {
      slug: zoneConfig.slug, name: zoneConfig.name, description: zoneConfig.description,
      type: "zone" as "zone" | "forum" | "category",
      colorTheme: semanticColorTheme, icon: zoneConfig.theme?.icon, color: zoneConfig.theme?.color,
      pluginData: pluginData, isLocked: (zoneConfig as any).isLocked ?? false,
      minXp: (zoneConfig as any).minXp ?? 0, position: (zoneConfig as any).position ?? 0,
    };
    await tx.insert(forumCategories).values(values).onConflictDoUpdate({ target: forumCategories.slug, set: values });
    console.log(chalk.cyan(`[✓] Synced zone: ${zoneConfig.name} (slug: ${zoneConfig.slug})`));
  }

  console.log(chalk.blue(`Seeding ${forumsFromConfig.length} forums...`));
  for (const forumConfig of forumsFromConfig) {
    // Determine the slug we expect to be the parent – either explicit parentForumSlug or the zoneSlug
    const intendedParentSlug = forumConfig.parentForumSlug || forumConfig.parentZoneSlug;

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
      configDescription: (forumConfig as any).description,
    };
    // Fallback to zone's color when a specific color theme override is not provided
    const forumSemanticColorTheme = (forumConfig as any).colorTheme || (parentZoneDataFromConfig?.theme as any)?.colorTheme;
    const values: any = {
      slug: forumConfig.slug, name: forumConfig.name, description: (forumConfig as any).description,
      type: "forum" as "zone" | "forum" | "category", parentId,
      colorTheme: forumSemanticColorTheme,
      icon: forumConfig.themeOverride?.icon || parentZoneDataFromConfig?.theme?.icon,
      color: forumConfig.themeOverride?.color || parentZoneDataFromConfig?.theme?.color,
      pluginData: forumPluginData, tippingEnabled: forumConfig.rules.tippingEnabled,
      xpMultiplier: forumConfig.rules.xpMultiplier ?? 1.0,
      isLocked: (forumConfig.rules as any).isLocked ?? (forumConfig as any).isLocked ?? false,
      minXp: (forumConfig.rules as any).minXp ?? (forumConfig as any).minXp ?? 0,
      position: (forumConfig as any).position ?? 0,
    };
    await tx.insert(forumCategories).values(values).onConflictDoUpdate({ target: forumCategories.slug, set: values });
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
