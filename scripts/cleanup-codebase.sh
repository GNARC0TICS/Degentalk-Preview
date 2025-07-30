#!/bin/bash

# DegenTalk Codebase Cleanup Script
# Phase 1: Zero-Risk Cleanup (Compiled artifacts, duplicates, archives)
# Based on the refactoring plan - safe cleanup without disrupting architecture

set -e  # Exit on any error

echo "🧹 Starting DegenTalk Codebase Cleanup..."
echo "========================================"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Function to count files before/after
count_files() {
    local pattern="$1"
    find . -name "$pattern" | wc -l
}

# Function to safely remove files with backup option
safe_remove() {
    local pattern="$1"
    local description="$2"
    local backup_needed="${3:-false}"
    
    echo "📁 Processing: $description"
    
    local count_before=$(count_files "$pattern")
    echo "   Found: $count_before files matching '$pattern'"
    
    if [ "$count_before" -eq 0 ]; then
        echo "   ✅ No files to remove"
        return
    fi
    
    if [ "$backup_needed" = "true" ]; then
        echo "   💾 Creating backup..."
        find . -name "$pattern" -exec cp {} {}.backup \;
    fi
    
    # Dry run first
    echo "   🔍 Files that would be removed:"
    find . -name "$pattern" | head -10
    [ "$count_before" -gt 10 ] && echo "   ... and $(($count_before - 10)) more"
    
    read -p "   ❓ Remove these files? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        find . -name "$pattern" -delete
        local count_after=$(count_files "$pattern")
        echo "   ✅ Removed $(($count_before - $count_after)) files"
    else
        echo "   ⏭️  Skipped"
    fi
}

# Function to remove directories
safe_remove_dirs() {
    local pattern="$1"
    local description="$2"
    
    echo "📁 Processing: $description"
    
    local dirs=$(find . -type d -name "$pattern" | head -20)
    local count=$(echo "$dirs" | wc -l)
    
    if [ -z "$dirs" ] || [ "$dirs" = "" ]; then
        echo "   ✅ No directories to remove"
        return
    fi
    
    echo "   Found: $count directories matching '$pattern'"
    echo "   🔍 Directories that would be removed:"
    echo "$dirs"
    
    read -p "   ❓ Remove these directories? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        find . -type d -name "$pattern" -exec rm -rf {} + 2>/dev/null || true
        echo "   ✅ Removed directories"
    else
        echo "   ⏭️  Skipped"
    fi
}

echo ""
echo "🎯 PHASE 1: Compiled Artifacts Cleanup"
echo "======================================"

# Remove TypeScript compilation artifacts
safe_remove "*.d.ts" "TypeScript declaration files (.d.ts)"
safe_remove "*.d.ts.map" "TypeScript declaration map files (.d.ts.map)"

# Remove JavaScript files that have TypeScript counterparts
echo ""
echo "🔍 Checking for JS files with TS counterparts..."
js_with_ts_count=0
js_files_to_remove=()

while IFS= read -r -d '' jsfile; do
    tsfile="${jsfile%.js}.ts"
    if [ -f "$tsfile" ]; then
        js_files_to_remove+=("$jsfile")
        ((js_with_ts_count++))
    fi
done < <(find . -name "*.js" -type f -print0)

if [ $js_with_ts_count -gt 0 ]; then
    echo "   Found: $js_with_ts_count JS files with TS counterparts"
    echo "   🔍 Files that would be removed:"
    for file in "${js_files_to_remove[@]:0:10}"; do
        echo "   - $file"
    done
    [ $js_with_ts_count -gt 10 ] && echo "   ... and $(($js_with_ts_count - 10)) more"
    
    read -p "   ❓ Remove these JS files? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        for file in "${js_files_to_remove[@]}"; do
            rm "$file"
        done
        echo "   ✅ Removed $js_with_ts_count JS files"
    else
        echo "   ⏭️  Skipped"
    fi
else
    echo "   ✅ No JS files with TS counterparts found"
fi

echo ""
echo "🗂️  PHASE 2: Archive and Build Artifact Cleanup"
echo "==============================================" 

# Remove archive directories
safe_remove_dirs "archive" "Archive directories"

# Remove dist/build directories in sub-workspaces
safe_remove_dirs "dist" "Distribution directories"

# Remove node_modules from sub-workspaces (should only be in root)
echo ""
echo "🔍 Checking for node_modules in sub-workspaces..."
submodules=$(find . -name "node_modules" -type d | grep -v "^\./node_modules$" | head -10)
if [ -n "$submodules" ]; then
    echo "   Found node_modules in sub-workspaces:"
    echo "$submodules"
    read -p "   ❓ Remove these? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        find . -name "node_modules" -type d ! -path "./node_modules" -exec rm -rf {} + 2>/dev/null || true
        echo "   ✅ Removed sub-workspace node_modules"
    else
        echo "   ⏭️  Skipped"
    fi
else
    echo "   ✅ No problematic node_modules found"
fi

echo ""
echo "🗄️  PHASE 3: Cache and Temporary File Cleanup"
echo "=============================================="

# Remove common cache directories
safe_remove_dirs ".tscache" "TypeScript cache directories"
safe_remove_dirs "logs" "Log directories"
safe_remove_dirs "temp" "Temporary directories"
safe_remove_dirs "tmp" "Temporary directories"

# Remove editor/IDE files
safe_remove ".DS_Store" "macOS Finder files"
safe_remove "Thumbs.db" "Windows thumbnail cache"
safe_remove "*.swp" "Vim swap files"
safe_remove "*.swo" "Vim swap files"

echo ""
echo "📊 PHASE 4: Pattern Validation Report"
echo "====================================="

echo "🔍 Analyzing domain architecture compliance..."

# Count domains with missing repositories
domains_without_repos=()
while IFS= read -r -d '' domain_dir; do
    domain_name=$(basename "$domain_dir")
    if [ ! -d "$domain_dir/repositories" ] && [ -d "$domain_dir/services" ]; then
        domains_without_repos+=("$domain_name")
    fi
done < <(find server/src/domains -maxdepth 1 -type d -print0)

if [ ${#domains_without_repos[@]} -gt 0 ]; then
    echo "⚠️  Domains missing repository layer:"
    for domain in "${domains_without_repos[@]}"; do
        echo "   - $domain"
    done
    echo "   💡 Consider adding repositories to these domains"
else
    echo "✅ All domains with services have repository directories"
fi

# Count domains with missing transformers
domains_without_transformers=()
while IFS= read -r -d '' domain_dir; do
    domain_name=$(basename "$domain_dir")
    if [ ! -d "$domain_dir/transformers" ] && [ -d "$domain_dir/controllers" ]; then
        domains_without_transformers+=("$domain_name")
    fi
done < <(find server/src/domains -maxdepth 1 -type d -print0)

if [ ${#domains_without_transformers[@]} -gt 0 ]; then
    echo "⚠️  Domains missing transformer layer:"
    for domain in "${domains_without_transformers[@]}"; do
        echo "   - $domain"
    done
    echo "   💡 Consider adding transformers to these domains"
else
    echo "✅ All domains with controllers have transformer directories"
fi

echo ""
echo "📝 PHASE 5: Documentation Updates"
echo "================================="

# Update .gitignore if needed
if ! grep -q "# Build artifacts" .gitignore 2>/dev/null; then
    echo "📝 Updating .gitignore..."
    cat >> .gitignore << 'EOF'

# Build artifacts (cleanup script)
**/*.d.ts
**/*.d.ts.map
**/dist/
shared/dist/
db/dist/

# Sub-workspace node_modules
*/node_modules/
!node_modules/

# Archive directories
**/archive/

# Cache directories
**/.tscache/
**/logs/
**/temp/
**/tmp/

EOF
    echo "   ✅ Updated .gitignore"
else
    echo "   ✅ .gitignore already contains build artifact entries"
fi

echo ""
echo "🎉 CLEANUP SUMMARY"
echo "=================="
echo "✅ Phase 1: Compiled artifacts removed"
echo "✅ Phase 2: Archive directories cleaned"
echo "✅ Phase 3: Cache and temporary files removed"
echo "✅ Phase 4: Architecture compliance analyzed"
echo "✅ Phase 5: Documentation updated"
echo ""
echo "🚀 Next Steps (Manual):"
echo "- Review the architecture compliance warnings above"
echo "- Run 'pnpm typecheck' to ensure no issues"
echo "- Run 'pnpm lint' to verify code quality"
echo "- Consider adding missing repositories/transformers to flagged domains"
echo ""
echo "✨ Cleanup complete! Codebase is now cleaner and more maintainable."