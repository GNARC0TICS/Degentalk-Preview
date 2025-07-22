# DegenTalk Type Utilities Guide

This guide covers the type utilities and patterns used throughout the DegenTalk codebase.

## ID Conversions

DegenTalk uses branded ID types for type safety. When you need to convert between ID types, use the proper conversion utilities:

### Converting to ContentId

```typescript
import { postIdToContentId, threadIdToContentId } from '@shared/utils/id-conversions';

// For reporting a post
const contentId = postIdToContentId(post.id);

// For reporting a thread
const contentId = threadIdToContentId(thread.id);

// Generic conversion with validation
import { toContentId } from '@shared/utils/id-conversions';
const contentId = toContentId(someId, 'post'); // or 'thread', 'message'
```

### Why not use type casting?

```typescript
// ❌ Bad - defeats TypeScript safety
const contentId = post.id as any as ContentId;

// ✅ Good - validates and provides clear errors
const contentId = postIdToContentId(post.id);
```

## Table Column Definitions

When defining columns for admin tables, use the `ColumnDefs` type alias:

```typescript
import { type ColumnDefs } from '@/features/admin/components/common';

// Clean, readable column definitions
const columns: ColumnDefs<AdminUser> = [
  {
    key: 'username',
    header: 'Username',
    render: (user) => <Link to={`/users/${user.id}`}>{user.username}</Link>
  },
  // ... more columns
];

// Instead of the verbose alternative:
// const columns: AdminDataTableProps<AdminUser>['columns'] = [...]
```

## Shared Type Locations

All shared types should be centralized in the `shared` package:

### Entity Types
- **Location**: `@shared/types/entities/*`
- **Examples**: 
  - `CloutAchievement` - `@shared/types/entities/clout.types`
  - `Role` - `@shared/types/entities/role.types`
  - `Title` - `@shared/types/entities/title.types`

### ID Types
- **Location**: `@shared/types/ids`
- **Usage**: All branded ID types (UserId, PostId, ThreadId, etc.)

### Never Import Types From:
- ❌ Page modules (`@/pages/admin/clout`)
- ❌ Database schema (`@db/types`)
- ❌ Server-only modules

## Type Migration Patterns

### Moving Types to Shared

1. Create the type in `shared/types/entities/<domain>.types.ts`
2. Export from `shared/types/entities/index.ts`
3. Update imports to use the shared location
4. Add backward compatibility exports if needed

Example:
```typescript
// In page file (for backward compatibility only)
export type { CloutAchievement } from '@shared/types/entities/clout.types';
```

### Form Field Renames

When renaming form fields (e.g., `color` → `textColor`):

1. Update the type definition
2. Update form state initialization
3. Update form field bindings
4. Audit submit handlers and API calls
5. Check CSS classes and inline styles

## How to Add a New Conversion

When adding a new ID conversion utility:

1. **Create the conversion function** in `shared/utils/id-conversions.ts`:
```typescript
export function messageIdToContentId(messageId: MessageId): ContentId {
  if (!messageId) {
    throw new Error('MessageId is required but was not provided');
  }
  
  if (!isValidId(messageId)) {
    throw new Error(`Invalid MessageId format: "${messageId}". Expected a valid UUID.`);
  }
  
  return messageId as unknown as ContentId;
}
```

2. **Add comprehensive tests** in `shared/utils/__tests__/id-conversions.test.ts`:
```typescript
describe('messageIdToContentId', () => {
  it('should convert valid MessageId to ContentId', () => {
    const messageId = toId<'MessageId'>(validUuid);
    const contentId = messageIdToContentId(messageId);
    expect(contentId).toBe(messageId);
  });

  it('should throw error for invalid MessageId', () => {
    expect(() => messageIdToContentId(null as any)).toThrow('MessageId is required');
    expect(() => messageIdToContentId('invalid' as MessageId)).toThrow('Invalid MessageId format');
  });
});
```

3. **Export from package.json** if needed:
```json
"./utils/id-conversions": "./utils/id-conversions.ts"
```

## Available Shared Types

### ID Types (`@shared/types/ids`)
- `UserId`, `PostId`, `ThreadId`, `MessageId`, `ContentId`
- `ForumId`, `ZoneId`, `CategoryId`, `StructureId`
- `WalletId`, `TransactionId`, `OrderId`
- `AchievementId`, `BadgeId`, `TitleId`, `FrameId`
- `RoleId`, `PermissionId`, `GroupId`

### Entity Types (`@shared/types/entities`)
- **Clout System**: `CloutAchievement`, `UserCloutAchievement`, `CloutSettings`
- **Role System**: `Role`, `RoleFormData`, `RoleWithUsers`
- **User System**: `User`, `CanonicalUser`, `UserSummary`
- **Title System**: `Title`, `TitleFormData`, `UserTitle`

## Best Practices

1. **Always validate IDs** before conversion
2. **Use type guards** for runtime checks
3. **Export types from barrel files** for cleaner imports
4. **Document breaking changes** in migration guides
5. **Add tests** for all conversion utilities
6. **Use descriptive error messages** that help debugging

## Quick Reference

```typescript
// ID Conversions
import { 
  postIdToContentId, 
  threadIdToContentId, 
  dictionaryEntryIdToEntryId,
  toContentId 
} from '@shared/utils/id-conversions';

// Table Types
import { type ColumnDefs } from '@/features/admin/components/common';

// Entity Types
import { type CloutAchievement, type Role, type Title } from '@shared/types/entities';

// ID Types
import { type UserId, type PostId, type ThreadId } from '@shared/types/ids';
```