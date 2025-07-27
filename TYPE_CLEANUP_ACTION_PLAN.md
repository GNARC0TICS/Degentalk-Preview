# Type System Cleanup Action Plan 🎯

## Mission: Unfuck the Type System

From this clusterfuck:
```
shared/types/
├── core/
│   └── forum.types.ts
├── entities/
│   └── [who knows what]
├── wallet/
│   └── [nested mess]
└── [random files everywhere]
```

To this beauty:
```
shared/types/
├── user.types.ts      ✅ Already perfect!
├── thread.types.ts    ✅ Already perfect!
├── post.types.ts      🔨 Create from CanonicalPost
├── forum.types.ts     🔨 Move from core/
├── wallet.types.ts    🔨 Consolidate wallet/*
├── shop.types.ts      🔨 Create/consolidate
├── xp.types.ts        🔨 Create/consolidate
├── role.types.ts      🔨 Move from entities/
├── ids.ts             ✅ Already exists!
└── index.ts           🔨 Clean re-exports
```

## Phase 1: Flatten the Structure (30 mins)

```bash
# 1. Move forum types out of core/
mv shared/types/core/forum.types.ts shared/types/forum.types.ts

# 2. Check what's in entities/
ls shared/types/entities/

# 3. Move role types
mv shared/types/entities/role.types.ts shared/types/role.types.ts

# 4. Consolidate wallet types
cat shared/types/wallet/*.ts > shared/types/wallet.types.ts

# 5. Remove empty directories
rmdir shared/types/core
rmdir shared/types/entities
rmdir shared/types/wallet
```

## Phase 2: Create Missing Core Types (1 hour)

### 1. Create post.types.ts
```typescript
// shared/types/post.types.ts
import type { PostId, ThreadId, UserId } from './ids';

// THE Post Type - One type. Everywhere. No exceptions.
export interface Post {
  id: PostId;
  threadId: ThreadId;
  userId: UserId;
  content: string;
  
  // Relations
  user: PostAuthor;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Stats
  likeCount: number;
  
  // Status
  isDeleted: boolean;
  isHidden: boolean;
}

export interface PostAuthor {
  id: UserId;
  username: string;
  avatarUrl?: string;
  level: number;
}

// Input types
export interface CreatePostInput {
  threadId: ThreadId;
  content: string;
}

// That's it. No more bullshit.
```

### 2. Consolidate scattered types
```bash
# Find all Post-related types
grep -r "interface.*Post" --include="*.ts" | grep -v node_modules

# Find all Forum-related types  
grep -r "interface.*Forum" --include="*.ts" | grep -v node_modules
```

## Phase 3: Fix the Broken Imports (2 hours)

### 1. Fix db/types/forum.types.ts
```typescript
// BEFORE (broken as fuck)
import type { CanonicalThread, CanonicalPost } from '../../client/src/types/canonical.types';

// AFTER (clean)
import type { Thread } from '@shared/types/thread.types';
import type { Post } from '@shared/types/post.types';

// Temporary aliases for compatibility
export type CanonicalThread = Thread;  // DELETE LATER
export type CanonicalPost = Post;      // DELETE LATER
export type ThreadWithUser = Thread;   // DELETE LATER
```

### 2. Fix MagicForumBuilder.tsx
```typescript
// Line 212 - thread.zone doesn't exist!
// CHANGE: thread.zone
// TO: thread.featuredForum
```

### 3. Fix all client imports
```bash
# Find all bad imports
grep -r "from ['\"]\.\.\/.*types" client/src --include="*.ts" --include="*.tsx"

# Update them to use shared
# './types/user' → '@shared/types/user.types'
# '../types/thread' → '@shared/types/thread.types'
```

## Phase 4: Delete the Garbage (30 mins)

```bash
# After everything works, delete:
rm -rf client/src/types/canonical.types.d.ts
rm -rf client/src/types/compat/
rm client/src/types/user.ts  # Use shared instead
rm client/src/types/thread.types.ts  # Use shared instead
```

## Phase 5: Clean Index Exports

```typescript
// shared/types/index.ts
export * from './ids';
export * from './user.types';
export * from './thread.types';
export * from './post.types';
export * from './forum.types';
export * from './wallet.types';
export * from './role.types';
// etc...

// Now everyone can just:
// import { User, Thread, Post } from '@shared/types';
```

## Validation Commands

```bash
# After each phase:
pnpm typecheck

# Check specific problem files:
pnpm typecheck -- db/types/forum.types.ts
pnpm typecheck -- client/src/components/forum/layouts/MagicForumBuilder.tsx
pnpm typecheck -- client/src/types/admin.types.ts
```

## Success Metrics

1. ✅ No nested type folders
2. ✅ No "Canonical" prefix anywhere
3. ✅ No "WithUser" suffix anywhere  
4. ✅ Each entity has ONE file (user.types.ts, thread.types.ts, etc.)
5. ✅ Clean imports: `import { Thread } from '@shared/types'`
6. ✅ TypeScript errors drop from 590+ to under 100

## Common Sense Rules

1. **One Type, One File**: User types go in user.types.ts. Period.
2. **No Fancy Names**: It's `User`, not `IUser` or `UserInterface` or `CanonicalUser`
3. **No Deep Nesting**: shared/types/[entity].types.ts - that's it
4. **Use What Exists**: Don't create new types, fix the imports

## Git Strategy

```bash
# Create feature branch
git checkout -b fix/unfuck-type-system

# Commit after each phase
git add -A
git commit -m "Phase 1: Flatten type structure"

# Push for backup
git push origin fix/unfuck-type-system
```

## Let's Ship This!

The types are already good - they're just in the wrong places with confusing names. This is a 4-hour fix, not a 4-week refactor.

**LET'S FUCKING GO!** 🚀