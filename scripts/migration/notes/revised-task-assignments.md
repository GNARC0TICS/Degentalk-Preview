# Revised Task Assignments - Reality Check

**Audit Date**: 2025-07-02  
**Based on**: Current repository state analysis  
**Goal**: Focus only on actual blockers for codemod workflow

## 🚨 ACTUAL BLOCKERS (Must Fix Now)

### Task 1: CRITICAL - Sync CI Baseline
**Assignee**: Infrastructure Agent  
**Time**: 5 minutes  
**Priority**: P0 - BLOCKER

```bash
# VERIFIED ISSUE - CI will fail on PRs
File: scripts/migration/check-ids-ci.ts:8
Current: const BASELINE = 594;  
Fix: const BASELINE = 548;
Validation: pnpm migration:check-ids passes
```

### Task 2: CRITICAL - Fix Test Factory ID Generation  
**Assignee**: Infrastructure Agent  
**Time**: 30 minutes  
**Priority**: P0 - BLOCKER

```bash
# VERIFIED ISSUE - Tests will break with UUID migration
File: shared/fixtures/factories/user.factory.ts:38
Current: id: this.faker.number.int({ min: 1, max: 999999 }),
Fix: id: generateId<'user'>(),
Also: Import generateId from '@shared/utils/id'
Validation: Factory-generated users have UUID format
```

## 🟡 IMMEDIATE WORKFLOW ENABLERS (This Week)

### Task 3: Finish Client-Hooks Manual Review
**Assignee**: Frontend Agent  
**Time**: 1-2 hours  
**Priority**: P1 - ENABLES NEXT CODEMOD

```bash
# BLOCKS hooks-batch codemod execution
Files: 
  - client/src/hooks/use-rain.ts:17,25 (2 low-confidence items)
  - client/src/hooks/use-messages.tsx:4 (1 low-confidence item)
Manual Decision: Determine correct entity type for generic 'id: number'
Reference: scripts/migration/output/hooks-manual-review.md
```

### Task 4: Verify ESLint Integration Works
**Assignee**: Infrastructure Agent  
**Time**: 15 minutes  
**Priority**: P1 - QA

```bash
# ENSURE no-undeclared-branded-id rule catches future errors
Current: Rule is "off" in .eslintrc.json:77
Test: Enable rule, run on known bad file, verify it catches missing imports
Fix: Turn rule to "error" once validated
```

## 🔄 PARALLEL WORK (No Dependencies)

### Task 5: Repository Foundation (Backend Stream)
**Assignee**: Backend Agent  
**Time**: 4-6 hours  
**Priority**: P2 - ENABLES SERVER MIGRATIONS

```bash
# GOOD FOR BACKEND AGENT TO WORK ON WHILE FRONTEND CODEMODS RUN
File: server/src/core/repository/base-repository.ts
Goal: Add generic TId parameter for type safety
Note: Doesn't block client migrations - can run in parallel
```

### Task 6: Component Batch Preparation (Frontend Stream)
**Assignee**: Frontend Agent  
**Time**: 2-3 hours  
**Priority**: P2 - PREPARES NEXT BATCH

```bash
# ONCE HOOKS CODEMOD COMPLETES
Files: Complex components in client-components batch (58 issues)
Goal: Review ThreadCard.tsx, PostActions.tsx for coordination needs
Note: Can start analysis while waiting for hooks completion
```

## ❌ REMOVED TASKS (Already Done or Non-Blocking)

- ~~Test infrastructure broken~~ → **PARTIAL**: Some factories still need fixing
- ~~API contract validation~~ → **DONE**: shared/types already use branded IDs  
- ~~Database schema~~ → **NON-BLOCKING**: Doesn't affect codemods
- ~~Event system versioning~~ → **NON-BLOCKING**: No central event bus exists
- ~~Cache key standardization~~ → **POST-MIGRATION**: Optimization only
- ~~Router parameter safety~~ → **WILL BE COVERED**: By client-pages batch

## 📊 Realistic Timeline

### This Week (Codemod Enablement)
```
Today (30 min): Infrastructure Agent
├── Fix CI baseline (5 min)
└── Fix user factory ID generation (25 min)

Tomorrow (2 hours): Frontend Agent
└── Complete hooks manual review items

Wednesday: Infrastructure Agent  
└── Verify ESLint rule works correctly

Thursday-Friday: Ready for next codemod batch
```

### Next Week (Parallel Streams)
```
Frontend Stream: client-components batch (58 issues)
Backend Stream: Repository foundation + service layer prep
Infrastructure Stream: Database optimization, performance testing
```

## ✅ Simplified Success Criteria

**Ready for Next Codemod When**:
- [ ] CI baseline matches reality (548)
- [ ] Test factories generate UUIDs
- [ ] 3 manual hook items resolved  
- [ ] ESLint rule active and working

**Total Effort**: ~3-4 hours of focused work vs. 40-65 hours of over-engineering

**Focus**: Enable the existing codemod workflow rather than solving all future problems upfront.