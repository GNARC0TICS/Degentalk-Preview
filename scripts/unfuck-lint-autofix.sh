#!/bin/bash
# Lint autofix wave - run before Import-Assassin to cut low-hanging fruit

set -e

echo "🧹 LINT AUTOFIX WAVE"
echo "===================="

# Check if we're on the unfuck branch
current_branch=$(git branch --show-current)
if [[ "$current_branch" != "unfuck/everything" ]]; then
    echo "⚠️  WARNING: Not on unfuck/everything branch (current: $current_branch)"
    echo "💡 Switch to unfuck branch first: git checkout -b unfuck/everything"
    exit 1
fi

# Capture pre-autofix state
echo "📊 Capturing pre-autofix baseline..."
pre_eslint=$(timeout 30s pnpm lint --format json 2>/dev/null | jq -r '.[] | .errorCount' | paste -sd+ | bc 2>/dev/null || echo 'ERR')
echo "  Pre-autofix ESLint errors: $pre_eslint"

# Run autofix with timeout protection
echo ""
echo "🔧 Running ESLint autofix..."

if timeout 120s pnpm lint --fix > /tmp/eslint-autofix.log 2>&1; then
    echo "✅ ESLint autofix completed successfully"
else
    exit_code=$?
    if [[ $exit_code -eq 124 ]]; then
        echo "⏰ ESLint autofix timed out (120s) - partial fixes applied"
    else
        echo "🟡 ESLint autofix completed with remaining issues"
    fi
fi

# Check what got fixed
echo ""
echo "📊 Measuring autofix impact..."
post_eslint=$(timeout 30s pnpm lint --format json 2>/dev/null | jq -r '.[] | .errorCount' | paste -sd+ | bc 2>/dev/null || echo 'ERR')
echo "  Post-autofix ESLint errors: $post_eslint"

# Calculate reduction
if [[ "$pre_eslint" =~ ^[0-9]+$ ]] && [[ "$post_eslint" =~ ^[0-9]+$ ]]; then
    reduction=$((pre_eslint - post_eslint))
    echo "  📉 Errors reduced by: $reduction"
    
    if [[ $reduction -gt 0 ]]; then
        echo "🎉 Autofix SUCCESS: Fixed $reduction lint errors automatically!"
    else
        echo "ℹ️  Autofix had minimal impact (no auto-fixable errors)"
    fi
else
    echo "❓ Cannot calculate reduction (error counting failed)"
fi

# Check git status
echo ""
echo "📁 Checking what files were modified..."
modified_count=$(git diff --name-only | wc -l)
echo "  Files modified: $modified_count"

if [[ $modified_count -gt 0 ]]; then
    echo ""
    echo "📝 Modified files:"
    git diff --name-only | head -10 | sed 's/^/    /'
    if [[ $modified_count -gt 10 ]]; then
        echo "    ... and $((modified_count - 10)) more files"
    fi
    
    echo ""
    echo "💾 Committing autofix changes..."
    git add .
    git commit -m "chore: autofix lint issues before unfucking operation

- ESLint errors: $pre_eslint → $post_eslint
- Files modified: $modified_count
- Reduction: $reduction errors auto-fixed

This clears low-hanging fruit before agent deployment."
    
    echo "✅ Autofix changes committed!"
else
    echo "ℹ️  No files were modified by autofix"
fi

# Provide next steps
echo ""
echo "🚀 AUTOFIX WAVE COMPLETE!"
echo ""
echo "📊 Summary:"
echo "  🔧 ESLint errors: $pre_eslint → $post_eslint"
echo "  📁 Files modified: $modified_count"
echo "  💾 Changes committed: $(if [[ $modified_count -gt 0 ]]; then echo 'YES'; else echo 'NO'; fi)"

echo ""
echo "🎯 Next Steps:"
echo "  1. Deploy Config-Surgeon + Import-Assassin (Wave 1)"
echo "  2. The Import-Assassin will have fewer errors to fix"
echo "  3. Continue with normal unfucking sequence"

echo "===================="