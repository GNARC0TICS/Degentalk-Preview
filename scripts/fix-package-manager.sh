#!/bin/bash
# Fix package manager conflicts in Codespaces

echo "🔧 Fixing package manager conflicts..."

# Remove npm lockfile if it exists (keep pnpm as primary)
if [ -f "package-lock.json" ]; then
    echo "📦 Removing package-lock.json (using pnpm as primary)"
    rm package-lock.json
fi

# Ensure .npmrc favors pnpm
echo "📝 Configuring .npmrc for pnpm preference"
cat > .npmrc << 'EOF'
package-manager=pnpm
auto-install-peers=true
shamefully-hoist=true
EOF

# Clear any npm cache conflicts
echo "🧹 Clearing npm cache"
npm cache clean --force 2>/dev/null || true

# Reinstall with pnpm to ensure clean state
echo "📦 Reinstalling dependencies with pnpm"
rm -rf node_modules
pnpm install --frozen-lockfile

echo "✅ Package manager conflicts resolved!"
echo "🚀 Try running: pnpm dev:quick"