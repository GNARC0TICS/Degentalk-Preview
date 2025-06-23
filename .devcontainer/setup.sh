#!/bin/bash
set -e

echo "🚀 Setting up DegenTalk development environment..."

# Enable pnpm
echo "📦 Enabling pnpm..."
corepack enable pnpm
pnpm --version

# Install global packages
echo "🔧 Installing global development tools..."
pnpm add -g \
  vitest \
  drizzle-kit \
  neonctl \
  @superclaude/cli \
  tsx \
  concurrently

# Verify installations
echo "✅ Verifying global installations..."
vitest --version || echo "⚠️  vitest not found"
drizzle-kit --version || echo "⚠️  drizzle-kit not found"
neonctl --version || echo "⚠️  neonctl not found"
tsx --version || echo "⚠️  tsx not found"

# Add SuperClaude alias to bashrc
echo "🔗 Adding SuperClaude alias..."
echo 'alias sc="superclaude"' >> ~/.bashrc
echo 'alias scload="superclaude /user:load --depth deep"' >> ~/.bashrc
echo 'alias scplan="superclaude /user:load --depth deep --plan"' >> ~/.bashrc

# Source bashrc for current session
source ~/.bashrc || true

# Install project dependencies with frozen lockfile
echo "📚 Installing project dependencies..."
if [ -f "package.json" ]; then
  pnpm install --frozen-lockfile
else
  echo "⚠️  No package.json found in root"
fi

# Install server dependencies
echo "🔧 Installing server dependencies..."
if [ -f "server/package.json" ]; then
  cd server && pnpm install --frozen-lockfile && cd ..
else
  echo "⚠️  No server/package.json found"
fi

# Create environment file template
echo "📝 Setting up environment template..."
if [ ! -f "env.local" ]; then
  cat > env.local << EOF
# DegenTalk Environment Configuration
NODE_ENV=development
PORT=5001
VITE_PORT=5173

# Database (Required)
DATABASE_URL=postgresql://user:password@localhost:5432/degentalk

# Neon Database (Optional - for production sync)
NEON_API_KEY=your_neon_api_key_here
NEON_PROJECT_ID=your_neon_project_id_here

# Development Settings
QUICK_MODE=false
FORCE_COLOR=1

# Security (Development)
JWT_SECRET=dev_jwt_secret_change_in_production
SESSION_SECRET=dev_session_secret_change_in_production
EOF
  echo "📄 Created env.local template - update with your values"
else
  echo "✅ env.local already exists"
fi

# Create development directories
echo "📁 Creating development directories..."
mkdir -p logs
mkdir -p uploads
mkdir -p temp

# Set up git hooks (if simple-git-hooks is available)
echo "🔗 Setting up git hooks..."
if command -v simple-git-hooks >/dev/null 2>&1; then
  npx simple-git-hooks || echo "⚠️  Git hooks setup skipped"
fi

# Display completion message
echo ""
echo "🎉 DegenTalk development environment setup complete!"
echo ""
echo "🚀 Quick Start Commands:"
echo "  pnpm dev              - Start full development stack"
echo "  pnpm dev:quick        - Start without seeding"
echo "  pnpm db:studio        - Open Drizzle Studio"
echo "  sc /user:load --plan  - Load project with SuperClaude"
echo ""
echo "📋 Next Steps:"
echo "  1. Update env.local with your database credentials"
echo "  2. Run 'pnpm dev' to start the development server"
echo "  3. Access the app at http://localhost:5173"
echo ""
echo "🔧 Available Aliases:"
echo "  sc        - superclaude"
echo "  scload    - superclaude /user:load --depth deep"
echo "  scplan    - superclaude /user:load --depth deep --plan"
echo ""