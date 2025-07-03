# UUID-First Architecture Cheat Sheet

This guide ensures all developers follow the UUID-first patterns implemented throughout the DegenTalk codebase.

## Core Principles

### 1. Primary Key Pattern
Every table uses UUID primary keys:
```typescript
// ✅ Correct
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  // ...
});

// ❌ Wrong
export const users = pgTable('users', {
  id: serial('id').primaryKey(), // No integer PKs
  // ...
});
```

### 2. Foreign Key Pattern
All FK columns reference UUIDs with proper declarations:
```typescript
// ✅ Correct
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  threadId: uuid('thread_id').references(() => threads.id, { onDelete: 'cascade' }),
  // ...
});
```

### 3. Branded Type Usage
All IDs use branded types for type safety:
```typescript
// ✅ Correct
import type { UserId, ThreadId, PostId } from '@db/types';

function getUserPosts(userId: UserId, threadId?: ThreadId): Promise<PostId[]> {
  // Type-safe UUID handling
}

// ❌ Wrong
function getUserPosts(userId: string, threadId?: string): Promise<string[]> {
  // Raw strings - no type safety
}
```

## Route Validation

### Zod Schemas
Use UUID validation for all ID parameters:
```typescript
// ✅ Correct
const schema = z.object({
  userId: z.string().uuid(),
  threadId: z.string().uuid().optional(),
  postIds: z.array(z.string().uuid())
});

// ❌ Wrong
const schema = z.object({
  userId: z.number().int().positive(), // No integer validation
  threadId: z.string(), // No UUID validation
});
```

### Route Parameters
Always validate UUID format:
```typescript
// ✅ Correct
import { parseUserId, validateUUIDParam } from '@shared/utils/id-validation';

router.get('/users/:id', validateUUIDParam('id'), (req, res) => {
  const userId = parseUserId(req.params.id);
  // Safe to use - guaranteed to be valid UUID
});

// ❌ Wrong
router.get('/users/:id', (req, res) => {
  const userId = Number(req.params.id); // No integer parsing!
  const userId2 = parseInt(req.params.id); // No integer parsing!
});
```

## Database Queries

### Drizzle Relations
Use generated relations for type-safe joins:
```typescript
// ✅ Correct
import { usersRelations } from '@schema/user/users.relations';

const userWithPosts = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    posts: true // Type-safe relation
  }
});

// ❌ Wrong
const userWithPosts = await db
  .select()
  .from(users)
  .leftJoin(posts, eq(users.id, posts.userId)) // Manual joins when relations exist
  .where(eq(users.id, Number(userId))); // No Number() casting!
```

### Index Usage
All FK columns have corresponding indices:
```typescript
// Indices are automatically added for:
// - All FK columns (idx_posts_userId, idx_posts_threadId)
// - Composite indices for common query patterns
// - GIN indices for full-text search on UUID arrays
```

## Test Patterns

### Mock Data
Use UUID utilities in tests:
```typescript
// ✅ Correct
import { mockUserId, mockThreadId, TEST_UUIDS } from '@shared/test-utils/mock-uuid';

const mockUser = {
  id: mockUserId(),
  username: 'testuser',
  // ...
};

// For predictable tests
const adminUser = {
  id: TEST_UUIDS.ADMIN_USER,
  // ...
};

// ❌ Wrong
const mockUser = {
  id: 1, // No integer IDs
  id: 'some-hardcoded-string', // Use proper UUID format
};
```

### Test Validation
```typescript
// ✅ Correct
import { expectValidUUID, isTestUUID } from '@shared/test-utils/mock-uuid';

test('should return valid user ID', () => {
  const result = createUser(userData);
  expectValidUUID(result.id);
  expect(isTestUUID(result.id)).toBe(true);
});
```

## Seed Scripts

### UUID Generation
Always use proper UUID generation:
```typescript
// ✅ Correct
import { randomUUID } from 'crypto';

await db.insert(users).values({
  id: randomUUID(),
  username: 'seeduser',
  // ...
});

// ❌ Wrong
await db.insert(users).values({
  id: 1, // No integer IDs
  // ...
});
```

## Migration Safety

### Schema Changes
When adding new tables or columns:
```typescript
// ✅ Correct - New table
export const newTable = pgTable('new_table', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  // ...
});

// ✅ Correct - New FK column
await db.schema.alterTable('existing_table').addColumn(
  'user_id',
  'uuid',
  (col) => col.references('users.id').onDelete('cascade')
);
```

## Common Mistakes to Avoid

### ❌ Integer Casting
```typescript
// Wrong
const userId = Number(req.params.id);
const userId = parseInt(req.params.id);
if (isNaN(userId)) return res.status(400);
```

### ❌ Integer Validation
```typescript
// Wrong
const schema = z.object({
  userId: z.number().int().positive()
});
```

### ❌ Raw String Types
```typescript
// Wrong
function getUser(id: string): Promise<User> {
  // No type safety
}
```

### ❌ Manual Type Checking
```typescript
// Wrong
if (typeof id === 'number' || /^\d+$/.test(id)) {
  // Suggests integer ID usage
}
```

## Quick Reference

### Essential Imports
```typescript
// Types
import type { UserId, ThreadId, PostId } from '@db/types';

// Validation
import { isValidUUID, parseUserId } from '@shared/utils/id-validation';

// Testing
import { mockUuid, TEST_UUIDS } from '@shared/test-utils/mock-uuid';

// Generation
import { randomUUID } from 'crypto';
```

### ESLint Protection
The `degen/no-number-id` rule prevents:
- `Number(userId)` and `parseInt(userId)` patterns
- `z.number()` validation for ID fields
- Integer literals in ID object properties
- Missing UUID validation in route parameters

### CI/CD Validation
```bash
# Run UUID pattern validation
pnpm run lint:ids

# Scan for remaining integer ID patterns  
node --import tsx scripts/migration/scan-non-uuid-columns.ts

# Validate schema consistency
pnpm run validate:uuid-migration
```

## Support

- **ESLint Rule**: `degen/no-number-id` catches violations automatically
- **Runtime Guards**: `isValidUUID()`, `parseUserId()` provide safe parsing
- **Test Utilities**: `mockUuid()`, `TEST_UUIDS` for consistent test data
- **Migration Tools**: Automated scanners in `scripts/migration/`

The UUID-first architecture ensures type safety, prevents ID confusion, and provides a consistent foundation for scaling the platform.