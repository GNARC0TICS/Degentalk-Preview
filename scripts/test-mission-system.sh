#!/bin/bash

# Mission System Test Suite
# Tests all mission endpoints and functionality

BASE_URL="http://localhost:5001/api"
COOKIE_FILE="/tmp/degentalk-cookies.txt"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🚀 DegenTalk Mission System Test Suite"
echo "======================================"

# Step 1: Login as admin
echo -e "\n${YELLOW}1. Testing Authentication${NC}"
echo "Logging in as cryptoadmin..."

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "cryptoadmin", "password": "password123"}' \
  -c "$COOKIE_FILE" \
  -w "\nHTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$LOGIN_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$LOGIN_RESPONSE" | sed '/HTTP_STATUS:/d')

if [ "$HTTP_STATUS" = "200" ]; then
  echo -e "${GREEN}✅ Login successful${NC}"
  echo "Response: $BODY"
else
  echo -e "${RED}❌ Login failed (HTTP $HTTP_STATUS)${NC}"
  echo "Response: $BODY"
  echo "Attempting to create test user..."
  
  # Create test user if login fails
  psql "$DATABASE_URL" < scripts/create-test-data.sql
  
  # Retry login
  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username": "cryptoadmin", "password": "password123"}' \
    -c "$COOKIE_FILE" \
    -w "\nHTTP_STATUS:%{http_code}")
fi

# Step 2: Test Mission Endpoints
echo -e "\n${YELLOW}2. Testing Mission Endpoints${NC}"

# Get all missions
echo -e "\n📋 GET /gamification/missions"
curl -s -X GET "$BASE_URL/gamification/missions" \
  -b "$COOKIE_FILE" | jq '.' || echo "Response: $(curl -s -X GET "$BASE_URL/gamification/missions" -b "$COOKIE_FILE")"

# Get daily missions
echo -e "\n📅 GET /gamification/missions/daily"
curl -s -X GET "$BASE_URL/gamification/missions/daily" \
  -b "$COOKIE_FILE" | jq '.' || echo "Response: $(curl -s -X GET "$BASE_URL/gamification/missions/daily" -b "$COOKIE_FILE")"

# Get weekly missions
echo -e "\n📆 GET /gamification/missions/weekly"
curl -s -X GET "$BASE_URL/gamification/missions/weekly" \
  -b "$COOKIE_FILE" | jq '.' || echo "Response: $(curl -s -X GET "$BASE_URL/gamification/missions/weekly" -b "$COOKIE_FILE")"

# Get user progress
echo -e "\n📊 GET /gamification/missions/progress"
curl -s -X GET "$BASE_URL/gamification/missions/progress" \
  -b "$COOKIE_FILE" | jq '.' || echo "Response: $(curl -s -X GET "$BASE_URL/gamification/missions/progress" -b "$COOKIE_FILE")"

# Step 3: Test Mission Progress Update
echo -e "\n${YELLOW}3. Testing Mission Progress Update${NC}"

# Get first daily mission ID
MISSION_ID=$(curl -s -X GET "$BASE_URL/gamification/missions/daily" -b "$COOKIE_FILE" | jq -r '.data[0].id' 2>/dev/null)

if [ "$MISSION_ID" != "null" ] && [ -n "$MISSION_ID" ]; then
  echo "Updating progress for mission: $MISSION_ID"
  
  UPDATE_RESPONSE=$(curl -s -X POST "$BASE_URL/gamification/missions/$MISSION_ID/progress" \
    -H "Content-Type: application/json" \
    -d '{"action": "post_create", "count": 1}' \
    -b "$COOKIE_FILE")
  
  echo "Update response: $UPDATE_RESPONSE"
else
  echo -e "${RED}❌ No missions found to update${NC}"
fi

# Step 4: Test Claim Reward
echo -e "\n${YELLOW}4. Testing Reward Claim${NC}"

if [ "$MISSION_ID" != "null" ] && [ -n "$MISSION_ID" ]; then
  CLAIM_RESPONSE=$(curl -s -X POST "$BASE_URL/gamification/missions/$MISSION_ID/claim" \
    -b "$COOKIE_FILE")
  
  echo "Claim response: $CLAIM_RESPONSE"
fi

# Step 5: Test Admin Endpoints
echo -e "\n${YELLOW}5. Testing Admin Endpoints${NC}"

# Create event mission
echo -e "\n🎯 Creating event mission..."
EVENT_RESPONSE=$(curl -s -X POST "$BASE_URL/gamification/missions/event" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event Mission",
    "description": "Complete this test event",
    "requiredAction": "test_action",
    "requiredCount": 1,
    "xpReward": 100,
    "dgtReward": 20,
    "expiresIn": 3600000
  }' \
  -b "$COOKIE_FILE")

echo "Event mission response: $EVENT_RESPONSE"

# Step 6: Summary
echo -e "\n${YELLOW}6. Test Summary${NC}"
echo "======================================"

# Check server health
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/gamification/health")
if [ "$HEALTH_STATUS" = "200" ]; then
  echo -e "${GREEN}✅ Gamification service is healthy${NC}"
else
  echo -e "${RED}❌ Gamification service is unhealthy (HTTP $HEALTH_STATUS)${NC}"
fi

# Count active missions
MISSION_COUNT=$(curl -s "$BASE_URL/gamification/missions" -b "$COOKIE_FILE" | jq '.data | length' 2>/dev/null || echo "0")
echo "📊 Active missions: $MISSION_COUNT"

echo -e "\n${GREEN}✨ Test suite completed!${NC}"
echo "Cookie saved to: $COOKIE_FILE"
echo "You can use this cookie for further manual testing."