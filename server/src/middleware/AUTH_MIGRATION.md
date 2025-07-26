# Auth Middleware Migration Guide

## Overview
We're consolidating multiple auth middleware implementations into a single unified middleware that handles both JWT and session authentication consistently.

## Migration Map

### Old Import → New Import

```typescript
// From multiple files:
import { authenticate } from '@api/middleware/authenticate';
import { authenticateJWT } from '@api/middleware/authenticate-jwt';
import { isAuthenticated } from '@api/domains/auth/middleware/auth.middleware';
import { requireAuth } from '@api/middleware/auth';

// To unified:
import { requireAuth } from '@api/middleware/auth.unified';
```

### Function Mapping

| Old Function | Old File | New Function | Notes |
|-------------|----------|--------------|-------|
| `authenticate` | authenticate.ts | `requireAuth` | Now blocks if not authenticated |
| `authenticateJWT` | authenticate-jwt.ts | `requireAuth` | Handles both JWT and session |
| `authenticateHybrid` | authenticate-jwt.ts | `requireAuth` | Unified implementation |
| `isAuthenticated` | auth.middleware.ts | `requireAuth` | Same behavior, cleaner implementation |
| `requireAuth` | auth.ts | `requireAuth` | No change needed |
| `requireAdmin` | auth.ts | `requireAdmin` | Consistent error handling |
| `isAdmin` | auth.middleware.ts | `requireAdmin` | Use the middleware version |
| `requireModerator` | auth.ts | `requireModerator` | Now includes dev mode support |
| `isModerator` | auth.middleware.ts | `requireModerator` | Standardized |
| `isAdminOrModerator` | auth.middleware.ts | `requireModerator` | Moderator includes admin/owner |
| `isAuthenticatedOptional` | auth.middleware.ts | `optionalAuth` | Clearer naming |

## Key Changes

### 1. Consistent Error Responses
All auth failures now use `sendErrorResponse` with consistent error codes:
- `AUTHENTICATION_REQUIRED` - No valid auth found
- `INSUFFICIENT_PERMISSIONS` - Auth valid but wrong role
- `NO_TOKEN` - JWT-specific routes
- `SESSION_REQUIRED` - Session-specific routes

### 2. Unified User Object
All middleware now attaches the same user object structure from `@core/utils/auth.helpers`.

### 3. Development Mode
- Single approach: `DEV_BYPASS_PASSWORD=true` + `x-dev-role` header
- Admin bypass: `ALLOW_DEV_ADMIN=true` for DevUser

### 4. Specialized Middleware
- `requireJWT` - For routes that ONLY accept JWT (e.g., API endpoints)
- `requireSession` - For routes that ONLY accept sessions (e.g., SSR pages)
- `requireAuth` - For routes that accept either (most common)

## Migration Steps

1. **Update imports** in route files to use `auth.unified`
2. **Replace function calls** according to the mapping table
3. **Test auth flows** - both JWT and session should work
4. **Remove old middleware files** once migration is complete

## Example Migration

### Before:
```typescript
import { isAuthenticated, isAdmin } from '@api/domains/auth/middleware/auth.middleware';

router.get('/profile', isAuthenticated, async (req, res) => {
  // ...
});

router.post('/admin/users', isAuthenticated, isAdmin, async (req, res) => {
  // ...
});
```

### After:
```typescript
import { requireAuth, requireAdmin } from '@api/middleware/auth.unified';

router.get('/profile', requireAuth, async (req, res) => {
  // ...
});

router.post('/admin/users', requireAdmin, async (req, res) => {
  // Note: requireAdmin includes authentication check
});
```

## Testing Checklist

- [ ] JWT authentication works
- [ ] Session authentication works
- [ ] Dev mode bypass works
- [ ] Admin routes properly protected
- [ ] Error responses are consistent
- [ ] User object structure is correct