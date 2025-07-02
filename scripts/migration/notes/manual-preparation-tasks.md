# Manual Preparation Tasks for Smooth Codemod Migration

**Analysis Date**: 2025-07-02  
**Purpose**: Pre-automation manual tasks to ensure codemods run smoothly  
**Priority**: Execute in order to minimize migration friction

## 🚨 CRITICAL - Must Fix First (Risk Level: BLOCKER)

### Task 1: Fix Broken Test Infrastructure
**Assignee**: Infrastructure Agent  
**Priority**: P0 - BLOCKER  
**Time**: 2-4 hours  

```yaml
Problem: Test factories generate numeric IDs instead of UUIDs - ALL TESTS WILL FAIL
Files:
  - shared/fixtures/factories/user.factory.ts:38
  - shared/fixtures/factories/forum.factory.ts:multiple
  - scripts/db/utils/seedUtils.ts:type-errors
  
Fix Required:
  - Replace faker.number.int() with generateId<'user'>()
  - Update all factory ID generation to use branded types
  - Fix seedUtils type errors preventing script execution
  
Validation: 
  - npm test passes with factory-generated data
  - All seed scripts execute without type errors
```

### Task 2: Sync CI Baseline with Reality  
**Assignee**: Infrastructure Agent  
**Priority**: P0 - BLOCKER  
**Time**: 1 hour  

```yaml
Problem: CI guard baseline (594) != actual baseline (548) - CI will fail
Files:
  - scripts/migration/check-ids-ci.ts:8 (BASELINE constant)
  
Fix Required:
  - Update BASELINE from 594 to 548
  - Verify detector script still works correctly
  
Validation:
  - pnpm migration:check-ids passes in CI
  - Baseline matches current migration-summary.md
```

## 🔥 HIGH PRIORITY - Pre-Automation Setup (Risk Level: HIGH)

### Task 3: Repository Layer Foundation
**Assignee**: Backend Agent (Generic Type Expert)  
**Priority**: P1 - HIGH  
**Time**: 6-8 hours  

```yaml
Problem: BaseRepository needs generic types before service migration
Files:
  - server/src/core/repository/base-repository.ts:69,201,233,251
  
Manual Work Required:
  - Add generic type parameter TId to BaseRepository<T, TId = number>
  - Update method signatures: findById(id: TId), update(id: TId), etc.
  - Maintain backward compatibility during transition
  - Create type-safe repository interfaces
  
Dependencies: None (foundation work)
Blocks: All service layer migrations
```

### Task 4: Critical API Contract Validation
**Assignee**: Full-Stack Agent  
**Priority**: P1 - HIGH  
**Time**: 4-6 hours  

```yaml
Problem: Client-server ID type mismatches will break API communication
Files:
  - Shared API types in shared/types/api.types.ts
  - Controller response types in server/src/routes/
  - Client API consumption in client/src/lib/api/
  
Manual Work Required:
  - Audit all API endpoints for consistent ID type usage
  - Verify request/response serialization with UUIDs
  - Test ID validation middleware compatibility
  - Document breaking changes for API versioning
  
Dependencies: None
Blocks: Client-server integration
```

### Task 5: Transaction Boundary Identification
**Assignee**: Backend Agent (Financial Systems Expert)  
**Priority**: P1 - HIGH  
**Time**: 8-12 hours  

```yaml
Problem: Financial operations need atomic ID migrations to prevent data corruption
Files:
  - server/src/domains/wallet/wallet.service.ts
  - server/src/domains/engagement/tip/tip.service.ts
  - server/src/domains/admin/sub-domains/treasury/treasury.service.ts
  
Manual Work Required:
  - Identify all multi-step financial transactions
  - Create rollback procedures for failed migrations
  - Implement transaction integrity validation
  - Design zero-downtime migration strategy
  
Dependencies: Repository layer foundation
Blocks: Financial domain migrations
```

## 🟡 MEDIUM PRIORITY - Component Coordination (Risk Level: MEDIUM)

### Task 6: Complex Component Interface Coordination
**Assignee**: Frontend Agent (Component Architecture Expert)  
**Priority**: P2 - MEDIUM  
**Time**: 10-15 hours  

```yaml
Problem: Complex component hierarchies need coordinated prop type updates
Files:
  - client/src/components/forum/ThreadCard.tsx:32-35,65,298,332
  - client/src/components/forum/bbcode/PostActions.tsx:30-53,78-106  
  - client/src/components/auth/withRouteProtection.tsx:16-72
  - client/src/components/header/HeaderContext.tsx:57-74
  
Manual Work Required:
  - Update HOC prop pass-through types
  - Coordinate parent-child component interfaces
  - Fix explicit type casting (threadId as any)
  - Align context provider ID types
  
Dependencies: API contract validation
Blocks: Component batch migrations
```

### Task 7: Event System Type Versioning
**Assignee**: Backend Agent (Event Architecture Expert)  
**Priority**: P2 - MEDIUM  
**Time**: 6-8 hours  

```yaml
Problem: Event payloads need ID type consistency across service boundaries
Files:
  - server/src/core/events/achievement-events.service.ts
  - server/src/domains/*/events/ (multiple event handlers)
  - Event interfaces with ID payloads
  
Manual Work Required:
  - Create event schema versioning strategy
  - Update event payload interfaces
  - Implement backward compatibility during transition
  - Test cross-service event processing
  
Dependencies: Repository layer foundation
Blocks: Event-driven service migrations
```

### Task 8: Database Schema Migration Preparation
**Assignee**: Infrastructure Agent (Database Expert)  
**Priority**: P2 - MEDIUM  
**Time**: 4-6 hours  

```yaml
Problem: Database needs UUID column support and index optimization
Files:
  - Database migration scripts
  - Foreign key constraint definitions
  - Index structures for UUID performance
  
Manual Work Required:
  - Validate UUID extension enabled in PostgreSQL
  - Plan index restructuring for UUID performance
  - Create data migration scripts for existing records
  - Test FK constraint integrity with UUIDs
  
Dependencies: None
Blocks: Production deployment
```

## 🟢 LOW PRIORITY - Optimization & Polish (Risk Level: LOW)

### Task 9: Router Parameter Type Safety
**Assignee**: Frontend Agent  
**Priority**: P3 - LOW  
**Time**: 2-4 hours  

```yaml
Problem: URL parameter extraction needs branded type integration
Files:
  - client/src/components/forum/ForumPage.tsx:22-25
  - client/src/components/forum/LegacyForumRedirect.tsx:15-37
  
Manual Work Required:
  - Update useParams hook type annotations
  - Add URL parameter validation
  - Test route parameter consistency
  
Dependencies: Component interface coordination
Blocks: None (cosmetic improvement)
```

### Task 10: Cache Key Format Standardization
**Assignee**: Backend Agent  
**Priority**: P3 - LOW  
**Time**: 2-3 hours  

```yaml
Problem: Cache keys need consistent UUID string format
Files:
  - Various service files with cache key generation
  - server/src/core/cache.service.ts
  
Manual Work Required:
  - Standardize cache key generation with UUIDs
  - Update cache invalidation logic
  - Test cache hit rates with new key format
  
Dependencies: Service layer migrations
Blocks: None (performance optimization)
```

## 📋 Task Dependencies & Execution Order

```
1. Fix Test Infrastructure (BLOCKER) ────┐
2. Sync CI Baseline (BLOCKER) ──────────┤
                                        ├─── 3. Repository Layer Foundation
                                        │        │
                                        │        ├─── 5. Transaction Boundaries
                                        │        ├─── 7. Event System Versioning
                                        │        │
4. API Contract Validation ─────────────┤        │
                                        │        │
                                        └─── 6. Component Coordination
                                             │
                                             ├─── 9. Router Parameter Types
                                             │
8. Database Schema ─────────────────────────┤
                                            │
                                            └─── 10. Cache Key Standardization
```

## 🎯 Success Criteria for Each Task

| Task | Validation Method | Success Metric |
|------|------------------|----------------|
| Test Infrastructure | `npm test` passes | All factory tests green |
| CI Baseline | CI pipeline passes | Baseline matches reality |
| Repository Layer | TypeScript compiles | Generic types work |
| API Contracts | Integration tests | Client-server compatibility |
| Transaction Boundaries | Financial audit | Zero data corruption |
| Component Coordination | Build succeeds | No prop type errors |
| Event System | Cross-service tests | Event processing works |
| Database Schema | Migration tests | UUID support verified |
| Router Parameters | Route navigation | Type-safe URL handling |
| Cache Keys | Performance tests | Cache hit rate maintained |

## 🚀 Post-Task Automated Migration Readiness

Once these manual tasks are complete:

1. **Codemods can run safely** - No breaking dependencies
2. **Tests will pass** - Factory infrastructure works
3. **CI will validate** - Baseline is accurate  
4. **Services can migrate atomically** - Transaction boundaries defined
5. **Components can batch migrate** - Interfaces coordinated
6. **Database supports UUID** - Schema prepared

**Estimated Total Manual Prep Time**: 40-65 hours across multiple agents  
**Payoff**: Smooth automated migration with minimal rollbacks and fixes