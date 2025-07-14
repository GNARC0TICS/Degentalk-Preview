# Development Authentication Workflow

This guide covers the development authentication tools and workflows for DegenTalk. These utilities are designed to streamline development and testing with realistic authentication scenarios.

## Overview

DegenTalk uses a **hybrid authentication system** that supports both:
- **JWT tokens** for API endpoints (stateless, 7-day expiry)
- **Session cookies** for SSR pages (stateful, server-side)

## Quick Start

### 1. Seed Test Users with Tokens

Generate test users with pre-generated JWT tokens:

```bash
pnpm run seed:users:tokens
```

This creates:
- `testadmin` - Admin user with full permissions
- `testmod` - Moderator with elevated permissions  
- `testuser01-05` - Regular users with varying XP levels

All users have the password: `testpass`

Tokens are automatically cached in `.cache/dev-tokens.json`

### 2. CLI Login

Login as any user and receive a JWT token:

```bash
# JWT login (default)
pnpm run dev:login testuser01 testpass

# Session-based login
pnpm run dev:login testadmin testpass --session
```

The token and login details are:
- Displayed in the terminal with example curl commands
- Cached in `.cache/dev-tokens.json` for reuse
- Valid for 7 days from generation

### 3. Auto-Login on Server Start

Enable automatic login when the server starts:

```bash
# In .env.local
DEV_FORCE_AUTH=true

# Start server
pnpm dev
```

When enabled:
- Checks for valid cached tokens on startup
- Auto-generates tokens for `testadmin` and `testuser01` if needed
- Displays available tokens in a formatted table
- Only runs in development environment

### 4. Logout Utility

Clear cached authentication tokens:

```bash
# View cached logins
pnpm run dev:logout

# Logout specific user
pnpm run dev:logout testuser01

# Clear all cached tokens
pnpm run dev:logout --all
```

## Token Cache

Tokens are stored in `.cache/dev-tokens.json` with the following structure:

```json
[
  {
    "username": "testadmin",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "role": "admin",
    "expiresAt": "2025-01-21T12:00:00.000Z",
    "loginMethod": "jwt",
    "sessionCookie": "connect.sid=..." // Only for session logins
  }
]
```

## API Testing Examples

### Using JWT Token

```bash
# Get user XP info
curl -H "Authorization: Bearer <token>" \
     http://localhost:5001/api/xp/user/<userId>

# Get wallet balance  
curl -H "Authorization: Bearer <token>" \
     http://localhost:5001/api/wallet/balance

# Admin endpoint (requires admin role)
curl -H "Authorization: Bearer <token>" \
     http://localhost:5001/api/admin/users
```

### Using Session Cookie

```bash
# Login and save cookie
curl -c cookies.txt -X POST http://localhost:5001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"testadmin","password":"testpass"}'

# Use saved cookie
curl -b cookies.txt http://localhost:5001/api/xp/user/<userId>
```

## Environment Variables

```bash
# .env.local
JWT_SECRET="your_super_secure_jwt_secret_at_least_32_characters_long"
DEV_FORCE_AUTH=true  # Enable auto-login on server start
NODE_ENV=development # Required for dev tools to work
```

## Security Notes

- **Development Only**: All these tools check `NODE_ENV` and refuse to run in production
- **Token Expiry**: JWT tokens expire after 7 days and cannot be revoked (future enhancement)
- **Session Security**: Session cookies are httpOnly and secure in production
- **Cached Tokens**: The `.cache/` directory is gitignored for security

## Troubleshooting

### Token Expired
```bash
# Clear expired tokens and generate new ones
pnpm run dev:logout --all
pnpm run seed:users:tokens
```

### Port Already in Use
```bash
# Kill processes on development ports
pnpm kill-ports
```

### Missing Test Users
```bash
# Re-run the complete seed
pnpm seed:all
```

## Integration with Frontend

The frontend auth hook (`useAuth`) automatically:
- Checks for JWT token in localStorage
- Falls back to session cookie if no token
- Refreshes user data on mount
- Handles token expiry gracefully

Example frontend usage:

```typescript
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/utils/api';

function MyComponent() {
  const { user, isAuthenticated } = useAuth();
  
  // API client automatically includes token
  const fetchData = async () => {
    const response = await apiClient.get('/api/some-endpoint');
    // Token is included via interceptor
  };
}
```

## Best Practices

1. **Use Specific Test Users**: Create test users for specific scenarios (admin testing, XP testing, etc.)
2. **Cache Management**: Clear cache periodically to avoid stale tokens
3. **Environment Isolation**: Never commit `.cache/` or `.env.local` files
4. **Realistic Testing**: Use the hybrid auth system as production would
5. **Token Rotation**: Generate fresh tokens weekly during active development

## Future Enhancements

- Token blacklist/revocation mechanism
- Refresh token implementation  
- OAuth provider integration
- Multi-device session management
- Token analytics and monitoring

---

This development authentication workflow provides a seamless experience for testing authentication scenarios without the overhead of manual login flows. All tools are scoped to development only and integrate cleanly with the existing authentication system.