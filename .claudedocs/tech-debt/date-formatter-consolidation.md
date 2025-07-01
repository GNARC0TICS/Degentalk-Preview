# Date Formatter Consolidation - Tech Debt

**Status**: Identified during monorepo migration cleanup  
**Priority**: Low  
**Effort**: 2-4 hours  

## Issue

Inline `formatTimeAgo` implementations found in multiple files instead of using the centralized `format-date.ts` utility.

## Files with Inline Date Formatters

1. **`client/src/features/forum/components/HotThreads.tsx:86`**
   ```typescript
   const formatTimeAgo = (dateString: string) => {
     // Custom implementation using date-fns
   }
   ```

2. **`client/src/components/ui/content-feed.tsx:73`**
   ```typescript
   const formatTimeAgo = (dateString: string) => {
     // Similar custom implementation
   }
   ```

## Canonical Solution

**`client/src/lib/format-date.ts`** already provides:
- `formatTimeAgo(date: string | Date)` - Exact replacement needed
- `formatDate(date, { relative: true })` - Alternative approach
- 6 total date formatting functions with consistent API

## Migration Task

1. **Import centralized formatter:**
   ```typescript
   import { formatTimeAgo } from '@/lib/format-date';
   ```

2. **Remove inline implementations**
3. **Replace function calls** (no signature changes needed)
4. **Test UI consistency** across affected components

## Benefits

- ✅ Eliminates ~20 lines of duplicate code
- ✅ Consistent date formatting across platform
- ✅ Single place to modify date logic
- ✅ Better date-fns integration

## Risk Assessment

**Low Risk**: 
- Existing centralized function has identical signature
- No breaking changes to component APIs
- Visual output should be identical

---
*Identified: 2025-01-07 during monorepo migration*  
*Next: Schedule during next refactoring sprint*