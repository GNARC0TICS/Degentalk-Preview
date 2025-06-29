# Security API Reference

## Legend
| Symbol | Meaning | | Abbrev | Meaning |
|--------|---------|---|--------|---------|
| 🔒 | authentication | | CSRF | cross-site request forgery |
| 🛡️ | authorization | | CORS | cross-origin resource sharing |
| 📝 | audit logging | | 2FA | two-factor authentication |

## Authentication 🔒

### Session-Based Auth
Primary authentication method using secure HTTP-only cookies.

```bash
# Login
POST /api/auth/login
Content-Type: application/json

{
  "username": "cryptoking",
  "password": "secure123"
}

# Response sets secure session cookie
Set-Cookie: connect.sid=s%3A...; HttpOnly; Secure; SameSite=strict
```

### JWT Tokens (API Access)
For API integrations & mobile apps.

```bash
# Get JWT token
POST /api/auth/token
Cookie: connect.sid=<session>

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}

# Use token
GET /api/wallet/balances
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## CSRF Protection 🛡️

### Token Generation
```bash
GET /api/csrf-token
Cookie: connect.sid=<session>

# Response
{
  "csrfToken": "abc123def456",
  "expiresIn": 3600
}
```

### Token Usage
```bash
POST /api/forum/threads
Cookie: connect.sid=<session>
X-CSRF-Token: abc123def456
Content-Type: application/json

{
  "title": "New Thread",
  "content": "Thread content"
}
```

### Auto-Protection
CSRF automatically enforced on:
- **POST/PUT/DELETE** requests
- **State-changing operations**
- **Financial transactions**

**Exempt endpoints:**
- GET/HEAD/OPTIONS requests
- Webhook endpoints (`/webhook/*`)
- Public APIs (`/public/*`)

## Rate Limiting ⚡

### Tier Structure
```bash
# Headers in all responses
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95  
X-RateLimit-Reset: 1640995200
Retry-After: 60  # When rate limited
```

| Endpoint Pattern | Limit | Window |
|------------------|-------|--------|
| `/api/auth/login` | 5 req | 1 min |
| `/api/auth/register` | 3 req | 1 min |
| `/api/auth/password-reset` | 3 req | 15 min |
| `/api/admin/*` | 20 req | 1 min |
| `/api/wallet/*` | 10 req | 1 min |
| `/api/forum/threads` | 30 req | 1 min |
| All other `/api/*` | 100 req | 1 min |

### Rate Limit Response
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 45,
  "limit": 5,
  "remaining": 0,
  "resetTime": "2025-01-01T12:00:00Z"
}
```

## Permissions & RBAC 🛡️

### Role Hierarchy
```
admin > moderator > user
```

### Permission Matrix
| Resource | Action | User | Mod | Admin |
|----------|--------|------|-----|-------|
| Own posts | edit/delete | ✅ | ✅ | ✅ |
| Any posts | edit/delete | ❌ | ✅ | ✅ |
| Own threads | solve/tag | ✅ | ✅ | ✅ |
| Any threads | solve/tag | ❌ | ✅ | ✅ |
| User roles | change | ❌ | ❌ | ✅ |
| System config | modify | ❌ | ❌ | ✅ |

### Permission Middleware
All routes automatically enforce permissions:

```javascript
// Auto-applied to routes
requireAuth           // Must be logged in
requirePostEditPermission   // Can edit this post
requireThreadSolvePermission // Can solve this thread  
requireModerator      // Must be mod/admin
requireAdmin          // Must be admin
```

## Audit Logging 📝

### Event Types
```typescript
type AuditEventType = 
  | 'auth.login' | 'auth.logout' | 'auth.failed_login'
  | 'forum.thread_created' | 'forum.post_deleted'
  | 'admin.user_role_changed' | 'admin.system_config_changed'
  | 'security.permission_denied' | 'security.suspicious_activity'
  | 'wallet.transaction' | 'wallet.deposit'
```

### Severity Levels
- **Low:** Normal user actions
- **Medium:** Failed auth, permission denials
- **High:** Admin actions, financial transactions
- **Critical:** Suspicious activity, security breaches

### Audit Event Structure
```json
{
  "id": "audit_1640995200_abc123",
  "timestamp": "2025-01-01T12:00:00Z",
  "type": "forum.thread_created",
  "severity": "low",
  "actor": {
    "userId": 123,
    "username": "cryptoking",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "sessionId": "sess_abc123"
  },
  "target": {
    "type": "thread",
    "id": 456,
    "name": "Bitcoin Analysis"
  },
  "action": "thread_created",
  "details": {
    "description": "User created new thread",
    "metadata": {
      "forumId": 789,
      "tags": ["bitcoin", "analysis"]
    }
  }
}
```

### Audit Search API
```bash
# Search audit events
GET /api/admin/audit/search?type=auth.failed_login&userId=123&limit=50

# Get audit summary  
GET /api/admin/audit/summary?days=7

# Response
{
  "totalEvents": 1250,
  "eventsByType": {
    "auth.login": 450,
    "forum.thread_created": 230,
    "security.permission_denied": 15
  },
  "uniqueUsers": 89,
  "uniqueIPs": 156
}
```

## Security Headers 🛡️

### Automatic Headers
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'
```

### CORS Configuration
```javascript
// Allowed origins
const allowedOrigins = [
  'http://localhost:5173',    // Dev frontend
  'https://degentalk.com',    // Production
  'https://api.degentalk.com' // API subdomain
];

// CORS headers
Access-Control-Allow-Origin: https://degentalk.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization,X-CSRF-Token
```

## Security Events 🚨

### Automatic Detection
- **Failed login attempts** (5+ in 5 minutes)
- **Permission violations** (repeated 403s)
- **Rate limit abuse** (sustained hitting limits)
- **Suspicious patterns** (admin endpoint scanning)

### Response Actions
- **Log to audit system**
- **Temporary IP blocking** (severe cases)
- **Admin notifications** (critical events)
- **Rate limit escalation** (repeat offenders)

## Development Security 🔧

### Environment Configuration
```env
# Production security
NODE_ENV=production
SESSION_SECRET=<32+ character secret>
CSRF_SECRET=<32+ character secret>
REDIS_URL=<secure cluster>

# Disable dev features
DEV_FORCE_AUTH=false
DEV_BYPASS_PASSWORD=false
```

### Security Testing
```bash
# Test CSRF protection
curl -X POST http://localhost:5001/api/forum/threads \
  -d '{"title":"test"}' # Should fail without CSRF token

# Test rate limiting
for i in {1..10}; do
  curl http://localhost:5001/api/auth/login
done # Should hit rate limit

# Test permissions
curl -X DELETE http://localhost:5001/api/posts/123 \
  -H "Cookie: connect.sid=<non-owner-session>" # Should fail
```

---

**🔒 Session-based auth w/ JWT API access**
**🛡️ Multi-layer protection: CORS, CSRF, rate limiting, permissions**
**📝 Comprehensive audit logging w/ 30-day retention**