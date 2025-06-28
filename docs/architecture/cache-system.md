---
title: cache system
status: STABLE
updated: 2025-06-28
---

# Cache System Architecture

## Overview

The Degentalk cache system implements a Redis-first architecture with intelligent fallback to in-memory caching, designed to optimize development workflow while preventing memory leaks and ensuring consistent performance.

## Architecture Design

### Multi-Tier Cache Strategy

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Application   │───▶│   Cache Service  │───▶│   Data Source   │
│    (Thread      │    │                  │    │   (Database)    │
│    Service)     │    │  ┌─────────────┐ │    │                 │
└─────────────────┘    │  │   Redis     │ │    └─────────────────┘
                       │  │  (Primary)  │ │              ▲
                       │  └─────────────┘ │              │
                       │         │        │              │
                       │         ▼        │              │
                       │  ┌─────────────┐ │              │
                       │  │  In-Memory  │ │              │
                       │  │ (Fallback)  │ │              │
                       │  └─────────────┘ │              │
                       └──────────────────┘              │
                                │                        │
                                └────────────────────────┘
                                    (Cache Miss)
```

### Core Components

#### 1. Cache Service (`cache.service.ts`)

**Primary Interface**:
```typescript
interface CacheService {
  get(key: string): Promise<any | null>;
  set(key: string, data: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  getStats(): CacheStats;
}
```

**Implementation Strategy**:
```typescript
class RedisCacheAdapter {
  async get(key: string): Promise<any | null> {
    // 1. Try Redis first (if connected)
    if (this.connected && this.redis) {
      try {
        return await this.redis.get(key);
      } catch (error) {
        // 2. Auto-fallback to memory on Redis failure
        return this.fallback.get(key);
      }
    }
    
    // 3. Use memory cache if Redis unavailable
    return this.fallback.get(key);
  }
}
```

#### 2. Memory Cache Fallback

**Safe In-Memory Implementation**:
```typescript
class InMemoryCache {
  private cache = new Map<string, CacheEntry>();
  
  constructor() {
    // Automatic cleanup every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }
  
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}
```

## Cache Key Strategy

### Hierarchical Key Structure

**Format**: `{domain}:{entity}:{context}:{pagination}:{user}`

**Examples**:
```typescript
// Thread cache keys
"thread:trending:all:1:20:anon"        // Anonymous trending threads, page 1
"thread:recent:5:1:10:user123"         // User 123's recent threads in forum 5
"thread:following:all:2:20:user456"    // User 456's following feed, page 2

// User cache keys
"user:profile:123"                     // User 123's profile data
"user:permissions:456:admin"           // User 456's admin permissions

// Forum cache keys
"forum:structure:zone:1"               // Zone 1 structure data
"forum:stats:5:daily"                  // Forum 5 daily statistics
```

### Key Design Principles

1. **Predictable Invalidation**: Keys follow consistent patterns for bulk invalidation
2. **Collision Avoidance**: Unique namespacing prevents key conflicts
3. **Human Readable**: Keys are debuggable and self-documenting
4. **Hierarchical**: Support for wildcard clearing by domain/entity

## TTL Management

### Content-Aware TTL Strategy

```typescript
getCacheTTLForContent(contentType: string): number {
  const TTL_CONFIG = {
    // Frequently changing content
    'thread:recent':     30 * 1000,  // 30 seconds
    'chat:messages':     15 * 1000,  // 15 seconds
    'user:online':       20 * 1000,  // 20 seconds
    
    // Moderately changing content  
    'thread:trending':   60 * 1000,  // 1 minute
    'thread:following':  45 * 1000,  // 45 seconds
    'forum:stats':       90 * 1000,  // 1.5 minutes
    
    // Slowly changing content
    'user:profile':      300 * 1000, // 5 minutes
    'forum:structure':   600 * 1000, // 10 minutes
    'admin:settings':    900 * 1000, // 15 minutes
    
    // Static content
    'system:config':     3600 * 1000, // 1 hour
    'static:banners':    7200 * 1000  // 2 hours
  };
  
  return TTL_CONFIG[contentType] || 60 * 1000; // Default 1 minute
}
```

### Dynamic TTL Adjustment

**Performance-Based TTL**:
```typescript
calculateDynamicTTL(baseKey: string, queryTime: number): number {
  const baseTTL = this.getBaseTTL(baseKey);
  
  // Longer cache for slower queries
  if (queryTime > 200) return baseTTL * 3;
  if (queryTime > 100) return baseTTL * 2;
  if (queryTime > 50)  return baseTTL * 1.5;
  
  return baseTTL;
}
```

## Redis Configuration

### Development Setup

**Connection Configuration**:
```typescript
// Environment variables
REDIS_URL=redis://localhost:6379
REDIS_CONNECTION=redis://localhost:6379

// Optional: Redis configuration
REDIS_DB=0                    // Database number
REDIS_PASSWORD=               // Password (if required)
REDIS_CONNECT_TIMEOUT=10000   // Connection timeout (ms)
REDIS_COMMAND_TIMEOUT=5000    // Command timeout (ms)
```

**Redis Client Setup**:
```typescript
const redisConfig = {
  url: process.env.REDIS_URL,
  connectTimeout: 10000,
  commandTimeout: 5000,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  
  // Graceful error handling
  retryStrategy: (times: number) => {
    if (times > 3) return null; // Stop retrying after 3 attempts
    return Math.min(times * 50, 2000); // Exponential backoff, max 2s
  }
};
```

### Production Considerations

**Memory Management**:
```bash
# Redis memory configuration
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence (optional for cache)
save ""                    # Disable RDB snapshots
appendonly no             # Disable AOF persistence
```

**Performance Tuning**:
```bash
# Network optimization
tcp-keepalive 60
timeout 300

# Client connection limits
maxclients 1000
```

## Cache Integration Patterns

### Service-Level Integration

**Thread Service Example**:
```typescript
export class ThreadService {
  async fetchThreadsByTab(params: TabContentParams): Promise<ThreadResponse> {
    const cacheKey = this.buildCacheKey(params);
    
    // 1. Check cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      logger.debug('Cache hit', { key: cacheKey });
      return cached;
    }
    
    // 2. Fetch from database
    const result = await this.queryDatabase(params);
    
    // 3. Cache result with appropriate TTL
    const ttl = this.getTTLForTab(params.tab);
    await cacheService.set(cacheKey, result, ttl);
    
    logger.info('Cache miss, data cached', { key: cacheKey, ttl });
    return result;
  }
  
  private buildCacheKey(params: TabContentParams): string {
    const { tab, page = 1, limit = 20, forumId, userId } = params;
    return `thread:${tab}:${forumId ?? 'all'}:${page}:${limit}:${userId ?? 'anon'}`;
  }
}
```

### Repository Pattern Integration

**Generic Repository with Caching**:
```typescript
abstract class CachedRepository<T> {
  protected async findWithCache<K>(
    key: string,
    queryFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await cacheService.get(key);
    if (cached) return cached;
    
    const result = await queryFn();
    await cacheService.set(key, result, ttl);
    
    return result;
  }
  
  protected async invalidatePattern(pattern: string): Promise<void> {
    // Redis SCAN for pattern-based invalidation
    await cacheService.deletePattern(pattern);
  }
}
```

## Performance Monitoring

### Cache Metrics Collection

**Key Performance Indicators**:
```typescript
interface CacheMetrics {
  hitRate: number;          // Cache hit percentage
  missRate: number;         // Cache miss percentage
  avgResponseTime: number;  // Average cache response time
  memoryUsage: number;      // Current cache memory usage
  keyCount: number;         // Total cached keys
  evictionRate: number;     // Rate of cache evictions
}
```

**Metrics Collection**:
```typescript
class CacheMetricsCollector {
  private hits = 0;
  private misses = 0;
  private responseTimes: number[] = [];
  
  recordHit(responseTime: number): void {
    this.hits++;
    this.responseTimes.push(responseTime);
  }
  
  recordMiss(responseTime: number): void {
    this.misses++;
    this.responseTimes.push(responseTime);
  }
  
  getMetrics(): CacheMetrics {
    const total = this.hits + this.misses;
    return {
      hitRate: total > 0 ? (this.hits / total) * 100 : 0,
      missRate: total > 0 ? (this.misses / total) * 100 : 0,
      avgResponseTime: this.average(this.responseTimes),
      keyCount: cacheService.getKeyCount(),
      memoryUsage: cacheService.getMemoryUsage()
    };
  }
}
```

### Development Monitoring

**Real-Time Cache Status**:
```bash
# Check cache health
curl localhost:5001/api/dev/health | jq .cache

# Monitor cache performance
watch -n 5 'curl -s localhost:5001/api/dev/health | jq "{cache: .cache, memory: .performance.memory}"'
```

**Cache Performance Dashboard**:
```json
{
  "cache": {
    "type": "redis",
    "connected": true,
    "hitRate": 85.3,
    "avgResponseTime": "3ms",
    "keyCount": 247,
    "memoryUsage": "15MB",
    "fallback": {
      "type": "memory", 
      "size": 12,
      "memoryUsage": "2MB"
    }
  }
}
```

## Cache Invalidation Strategies

### Event-Driven Invalidation

**Domain Event Integration**:
```typescript
class CacheInvalidationService {
  async handleDomainEvent(event: DomainEvent): Promise<void> {
    switch (event.type) {
      case 'ThreadCreated':
        await this.invalidateThreadLists(event.data.forumId);
        break;
        
      case 'UserUpdated':
        await this.invalidateUserData(event.data.userId);
        break;
        
      case 'ForumStructureChanged':
        await this.invalidateForumData();
        break;
    }
  }
  
  private async invalidateThreadLists(forumId: number): Promise<void> {
    const patterns = [
      `thread:trending:${forumId}:*`,
      `thread:recent:${forumId}:*`,
      `thread:trending:all:*`,
      `thread:recent:all:*`
    ];
    
    for (const pattern of patterns) {
      await cacheService.deletePattern(pattern);
    }
  }
}
```

### Time-Based Invalidation

**Scheduled Cache Cleanup**:
```typescript
class CacheMaintenanceService {
  constructor() {
    // Clean expired entries every hour
    setInterval(() => this.cleanupExpired(), 60 * 60 * 1000);
    
    // Clear low-priority cache at low-traffic times
    setInterval(() => this.clearLowPriorityCache(), 6 * 60 * 60 * 1000);
  }
  
  private async cleanupExpired(): Promise<void> {
    const stats = await cacheService.getStats();
    logger.info('Cache cleanup', { 
      beforeKeyCount: stats.keyCount,
      memoryBefore: stats.memoryUsage 
    });
    
    await cacheService.cleanup();
    
    const statsAfter = await cacheService.getStats();
    logger.info('Cache cleanup complete', {
      afterKeyCount: statsAfter.keyCount,
      memoryAfter: statsAfter.memoryUsage,
      keysRemoved: stats.keyCount - statsAfter.keyCount
    });
  }
}
```

## Error Handling & Resilience

### Graceful Degradation

**Redis Connection Failure**:
```typescript
class ResilientCacheService {
  private retryCount = 0;
  private maxRetries = 3;
  private backoffDelay = 1000;
  
  async get(key: string): Promise<any | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      logger.warn('Redis get failed', { key, error: error.message });
      
      // Immediate fallback to memory cache
      return this.memoryCache.get(key);
    }
  }
  
  async set(key: string, data: any, ttl?: number): Promise<void> {
    try {
      await this.redis.setEx(key, ttl || 60, JSON.stringify(data));
    } catch (error) {
      logger.warn('Redis set failed, using memory', { key });
      
      // Fallback to memory cache
      this.memoryCache.set(key, data, ttl);
      
      // Schedule retry if Redis recovers
      this.scheduleRetry();
    }
  }
  
  private async scheduleRetry(): Promise<void> {
    if (this.retryCount < this.maxRetries) {
      setTimeout(async () => {
        try {
          await this.redis.ping();
          this.retryCount = 0; // Reset on successful connection
          logger.info('Redis connection restored');
        } catch (error) {
          this.retryCount++;
          this.scheduleRetry();
        }
      }, this.backoffDelay * Math.pow(2, this.retryCount));
    }
  }
}
```

### Circuit Breaker Pattern

**Prevent Redis Overload**:
```typescript
class CacheCircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  private readonly FAILURE_THRESHOLD = 5;
  private readonly RECOVERY_TIMEOUT = 30000; // 30 seconds
  
  async execute<T>(operation: () => Promise<T>): Promise<T | null> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.RECOVERY_TIMEOUT) {
        this.state = 'HALF_OPEN';
      } else {
        return null; // Circuit open, skip Redis
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      return null;
    }
  }
  
  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.FAILURE_THRESHOLD) {
      this.state = 'OPEN';
    }
  }
}
```

## Testing Strategy

### Cache Unit Tests

**Mock Cache Service**:
```typescript
class MockCacheService implements CacheService {
  private store = new Map<string, any>();
  
  async get(key: string): Promise<any | null> {
    return this.store.get(key) || null;
  }
  
  async set(key: string, data: any): Promise<void> {
    this.store.set(key, data);
  }
  
  getStats() {
    return {
      type: 'mock',
      size: this.store.size,
      keys: Array.from(this.store.keys())
    };
  }
}
```

### Integration Tests

**Cache Behavior Verification**:
```typescript
describe('ThreadService Cache Integration', () => {
  it('should cache thread results', async () => {
    const params = { tab: 'trending', page: 1, limit: 20 };
    
    // First call - cache miss
    const result1 = await threadService.fetchThreadsByTab(params);
    expect(result1).toBeDefined();
    
    // Second call - cache hit
    const result2 = await threadService.fetchThreadsByTab(params);
    expect(result2).toEqual(result1);
    
    // Verify cache was used
    const cacheStats = cacheService.getStats();
    expect(cacheStats.hitRate).toBeGreaterThan(0);
  });
  
  it('should handle cache failures gracefully', async () => {
    // Simulate Redis failure
    jest.spyOn(cacheService, 'get').mockRejectedValue(new Error('Redis down'));
    
    const params = { tab: 'trending', page: 1, limit: 20 };
    const result = await threadService.fetchThreadsByTab(params);
    
    // Should still return data from database
    expect(result).toBeDefined();
    expect(result.items).toBeInstanceOf(Array);
  });
});
```

---

📚 **Documentation created**: `/docs/architecture/cache-system.md`