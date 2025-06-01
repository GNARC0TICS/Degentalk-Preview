#!/bin/bash

# Script to move deprecated admin files to archive directory
# Run this script after implementing the domain-driven design for admin panel

# Create timestamp directory for archive
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ARCHIVE_DIR="./archive/admin/$TIMESTAMP"
mkdir -p "$ARCHIVE_DIR"

echo "Moving deprecated admin files to $ARCHIVE_DIR"

# List of deprecated files to move
DEPRECATED_FILES=(
  # Users domain
  "./server/admin-routes.ts"
  "./server/routes/admin-routes.ts"
  
  # User Groups domain
  "./server/admin-user-groups.ts"
  
  # Reports domain
  "./server/admin-reports.ts"
  
  # Treasury domain
  "./server/admin-treasury.ts"
  "./server/admin-wallet-routes.ts"
  
  # Analytics related files
  "./server/routes/admin-stats-routes.ts"
  
  # Settings related files
  "./server/routes/admin-settings-routes.ts"
  
  # XP related files
  "./server/admin-xp-routes.ts"
  "./server/routes/admin-xp-routes.ts"
  "./server/routes/admin-badges-routes.ts"
  "./server/routes/admin-levels-routes.ts"
  
  # Rules related files
  "./server/admin-rules-routes.ts"
  
  # Economy related files
  "./server/routes/admin-economy-routes.ts"
)

# Move each file to archive directory if it exists
for file in "${DEPRECATED_FILES[@]}"; do
  if [ -f "$file" ]; then
    # Create subdirectory structure in archive if needed
    dir_part=$(dirname "$file" | sed 's/^\.\///')
    mkdir -p "$ARCHIVE_DIR/$dir_part"
    
    echo "Moving $file to $ARCHIVE_DIR/$dir_part/$(basename "$file")"
    cp "$file" "$ARCHIVE_DIR/$dir_part/$(basename "$file")"
    
    # Add notice to original file that it's been archived
    echo "// ARCHIVED: This file has been migrated to the domain-driven structure" > "$file"
    echo "// See server/src/domains/admin/ for the new implementation" >> "$file"
    echo "// This file will be removed in a future update" >> "$file"
    echo "module.exports = {}; // Placeholder to prevent import errors" >> "$file"
    
    echo "✅ Archived: $file"
  else
    echo "❌ File not found: $file"
  fi
done

echo "Archive complete. Check $ARCHIVE_DIR for the archived files."
echo "Original files have been replaced with a notice that they are deprecated." 