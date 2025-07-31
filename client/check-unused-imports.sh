#!/bin/bash

# Check for unused React default imports in TypeScript/React files
echo "🔍 Checking for unused React default imports..."
echo ""

# Find files with unused React import
files_with_unused_react=$(grep -r "import React" client/src --include="*.tsx" --include="*.ts" | 
  while IFS=: read -r file line; do
    # Check if React is actually used (not just hooks/types)
    if ! grep -q "React\." "$file" && ! grep -q "<React\." "$file" && ! grep -q "React\..*(" "$file"; then
      echo "$file"
    fi
  done | sort | uniq)

if [ -n "$files_with_unused_react" ]; then
  echo "Files with unused React default import:"
  echo "$files_with_unused_react" | nl
  count=$(echo "$files_with_unused_react" | wc -l)
  echo ""
  echo "Total: $count files"
  echo ""
  echo "Fix: Change 'import React, { ... }' to 'import { ... }'"
else
  echo "✅ No unused React default imports found!"
fi

echo ""
echo "🔍 Checking for non-type imports that should use 'import type'..."
echo ""

# Common type-only imports that should use 'import type'
grep -r "import {.*\(Props\|Type\|Interface\|Schema\).*} from" client/src --include="*.tsx" --include="*.ts" | 
  grep -v "import type" | head -20

echo ""
echo "💡 These imports might benefit from using 'import type' for better tree-shaking"