# 🏗️ Enhanced Domain-Driven Architecture Refactor Plan

## Legend
| Symbol | Meaning | | Abbrev | Meaning |
|--------|---------|---|--------|---------|
| → | leads to | | cfg | configuration |
| ✓ | complete | | repo | repository |
| ✗ | forbidden | | svc | service |
| tx | transaction | | UC | ultra-compressed |

## Overview
Transform DegenTalk from tangled cross-domain imports → clean event-driven architecture w/ proper boundaries, repository pattern, standardized errors & zero tech debt.

## Phase 1: Core Infrastructure (Day 1) - EXPANDED

### 1.1 Event-Driven Communication System
```typescript
// server/src/core/events/types.ts
export interface DomainEvent<T = any> {
  type: string;
  payload: T;
  metadata: {
    userId?: UserId;
    timestamp: Date;
    correlationId: string;
    version?: number;
  };
}

export type EventHandler<T = any> = (event: DomainEvent<T>) => void | Promise<void>;
export type EventMiddleware = (event: DomainEvent) => void;
```

```typescript
// server/src/core/events/event-bus.ts - Enhanced w/ TX support
import { logger } from '@core/logger';
import { v4 as uuidv4 } from 'uuid';
import type { DomainEvent, EventHandler, EventMiddleware } from './types';

export class EventBus {
  private static handlers = new Map<string, Set<EventHandler>>();
  private static middleware: EventMiddleware[] = [];
  private static eventLog: DomainEvent[] = []; // Debug/audit
  private static isDebugMode = process.env.EVENT_BUS_DEBUG === 'true';
  
  static emit<T>(event: DomainEvent<T>): void {
    const enrichedEvent = this.enrichEvent(event);
    this.logEvent(enrichedEvent);
    this.runMiddleware(enrichedEvent);
    
    const handlers = this.handlers.get(enrichedEvent.type) || new Set();
    const errors: Error[] = [];
    
    // Execute all handlers, collect errors
    handlers.forEach(handler => {
      try {
        const result = handler(enrichedEvent);
        if (result instanceof Promise) {
          result.catch(error => {
            errors.push(error);
            logger.error('EVENT_BUS', `Async handler error: ${enrichedEvent.type}`, error);
          });
        }
      } catch (error) {
        errors.push(error as Error);
        logger.error('EVENT_BUS', `Sync handler error: ${enrichedEvent.type}`, error);
      }
    });
    
    // Fail-fast for now, post-launch: implement outbox pattern
    if (errors.length > 0) {
      throw new AggregateError(errors, `Event handling failed for ${enrichedEvent.type}`);
    }
  }
  
  // TX support placeholder
  static emitAfterCommit<T>(event: DomainEvent<T>, tx: Transaction): void {
    // TODO: Post-launch - implement transactional outbox
    // For now, emit immediately
    this.emit(event);
  }
  
  private static enrichEvent<T>(event: DomainEvent<T>): DomainEvent<T> {
    return {
      ...event,
      metadata: {
        ...event.metadata,
        timestamp: event.metadata?.timestamp || new Date(),
        correlationId: event.metadata?.correlationId || uuidv4(),
        version: event.metadata?.version || 1
      }
    };
  }
  
  // ... rest of implementation
}
```

### 1.2 Configuration Service
```typescript
// server/src/core/config/config.service.ts
import { z } from 'zod';
import { logger } from '@core/logger';

const ConfigSchema = z.object({
  // Database
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  
  // External Services
  CCPAYMENT_API_KEY: z.string(),
  CCPAYMENT_MERCHANT_ID: z.string(),
  CCPAYMENT_WEBHOOK_SECRET: z.string(),
  
  // App Settings
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.number().default(3001),
  
  // Limits & Rates
  XP_MULTIPLIER_CAP: z.number().default(3),
  XP_DAILY_LIMIT: z.number().default(10000),
  DGT_PRICE_USD: z.number().default(0.10),
  FORUM_POST_COOLDOWN_MS: z.number().default(30000),
  RAIN_MIN_USERS: z.number().default(3),
  RAIN_MAX_AMOUNT: z.number().default(10000),
  
  // Feature Flags
  FEATURES: z.object({
    MISSIONS: z.boolean().default(false),
    FRIENDS: z.boolean().default(false),
    ADVANCED_ANALYTICS: z.boolean().default(false),
    DAILY_BONUS: z.boolean().default(true),
    ACHIEVEMENTS: z.boolean().default(true),
  }).default({}),
  
  // Cache TTLs
  CACHE_TTL: z.object({
    USER_PROFILE: z.number().default(300), // 5 min
    FORUM_THREADS: z.number().default(60), // 1 min
    LEADERBOARD: z.number().default(600), // 10 min
    WALLET_BALANCE: z.number().default(30), // 30 sec
  }).default({})
});

type Config = z.infer<typeof ConfigSchema>;

export class ConfigService {
  private config: Config;
  private static instance: ConfigService;
  
  constructor() {
    if (ConfigService.instance) {
      return ConfigService.instance;
    }
    
    try {
      this.config = ConfigSchema.parse({
        ...process.env,
        PORT: Number(process.env.PORT),
        XP_MULTIPLIER_CAP: Number(process.env.XP_MULTIPLIER_CAP),
        XP_DAILY_LIMIT: Number(process.env.XP_DAILY_LIMIT),
        DGT_PRICE_USD: Number(process.env.DGT_PRICE_USD),
        FORUM_POST_COOLDOWN_MS: Number(process.env.FORUM_POST_COOLDOWN_MS),
        RAIN_MIN_USERS: Number(process.env.RAIN_MIN_USERS),
        RAIN_MAX_AMOUNT: Number(process.env.RAIN_MAX_AMOUNT),
        FEATURES: JSON.parse(process.env.FEATURES || '{}'),
        CACHE_TTL: JSON.parse(process.env.CACHE_TTL || '{}')
      });
      
      logger.info('CONFIG', 'Configuration loaded successfully');
    } catch (error) {
      logger.error('CONFIG', 'Invalid configuration', error);
      throw new Error('Failed to load configuration');
    }
    
    ConfigService.instance = this;
  }
  
  get<K extends keyof Config>(key: K): Config[K] {
    return this.config[key];
  }
  
  getAll(): Readonly<Config> {
    return Object.freeze({ ...this.config });
  }
  
  isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }
  
  isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }
  
  isFeatureEnabled(feature: keyof Config['FEATURES']): boolean {
    return this.config.FEATURES[feature];
  }
  
  getCacheTTL(key: keyof Config['CACHE_TTL']): number {
    return this.config.CACHE_TTL[key];
  }
}

export const config = new ConfigService();
```

### 1.3 Standardized Error Handling
```typescript
// server/src/core/errors/domain-errors.ts
export abstract class DomainError extends Error {
  abstract statusCode: number;
  abstract code: string;
  
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, DomainError.prototype);
    this.name = this.constructor.name;
  }
  
  toJSON() {
    return {
      error: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode
    };
  }
}

export class NotFoundError extends DomainError {
  statusCode = 404;
  code = 'NOT_FOUND';
  
  constructor(resource: string, id: string | number) {
    super(`${resource} with id ${id} not found`);
  }
}

export class ValidationError extends DomainError {
  statusCode = 400;
  code = 'VALIDATION_ERROR';
  
  constructor(public errors: Record<string, string[]>) {
    super('Validation failed');
  }
  
  toJSON() {
    return {
      ...super.toJSON(),
      errors: this.errors
    };
  }
}

export class ForbiddenError extends DomainError {
  statusCode = 403;
  code = 'FORBIDDEN';
  
  constructor(action: string, reason?: string) {
    super(reason || `You don't have permission to ${action}`);
  }
}

export class ConflictError extends DomainError {
  statusCode = 409;
  code = 'CONFLICT';
  
  constructor(message: string) {
    super(message);
  }
}

export class UnauthorizedError extends DomainError {
  statusCode = 401;
  code = 'UNAUTHORIZED';
  
  constructor(message = 'Authentication required') {
    super(message);
  }
}

export class RateLimitError extends DomainError {
  statusCode = 429;
  code = 'RATE_LIMIT';
  
  constructor(public retryAfter: number) {
    super(`Rate limit exceeded. Try again in ${retryAfter} seconds`);
  }
}

// server/src/core/middleware/error-handler.ts
import type { Request, Response, NextFunction } from 'express';
import { logger } from '@core/logger';
import { DomainError, ValidationError } from '@core/errors';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error details
  logger.error('REQUEST_ERROR', err.message, {
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    stack: err.stack,
    body: req.body,
    query: req.query
  });
  
  // Handle domain errors
  if (err instanceof DomainError) {
    return res.status(err.statusCode).json(err.toJSON());
  }
  
  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    const zodError = err as any;
    const errors: Record<string, string[]> = {};
    zodError.errors.forEach((e: any) => {
      const path = e.path.join('.');
      if (!errors[path]) errors[path] = [];
      errors[path].push(e.message);
    });
    
    return res.status(400).json({
      error: 'ValidationError',
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors
    });
  }
  
  // Default to 500
  res.status(500).json({
    error: 'InternalServerError',
    code: 'INTERNAL_ERROR',
    message: config.isProduction() ? 'Internal server error' : err.message
  });
}
```

### 1.4 Unified Cache Service
```typescript
// server/src/core/cache/cache.service.ts
import Redis from 'ioredis';
import { logger } from '@core/logger';
import { EventBus, DomainEvents } from '@core/events';
import { config } from '@core/config';
import type { UserId, ThreadId, ForumId } from '@shared/types/ids';

export interface CacheOptions {
  ttl?: number;
  namespace?: string;
  version?: number;
}

export class CacheService {
  private redis: Redis;
  private defaultTTL = 3600; // 1 hour
  private version = 1; // Increment to invalidate all cache
  private static instance: CacheService;
  
  constructor() {
    if (CacheService.instance) {
      return CacheService.instance;
    }
    
    this.redis = new Redis(config.get('REDIS_URL'), {
      keyPrefix: 'dt:',
      enableOfflineQueue: true,
      maxRetriesPerRequest: 3
    });
    
    this.setupEventListeners();
    CacheService.instance = this;
  }
  
  private setupEventListeners(): void {
    // Auto-invalidation patterns
    EventBus.on(DomainEvents.USER_UPDATED, async (event) => {
      await this.invalidatePattern(`user:${event.payload.userId}:*`);
    });
    
    EventBus.on(DomainEvents.THREAD_UPDATED, async (event) => {
      await this.invalidatePattern(`thread:${event.payload.threadId}:*`);
      await this.invalidatePattern(`forum:${event.payload.forumId}:threads:*`);
    });
    
    EventBus.on(DomainEvents.DGT_TRANSFERRED, async (event) => {
      await this.invalidate(this.keys.wallet(event.payload.fromUserId));
      await this.invalidate(this.keys.wallet(event.payload.toUserId));
    });
  }
  
  private buildKey(key: string, options?: CacheOptions): string {
    const parts = [];
    if (options?.namespace) parts.push(options.namespace);
    parts.push(`v${options?.version || this.version}`);
    parts.push(key);
    return parts.join(':');
  }
  
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    const fullKey = this.buildKey(key, options);
    
    try {
      const data = await this.redis.get(fullKey);
      if (!data) return null;
      
      return JSON.parse(data);
    } catch (error) {
      logger.error('CACHE', 'Get failed', { key: fullKey, error });
      return null;
    }
  }
  
  async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    const fullKey = this.buildKey(key, options);
    const ttl = options?.ttl || this.defaultTTL;
    
    try {
      await this.redis.setex(fullKey, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error('CACHE', 'Set failed', { key: fullKey, error });
    }
  }
  
  async invalidate(key: string): Promise<boolean> {
    try {
      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      logger.error('CACHE', 'Invalidate failed', { key, error });
      return false;
    }
  }
  
  async invalidatePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;
      
      const count = await this.redis.del(...keys);
      logger.info('CACHE', `Invalidated ${count} keys`, { pattern });
      return count;
    } catch (error) {
      logger.error('CACHE', 'Pattern invalidation failed', { pattern, error });
      return 0;
    }
  }
  
  // Batch operations
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await this.redis.mget(...keys);
      return values.map(v => v ? JSON.parse(v) : null);
    } catch (error) {
      logger.error('CACHE', 'Multi-get failed', { error });
      return keys.map(() => null);
    }
  }
  
  // Domain-specific key builders
  keys = {
    // User domain
    user: (userId: UserId) => `user:${userId}`,
    userProfile: (userId: UserId) => `user:${userId}:profile`,
    userStats: (userId: UserId) => `user:${userId}:stats`,
    userPermissions: (userId: UserId) => `user:${userId}:permissions`,
    
    // Thread/Forum domain
    thread: (threadId: ThreadId) => `thread:${threadId}`,
    threadPosts: (threadId: ThreadId, page: number) => `thread:${threadId}:posts:${page}`,
    forum: (forumId: ForumId) => `forum:${forumId}`,
    forumThreads: (forumId: ForumId, page: number) => `forum:${forumId}:threads:${page}`,
    
    // Wallet domain
    wallet: (userId: UserId) => `wallet:${userId}:balance`,
    walletTransactions: (userId: UserId, page: number) => `wallet:${userId}:tx:${page}`,
    
    // XP domain
    xpDaily: (userId: UserId, date: string) => `xp:${userId}:daily:${date}`,
    xpActions: (userId: UserId, action: string) => `xp:${userId}:action:${action}`,
    
    // Leaderboards
    leaderboard: (type: string, period: string) => `leaderboard:${type}:${period}`,
    
    // Rate limiting
    rateLimit: (key: string) => `ratelimit:${key}`,
  };
}

export const cacheService = new CacheService();
```

### 1.5 Centralized Authorization Service
```typescript
// server/src/core/auth/authorization.service.ts
import { EventBus, DomainEvents } from '@core/events';
import { cacheService } from '@core/cache';
import { ForbiddenError, UnauthorizedError } from '@core/errors';
import type { UserId } from '@shared/types/ids';
import type { Request, Response, NextFunction } from 'express';

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface AuthContext {
  userId: UserId;
  role: string;
  permissions?: Permission[];
}

export class AuthorizationService {
  private rolePermissions = new Map<string, Permission[]>();
  private static instance: AuthorizationService;
  
  constructor() {
    if (AuthorizationService.instance) {
      return AuthorizationService.instance;
    }
    
    this.setupDefaultPermissions();
    this.setupEventListeners();
    AuthorizationService.instance = this;
  }
  
  private setupDefaultPermissions(): void {
    // User permissions
    this.rolePermissions.set('user', [
      { resource: 'thread', action: 'create' },
      { resource: 'post', action: 'create' },
      { resource: 'post', action: 'edit:own' },
      { resource: 'wallet', action: 'view:own' },
      { resource: 'wallet', action: 'transfer' },
      { resource: 'profile', action: 'edit:own' },
      { resource: 'shop', action: 'purchase' },
    ]);
    
    // Moderator permissions (includes user)
    this.rolePermissions.set('moderator', [
      ...this.rolePermissions.get('user')!,
      { resource: 'thread', action: 'delete:any' },
      { resource: 'thread', action: 'lock:any' },
      { resource: 'post', action: 'delete:any' },
      { resource: 'post', action: 'edit:any' },
      { resource: 'user', action: 'ban' },
      { resource: 'user', action: 'warn' },
      { resource: 'reports', action: 'view:all' },
      { resource: 'reports', action: 'resolve' },
    ]);
    
    // Admin permissions (all)
    this.rolePermissions.set('admin', [
      { resource: '*', action: '*' }
    ]);
    
    // VIP permissions (user + extras)
    this.rolePermissions.set('vip', [
      ...this.rolePermissions.get('user')!,
      { resource: 'thread', action: 'create:vip' },
      { resource: 'shop', action: 'access:vip' },
    ]);
  }
  
  private setupEventListeners(): void {
    // Invalidate permission cache on role changes
    EventBus.on(DomainEvents.USER_UPDATED, async (event) => {
      if (event.payload.roleChanged) {
        await cacheService.invalidate(
          cacheService.keys.userPermissions(event.payload.userId)
        );
      }
    });
    
    EventBus.on(DomainEvents.USER_BANNED, async (event) => {
      await cacheService.invalidate(
        cacheService.keys.userPermissions(event.payload.userId)
      );
    });
  }
  
  async can(
    userId: UserId,
    resource: string,
    action: string,
    context?: Record<string, any>
  ): Promise<boolean> {
    // Check cache
    const cacheKey = `${cacheService.keys.userPermissions(userId)}:${resource}:${action}`;
    const cached = await cacheService.get<boolean>(cacheKey);
    if (cached !== null) return cached;
    
    // Get user with role
    const user = await this.getUserWithRole(userId);
    if (!user) return false;
    
    // Banned users can't do anything
    if (user.isBanned) {
      await cacheService.set(cacheKey, false, { ttl: 300 });
      return false;
    }
    
    // Check permissions
    const allowed = this.checkPermission(user.role, resource, action, {
      ...context,
      userId: user.id
    });
    
    // Cache result
    await cacheService.set(cacheKey, allowed, { 
      ttl: config.getCacheTTL('USER_PROFILE') 
    });
    
    return allowed;
  }
  
  private checkPermission(
    role: string,
    resource: string,
    action: string,
    context?: Record<string, any>
  ): boolean {
    const permissions = this.rolePermissions.get(role) || [];
    
    return permissions.some(perm => {
      // Wildcard check
      if (perm.resource === '*' && perm.action === '*') return true;
      if (perm.resource === '*' && perm.action === action) return true;
      if (perm.resource === resource && perm.action === '*') return true;
      
      // Exact match
      if (perm.resource === resource && perm.action === action) {
        // Check conditions
        if (perm.conditions && context) {
          return Object.entries(perm.conditions).every(
            ([key, value]) => context[key] === value
          );
        }
        return true;
      }
      
      // Ownership checks (edit:own, view:own, etc)
      if (perm.resource === resource && perm.action.includes(':')) {
        const [baseAction, scope] = perm.action.split(':');
        const [requestedAction] = action.split(':');
        
        if (baseAction === requestedAction) {
          if (scope === 'own' && context?.ownerId === context?.userId) {
            return true;
          }
          if (scope === 'any') {
            return true;
          }
        }
      }
      
      return false;
    });
  }
  
  // Express middleware
  requirePermission(resource: string, action: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedError();
      }
      
      const context = {
        userId,
        ownerId: req.params.userId || req.body.userId,
        targetId: req.params.id,
        ...req.permissionContext
      };
      
      const allowed = await this.can(userId, resource, action, context);
      
      if (!allowed) {
        logger.warn('AUTHORIZATION', 'Permission denied', {
          userId,
          resource,
          action,
          context
        });
        throw new ForbiddenError(`${action} ${resource}`);
      }
      
      next();
    };
  }
  
  // Helper middleware for ownership
  requireOwnership(paramName = 'id') {
    return (req: Request, res: Response, next: NextFunction) => {
      req.permissionContext = {
        ...req.permissionContext,
        ownerId: req.params[paramName] || req.body[paramName]
      };
      next();
    };
  }
  
  // Role check middleware
  requireRole(...roles: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const user = req.user;
      if (!user) {
        throw new UnauthorizedError();
      }
      
      if (!roles.includes(user.role)) {
        throw new ForbiddenError('access this resource', 'Insufficient role');
      }
      
      next();
    };
  }
  
  private async getUserWithRole(userId: UserId) {
    // This would be injected or imported from user domain
    // For now, simplified version
    const user = await db.select({
      id: users.id,
      role: users.role,
      isBanned: users.isBanned
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
    
    return user[0];
  }
}

export const auth = new AuthorizationService();
```

## Phase 2: Domain Boundaries w/ Repository Pattern (Day 2)

### 2.1 Base Repository Pattern
```typescript
// server/src/core/repository/base.repository.ts
import { db } from '@db';
import type { Transaction } from '@db/types';
import { logger } from '@core/logger';

export interface QueryOptions {
  tx?: Transaction;
  limit?: number;
  offset?: number;
  orderBy?: any;
}

export abstract class BaseRepository<T> {
  protected abstract tableName: string;
  
  protected get db() {
    return db;
  }
  
  protected get table() {
    return (db as any)[this.tableName];
  }
  
  protected async executeQuery<R>(
    queryFn: (db: typeof db | Transaction) => Promise<R>,
    options?: QueryOptions
  ): Promise<R> {
    const startTime = Date.now();
    try {
      const result = await queryFn(options?.tx || db);
      const duration = Date.now() - startTime;
      
      if (duration > 1000) {
        logger.warn('REPOSITORY', 'Slow query detected', {
          table: this.tableName,
          duration,
          options
        });
      }
      
      return result;
    } catch (error) {
      logger.error('REPOSITORY', 'Query failed', {
        table: this.tableName,
        error,
        options
      });
      throw error;
    }
  }
  
  // Common operations
  async findById(id: string | number, options?: QueryOptions): Promise<T | null> {
    const result = await this.executeQuery(
      async (db) => db
        .select()
        .from(this.table)
        .where(eq(this.table.id, id))
        .limit(1),
      options
    );
    
    return result[0] || null;
  }
  
  async exists(id: string | number, options?: QueryOptions): Promise<boolean> {
    const result = await this.executeQuery(
      async (db) => db
        .select({ count: sql<number>`count(*)` })
        .from(this.table)
        .where(eq(this.table.id, id)),
      options
    );
    
    return result[0].count > 0;
  }
  
  async create(data: Partial<T>, options?: QueryOptions): Promise<T> {
    const result = await this.executeQuery(
      async (db) => db
        .insert(this.table)
        .values(data)
        .returning(),
      options
    );
    
    return result[0];
  }
  
  async update(
    id: string | number,
    data: Partial<T>,
    options?: QueryOptions
  ): Promise<T | null> {
    const result = await this.executeQuery(
      async (db) => db
        .update(this.table)
        .set(data)
        .where(eq(this.table.id, id))
        .returning(),
      options
    );
    
    return result[0] || null;
  }
  
  async delete(id: string | number, options?: QueryOptions): Promise<boolean> {
    const result = await this.executeQuery(
      async (db) => db
        .delete(this.table)
        .where(eq(this.table.id, id))
        .returning({ id: this.table.id }),
      options
    );
    
    return result.length > 0;
  }
}
```

### 2.2 Domain Structure Template
```typescript
// Standard structure for EVERY domain
server/src/domains/[domain-name]/
├── index.ts                    // Public API exports ONLY
├── types.ts                    // Domain-specific types  
├── events.ts                   // Domain event definitions
├── [domain].service.ts         // Business logic (NO db calls)
├── [domain].repository.ts      // Data access (ALL db calls)
├── [domain].controller.ts      // HTTP endpoints
├── [domain].validator.ts       // Zod schemas
├── [domain].transformer.ts     // DTOs & response shaping
├── handlers/                   // Event handlers
│   └── index.ts
├── admin/                      // Admin-specific features
│   ├── [domain].admin.controller.ts
│   └── [domain].admin.service.ts
└── __tests__/                  // Domain tests
    ├── [domain].service.test.ts
    ├── [domain].repository.test.ts
    └── [domain].integration.test.ts
```

### 2.3 Example Domain Implementation
```typescript
// server/src/domains/wallet/types.ts
import type { UserId } from '@shared/types/ids';

export interface WalletBalance {
  userId: UserId;
  dgtBalance: number;
  lockedBalance: number;
  lastUpdated: Date;
}

export interface Transaction {
  id: string;
  fromUserId: UserId;
  toUserId: UserId;
  amount: number;
  type: 'transfer' | 'tip' | 'rain' | 'purchase' | 'deposit';
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface TransferRequest {
  fromUserId: UserId;
  toUserId: UserId;
  amount: number;
  type: 'transfer' | 'tip';
  metadata?: Record<string, any>;
}

export interface TransferResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

// server/src/domains/wallet/wallet.repository.ts
import { BaseRepository } from '@core/repository/base.repository';
import { wallets, transactions, users } from '@schema';
import { eq, and, gte, sql, desc } from 'drizzle-orm';
import type { UserId } from '@shared/types/ids';
import type { WalletBalance, Transaction, TransferRequest } from './types';
import { ConflictError, NotFoundError } from '@core/errors';

export class WalletRepository extends BaseRepository<WalletBalance> {
  protected tableName = 'wallets';
  
  async getBalance(userId: UserId, options?: QueryOptions): Promise<WalletBalance> {
    const result = await this.executeQuery(
      async (db) => db
        .select({
          userId: wallets.userId,
          dgtBalance: wallets.dgtBalance,
          lockedBalance: wallets.lockedBalance,
          lastUpdated: wallets.updatedAt
        })
        .from(wallets)
        .where(eq(wallets.userId, userId))
        .limit(1),
      options
    );
    
    if (!result[0]) {
      throw new NotFoundError('Wallet', userId);
    }
    
    return result[0];
  }
  
  async executeTransfer(
    request: TransferRequest,
    options?: QueryOptions
  ): Promise<Transaction> {
    // This MUST be called within a transaction from the service
    const tx = options?.tx;
    if (!tx) {
      throw new Error('Transfer must be executed within a transaction');
    }
    
    // Check sender balance
    const senderWallet = await this.getBalance(request.fromUserId, { tx });
    if (senderWallet.dgtBalance < request.amount) {
      throw new ConflictError('Insufficient balance');
    }
    
    // Update balances
    await tx
      .update(wallets)
      .set({
        dgtBalance: sql`${wallets.dgtBalance} - ${request.amount}`,
        updatedAt: new Date()
      })
      .where(eq(wallets.userId, request.fromUserId));
    
    await tx
      .update(wallets)
      .set({
        dgtBalance: sql`${wallets.dgtBalance} + ${request.amount}`,
        updatedAt: new Date()
      })
      .where(eq(wallets.userId, request.toUserId));
    
    // Create transaction record
    const [transaction] = await tx
      .insert(transactions)
      .values({
        fromUserId: request.fromUserId,
        toUserId: request.toUserId,
        amount: request.amount,
        type: request.type,
        status: 'completed',
        metadata: request.metadata
      })
      .returning();
    
    return transaction;
  }
  
  async getTransactionHistory(
    userId: UserId,
    limit = 50,
    offset = 0,
    options?: QueryOptions
  ): Promise<Transaction[]> {
    return this.executeQuery(
      async (db) => db
        .select()
        .from(transactions)
        .where(
          or(
            eq(transactions.fromUserId, userId),
            eq(transactions.toUserId, userId)
          )
        )
        .orderBy(desc(transactions.createdAt))
        .limit(limit)
        .offset(offset),
      options
    );
  }
  
  async createWallet(userId: UserId, options?: QueryOptions): Promise<WalletBalance> {
    const [wallet] = await this.executeQuery(
      async (db) => db
        .insert(wallets)
        .values({
          userId,
          dgtBalance: 0,
          lockedBalance: 0
        })
        .returning({
          userId: wallets.userId,
          dgtBalance: wallets.dgtBalance,
          lockedBalance: wallets.lockedBalance,
          lastUpdated: wallets.updatedAt
        }),
      options
    );
    
    return wallet;
  }
}

// server/src/domains/wallet/wallet.service.ts
import { db } from '@db';
import { WalletRepository } from './wallet.repository';
import { EventBus } from '@core/events';
import { cacheService } from '@core/cache';
import { logger } from '@core/logger';
import { config } from '@core/config';
import { WalletEvents } from './events';
import type { TransferRequest, TransferResult } from './types';
import { ConflictError, ValidationError } from '@core/errors';

export class WalletService {
  constructor(private repository: WalletRepository) {}
  
  async transfer(request: TransferRequest): Promise<TransferResult> {
    logger.info('WALLET', 'Processing transfer', {
      from: request.fromUserId,
      to: request.toUserId,
      amount: request.amount,
      type: request.type
    });
    
    // Validate request
    if (request.amount <= 0) {
      throw new ValidationError({ amount: ['Amount must be positive'] });
    }
    
    if (request.amount > config.get('RAIN_MAX_AMOUNT')) {
      throw new ValidationError({ 
        amount: [`Amount exceeds maximum of ${config.get('RAIN_MAX_AMOUNT')} DGT`] 
      });
    }
    
    if (request.fromUserId === request.toUserId) {
      throw new ValidationError({ 
        toUserId: ['Cannot transfer to yourself'] 
      });
    }
    
    try {
      // Execute in transaction
      const transaction = await db.transaction(async (tx) => {
        return this.repository.executeTransfer(request, { tx });
      });
      
      // Emit success event
      EventBus.emit({
        type: WalletEvents.DGT_TRANSFERRED,
        payload: {
          transactionId: transaction.id,
          fromUserId: request.fromUserId,
          toUserId: request.toUserId,
          amount: request.amount,
          type: request.type
        },
        metadata: {
          userId: request.fromUserId,
          timestamp: new Date(),
          correlationId: crypto.randomUUID()
        }
      });
      
      // Invalidate caches
      await Promise.all([
        cacheService.invalidate(cacheService.keys.wallet(request.fromUserId)),
        cacheService.invalidate(cacheService.keys.wallet(request.toUserId))
      ]);
      
      return {
        success: true,
        transactionId: transaction.id
      };
      
    } catch (error) {
      logger.error('WALLET', 'Transfer failed', { error, request });
      
      if (error instanceof DomainError) {
        throw error;
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async getBalance(userId: UserId): Promise<WalletBalance> {
    // Check cache
    const cached = await cacheService.get<WalletBalance>(
      cacheService.keys.wallet(userId)
    );
    if (cached) return cached;
    
    // Get from repository
    const balance = await this.repository.getBalance(userId);
    
    // Cache result
    await cacheService.set(
      cacheService.keys.wallet(userId),
      balance,
      { ttl: config.getCacheTTL('WALLET_BALANCE') }
    );
    
    return balance;
  }
  
  async awardBonus(
    userId: UserId,
    amount: number,
    reason: { reason: string; [key: string]: any }
  ): Promise<void> {
    await db.transaction(async (tx) => {
      // Create system transfer
      await this.repository.executeTransfer({
        fromUserId: SYSTEM_USER_ID,
        toUserId: userId,
        amount,
        type: 'deposit',
        metadata: reason
      }, { tx });
    });
    
    EventBus.emit({
      type: WalletEvents.BONUS_AWARDED,
      payload: { userId, amount, reason: reason.reason },
      metadata: { userId, timestamp: new Date(), correlationId: crypto.randomUUID() }
    });
  }
}

// server/src/domains/wallet/index.ts
// ONLY THESE EXPORTS - Other domains import ONLY from here
export { walletService } from './wallet.service';
export { WalletEvents } from './events';
export type { 
  WalletBalance, 
  Transaction, 
  TransferRequest,
  TransferResult 
} from './types';
```

## Phase 3: Service Consolidation (Day 3)

### 3.1 Analytics Consolidation
```typescript
// server/src/domains/analytics/analytics.service.ts
import { AnalyticsRepository } from './analytics.repository';
import { EventBus } from '@core/events';
import { cacheService } from '@core/cache';
import { config } from '@core/config';
import type { UserId } from '@shared/types/ids';

export interface AnalyticsEvent {
  namespace: 'platform' | 'user' | 'forum' | 'wallet' | 'game';
  action: string;
  userId?: UserId;
  metadata?: Record<string, any>;
}

export interface MetricQuery {
  namespace: AnalyticsEvent['namespace'];
  metric: string;
  period: 'hour' | 'day' | 'week' | 'month';
  groupBy?: string[];
}

export class UnifiedAnalyticsService {
  constructor(private repository: AnalyticsRepository) {
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    // Auto-track all domain events
    EventBus.use((event) => {
      const [namespace, action] = event.type.split('.');
      this.trackEvent({
        namespace: this.mapNamespace(namespace),
        action,
        userId: event.metadata.userId,
        metadata: {
          ...event.payload,
          correlationId: event.metadata.correlationId
        }
      });
    });
  }
  
  private mapNamespace(domain: string): AnalyticsEvent['namespace'] {
    const mapping: Record<string, AnalyticsEvent['namespace']> = {
      user: 'user',
      wallet: 'wallet',
      forum: 'forum',
      thread: 'forum',
      post: 'forum',
      xp: 'game',
      achievement: 'game',
      shop: 'game'
    };
    
    return mapping[domain] || 'platform';
  }
  
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    // Store raw event
    await this.repository.createEvent({
      ...event,
      timestamp: new Date(),
      sessionId: event.metadata?.sessionId || 'anonymous'
    });
    
    // Update real-time metrics
    await this.updateRealtimeMetrics(event);
  }
  
  async getMetrics(query: MetricQuery): Promise<any> {
    const cacheKey = `analytics:${query.namespace}:${query.metric}:${query.period}`;
    
    // Check cache
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;
    
    // Calculate metrics
    const data = await this.repository.calculateMetrics(query);
    
    // Cache with appropriate TTL
    const ttl = this.getTTLForPeriod(query.period);
    await cacheService.set(cacheKey, data, { ttl });
    
    return data;
  }
  
  private getTTLForPeriod(period: string): number {
    const ttls = {
      hour: 60,      // 1 minute
      day: 300,      // 5 minutes
      week: 900,     // 15 minutes
      month: 3600    // 1 hour
    };
    
    return ttls[period] || 300;
  }
  
  private async updateRealtimeMetrics(event: AnalyticsEvent): Promise<void> {
    // Update counters in Redis for real-time dashboards
    const key = `metrics:realtime:${event.namespace}:${event.action}`;
    await cacheService.redis.incr(key);
    await cacheService.redis.expire(key, 3600); // 1 hour window
  }
}

// Migration Notes:
// 1. Merge /domains/analytics/analytics.service.ts
// 2. Merge /domains/admin/sub-domains/analytics/*
// 3. Merge /domains/gamification/services/analytics.service.ts
// 4. Create unified repository for all analytics data
// 5. Standardize event tracking across all domains
```

### 3.2 Reports Consolidation
```typescript
// server/src/domains/reports/reports.service.ts
import { ReportsRepository } from './reports.repository';
import { EventBus } from '@core/events';
import { NotFoundError, ForbiddenError } from '@core/errors';
import type { UserId, ReportId } from '@shared/types/ids';

export interface CreateReportParams {
  reporterId: UserId;
  targetType: 'user' | 'post' | 'thread' | 'message';
  targetId: string;
  reason: string;
  details?: string;
}

export class UnifiedReportsService {
  constructor(private repository: ReportsRepository) {}
  
  async createReport(params: CreateReportParams): Promise<Report> {
    // Check if already reported by this user
    const existing = await this.repository.findExistingReport(
      params.reporterId,
      params.targetType,
      params.targetId
    );
    
    if (existing) {
      throw new ConflictError('You have already reported this content');
    }
    
    // Create report
    const report = await this.repository.create(params);
    
    // Emit event for moderation queue
    EventBus.emit({
      type: 'reports.created',
      payload: {
        reportId: report.id,
        ...params
      },
      metadata: {
        userId: params.reporterId,
        timestamp: new Date(),
        correlationId: crypto.randomUUID()
      }
    });
    
    return report;
  }
  
  // Service doesn't care about roles - controller handles that
  async getReports(filters: ReportFilters): Promise<PaginatedResult<Report>> {
    return this.repository.findWithFilters(filters);
  }
  
  async resolveReport(
    reportId: ReportId,
    resolution: 'resolved' | 'dismissed',
    moderatorId: UserId,
    notes?: string
  ): Promise<Report> {
    const report = await this.repository.findById(reportId);
    if (!report) {
      throw new NotFoundError('Report', reportId);
    }
    
    if (report.status !== 'pending') {
      throw new ConflictError(`Report is already ${report.status}`);
    }
    
    const updated = await this.repository.updateStatus(
      reportId,
      resolution,
      moderatorId,
      notes
    );
    
    EventBus.emit({
      type: 'reports.resolved',
      payload: {
        reportId,
        resolution,
        moderatorId
      },
      metadata: {
        userId: moderatorId,
        timestamp: new Date(),
        correlationId: crypto.randomUUID()
      }
    });
    
    return updated;
  }
}

// Migration Notes:
// 1. Merge /domains/forum/sub-domains/reports/*
// 2. Merge /domains/admin/sub-domains/reports/*
// 3. Single service, role-based access in controllers
// 4. Unified report types and statuses
```

## Phase 4: Type Consolidation & Dead Code (Day 4)

### 4.1 Shared Entity Types
```typescript
// shared/types/entities/index.ts
export * from './user';
export * from './thread';
export * from './post';
export * from './wallet';
export * from './forum';

// shared/types/entities/user.ts
import type { UserId } from '../ids';

export interface User {
  id: UserId;
  username: string;
  email: string;
  role: 'user' | 'moderator' | 'admin' | 'vip';
  level: number;
  xp: number;
  clout: number;
  isVerified: boolean;
  isBanned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// shared/types/entities/thread.ts
import type { ThreadId, UserId, ForumId } from '../ids';

export interface Thread {
  id: ThreadId;
  title: string;
  content: string;
  userId: UserId;
  forumId: ForumId;
  isPinned: boolean;
  isLocked: boolean;
  isDeleted: boolean;
  viewCount: number;
  replyCount: number;
  lastReplyAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.2 Mission Removal Checklist
```bash
# Phase 4: Complete Mission System Removal

## Files to Delete:
- [ ] server/src/domains/missions/**
- [ ] client/src/features/missions/**
- [ ] shared/types/missions.types.ts
- [ ] shared/validation/missions.schema.ts

## Code to Remove:
- [ ] XP service: Remove mission-related XP awards
- [ ] User service: Remove mission progress tracking
- [ ] Forum service: Remove mission completion checks
- [ ] WebSocket: Remove mission update events

## Database Cleanup:
- [ ] Create migration to drop missions tables
- [ ] Remove mission_id from xp_logs
- [ ] Remove mission fields from users table

## Config Cleanup:
- [ ] Remove FEATURES.MISSIONS flag
- [ ] Remove mission-related env vars
- [ ] Update CLAUDE.md to note missions deprecated
```

## Phase 5: Migration Scripts (Day 5-6)

### 5.1 Domain Migration Script
```bash
#!/bin/bash
# scripts/migrate-domain.sh

DOMAIN=$1

echo "🚀 Migrating domain: $DOMAIN"

# Step 1: Create new structure
mkdir -p "server/src/domains/$DOMAIN/handlers"
mkdir -p "server/src/domains/$DOMAIN/admin"
mkdir -p "server/src/domains/$DOMAIN/__tests__"

# Step 2: Create repository if doesn't exist
if [ ! -f "server/src/domains/$DOMAIN/$DOMAIN.repository.ts" ]; then
  echo "Creating repository file..."
  cat > "server/src/domains/$DOMAIN/$DOMAIN.repository.ts" << EOF
import { BaseRepository } from '@core/repository/base.repository';
import { ${DOMAIN} } from '@schema';

export class ${DOMAIN^}Repository extends BaseRepository<${DOMAIN^}> {
  protected tableName = '${DOMAIN}';
  
  // Add domain-specific queries here
}

export const ${DOMAIN}Repository = new ${DOMAIN^}Repository();
EOF
fi

# Step 3: Update service to use repository
echo "✅ Repository created"
echo "⚠️  Manual steps required:"
echo "1. Move all DB queries from service to repository"
echo "2. Update service to use repository methods"
echo "3. Add proper error handling"
echo "4. Create event handlers"
echo "5. Update index.ts exports"
```

### 5.2 ESLint Rules
```javascript
// eslint-plugins/degen/rules/enforce-domain-boundaries.js
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce domain boundaries - no cross-domain imports',
      category: 'Architecture',
      recommended: true
    },
    fixable: null,
    schema: []
  },
  
  create(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        const currentFile = context.getFilename();
        
        // Check if importing from another domain
        const currentDomain = currentFile.match(/domains\/([^/]+)/)?.[1];
        const importDomain = importPath.match(/\.\.\/([^/]+)/)?.[1];
        
        if (currentDomain && importDomain && currentDomain !== importDomain) {
          // Allow only index.ts imports
          if (!importPath.endsWith('/index') && !importPath.endsWith('index')) {
            context.report({
              node,
              message: `Cross-domain imports forbidden. Import from '../${importDomain}/index' instead.`
            });
          }
        }
        
        // Prevent direct repository/service imports
        if (importPath.match(/\/(repository|service)$/)) {
          context.report({
            node,
            message: 'Import from domain index.ts only, not from internal files.'
          });
        }
      }
    };
  }
};
```

## Phase 6: Testing & Monitoring (Day 7)

### 6.1 Domain Isolation Tests
```typescript
// server/src/__tests__/architecture/domain-isolation.test.ts
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('Domain Architecture Compliance', () => {
  const domainsDir = path.join(__dirname, '../../domains');
  const domains = fs.readdirSync(domainsDir);
  
  describe('Domain Boundaries', () => {
    it('should not have cross-domain service imports', () => {
      const violations = execSync(
        `grep -r "from.*domains/.*/services" ${domainsDir} | grep -v "index.ts" | wc -l`
      ).toString().trim();
      
      expect(parseInt(violations)).toBe(0);
    });
    
    it('should only import from domain index files', () => {
      domains.forEach(domain => {
        const domainPath = path.join(domainsDir, domain);
        const files = execSync(`find ${domainPath} -name "*.ts"`).toString().split('\n');
        
        files.forEach(file => {
          if (!file || file.includes('index.ts')) return;
          
          const content = fs.readFileSync(file, 'utf8');
          const crossDomainImports = content.match(/from ['"]\.\.\/[^/]+\/(?!index)/g);
          
          expect(crossDomainImports).toBeNull();
        });
      });
    });
  });
  
  describe('Repository Pattern', () => {
    it('services should not contain direct DB calls', () => {
      const serviceFiles = execSync(
        `find ${domainsDir} -name "*.service.ts"`
      ).toString().split('\n').filter(Boolean);
      
      serviceFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for direct DB usage
        expect(content).not.toMatch(/from ['"]@db['"]/);
        expect(content).not.toMatch(/\bdb\./);
        expect(content).not.toMatch(/from ['"]@schema['"]/);
      });
    });
    
    it('repositories should extend BaseRepository', () => {
      const repoFiles = execSync(
        `find ${domainsDir} -name "*.repository.ts"`
      ).toString().split('\n').filter(Boolean);
      
      repoFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        expect(content).toMatch(/extends BaseRepository/);
      });
    });
  });
  
  describe('Event-Driven Communication', () => {
    it('domains should use EventBus for cross-domain communication', () => {
      const handlerDirs = execSync(
        `find ${domainsDir} -type d -name "handlers"`
      ).toString().split('\n').filter(Boolean);
      
      expect(handlerDirs.length).toBeGreaterThan(0);
      
      handlerDirs.forEach(dir => {
        const hasHandlers = fs.existsSync(path.join(dir, 'index.ts'));
        expect(hasHandlers).toBe(true);
      });
    });
  });
});
```

### 6.2 Performance Monitoring
```typescript
// server/src/core/monitoring/performance.ts
import { EventBus } from '@core/events';
import { logger } from '@core/logger';

// Monitor event processing time
EventBus.use((event) => {
  const start = Date.now();
  
  process.nextTick(() => {
    const duration = Date.now() - start;
    if (duration > 100) {
      logger.warn('PERFORMANCE', 'Slow event processing', {
        event: event.type,
        duration,
        correlationId: event.metadata.correlationId
      });
    }
  });
});

// Monitor cache hit rates
let cacheHits = 0;
let cacheMisses = 0;

setInterval(() => {
  const hitRate = cacheHits / (cacheHits + cacheMisses) || 0;
  logger.info('CACHE_METRICS', 'Cache performance', {
    hits: cacheHits,
    misses: cacheMisses,
    hitRate: (hitRate * 100).toFixed(2) + '%'
  });
  
  // Reset counters
  cacheHits = 0;
  cacheMisses = 0;
}, 60000); // Every minute
```

## 🎯 Success Metrics

1. **Zero cross-domain imports** (except index.ts) ✓
2. **All domains use EventBus** for communication ✓
3. **Repository pattern** implemented everywhere ✓
4. **Single cache service** with <10ms latency ✓
5. **Unified analytics** with consistent metrics ✓
6. **Standard error handling** across all domains ✓
7. **Mission system** completely removed ✓
8. **50% reduction** in duplicate code ✓
9. **All tests passing** including architecture tests ✓
10. **Zero tech debt** in new architecture ✓

## 📋 Updated Execution Order

**Day 1**: Core infra (EventBus, Cache, Auth, Config, Errors) ✓
**Day 2**: Domain boundaries + Repository pattern ✓
**Day 3**: Service consolidation + Mission removal ✓
**Day 4**: Type consolidation + DB migration planning ✓
**Day 5**: High-traffic migration (Forum, XP, Wallet) w/ repos
**Day 6**: Remaining domains + Execute DB migrations
**Day 7**: Testing, monitoring + Production deployment

## 🚀 Post-Launch Improvements

1. **Transactional Outbox Pattern** for guaranteed event delivery
2. **Async Event Queue** (BullMQ) for better resilience
3. **GraphQL Federation** for unified API
4. **Microservice Extraction** preparation
5. **Distributed Tracing** with OpenTelemetry

---

This refactor transforms DegenTalk into a production-ready, scalable platform with ZERO tech debt! 🎯