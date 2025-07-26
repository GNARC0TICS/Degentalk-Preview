#!/bin/bash
# Check for debugging artifacts in the codebase

echo "🔍 Checking for debugging artifacts..."
echo ""

# Check for debug logging
echo "📋 Debug/Trace Logging:"
rg -n "logger\.(debug|trace)" --type ts --type tsx --type js --type jsx src/ || echo "  ✅ No debug logging found"
echo ""

# Check for TODO remove comments
echo "📋 Temporary TODOs:"
rg -n "TODO:\s*remove|FIXME:\s*remove|DEBUG|TEMP" --type ts --type tsx --type js --type jsx src/ || echo "  ✅ No temporary TODOs found"
echo ""

# Check for console statements
echo "📋 Console statements:"
rg -n "console\." --type ts --type tsx --type js --type jsx src/ || echo "  ✅ No console statements found"
echo ""

# Check for commented console
echo "📋 Commented console statements:"
rg -n "//\s*console\." --type ts --type tsx --type js --type jsx src/ || echo "  ✅ No commented console statements found"
echo ""

# Check for performance timing
echo "📋 Performance timing code:"
rg -n "performance\.now|console\.time|Date\.now.*timing" --type ts --type tsx --type js --type jsx src/ || echo "  ✅ No performance timing found"
echo ""

echo "✨ Debug artifact check complete!"