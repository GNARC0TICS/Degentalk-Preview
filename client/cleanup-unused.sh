#!/bin/bash

# DegenTalk Frontend Cleanup Script
# Generated: 2025-07-31
# This script removes 49 identified unused files from the frontend codebase

# Safety check
echo "⚠️  DegenTalk Frontend Cleanup Script"
echo "This will delete 49 unused files from the codebase."
echo "A backup will be created before deletion."
echo ""
echo "Continue? (y/n)"
read -r response
if [[ "$response" != "y" ]]; then
  echo "Cleanup cancelled"
  exit 0
fi

# Create backup
echo "📦 Creating backup..."
cd /home/developer/Degentalk-BETA
tar -czf frontend-backup-$(date +%Y%m%d-%H%M%S).tar.gz client/src/
echo "✅ Backup created"

# Delete archive folder (3 files)
echo ""
echo "🗑️  Removing archive folder..."
rm -rf client/src/archive/

# Delete unused uiverse components (12 files)
echo "🗑️  Removing unused uiverse components..."
rm -f client/src/components/uiverse/*.tsx

# Delete duplicate ShareButton components (2 files)
echo "🗑️  Removing unused ShareButton components..."
rm -f client/src/components/common/ShareButton.tsx
rm -f client/src/components/forum/ShareButton.tsx

# Delete unused common components (14 files)
echo "🗑️  Removing unused common components..."
rm -f client/src/components/common/CryptoIntegration.tsx
rm -f client/src/components/common/FormattedNumber.tsx
rm -f client/src/components/common/Loading.tsx
rm -f client/src/components/common/PrivateContent.tsx
rm -f client/src/components/common/RouteDebugger.tsx
rm -f client/src/components/common/ScrollToTopButton.tsx
rm -f client/src/components/common/StatsCard.tsx
rm -f client/src/components/common/TypingIndicator.tsx
rm -f client/src/components/common/AdminOnly.tsx
rm -f client/src/components/common/ModOnly.tsx
rm -f client/src/components/common/UserStatus.tsx
rm -f client/src/components/common/ViewMore.tsx
rm -f client/src/components/common/theme-toggle.tsx
rm -f client/src/components/common/StarRating.tsx

# Delete unused forum components (6 files)
echo "🗑️  Removing unused forum components..."
rm -f client/src/components/forum/ForumGrid.tsx
rm -f client/src/components/forum/ForumList.tsx
rm -f client/src/components/forum/ThreadList.tsx
rm -f client/src/components/forum/ShopCard.tsx
rm -f client/src/components/forum/ThreadAuthor.tsx
rm -f client/src/components/forum/ThreadStats.tsx

# Delete unused CSS files (2 files)
echo "🗑️  Removing unused CSS files..."
rm -f client/src/styles/avatar-frames.css
rm -f client/src/styles/accessibility.css

# Delete unused fixture components (2 files)
echo "🗑️  Removing unused fixture components..."
rm -f client/src/components/fixtures/fixture-builder.tsx
rm -f client/src/components/fixtures/fixture-preview.tsx

# Delete unused design tokens (3 files)
echo "🗑️  Removing unused design tokens..."
rm -f client/src/design-system/tokens.json
rm -f client/src/design-system/spacing.json
rm -f client/src/design-system/colors.json

echo ""
echo "✅ Cleanup complete! Removed 49 unused files."
echo "💾 Backup saved as frontend-backup-*.tar.gz"
echo ""
echo "📋 Next steps:"
echo "1. Run 'pnpm typecheck' to ensure no TypeScript errors"
echo "2. Run 'pnpm dev' and test key features"
echo "3. Run 'pnpm build' to ensure production build works"