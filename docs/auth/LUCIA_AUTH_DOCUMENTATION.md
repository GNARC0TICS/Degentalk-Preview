# Lucia Auth v3 Documentation - Degentalk

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Key Components](#key-components)
3. [Authentication Flow](#authentication-flow)
4. [Session Management](#session-management)
5. [Development Mode Features](#development-mode-features)
6. [Migration from Passport.js](#migration-from-passportjs)
7. [API Endpoints](#api-endpoints)
8. [Security Considerations](#security-considerations)
9. [Configuration](#configuration)
10. [Troubleshooting Guide](#troubleshooting-guide)

## Architecture Overview

The Lucia Auth implementation in Degentalk follows a clean architecture pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (React)                        │
│                    /hooks/use-auth.tsx                       │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTP/Cookie
┌─────────────────────────────▼───────────────────────────────┐
│                    Express Middleware                         │
│              /middleware/lucia-auth.middleware.ts             │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                       Controllers                             │
│        /domains/auth/controllers/lucia-auth.controller.ts    │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                        Services                               │
│         /domains/auth/services/lucia-auth.service.ts         │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                      Repositories                             │
│       /domains/auth/repositories/auth.repository.ts          │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                    Database (PostgreSQL)                      │
│              users table | user_session table                 │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Lucia Configuration (`/server/src/lib/lucia/index.ts`)

Core Lucia setup with PostgreSQL adapter:

```typescript
import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from '@db';
import { users, userSessions } from '@schema';

const adapter = new DrizzlePostgreSQLAdapter(db, userSessions, users);

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(30, 'd'), // 30 days
  sessionCookie: {
    name: 'degentalk_session',
    expires: false, // Session cookies
    attributes: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      path: '/'
    }
  },
  getUserAttributes: (attributes) => {
    // Map database user to session user
    return {
      id: attributes.id,
      username: attributes.username,
      email: attributes.email,
      role: attributes.role,
      isAdmin: attributes.role === 'admin' || attributes.role === 'owner',
      isModerator: attributes.role === 'moderator' || attributes.role === 'owner',
      // ... other attributes
    };
  }
});
```

### 2. Auth Service (`/server/src/domains/auth/services/lucia-auth.service.ts`)

Business logic for authentication operations:

```typescript
export class LuciaAuthService {
  async login(usernameOrEmail: string, password: string, request: Request) {
    // Find user
    const user = await authRepository.findUserByUsernameOrEmail(usernameOrEmail);
    if (!user) return { success: false, error: 'Invalid credentials' };

    // Verify password
    const valid = await authRepository.verifyPassword(user.id, password);
    if (!valid) return { success: false, error: 'Invalid credentials' };

    // Create session
    const session = await lucia.createSession(user.id, {
      ipAddress: getClientIp(request),
      userAgent: request.headers['user-agent'],
      deviceId: generateDeviceId(request)
    });

    return { 
      success: true, 
      user, 
      session,
      sessionCookie: lucia.createSessionCookie(session.id)
    };
  }
}
```

### 3. Auth Repository (`/server/src/domains/auth/repositories/auth.repository.ts`)

Data access layer following repository pattern:

```typescript
export class AuthRepository extends BaseRepository {
  async createUser(data: { username: string; email: string; password: string }) {
    const passwordHash = await hash(data.password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1
    });
    
    const userId = toUserId(uuidv4());
    
    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        username: data.username,
        email: data.email,
        password: passwordHash,
        // ... default values
      })
      .returning();
    
    return this.mapToUser(user);
  }
}
```

### 4. Auth Controller (`/server/src/domains/auth/controllers/lucia-auth.controller.ts`)

HTTP endpoint handlers:

```typescript
export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  
  const result = await luciaAuthService.login(username, password, req);
  
  if (!result.success) {
    return errorResponses.validationError(res, result.error);
  }
  
  res.setHeader('Set-Cookie', result.sessionCookie.serialize());
  return sendSuccess(res, { user: result.user, sessionId: result.session.id });
}
```

### 5. Auth Middleware (`/server/src/middleware/lucia-auth.middleware.ts`)

Request authentication and authorization:

```typescript
export async function validateRequest(req: Request, res: Response, next: NextFunction) {
  const sessionId = lucia.readSessionCookie(req.headers.cookie ?? '');
  
  if (!sessionId) {
    req.user = null;
    req.session = null;
    return next();
  }

  const { session, user } = await lucia.validateSession(sessionId);
  
  if (session && session.fresh) {
    // Session was extended
    res.setHeader('Set-Cookie', lucia.createSessionCookie(session.id).serialize());
  }
  
  req.user = user;
  req.session = session;
  next();
}
```

### 6. Session Schema (`/db/schema/auth/sessions.ts`)

Database schema for sessions:

```typescript
export const userSessions = pgTable('user_session', {
  id: text('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  deviceId: text('device_id'),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true })
    .defaultNow()
});
```

### 7. React Auth Hook (`/client/src/hooks/use-auth.tsx`)

Client-side authentication state management:

```typescript
export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const response = await apiRequest<{ user: User | null }>('/api/auth/me');
      return response.user;
    },
    staleTime: Infinity
  });

  const login = async (credentials: LoginCredentials) => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      data: credentials
    });
    queryClient.setQueryData(['auth', 'session'], response.user);
  };

  return { user, isLoading, login, logout, register };
}
```

## Authentication Flow

### Registration Flow

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant Service
    participant Repository
    participant Database
    participant Lucia

    Client->>Controller: POST /api/auth/register
    Controller->>Service: register(userData)
    Service->>Repository: findUserByUsername()
    Repository->>Database: SELECT from users
    Database-->>Repository: null (user doesn't exist)
    Service->>Repository: createUser(userData)
    Repository->>Repository: hash password (Argon2)
    Repository->>Database: INSERT into users
    Database-->>Repository: new user
    Service->>Lucia: createSession(userId)
    Lucia->>Database: INSERT into user_session
    Database-->>Lucia: session
    Service-->>Controller: { user, session, cookie }
    Controller-->>Client: 201 Created + Set-Cookie
```

### Login Flow

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant Service
    participant Repository
    participant Database
    participant Lucia

    Client->>Controller: POST /api/auth/login
    Controller->>Service: login(username, password)
    Service->>Repository: findUserByUsernameOrEmail()
    Repository->>Database: SELECT from users
    Database-->>Repository: user data
    Service->>Repository: verifyPassword()
    Repository->>Repository: Argon2 verify
    Service->>Lucia: createSession(userId)
    Lucia->>Database: INSERT into user_session
    Database-->>Lucia: session
    Service-->>Controller: { user, session, cookie }
    Controller-->>Client: 200 OK + Set-Cookie
```

### Session Validation Flow

```mermaid
sequenceDiagram
    participant Client
    participant Middleware
    participant Lucia
    participant Database

    Client->>Middleware: Request with Cookie
    Middleware->>Lucia: readSessionCookie()
    Lucia->>Lucia: extract sessionId
    Middleware->>Lucia: validateSession(sessionId)
    Lucia->>Database: SELECT from user_session
    Database-->>Lucia: session data
    Lucia->>Database: SELECT from users
    Database-->>Lucia: user data
    Lucia->>Lucia: check expiration
    alt Session is fresh
        Lucia->>Lucia: extend session
        Middleware->>Client: Set-Cookie (new expiry)
    end
    Middleware->>Middleware: req.user = user
    Middleware->>Next: continue request
```

## Session Management

### Session Lifecycle

1. **Creation**: Sessions are created on successful login or registration
2. **Duration**: Sessions expire after 30 days of inactivity
3. **Extension**: Sessions are automatically extended when validated (sliding window)
4. **Invalidation**: Sessions can be manually invalidated on logout

### Session Metadata

Each session stores:
- `id`: Unique session identifier
- `userId`: Reference to the user
- `expiresAt`: Expiration timestamp
- `ipAddress`: Client IP address
- `userAgent`: Browser/client information
- `deviceId`: Generated device identifier
- `lastActiveAt`: Last activity timestamp

### Session Security

- Sessions use cryptographically secure random IDs
- Session cookies are httpOnly, secure (in production), and sameSite
- Sessions can be invalidated server-side
- No session data is stored client-side

## Development Mode Features

### Password Bypass

When `DEV_BYPASS_PASSWORD=true`, any password works for existing users:

```typescript
if (process.env.DEV_BYPASS_PASSWORD === 'true') {
  logger.warn('AUTH', 'Password bypass is enabled - development only!');
  // Skip password verification
}
```

### Dev Users

Pre-configured development users:

```typescript
const DEV_USERS = {
  'DevUser': { role: 'user', userId: '550e8400-e29b-41d4-a716-446655440001' },
  'DevMod': { role: 'moderator', userId: '550e8400-e29b-41d4-a716-446655440003' },
  'DevAdmin': { role: 'admin', userId: '550e8400-e29b-41d4-a716-446655440004' },
  'SuperAdmin': { role: 'owner', userId: '550e8400-e29b-41d4-a716-446655440006' }
};
```

### Quick Development Login

```bash
# With dev bypass enabled
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"DevAdmin","password":"anything"}'
```

## Migration from Passport.js

### Key Changes

1. **Session Storage**: Database-backed sessions instead of memory/Redis
2. **Cookie Name**: Changed from `connect.sid` to `degentalk_session`
3. **Session Format**: Lucia's session structure vs Express sessions
4. **Middleware**: New middleware functions for auth checks
5. **Password Hashing**: Argon2 instead of bcrypt

### Migration Checklist

- [x] Install Lucia dependencies
- [x] Create session table migration
- [x] Implement Lucia configuration
- [x] Create auth service with Lucia
- [x] Update auth controllers
- [x] Replace Passport middleware
- [x] Update client auth hook
- [x] Remove Passport dependencies
- [x] Test all auth flows

## API Endpoints

### POST /api/auth/register

Register a new user account.

**Request:**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "securepassword123",
  "confirmPassword": "securepassword123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "username": "newuser",
      "email": "user@example.com",
      "role": "user",
      // ... other user fields
    },
    "message": "Registration successful! You are now logged in."
  }
}
```

### POST /api/auth/login

Authenticate user and create session.

**Request:**
```json
{
  "username": "username_or_email",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "sessionId": "session_id_here"
  }
}
```

### GET /api/auth/me

Get current authenticated user.

**Headers:**
```
Cookie: degentalk_session=your_session_id
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": { /* user object */ }
}
```

### POST /api/auth/logout

End current session.

**Headers:**
```
Cookie: degentalk_session=your_session_id
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": null,
  "message": "Logged out successfully"
}
```

### POST /api/auth/verify-email

Verify email address with token.

**Request:**
```json
{
  "token": "verification_token_here"
}
```

### POST /api/auth/forgot-password

Request password reset email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

### POST /api/auth/reset-password

Reset password with token.

**Request:**
```json
{
  "token": "reset_token_here",
  "password": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

## Security Considerations

### Password Security

- **Algorithm**: Argon2id (winner of Password Hashing Competition)
- **Parameters**:
  - Memory: 19MB (19456 KiB)
  - Iterations: 2
  - Parallelism: 1
  - Output length: 32 bytes

### Session Security

- **Session IDs**: Cryptographically secure random generation
- **Cookie Attributes**:
  - `httpOnly`: Prevents JavaScript access
  - `secure`: HTTPS only in production
  - `sameSite`: CSRF protection
- **Expiration**: 30-day sliding window
- **Invalidation**: Server-side session termination

### Rate Limiting

Auth endpoints are protected by rate limiting:
- Registration: 5 attempts per IP per hour
- Login: 10 attempts per IP per 15 minutes
- Password reset: 3 attempts per IP per hour

### CSRF Protection

- SameSite cookies provide CSRF protection
- Additional CSRF tokens can be implemented if needed

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db
DIRECT_DATABASE_URL=postgresql://user:pass@host/db  # For migrations

# Session
SESSION_SECRET=your-secret-key-here

# Development
NODE_ENV=development
DEV_BYPASS_PASSWORD=false  # Set to true for dev mode

# Security
CORS_ORIGIN=http://localhost:5173
```

### Lucia Configuration Options

```typescript
{
  // Session duration
  sessionExpiresIn: new TimeSpan(30, 'd'),
  
  // Cookie settings
  sessionCookie: {
    name: 'degentalk_session',
    expires: false,  // Session cookie
    attributes: {
      secure: true,   // HTTPS only
      httpOnly: true, // No JS access
      sameSite: 'lax' // CSRF protection
    }
  },
  
  // User attribute mapping
  getUserAttributes: (dbUser) => ({
    // Map database fields to session user
  })
}
```

## Troubleshooting Guide

### Common Issues

#### 1. "user_session table does not exist"

**Cause**: Database migration not applied.

**Solution**:
```bash
# Apply the session table migration
cd /path/to/project
pnpm tsx scripts/migrations/apply-lucia-migration.ts
```

#### 2. "Invalid UUID format"

**Cause**: User ID generation using wrong format.

**Solution**: Ensure using `uuidv4()` for user ID generation:
```typescript
import { v4 as uuidv4 } from 'uuid';
const userId = toUserId(uuidv4());
```

#### 3. "Session not persisting"

**Cause**: Cookie not being set or read correctly.

**Check**:
- Browser DevTools → Application → Cookies
- Verify `degentalk_session` cookie exists
- Check cookie domain and path settings

#### 4. "Dev mode not working"

**Cause**: Environment variable not set.

**Solution**:
```bash
# In .env.local
DEV_BYPASS_PASSWORD=true
```

### Debug Tips

#### Enable Verbose Logging

```typescript
// In lucia configuration
export const lucia = new Lucia(adapter, {
  // ... other config
  experimental: {
    debugMode: true  // Logs all Lucia operations
  }
});
```

#### Check Session in Database

```sql
-- View all active sessions
SELECT * FROM user_session 
WHERE expires_at > NOW() 
ORDER BY created_at DESC;

-- Check specific user's sessions
SELECT * FROM user_session 
WHERE user_id = 'user-uuid-here';
```

#### Test with cURL

```bash
# Register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123","confirmPassword":"password123"}' \
  -c cookies.txt

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"password123"}' \
  -c cookies.txt

# Get current user
curl http://localhost:5001/api/auth/me \
  -b cookies.txt

# Logout
curl -X POST http://localhost:5001/api/auth/logout \
  -b cookies.txt
```

### Performance Optimization

#### Session Cleanup

Implement periodic cleanup of expired sessions:

```typescript
// Cleanup job
async function cleanupExpiredSessions() {
  await db
    .delete(userSessions)
    .where(lt(userSessions.expiresAt, new Date()));
}

// Run daily
setInterval(cleanupExpiredSessions, 24 * 60 * 60 * 1000);
```

#### Index Optimization

Ensure proper indexes on session table:

```sql
CREATE INDEX idx_user_sessions_user_id ON user_session(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_session(expires_at);
CREATE INDEX idx_user_sessions_device_id ON user_session(device_id);
```

## Best Practices

1. **Never store sensitive data in sessions** - Only store user ID
2. **Use HTTPS in production** - Secure cookies require HTTPS
3. **Implement session limits** - Limit concurrent sessions per user
4. **Monitor failed login attempts** - Implement account lockout
5. **Regular security audits** - Review auth logs and patterns
6. **Keep dependencies updated** - Regular updates for security patches

## Resources

- [Lucia Documentation](https://lucia-auth.com/)
- [Argon2 Specification](https://github.com/P-H-C/phc-winner-argon2)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [PostgreSQL Session Storage Best Practices](https://www.postgresql.org/docs/current/indexes.html)