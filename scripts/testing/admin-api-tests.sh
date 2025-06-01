#!/bin/bash

# ForumFusion Admin Panel API Tests
# Run this script to test the admin panel API endpoints

echo "=== ForumFusion Admin Panel API Tests ==="
echo "These tests require admin authentication to work properly."
echo ""

# Set your base URL
BASE_URL="http://localhost:3000"

# User Groups Tests
echo "=== User Groups Tests ==="

echo "1. List all user groups"
curl -X GET "$BASE_URL/api/admin/user-groups"
echo -e "\n"

echo "2. Create a new user group"
curl -X POST "$BASE_URL/api/admin/user-groups" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Group", "description": "Test group description", "color": "#FF5500", "isStaff": false}'
echo -e "\n"

echo "3. Get a specific user group by ID"
curl -X GET "$BASE_URL/api/admin/user-groups/1"
echo -e "\n"

echo "4. Update a user group"
curl -X PUT "$BASE_URL/api/admin/user-groups/1" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Group", "description": "Updated description"}'
echo -e "\n"

echo "5. View users in a group (paginated)"
curl -X GET "$BASE_URL/api/admin/user-groups/1/users?page=1&limit=10"
echo -e "\n"

echo "6. Delete a user group"
curl -X DELETE "$BASE_URL/api/admin/user-groups/2"
echo -e "\n"

# Users Tests
echo "=== Users Tests ==="

echo "1. List all users with pagination"
curl -X GET "$BASE_URL/api/admin/users?page=1&limit=10"
echo -e "\n"

echo "2. Get specific user details"
curl -X GET "$BASE_URL/api/admin/users/1"
echo -e "\n"

echo "3. Update user status (ban/unban)"
curl -X PUT "$BASE_URL/api/admin/users/1/status" \
  -H "Content-Type: application/json" \
  -d '{"isBanned": true, "banReason": "Violation of community guidelines"}'
echo -e "\n"

echo "4. Change user group"
curl -X PUT "$BASE_URL/api/admin/users/1/group" \
  -H "Content-Type: application/json" \
  -d '{"groupId": 1}'
echo -e "\n"

# Reports Tests
echo "=== Reports Tests ==="

echo "1. Get pending reports"
curl -X GET "$BASE_URL/api/admin/reports?status=pending&page=1&limit=10"
echo -e "\n"

echo "2. Get report details"
curl -X GET "$BASE_URL/api/admin/reports/1"
echo -e "\n"

echo "3. Update report status"
curl -X PUT "$BASE_URL/api/admin/reports/1/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "resolved", "resolution": "Content removed", "moderatorNotes": "User warned"}'
echo -e "\n"

# Forum Management Tests
echo "=== Forum Management Tests ==="

echo "1. Get all categories"
curl -X GET "$BASE_URL/api/admin/forum/categories"
echo -e "\n"

echo "2. Create a new category"
curl -X POST "$BASE_URL/api/admin/forum/categories" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Category", "description": "Test category description", "slug": "test-category", "allowThreads": true}'
echo -e "\n"

echo "3. Update a category"
curl -X PUT "$BASE_URL/api/admin/forum/categories/1" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Category", "description": "Updated description", "slug": "updated-category"}'
echo -e "\n"

echo "4. Get thread prefixes"
curl -X GET "$BASE_URL/api/admin/forum/prefixes"
echo -e "\n"

echo "5. Create a thread prefix"
curl -X POST "$BASE_URL/api/admin/forum/prefixes" \
  -H "Content-Type: application/json" \
  -d '{"name": "Announcement", "color": "#FF0000"}'
echo -e "\n"

echo "6. Moderate a thread (pin)"
curl -X PUT "$BASE_URL/api/admin/forum/threads/1/moderate" \
  -H "Content-Type: application/json" \
  -d '{"isPinned": true, "moderationReason": "Important thread"}'
echo -e "\n"

# Settings Management Tests
echo "=== Settings Management Tests ==="

echo "1. Get all settings"
curl -X GET "$BASE_URL/api/admin/settings"
echo -e "\n"

echo "2. Get all setting groups"
curl -X GET "$BASE_URL/api/admin/settings/groups/all"
echo -e "\n"

echo "3. Create a new setting group"
curl -X POST "$BASE_URL/api/admin/settings/groups" \
  -H "Content-Type: application/json" \
  -d '{"name": "Email Settings", "key": "email_settings", "description": "Email configuration for the platform"}'
echo -e "\n"

echo "4. Create a new setting"
curl -X POST "$BASE_URL/api/admin/settings" \
  -H "Content-Type: application/json" \
  -d '{"key": "site_name", "name": "Site Name", "description": "The name of the website", "type": "string", "defaultValue": "ForumFusion", "groupKey": "general", "isPublic": true}'
echo -e "\n"

echo "5. Update a setting"
curl -X PUT "$BASE_URL/api/admin/settings/site_name" \
  -H "Content-Type: application/json" \
  -d '{"key": "site_name", "value": "ForumFusion Pro"}'
echo -e "\n"

echo "6. Update multiple settings at once"
curl -X PUT "$BASE_URL/api/admin/settings" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": [
      {"key": "site_name", "value": "ForumFusion Pro"},
      {"key": "contact_email", "value": "admin@forumfusion.com"}
    ]
  }'
echo -e "\n"

echo "7. Update setting metadata"
curl -X PUT "$BASE_URL/api/admin/settings/site_name/metadata" \
  -H "Content-Type: application/json" \
  -d '{"name": "Website Name", "description": "The name displayed in the header", "isPublic": true}'
echo -e "\n"

# Analytics Tests
echo "=== Analytics Tests ==="

echo "1. Get user registration stats"
curl -X GET "$BASE_URL/api/admin/analytics/users/registrations?period=monthly&start=2023-01-01&end=2023-12-31"
echo -e "\n"

echo "2. Get content creation stats"
curl -X GET "$BASE_URL/api/admin/analytics/content?type=posts&period=weekly"
echo -e "\n"

echo "3. Get platform activity overview"
curl -X GET "$BASE_URL/api/admin/analytics/activity/overview"
echo -e "\n"

# Admin Dashboard Tests
echo "=== Admin Dashboard Tests ==="

echo "1. Get dashboard summary stats"
curl -X GET "$BASE_URL/api/admin/stats"
echo -e "\n"

echo "2. Get recent admin activity logs"
curl -X GET "$BASE_URL/api/admin/activity?page=1&limit=20"
echo -e "\n"

echo "=== Tests Completed ===" 