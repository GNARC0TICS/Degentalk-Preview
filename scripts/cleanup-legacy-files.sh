#!/bin/bash

# Script to clean up legacy .js and .d.ts files from shared directory
# These are artifacts from an old build system

echo "🧹 Cleaning up legacy build artifacts in shared directory..."

# Count files before deletion
JS_COUNT=$(find shared -name "*.js" -not -path "*/node_modules/*" -not -path "*/dist/*" | wc -l)
DTS_COUNT=$(find shared -name "*.d.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/shims/*" | wc -l)

echo "Found $JS_COUNT .js files and $DTS_COUNT .d.ts files to remove"

# Create backup directory
BACKUP_DIR="backup-legacy-files-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "Creating backup in $BACKUP_DIR..."

# Backup files before deletion
find shared -name "*.js" -not -path "*/node_modules/*" -not -path "*/dist/*" -exec cp --parents {} "$BACKUP_DIR" \; 2>/dev/null || true
find shared -name "*.d.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/shims/*" -exec cp --parents {} "$BACKUP_DIR" \; 2>/dev/null || true

# Delete the files
echo "Deleting legacy files..."
find shared -name "*.js" -not -path "*/node_modules/*" -not -path "*/dist/*" -delete
find shared -name "*.d.ts" -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/shims/*" -delete

echo "✅ Cleanup complete! Backup saved to $BACKUP_DIR"

# Verify build still works
echo "Verifying build..."
cd shared && npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful! Legacy files were safe to remove."
  echo "You can delete the backup with: rm -rf ../$BACKUP_DIR"
else
  echo "❌ Build failed! Restoring files from backup..."
  cp -r "../$BACKUP_DIR/shared/"* .
  echo "Files restored. Please investigate the build failure."
fi