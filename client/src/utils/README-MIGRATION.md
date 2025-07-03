# Utility Migration Guide

## CONSOLIDATED UTILITIES

### QueryClient
- **`lib/queryClient.ts`** - XP-aware API wrapper (USE THIS)
- **`core/queryClient.ts`** - Base HTTP utilities (internal only)

### Date Formatting  
- **`lib/format-date.ts`** - Canonical date formatting
- Remove: `lib/utils/format-date.ts`, `core/utils/formatters.ts`

### Slug Generation
- **`shared/utils/slug.ts`** - Canonical slug helper
- Remove: `lib/utils/generateSlug.ts`

### API Routes
- **`shared/constants/routes.ts`** - Canonical route constants  
- Remove: `constants/apiRoutes.ts`, `constants/routes.ts`

## USAGE

```typescript
// CORRECT
import { apiRequest } from '@/lib/queryClient';
import { formatDate } from '@/lib/format-date';
import { generateSlug } from '@shared/utils/slug';

// DEPRECATED - DO NOT USE
import { apiRequest } from '@/core/queryClient'; // ❌
import { formatDate } from '@/lib/utils/format-date'; // ❌
```