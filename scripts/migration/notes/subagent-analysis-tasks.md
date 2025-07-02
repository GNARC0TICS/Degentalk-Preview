# Subagent Analysis Tasks - Current Structure Review

**Date**: 2025-07-02  
**Status**: CI baseline: 542 issues | client-hooks: ✅ Clean  
**Scope**: Manual analysis & file editing ONLY - NO scripts, commands, or commits  

## 🎯 Current Structure Analysis

**Progress Update**:
- ✅ client-types (0 issues)
- ✅ client-hooks (0 issues) 
- ✅ client-api (0 issues)
- ⚠️ client-components (58 issues)
- ⚠️ client-pages (73 issues)
- ⚠️ server domains (220+ issues)
- ⚠️ database types (2 issues)

## 📋 IMMEDIATE TASKS - Analysis & Manual Fixes Only

### Task A: Infrastructure Agent - Test Factory UUID Fixes
**Scope**: Manual file editing only  
**Time**: 30 minutes  
**Files to Fix**:

1. **`shared/fixtures/factories/user.factory.ts:38`**
   ```typescript
   // CURRENT (BROKEN)
   id: this.faker.number.int({ min: 1, max: 999999 }),
   
   // FIX TO
   id: generateId<'user'>(),
   
   // ADD IMPORT
   import { generateId } from '@shared/utils/id';
   ```

2. **`shared/fixtures/factories/forum.factory.ts`** (Need to check ThreadFactory)
   - Analyze for numeric ID generation patterns
   - Replace with appropriate generateId<'thread'>(), generateId<'post'>(), etc.
   - Add proper imports

**Validation**: 
- Files compile without errors
- Factory functions return UUID strings
- NO running of tests or scripts

---

### Task B: Database Agent - Clean Remaining DB Type Issues  
**Scope**: Manual file editing only  
**Time**: 15 minutes  
**Files to Fix**:

1. **`db/types/forum.types.ts:50`**
   ```typescript
   // CURRENT
   export interface ForumTag {
       id: number;
   
   // FIX TO  
   export interface ForumTag {
       id: TagId;  // or appropriate branded type
   
   // ADD IMPORT if needed
   import type { TagId } from './id.types';
   ```

2. **`db/types/announcement.types.ts:2`**
   ```typescript
   // CURRENT
   export type Announcement = {
       id: number;
   
   // FIX TO
   export type Announcement = {
       id: AnnouncementId;
   
   // ADD IMPORT
   import type { AnnouncementId } from './id.types';
   ```

**Validation**:
- Files compile with proper branded types
- Imports resolve correctly
- NO running of database scripts

---

### Task C: Backend Agent - Repository Foundation Analysis
**Scope**: Analysis and planning only  
**Time**: 1-2 hours  
**Focus**: `server/src/core/repository/base-repository.ts`

**Analysis Required**:
1. **Current Generic Structure**:
   ```typescript
   // Lines 69, 201, 233, 251 - Current signatures
   async findById(id: number | string): Promise<T | null>
   async update(id: number | string, data: Partial<T>): Promise<T>
   async delete(id: number | string): Promise<void>
   async exists(id: number | string): Promise<boolean>
   ```

2. **Proposed Generic Enhancement**:
   ```typescript
   // Target structure for type safety
   export abstract class BaseRepository<T extends Record<string, any>, TId = string> {
     async findById(id: TId): Promise<T | null>
     async update(id: TId, data: Partial<T>): Promise<T>
     async delete(id: TId): Promise<void>
     async exists(id: TId): Promise<boolean>
   }
   ```

3. **Impact Assessment**:
   - Document which repository implementations would need updates
   - Identify backward compatibility requirements
   - Plan migration strategy for existing repositories

**Deliverable**: Analysis document with implementation plan  
**NO CODE CHANGES**: Planning only for now

---

### Task D: Frontend Agent - Component Batch Analysis
**Scope**: Analysis of high-priority component issues  
**Time**: 1-2 hours  
**Focus**: Next migration batch preparation

**Files to Analyze** (from client-components top issues):
1. **`client/src/components/users/UserAvatar.tsx:10`**
2. **`client/src/components/users/ActiveMembersWidget.tsx:19`**  
3. **`client/src/components/ui/smart-thread-filters.tsx:67-68`**
4. **`client/src/components/ui/reactions-bar.tsx:21`**

**Analysis Required**:
- Identify prop interface dependencies
- Check for parent-child component coordination needs
- Document explicit type casting patterns
- Plan migration sequence to avoid cascading failures

**Focus Questions**:
- Which components have complex prop interfaces?
- Are there HOCs or context providers affected?
- What's the safest migration order?

**Deliverable**: Component migration strategy document  
**NO CODE CHANGES**: Analysis only

---

### Task E: Server Agent - Domain Services Analysis  
**Scope**: Analysis of server service patterns  
**Time**: 1-2 hours  
**Focus**: High-impact service files

**Files to Analyze** (from server-other top issues):
1. **`server/src/domains/xp/xp.service.ts:431`**
2. **`server/src/domains/subscriptions/subscription.service.ts:29`**
3. **`server/src/domains/shoutbox/shoutbox.routes.ts:36,203,266`**

**Analysis Required**:
- Identify cross-service ID dependencies
- Document API endpoint parameter types
- Check for financial/transaction boundaries
- Plan service migration coordination

**Focus Questions**:
- Which services have cross-domain dependencies?
- Are there API breaking changes required?
- What's the safest service migration order?

**Deliverable**: Service migration strategy document  
**NO CODE CHANGES**: Analysis only

## 🚫 STRICT CONSTRAINTS

### What Agents MUST NOT Do:
- ❌ Run any npm/pnpm commands
- ❌ Execute any scripts
- ❌ Run tests or builds  
- ❌ Make git commits
- ❌ Use Task tool to run code analysis
- ❌ Execute migration scripts

### What Agents SHOULD Do:
- ✅ Read files directly with Read tool
- ✅ Edit files manually with Edit tool
- ✅ Write analysis documents
- ✅ Plan migration strategies  
- ✅ Document dependencies and risks
- ✅ Prepare implementation approaches

## 📊 Success Criteria

**Task A (Infrastructure)**: 
- Test factories generate UUIDs correctly
- Proper imports added
- Files compile cleanly

**Task B (Database)**:
- 2 remaining DB type issues resolved
- Branded types properly imported
- Type system consistency maintained

**Tasks C,D,E (Analysis)**:
- Comprehensive strategy documents
- Risk assessment completed  
- Migration dependencies mapped
- Implementation plans ready

**Overall Goal**: Enable smooth codemod execution through manual preparation and strategic planning, NOT through automated tooling or script execution.