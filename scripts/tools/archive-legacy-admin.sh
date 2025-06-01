#!/bin/bash

# ForumFusion Legacy Admin File Archiving Script
# This script archives legacy admin files as we implement the DDD pattern

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ARCHIVE_DIR="./archive/admin"
TEMP_ARCHIVE_DIR="$ARCHIVE_DIR/$TIMESTAMP"

# Create archive directories if they don't exist
mkdir -p "$TEMP_ARCHIVE_DIR"

# Function to archive a file
archive_file() {
  local file=$1
  local base_name=$(basename "$file")
  local archive_path="$TEMP_ARCHIVE_DIR/$base_name"
  
  # Check if file exists
  if [ -f "$file" ]; then
    echo "Archiving $file to $archive_path"
    cp "$file" "$archive_path"
    echo "// ARCHIVED: This file has been migrated to the new domain-driven structure" > "$file"
    echo "// See server/src/domains/admin/ for the new implementation" >> "$file"
    echo "// This file will be removed in a future cleanup" >> "$file"
    echo -e "\nmodule.exports = {}; // Empty export to prevent import errors" >> "$file"
    echo "✅ Archived: $file"
  else
    echo "❌ File not found: $file"
  fi
}

# Function to archive files for a specific subdomain
archive_subdomain() {
  local subdomain=$1
  shift
  local files=("$@")

  echo "=== Archiving $subdomain subdomain legacy files ==="
  for file in "${files[@]}"; do
    archive_file "$file"
  done
  echo "=== Completed archiving $subdomain files ==="
  echo ""
}

# Usage examples
# Uncomment the relevant section when ready to archive those files

# Archive Analytics files
# analytics_files=(
#   "./server/admin-analytics.ts"
#   "./server/routes/admin-stats-routes.ts"
# )
# archive_subdomain "Analytics" "${analytics_files[@]}"

# Archive Reports files
# reports_files=(
#   "./server/admin-reports.ts"
# )
# archive_subdomain "Reports" "${reports_files[@]}"

# Archive User Groups files
# user_groups_files=(
#   "./server/admin-user-groups.ts"
# )
# archive_subdomain "User Groups" "${user_groups_files[@]}"

# Archive Users files
# users_files=(
#   "./server/admin-routes.ts"  # Note: Only archive after all routes are migrated
# )
# archive_subdomain "Users" "${users_files[@]}"

# Archive XP files
# xp_files=(
#   "./server/admin-xp-routes.ts"
#   "./server/routes/admin-badges-routes.ts"
#   "./server/routes/admin-levels-routes.ts"
# )
# archive_subdomain "XP" "${xp_files[@]}"

# Archive Treasury files
# treasury_files=(
#   "./server/admin-treasury.ts"
#   "./server/admin-wallet-routes.ts"
# )
# archive_subdomain "Treasury" "${treasury_files[@]}"

# Archive Rules files
# rules_files=(
#   "./server/admin-rules-routes.ts"
# )
# archive_subdomain "Rules" "${rules_files[@]}"

# Archive Settings files
# settings_files=(
#   "./server/routes/admin-settings-routes.ts"
# )
# archive_subdomain "Settings" "${settings_files[@]}"

echo "Legacy admin files have been archived to $TEMP_ARCHIVE_DIR"
echo "Review the archived files and remove them from the original location when appropriate" 