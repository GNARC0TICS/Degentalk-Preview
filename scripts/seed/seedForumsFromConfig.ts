import { db } from "../../db";
import { forumCategories } from "../../db/schema/forum/categories";
import { forumMap } from "../../client/src/config/forumMap.config";
import { eq } from "drizzle-orm";
import chalk from "chalk";
import type { ForumTheme, ForumRules as ConfigForumRules, Zone as ConfigZone, Forum as ConfigForum } from "../../client/src/config/forumMap.config";

// Define interfaces for the expected structure of pluginData
interface ForumCategoryPluginData {
  rules?: ConfigForumRules;
  bannerImage?: string | null;
  originalTheme?: ForumTheme | Partial<ForumTheme> | null;
  configZoneType?: 'primary' | 'general';
  configDescription?: string | null;
  [key: string]: any;
}

async function truncateIfDev() {
  if (process.env.NODE_ENV === "development") {
    console.log(chalk.yellow("[DEV] Truncating forum_categories..."));
    // Ensure this command is appropriate for your DB (PostgreSQL specific)
    await db.execute(`TRUNCATE TABLE forum_categories RESTART IDENTITY CASCADE;`);
  }
}

async function seedZonesAndForums() {
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
      // Potentially store full zoneConfig.rules here if not mapped to direct columns
      rules: (zoneConfig as any).rules, // If zones can have rules in config
    };

    const semanticColorTheme = zoneConfig.type === 'primary' ? zoneConfig.slug : undefined;

    const values = {
      slug: zoneConfig.slug,
      name: zoneConfig.name,
      description: zoneConfig.description,
      type: "zone" as "zone" | "forum" | "category", // Ensure type matches schema
      canonical: zoneConfig.type === 'primary',
      colorTheme: semanticColorTheme,
      icon: zoneConfig.theme?.icon,
      color: zoneConfig.theme?.color,
      pluginData: pluginData,
      // Assuming these might come from zoneConfig directly or its rules
      isLocked: (zoneConfig as any).isLocked ?? false,
      minXp: (zoneConfig as any).minXp ?? 0,
      position: (zoneConfig as any).position ?? 0,
    };

    await db
      .insert(forumCategories)
      .values(values)
      .onConflictDoUpdate({
        target: forumCategories.slug,
        set: values,
      });
    console.log(chalk.cyan(`[✓] Synced zone: ${zoneConfig.name} (slug: ${zoneConfig.slug})`));
  }

  const dbZones = await db.select({
    id: forumCategories.id,
    slug: forumCategories.slug,
    color: forumCategories.color, // direct column
    icon: forumCategories.icon,   // direct column
    colorTheme: forumCategories.colorTheme, // direct column
    pluginData: forumCategories.pluginData // for bannerImage, originalTheme etc.
  }).from(forumCategories).where(eq(forumCategories.type, "zone"));

  const dbZoneMap = new Map(dbZones.map(z => [z.slug, z]));

  console.log(chalk.blue(`Seeding ${forumsFromConfig.length} forums...`));
  for (const forumConfig of forumsFromConfig) {
    const parentZoneDataFromConfig = zonesFromConfig.find(z => z.slug === forumConfig.parentZoneSlug);
    const parentDbZone = dbZoneMap.get(forumConfig.parentZoneSlug);

    if (!parentDbZone) {
      console.warn(chalk.red(`⚠️ Could not find parent zone DB record for forum: ${forumConfig.slug} (parentZoneSlug from config: ${forumConfig.parentZoneSlug})`));
      continue;
    }

    const dbParentForumSlug = forumConfig.parentForumSlug || forumConfig.parentZoneSlug;

    const forumPluginData: ForumCategoryPluginData = {
      rules: forumConfig.rules,
      bannerImage: forumConfig.themeOverride?.bannerImage || parentZoneDataFromConfig?.theme?.bannerImage,
      originalTheme: forumConfig.themeOverride || parentZoneDataFromConfig?.theme,
      configDescription: (forumConfig as any).description, // If forums have descriptions in config
    };

    // A forum might have its own 'colorTheme' in its config, or inherit from parent, or default
    const forumSemanticColorTheme = (forumConfig as any).colorTheme || parentDbZone.colorTheme;

    const values = {
      slug: forumConfig.slug,
      name: forumConfig.name,
      description: (forumConfig as any).description, // If Forum type has description
      type: "forum" as "zone" | "forum" | "category",
      parentId: parentDbZone.id,
      parentForumSlug: dbParentForumSlug,
      canonical: false,
      colorTheme: forumSemanticColorTheme,
      icon: forumConfig.themeOverride?.icon || parentZoneDataFromConfig?.theme?.icon,
      color: forumConfig.themeOverride?.color || parentZoneDataFromConfig?.theme?.color,
      pluginData: forumPluginData,
      tippingEnabled: forumConfig.rules.tippingEnabled,
      xpMultiplier: forumConfig.rules.xpMultiplier ?? 1.0,
      isLocked: (forumConfig.rules as any).isLocked ?? (forumConfig as any).isLocked ?? false,
      minXp: (forumConfig.rules as any).minXp ?? (forumConfig as any).minXp ?? 0,
      position: (forumConfig as any).position ?? 0,
    };

    await db
      .insert(forumCategories)
      .values(values)
      .onConflictDoUpdate({
        target: forumCategories.slug,
        set: values,
      });
    console.log(chalk.cyan(`[✓] Synced forum: ${forumConfig.name} (slug: ${forumConfig.slug}) → Parent Slug in DB: ${dbParentForumSlug}`));
  }

  console.log(chalk.green("✅ Forum structure and static themes seeded successfully."));
}

export async function seedForumsFromConfig() {
  await truncateIfDev();
  await seedZonesAndForums();
}

if (import.meta.url === (process.argv[1] ?? '')) {
  (async () => {
    try {
      await seedForumsFromConfig(); // Call the exported function
      process.exit(0);
    } catch (err) {
      console.error(chalk.red("Seeder failed:"), err);
      process.exit(1);
    }
  })();
}
