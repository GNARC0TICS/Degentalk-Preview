# Subagent Task Assignments for Smooth Codemod Migration

**Generated**: 2025-07-02  
**Purpose**: Distribute manual preparation tasks across specialized agents  
**Goal**: Enable smooth automated migration with minimal friction

## 🎯 Critical Path Summary

**BLOCKERS** (Must complete first):
1. Fix broken test infrastructure → Infrastructure Agent  
2. Sync CI baseline → Infrastructure Agent

**FOUNDATION** (Enables downstream work):
3. Repository layer generics → Backend Agent  
4. API contract validation → Full-Stack Agent

**COORDINATION** (Prevents migration conflicts):
5. Transaction boundaries → Backend Agent (Financial)  
6. Component interfaces → Frontend Agent  
7. Event system versioning → Backend Agent (Events)

## 👥 Agent Specialization & Task Distribution

### 🛠️ Infrastructure Agent (DevOps/CI Focus)
**Skills**: Build systems, testing, database setup  
**Priority Tasks**: P0 blockers that affect all downstream work

#### Task 1: CRITICAL - Fix Test Infrastructure
```bash
# BLOCKER - Executes first
Files: shared/fixtures/factories/*.factory.ts, scripts/db/utils/seedUtils.ts  
Problem: Factory functions generate numeric IDs → will break all tests
Fix: Replace faker.number.int() with generateId<'user'>()
Time: 2-4 hours
Validation: npm test passes
```

#### Task 2: CRITICAL - Sync CI Baseline  
```bash
# BLOCKER - Prevents CI failures
Files: scripts/migration/check-ids-ci.ts:8
Problem: Baseline (594) != reality (548) → CI fails
Fix: Update BASELINE constant to 548
Time: 1 hour  
Validation: pnpm migration:check-ids passes
```

#### Task 8: Database Schema Preparation
```bash
# MEDIUM - Infrastructure readiness
Focus: UUID support, index optimization, FK constraints
Problem: Database needs UUID column performance validation
Time: 4-6 hours
Dependencies: None
```

---

### 🔧 Backend Agent (Generic Type Expert)
**Skills**: TypeScript generics, repository patterns, type system design  
**Priority Tasks**: Foundation layer that enables service migrations

#### Task 3: HIGH - Repository Layer Foundation
```bash
# FOUNDATION - All service migrations depend on this
Files: server/src/core/repository/base-repository.ts
Problem: Generic BaseRepository<T> needs TId parameter for type safety
Changes:
  - Add TId generic parameter: BaseRepository<T, TId = number>
  - Update signatures: findById(id: TId), update(id: TId)
  - Maintain backward compatibility
Time: 6-8 hours
Blocks: ALL service layer migrations
```

---

### 💰 Backend Agent (Financial Systems Expert)  
**Skills**: Transaction integrity, financial operations, data consistency  
**Priority Tasks**: Zero-tolerance financial operation safety

#### Task 5: HIGH - Transaction Boundary Identification
```bash
# CRITICAL - Financial data integrity
Files: 
  - server/src/domains/wallet/wallet.service.ts
  - server/src/domains/engagement/tip/tip.service.ts  
  - server/src/domains/admin/sub-domains/treasury/treasury.service.ts
Problem: Multi-step financial transactions need atomic ID migration
Work:
  - Map transaction boundaries
  - Create rollback procedures  
  - Implement integrity validation
  - Design zero-downtime strategy
Time: 8-12 hours
Dependencies: Repository foundation
```

---

### 📡 Backend Agent (Event Architecture Expert)
**Skills**: Event-driven systems, cross-service communication, message queues  
**Priority Tasks**: Event system type consistency

#### Task 7: MEDIUM - Event System Type Versioning  
```bash
# COORDINATION - Cross-service consistency
Files: server/src/core/events/, server/src/domains/*/events/
Problem: Event payloads need ID type consistency across boundaries
Work:
  - Create event schema versioning
  - Update event payload interfaces
  - Implement backward compatibility
  - Test cross-service processing
Time: 6-8 hours
Dependencies: Repository foundation
```

---

### 🎨 Frontend Agent (Component Architecture Expert)
**Skills**: React patterns, component hierarchies, prop type coordination  
**Priority Tasks**: Complex component interface management

#### Task 6: MEDIUM - Complex Component Interface Coordination
```bash
# COORDINATION - Prevents prop type cascade failures  
Files:
  - client/src/components/forum/ThreadCard.tsx
  - client/src/components/forum/bbcode/PostActions.tsx
  - client/src/components/auth/withRouteProtection.tsx
  - client/src/components/header/HeaderContext.tsx
Problem: Complex component hierarchies need coordinated prop updates
Work:
  - Update HOC prop pass-through types
  - Coordinate parent-child interfaces
  - Fix explicit casting (threadId as any)
  - Align context provider types
Time: 10-15 hours
Dependencies: API contract validation
```

#### Task 9: LOW - Router Parameter Type Safety
```bash
# POLISH - Type safety improvement
Files: client/src/components/forum/ForumPage.tsx, LegacyForumRedirect.tsx
Problem: URL parameter extraction needs branded type integration
Time: 2-4 hours
Dependencies: Component coordination
```

---

### 🌐 Full-Stack Agent (API Contract Expert)
**Skills**: Client-server integration, API design, contract validation  
**Priority Tasks**: API compatibility across migration

#### Task 4: HIGH - Critical API Contract Validation
```bash
# FOUNDATION - Client-server compatibility
Files:
  - shared/types/api.types.ts
  - server/src/routes/ (controllers)
  - client/src/lib/api/ (consumption)
Problem: Client-server ID type mismatches break API communication
Work:
  - Audit endpoint ID type consistency
  - Verify UUID serialization
  - Test validation middleware
  - Document breaking changes
Time: 4-6 hours
Dependencies: None (can start immediately)
Blocks: Client-server integration
```

---

### ⚡ Backend Agent (Performance Expert)
**Skills**: Caching, optimization, performance tuning  
**Priority Tasks**: Post-migration optimization

#### Task 10: LOW - Cache Key Format Standardization
```bash
# OPTIMIZATION - Performance maintenance
Files: Various service files, server/src/core/cache.service.ts
Problem: Cache keys need consistent UUID string format
Time: 2-3 hours
Dependencies: Service layer migrations
```

## 📊 Execution Timeline & Coordination

### Week 1: Foundation (P0-P1 Tasks)
```
Day 1-2: Infrastructure Agent
  ├── Fix test infrastructure (BLOCKER)
  └── Sync CI baseline (BLOCKER)

Day 2-3: Backend Agent (Generic Types) 
  └── Repository layer foundation

Day 3-4: Full-Stack Agent
  └── API contract validation

Day 4-5: Backend Agent (Financial)
  └── Transaction boundary identification
```

### Week 2: Coordination (P2 Tasks)
```
Day 1-3: Frontend Agent
  └── Component interface coordination

Day 2-4: Backend Agent (Events)
  └── Event system versioning

Day 4-5: Infrastructure Agent
  └── Database schema preparation
```

### Week 3: Polish & Automation
```
Day 1-2: Complete remaining tasks
Day 3-5: Begin automated codemod execution
```

## 🔄 Communication Protocol

### Daily Standup Topics:
1. **Blockers**: Any dependencies preventing progress
2. **Interface Changes**: New type definitions affecting other agents
3. **Test Results**: Validation status for completed tasks
4. **Integration Points**: Cross-agent coordination needed

### Handoff Requirements:
- **Documentation**: All interface changes documented
- **Tests**: Validation tests pass before handoff
- **Code Review**: Cross-agent review for shared interfaces
- **Rollback Plan**: Documented rollback for critical changes

## ✅ Ready-to-Execute Criteria

Before automated codemods can begin:

- [ ] All P0 tasks completed (test infrastructure, CI baseline)
- [ ] All P1 tasks completed (repository foundation, API contracts, transactions)
- [ ] Integration tests pass between modified components
- [ ] Database schema supports UUID operations
- [ ] Event system maintains cross-service compatibility

**Estimated Total Time**: 40-65 hours across 5-6 specialized agents  
**Expected Outcome**: Codemods execute smoothly with minimal manual fixes required