#!/bin/bash
# Setup script for XP system

echo "🚀 Setting up XP system..."

# Get directory of script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Move to project root
cd "$SCRIPT_DIR/.."

# Check if TypeScript and tsx are installed
if ! command -v tsx &> /dev/null; then
  echo "🔧 Installing tsx for running TypeScript directly..."
  npm install -g tsx
fi

echo "⏳ Running database migrations..."
npm run migrate

echo "🌱 Seeding XP actions..."
tsx scripts/seed-xp-actions.ts

echo "✅ XP system setup complete!"
echo ""
echo "🔍 Next steps:"
echo "1. Start the server with 'npm run dev'"
echo "2. Access the XP admin panel at /admin/xp/actions"
echo "3. Test XP awards with the scripts/test-xp-actions.js script" 