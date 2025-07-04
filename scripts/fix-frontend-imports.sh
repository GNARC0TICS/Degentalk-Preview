#!/bin/bash

# Fix Frontend Import Violations Script
# Replaces @db/types imports with @shared/types in frontend code

echo "🔧 Starting frontend import fixes..."

# Count violations before fix
echo "📊 Current violations:"
violations_before=$(find client/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "from '@db/types'" | wc -l)
echo "   - Files with @db/types imports: $violations_before"

# 1. Replace import statements
echo "🔄 Replacing import statements..."
find client/src -name "*.ts" -o -name "*.tsx" | \
  xargs sed -i '' "s|from '@db/types'|from '@shared/types'|g"

# 2. Replace import paths with specific modules
echo "🔄 Replacing specific import paths..."
find client/src -name "*.ts" -o -name "*.tsx" | \
  xargs sed -i '' "s|from '@db/types/id.types'|from '@shared/types'|g"

# 3. Replace any remaining @db/types references
echo "🔄 Replacing remaining @db/types references..."
find client/src -name "*.ts" -o -name "*.tsx" | \
  xargs sed -i '' "s|'@db/types'|'@shared/types'|g"

find client/src -name "*.ts" -o -name "*.tsx" | \
  xargs sed -i '' 's|"@db/types"|"@shared/types"|g'

# Count violations after fix
echo "📊 After fixes:"
violations_after=$(find client/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "from '@db/types'" 2>/dev/null | wc -l)
echo "   - Files with @db/types imports: $violations_after"

# Show remaining violations if any
if [ $violations_after -gt 0 ]; then
  echo "⚠️  Remaining violations:"
  find client/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "from '@db/types'" 2>/dev/null
else
  echo "✅ All @db/types imports successfully replaced!"
fi

echo "🎉 Import replacement complete!"
echo "   - Fixed: $(($violations_before - $violations_after)) files"