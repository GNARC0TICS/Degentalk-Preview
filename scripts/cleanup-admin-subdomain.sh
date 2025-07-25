#!/bin/bash
# Admin Panel Cleanup Script - Phase 1: Delete Unused Sub-domains

echo "🧹 Starting admin panel cleanup..."
echo "Phase 1: Deleting unused sub-domains"

# Define directories to delete
UNUSED_SUBDOMAINS=(
    "airdrop"
    "animation-packs" 
    "dgt-packages"
    "user-groups"
    "forumPrefix"
    "moderator-notes"
    "reports"
    "referrals"
)

# Server-side deletions
echo "📁 Removing server-side sub-domains..."
for subdomain in "${UNUSED_SUBDOMAINS[@]}"; do
    SERVER_PATH="server/src/domains/admin/sub-domains/$subdomain"
    if [ -d "$SERVER_PATH" ]; then
        echo "  ❌ Deleting $SERVER_PATH"
        rm -rf "$SERVER_PATH"
    else
        echo "  ⚠️  $SERVER_PATH not found (already deleted?)"
    fi
done

# Client-side deletions
echo -e "\n📁 Removing client-side admin pages..."
CLIENT_DELETIONS=(
    "client/src/pages/admin/dev"  # Dev seeding tools
)

for path in "${CLIENT_DELETIONS[@]}"; do
    if [ -e "$path" ]; then
        echo "  ❌ Deleting $path"
        rm -rf "$path"
    fi
done

# Count remaining sub-domains
echo -e "\n📊 Admin cleanup summary:"
echo "  Before: 33 sub-domains"
REMAINING=$(ls -1 server/src/domains/admin/sub-domains 2>/dev/null | wc -l || echo 0)
echo "  After: $REMAINING sub-domains"
echo "  Removed: $((33 - REMAINING)) sub-domains"

echo -e "\n✅ Phase 1 complete! Unused sub-domains deleted."
echo "Next: Update imports and fix any broken references..."