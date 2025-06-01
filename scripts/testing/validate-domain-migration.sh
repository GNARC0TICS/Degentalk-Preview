#!/bin/bash

# Validate Domain Migration Script
# This script performs a series of tests to validate that the domain-based routing migration 
# is working correctly.

# Print with colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== ForumFusion Domain Migration Validation ===${NC}"
echo -e "${YELLOW}This script will validate the domain-based routing migration.${NC}"
echo

# Create logs directory if it doesn't exist
mkdir -p logs

# Step 1: Check for legacy route imports in server/routes.ts
echo -e "${BLUE}Step 1: Checking for legacy route imports in routes.ts...${NC}"
LEGACY_IMPORTS=$(grep -v "@pending-migration" server/routes.ts | grep -E "import.*from.*\\.\\/(.*)-routes" || true)

if [ -n "$LEGACY_IMPORTS" ]; then
  echo -e "${RED}Found legacy route imports that are not marked as @pending-migration:${NC}"
  echo "$LEGACY_IMPORTS"
  echo -e "${RED}These should be migrated to domain-based structure or marked with @pending-migration comment.${NC}"
  echo "$LEGACY_IMPORTS" > logs/legacy-imports.log
else
  echo -e "${GREEN}✅ No unmarked legacy route imports found in routes.ts${NC}"
fi

# Step 2: Check for proper domain-based imports
echo
echo -e "${BLUE}Step 2: Checking for domain-based imports in routes.ts...${NC}"
DOMAIN_IMPORTS=$(grep -E "import.*from.*src/domains/" server/routes.ts || true)

if [ -n "$DOMAIN_IMPORTS" ]; then
  COUNT=$(echo "$DOMAIN_IMPORTS" | wc -l)
  echo -e "${GREEN}✅ Found $COUNT domain-based imports in routes.ts${NC}"
else
  echo -e "${RED}No domain-based imports found in routes.ts${NC}"
  echo "0 domain imports" > logs/domain-imports.log
fi

# Step 3: Check for app.use('/api/...') pattern vs registerRoutes pattern
echo
echo -e "${BLUE}Step 3: Checking for proper route mounting patterns...${NC}"
APP_USE_COUNT=$(grep -E "app.use\\('/api/" server/routes.ts | wc -l)
REGISTER_ROUTES_COUNT=$(grep -v "@pending-migration" server/routes.ts | grep -E "register.*Routes\\(app\\)" | wc -l)

echo -e "${GREEN}Found $APP_USE_COUNT app.use('/api/...') patterns${NC}"
if [ "$REGISTER_ROUTES_COUNT" -gt 0 ]; then
  echo -e "${RED}Found $REGISTER_ROUTES_COUNT registerXRoutes(app) patterns that are not marked as @pending-migration${NC}"
  grep -v "@pending-migration" server/routes.ts | grep -E "register.*Routes\\(app\\)" > logs/register-routes.log
else
  echo -e "${GREEN}✅ No unmarked registerXRoutes(app) patterns found${NC}"
fi

# Step 4: Count migrated domains
echo
echo -e "${BLUE}Step 4: Counting migrated domains...${NC}"
DOMAIN_DIRECTORIES=$(find server/src/domains -type d -mindepth 1 -maxdepth 1 | wc -l)
ROUTE_FILES=$(find server/src/domains -name "*.routes.ts" | wc -l)

echo -e "${GREEN}Found $DOMAIN_DIRECTORIES domain directories${NC}"
echo -e "${GREEN}Found $ROUTE_FILES domain route files${NC}"

# Step 5: Check TypeScript errors
echo
echo -e "${BLUE}Step 5: Checking for TypeScript errors...${NC}"
npm run check > logs/ts-check.log 2>&1
TS_ERRORS=$(grep -i "error" logs/ts-check.log | wc -l)

if [ "$TS_ERRORS" -gt 0 ]; then
  echo -e "${RED}Found $TS_ERRORS TypeScript errors. See logs/ts-check.log for details.${NC}"
else
  echo -e "${GREEN}✅ No TypeScript errors found${NC}"
fi

# Step 6: Check if server starts without errors
echo
echo -e "${BLUE}Step 6: Checking if mock tests pass...${NC}"
npm run test:routes:mock > logs/mock-tests.log 2>&1
MOCK_TEST_SUCCESS=$(grep -i "successful" logs/mock-tests.log | wc -l)

if [ "$MOCK_TEST_SUCCESS" -gt 0 ]; then
  echo -e "${GREEN}✅ Mock tests found working endpoints${NC}"
else
  echo -e "${RED}Mock tests failed. See logs/mock-tests.log for details.${NC}"
fi

# Step 7: Pending migrations check
echo
echo -e "${BLUE}Step 7: Checking for pending migrations...${NC}"
PENDING_MIGRATIONS=$(grep -E "@pending-migration" server/routes.ts | wc -l)

echo -e "${YELLOW}Found $PENDING_MIGRATIONS routes marked as @pending-migration${NC}"
echo -e "${YELLOW}These will be migrated post-launch.${NC}"

# Summary
echo
echo -e "${BLUE}=== Migration Validation Summary ===${NC}"
echo
echo -e "${GREEN}✅ Domain directories: $DOMAIN_DIRECTORIES${NC}"
echo -e "${GREEN}✅ Domain route files: $ROUTE_FILES${NC}"
echo -e "${YELLOW}⚠️  Routes pending migration: $PENDING_MIGRATIONS${NC}"
if [ "$TS_ERRORS" -gt 0 ]; then
  echo -e "${RED}❌ TypeScript errors: $TS_ERRORS${NC}"
else
  echo -e "${GREEN}✅ No TypeScript errors${NC}"
fi

echo
echo -e "${YELLOW}Detailed logs are available in the /logs directory${NC}" 