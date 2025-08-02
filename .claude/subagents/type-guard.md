# Agent 3: The Type Guard 🛡️

## Mission Statement
**Fix type mismatches and missing properties to establish type safety**

## Domain & Scope
- **Files**: Type definitions in `shared/types/**/*.ts` and usage sites
- **Duration**: 90-120 minutes
- **Priority**: HIGH (core type system must be consistent)

## Target Error Patterns
```typescript
// 1. Missing properties on interfaces
error TS2339: Property 'displayName' does not exist on type 'User'
error TS2339: Property 'lastBackupId' does not exist on type

// 2. Type recursion issues
error TS2310: Type 'User' recursively references itself as a base type

// 3. Logger signature mismatches
error TS2554: Expected 2-3 arguments, but got 1
error TS2345: Argument of type '{ error: any; }' is not assignable to parameter of type 'string'

// 4. ID type conflicts
error TS2345: Argument of type 'Id<"Frame">' is not assignable to parameter of type 'FrameId'

// 5. Wrong argument counts
error TS2554: Expected 1 arguments, but got 2
```

## Core Type System Rules

### Single Source of Truth:
```typescript
// ✅ ALL types come from @shared/types - NO exceptions
import { User } from '@shared/types/user.types';
import { UserId, ThreadId } from '@shared/types/ids';
import { ApiResponse } from '@shared/types/api.types';

// ❌ BANNED - No local type extensions
interface User { ... }                    // BANNED
type MyUser = User & { ... }             // BANNED
type CanonicalUser = User;               // BANNED
```

## Fix Strategy by Error Type

### 1. Missing User Properties
The User type is used everywhere and missing critical properties:

```typescript
// Current errors indicate missing:
// - displayName
// - profileImage
// - settings
// - preferences

// ✅ Fix in shared/types/user.types.ts
export interface User {
  id: UserId;
  username: string;
  email: string;
  // Add missing properties:
  displayName?: string;
  profileImage?: string;
  avatar?: string;
  settings?: UserSettings;
  preferences?: UserPreferences;
  // ... any other missing properties from error messages
}
```

### 2. Logger Signature Fixes
Logger calls are failing due to incorrect signatures:

```typescript
// ❌ CURRENT - Wrong signatures causing errors
logger.error('Error message', { error: someError }); // Too many args
logger.info('Message', { users: userArray });        // Wrong type

// ✅ FIX - Check actual logger signature and fix calls
// In @core/logger, the signature is likely:
// logger.error(namespace: string, message: string, data?: unknown)

// So fix calls to match:
logger.error('AUTH', 'Error message', { error: someError });
logger.info('USER', 'Message', { users: userArray });
```

### 3. ID Type Consistency
Branded ID types are conflicting:

```typescript
// ❌ PROBLEM - Multiple ID type systems
type FrameId = Id<'Frame'>;              // One system
type FrameId = { __tag: 'FrameId' };     // Another system

// ✅ FIX - Use single branded ID system from shared/types/ids.ts
// Ensure all ID types follow same pattern:
export type UserId = Id<'User'>;
export type ThreadId = Id<'Thread'>;
export type FrameId = Id<'Frame'>;

// And conversion functions:
export const toUserId = (id: string): UserId => id as UserId;
export const toFrameId = (id: string): FrameId => id as FrameId;
```

### 4. Recursive Type References
Fix circular type definitions:

```typescript
// ❌ PROBLEM - User references itself as base type
export interface User extends User {  // Circular!
  // ...
}

// ✅ FIX - Remove circular reference
export interface User {
  id: UserId;
  username: string;
  // ... properties without circular reference
}
```

## High Priority Files to Fix

### 1. shared/types/user.types.ts
Most critical - User type is used everywhere:
```typescript
// Add missing properties found in error messages:
export interface User {
  id: UserId;
  username: string;
  email: string;
  
  // Add these based on errors:
  displayName?: string;
  profileImage?: string;
  avatar?: string;
  walletAddress?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Remove any circular references
// Fix any User extends User issues
```

### 2. shared/types/ids.ts  
Ensure consistent ID branding:
```typescript
// Single ID branding system
export type Id<T extends string> = string & { readonly __brand: T };

export type UserId = Id<'User'>;
export type ThreadId = Id<'Thread'>;
export type PostId = Id<'Post'>;
export type FrameId = Id<'Frame'>;

// Conversion functions
export const toUserId = (id: string): UserId => id as UserId;
export const toThreadId = (id: string): ThreadId => id as ThreadId;
export const toPostId = (id: string): PostId => id as PostId;
export const toFrameId = (id: string): FrameId => id as FrameId;
```

### 3. Fix Logger Calls
Find and fix incorrect logger usage:

```bash
# Find problematic logger calls
grep -r "logger\." server/src/ --include="*.ts" | grep -E "(error|info|warn)" > logger-calls.txt

# Look for calls with wrong argument patterns:
# - Wrong number of arguments
# - Wrong argument types
```

## Specific Error Fixes

### server/src/utils/dev-auth-startup.ts
```typescript
// Fix logger calls from error messages:
// error TS2345: Argument of type '{ error: any; }' is not assignable to parameter of type 'string'

// ❌ Current (wrong):
logger.error('Auth startup error', { error });

// ✅ Fixed (right):
logger.error('AUTH_STARTUP', 'Error during auth startup', { error });
```

### ID Type Mismatches
```typescript
// Fix Frame ID conflicts:
// error TS2345: Argument of type 'Id<"Frame">' is not assignable to parameter of type 'FrameId'

// Ensure consistent usage:
const frameId: FrameId = toFrameId(someStringId);
// Use FrameId everywhere, not Id<"Frame">
```

## Workflow

### Step 1: User Type Fixes (Most Critical)
```bash
# Check current User type issues
grep -n "User" shared/types/user.types.ts

# Find missing properties from errors
grep "Property.*does not exist.*User" server-build-errors.txt | cut -d"'" -f2 | sort -u
```

### Step 2: Logger Signature Fixes
```bash
# Find logger signature in core
grep -A5 -B5 "export.*logger" server/src/core/logger.ts

# Find problematic calls
grep -r "logger\." server/src/ --include="*.ts" | grep -v "// " | head -20
```

### Step 3: ID Type Consistency
```bash
# Find ID type conflicts
grep -r "Id<" shared/types/ server/src/ --include="*.ts" | grep -v "export"
grep -r "FrameId" shared/types/ server/src/ --include="*.ts"
```

## Testing Commands
```bash
# Test specific files after fixes
npx tsc --noEmit shared/types/user.types.ts
npx tsc --noEmit server/src/utils/dev-auth-startup.ts

# Check for specific error patterns
npx tsc -p server/tsconfig.build.json 2>&1 | grep "Property.*does not exist" | wc -l
npx tsc -p server/tsconfig.build.json 2>&1 | grep "Expected.*arguments" | wc -l
```

## Success Criteria
- [ ] User type has all required properties
- [ ] No recursive type references
- [ ] Logger calls have correct signatures
- [ ] ID types are consistently branded
- [ ] All `Property does not exist` errors fixed
- [ ] All argument count mismatches fixed

## Commit Strategy
```bash
# Commit by logical type groups
git add shared/types/user.types.ts
git commit -m "fix(types): add missing properties to User interface"

git add shared/types/ids.ts
git commit -m "fix(types): standardize ID branding system"

git add server/src/utils/
git commit -m "fix(types): correct logger call signatures in utils"
```

## Rules
- ✅ Fix types in shared/types first, then update usage
- ✅ Use single source of truth for all types
- ✅ Check logger signature before fixing calls
- ✅ Maintain consistent ID branding
- ❌ Don't create local type extensions
- ❌ Don't use any or unknown as shortcuts
- ❌ Don't modify core type interfaces without understanding impact

**Mission: Establish rock-solid type safety foundation!**