#!/bin/bash

echo "Fixing script imports..."

# Fix @server/src/core/* imports to use @core/*
find scripts -name "*.ts" -type f -exec sed -i \
  -e 's|from '\''@server/src/core/|from '\''@core/|g' \
  -e 's|from "@server/src/core/|from "@core/|g' \
  {} \;

# Fix @server/src/* imports to use @server/*
find scripts -name "*.ts" -type f -exec sed -i \
  -e 's|from '\''@server/src/|from '\''@server/|g' \
  -e 's|from "@server/src/|from "@server/|g' \
  {} \;

echo "Fixed imports in $(find scripts -name "*.ts" | wc -l) script files"