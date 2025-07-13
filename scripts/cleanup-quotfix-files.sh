#!/bin/bash
# Script to safely handle .quotfix files before production launch
# These files appear to be backups from a previous operation and pose security/confusion risks

set -euo pipefail

BACKUP_DIR="./quotfix-backup-$(date +%Y%m%d-%H%M%S)"
REPORT_FILE="./quotfix-cleanup-report.txt"

echo "=== .quotfix File Cleanup Script ==="
echo "Started at: $(date)"
echo

# Count total files
TOTAL_FILES=$(find . -name "*.quotfix" -type f | wc -l)
echo "Found $TOTAL_FILES .quotfix files"

if [ "$TOTAL_FILES" -eq 0 ]; then
    echo "No .quotfix files found. Exiting."
    exit 0
fi

# Create backup directory
echo "Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Generate report
echo "Generating detailed report..."
{
    echo "=== .quotfix File Cleanup Report ==="
    echo "Generated at: $(date)"
    echo "Total files: $TOTAL_FILES"
    echo
    echo "=== File List ==="
    find . -name "*.quotfix" -type f | sort
    echo
    echo "=== Files by Directory ==="
    find . -name "*.quotfix" -type f | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn
    echo
    echo "=== Security Scan ==="
    echo "Files containing potential secrets:"
    grep -l -E "(password|secret|key|token|credential|api_key|private)" ./**/*.quotfix 2>/dev/null || echo "None found"
    echo
    echo "=== TypeTransformer Usage ==="
    echo "Files using deprecated TypeTransformer:"
    grep -l "@core/type-transformer" ./**/*.quotfix 2>/dev/null || echo "None found"
} > "$REPORT_FILE"

echo "Report saved to: $REPORT_FILE"

# Backup files
echo
echo "Backing up all .quotfix files..."
find . -name "*.quotfix" -type f -print0 | while IFS= read -r -d '' file; do
    # Create directory structure in backup
    dir=$(dirname "$file")
    mkdir -p "$BACKUP_DIR/$dir"
    cp "$file" "$BACKUP_DIR/$file"
done

# Create compressed archive
echo "Creating compressed archive..."
tar -czf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR"
echo "Archive created: $BACKUP_DIR.tar.gz"

# Prompt for deletion
echo
echo "=== READY TO DELETE ==="
echo "All .quotfix files have been backed up to: $BACKUP_DIR.tar.gz"
echo "Report saved to: $REPORT_FILE"
echo
read -p "Do you want to delete all .quotfix files now? (yes/no): " response

if [ "$response" = "yes" ]; then
    echo "Deleting .quotfix files..."
    find . -name "*.quotfix" -type f -delete
    echo "Deleted $TOTAL_FILES .quotfix files"
    
    # Clean up uncompressed backup
    rm -rf "$BACKUP_DIR"
    echo
    echo "=== CLEANUP COMPLETE ==="
    echo "- Backup archive: $BACKUP_DIR.tar.gz"
    echo "- Cleanup report: $REPORT_FILE"
    echo "- All .quotfix files have been removed"
else
    echo "Deletion cancelled. Files remain in place."
    echo "Backup created at: $BACKUP_DIR.tar.gz"
fi

echo
echo "Completed at: $(date)"