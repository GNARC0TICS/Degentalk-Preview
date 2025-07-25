#!/bin/bash

# DegenTalk Conservative Bloat Removal Script
# This script removes only confirmed deprecated features and truly unused code

echo "🧹 DegenTalk Conservative Bloat Removal Script"
echo "=============================================="
echo "This script will remove only confirmed deprecated features and unused packages."
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
echo "📦 Starting conservative bloat removal..."
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

# 1. Remove Deprecated Missions System (confirmed in CLAUDE.md)
echo "1️⃣ Removing deprecated missions system..."
remove_item "server/src/domains/missions"
remove_item "client/src/components/missions"
remove_item "client/src/pages/_archived/missions"
remove_item "client/src/hooks/useMissions.ts"
remove_item "client/src/hooks/useDailyTasks.ts"
remove_item "server/src/cron/mission-reset.ts"

# 2. Remove specific demo components (keeping test components)
echo ""
echo "2️⃣ Removing demo components..."
remove_item "client/src/components/ui/content-feed-demo.tsx"
remove_item "client/src/pages/fixtures-dashboard.tsx"

# 3. Remove already deleted directories
echo ""
echo "3️⃣ Removing already deleted directories..."
remove_item ".devcontainer"
remove_item "SuperClaude"

# 4. Remove orphaned files
echo ""
echo "4️⃣ Removing orphaned files..."
remove_item "client/test-output.css"

# 5. Clean up duplicate Lottie libraries (keep @lottiefiles/dotlottie-react)
echo ""
echo "5️⃣ Removing duplicate Lottie libraries..."
cd client
echo "Removing lottie-react and react-lottie-player (keeping @lottiefiles/dotlottie-react)..."
pnpm remove lottie-react react-lottie-player || true

# 6. Remove truly unused npm packages
echo ""
echo "6️⃣ Removing unused npm packages..."

# Client dependencies
echo "Removing unused client dependencies..."
pnpm remove tw-animate-css elliptic || true

# Server dependencies  
echo "Removing unused server dependencies..."
cd ../server
pnpm remove module-alias tronweb twitter-api-v2 || true

cd ..

# 7. Summary
echo ""
echo "✅ Conservative bloat removal complete!"
echo ""
echo "📊 Summary of removed items:"
echo "- Missions system (deprecated in CLAUDE.md)"
echo "- 2 demo components (kept test components)"
echo "- Duplicate Lottie libraries (kept @lottiefiles/dotlottie-react)"
echo "- 6 truly unused npm packages"
echo "- Already deleted directories"
echo ""
echo "🔍 Items we kept:"
echo "- GSAP (used in navigation)"
echo "- uiverse-showcase.tsx (important)"
echo "- Test components (useful for debugging)"
echo "- ui-playground.tsx (development tool)"
echo ""
echo "⚠️  Next steps:"
echo "1. Run 'pnpm install' to update lockfile"
echo "2. Run 'pnpm typecheck' to check for any broken imports"
echo "3. Run 'pnpm build' to ensure the project still builds"
echo "4. Test that navigation animations still work (GSAP)"
echo "5. Commit these changes"
echo ""
echo "💡 To check for more unused dependencies, run:"
echo "   npx depcheck"
echo ""