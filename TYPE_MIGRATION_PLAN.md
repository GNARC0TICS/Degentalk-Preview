# Type System Migration Plan

## Current State: Duplicate Type Systems

### 1. API Response Types (27 usages)
- **OLD**: `StandardApiResponse<T>` in `client/src/types/canonical.types.d.ts`
- **NEW**: `ApiResponse<T>` in `shared/types/api.types.ts`

### 2. Paginated Response Types (Multiple definitions!)
- `client/src/types/canonical.types.d.ts` - PaginatedResponse
- `client/src/types/core.types.ts` - PaginatedResponse  
- `client/src/utils/api/achievements.ts` - PaginatedResponse
- `client/src/features/admin/services/sticker-api.service.ts` - PaginatedResponse
- **CORRECT**: Should use shared types

### 3. Canonical Types (8 interfaces)
- CanonicalUser → Use `User` from `@shared/types/user.types.ts`
- CanonicalFeaturedForum → Use types from `@shared/types/forum-core.types.ts`
- CanonicalForum → Use types from `@shared/types/forum-core.types.ts`
- CanonicalSubforum → Use types from `@shared/types/forum-core.types.ts`
- CanonicalPost → Use `Post` from `@shared/types/post.types.ts`
- CanonicalTag → Check if exists in shared
- CanonicalPostCreateParams → Check if exists in shared

## Migration Steps

### Phase 1: API Response Types (High Priority)
1. Update `api-response.ts` to import from `@shared/types/api.types.ts`
2. Replace `isStandardApiResponse` → `isApiSuccess` 
3. Update all 7 files using StandardApiResponse
4. Add deprecation notice to canonical types

### Phase 2: Consolidate PaginatedResponse
1. Check if shared has PaginatedResponse
2. If not, add to `shared/types/api.types.ts`
3. Remove all duplicate definitions
4. Update all imports

### Phase 3: Canonical Types
1. Map each Canonical type to its shared equivalent
2. Add deprecation notices
3. Update imports gradually
4. Eventually delete canonical.types.d.ts

## Files to Update

### Immediate (API Response):
- [x] client/src/utils/api-request.ts (already started)
- [ ] client/src/utils/api-response.ts
- [ ] client/src/schemas/shared/response.schema.ts
- [ ] client/src/types/core.types.ts
- [ ] client/src/types/gamification.types.ts

### Deprecation Notices:
- [ ] client/src/types/canonical.types.d.ts - Add @deprecated to all exports

### Documentation:
- [ ] CLAUDE.md - Add type import guidelines
- [ ] Create MIGRATION_GUIDE.md for other devs

## Type Import Guidelines (for CLAUDE.md)

```typescript
// ✅ CORRECT - Use shared types
import type { User } from '@shared/types/user.types';
import type { Thread } from '@shared/types/thread.types';
import type { ApiResponse } from '@shared/types/api.types';

// ❌ WRONG - Don't use client-only types
import type { CanonicalUser } from '@/types/canonical.types';
import type { StandardApiResponse } from '@/types/canonical.types';

// ❌ WRONG - Don't duplicate types
interface PaginatedResponse<T> { ... } // DON'T define locally
```

## Success Metrics
- Zero imports from canonical.types.d.ts
- Single definition for each type
- All types imported from @shared/types
- No local redefinitions of shared types