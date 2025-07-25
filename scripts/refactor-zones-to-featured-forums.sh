#!/bin/bash
# Script to refactor zones to featured forums throughout the codebase

echo "Starting zones → featured forums refactoring..."

# 1. Update type checks for primary/featured forums
echo "Converting primary zone checks to featured forum checks..."
find server/src client/src -name "*.ts" -o -name "*.tsx" -type f -exec sed -i \
  -e "s/isPrimary: item\.type === 'zone' && (item\.pluginData as any)\?\.configZoneType === 'primary'/isFeatured: (item.pluginData as any)?.isFeatured === true/g" \
  -e "s/isPrimary: structure\.type === 'zone' && (structure\.pluginData as any)\?\.configZoneType === 'primary'/isFeatured: (structure.pluginData as any)?.isFeatured === true/g" \
  -e "s/configZoneType === 'primary'/isFeatured === true/g" \
  -e "s/isPrimary/isFeatured/g" \
  {} \;

# 2. Remove 'zone' from type unions
echo "Removing 'zone' from type definitions..."
find server/src client/src -name "*.ts" -o -name "*.tsx" -type f -exec sed -i \
  -e "s/'zone' | 'forum' | 'subforum'/'forum' | 'subforum'/g" \
  -e "s/'zone', 'category', 'forum'/'forum', 'subforum'/g" \
  -e "s/type: 'zone'/type: 'forum'/g" \
  {} \;

# 3. Update zone type checks to use parentId
echo "Converting zone type checks..."
find server/src -name "*.ts" -type f -exec sed -i \
  -e "s/\.type === 'zone'/\.parentId === null/g" \
  -e "s/\.type !== 'zone'/\.parentId !== null/g" \
  -e "s/filter((s) => s\.type === 'zone')/filter((s) => s.parentId === null)/g" \
  {} \;

# 4. Update variable and property names
echo "Renaming zone variables to forum..."
find client/src -name "*.ts" -o -name "*.tsx" -type f -exec sed -i \
  -e "s/allZones/allForums/g" \
  -e "s/const zones =/const topLevelForums =/g" \
  -e "s/featuredForums = allZones\.filter/featuredForums = allForums.filter/g" \
  -e "s/categoriesForNav = allZones/categoriesForNav = allForums/g" \
  {} \;

# 5. Update component and type names
echo "Updating component names..."
find client/src -name "*.ts" -o -name "*.tsx" -type f -exec sed -i \
  -e "s/MergedZone/MergedForum/g" \
  -e "s/useZones/useForums/g" \
  -e "s/: MergedZone/: MergedForum/g" \
  {} \;

# 6. Update comments and documentation
echo "Updating documentation..."
find . -name "*.ts" -o -name "*.tsx" -o -name "*.md" -type f -not -path "*/node_modules/*" -exec sed -i \
  -e "s/primary zones/featured forums/g" \
  -e "s/Primary zones/Featured forums/g" \
  -e "s/primary zone/featured forum/g" \
  -e "s/Zone (type: 'zone')/Forum (top-level)/g" \
  -e "s/zones are canonical/top-level forums are canonical/g" \
  -e "s/Zones are canonical/Top-level forums are canonical/g" \
  {} \;

# 7. Update ForumStructureContext specifically
echo "Updating ForumStructureContext..."
find client/src -name "ForumStructureContext.tsx" -type f -exec sed -i \
  -e "s/Loading Forums\.\.\./Loading Forums.../g" \
  -e "s/export interface MergedZone/export interface MergedForum/g" \
  -e "s/zones: MergedZone/forums: MergedForum/g" \
  -e "s/getZones/getForums/g" \
  -e "s/export const useZones/export const useForums/g" \
  {} \;

# 8. Update isZone properties to isTopLevel
echo "Converting isZone to isTopLevel..."
find server/src client/src -name "*.ts" -o -name "*.tsx" -type f -exec sed -i \
  -e "s/isZone: item\.type === 'zone'/isTopLevel: item.parentId === null/g" \
  -e "s/isZone: structure\.type === 'zone'/isTopLevel: structure.parentId === null/g" \
  -e "s/isZone/isTopLevel/g" \
  {} \;

# 9. Update canonical checks
echo "Updating canonical checks..."
find server/src client/src -name "*.ts" -o -name "*.tsx" -type f -exec sed -i \
  -e "s/canonical: item\.type === 'zone'/canonical: item.parentId === null/g" \
  -e "s/canonical: structure\.type === 'zone'/canonical: structure.parentId === null/g" \
  {} \;

# 10. Clean up old zone references in services
echo "Cleaning up services..."
find server/src -name "*.ts" -type f -exec sed -i \
  -e "s/zones don't have direct threads/top-level forums aggregate child forum threads/g" \
  -e "s/Only forums can have threads, not zones/All forums can have threads/g" \
  -e "s/Calculate aggregated counts for each zone/Calculate aggregated counts for top-level forums/g" \
  -e "s/Aggregate counts for zones/Aggregate counts for top-level forums/g" \
  {} \;

echo "✅ Refactoring complete!"
echo ""
echo "Next steps:"
echo "1. Run the database migration: pnpm tsx scripts/db/zones-to-featured-forums-migration.ts"
echo "2. Check TypeScript: pnpm typecheck"
echo "3. Run tests: pnpm test"
echo "4. Verify no zone references remain: rg -i '\\bzone\\b' --glob '!*.{md,changelog,json}' --glob '!**/node_modules/**'"