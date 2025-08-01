# CRITICAL PATTERN: Branded ID Helper Exports

## Critical Rule
**ALWAYS export branded ID helpers (toUserId, toThreadId, etc.) from `@shared/types/index.ts`**

## Pattern Details
1. ID helper functions are defined in `shared/utils/id.ts`
2. They MUST be re-exported from `shared/types/index.ts` 
3. Client code imports from `@shared/types` NOT `@shared/utils/id`

## Why This Matters
- Client code expects ID helpers from `@shared/types`
- Direct imports from `@shared/utils/id` cause TypeScript errors
- This pattern maintains consistent import paths across the codebase

## Example Fix
```typescript
// In shared/types/index.ts
export {
  toUserId,
  toThreadId,
  toPostId,
  toForumId,
  toStructureId,
  toZoneId,
  // ... all other ID helpers
} from '../utils/id';
```

## Date Documented
2025-01-20

## Context
During TypeScript error resolution, discovered that client code was failing because ID helpers weren't exported from the expected location. This is a critical pattern that must be followed consistently.