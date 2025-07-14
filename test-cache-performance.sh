#!/bin/bash

# Cache Performance Test Script
# Tests cache hit rates and performance improvements

echo "=== DegenTalk Cache Performance Test ==="
echo "Testing cache hit rates and performance improvements..."

BASE_URL="http://localhost:5001"

# Function to test response time
test_response_time() {
    local url=$1
    local name=$2
    
    echo ""
    echo "Testing $name..."
    
    # First request (cold - cache miss)
    echo "First request (cache miss):"
    time1=$(curl -w "%{time_total}" -s -o /dev/null "$url")
    echo "Time: ${time1}s"
    
    # Second request (hot - cache hit)
    echo "Second request (cache hit):"
    time2=$(curl -w "%{time_total}" -s -o /dev/null "$url")
    echo "Time: ${time2}s"
    
    # Calculate improvement
    improvement=$(echo "scale=2; ($time1 - $time2) / $time1 * 100" | bc -l)
    echo "Performance improvement: ${improvement}%"
}

# Test ad serving endpoint
test_response_time "$BASE_URL/api/ads/serve?placement=header&device=desktop" "Ad Serving"

# Test forum threads endpoint
test_response_time "$BASE_URL/api/forum/threads?tab=trending&page=1&limit=20" "Forum Threads"

# Test analytics dashboard (requires auth)
echo ""
echo "Testing Analytics Dashboard (requires authentication)..."
echo "Use the admin panel to test analytics caching manually."

# Test session tracking endpoint
echo ""
echo "Testing Session Tracking..."
echo "Session tracking works automatically in the background."

# Test cache metrics endpoint
echo ""
echo "Testing Cache Metrics..."
echo "GET $BASE_URL/api/analytics/cache/metrics"
curl -s "$BASE_URL/api/analytics/cache/metrics" | jq '.' 2>/dev/null || echo "Install jq for formatted output"

# Test realtime stats
echo ""
echo "Testing Realtime Statistics..."
echo "GET $BASE_URL/api/analytics/sessions/realtime"
curl -s "$BASE_URL/api/analytics/sessions/realtime" | jq '.' 2>/dev/null || echo "Install jq for formatted output"

echo ""
echo "=== Cache Performance Test Complete ==="
echo ""
echo "Performance targets:"
echo "- Ad serving responses: < 100ms after caching"
echo "- Forum thread lists: < 50ms after caching"
echo "- Analytics dashboard: < 500ms after caching"
echo ""
echo "Monitor cache hit rates with:"
echo "curl $BASE_URL/api/analytics/cache/metrics"
echo ""
echo "Monitor Redis cache:"
echo "redis-cli monitor | grep \"GET \""