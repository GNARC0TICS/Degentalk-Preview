# Import Guide for DegenTalk Server

## Quick Reference

### Common Imports

```typescript
// Response utilities
import { sendSuccessResponse, sendErrorResponse } from '@server/core/utils';

// Logger
import { logger } from '@server/core/logger';

// Database
import { db } from '@server/core/db';
import { eq, and, or } from 'drizzle-orm';

// Types
import type { UserId, ThreadId, PostId } from '@shared/types/ids';

// Auth utilities
import { getAuthenticatedUser } from '@server/utils/request-user';
import { isAuthenticated, isAdmin } from '@server/domains/auth/middleware/auth.middleware';
```

### Import Path Aliases

| Alias | Maps To | Usage |
|-------|---------|-------|
| `@server/*` | `server/src/*` | Server code |
| `@core/*` | `server/src/core/*` | Core utilities |
| `@shared/*` | `shared/*` | Shared types/utils |
| `@db` | `db/index.ts` | Database instance |
| `@schema` | `db/schema/index.ts` | Schema exports |

### Common Patterns

#### Creating API Routes
```typescript
import { Router, Request, Response } from 'express';
import { sendSuccessResponse, sendErrorResponse } from '@server/core/utils';
import { logger } from '@server/core/logger';
import { isAuthenticated } from '@server/domains/auth/middleware/auth.middleware';

const router = Router();

router.get('/example', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const data = await someOperation();
    sendSuccessResponse(res, data);
  } catch (error) {
    logger.error('Module', 'Operation failed', { error });
    sendErrorResponse(res, 'Error message', 500);
  }
});

export default router;
```

#### Working with Database
```typescript
import { db } from '@server/core/db';
import { eq, and } from 'drizzle-orm';
import { users, posts } from '@schema';
import type { UserId } from '@shared/types/ids';

// Query example
const userPosts = await db
  .select()
  .from(posts)
  .where(eq(posts.userId, userId as UserId));
```

### Troubleshooting

**Can't find an import?**
1. Check `@server/core/utils/index.ts` for common utilities
2. Use grep: `grep -r "export.*functionName" server/src`
3. Check tsconfig.json for path aliases

**Import not working?**
1. Verify the file exists
2. Check if it's exported (default vs named export)
3. Ensure path alias is correct in tsconfig.json