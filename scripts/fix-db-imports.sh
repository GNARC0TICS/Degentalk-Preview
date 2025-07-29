#!/bin/bash

# Fix @db imports to use @degentalk/db
echo "Fixing @db imports to use @degentalk/db..."

# Count files before fixing
COUNT=$(grep -r "from '@db'" server/src --include="*.ts" | wc -l)
echo "Found $COUNT files with @db imports"

# Replace all occurrences
find server/src -name "*.ts" -type f -exec sed -i "s/from '@db'/from '@degentalk\/db'/g" {} +

# Verify the changes
NEW_COUNT=$(grep -r "from '@db'" server/src --include="*.ts" | wc -l)
FIXED_COUNT=$(grep -r "from '@degentalk/db'" server/src --include="*.ts" | wc -l)

echo "Remaining @db imports: $NEW_COUNT"
echo "Fixed to @degentalk/db: $FIXED_COUNT"