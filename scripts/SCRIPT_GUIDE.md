# Scripts Guide

## Running Scripts

### With Import Aliases (Recommended)
```bash
# TSX automatically uses tsconfig.json paths
pnpm tsx scripts/my-script.ts

# If that fails, use tsconfig-paths explicitly
pnpm tsx -r tsconfig-paths/register scripts/my-script.ts
```

### Available Import Aliases in Scripts

```typescript
// Database
import { db } from '@db';
import { users, titles, posts } from '@schema';

// Shared types
import type { User } from '@shared/types/user.types';
import type { Title } from '@shared/types/entities/title.types';

// Server code (if needed)
import { logger } from '@core/logger';
import { userService } from '@domains/users/user.service';
```

## Common Script Patterns

### Database Query Script
```typescript
#!/usr/bin/env tsx
import { db } from '@db';
import { users } from '@schema';
import { eq } from 'drizzle-orm';

async function main() {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.username, 'cryptoadmin'))
    .limit(1);
    
  console.log('User:', user[0]);
}

main().catch(console.error);
```

### Schema Migration Script
```typescript
#!/usr/bin/env tsx
import { getDirectDb } from '@db';

async function migrate() {
  const { db: directDb, client } = await getDirectDb();
  
  try {
    await client.query(`
      ALTER TABLE my_table 
      ADD COLUMN new_column VARCHAR(255)
    `);
    
    console.log('✅ Migration successful');
  } finally {
    await client.end();
  }
}

migrate().catch(console.error);
```

### Data Processing Script
```typescript
#!/usr/bin/env tsx
import { db } from '@db';
import { users, posts } from '@schema';
import type { User } from '@shared/types/user.types';

async function processUsers() {
  const allUsers = await db.select().from(users);
  
  for (const user of allUsers) {
    // Process each user
    console.log(`Processing ${user.username}...`);
  }
}

processUsers().catch(console.error);
```

## Troubleshooting

### Import Errors
```bash
# Error: Cannot find module '@db'
# Solution: Ensure you're running with tsx, not node
pnpm tsx scripts/my-script.ts  # ✅ Correct
node scripts/my-script.ts       # ❌ Wrong

# Error: MODULE_NOT_FOUND
# Solution: Check tsconfig.json paths are correct
cat scripts/tsconfig.json | grep -A 20 paths
```

### ESM Issues
```typescript
// Error: require() of ES modules is not supported
// Solution: Use import instead
import { something } from 'module';  // ✅
const something = require('module'); // ❌

// Error: Cannot use import statement outside a module
// Solution: Ensure package.json has "type": "module"
```

### Database Connection
```typescript
// Always use environment variables
import * as dotenv from 'dotenv';
dotenv.config();

// For schema changes, use direct connection
const { db, client } = await getDirectDb();
```

## Best Practices

1. **Always use TypeScript**: Scripts should be `.ts` files
2. **Include shebang**: `#!/usr/bin/env tsx` for executable scripts
3. **Handle errors**: Use try/catch and proper error messages
4. **Clean up connections**: Always close database connections
5. **Use transactions**: For multi-step operations
6. **Add comments**: Explain what the script does

## Useful Scripts

- `test-imports.ts` - Verify import aliases work
- `apply-titles-schema-direct.ts` - Direct schema changes
- `verify-title-schema.ts` - Check database state
- `migrations/consolidate-titles.ts` - Data migrations

## Environment Variables

Scripts automatically load from `.env`:
- `DATABASE_URL` - Pooled connection (app usage)
- `DIRECT_DATABASE_URL` - Direct connection (migrations)