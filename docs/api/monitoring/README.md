# Monitoring & Health API

## Legend
| Symbol | Meaning | | Abbrev | Meaning |
|--------|---------|---|--------|---------|
| 🩺 | health check | | DB | database |
| 📊 | metrics | | CPU | processor |
| ⚡ | performance | | RAM | memory |

## Health Endpoints

### System Health 🩺
```bash
GET /api/health
```

**Response:**
```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 3600000,
  "version": "1.0.0",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": 25,
      "message": "Database responded in 25ms"
    },
    "memory": {
      "status": "healthy", 
      "message": "Memory usage: 45.2%",
      "details": {
        "heapUsed": 128,
        "heapTotal": 256,
        "external": 32,
        "systemMemoryUsage": "45.2"
      }
    }
  },
  "metrics": {
    "requests": {
      "total": 15420,
      "errors": 23,
      "averageResponseTime": 145
    },
    "database": {
      "totalQueries": 8954,
      "slowQueries": 12,
      "averageQueryTime": 85.4,
      "errorRate": 0.1
    }
  }
}
```

### Liveness Probe ⚡
```bash
GET /api/health/live
```
Basic server responsiveness check.

**Response:**
```json
{
  "status": "alive",
  "timestamp": "2025-01-01T00:00:00.000Z", 
  "uptime": 3600
}
```

### Readiness Probe 🔄
```bash
GET /api/health/ready
```
Checks if server ready to serve traffic.

**Response:**
```json
{
  "status": "ready|not_ready",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "database": {
    "status": "healthy",
    "responseTime": 15
  }
}
```

## Metrics Endpoint 📊

### Prometheus Format
```bash
GET /api/metrics
```

**Response:** (text/plain)
```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total 15420

# HELP db_queries_total Total database queries  
# TYPE db_queries_total counter
db_queries_total 8954

# HELP db_queries_slow_total Total slow database queries
# TYPE db_queries_slow_total counter
db_queries_slow_total 12

# HELP memory_heap_used_bytes Node.js heap memory used
# TYPE memory_heap_used_bytes gauge
memory_heap_used_bytes 134217728
```

## Performance Monitoring ⚡

### Query Performance Tracking
- **Slow query threshold:** 1000ms
- **Auto-logging** of queries >1s
- **Memory buffer:** 1000 recent queries
- **Disk persistence:** 5min intervals

### Key Metrics Collected
- **HTTP requests:** Total, errors, response times
- **Database:** Query count, slow queries, error rate
- **System:** Memory usage, CPU load, uptime
- **Custom:** Forum activity, user sessions

### Alert Thresholds
| Metric | Warning | Critical |
|--------|---------|----------|
| Memory usage | >80% | >90% |
| DB response | >500ms | >1000ms |
| Error rate | >5% | >10% |
| Slow queries | >10/min | >20/min |

## Status Codes

| Code | Health Status | Description |
|------|---------------|-------------|
| 200 | Healthy | All systems operational |
| 503 | Degraded | Some issues detected |
| 503 | Unhealthy | Critical systems down |

## Usage Examples

### Container Health Check
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:5001/api/health/live || exit 1
```

### Load Balancer Config
```nginx
upstream backend {
  server app1:5001;
  server app2:5001;
}

location /health {
  access_log off;
  proxy_pass http://backend/api/health/ready;
}
```

### Monitoring Dashboard
```javascript
// Fetch health status
const health = await fetch('/api/health').then(r => r.json());

// Display system status
if (health.status === 'healthy') {
  showGreenStatus();
} else {
  showWarningStatus(health.services);
}
```

## Development Integration

### Local Monitoring
```bash
# Check dev server health
curl http://localhost:5001/api/health

# View metrics in browser
open http://localhost:5001/api/metrics

# Monitor query performance
tail -f .claude/audit/$(date +%Y-%m-%d).jsonl | grep slow_query
```

### CI/CD Health Checks
```yaml
# GitHub Actions example
- name: Health Check
  run: |
    curl -f http://localhost:5001/api/health/ready
    if [ $? -ne 0 ]; then exit 1; fi
```

---

**🩺 Monitoring system provides production-grade observability**
**📊 Prometheus-compatible metrics for external monitoring**
**⚡ Real-time performance tracking with automated alerts**