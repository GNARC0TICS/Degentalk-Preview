#!/bin/bash
# Real-time unfucking status with emoji progress bar

set -e

echo "🔍 DEGENTALK UNFUCKING STATUS"
echo "================================"

# Basic info
echo "📍 Branch: $(git branch --show-current)"
echo "📅 Time: $(date '+%H:%M:%S')"
echo "🔄 Commits: $(git rev-list --count HEAD^..HEAD 2>/dev/null || echo '0')"

# Build lock status
if [[ -f /tmp/degentalk-tsc.lock ]]; then
    echo "🔒 Build Status: LOCKED (another process running)"
else
    echo "🔓 Build Status: AVAILABLE"
fi

echo ""
echo "📊 ERROR COUNTS:"

# Function to safely count errors with timeout
count_errors() {
    local cmd="$1"
    local label="$2"
    local timeout="${3:-30}"
    
    if [[ -f /tmp/degentalk-tsc.lock ]]; then
        echo "  $label: LOCKED"
        return
    fi
    
    local count=$(timeout $timeout bash -c "$cmd" 2>/dev/null | grep -c 'error TS' 2>/dev/null || echo 'ERR')
    
    # Add emoji based on count
    local emoji="❌"
    if [[ "$count" =~ ^[0-9]+$ ]]; then
        if [[ $count -eq 0 ]]; then
            emoji="✅"
        elif [[ $count -lt 10 ]]; then
            emoji="🟡"
        elif [[ $count -lt 50 ]]; then
            emoji="🟠"
        fi
    fi
    
    echo "  $emoji $label: $count"
}

# Count errors across packages
count_errors "cd server && npx tsc -p tsconfig.build.json" "Server TS" 60
count_errors "cd client && npx tsc --noEmit" "Client TS" 45
count_errors "cd shared && npx tsc --noEmit" "Shared TS" 30

# ESLint check (quick)
echo "🔍 ESLint: $(timeout 20s pnpm lint --format json 2>/dev/null | jq -r '.[] | .errorCount' | paste -sd+ | bc 2>/dev/null || echo 'ERR')"

echo ""
echo "🤖 AGENT STATUS:"

# Read agent status from progress file
if [[ -f unfuck-progress.md ]]; then
    grep "Agent.*:" unfuck-progress.md | head -5 | while read line; do
        if echo "$line" | grep -q "NOT_STARTED"; then
            echo "  ⚪ $line"
        elif echo "$line" | grep -q "IN_PROGRESS"; then
            echo "  🟡 $line"
        elif echo "$line" | grep -q "COMPLETE"; then
            echo "  ✅ $line"
        else
            echo "  ❓ $line"
        fi
    done
else
    echo "  📄 No progress file found"
fi

echo ""
echo "🎯 PROGRESS:"

# Calculate progress bar
if [[ -f unfuck-progress.md ]]; then
    # Get baseline and current counts
    baseline=$(grep "Total TS Errors:" unfuck-progress.md | head -1 | awk '{print $4}' 2>/dev/null || echo '0')
    current_server=$(timeout 30s bash -c "cd server && npx tsc -p tsconfig.build.json" 2>/dev/null | grep -c 'error TS' 2>/dev/null || echo '999')
    current_client=$(timeout 30s bash -c "cd client && npx tsc --noEmit" 2>/dev/null | grep -c 'error TS' 2>/dev/null || echo '999')
    
    if [[ "$baseline" =~ ^[0-9]+$ ]] && [[ "$current_server" =~ ^[0-9]+$ ]] && [[ "$current_client" =~ ^[0-9]+$ ]]; then
        current=$((current_server + current_client))
        if [[ $baseline -gt 0 ]]; then
            progress=$(( (baseline - current) * 100 / baseline ))
            if [[ $progress -lt 0 ]]; then progress=0; fi
            if [[ $progress -gt 100 ]]; then progress=100; fi
            
            # Progress bar
            filled=$((progress / 10))
            empty=$((10 - filled))
            bar=$(printf "🟩%.0s" $(seq 1 $filled))$(printf "⬜%.0s" $(seq 1 $empty))
            
            echo "  $bar $progress%"
            echo "  📉 Errors: $baseline → $current (reduced by $((baseline - current)))"
        else
            echo "  📊 Baseline: $baseline (cannot calculate progress)"
        fi
    else
        echo "  ❓ Cannot calculate progress (build issues)"
    fi
else
    echo "  📄 Run 'pnpm unfuck:baseline' to start tracking"
fi

echo ""
echo "🚀 NEXT ACTIONS:"

# Check what should happen next
if [[ -f unfuck-progress.md ]] && grep -q "NOT_STARTED" unfuck-progress.md; then
    echo "  📋 Deploy next agent from the queue"
elif [[ -f unfuck-progress.md ]] && grep -q "IN_PROGRESS" unfuck-progress.md; then
    echo "  ⏳ Wait for current agents to complete"
    echo "  📊 Request build check if agent ready"
else
    echo "  🎯 Ready for final validation"
    echo "  🧪 Run full test suite"
fi

echo "================================"