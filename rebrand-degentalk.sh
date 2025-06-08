#!/bin/bash

# Degentalk™ rebrand script (text/code files only)
# Replaces all variants of "DegenTalk" with "Degentalk™" (trademark symbol)
# Excludes node_modules and .git directories, and only processes text/code/doc files

set -e

echo "Starting Degentalk™ rebrand (text/code files only)..."

VARIANTS=(
  "DegenTalk"
  "Degentalk"
  "degenTalk"
  "Degen Talk"
  "degen talk"
)

EXTENSIONS="ts tsx js jsx json md html css yml yaml txt mdx scss less svg ejs hbs njk"

for ext in $EXTENSIONS; do
  for variant in "${VARIANTS[@]}"; do
    echo "Replacing '$variant' with 'Degentalk™' in *.$ext files..."
    find . -type f -name "*.$ext" \
      -not -path '*/node_modules/*' \
      -not -path '*/.git/*' \
      -not -name '*.bak' \
      -exec sed -i .bak "s/${variant}/Degentalk™/g" {} +
  done
done

echo "Rebrand complete!"
echo "All original files are backed up with .bak extension."
echo "Review changes with 'git diff' and test your app." 