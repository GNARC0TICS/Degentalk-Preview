#!/bin/bash
# Script to completely remove "zone" concept from the codebase
# Zones are converted to top-level forums

echo "Starting complete zone removal..."

# 1. Update type definitions - remove 'zone' from union types
echo "Removing 'zone' from type unions..."
find server/src client/src -name "*.ts" -o -name "*.tsx" -type f -exec sed -i \
  -e "s/'zone' | 'forum' | 'subforum'/'forum' | 'subforum'/g" \
  -e "s/'zone', 'category', 'forum'/'category', 'forum'/g" \
  -e "s/'zone', 'forum'/'forum'/g" \
  {} \;

# 2. Update type checks - zones become top-level forums
echo "Converting zone type checks to forum checks..."
find server/src -name "*.ts" -type f -exec sed -i \
  -e "s/type === 'zone'/parentId === null/g" \
  -e "s/type !== 'zone'/parentId !== null/g" \
  -e "s/s\.type === 'zone'/s.parentId === null/g" \
  -e "s/item\.type === 'zone'/item.parentId === null/g" \
  -e "s/structure\.type === 'zone'/structure.parentId === null/g" \
  {} \;

# 3. Update isZone properties
echo "Updating isZone properties..."
find server/src client/src -name "*.ts" -o -name "*.tsx" -type f -exec sed -i \
  -e "s/isZone: item\.type === 'zone'/isZone: item.parentId === null/g" \
  -e "s/isZone: structure\.type === 'zone'/isZone: structure.parentId === null/g" \
  -e "s/canonical: item\.type === 'zone'/canonical: item.parentId === null/g" \
  -e "s/canonical: structure\.type === 'zone'/canonical: structure.parentId === null/g" \
  {} \;

# 4. Update zone-specific variable names
echo "Renaming zone variables to forum..."
find client/src -name "*.ts" -o -name "*.tsx" -type f -exec sed -i \
  -e "s/zoneSlug/forumSlug/g" \
  -e "s/zoneId/forumId/g" \
  -e "s/zoneName/forumName/g" \
  -e "s/zoneTheme/forumTheme/g" \
  -e "s/zoneThemeClass/forumThemeClass/g" \
  -e "s/parentZone/parentForum/g" \
  -e "s/const zones =/const topLevelForums =/g" \
  -e "s/allZones/allForums/g" \
  {} \;

# 5. Update function names
echo "Updating function names..."
find client/src -name "*.ts" -o -name "*.tsx" -type f -exec sed -i \
  -e "s/isPrimaryZone/isFeaturedForum/g" \
  -e "s/getZoneOrForumDisplayName/getForumDisplayName/g" \
  -e "s/formatZoneName/formatForumName/g" \
  -e "s/getZoneThemeKey/getForumThemeKey/g" \
  -e "s/getWidgetsForZone/getWidgetsForForum/g" \
  -e "s/useZones/useTopLevelForums/g" \
  -e "s/useOrderedZones/useOrderedForums/g" \
  {} \;

# 6. Update component names
echo "Updating component names..."
find client/src -name "*.ts" -o -name "*.tsx" -type f -exec sed -i \
  -e "s/MergedZone/MergedForum/g" \
  -e "s/ZonePageSidebar/ForumPageSidebar/g" \
  -e "s/ZoneThemeExample/ForumThemeExample/g" \
  {} \;

# 7. Update constants and maps
echo "Updating constants..."
find client/src -name "*.ts" -o -name "*.tsx" -type f -exec sed -i \
  -e "s/ZONE_SLUG_TO_THEME_MAP/FORUM_SLUG_TO_THEME_MAP/g" \
  -e "s/ZONE_THEMES/FORUM_THEMES/g" \
  -e "s/DEFAULT_ZONE_THEMES/DEFAULT_FORUM_THEMES/g" \
  -e "s/DefaultZoneTheme/DefaultForumTheme/g" \
  {} \;

# 8. Update route patterns
echo "Updating routes..."
find client/src -name "*.ts" -o -name "*.tsx" -type f -exec sed -i \
  -e "s|/zones/|/forums/|g" \
  -e "s/LEGACY_ZONE/LEGACY_FORUM/g" \
  -e "s/primary-zone/featured-forum/g" \
  {} \;

# 9. Update comments and documentation
echo "Updating comments..."
find . -name "*.ts" -o -name "*.tsx" -o -name "*.md" -type f -not -path "*/node_modules/*" -exec sed -i \
  -e "s/Zone (type: 'zone')/Top-level Forum/g" \
  -e "s/zones and forums/forums/g" \
  -e "s/zone or forum/forum/g" \
  -e "s/zones don't have/top-level forums don't have/g" \
  -e "s/Zones are canonical/Top-level forums are canonical/g" \
  -e "s/within zones/within top-level forums/g" \
  -e "s/zone hierarchy/forum hierarchy/g" \
  {} \;

# 10. Remove zone-specific files
echo "Removing zone-specific files..."
rm -f server/src/domains/zone/**/*.ts
rm -f scripts/db/backfill-configZoneType.ts
rm -f scripts/db/updateZoneStats.ts
rm -f scripts/db/recalculateZoneMomentum.ts

echo "✅ Zone removal complete!"
echo ""
echo "Next steps:"
echo "1. Run the database migration: pnpm tsx scripts/db/zones-to-forums-migration.ts"
echo "2. Run TypeScript compiler to check for errors: pnpm typecheck"
echo "3. Run tests: pnpm test"
echo "4. Search for any remaining 'zone' references: rg -i 'zone' --glob '!*.{md,changelog}'"