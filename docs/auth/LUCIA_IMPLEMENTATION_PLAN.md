# Lucia Auth Implementation Plan for DegenTalk

## Overview

This document outlines the comprehensive plan for migrating DegenTalk's authentication system from the current Passport.js + custom implementation to Lucia Auth, a lightweight and secure authentication library.

## Current Authentication System Analysis

### Current Architecture
- **Primary Auth Hook**: `client/src/hooks/use-auth.tsx` - React Context with TanStack Query
- **Deprecated Components**: `client/src/archive/features/auth/useCanonicalAuth.tsx` (archived)
- **Server Middleware**: `server/src/middleware/auth.unified.ts` - Unified auth layer
- **Backend Routes**: `server/src/domains/auth/auth.routes.ts` - Passport.js integration
- **Database Schema**: `db/schema/user/users.ts` - PostgreSQL with Drizzle ORM

### Current Flow
1. **Client**: React Context (`AuthProvider`) manages state with TanStack Query
2. **Authentication**: Supports both JWT tokens and Passport.js sessions
3. **Session Management**: Express sessions with in-memory/Redis store
4. **Database**: PostgreSQL with complex user schema (179+ fields)
5. **Development Mode**: Mock users with role switching

### Key Components to Replace
- Passport.js LocalStrategy configuration
- Express session management
- Current JWT implementation
- Mock user system for development
- Session cookie handling

## Why Lucia Auth?

### Benefits
- **Lightweight**: No heavy framework dependencies
- **Type-Safe**: Full TypeScript support with proper typing
- **Flexible**: Works with any database and framework
- **Secure**: Built-in CSRF protection and secure session handling
- **Modern**: Uses modern crypto APIs and secure defaults
- **Framework Agnostic**: Works with Express, Next.js, SvelteKit, etc.

### Lucia Features We'll Use
- Session-based authentication with secure tokens
- Built-in session validation and refresh
- Secure cookie management
- Password hashing utilities
- Rate limiting support
- OAuth integration ready

## Database Schema Changes

### Required Lucia Tables

```sql
-- Sessions table for Lucia
CREATE TABLE user_session (
    id TEXT NOT NULL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance
CREATE INDEX idx_user_session_user_id ON user_session(user_id);
CREATE INDEX idx_user_session_expires_at ON user_session(expires_at);
```

### User Table Modifications

The existing `users` table is compatible with Lucia. Key fields:
- `user_id` (UUID) - Primary key ✅
- `password_hash` - For password authentication ✅
- `email` - For login ✅
- `username` - For login ✅
- `is_active`, `is_banned` - For account status ✅

### Drizzle Schema Definition

```typescript
// db/schema/auth/sessions.ts
export const sessions = pgTable('user_session', {
  id: text('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
```

## Implementation Architecture

### Core Lucia Setup

```typescript
// server/src/lib/lucia.ts
import { Lucia } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "@db";
import { users, sessions } from "@schema";
import type { User } from "@shared/types/user.types";

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true
    }
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      username: attributes.username,
      email: attributes.email,
      role: attributes.role,
      isActive: attributes.isActive,
      isVerified: attributes.isVerified,
      // ... other user attributes
    };
  }
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Omit<User, "id">;
  }
}
```

### Session Management

```typescript
// server/src/lib/session.ts
import { lucia } from "./lucia";
import { cookies } from "next/headers"; // or appropriate framework
import { cache } from "react";

export const validateRequest = cache(async () => {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return { user: null, session: null };
  }

  const result = await lucia.validateSession(sessionId);
  
  // Next.js throws when you attempt to set cookie when rendering page
  try {
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    }
  } catch {}
  
  return result;
});
```

### Authentication Functions

```typescript
// server/src/lib/auth.ts
import { lucia } from "./lucia";
import { hash, verify } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { db } from "@db";
import { users } from "@schema";
import { eq } from "drizzle-orm";

export async function createUser(username: string, email: string, password: string) {
  const passwordHash = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
  
  const userId = generateIdFromEntropySize(10);
  
  await db.insert(users).values({
    id: userId,
    username,
    email,
    password: passwordHash,
    // ... other default values
  });
  
  return userId;
}

export async function verifyPassword(userId: string, password: string) {
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user[0]) return false;
  
  return await verify(user[0].password, password);
}
```

## Migration Strategy

### Phase 1: Database Setup
1. Create migration for `user_session` table
2. Add any missing indexes for performance
3. Test migration on development database

### Phase 2: Core Lucia Integration
1. Install Lucia dependencies
2. Set up Lucia configuration
3. Create session management utilities
4. Update database connection to support Lucia adapter

### Phase 3: Server-Side Migration
1. Replace Passport.js middleware with Lucia session validation
2. Update auth routes (login, logout, register)
3. Replace JWT token handling with Lucia sessions
4. Update protected route middleware

### Phase 4: Client-Side Migration
1. Update `use-auth.tsx` hook to work with Lucia sessions
2. Replace TanStack Query auth endpoints
3. Update development mock system
4. Test role-based permissions

### Phase 5: Testing & Cleanup
1. Comprehensive testing of auth flows
2. Remove deprecated Passport.js code
3. Update TypeScript types
4. Performance testing

## Development Mode Strategy

Lucia doesn't have built-in development mocking, so we'll implement:

```typescript
// server/src/lib/dev-auth.ts
export async function createDevSession(role: 'user' | 'admin' | 'moderator') {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Dev auth only available in development');
  }
  
  const mockUserId = `dev-${role}`;
  const session = await lucia.createSession(mockUserId, {});
  return session;
}
```

## API Changes

### Login Endpoint
```typescript
// Before (Passport.js)
app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
  res.json({ user: req.user });
});

// After (Lucia)
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  const user = await getUserByUsername(username);
  if (!user || !await verifyPassword(user.id, password)) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  
  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  
  res.setHeader('Set-Cookie', sessionCookie.serialize());
  return res.json({ user });
});
```

### Logout Endpoint
```typescript
// After (Lucia)
app.post('/api/auth/logout', async (req, res) => {
  const sessionId = req.cookies[lucia.sessionCookieName];
  if (sessionId) {
    await lucia.invalidateSession(sessionId);
  }
  
  const sessionCookie = lucia.createBlankSessionCookie();
  res.setHeader('Set-Cookie', sessionCookie.serialize());
  return res.json({ success: true });
});
```

## Security Improvements

### CSRF Protection
```typescript
// server/src/middleware/csrf.ts
export function verifyRequestOrigin(origin: string, host: string): boolean {
  return origin === `https://${host}` || 
         (process.env.NODE_ENV === 'development' && origin === `http://${host}`);
}
```

### Rate Limiting
```typescript
// server/src/middleware/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 requests per minute
});

export async function rateLimitAuth(identifier: string) {
  const { success } = await ratelimit.limit(identifier);
  return success;
}
```

## Breaking Changes

### Client-Side
- Session cookie name will change
- Mock user IDs will change format
- Some auth state properties may be renamed

### Server-Side
- Passport.js middleware removed
- Session serialization format changes
- Auth route response formats may change

## Rollback Plan

1. Keep current auth system running in parallel during migration
2. Feature flag to switch between old and new auth
3. Database rollback scripts ready
4. Monitoring for session validation failures

## Performance Considerations

### Session Storage
- PostgreSQL-based sessions (current: in-memory/Redis)
- Automatic session cleanup via expiration
- Indexed queries for fast lookups

### Caching Strategy
- Cache user data after session validation
- Use React Query for client-side auth state caching
- Consider Redis for session metadata if needed

## Timeline Estimate

- **Phase 1** (Database Setup): 1-2 days
- **Phase 2** (Core Integration): 2-3 days  
- **Phase 3** (Server Migration): 3-4 days
- **Phase 4** (Client Migration): 2-3 days
- **Phase 5** (Testing/Cleanup): 2-3 days

**Total: 10-15 days**

## Dependencies

```json
{
  "lucia": "^3.0.0",
  "@lucia-auth/adapter-drizzle": "^1.0.0",
  "@node-rs/argon2": "^1.8.0",
  "oslo": "^1.2.0"
}
```

## Success Metrics

- All existing auth flows working
- Zero security regressions
- Improved session performance
- Reduced authentication code complexity
- Maintained development experience

## Next Steps

1. Get approval for migration approach
2. Create feature branch for implementation
3. Start with Phase 1 (Database Setup)
4. Set up monitoring for auth metrics
5. Plan team communication for breaking changes