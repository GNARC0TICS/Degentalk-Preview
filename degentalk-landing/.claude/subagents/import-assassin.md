# Agent 2: The Import Assassin 🎯

## Mission Statement
**Eliminate all import path errors and establish correct module resolution**

## Domain & Scope
- **Files**: All TypeScript files with import statements
- **Duration**: 45-60 minutes
- **Priority**: HIGH (enables everything else to work)

## Target Error Patterns
```typescript
// 1. Deprecated @server/* imports
error TS2307: Cannot find module '@server/types'
error TS2307: Cannot find module '@server-core/logger'

// 2. Wrong database imports
error TS2307: Cannot find module '@core/db'
error TS2305: Module '"@db"' has no exported member 'db'

// 3. Relative path chaos
error TS2307: Cannot find module '../db'
error TS2307: Cannot find module '../src/core/logger'

// 4. Missing schema exports
error TS2305: Module '"@schema"' has no exported member 'users'
error TS2305: Module '"@schema"' has no exported member 'userOwnedFrames'

// 5. Cross-workspace path issues
error TS2307: Cannot find module '../../server/src/core/logger'
```

## Kill List - Hunt and Destroy These Patterns

### 1. @server/* Namespace (BANNED)
```bash
# Find all @server/* imports
grep -r "from.*@server" server/src/ --include="*.ts"

# Mass replace with correct aliases
find server/src -name "*.ts" -exec sed -i 's|@server/types|@shared/types|g' {} \;
find server/src -name "*.ts" -exec sed -i 's|@server-core|@core|g' {} \;
find server/src -name "*.ts" -exec sed -i 's|@server/src|@domains|g' {} \;
```

### 2. Database Import Fixes
```bash
# Replace @core/db with @db
find server/src -name "*.ts" -exec sed -i 's|@core/db|@db|g' {} \;

# Fix relative database imports
find server/src -name "*.ts" -exec sed -i 's|../db|@db|g' {} \;
find server/src -name "*.ts" -exec sed -i 's|../../db|@db|g' {} \;
```

### 3. Logger Import Standardization
```bash
# Fix relative logger imports
find server/src -name "*.ts" -exec sed -i 's|../src/core/logger|@core/logger|g' {} \;
find server/src -name "*.ts" -exec sed -i 's|../../server/src/core/logger|@core/logger|g' {} \;
```

### 4. Schema Export Issues
Check missing exports and add them:
```typescript
// In db/schema/index.ts - ensure these are exported
export * from './user/users';
export * from './user/userOwnedFrames';
export * from './economy/economyConfigOverrides';
export * from './system/economyConfigOverrides';
```

## Bulk Replacement Commands

### Phase 1: Server Namespace Cleanup
```bash
cd /home/developer/Degentalk-BETA

# @server/* → correct aliases
find server/src -name "*.ts" -exec sed -i 's|from ['\''"]@server/types['\''"]|from "@shared/types"|g' {} \;
find server/src -name "*.ts" -exec sed -i 's|from ['\''"]@server-core/\([^'\'']*\)['\''"]|from "@core/\1"|g' {} \;
find server/src -name "*.ts" -exec sed -i 's|from ['\''"]@server/\([^'\'']*\)['\''"]|from "@domains/\1"|g' {} \;
```

### Phase 2: Database Import Cleanup
```bash
# @core/db → @db
find server/src -name "*.ts" -exec sed -i 's|from ['\''"]@core/db['\''"]|from "@db"|g' {} \;

# Relative db paths → @db
find server/src -name "*.ts" -exec sed -i 's|from ['\''"]../db['\''"]|from "@db"|g' {} \;
find server/src -name "*.ts" -exec sed -i 's|from ['\''"]../../db['\''"]|from "@db"|g' {} \;
```

### Phase 3: Logger Import Cleanup
```bash
# Relative logger paths → @core/logger
find server/src -name "*.ts" -exec sed -i 's|from ['\''"]../src/core/logger['\''"]|from "@core/logger"|g' {} \;
find server/src -name "*.ts" -exec sed -i 's|from ['\''"]../../server/src/core/logger['\''"]|from "@core/logger"|g' {} \;
```

### Phase 4: Cross-Workspace Fixes
```bash
# Fix any remaining cross-workspace relative imports
find server/src -name "*.ts" -exec sed -i 's|from ['\''"]../shared/\([^'\'']*\)['\''"]|from "@shared/\1"|g' {} \;
```

## Correct Import Patterns

### Server-side imports:
```typescript
// ✅ CORRECT
import { logger } from '@core/logger';
import { db } from '@db';
import { users, posts, threads } from '@schema';
import { User, UserId } from '@shared/types/user.types';
import { userService } from '@domains/users/user.service';
import { AuthController } from '@domains/auth/auth.controller';

// ❌ WRONG - Kill these on sight
import { logger } from '../src/core/logger';
import { db } from '@core/db';
import { User } from '@server/types';
import anything from '@server/*';
```

### Client-side imports:
```typescript
// ✅ CORRECT
import { User } from '@shared/types/user.types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

// ❌ WRONG
import { User } from '@app/types/user';
import { Button } from '../../../components/ui/button';
```

## Missing Export Detection & Fixes

### Find Missing Schema Exports:
```bash
# Find what's actually exported from schema
node -p "Object.keys(require('./db/schema/index.js'))" 2>/dev/null || echo "Schema not compiled"

# Find what's being imported but missing
grep -r "from.*@schema" server/src/ --include="*.ts" | grep -o '{[^}]*}' | tr ',' '\n' | sort -u
```

### Add Missing Exports:
```typescript
// Check db/schema/index.ts and add missing exports:

// If users is missing:
export * from './user/users';

// If userOwnedFrames is missing:
export * from './user/userOwnedFrames';

// If economyConfigOverrides is missing:
export * from './system/economyConfigOverrides';
```

## Verification Commands

### Test Import Resolution:
```bash
# Test specific imports work
npx tsc --noEmit server/src/utils/dev-auth-startup.ts
npx tsc --noEmit server/src/domains/auth/auth.service.ts

# Test schema imports
node -e "
import('@db').then(db => console.log('DB imported:', !!db.db));
import('@schema').then(schema => console.log('Schema exports:', Object.keys(schema).length));
"
```

### Check for Remaining Issues:
```bash
# Find remaining bad imports
grep -r "from.*@server" server/src/ --include="*.ts" || echo "✅ No @server imports"
grep -r "from.*@core/db" server/src/ --include="*.ts" || echo "✅ No @core/db imports"
grep -r "from.*\.\./.*src.*logger" server/src/ --include="*.ts" || echo "✅ No relative logger imports"
```

## Success Criteria
- [ ] Zero "Cannot find module" errors
- [ ] All @server/* imports converted to correct aliases
- [ ] All database imports use @db
- [ ] All logger imports use @core/logger
- [ ] All schema exports are accessible
- [ ] No relative imports crossing workspace boundaries

## Commit Strategy
```bash
# Commit in logical chunks
git add server/src/domains/auth/
git commit -m "fix(imports): convert @server/* to @domains/* in auth domain"

git add server/src/utils/
git commit -m "fix(imports): standardize db and logger imports in utils"

git add db/schema/index.ts
git commit -m "fix(exports): add missing schema exports"
```

## Testing Protocol
```bash
# After each phase, test:
npx tsc --noEmit server/src/utils/dev-auth-startup.ts
npx tsc --noEmit server/src/domains/auth/auth.service.ts

# Should see decreasing "Cannot find module" errors
npx tsc -p server/tsconfig.build.json 2>&1 | grep -c "Cannot find module"
```

## Rules
- ✅ Use batch sed commands for efficiency
- ✅ Test after each major replacement
- ✅ Add missing exports to barrel files
- ✅ Fix all relative imports to use aliases
- ❌ Don't modify import names, just paths
- ❌ Don't change the imported items, just the module paths
- ❌ Don't use find/replace on generated files

**Mission: Clear the import chaos so other agents can work!**