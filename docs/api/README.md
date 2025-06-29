# Degentalk API Documentation

## Legend
| Symbol | Meaning | | Abbrev | Meaning |
|--------|---------|---|--------|---------|
| → | leads to | | API | application programming interface |
| ✅ | supported | | Auth | authentication |
| ⚠️ | requires admin | | DGT | Degentalk Token |
| 🔒 | auth required | | XP | experience points |

## Overview

Degentalk provides a comprehensive REST API for the satirical crypto forum platform. The API supports:

- **Session-based authentication** w/ Passport.js
- **DGT token economy** w/ crypto integration
- **Real-time WebSocket** chat & notifications
- **Role-based access control** (admin/mod/user)
- **Rate limiting** w/ custom database implementation
- **Domain-driven architecture** organized by feature

## Base URL

```
Development: http://localhost:5001/api
Production: https://degentalk.com/api
```

## Authentication

### Methods
- **Session cookies** (primary) - Set via `/auth/login`
- **JWT tokens** (API access) - Header: `Authorization: Bearer <token>`
- **Development bypass** - Password bypass in dev mode

### Session Management
```bash
# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password"}'

# Get current user
curl -X GET http://localhost:5001/api/auth/user \
  -H "Cookie: connect.sid=<session-cookie>"

# Logout
curl -X POST http://localhost:5001/api/auth/logout \
  -H "Cookie: connect.sid=<session-cookie>"
```

## Rate Limiting

**Multi-tier limits:**
- **General:** 100 req/min per IP
- **Auth:** 5 req/min per IP (login/register)
- **Password reset:** 3 req/15min per IP
- **Admin:** 20 req/min per IP
- **Financial:** 10 req/min per IP (wallet/tips)
- **Posting:** 30 req/min per IP (threads/posts)
- **Shoutbox:** 10s cooldown per user

**Rate limit headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
Retry-After: 60 (when rate limited)
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "id": 123,
    "username": "cryptoking",
    "balance": 1500.50
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "error": "Insufficient DGT balance",
  "details": [
    {
      "field": "amount",
      "message": "Required minimum 10 DGT",
      "code": "VALIDATION_ERROR"
    }
  ],
  "retryAfter": 30
}
```

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful request |
| 201 | Created | Resource created |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## Security & Monitoring

### Health Checks 🩺
```bash
# System health
curl http://localhost:5001/api/health

# Liveness probe
curl http://localhost:5001/api/health/live

# Readiness probe 
curl http://localhost:5001/api/health/ready

# Prometheus metrics
curl http://localhost:5001/api/metrics
```

### Permission System 🔐
- **Owner permissions** - Edit/delete own content
- **Moderator permissions** - Manage any content in assigned forums
- **Admin permissions** - Full system access
- **Auto-enforcement** via middleware on all routes

### CSRF Protection 🛡️
```bash
# Get CSRF token
curl http://localhost:5001/api/csrf-token

# Use token in requests
curl -X POST http://localhost:5001/api/forum/threads \
  -H "X-CSRF-Token: <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Content"}'
```

### Audit Logging 📝
- **Auth events** - Logins, failures, role changes
- **Forum actions** - Thread/post creation, moderation
- **Security events** - Permission denials, suspicious activity
- **Financial** - DGT transactions, deposits, withdrawals
- **Auto-retention** - 30 days, configurable

## API Domains

### Core Features
- **[Authentication](./auth/README.md)** - Login, registration, session management
- **[Forum System](./forum/README.md)** - Threads, posts, zones, categories
- **[Wallet System](./wallet/README.md)** - DGT tokens, crypto deposits, transfers
- **[XP & Gamification](./xp/README.md)** - Experience points, levels, achievements

### Security & Monitoring
- **[Security API](./security/README.md)** - CSRF, CORS, rate limiting, permissions, audit logs
- **[Monitoring](./monitoring/README.md)** - Health checks, metrics, performance tracking

### Social Features
- **[Chat System](./chat/README.md)** - Shoutbox, rooms, real-time messaging
- **[Social Features](./social/README.md)** - Friends, notifications, messaging
- **[Engagement](./engagement/README.md)** - Tips, rain, airdrops, vault

### Administration
- **[Admin Panel](./admin/README.md)** - User management, analytics, settings
- **[Webhooks](./webhooks/README.md)** - External integrations, callbacks

## Quick Start Examples

### Get Forum Structure
```bash
curl -X GET http://localhost:5001/api/forum/structure
```

### Create Thread (Authenticated)
```bash
curl -X POST http://localhost:5001/api/forum/threads \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=<session>" \
  -d '{
    "title": "Bitcoin Analysis",
    "content": "Market outlook for Q1 2025",
    "forumId": "bitcoin-discussion",
    "tags": ["analysis", "bitcoin"]
  }'
```

### Check DGT Balance
```bash
curl -X GET http://localhost:5001/api/wallet/balances \
  -H "Cookie: connect.sid=<session>"
```

### Send Chat Message
```bash
curl -X POST http://localhost:5001/api/shoutbox/messages \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=<session>" \
  -d '{
    "content": "GM crypto fam! 🚀",
    "room": "general"
  }'
```

## WebSocket Integration

**Production only** - Real-time features:

```javascript
const ws = new WebSocket('wss://degentalk.com/ws');

ws.on('message', (data) => {
  const event = JSON.parse(data);
  
  switch(event.type) {
    case 'new_message':
      updateChat(event.data);
      break;
    case 'balance_update':
      updateWalletBalance(event.data);
      break;
    case 'notification':
      showNotification(event.data);
      break;
  }
});
```

## Development Tools

### Environment Setup
```bash
# Start development server
npm run dev

# Seed database with test data
npm run seed:all

# Check API health
curl http://localhost:5001/api/forum/health
```

### Testing Endpoints
```bash
# Development role switching
curl -X GET "http://localhost:5001/api/auth/dev-mode/set-role?role=admin&userId=1"

# Test XP award
curl -X POST http://localhost:5001/api/xp/award \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=<session>" \
  -d '{"userId": 1, "amount": 100, "reason": "test"}'
```

## Security Implementation ⚡

### Multi-Layer Protection
- **CORS** w/ origin validation
- **CSRF** w/ session-based tokens
- **Rate limiting** w/ Redis backing
- **Permission middleware** on all routes
- **Audit logging** for security events
- **Query monitoring** w/ performance tracking

### Input Validation
- **Zod schemas** validate all request bodies
- **SQL injection protection** via parameterized queries  
- **XSS prevention** through content sanitization
- **File upload** validation w/ type checking

### Access Control Matrix
| Action | User | Mod | Admin |
|--------|------|-----|-------|
| View public forums | ✅ | ✅ | ✅ |
| Edit own posts | ✅ | ✅ | ✅ |
| Edit any posts | ❌ | ✅ | ✅ |
| Delete threads | Owner | ✅ | ✅ |
| Manage tags | Owner | ✅ | ✅ |
| User role changes | ❌ | ❌ | ✅ |

### Production Security
```env
# Required environment variables
NODE_ENV=production
SESSION_SECRET=<32+ chars>
DATABASE_URL=<secure connection>
REDIS_URL=<cluster connection>
CSRF_SECRET=<32+ chars>
```

## Migration & Compatibility

### Legacy Endpoints
Some endpoints maintain backwards compatibility:
- `/api/login` → `/api/auth/login`
- `/api/user` → `/api/auth/user`
- `/api/hot-threads` → `/api/content` (with filters)

### Breaking Changes
Version 2.0 introduces:
- **Unified authentication** system
- **Domain-based routing** structure
- **Enhanced error handling**
- **WebSocket integration**

## Support & Resources

- **GitHub Issues:** https://github.com/degentalk/api/issues
- **API Status:** https://status.degentalk.com
- **Developer Discord:** https://discord.gg/degentalk-dev
- **Rate Limit Monitoring:** Built into admin panel

---

**📚 Documentation created:** `/docs/api/README.md`

**Next Steps:**
1. Explore domain-specific documentation in subdirectories
2. Test endpoints using provided curl examples
3. Integrate WebSocket for real-time features
4. Review rate limiting for your use case