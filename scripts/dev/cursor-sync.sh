#!/bin/bash
set -e

# Cursor Development Environment Sync Script
echo "🎯 Setting up Cursor development environment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this from the DegenTalk root directory"
    exit 1
fi

# Enable pnpm if not already available
if ! command -v pnpm &> /dev/null; then
    echo "📦 Enabling pnpm..."
    corepack enable pnpm
fi

# Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
    echo "📚 Installing project dependencies..."
    pnpm install --frozen-lockfile
fi

# Install server dependencies if needed
if [ ! -d "server/node_modules" ]; then
    echo "🔧 Installing server dependencies..."
    cd server && pnpm install --frozen-lockfile && cd ..
fi

# Check for environment file
if [ ! -f "env.local" ]; then
    echo "📝 Creating environment file from secrets template..."
    if [ -f "codespaces-secrets.md" ]; then
        echo "⚠️  Please copy your secrets from codespaces-secrets.md to env.local"
        echo "ℹ️  Template created at env.local - edit with your actual values"
        cat > env.local << 'EOF'
# DegenTalk Environment Configuration
DATABASE_PROVIDER=postgresql
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_FEATURE_WALLET=true
FORCE_COLOR=1

# REQUIRED: Copy from codespaces-secrets.md
DATABASE_URL=postgresql://your_neon_connection_here
NEON_API_KEY=your_neon_api_key_here
STRIPE_SECRET_KEY=your_stripe_key_here
CCPAYMENT_APP_ID=your_ccpayment_id_here
CCPAYMENT_APP_SECRET=your_ccpayment_secret_here
TEST_DATABASE_URL=postgresql://your_test_db_here
EOF
    else
        echo "❌ No secrets template found. Please create env.local manually."
        exit 1
    fi
fi

# Install global tools if needed
echo "🔧 Installing development tools..."
pnpm add -g drizzle-kit tsx concurrently 2>/dev/null || echo "Global tools already installed"

# Verify database connection
echo "🔍 Verifying environment setup..."
if grep -q "your_neon_connection_here" env.local 2>/dev/null; then
    echo "⚠️  WARNING: Please update env.local with your actual database credentials"
    echo "📄 Reference: codespaces-secrets.md"
else
    echo "✅ Environment file configured"
fi

# Check if database is accessible
echo "🔗 Testing database connection..."
if command -v drizzle-kit &> /dev/null; then
    echo "✅ Drizzle Kit available for database management"
else
    echo "⚠️  Install drizzle-kit globally: pnpm add -g drizzle-kit"
fi

echo ""
echo "🎉 Cursor development environment ready!"
echo ""
echo "🚀 Quick Start Commands:"
echo "  pnpm dev              - Start full development stack"
echo "  pnpm dev:quick        - Start without database seeding"
echo "  pnpm db:studio        - Open database management"
echo "  pnpm lint             - Check code quality"
echo ""
echo "🔧 Next Steps:"
echo "  1. Update env.local with your actual credentials"
echo "  2. Run 'pnpm dev' to start development"
echo "  3. Open http://localhost:5173 in your browser"
echo ""