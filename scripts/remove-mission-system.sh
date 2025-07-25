#!/bin/bash
# Mission System Removal Script
# This script removes all mission-related code from the DegenTalk codebase

echo "🗑️  Starting Mission System Removal..."
echo "====================================="

# Track files removed
REMOVED_COUNT=0

# Function to remove a file and increment counter
remove_file() {
    if [ -f "$1" ]; then
        rm "$1"
        echo "✅ Removed: $1"
        ((REMOVED_COUNT++))
    else
        echo "⚠️  Not found: $1"
    fi
}

# Function to remove a directory and increment counter
remove_dir() {
    if [ -d "$1" ]; then
        file_count=$(find "$1" -type f | wc -l)
        rm -rf "$1"
        echo "✅ Removed directory: $1 ($file_count files)"
        ((REMOVED_COUNT+=file_count))
    else
        echo "⚠️  Directory not found: $1"
    fi
}

echo ""
echo "1. Removing Client-Side Mission Components..."
echo "---------------------------------------------"
remove_file "client/src/components/missions/DailyMissions.tsx"
remove_file "client/src/components/missions/MissionsWidget.tsx"
remove_file "client/src/components/gamification/mission-card.tsx"
remove_file "client/src/components/gamification/mission-dashboard.tsx"
remove_file "client/src/hooks/useMissions.ts"
remove_file "client/src/schemas/api/mission.schema.ts"

echo ""
echo "2. Removing Server-Side Mission Domain..."
echo "-----------------------------------------"
remove_dir "server/src/domains/missions"
remove_file "server/src/domains/gamification/routes/mission.routes.ts"
remove_file "server/src/domains/gamification/schemas/mission.schemas.ts"
remove_file "server/src/domains/gamification/services/mission.service.ts"
remove_file "server/src/domains/gamification/transformers/mission.transformer.ts"
remove_file "server/src/domains/gamification/utils/mission-action-dispatcher.ts"
remove_file "server/src/domains/gamification/utils/mission-tracker.ts"
remove_file "server/src/middleware/mission-progress.ts"
remove_file "server/src/cron/mission-reset.ts"

echo ""
echo "3. Removing Database Schema Files..."
echo "------------------------------------"
remove_file "db/schema/gamification/missions.ts"
remove_file "db/schema/gamification/missionProgress.ts"
remove_file "db/schema/gamification/missionHistory.ts"
remove_file "db/schema/gamification/missionTemplates.ts"
remove_file "db/schema/gamification/missionStreaks.ts"
remove_file "db/schema/gamification/activeMissions.ts"
remove_file "db/schema/gamification/userMissionProgress.ts"

echo ""
echo "4. Removing Mission Scripts..."
echo "------------------------------"
remove_file "scripts/missions/seed-example-missions.ts"
remove_file "scripts/seed-missions.ts"
remove_file "scripts/test-mission-api.ts"
remove_file "scripts/apply-mission-migrations.ts"
remove_file "scripts/cron/reset-daily-missions.ts"

echo ""
echo "5. Removing Configuration Files..."
echo "----------------------------------"
remove_file "config/missions.config.ts"

echo ""
echo "6. Removing Database Migrations..."
echo "----------------------------------"
remove_file "db/migrations/add-mission-conditions.sql"
remove_file "db/migrations/add-mission-metadata.sql"

echo ""
echo "====================================="
echo "✅ Mission System Removal Complete!"
echo "📊 Total files removed: $REMOVED_COUNT"
echo ""
echo "⚠️  Next Steps:"
echo "1. Update db/schema/index.ts to remove mission exports"
echo "2. Update db/schema/gamification/relations.ts to remove mission relations"
echo "3. Create a database migration to drop mission tables"
echo "4. Run 'pnpm typecheck' to find any remaining references"
echo "5. Commit changes with: git commit -m 'Remove deprecated mission system'"