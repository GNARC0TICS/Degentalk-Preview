import { db } from "../../db";
import { forumCategories } from "../../db/schema/forum/categories";
import { forumMap, Zone as ConfigZone, Forum as ConfigForum, ForumTheme, ForumRules } from "../../client/src/config/forumMap.config";
import { eq, isNull, or } from "drizzle-orm";
import chalk from "chalk";

type DbCategory = typeof forumCategories.$inferSelect;

interface Discrepancy {
  type: 'missing_in_db' | 'missing_in_config' | 'property_mismatch';
  entityType: 'zone' | 'forum';
  slug: string;
  property?: string;
  expected?: any;
  actual?: any;
  message?: string;
}

const discrepancies: Discrepancy[] = [];

// Helper to stringify for comparison, handling undefined
const stableStringify = (obj: any) => {
  if (obj === undefined) return 'undefined';
  if (obj === null) return 'null';
  // Sort object keys for consistent stringification
  if (typeof obj === 'object' && obj !== null) {
    const sortedObj = Object.keys(obj)
      .sort()
      .reduce((acc, key) => {
        acc[key] = obj[key];
        return acc;
      }, {} as any);
    return JSON.stringify(sortedObj);
  }
  return JSON.stringify(obj);
};


async function checkForumConfigSync() {
  console.log(chalk.blue("Starting forum configuration sync check..."));

  const dbCategories: DbCategory[] = await db.select().from(forumCategories);
  const dbZones = dbCategories.filter(cat => cat.type === 'zone');
  const dbForums = dbCategories.filter(cat => cat.type === 'forum');

  const configZones = forumMap.zones;
  const configForums: (ConfigForum & { parentZoneSlug: string })[] = [];
  configZones.forEach(zone => {
    zone.forums.forEach(forum => {
      configForums.push({ ...forum, parentZoneSlug: zone.slug });
    });
  });

  // 1. Check zones
  console.log(chalk.cyan("Checking zones..."));
  for (const cz of configZones) {
    const dz = dbZones.find(dbz => dbz.slug === cz.slug);
    if (!dz) {
      discrepancies.push({
        type: 'missing_in_db',
        entityType: 'zone',
        slug: cz.slug,
        message: `Zone '${cz.slug}' found in config but not in DB.`
      });
      continue;
    }

    // Compare properties for zones
    if (cz.name !== dz.name) {
      discrepancies.push({ type: 'property_mismatch', entityType: 'zone', slug: cz.slug, property: 'name', expected: cz.name, actual: dz.name });
    }

    const dbPluginData = dz.pluginData as any; // Type assertion for easier access

    if (cz.description !== dbPluginData?.description) {
        discrepancies.push({ type: 'property_mismatch', entityType: 'zone', slug: cz.slug, property: 'description (from pluginData)', expected: cz.description, actual: dbPluginData?.description });
    }
    if (cz.type !== dbPluginData?.configZoneType) {
        discrepancies.push({ type: 'property_mismatch', entityType: 'zone', slug: cz.slug, property: 'config type (from pluginData)', expected: cz.type, actual: dbPluginData?.configZoneType });
    }
    if (stableStringify(cz.theme) !== stableStringify(dbPluginData?.theme)) {
        discrepancies.push({ type: 'property_mismatch', entityType: 'zone', slug: cz.slug, property: 'theme (from pluginData)', expected: cz.theme, actual: dbPluginData?.theme });
    }
     if ((cz.type === 'primary') !== dz.canonical) {
        discrepancies.push({ type: 'property_mismatch', entityType: 'zone', slug: cz.slug, property: 'canonical (derived from type)', expected: (cz.type === 'primary'), actual: dz.canonical });
    }
  }

  // Check for zones in DB not in config
  for (const dz of dbZones) {
    if (!configZones.some(cz => cz.slug === dz.slug)) {
      discrepancies.push({
        type: 'missing_in_config',
        entityType: 'zone',
        slug: dz.slug,
        message: `Zone '${dz.slug}' found in DB but not in config.`
      });
    }
  }

  // 2. Check forums
  console.log(chalk.cyan("Checking forums..."));
  for (const cf of configForums) {
    const df = dbForums.find(dbf => dbf.slug === cf.slug);
    if (!df) {
      discrepancies.push({
        type: 'missing_in_db',
        entityType: 'forum',
        slug: cf.slug,
        message: `Forum '${cf.slug}' found in config but not in DB.`
      });
      continue;
    }

    // Compare properties for forums
    if (cf.name !== df.name) {
      discrepancies.push({ type: 'property_mismatch', entityType: 'forum', slug: cf.slug, property: 'name', expected: cf.name, actual: df.name });
    }

    // Parent check
    const expectedDbParentForumSlug = cf.parentForumSlug || cf.parentZoneSlug;
    if (expectedDbParentForumSlug !== df.parentForumSlug) {
        discrepancies.push({ type: 'property_mismatch', entityType: 'forum', slug: cf.slug, property: 'parentForumSlug', expected: expectedDbParentForumSlug, actual: df.parentForumSlug });
    }
    // Also check parentId linkage
    const parentDbZone = dbZones.find(dbz => dbz.slug === cf.parentZoneSlug);
    if (parentDbZone?.id !== df.parentId) {
        discrepancies.push({ type: 'property_mismatch', entityType: 'forum', slug: cf.slug, property: 'parentId', expected: parentDbZone?.id, actual: df.parentId, message: `Expected parent zone '${cf.parentZoneSlug}' ID.` });
    }


    // Rules and ThemeOverride from pluginData
    const dfPluginData = df.pluginData as any; // Type assertion

    if (stableStringify(cf.rules) !== stableStringify(dfPluginData?.rules)) {
        discrepancies.push({ type: 'property_mismatch', entityType: 'forum', slug: cf.slug, property: 'rules (from pluginData)', expected: cf.rules, actual: dfPluginData?.rules });
    }
    if (stableStringify(cf.themeOverride) !== stableStringify(dfPluginData?.themeOverride)) {
        // Handle case where cf.themeOverride is undefined but dfPluginData.themeOverride is null (from seed script)
        if (!(cf.themeOverride === undefined && dfPluginData?.themeOverride === null)) {
             discrepancies.push({ type: 'property_mismatch', entityType: 'forum', slug: cf.slug, property: 'themeOverride (from pluginData)', expected: cf.themeOverride, actual: dfPluginData?.themeOverride });
        }
    }

    // Direct rule properties
    if (cf.rules.tippingEnabled !== df.tippingEnabled) {
        discrepancies.push({ type: 'property_mismatch', entityType: 'forum', slug: cf.slug, property: 'tippingEnabled', expected: cf.rules.tippingEnabled, actual: df.tippingEnabled });
    }
    const expectedXpMultiplier = cf.rules.xpMultiplier ?? 1.0;
    if (expectedXpMultiplier !== df.xpMultiplier) {
        discrepancies.push({ type: 'property_mismatch', entityType: 'forum', slug: cf.slug, property: 'xpMultiplier', expected: expectedXpMultiplier, actual: df.xpMultiplier });
    }

    // Derived theme properties (color, icon)
    const parentZoneForTheme = dbZones.find(z => z.id === df.parentId);
    const parentZoneThemeFromPlugin = parentZoneForTheme?.pluginData as any;

    const expectedColor = cf.themeOverride?.color || parentZoneThemeFromPlugin?.theme?.color || 'gray';
    if (expectedColor !== df.color) {
        discrepancies.push({ type: 'property_mismatch', entityType: 'forum', slug: cf.slug, property: 'color (derived)', expected: expectedColor, actual: df.color });
    }

    const expectedIcon = cf.themeOverride?.icon || parentZoneThemeFromPlugin?.theme?.icon || 'hash';
    if (expectedIcon !== df.icon) {
        discrepancies.push({ type: 'property_mismatch', entityType: 'forum', slug: cf.slug, property: 'icon (derived)', expected: expectedIcon, actual: df.icon });
    }

    if (df.canonical !== false) { // Forums are never canonical according to seed script
        discrepancies.push({ type: 'property_mismatch', entityType: 'forum', slug: cf.slug, property: 'canonical', expected: false, actual: df.canonical });
    }
  }

  // Check for forums in DB not in config
  for (const df of dbForums) {
    if (!configForums.some(cf => cf.slug === df.slug)) {
      discrepancies.push({
        type: 'missing_in_config',
        entityType: 'forum',
        slug: df.slug,
        message: `Forum '${df.slug}' found in DB but not in config.`
      });
    }
  }

  // 3. Report discrepancies
  if (discrepancies.length > 0) {
    console.log(chalk.red(`\nFound ${discrepancies.length} discrepancies:`));
    discrepancies.forEach(d => {
      console.log(chalk.yellow(`\n--- ${d.entityType.toUpperCase()} Discrepancy: ${d.slug} ---`));
      if (d.type === 'missing_in_db') {
        console.log(chalk.red(`  Missing in DB: ${d.message}`));
      } else if (d.type === 'missing_in_config') {
        console.log(chalk.red(`  Missing in Config: ${d.message}`));
      } else if (d.type === 'property_mismatch') {
        console.log(chalk.magenta(`  Property Mismatch: '${d.property}'`));
        console.log(chalk.green(`    Expected (config): ${stableStringify(d.expected)}`));
        console.log(chalk.red(`    Actual (DB):     ${stableStringify(d.actual)}`));
        if (d.message) console.log(chalk.gray(`    Note: ${d.message}`));
      }
    });
  } else {
    console.log(chalk.green("\n✅ No discrepancies found. Configuration is in sync with the database."));
  }

  console.log(chalk.blue("\nForum configuration sync check finished."));
}


async function main() {
  try {
    await checkForumConfigSync();
    process.exit(0);
  } catch (error) {
    console.error(chalk.red("Error during sync check:"), error);
    process.exit(1);
  }
}

main();
