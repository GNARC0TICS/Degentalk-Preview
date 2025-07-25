#!/bin/bash
# Script to refactor all "zone" references to "category" in the codebase

echo "Starting zone → category refactoring..."

# Backend TypeScript files
echo "Updating backend TypeScript files..."
find server/src -name "*.ts" -type f -exec sed -i \
  -e "s/type === 'zone'/type === 'category'/g" \
  -e "s/type !== 'zone'/type !== 'category'/g" \
  -e "s/type: 'zone'/type: 'category'/g" \
  -e "s/'zone' | 'forum'/'category' | 'forum'/g" \
  -e "s/'zone', 'forum'/'category', 'forum'/g" \
  -e "s/'zone', 'category', 'forum'/'category', 'forum'/g" \
  -e "s/\.type = 'zone'/.type = 'category'/g" \
  -e "s/isZone: item\.type === 'zone'/isZone: item.type === 'category'/g" \
  -e "s/canonical: item\.type === 'zone'/canonical: item.type === 'category'/g" \
  -e "s/Zones are canonical/Categories are canonical/g" \
  -e "s/zones don't have direct threads/categories don't have direct threads/g" \
  -e "s/Only forums can have threads, not zones/Only forums can have threads, not categories/g" \
  {} \;

# Update comments and documentation
echo "Updating comments and documentation..."
find server/src -name "*.ts" -type f -exec sed -i \
  -e "s/Zone (type: 'zone')/Category (type: 'category')/g" \
  -e "s/forums within zones/forums within categories/g" \
  -e "s/child forums\/zones/child forums/g" \
  -e "s/forums\/zones/forums\/categories/g" \
  -e "s/zone or forum/category or forum/g" \
  -e "s/zone header/category header/g" \
  {} \;

# Frontend TypeScript files
echo "Updating frontend TypeScript files..."
find client/src -name "*.ts" -name "*.tsx" -type f -exec sed -i \
  -e "s/zoneSlug/forumSlug/g" \
  -e "s/zoneName/categoryName/g" \
  -e "s/zoneTheme/forumTheme/g" \
  -e "s/isPrimaryZone/isPrimaryCategory/g" \
  -e "s/getZoneOrForumDisplayName/getCategoryOrForumDisplayName/g" \
  -e "s/formatZoneName/formatCategoryName/g" \
  -e "s/getZoneThemeKey/getCategoryThemeKey/g" \
  -e "s/MergedZone/MergedCategory/g" \
  -e "s/useZones/useCategories/g" \
  -e "s/useOrderedZones/useOrderedCategories/g" \
  -e "s/ZONE_SLUG_TO_THEME_MAP/CATEGORY_SLUG_TO_THEME_MAP/g" \
  -e "s/getWidgetsForZone/getWidgetsForCategory/g" \
  {} \;

# Update imports
echo "Updating imports..."
find . -name "*.ts" -name "*.tsx" -type f -not -path "*/node_modules/*" -exec sed -i \
  -e "s/import.*ZoneId.*from/import from/g" \
  -e "s/, ZoneId//g" \
  -e "s/ZoneId,//g" \
  {} \;

# Update CSS class references in TypeScript/TSX
echo "Updating CSS class references..."
find client/src -name "*.ts" -name "*.tsx" -type f -exec sed -i \
  -e "s/zone-card/forum-card/g" \
  -e "s/zone-glow/forum-glow/g" \
  -e "s/zone-badge/forum-badge/g" \
  -e "s/zone-pit/forum-pit/g" \
  -e "s/zone-mission-control/forum-mission-control/g" \
  -e "s/zone-casino/forum-casino/g" \
  -e "s/zone-briefing/forum-briefing/g" \
  {} \;

# Update package.json exports
echo "Updating package.json exports..."
sed -i '/"\.\/config\/zoneThemes\.config":/d' shared/package.json

# Remove obsolete files
echo "Removing obsolete files..."
rm -f scripts/db/backfill-configZoneType.ts
rm -f scripts/seed/sync/config-stubs.ts

echo "✅ Zone → Category refactoring complete!"
echo ""
echo "Next steps:"
echo "1. Run the database migration: pnpm tsx scripts/db/remove-zone-type.ts"
echo "2. Run tests to ensure everything works: pnpm test"
echo "3. Commit the changes"