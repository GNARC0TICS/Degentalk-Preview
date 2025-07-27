#!/bin/bash

echo "Fixing shared type imports after restructuring..."

# Fix wallet imports
find server/src -name "*.ts" -type f -exec sed -i \
  -e 's|from '\''@shared/types/wallet/wallet\.types'\''|from '\''@shared/types'\''|g' \
  -e 's|from "@shared/types/wallet/wallet\.types"|from "@shared/types"|g' \
  -e 's|from '\''@shared/types/wallet/|from '\''@shared/types/|g' \
  -e 's|from "@shared/types/wallet/|from "@shared/types/|g' \
  {} \;

# Fix core imports
find server/src -name "*.ts" -type f -exec sed -i \
  -e 's|from '\''@shared/types/core/|from '\''@shared/types/|g' \
  -e 's|from "@shared/types/core/|from "@shared/types/|g' \
  {} \;

# Fix config imports
find server/src -name "*.ts" -type f -exec sed -i \
  -e 's|from '\''@shared/types/config/|from '\''@shared/types/|g' \
  -e 's|from "@shared/types/config/|from "@shared/types/|g' \
  {} \;

# Fix validation imports
find server/src -name "*.ts" -type f -exec sed -i \
  -e 's|from '\''@shared/types/validation/|from '\''@shared/types/|g' \
  -e 's|from "@shared/types/validation/|from "@shared/types/|g' \
  {} \;

# Fix entities imports (but keep the /entities suffix since that folder still exists)
find server/src -name "*.ts" -type f -exec sed -i \
  -e 's|from '\''@shared/types/entities/role\.types'\''|from '\''@shared/types/entities'\''|g' \
  -e 's|from "@shared/types/entities/role\.types"|from "@shared/types/entities"|g' \
  {} \;

echo "Fixed imports in $(find server/src -name "*.ts" | wc -l) files"