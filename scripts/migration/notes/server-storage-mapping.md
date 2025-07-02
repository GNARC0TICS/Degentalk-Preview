# Server Storage Layer Migration Mapping

**Backend Analysis**: Server storage patterns for numeric → branded UUID migration  
**Risk Level**: HIGH - Core database operations and business logic  
**Author**: Backend Persona Analysis  
**Date**: 2025-07-02  

## Executive Summary

The server storage layer uses a repository pattern with direct numeric ID handling across three key layers:
- **Repository Layer**: Generic CRUD with `number | string` IDs
- **Service Layer**: Business logic with mixed ID types  
- **Storage Service**: File operations with minimal ID exposure

**Critical Impact**: Repository base classes and transaction handling require careful migration to maintain data integrity and performance.

## Pattern Analysis

### 1. Repository Layer Patterns

#### BaseRepository (HIGH RISK)
**File**: `server/src/core/repository/base-repository.ts`

```typescript
// CURRENT - Generic numeric ID handling
async findById(id: number | string): Promise<T | null>
async update(id: number | string, data: Partial<T>): Promise<T>
async delete(id: number | string): Promise<void>
async exists(id: number | string): Promise<boolean>

// MIGRATION TARGET
async findById(id: TId): Promise<T | null>
async update(id: TId, data: Partial<T>): Promise<T>
async delete(id: TId): Promise<void>
async exists(id: TId): Promise<boolean>
```

**Impact**: Base class needs generic type parameter `TId` to support different branded ID types per entity.

#### UserRepository (MEDIUM RISK)
**File**: `server/src/core/repository/repositories/user-repository.ts`

```typescript
// CURRENT
async updateLastLogin(id: number): Promise<void>
async incrementXP(id: number, amount: number): Promise<User>

// MIGRATION TARGET  
async updateLastLogin(id: UserId): Promise<void>
async incrementXP(id: UserId, amount: number): Promise<User>
```

#### TransactionRepository (HIGH RISK)
**File**: `server/src/core/repository/repositories/transaction-repository.ts`

```typescript
// CURRENT - Financial operations with numeric IDs
async findByUserId(userId: number, options: QueryOptions = {})
async getTotalByUser(userId: number, type?: string): Promise<number>
async getBalanceByUser(userId: number): Promise<number>
async getUserStats(userId: number): Promise<UserStats>

// MIGRATION TARGET
async findByUserId(userId: UserId, options: QueryOptions = {})
async getTotalByUser(userId: UserId, type?: string): Promise<number>
async getBalanceByUser(userId: UserId): Promise<number>
async getUserStats(userId: UserId): Promise<UserStats>
```

**Critical**: Financial operations must maintain precision - no conversion errors allowed.

### 2. Service Layer Patterns

#### XpService (MIXED STATE)
**File**: `server/src/domains/xp/xp.service.ts`

```typescript
// ALREADY MIGRATED (Good!)
async updateUserXp(userId: UserId, amount: number, ...)

// NEEDS MIGRATION - Found in other services
async processUserReward(userId: number, rewardData: any)
async updateUserLevel(userId: number, newLevel: number)
```

**Status**: Partially migrated - some methods use `UserId`, others still use `number`.

### 3. Storage Service Patterns

#### Core Storage (LOW RISK)
**File**: `server/src/core/storage.service.ts`

Storage service primarily handles file operations. User context appears in path generation:
```typescript
// File path patterns that include user IDs
relativePath: 'users/123/avatar.png'  // 123 = user ID
```

**Impact**: Minimal - file paths can remain with string representations of IDs.

## Migration Mapping Table

| Pattern | Current Type | Target Type | Risk | Validation Strategy |
|---------|-------------|-------------|------|-------------------|
| `BaseRepository.findById(id)` | `number \| string` | `TId extends BrandedId` | HIGH | Generic type constraints |
| `UserRepository.updateLastLogin(id)` | `number` | `UserId` | MEDIUM | Direct substitution |
| `UserRepository.incrementXP(id)` | `number` | `UserId` | MEDIUM | Direct substitution |
| `TransactionRepository.findByUserId(userId)` | `number` | `UserId` | HIGH | Financial integrity tests |
| `TransactionRepository.getTotalByUser(userId)` | `number` | `UserId` | HIGH | Balance verification |
| `TransactionRepository.getBalanceByUser(userId)` | `number` | `UserId` | HIGH | Audit trail validation |
| `XpService.updateUserXp(userId)` | `UserId` | `UserId` | NONE | Already migrated ✅ |
| Service layer methods (varies) | `number` | `UserId/ThreadId/PostId` | MEDIUM | Context-aware analysis |

## Edge Cases & Complex Scenarios

### 1. Composite Primary Keys

**Location**: Forum structure relationships
```typescript
// CURRENT - Multiple ID types in single operation  
async getForumPermissions(userId: number, forumId: number, structureId: number)

// MIGRATION TARGET
async getForumPermissions(userId: UserId, forumId: ForumId, structureId: StructureId)
```

**Risk**: Type confusion between different ID types in same method signature.
**Mitigation**: Explicit parameter naming and TypeScript strict mode.

### 2. Join Operations & Foreign Keys

**Location**: Repository aggregation queries
```typescript
// CURRENT - Raw SQL with numeric joins
sql`SELECT * FROM users u JOIN transactions t ON u.id = t.user_id WHERE u.id = ${userId}`

// MIGRATION CONSIDERATION
// Drizzle ORM should handle branded types transparently in joins
// But raw SQL needs careful review
```

**Risk**: Branded types in raw SQL expressions may need explicit casting.
**Mitigation**: Use Drizzle ORM query builder instead of raw SQL where possible.

### 3. Pagination & Cursor-based Operations

**Location**: BaseRepository pagination logic
```typescript
// CURRENT - Generic pagination with mixed ID types
async findPaginated(options: QueryOptions): Promise<PaginatedResult<T>>

// CHALLENGE - Cursor pagination with branded IDs
cursor: "eyJpZCI6MTIzLCJ0aW1lc3RhbXAiOjE2...}" // Contains numeric ID
```

**Risk**: Cursor encoding/decoding with branded types.
**Mitigation**: Ensure cursor serialization preserves type information.

### 4. Cache Key Generation

**Location**: Service layer caching
```typescript
// CURRENT - Numeric IDs in cache keys
const cacheKey = `user:${userId}:balance`; // userId = number

// MIGRATION CONSIDERATION  
const cacheKey = `user:${userId}:balance`; // userId = UserId (string)
```

**Risk**: Cache key collision if ID format changes.
**Mitigation**: Explicit string conversion in cache key generation.

### 5. Event System & Message Queues

**Location**: Domain events and async processing
```typescript
// CURRENT - Events with numeric IDs
interface UserXpUpdatedEvent {
  userId: number;
  oldXp: number;
  newXp: number;
}

// MIGRATION TARGET
interface UserXpUpdatedEvent {
  userId: UserId;
  oldXp: number;
  newXp: number;
}
```

**Risk**: Event serialization compatibility across service boundaries.
**Mitigation**: Version event schemas during transition period.

## Migration Strategy

### Phase 1: Repository Base Classes (Week 1)
1. **BaseRepository Generic Migration**
   - Add generic type parameter `TId`
   - Update method signatures
   - Maintain backward compatibility with `number | string`

2. **Validation Layer**
   - Repository-level type validation
   - Integration tests for ID type safety

### Phase 2: Core Repositories (Week 2)
1. **UserRepository Migration**
   - Direct `number` → `UserId` substitution
   - Update all method signatures
   - Validate user operation integrity

2. **TransactionRepository Migration** 
   - Critical financial operations
   - Extended testing for balance calculations
   - Audit trail verification

### Phase 3: Service Layer (Week 3)
1. **Service-by-Service Migration**
   - XpService (partial - complete remaining methods)
   - WalletService, ProfileService, etc.
   - Domain-specific validation

2. **Integration Testing**
   - Cross-service communication
   - Event handling compatibility

### Phase 4: Validation & Cleanup (Week 4)
1. **End-to-End Testing**
   - Full user workflows
   - Financial operation audits
   - Performance validation

2. **Documentation Updates**
   - API documentation
   - Migration notes
   - Troubleshooting guides

## Risk Mitigation

### Financial Operations Protection
- **Double-entry validation**: All financial operations must balance
- **Audit logging**: Track all ID transformations in financial context
- **Rollback capability**: Maintain data integrity checkpoints

### Performance Considerations
- **Index optimization**: Ensure database indexes work with branded types
- **Query performance**: Validate no degradation in query execution time
- **Connection pooling**: Verify branded types don't affect connection reuse

### Type Safety Validation
- **Compile-time checks**: TypeScript strict mode enforcement
- **Runtime validation**: ID format validation at service boundaries
- **Integration testing**: Cross-service type compatibility

## Success Criteria

1. **Type Safety**: Zero `any` types in repository layer
2. **Financial Integrity**: All balances validate pre/post migration  
3. **Performance**: No degradation in query response times
4. **Compatibility**: All service integrations maintain functionality
5. **Documentation**: Complete mapping and troubleshooting docs

---

**Next Steps**: Begin Phase 1 with BaseRepository generic implementation after client-side migration stabilizes.