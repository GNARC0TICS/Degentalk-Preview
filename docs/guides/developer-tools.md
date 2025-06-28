# Developer Tools Guide

## Overview

This guide covers the development tools and debugging features available in Degentalk to improve your development workflow and troubleshooting capabilities.

## Quick Start

### Access Development Tools

All development tools are automatically available when running in development mode:

```bash
# Start development server
npm run dev

# Access health dashboard
curl http://localhost:5001/api/dev/health

# Or open in browser for formatted JSON
open "http://localhost:5001/api/dev/health"
```

## Health Monitoring Dashboard

### Real-Time System Health

**URL**: `http://localhost:5001/api/dev/health`

The health endpoint provides a comprehensive view of your development environment:

```json
{
  "status": "healthy",
  "timestamp": "2025-06-28T15:30:00.000Z",
  "environment": {
    "mode": "development", 
    "nodeEnv": "development",
    "nodeVersion": "v18.17.0"
  },
  "performance": {
    "dbLatency": "12ms",      // Database response time
    "uptime": "3600s",        // Server uptime
    "memory": {
      "used": "245MB",        // Current memory usage
      "total": "512MB",       // Total heap allocated  
      "rss": "380MB"          // Resident set size
    }
  },
  "cache": {
    "type": "redis",          // Cache backend in use
    "connected": true,        // Redis connection status
    "fallback": {             // Fallback cache info
      "type": "memory",
      "size": 8               // Number of cached items
    }
  },
  "features": {
    "redis": true,            // Redis available
    "devSecurity": true,      // Security middleware active
    "hotReload": true         // Hot reload enabled
  }
}
```

### Continuous Monitoring

**Monitor health in terminal**:

```bash
# Watch health metrics every 5 seconds
watch -n 5 'curl -s localhost:5001/api/dev/health | jq "{status: .status, dbLatency: .performance.dbLatency, memory: .performance.memory.used, cache: .cache.type}"'
```

**Output**:
```
{
  "status": "healthy",
  "dbLatency": "15ms", 
  "memory": "267MB",
  "cache": "redis"
}
```

## Cache Management

### View Cache Status

```bash
# Check cache performance
curl -s localhost:5001/api/dev/health | jq .cache
```

**Response**:
```json
{
  "type": "redis",
  "connected": true,
  "fallback": {
    "type": "memory",
    "size": 12,
    "keys": ["trending:all:1:20:anon", "recent:5:1:10:user123"]
  }
}
```

### Clear Cache

**Clear all cached data**:

```bash
curl -X POST http://localhost:5001/api/dev/clear-cache
```

**Response**:
```json
{
  "success": true,
  "message": "All caches cleared",
  "timestamp": "2025-06-28T15:30:00.000Z"
}
```

**When to clear cache**:
- After database schema changes
- When seeing stale data in responses
- After updating cache-related code
- Before performance testing

## Logging Management

### View Current Log Level

```bash
curl http://localhost:5001/api/dev/logs/levels
```

**Response**:
```json
{
  "current": "info",
  "available": ["debug", "info", "warn", "error"],
  "description": {
    "debug": "Verbose logging for development",
    "info": "General information messages", 
    "warn": "Warning messages only",
    "error": "Error messages only"
  }
}
```

### Change Log Level

**Enable debug logging**:
```bash
curl -X POST http://localhost:5001/api/dev/logs/levels \
  -H "Content-Type: application/json" \
  -d '{"level": "debug"}'
```

**Reduce logging noise**:
```bash
curl -X POST http://localhost:5001/api/dev/logs/levels \
  -H "Content-Type: application/json" \
  -d '{"level": "warn"}'
```

**Log Level Usage Guide**:
- **debug**: Use when investigating specific issues, shows all cache hits/misses, query details
- **info**: Default level, shows general operations and performance metrics
- **warn**: Use when you want to focus on potential issues only
- **error**: Use when debugging critical failures only

## Database Testing

### Quick Database Health Check

```bash
curl http://localhost:5001/api/dev/db/test
```

**Response**:
```json
{
  "success": true,
  "queryTime": "8ms",
  "result": {
    "status": "Database connection OK",
    "server_time": "2025-06-28T15:30:00.000Z", 
    "pg_version": "PostgreSQL 15.4"
  },
  "timestamp": "2025-06-28T15:30:00.000Z"
}
```

**Troubleshooting Database Issues**:

```bash
# Test if database is responsive
time curl -s localhost:5001/api/dev/db/test

# Check for slow queries (>100ms indicates problems)
curl -s localhost:5001/api/dev/db/test | jq .queryTime
```

## Performance Debugging

### Identify Performance Bottlenecks

**Check response times for key endpoints**:

```bash
# Test thread loading performance
time curl -s "localhost:5001/api/forum/threads?tab=trending" > /dev/null

# Test with cache warming (run twice)
curl -s "localhost:5001/api/forum/threads?tab=trending" > /dev/null
time curl -s "localhost:5001/api/forum/threads?tab=trending" > /dev/null
```

**Expected Results**:
- First request (cold cache): ~40ms
- Second request (warm cache): ~5ms

### Memory Usage Monitoring

**Track memory over time**:

```bash
# Log memory usage every 30 seconds
while true; do
  memory=$(curl -s localhost:5001/api/dev/health | jq -r .performance.memory.used)
  echo "$(date +%H:%M:%S) Memory: $memory"
  sleep 30
done
```

**Memory Usage Guidelines**:
- **Normal**: Steady state around 200-400MB
- **Warning**: Growing >10MB per hour
- **Critical**: >1GB or continuous growth

## Debugging Workflows

### Frontend-Backend Integration Issues

**1. Check backend health first**:
```bash
curl localhost:5001/api/dev/health
```

**2. Test specific API endpoints**:
```bash
# Test authentication
curl -b cookies.txt localhost:5001/api/auth/user

# Test forum data
curl localhost:5001/api/forum/threads?tab=trending
```

**3. Check CORS issues**:
```bash
# Test with origin header
curl -H "Origin: http://localhost:5173" localhost:5001/api/dev/health
```

### Database Query Issues

**1. Enable debug logging**:
```bash
curl -X POST localhost:5001/api/dev/logs/levels \
  -d '{"level": "debug"}' -H "Content-Type: application/json"
```

**2. Monitor application logs**:
```bash
# Watch logs in development server terminal
# Look for query timing logs like:
# "ThreadService: Found 25 threads in 35ms"
# "ThreadService: Cache hit for trending:all:1:20:anon"
```

**3. Test database directly**:
```bash
curl localhost:5001/api/dev/db/test
```

### Cache Issues Debugging

**1. Check cache backend**:
```bash
curl -s localhost:5001/api/dev/health | jq .cache
```

**2. Test Redis connection (if using Redis)**:
```bash
redis-cli ping
# Should return: PONG
```

**3. Monitor cache hit rates**:
```bash
# Make same request twice
curl "localhost:5001/api/forum/threads?tab=trending" > /dev/null
curl "localhost:5001/api/forum/threads?tab=trending" > /dev/null

# Check logs for "Cache hit" messages
```

## Development Scripts

### Automated Health Checks

**Create `scripts/dev/health-check.sh`**:

```bash
#!/bin/bash
echo "🔍 Degentalk Health Check"

# Test backend health
echo "Testing backend health..."
health=$(curl -s localhost:5001/api/dev/health)
status=$(echo $health | jq -r .status)

if [ "$status" = "healthy" ]; then
  echo "✅ Backend: Healthy"
  
  # Show key metrics
  echo "📊 Database: $(echo $health | jq -r .performance.dbLatency)"
  echo "💾 Memory: $(echo $health | jq -r .performance.memory.used)"
  echo "🔄 Cache: $(echo $health | jq -r .cache.type)"
else
  echo "❌ Backend: Unhealthy"
  exit 1
fi

# Test frontend (if running)
if curl -s localhost:5173 > /dev/null; then
  echo "✅ Frontend: Running"
else
  echo "⚠️ Frontend: Not running"
fi

echo "🎉 Health check complete"
```

### Performance Benchmarking

**Create `scripts/dev/benchmark.sh`**:

```bash
#!/bin/bash
echo "🏃 Running performance benchmarks..."

# Test thread endpoint performance
echo "Testing thread list performance..."
for i in {1..5}; do
  time curl -s "localhost:5001/api/forum/threads?tab=trending" > /dev/null
done

# Test cache performance  
echo "Testing cache performance..."
curl -s "localhost:5001/api/forum/threads?tab=trending" > /dev/null # Warm cache
for i in {1..5}; do
  time curl -s "localhost:5001/api/forum/threads?tab=trending" > /dev/null
done

echo "✅ Benchmark complete"
```

## Browser DevTools Integration

### Network Tab Monitoring

**Monitor API requests in browser**:

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "XHR/Fetch"
4. Look for:
   - Response times < 100ms for cached requests
   - Response times < 200ms for database requests
   - No 500 errors

### Console Debugging

**Add health check to browser console**:

```javascript
// Paste in browser console for real-time monitoring
const monitorHealth = async () => {
  try {
    const response = await fetch('/api/dev/health');
    const health = await response.json();
    
    console.log('🏥 Health Status:', health.status);
    console.log('📊 DB Latency:', health.performance.dbLatency);
    console.log('💾 Memory:', health.performance.memory.used);
    console.log('🔄 Cache:', health.cache.type);
    
    // Set green/red indicator
    if (health.status === 'healthy') {
      console.log('%c✅ All systems normal', 'color: green; font-weight: bold');
    } else {
      console.log('%c❌ Health issues detected', 'color: red; font-weight: bold');
    }
  } catch (error) {
    console.log('%c🚨 Backend unreachable', 'color: red; font-weight: bold');
  }
};

// Run health check
monitorHealth();

// Auto-refresh every 30 seconds
setInterval(monitorHealth, 30000);
```

## Common Development Scenarios

### Scenario 1: Slow Page Loading

**Problem**: Forum page loads slowly

**Debug Steps**:
1. Check backend health: `curl localhost:5001/api/dev/health`
2. Test thread endpoint: `time curl localhost:5001/api/forum/threads?tab=trending`
3. Check cache status: Look for cache hits in logs
4. Clear cache if needed: `curl -X POST localhost:5001/api/dev/clear-cache`

### Scenario 2: Memory Usage Growing

**Problem**: Development server memory keeps increasing

**Debug Steps**:
1. Monitor memory: `watch -n 10 'curl -s localhost:5001/api/dev/health | jq .performance.memory'`
2. Clear cache: `curl -X POST localhost:5001/api/dev/clear-cache`
3. Restart server if memory > 1GB
4. Check for memory leaks in recent code changes

### Scenario 3: Database Connection Issues

**Problem**: Database queries failing or slow

**Debug Steps**:
1. Test database: `curl localhost:5001/api/dev/db/test`
2. Check database indices: `npx tsx scripts/db/check-indices.ts`
3. Verify environment variables in `env.local`
4. Check database server status

### Scenario 4: Cache Not Working

**Problem**: Same requests show slow response times

**Debug Steps**:
1. Check cache backend: `curl -s localhost:5001/api/dev/health | jq .cache`
2. Test Redis (if using): `redis-cli ping`
3. Enable debug logging: Set log level to "debug"
4. Monitor logs for cache hit/miss messages

## Tips & Best Practices

### Daily Development Workflow

**Start of day checklist**:
```bash
# 1. Start development server
npm run dev

# 2. Check system health
curl localhost:5001/api/dev/health

# 3. Clear cache from previous session
curl -X POST localhost:5001/api/dev/clear-cache

# 4. Set appropriate log level
curl -X POST localhost:5001/api/dev/logs/levels -d '{"level": "info"}' -H "Content-Type: application/json"
```

### Performance Testing

**Before pushing code**:
```bash
# Run performance check
time curl -s localhost:5001/api/forum/threads?tab=trending > /dev/null

# Should be < 100ms for first request
# Should be < 20ms for cached requests
```

### Debugging Production Issues in Development

**Simulate production conditions**:
```bash
# Disable cache to test query performance
curl -X POST localhost:5001/api/dev/clear-cache

# Set minimal logging
curl -X POST localhost:5001/api/dev/logs/levels -d '{"level": "error"}' -H "Content-Type: application/json"

# Test under load
ab -n 50 -c 5 localhost:5001/api/forum/threads?tab=trending
```

---

📚 **Documentation created**: `/docs/guides/developer-tools.md`