# Updated Lucia Auth Migration Plan - July 2025

## Current State Analysis

### What Has Changed Since Original Plan
1. **User ID Format**: Now using UUID format (`00000000-0000-4000-8000-000000000001`)
2. **Password Field**: Database uses `password_hash` (confirmed)
3. **Role System**: Changed from `super_admin` to `owner` role
4. **Type System**: Stronger type enforcement with branded types (UserId, etc.)
5. **Mock User System**: More complex with full User type requirements

### Current Pain Points
- Heavy `as any` usage bypassing type safety
- Inconsistent API responses (wrapped vs unwrapped)
- Dev mode security concerns with hardcoded UUIDs
- Direct database access in auth controller
- Missing required fields causing runtime errors

## Updated Implementation Strategy

### Phase 1: Database Setup (1-2 days)

#### 1.1 Create Session Table Migration
```typescript
// db/migrations/postgres/[timestamp]_add_lucia_sessions.sql
CREATE TABLE user_sessions (
    id TEXT NOT NULL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    -- Additional session metadata
    device_id TEXT,
    last_active_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_device_id ON user_sessions(device_id);
```

#### 1.2 Update Drizzle Schema
```typescript
// db/schema/auth/sessions.ts
import { pgTable, text, uuid, timestamp, inet } from 'drizzle-orm/pg-core';
import { users } from '../user/users';

export const userSessions = pgTable('user_sessions', {
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

export type Session = typeof userSessions.$inferSelect;
export type NewSession = typeof userSessions.$inferInsert;
```

### Phase 2: Core Lucia Integration (2-3 days)

#### 2.1 Install Dependencies
```json
{
  "lucia": "^3.2.0",
  "@lucia-auth/adapter-drizzle": "^1.0.7",
  "@node-rs/argon2": "^1.8.3",
  "oslo": "^1.2.1"
}
```

#### 2.2 Create Lucia Configuration
```typescript
// server/src/lib/lucia/index.ts
import { Lucia, TimeSpan } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "@db";
import { users, userSessions } from "@schema";
import type { User } from "@shared/types/user.types";
import { isDevMode } from "@utils/environment";

const adapter = new DrizzlePostgreSQLAdapter(db, userSessions, users);

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(30, "d"), // 30 days
  sessionCookie: {
    name: "degentalk_session",
    expires: false, // Session cookies
    attributes: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      path: "/"
    }
  },
  getUserAttributes: (attributes) => {
    // Return full User type attributes
    return {
      id: attributes.id,
      username: attributes.username,
      email: attributes.email,
      role: attributes.role,
      // Gamification
      xp: attributes.xp,
      level: attributes.level,
      reputation: attributes.reputation,
      // Wallet
      walletId: attributes.walletId,
      dgtBalance: attributes.dgtBalance,
      totalTipped: attributes.totalTipped,
      totalReceived: attributes.totalReceived,
      // Status
      emailVerified: attributes.emailVerified,
      isActive: attributes.isActive,
      isBanned: attributes.isBanned,
      isVerified: attributes.isVerified,
      // Timestamps
      createdAt: attributes.createdAt,
      lastSeen: attributes.lastSeen,
      joinedAt: attributes.joinedAt,
      // Profile
      avatarUrl: attributes.avatarUrl,
      bannerUrl: attributes.bannerUrl,
      bio: attributes.bio,
      signature: attributes.signature,
      // Computed flags
      isAdmin: attributes.role === 'admin' || attributes.role === 'owner',
      isModerator: attributes.role === 'moderator' || attributes.role === 'owner'
    };
  }
});

// Type declarations for Lucia
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
  }
}

interface DatabaseUserAttributes extends Omit<User, 'id' | 'isAdmin' | 'isModerator'> {}

interface DatabaseSessionAttributes {
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  lastActiveAt: Date;
}
```

#### 2.3 Create Repository Pattern for Auth
```typescript
// server/src/domains/auth/repositories/auth.repository.ts
import { Injectable } from '@core/decorators';
import { BaseRepository } from '@core/repository/base-repository';
import { db } from '@db';
import { users, userSessions } from '@schema';
import { eq, and, gte } from 'drizzle-orm';
import type { UserId } from '@shared/types/ids';
import type { User } from '@shared/types/user.types';
import { hash, verify } from "@node-rs/argon2";

@Injectable()
export class AuthRepository extends BaseRepository {
  async findUserByUsername(username: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    
    return user ? this.mapToUser(user) : null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    return user ? this.mapToUser(user) : null;
  }

  async createUser(data: {
    username: string;
    email: string;
    password: string;
  }): Promise<User> {
    const passwordHash = await this.hashPassword(data.password);
    
    const [user] = await db
      .insert(users)
      .values({
        username: data.username,
        email: data.email,
        password: passwordHash,
        // Set defaults that match User type requirements
        xp: 0,
        level: 1,
        reputation: 0,
        dgtBalance: 0,
        totalTipped: 0,
        totalReceived: 0,
        emailVerified: false,
        isActive: isDevMode(), // Active in dev mode
        isBanned: false,
        isVerified: false,
        joinedAt: new Date(),
        lastSeen: new Date()
      })
      .returning();
    
    return this.mapToUser(user);
  }

  async verifyPassword(userId: UserId, password: string): Promise<boolean> {
    const [user] = await db
      .select({ password: users.password })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!user) return false;
    
    return verify(user.password, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1
    });
  }

  private async hashPassword(password: string): Promise<string> {
    return hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1
    });
  }

  private mapToUser(dbUser: any): User {
    return {
      ...dbUser,
      isAdmin: dbUser.role === 'admin' || dbUser.role === 'owner',
      isModerator: dbUser.role === 'moderator' || dbUser.role === 'owner'
    };
  }
}
```

### Phase 3: Server-Side Migration (3-4 days)

#### 3.1 Create New Auth Service with Lucia
```typescript
// server/src/domains/auth/services/lucia-auth.service.ts
import { lucia } from '@lib/lucia';
import { AuthRepository } from '../repositories/auth.repository';
import { generateId } from 'lucia';
import type { User } from '@shared/types/user.types';
import type { UserId } from '@shared/types/ids';
import { isDevMode } from '@utils/environment';
import { logger } from '@core/logger';

export class LuciaAuthService {
  constructor(private authRepository: AuthRepository) {}

  async login(username: string, password: string, request: Request) {
    try {
      // Find user by username or email
      let user = await this.authRepository.findUserByUsername(username);
      if (!user) {
        user = await this.authRepository.findUserByEmail(username);
      }

      if (!user) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Check if user is active
      if (!user.isActive) {
        return { success: false, error: 'Account is not active' };
      }

      // Check if user is banned
      if (user.isBanned) {
        return { success: false, error: 'Account is banned' };
      }

      // Verify password
      const validPassword = await this.authRepository.verifyPassword(user.id, password);
      if (!validPassword) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Create session
      const session = await lucia.createSession(user.id, {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        deviceId: this.generateDeviceId(request)
      });

      const sessionCookie = lucia.createSessionCookie(session.id);

      return {
        success: true,
        user,
        sessionCookie
      };
    } catch (error) {
      logger.error('AUTH', 'Login error', { error });
      return { success: false, error: 'Login failed' };
    }
  }

  async logout(sessionId: string | null) {
    if (!sessionId) return;
    
    await lucia.invalidateSession(sessionId);
  }

  async validateSession(sessionId: string) {
    return lucia.validateSession(sessionId);
  }

  async register(data: {
    username: string;
    email: string;
    password: string;
  }) {
    try {
      // Check if username exists
      const existingUsername = await this.authRepository.findUserByUsername(data.username);
      if (existingUsername) {
        return { success: false, error: 'Username already exists' };
      }

      // Check if email exists
      const existingEmail = await this.authRepository.findUserByEmail(data.email);
      if (existingEmail) {
        return { success: false, error: 'Email already exists' };
      }

      // Create user
      const user = await this.authRepository.createUser(data);

      // In dev mode, auto-activate and create session
      if (isDevMode()) {
        const session = await lucia.createSession(user.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        
        return {
          success: true,
          user,
          sessionCookie
        };
      }

      // In production, send verification email
      // TODO: Implement email verification

      return {
        success: true,
        user,
        message: 'Please check your email to verify your account'
      };
    } catch (error) {
      logger.error('AUTH', 'Registration error', { error });
      return { success: false, error: 'Registration failed' };
    }
  }

  private generateDeviceId(request: Request): string {
    // Generate a device ID based on user agent and IP
    const ua = request.headers['user-agent'] || '';
    const ip = request.ip || '';
    return Buffer.from(`${ua}-${ip}`).toString('base64').slice(0, 32);
  }
}
```

#### 3.2 Create New Auth Middleware
```typescript
// server/src/middleware/lucia-auth.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { lucia } from '@lib/lucia';
import type { User, Session } from 'lucia';
import { errorResponses } from '@utils/api-responses';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      session?: Session;
    }
  }
}

export async function validateRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sessionId = lucia.readSessionCookie(req.headers.cookie ?? '');
  
  if (!sessionId) {
    req.user = null;
    req.session = null;
    return next();
  }

  const { session, user } = await lucia.validateSession(sessionId);
  
  if (session && session.fresh) {
    // Session was extended, send new cookie
    const sessionCookie = lucia.createSessionCookie(session.id);
    res.setHeader('Set-Cookie', sessionCookie.serialize());
  }
  
  if (!session) {
    // Invalid session, clear cookie
    const sessionCookie = lucia.createBlankSessionCookie();
    res.setHeader('Set-Cookie', sessionCookie.serialize());
  }

  req.user = user;
  req.session = session;
  next();
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  await validateRequest(req, res, () => {
    if (!req.user) {
      return errorResponses.unauthorized(res);
    }
    next();
  });
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  await requireAuth(req, res, () => {
    if (!req.user.isAdmin) {
      return errorResponses.forbidden(res);
    }
    next();
  });
}
```

### Phase 4: Client Migration (2-3 days)

#### 4.1 Update Auth Hook
```typescript
// client/src/hooks/use-lucia-auth.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '@shared/types/user.types';
import { apiRequest } from '@/utils/api-request';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Fetch current user from session
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      try {
        const response = await apiRequest<{ user: User | null }>('/api/auth/session');
        return response.user;
      } catch {
        return null;
      }
    },
    staleTime: Infinity,
    retry: false
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiRequest<{ user: User }>('/api/auth/login', {
        method: 'POST',
        data: credentials
      });
      return response.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['auth', 'session'], user);
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'session'], null);
      queryClient.clear();
    }
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await apiRequest<{ user: User }>('/api/auth/register', {
        method: 'POST',
        data
      });
      return response.user;
    },
    onSuccess: (user) => {
      // In dev mode, user is auto-logged in
      if (import.meta.env.MODE === 'development') {
        queryClient.setQueryData(['auth', 'session'], user);
      }
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
    }
  });

  const value: AuthContextType = {
    user: user ?? null,
    isAuthenticated: !!user,
    isLoading,
    login: async (credentials) => {
      await loginMutation.mutateAsync(credentials);
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
    register: async (data) => {
      await registerMutation.mutateAsync(data);
    },
    error: error || loginMutation.error?.message || registerMutation.error?.message || null
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Phase 5: Testing & Migration (2-3 days)

#### 5.1 Create Migration Script
```typescript
// scripts/migrate-sessions.ts
import { db } from '@db';
import { lucia } from '@lib/lucia';
import { users } from '@schema';

async function migrateSessions() {
  console.log('Starting session migration...');
  
  // Get all active users
  const activeUsers = await db
    .select()
    .from(users)
    .where(eq(users.isActive, true));
  
  console.log(`Found ${activeUsers.length} active users`);
  
  // For dev mode, create sessions for test users
  if (process.env.NODE_ENV === 'development') {
    const testUsernames = ['DevUser', 'DevAdmin', 'DevMod', 'SuperAdmin'];
    
    for (const username of testUsernames) {
      const user = activeUsers.find(u => u.username === username);
      if (user) {
        const session = await lucia.createSession(user.id, {
          deviceId: 'migration'
        });
        console.log(`Created session for ${username}: ${session.id}`);
      }
    }
  }
  
  console.log('Session migration complete');
}

migrateSessions().catch(console.error);
```

## Dev Mode Strategy

### Development Authentication
```typescript
// server/src/lib/lucia/dev-auth.ts
import { lucia } from './index';
import { toUserId } from '@shared/utils/id';
import type { User } from '@shared/types/user.types';

const DEV_USER_IDS = {
  user: toUserId('550e8400-e29b-41d4-a716-446655440001'),
  moderator: toUserId('550e8400-e29b-41d4-a716-446655440003'),
  admin: toUserId('550e8400-e29b-41d4-a716-446655440004'),
  owner: toUserId('550e8400-e29b-41d4-a716-446655440006')
};

export async function createDevSession(role: keyof typeof DEV_USER_IDS) {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Dev auth only available in development');
  }
  
  const userId = DEV_USER_IDS[role];
  const session = await lucia.createSession(userId, {
    deviceId: 'dev-mode',
    userAgent: 'Development Browser'
  });
  
  return {
    session,
    sessionCookie: lucia.createSessionCookie(session.id)
  };
}
```

## Breaking Changes Summary

1. **Cookie Name**: Changes from `connect.sid` to `degentalk_session`
2. **Session Format**: New Lucia session format
3. **API Responses**: Standardized to always return `{ success: true, data: T }`
4. **Dev Mode**: New dev session system replaces mock users
5. **Middleware**: New middleware names and imports

## Rollback Strategy

1. Keep Passport code in `legacy/` directory
2. Feature flag: `ENABLE_LUCIA_AUTH`
3. Dual session validation during transition
4. Database rollback script ready
5. Monitor error rates and session failures

## Success Metrics

- [ ] All auth flows working (login, logout, register)
- [ ] Dev mode authentication simplified
- [ ] Type safety improved (no more `as any`)
- [ ] Session performance improved
- [ ] Security hardened
- [ ] API responses consistent

## Next Steps

1. Get approval for updated plan
2. Create feature branch: `feature/lucia-auth-migration`
3. Install Lucia dependencies
4. Create session table migration
5. Begin Phase 1 implementation