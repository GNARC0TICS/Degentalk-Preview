#!/bin/bash
# Complete Theme Migration Script
# Final steps to remove old theme system

echo "🎨 Completing Theme System Migration..."

# 1. Run migration with env vars
echo "📊 Running theme migration to database..."
cd server && DATABASE_URL=${DATABASE_URL:-"postgresql://localhost/degentalk"} pnpm tsx src/domains/themes/migrations/consolidate-themes.ts || echo "⚠️  Migration needs DATABASE_URL to be set"

cd ..

# 2. Remove old theme config imports from remaining files
echo "🔧 Cleaning up remaining imports..."

# Update themeFallbacks.ts
if [ -f "client/src/config/themeFallbacks.ts" ]; then
  sed -i.bak "/import.*forumThemes\.config/d" client/src/config/themeFallbacks.ts
  echo "✓ Updated themeFallbacks.ts"
fi

# Update theme.config.example.tsx
if [ -f "client/src/config/theme.config.example.tsx" ]; then
  sed -i.bak "/import.*forumThemes\.config/d" client/src/config/theme.config.example.tsx
  echo "✓ Updated theme.config.example.tsx"
fi

# 3. Check if we can remove the old config file
IMPORTS_COUNT=$(grep -r "forumThemes.config" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | grep -v "// Theme" | grep -v "validate-theme-migration" | wc -l)

echo ""
echo "📈 Import Analysis:"
echo "  Remaining imports: $IMPORTS_COUNT"

if [ "$IMPORTS_COUNT" -le 3 ]; then
  echo ""
  echo "✅ Ready to remove old theme config!"
  echo ""
  echo "Run this command to complete the migration:"
  echo "  rm shared/config/forumThemes.config.ts"
else
  echo ""
  echo "⚠️  Still have $IMPORTS_COUNT files importing the old config"
  echo "  Review and update these files first"
fi

echo ""
echo "🚀 Next Steps:"
echo "1. Ensure server is running with DATABASE_URL set"
echo "2. Test theme API: curl http://localhost:5001/api/themes/context"
echo "3. Check browser console for CSS variables being applied"
echo "4. Remove old config file when ready"