#!/bin/bash
# Validation script to ensure complete zone removal

echo "🔍 Validating zone removal..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track if any zones found
ZONES_FOUND=0

# Function to check for zone references
check_zones() {
    local pattern=$1
    local description=$2
    local exclude_glob=$3
    
    echo -e "\n${YELLOW}Checking for: ${description}${NC}"
    
    if [ -n "$exclude_glob" ]; then
        result=$(rg -i "$pattern" --glob '!*.{md,changelog,json}' --glob '!**/node_modules/**' --glob '!**/.git/**' --glob "$exclude_glob" 2>/dev/null)
    else
        result=$(rg -i "$pattern" --glob '!*.{md,changelog,json}' --glob '!**/node_modules/**' --glob '!**/.git/**' 2>/dev/null)
    fi
    
    if [ -n "$result" ]; then
        echo -e "${RED}❌ Found zone references:${NC}"
        echo "$result" | head -20
        echo "..."
        ZONES_FOUND=1
    else
        echo -e "${GREEN}✅ No references found${NC}"
    fi
}

# 1. Check for literal 'zone' type values
check_zones "type:\s*['\"]zone['\"]" "Type declarations with 'zone'"

# 2. Check for zone in type unions
check_zones "['\"]zone['\"].*\|.*['\"]forum['\"]" "Zone in type unions"

# 3. Check for ZoneId type
check_zones "ZoneId|ParentZoneId" "ZoneId type references"

# 4. Check for zone variable names
check_zones "\b(zoneSlug|zoneId|zoneName|zoneTheme)\b" "Zone variable names"

# 5. Check for zone CSS classes
check_zones "zone-(card|glow|badge|pit|casino|briefing|mission-control)" "Zone CSS classes"

# 6. Check for zone CSS variables
check_zones "--zone-(accent|color|bg|primary)" "Zone CSS variables"

# 7. Check for zone in comments (excluding migration files)
check_zones "//.*\bzone\b|/\*.*\bzone\b" "Zone in comments" "!**/migrations/**"

# 8. Check for zone functions
check_zones "(getZone|useZone|formatZone|isPrimaryZone)" "Zone-specific functions"

# 9. Check for zone imports/exports
check_zones "from.*zoneThemes|export.*zone" "Zone imports/exports"

# 10. Check database schema
echo -e "\n${YELLOW}Checking database for zone types...${NC}"
if command -v psql &> /dev/null && [ -n "$DATABASE_URL" ]; then
    zone_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM forum_structure WHERE type = 'zone';" 2>/dev/null || echo "0")
    if [ "$zone_count" -gt 0 ]; then
        echo -e "${RED}❌ Found $zone_count zones in database${NC}"
        ZONES_FOUND=1
    else
        echo -e "${GREEN}✅ No zones in database${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping database check (psql not available or DATABASE_URL not set)${NC}"
fi

# Final result
echo -e "\n================================"
if [ $ZONES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ VALIDATION PASSED: No zone references found!${NC}"
    echo -e "The codebase is clean of zone references."
    exit 0
else
    echo -e "${RED}❌ VALIDATION FAILED: Zone references still exist!${NC}"
    echo -e "\nRun the following to see all zone references:"
    echo -e "  rg -i '\\bzone' --glob '!*.{md,changelog,json}' --glob '!**/node_modules/**'"
    exit 1
fi