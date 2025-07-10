# Server Service Migration Analysis

## Executive Summary

**Status**: 220 issues across 95+ server files requiring coordinated migration
**Priority**: HIGH - Server migration must be done in waves to maintain API contracts
**Risk Level**: Medium-High due to financial transaction boundaries and cross-service dependencies

## Service Dependency Analysis

### Core Service Interaction Patterns

1. **XP Service Dependencies** (Line 431: `userId: number → UserId`)
   - **Cross-Domain Calls**: `missions.service`, `wallet.service`, `forum.service`
   - **Transaction Boundaries**: XP adjustments tied to financial rewards
   - **API Impact**: Admin XP adjustment endpoints, mission completion rewards

2. **Subscription Service** (Line 29: `id: number`)
   - **Financial Integration**: Tight coupling with `dgt.service` for payments
   - **Transaction Critical**: All subscription operations are transactional
   - **User Dependencies**: Cross-references user balances and wallet operations

3. **Shoutbox Routes** (Lines 36, 203, 266)
   - **API Breaking Changes**: `parseInt(req.params.id)` patterns in message operations
   - **Real-time Dependencies**: WebSocket message broadcasting with numeric IDs
   - **Access Control**: Room access checks using user/group ID comparisons

### High-Impact Service Files

| Service | Issues | Risk Level | Migration Priority |
|---------|--------|------------|-------------------|
| `repository/interfaces.ts` | 19 | Critical | Wave 1 - Foundation |
| `shoutbox/cache.service.ts` | 14 | High | Wave 3 - Performance |
| `admin/forum/forum.service.ts` | 9 | Medium | Wave 2 - Business Logic |
| `preferences.service.ts` | 7 | Medium | Wave 2 - User Data |
| `missions.service.ts` | 6 | High | Wave 2 - Gamification |

## API Contract Impact Assessment

### Breaking Changes Required

1. **Route Parameters** (5 instances in shoutbox.routes.ts)
   ```typescript
   // Current: parseInt(req.params.id) 
   // Target: req.params.id as MessageId (with validation)
   ```

2. **Service Method Signatures**
   ```typescript
   // XP Service
   updateActionLimits(userId: UserId, action: XP_ACTION)
   
   // Profile Service  
   getUserProfile(userId: UserId)
   
   // Repository Interfaces
   findById(id: EntityId), update(id: EntityId, data)
   ```

3. **Cross-Service Calls**
   - XP ↔ Missions: Mission completion XP rewards
   - Subscriptions ↔ Wallet: Payment processing
   - Profile ↔ Forum: User statistics aggregation

### Financial Transaction Boundaries

**Critical Constraint**: Services with financial operations must migrate atomically

1. **Subscription Service + DGT Service**
   - Payment processing workflows
   - Refund/cancellation operations
   - Monthly billing automation

2. **XP Service + Wallet Service**
   - XP-to-DGT conversion rewards
   - Mission completion bonuses
   - Tip-based XP multipliers

3. **Shop Service + Inventory Service**
   - Purchase transactions
   - Item ownership transfers
   - Cosmetic drop distributions

## Migration Wave Strategy

### Wave 1: Foundation Layer (Week 1)
**Goal**: Establish type-safe foundation without breaking APIs

```typescript
// Files to migrate:
- server/src/core/repository/interfaces.ts (19 issues)
- server/src/core/repository/base-repository.ts (4 issues)  
- server/src/core/services/user.service.ts (4 issues)
```

**Strategy**: 
- Update repository interfaces to use branded types
- Maintain backward compatibility with overloaded methods
- Establish migration utilities for gradual transition

### Wave 2: Core Business Services (Week 2-3)
**Goal**: Migrate high-usage services with managed API evolution

```typescript
// Service Groups:
1. User Management: profile.service, preferences.service
2. Gamification: xp.service, missions.service  
3. Content: forum.service, admin/forum services
```

**Strategy**:
- Implement dual API support (numeric + branded types)
- Add deprecation warnings for numeric ID usage
- Update service-to-service calls incrementally

### Wave 3: Communication & Real-time (Week 4)
**Goal**: Migrate real-time systems with minimal downtime

```typescript
// Files:
- shoutbox/shoutbox.routes.ts (5 issues)
- shoutbox/cache.service.ts (14 issues)
- social/mentions.service.ts
```

**Strategy**:
- Coordinate with WebSocket message format changes
- Update cache key generation to use branded types
- Maintain message compatibility during transition

### Wave 4: Financial Services (Week 5)
**Goal**: Atomic migration of transaction-critical services

```typescript
// Critical Path:
- subscriptions/subscription.service.ts
- wallet/dgt.service.ts 
- engagement/rain.service.ts
```

**Strategy**:
- **MANDATORY**: Full integration testing before deployment
- Backup transaction state before migration
- Rollback plan for payment processing failures

## Cross-Service Coordination Requirements

### 1. Repository Pattern Migration
```typescript
// Before: Mixed numeric/string IDs
interface IBaseRepository<T> {
  findById(id: number | string): Promise<T | null>
}

// After: Strongly typed entity IDs  
interface IBaseRepository<T, TId extends EntityId> {
  findById(id: TId): Promise<T | null>
}
```

### 2. Service Orchestration Updates
```typescript
// XP Service -> Missions Service
await missionsService.checkProgress(userId as UserId, action)

// Subscription Service -> Wallet Service  
await dgtService.debitDGT(userId as UserId, amount, metadata)
```

### 3. Event System Coordination
```typescript
// Cross-service event payloads need type updates
interface XpGainEvent {
  userId: UserId  // was: number
  amount: number
  source: XP_ACTION
}
```

## Rollback Capabilities

### Service-Level Rollbacks
1. **Wave 1-2**: Database schema unchanged, pure TypeScript migration
2. **Wave 3-4**: API versioning required for rollback safety

### Financial Transaction Safeguards
1. **Pre-Migration**: Snapshot all wallet balances and transaction states
2. **During Migration**: Dual-write to both old and new ID formats
3. **Post-Migration**: Verification scripts to ensure balance consistency

## Testing Strategy

### Integration Test Requirements
1. **Cross-Service Workflows**
   - User registration → Profile creation → Initial XP grant
   - Mission completion → XP reward → DGT bonus calculation
   - Subscription purchase → Payment processing → Benefit activation

2. **API Contract Validation**
   - Endpoint backward compatibility during dual-API phase
   - WebSocket message format consistency
   - Rate limiting with new ID formats

### Performance Impact Assessment
1. **Cache Invalidation**: Shoutbox cache keys will change format
2. **Database Query Patterns**: No impact (IDs remain numeric in DB)
3. **Memory Usage**: Minimal increase from branded type metadata

## Migration Timeline

| Week | Wave | Focus | Risk Level |
|------|------|-------|------------|
| 1 | Foundation | Repository interfaces, core services | Low |
| 2-3 | Core Services | XP, missions, profiles, forums | Medium |
| 4 | Real-time | Shoutbox, caching, social features | Medium-High |
| 5 | Financial | Subscriptions, wallet, transactions | High |

## Success Metrics

1. **Zero Financial Transaction Losses**: All DGT balances and subscription states preserved
2. **API Compatibility**: Existing client applications continue to function
3. **Performance Maintenance**: No degradation in response times or cache hit rates
4. **Type Safety**: 100% of numeric ID usage converted to branded types

## Coordination with Client Migration

**Dependency**: Server migration Waves 1-2 must complete before client-side API calls are updated
**Integration Point**: API response format changes coordinated between server Wave 3 and client API migration
**Testing**: End-to-end testing after both server and client migrations complete

---

**Next Steps**: 
1. Get approval for migration wave strategy
2. Set up integration testing environment with financial transaction simulation
3. Begin Wave 1 (Foundation Layer) migration
4. Establish rollback procedures and monitoring alerts

**Estimated Total Effort**: 4-5 weeks with 2-3 developers
**Critical Path**: Financial services (Wave 4) require most careful coordination and testing