#!/bin/bash
# Script to rename Clout system to Reputation system

echo "🔄 Renaming Clout to Reputation system..."

# Step 1: Rename directories
echo "📁 Renaming directories..."
if [ -d "server/src/domains/admin/sub-domains/clout" ]; then
    mv server/src/domains/admin/sub-domains/clout server/src/domains/admin/sub-domains/reputation
    echo "  ✅ Renamed admin/sub-domains/clout → reputation"
fi

if [ -d "client/src/pages/admin/clout" ]; then
    mv client/src/pages/admin/clout client/src/pages/admin/reputation
    echo "  ✅ Renamed pages/admin/clout → reputation"
fi

# Step 2: Rename files
echo -e "\n📄 Renaming files..."
find . -name "*clout*" -type f ! -path "./.git/*" ! -path "./node_modules/*" | while read file; do
    newfile=$(echo "$file" | sed 's/clout/reputation/g')
    if [ "$file" != "$newfile" ]; then
        mv "$file" "$newfile"
        echo "  ✅ $file → $newfile"
    fi
done

# Step 3: Update file contents
echo -e "\n📝 Updating file contents..."

# Replace 'clout' with 'reputation' (lowercase)
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" \) \
    ! -path "./.git/*" ! -path "./node_modules/*" ! -path "./scripts/rename-clout-to-reputation.sh" \
    -exec sed -i 's/clout/reputation/g' {} +

# Replace 'Clout' with 'Reputation' (capitalized)
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" \) \
    ! -path "./.git/*" ! -path "./node_modules/*" ! -path "./scripts/rename-clout-to-reputation.sh" \
    -exec sed -i 's/Clout/Reputation/g' {} +

# Replace 'CLOUT' with 'REPUTATION' (uppercase)
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" \) \
    ! -path "./.git/*" ! -path "./node_modules/*" ! -path "./scripts/rename-clout-to-reputation.sh" \
    -exec sed -i 's/CLOUT/REPUTATION/g' {} +

echo -e "\n✅ Clout → Reputation renaming complete!"
echo "Next steps:"
echo "1. Run 'pnpm typecheck' to find any issues"
echo "2. Update database table names if needed"
echo "3. Update API documentation"