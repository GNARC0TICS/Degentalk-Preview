#!/bin/bash
# Enhanced baseline capture with multi-package error isolation

set -e

echo "🔍 CAPTURING ENHANCED BASELINE..."

# Create progress file
cat > unfuck-progress.md << EOF
# DEGENTALK UNFUCKING PROGRESS TRACKER

## Enhanced Baseline ($(date))
Baseline SHA: $(git rev-parse HEAD)
Branch: $(git branch --show-current)

EOF

echo "📊 Counting errors across all packages..."

# Server TypeScript errors
echo "🖥️  Checking server TypeScript..."
server_errors=$(cd server && timeout 60s npx tsc -p tsconfig.build.json 2>&1 | grep -c 'error TS' || echo 'BROKEN')
echo "Server TS Errors: $server_errors" >> unfuck-progress.md

# Client TypeScript errors  
echo "🌐 Checking client TypeScript..."
client_errors=$(cd client && timeout 60s npx tsc --noEmit 2>&1 | grep -c 'error TS' || echo 'BROKEN')
echo "Client TS Errors: $client_errors" >> unfuck-progress.md

# Shared TypeScript errors
echo "🔗 Checking shared TypeScript..."
shared_errors=$(cd shared && timeout 60s npx tsc --noEmit 2>&1 | grep -c 'error TS' 2>/dev/null || echo '0')
echo "Shared TS Errors: $shared_errors" >> unfuck-progress.md

# ESLint errors across all packages
echo "🔍 Checking ESLint errors..."
eslint_errors=$(timeout 30s pnpm lint --format json 2>/dev/null | jq -r '.[] | .errorCount' | paste -sd+ | bc 2>/dev/null || echo 'BROKEN')
echo "ESLint Errors: $eslint_errors" >> unfuck-progress.md

# Database schema drift check
echo "🗄️  Checking database schema drift..."
cd db
schema_status="OK"
if ! npx drizzle-kit generate --name "drift-check" 2>&1 | grep -q "No schema changes"; then
    schema_status="DRIFT_DETECTED"
fi
cd ..
echo "Schema Status: $schema_status" >> unfuck-progress.md

# Calculate total TypeScript errors
if [[ "$server_errors" =~ ^[0-9]+$ ]] && [[ "$client_errors" =~ ^[0-9]+$ ]] && [[ "$shared_errors" =~ ^[0-9]+$ ]]; then
    total_ts=$((server_errors + client_errors + shared_errors))
    echo "Total TS Errors: $total_ts" >> unfuck-progress.md
else
    echo "Total TS Errors: BROKEN" >> unfuck-progress.md
fi

# Agent status tracking
cat >> unfuck-progress.md << EOF

## Agent Status
- Agent 1 (Schema): NOT_STARTED
- Agent 2 (Imports): NOT_STARTED  
- Agent 3 (Types): NOT_STARTED
- Agent 4 (API): NOT_STARTED
- Agent 5 (Config): NOT_STARTED

## Progress Log
$(date): Baseline captured

EOF

echo "✅ Enhanced baseline captured in unfuck-progress.md"
echo ""
echo "📈 BASELINE SUMMARY:"
echo "  Server TS Errors: $server_errors"
echo "  Client TS Errors: $client_errors"  
echo "  Shared TS Errors: $shared_errors"
echo "  ESLint Errors: $eslint_errors"
echo "  Schema Status: $schema_status"
echo ""

if [[ "$schema_status" == "DRIFT_DETECTED" ]]; then
    echo "⚠️  WARNING: Schema drift detected!"
    echo "   Fix schema sync before starting type fixes"
    exit 1
fi

echo "🚀 Ready for agent deployment!"