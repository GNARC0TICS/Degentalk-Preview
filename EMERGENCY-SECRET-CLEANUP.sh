#!/bin/bash
# Emergency Secret Cleanup Script

echo "🚨 EMERGENCY: Removing exposed secrets from repository..."

# Remove files with actual secrets
rm -f codespaces-secrets.md
rm -f LOCAL-TO-CODESPACES-MIGRATION.md 
rm -f env.local.backup-*

# Remove from git history
git rm --cached codespaces-secrets.md LOCAL-TO-CODESPACES-MIGRATION.md 2>/dev/null || true
git rm --cached env.local.backup-* 2>/dev/null || true

# Update README to remove actual secrets
sed -i '' 's/postgresql:\/\/.*@[^)]*/postgresql:\/\/YOUR_NEON_CONNECTION_HERE/g' README.md
sed -i '' 's/sk_live_[A-Za-z0-9]*/YOUR_STRIPE_SECRET_KEY_HERE/g' README.md

echo "✅ Files removed and git cache cleared"
echo "⚠️  NEXT: You MUST commit this immediately and consider rotating your keys!"