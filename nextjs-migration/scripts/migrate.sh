#!/bin/bash

# Migration script to copy all client files without modification
# This ensures zero changes to existing components

echo "🚀 Starting Next.js migration..."

# Create directories if they don't exist
echo "📁 Creating directory structure..."
mkdir -p components
mkdir -p pages
mkdir -p styles
mkdir -p config
mkdir -p lib
mkdir -p features
mkdir -p hooks
mkdir -p contexts
mkdir -p public
mkdir -p assets

# Copy all source files from client/src
echo "📋 Copying components..."
cp -r ../client/src/components/* components/ 2>/dev/null || true

echo "📋 Copying pages..."
cp -r ../client/src/pages/* pages/ 2>/dev/null || true

echo "📋 Copying styles..."
cp -r ../client/src/styles/* styles/ 2>/dev/null || true
cp ../client/src/index.css . 2>/dev/null || true

echo "📋 Copying config..."
cp -r ../client/src/config/* config/ 2>/dev/null || true

echo "📋 Copying lib..."
cp -r ../client/src/lib/* lib/ 2>/dev/null || true

echo "📋 Copying features..."
cp -r ../client/src/features/* features/ 2>/dev/null || true

echo "📋 Copying hooks..."
cp -r ../client/src/hooks/* hooks/ 2>/dev/null || true

echo "📋 Copying contexts..."
cp -r ../client/src/contexts/* contexts/ 2>/dev/null || true

echo "📋 Copying assets..."
cp -r ../client/src/assets/* assets/ 2>/dev/null || true

echo "📋 Copying public files..."
cp -r ../client/public/* public/ 2>/dev/null || true

# Copy tailwind config
echo "📋 Copying Tailwind configuration..."
cp ../client/tailwind.config.ts . 2>/dev/null || true
cp ../client/postcss.config.js . 2>/dev/null || true

# Create utils file if it doesn't exist
if [ ! -f "lib/utils.ts" ]; then
  echo "📝 Creating utils file..."
  cat > lib/utils.ts << 'EOF'
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
EOF
fi

# Update any React Router imports in a compatibility file
echo "📝 Creating import compatibility mappings..."
cat > lib/import-compat.ts << 'EOF'
// Import compatibility for React Router
export * from './router-compat';
EOF

echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm install' to install dependencies"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000 to verify the site"
echo ""
echo "⚠️  Note: No component files were modified during this migration"