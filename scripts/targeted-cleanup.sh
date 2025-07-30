#!/bin/bash

# DegenTalk Targeted Cleanup Script
# Focus only on workspace artifacts, not node_modules

set -e

echo "🧹 Starting Targeted DegenTalk Cleanup..."
echo "========================================"

PROJECT_ROOT="/home/developer/Degentalk-BETA"
cd "$PROJECT_ROOT"

# Count files in workspaces only (exclude node_modules)
count_workspace_files() {
    local pattern="$1"
    find shared/ db/ server/ client/ scripts/ -name "$pattern" 2>/dev/null | wc -l
}

echo ""
echo "🎯 PHASE 1: Workspace Compiled Artifacts"
echo "========================================"

# Remove .d.ts files from workspaces
echo "📁 Removing TypeScript declaration files from workspaces..."
d_ts_count=$(count_workspace_files "*.d.ts")
echo "   Found: $d_ts_count .d.ts files in workspaces"
if [ "$d_ts_count" -gt 0 ]; then
    find shared/ db/ server/ client/ scripts/ -name "*.d.ts" -delete 2>/dev/null || true
    echo "   ✅ Removed $d_ts_count .d.ts files"
else
    echo "   ✅ No .d.ts files found in workspaces"
fi

# Remove .d.ts.map files from workspaces
echo "📁 Removing TypeScript declaration map files from workspaces..."
d_ts_map_count=$(count_workspace_files "*.d.ts.map")
echo "   Found: $d_ts_map_count .d.ts.map files in workspaces"
if [ "$d_ts_map_count" -gt 0 ]; then
    find shared/ db/ server/ client/ scripts/ -name "*.d.ts.map" -delete 2>/dev/null || true
    echo "   ✅ Removed $d_ts_map_count .d.ts.map files"
else
    echo "   ✅ No .d.ts.map files found in workspaces"
fi

echo ""
echo "🔍 PHASE 2: JS Files with TS Counterparts"
echo "========================================"

# Remove JS files that have TS counterparts in workspaces
js_removed=0
while IFS= read -r -d '' jsfile; do
    # Skip if it's in node_modules
    if [[ "$jsfile" == *"/node_modules/"* ]]; then
        continue
    fi
    
    tsfile="${jsfile%.js}.ts"
    if [ -f "$tsfile" ]; then
        echo "   Removing: $jsfile (has $tsfile)"
        rm "$jsfile"
        ((js_removed++))
    fi
done < <(find shared/ db/ server/ client/ scripts/ -name "*.js" -type f -print0 2>/dev/null)

echo "   ✅ Removed $js_removed JS files with TS counterparts"

echo ""
echo "🗂️  PHASE 3: Archive Cleanup"
echo "============================"

# Remove archive directories
echo "📁 Removing archive directories..."
archive_dirs=$(find . -type d -name "archive" ! -path "./node_modules/*" 2>/dev/null)
if [ -n "$archive_dirs" ]; then
    echo "$archive_dirs" | while read -r dir; do
        echo "   Removing: $dir"
        rm -rf "$dir"
    done
    echo "   ✅ Removed archive directories"
else
    echo "   ✅ No archive directories found"
fi

# Remove dist directories in workspaces
echo "📁 Removing dist directories from workspaces..."
dist_dirs=$(find shared/ db/ -type d -name "dist" 2>/dev/null)
if [ -n "$dist_dirs" ]; then
    echo "$dist_dirs" | while read -r dir; do
        echo "   Removing: $dir"
        rm -rf "$dir"
    done
    echo "   ✅ Removed dist directories"
else
    echo "   ✅ No dist directories found in workspaces"
fi

echo ""
echo "🗄️  PHASE 4: Cache Cleanup"
echo "=========================="

# Remove cache directories
cache_patterns=(".tscache" "logs" "temp" "tmp")
for pattern in "${cache_patterns[@]}"; do
    echo "📁 Removing $pattern directories..."
    cache_dirs=$(find . -type d -name "$pattern" ! -path "./node_modules/*" 2>/dev/null)
    if [ -n "$cache_dirs" ]; then
        echo "$cache_dirs" | while read -r dir; do
            echo "   Removing: $dir"
            rm -rf "$dir"
        done
        echo "   ✅ Removed $pattern directories"
    else
        echo "   ✅ No $pattern directories found"
    fi
done

# Remove common temporary files
echo "📁 Removing temporary files..."
temp_files=(".DS_Store" "Thumbs.db" "*.swp" "*.swo")
temp_removed=0
for pattern in "${temp_files[@]}"; do
    files=$(find . -name "$pattern" ! -path "./node_modules/*" 2>/dev/null)
    if [ -n "$files" ]; then
        echo "$files" | while read -r file; do
            echo "   Removing: $file"
            rm -f "$file"
            ((temp_removed++))
        done
    fi
done
echo "   ✅ Removed temporary files"

echo ""
echo "📝 PHASE 5: Update .gitignore"
echo "============================="

# Update .gitignore
if ! grep -q "# Cleanup script additions" .gitignore 2>/dev/null; then
    echo "📝 Updating .gitignore..."
    cat >> .gitignore << 'EOF'

# Cleanup script additions
**/*.d.ts
**/*.d.ts.map
shared/dist/
db/dist/
**/archive/
**/.tscache/
**/logs/
**/temp/
**/tmp/
.DS_Store
Thumbs.db
*.swp
*.swo
EOF
    echo "   ✅ Updated .gitignore"
else
    echo "   ✅ .gitignore already updated"
fi

echo ""
echo "🎉 CLEANUP COMPLETE!"
echo "==================="
echo "✅ Compiled artifacts removed from workspaces"
echo "✅ Duplicate JS files removed" 
echo "✅ Archive directories cleaned"
echo "✅ Cache directories removed"
echo "✅ Temporary files cleaned"
echo "✅ .gitignore updated"
echo ""
echo "🚀 Next: Run './scripts/strengthen-architecture.sh' to add architectural scaffolding"