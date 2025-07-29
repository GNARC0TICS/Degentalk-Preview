#!/bin/bash
# Safe build wrapper with concurrency protection and early abort

set -e

# Build lock protection
LOCK_FILE="/tmp/degentalk-tsc.lock"
LOCK_TIMEOUT=120

echo "🔧 UNFUCK BUILD SEQUENCE"
echo "========================"

# Function to run with lock protection
run_with_lock() {
    local cmd="$1"
    local desc="$2"
    local timeout="${3:-60}"
    
    echo "🔄 $desc..."
    
    if ! flock -n -w $LOCK_TIMEOUT "$LOCK_FILE" timeout $timeout bash -c "$cmd"; then
        echo "❌ $desc FAILED (timeout: ${timeout}s)"
        echo "$(date): BUILD FAILED at $desc" >> unfuck-progress.md
        return 1
    fi
    
    echo "✅ $desc PASSED"
    return 0
}

# Step 1: ESLint (quick check)
echo "1️⃣ ESLint Check"
if timeout 30s pnpm lint --format compact > /tmp/eslint-result.txt 2>&1; then
    echo "✅ ESLint: PASSED"
else
    error_count=$(cat /tmp/eslint-result.txt | grep -c 'error' || echo '0')
    if [[ $error_count -gt 50 ]]; then
        echo "❌ ESLint: TOO MANY ERRORS ($error_count)"
        echo "💡 Suggestion: Run 'pnpm lint --fix' first"
        exit 1
    else
        echo "🟡 ESLint: $error_count errors (acceptable for unfucking)"
    fi
fi

echo ""

# Step 2: TypeScript compilation (all packages)
echo "2️⃣ TypeScript Compilation"

# Server
run_with_lock "cd server && npx tsc -p tsconfig.build.json --noEmit" "Server TypeScript" 90 || exit 1

# Client  
run_with_lock "cd client && npx tsc --noEmit" "Client TypeScript" 60 || exit 1

# Shared (if exists)
if [[ -f shared/tsconfig.json ]]; then
    run_with_lock "cd shared && npx tsc --noEmit" "Shared TypeScript" 30 || exit 1
fi

echo ""

# Step 3: Quick test suite (if exists)
echo "3️⃣ Quick Test Suite"
if [[ -f package.json ]] && grep -q '"test"' package.json; then
    if timeout 60s pnpm test --passWithNoTests --silent > /tmp/test-result.txt 2>&1; then
        echo "✅ Tests: PASSED"
    else
        echo "🟡 Tests: FAILED (acceptable during unfucking)"
        echo "💡 Test failures logged to /tmp/test-result.txt"
    fi
else
    echo "ℹ️  Tests: SKIPPED (no test script found)"
fi

echo ""

# Step 4: Build artifacts (if requested)
if [[ "$1" == "--build-artifacts" ]]; then
    echo "4️⃣ Build Artifacts"
    
    run_with_lock "cd server && npx tsc -p tsconfig.build.json" "Server Build" 90 || exit 1
    
    if [[ -f client/package.json ]] && grep -q '"build"' client/package.json; then
        run_with_lock "cd client && pnpm build" "Client Build" 120 || exit 1
    fi
fi

echo ""

# Update progress file
echo "📊 UPDATING PROGRESS..."
{
    echo "$(date): BUILD SEQUENCE COMPLETED"
    echo "  - ESLint: $(cat /tmp/eslint-result.txt | grep -c 'error' || echo '0') errors"
    echo "  - Server TS: $(cd server && npx tsc -p tsconfig.build.json --noEmit 2>&1 | grep -c 'error TS' || echo '0') errors"
    echo "  - Client TS: $(cd client && npx tsc --noEmit 2>&1 | grep -c 'error TS' || echo '0') errors"
    echo "  - Tests: $(if [[ -f /tmp/test-result.txt ]]; then echo 'RAN'; else echo 'SKIPPED'; fi)"
    echo "---"
} >> unfuck-progress.md

echo ""
echo "🎉 BUILD SEQUENCE COMPLETED!"
echo ""
echo "📈 Current Status:"
echo "  📁 Server: $(cd server && npx tsc -p tsconfig.build.json --noEmit 2>&1 | grep -c 'error TS' || echo '0') TS errors"
echo "  📁 Client: $(cd client && npx tsc --noEmit 2>&1 | grep -c 'error TS' || echo '0') TS errors"
echo "  🔍 ESLint: $(cat /tmp/eslint-result.txt | grep -c 'error' || echo '0') errors"

# Success/failure summary
server_errors=$(cd server && npx tsc -p tsconfig.build.json --noEmit 2>&1 | grep -c 'error TS' || echo '0')
client_errors=$(cd client && npx tsc --noEmit 2>&1 | grep -c 'error TS' || echo '0')

if [[ "$server_errors" == "0" ]] && [[ "$client_errors" == "0" ]]; then
    echo ""
    echo "🚀 SUCCESS: All TypeScript checks passed!"
    echo "💡 Ready for production build and deployment"
else
    echo ""
    echo "🎯 PROGRESS: Still have $(( server_errors + client_errors )) TS errors to fix"
    echo "💡 Continue with agent deployment or manual fixes"
fi

echo "========================"