# Cache Service Migration Guide

This guide helps transition from multiple cache implementations to the unified cache service.

## Overview

The unified cache service consolidates functionality from:
1. Core Redis service (`/core/cache/redis.service.ts`)
2. Admin cache service (`/domains/admin/shared/admin-cache.service.ts`)
3. Forum cache service (`/domains/forum/services/cache.service.ts`)
4. Shoutbox cache service (`/domains/shoutbox/services/cache.service.ts`)

## Migration Steps

### 1. Import Changes

Replace existing imports:

```typescript
// OLD - Redis service
import { redisCacheService, Cache, CacheMinute } from '@core/cache/redis.service';

// OLD - Admin cache
import { adminCacheService, CacheResult } from '@domains/admin/shared/admin-cache.service';

// OLD - Forum cache
import { cacheService as forumCache } from '@domains/forum/services/cache.service';

// OLD - Shoutbox cache
import { shoutboxCacheService } from '@domains/shoutbox/services/cache.service';

// NEW - Unified cache
import { cacheService, Cache, CacheMinute, CacheCategory } from '@core/cache/unified-cache.service';
```

### 2. Category-Based Caching

Use appropriate categories for your domain:

```typescript
// Admin operations
await cacheService.set('key', value, { category: CacheCategory.ADMIN });

// Forum operations
await cacheService.set('key', value, { category: CacheCategory.FORUM });

// Shoutbox operations
await cacheService.set('key', value, { category: CacheCategory.SHOUTBOX });

// Analytics
await cacheService.set('key', value, { category: CacheCategory.ANALYTICS });
```

### 3. Decorator Migration

```typescript
// OLD - Admin cache
@CacheResult({ category: 'SETTINGS', ttl: 3600 })
async getSettings() { }

// NEW - Unified cache
@Cache({ category: CacheCategory.SETTINGS, ttl: 3600 })
async getSettings() { }

// Or use category-specific decorators
@CacheAdmin()
async getAdminData() { }
```

### 4. API Compatibility

The unified service maintains API compatibility:

```typescript
// These work the same
await cacheService.get(key);
await cacheService.set(key, value);
await cacheService.delete(key);
await cacheService.clear();
```

### 5. Pattern-Based Operations

```typescript
// Delete all forum-related cache
await cacheService.deletePattern('*', CacheCategory.FORUM);

// Delete specific pattern
await cacheService.deletePattern('user:123:*');
```

### 6. Metrics and Health

```typescript
// Get comprehensive metrics
const metrics = cacheService.getMetrics();

// Check cache health
const health = cacheService.getHealth();
```

## Domain-Specific Migration

### Admin Domain

1. Replace `adminCacheService` with `cacheService`
2. Map admin categories to `CacheCategory` enum:
   - SETTINGS → CacheCategory.SETTINGS
   - USER_GROUPS → CacheCategory.USER
   - ANALYTICS → CacheCategory.ANALYTICS
   - USER_SEARCH → CacheCategory.USER
   - FORUM_CONFIG → CacheCategory.FORUM
   - AUDIT_SUMMARY → CacheCategory.ADMIN

### Forum Domain

1. Replace forum cache service with unified service
2. Use `CacheCategory.FORUM` for all forum operations
3. Default TTL remains 30 minutes

### Shoutbox Domain

1. Replace shoutbox cache with unified service
2. Use appropriate categories:
   - Messages → CacheCategory.SHOUTBOX
   - User sessions → CacheCategory.SESSION
   - Rate limiting → CacheCategory.RATE_LIMIT
   - Typing indicators → CacheCategory.REALTIME

## Benefits

1. **Unified API**: Single service for all caching needs
2. **Better Metrics**: Comprehensive metrics across all domains
3. **Fallback Strategy**: Automatic Redis → Memory fallback
4. **Category Isolation**: Domain-specific cache management
5. **Health Monitoring**: Built-in health checks
6. **Pattern Invalidation**: Efficient cache clearing

## Gradual Migration

You can migrate gradually:

1. Start with low-traffic services
2. Monitor metrics and health
3. Migrate critical services once stable
4. Remove old cache services after full migration