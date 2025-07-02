# Current Repository Structure Analysis for Subagent Tasks

**Generated**: 2025-07-02  
**Baseline**: 542 total issues (down from 548)  
**Purpose**: Provide exact scope details for subagent manual work

## 📊 Current Migration Status

### ✅ Completed Batches (0 issues each)
- **client-types**: All branded types working correctly
- **client-hooks**: Manual fixes completed, codemod succeeded  
- **client-api**: API layer properly typed

### ⚠️ Active Issue Batches
- **client-components**: 58 issues (next target)
- **client-pages**: 73 issues  
- **client-other**: 189 issues
- **server-other**: 220 issues
- **database**: 2 issues (low-hanging fruit)

## 🎯 Exact Scope for Manual Fixes

### Test Infrastructure Issues (Infrastructure Agent)

**File 1**: `shared/fixtures/factories/user.factory.ts`
```typescript
// Line 38 - CURRENT PROBLEM
id: this.faker.number.int({ min: 1, max: 999999 }),

// MANUAL FIX REQUIRED
id: generateId<'user'>(),

// IMPORT TO ADD  
import { generateId } from '@shared/utils/id';
```

**File 2**: `shared/fixtures/factories/forum.factory.ts`
```typescript
// NEED TO ANALYZE - likely has similar patterns
// ThreadFactory, PostFactory, etc. probably generate numeric IDs
// Replace with appropriate generateId<'thread'>(), generateId<'post'>()
```

### Database Type Issues (Database Agent)

**File 1**: `db/types/forum.types.ts:50`
```typescript
// CURRENT PROBLEM
export interface ForumTag {
    id: number;
    name: string;
    slug: string;
    // ...
}

// MANUAL FIX
export interface ForumTag {
    id: TagId; // or ForumTagId if that exists
    name: string;
    slug: string;
    // ...
}

// ADD IMPORT
import type { TagId } from './id.types';
```

**File 2**: `db/types/announcement.types.ts:2`
```typescript
// CURRENT PROBLEM
export type Announcement = {
    id: number;
    content: string;
    // ...
}

// MANUAL FIX
export type Announcement = {
    id: AnnouncementId;
    content: string;
    // ...
}

// ADD IMPORT  
import type { AnnouncementId } from './id.types';
```

## 🔍 Structure Analysis for Strategy Planning

### Client Components (58 issues) - Frontend Agent Analysis

**Top Issue Files**:
1. `client/src/components/users/UserAvatar.tsx:10`
2. `client/src/components/users/ActiveMembersWidget.tsx:19`  
3. `client/src/components/ui/smart-thread-filters.tsx:67-68`
4. `client/src/components/ui/reactions-bar.tsx:21` (postId: number → PostId)

**Analysis Focus**:
- Are these components prop interfaces or internal variables?
- Do they pass IDs to child components?
- Are there type casting patterns (id as number)?
- Which require coordination vs independent fixes?

### Server Services (220 issues) - Server Agent Analysis

**Top Issue Files**:
1. `server/src/domains/xp/xp.service.ts:431` (userId: number → UserId)
2. `server/src/domains/subscriptions/subscription.service.ts:29`
3. `server/src/domains/shoutbox/shoutbox.routes.ts:36,203,266`

**Analysis Focus**:
- Are these service method parameters or internal logic?
- Do services call each other with these IDs?
- Are there API endpoints that would break client contracts?
- Which services have transaction/rollback requirements?

### Repository Foundation - Backend Agent Analysis

**Key File**: `server/src/core/repository/base-repository.ts`

**Current Generic Structure**:
```typescript
export abstract class BaseRepository<T extends Record<string, any>> {
  // Lines that need analysis:
  async findById(id: number | string): Promise<T | null>        // Line 69
  async update(id: number | string, data: Partial<T>): Promise<T>  // Line 201  
  async delete(id: number | string): Promise<void>             // Line 233
  async exists(id: number | string): Promise<boolean>          // Line 251
}
```

**Analysis Required**:
- How many repository implementations extend this?
- Can we add TId generic without breaking existing code?
- What's the migration path for dependent repositories?

## 📋 Available Infrastructure

### Working UUID System
```typescript
// From @shared/utils/id - ALREADY AVAILABLE
generateId<'user'>() → UserId
generateId<'thread'>() → ThreadId  
generateId<'post'>() → PostId
// etc.
```

### Working Branded Types  
```typescript
// From @db/types/id.types - ALREADY AVAILABLE
export type UserId = Id<'user'>;
export type ThreadId = Id<'thread'>;
export type PostId = Id<'post'>;
export type AnnouncementId = Id<'announcement'>;
export type TagId = Id<'tag'>;
// 100+ more types available
```

### Working Validation
```typescript
// From @shared/validation/common.schemas - ALREADY AVAILABLE
export const userIdSchema = z.string().uuid();
export const threadIdSchema = z.string().uuid();
// etc.
```

## 🚫 Critical Constraints for Subagents

### NO SCRIPT EXECUTION
- Don't run `pnpm test`, `pnpm build`, `pnpm typecheck`
- Don't execute migration scripts
- Don't run detector scripts
- Don't make git commits

### MANUAL WORK ONLY
- Use Read tool to examine files
- Use Edit tool to make precise changes
- Write analysis documents
- Plan implementation strategies

### FOCUS ON PREPARATION
- Goal: Enable smooth codemod execution
- Fix obvious blockers manually
- Document complex coordination needs
- Don't solve every problem upfront

## 🎯 Success Definition

**After Manual Work**:
- Test factories generate UUIDs (enables testing)
- Database types use branded IDs (cleans up baseline)
- Strategy documents exist for next phases (enables planning)
- NO scripts run, NO commits made (preserves workflow)

**Total Expected Impact**: 
- 2-4 issues fixed manually
- 58-220 issues prepared for automated migration
- Clear execution plan for next codemod waves