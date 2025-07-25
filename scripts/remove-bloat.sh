#!/bin/bash

# DegenTalk Bloat Removal Script
# WARNING: This script will permanently delete files. Make sure you have a backup!

echo "🧹 DegenTalk Bloat Removal Script"
echo "================================"
echo "This script will remove deprecated features and unused code."
echo "Make sure you have committed all changes before running this!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -n 3 -r
echo ""
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]
then
    echo "Aborted. No files were deleted."
    exit 1
fi

echo ""
echo "📦 Starting bloat removal..."
echo ""

# Function to safely remove files/directories
remove_item() {
    if [ -e "$1" ]; then
        echo "❌ Removing: $1"
        rm -rf "$1"
    else
        echo "⚠️  Already removed: $1"
    fi
}

# 1. Remove Deprecated Missions System
echo "1️⃣ Removing deprecated missions system..."
remove_item "server/src/domains/missions"
remove_item "client/src/components/missions"
remove_item "client/src/pages/_archived/missions"
remove_item "client/src/hooks/useMissions.ts"
remove_item "client/src/hooks/useDailyTasks.ts"
remove_item "server/src/cron/mission-reset.ts"

# 2. Remove Test/Demo Components
echo ""
echo "2️⃣ Removing test and demo components..."
remove_item "client/src/components/test"
remove_item "client/src/components/ui/content-feed-demo.tsx"
remove_item "client/src/components/dev/dev-playground-shortcut.tsx"
remove_item "client/src/pages/fixtures-dashboard.tsx"
remove_item "client/src/pages/ui-playground.tsx"
remove_item "client/src/pages/uiverse-showcase.tsx"
remove_item "client/test-output.css"

# 3. Remove Orphaned Files
echo ""
echo "3️⃣ Removing orphaned files..."
remove_item ".devcontainer"
remove_item "SuperClaude"
remove_item "server/src/config/forum.config.ts"
remove_item "shared/config/forum.config.ts"
remove_item "client/src/config/forumMap.config.ts"

# 4. Remove Unused Domains
echo ""
echo "4️⃣ Removing unused server domains..."
remove_item "server/src/domains/advertising"

# 5. Remove Archived Pages
echo ""
echo "5️⃣ Removing archived pages..."
remove_item "client/src/pages/_archived"

# 6. Clean up unused dependencies
echo ""
echo "6️⃣ Removing unused npm packages..."

# Client dependencies
echo "Removing unused client dependencies..."
cd client
pnpm remove gsap tw-animate-css lottie-react react-lottie-player elliptic || true

# Move faker to dev dependencies
echo "Moving faker to dev dependencies..."
pnpm remove @faker-js/faker || true
pnpm add -D @faker-js/faker || true

# Server dependencies  
echo "Removing unused server dependencies..."
cd ../server
pnpm remove module-alias tronweb twitter-api-v2 csv-parser || true

cd ..

# 7. Clean node_modules and reinstall
echo ""
echo "7️⃣ Cleaning and reinstalling dependencies..."
read -p "Do you want to clean node_modules and reinstall? (yes/no): " -n 3 -r
echo ""
if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]
then
    echo "Cleaning node_modules..."
    rm -rf node_modules client/node_modules server/node_modules db/node_modules shared/node_modules scripts/node_modules
    echo "Reinstalling dependencies..."
    pnpm install
fi

# 8. Summary
echo ""
echo "✅ Bloat removal complete!"
echo ""
echo "📊 Summary of removed items:"
echo "- Missions system (deprecated feature)"
echo "- Test and demo components"
echo "- Development container files"
echo "- Unused server domains"
echo "- Archived pages"
echo "- 9 unused npm packages"
echo ""
echo "⚠️  Next steps:"
echo "1. Run 'pnpm typecheck' to check for any broken imports"
echo "2. Run 'pnpm build' to ensure the project still builds"
echo "3. Commit these changes with message: 'chore: remove bloat and unused dependencies'"
echo ""
echo "💡 Tip: To optimize the build further, run:"
echo "   cd client && pnpm build:optimize"
echo ""