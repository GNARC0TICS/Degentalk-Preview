# DegenTalk Infrastructure Fixes

## Core Issues & Solutions

### 1. Module Resolution Hell - Scripts Can't Use @db, @core Aliases

**Problem**: Scripts in `/scripts` directory can't use path aliases like `@db`, `@core`, etc.

**Root Cause**: 
- Scripts are outside the server/client workspaces
- `tsconfig-paths` doesn't resolve aliases correctly for scripts
- Each workspace has its own tsconfig with different paths

**Solution**:

#### Option A: Use tsx with tsconfig-paths (Current Approach)
```json
// scripts/tsconfig.json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@db": ["../db"],
      "@db/*": ["../db/*"],
      "@schema": ["../db/schema"],
      "@schema/*": ["../db/schema/*"],
      "@shared/*": ["../shared/*"],
      "@server/*": ["../server/*"]
    }
  }
}
```

Run scripts with:
```bash
tsx -r tsconfig-paths/register scripts/my-script.ts
```

#### Option B: Create a Scripts Workspace (Recommended)
```json
// scripts/package.json
{
  "name": "@degentalk/scripts",
  "type": "module",
  "dependencies": {
    "@degentalk/db": "workspace:*",
    "@degentalk/shared": "workspace:*"
  }
}
```

### 2. ESM/CJS Conflicts

**Problem**: Mix of CommonJS and ES modules causing import errors

**Root Cause**:
- Root package.json has `"type": "module"`
- Some dependencies expect CommonJS
- Dynamic imports and require() conflicts

**Solution**:

#### Standardize on ESM:
```json
// All package.json files should have:
{
  "type": "module"
}
```

#### For CJS dependencies:
```javascript
// Use createRequire for CommonJS modules
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const cjsModule = require('some-cjs-module');
```

#### Fix import extensions:
```typescript
// Always include .js extension for local imports in ESM
import { something } from './file.js';  // NOT './file'
```

### 3. Neon Connection Pooling Timeouts

**Problem**: Schema operations timeout on pooled connections

**Root Cause**:
- Neon's pooler has aggressive timeouts
- Drizzle introspection is slow on large schemas
- Interactive prompts block execution

**Solution**:

#### Dual Connection Strategy:
```typescript
// .env
DATABASE_URL=postgresql://user:pass@host-pooler.neon.tech/db  # App usage
DIRECT_DATABASE_URL=postgresql://user:pass@host.neon.tech/db   # Migrations

// db/index.ts
export const db = /* pooled connection for app */
export const getDirectDb = async () => /* direct connection for migrations */
```

#### Migration Commands:
```json
// package.json
{
  "scripts": {
    "db:push": "echo 'Use db:push:force instead'",
    "db:push:force": "drizzle-kit push --force",
    "db:migrate:gen": "drizzle-kit generate",
    "db:migrate:run": "tsx scripts/run-migrations.ts"
  }
}
```

#### Direct SQL for Quick Changes:
```typescript
// scripts/apply-schema-changes.ts
import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DIRECT_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

await client.connect();
await client.query('ALTER TABLE ...');
await client.end();
```

### 4. Complex Import Paths

**Problem**: Server code expects specific import patterns

**Root Cause**:
- Different workspaces have different import conventions
- Path aliases not consistently configured
- Relative imports break when moving files

**Solution**:

#### Standardized Import Rules:

**Client (@/):**
```typescript
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import type { User } from '@shared/types/user.types';
```

**Server (explicit paths):**
```typescript
import { logger } from '@core/logger';
import { userService } from '@domains/users/user.service';
import { authenticate } from '@middleware/auth';
import type { User } from '@shared/types/user.types';
```

**Database:**
```typescript
import { users, posts } from '@schema';
import { db } from '@db';
```

**Scripts (use full paths or configure tsconfig):**
```typescript
// Option 1: Relative paths
import { db } from '../db/index.js';

// Option 2: Configure tsconfig-paths
import { db } from '@db';
```

## Implementation Checklist

### Phase 1: Fix Module Resolution
- [ ] Create scripts/tsconfig.json with proper paths
- [ ] Update all script imports to use consistent patterns
- [ ] Add tsx command aliases to package.json

### Phase 2: Resolve ESM/CJS
- [ ] Audit all package.json files for "type": "module"
- [ ] Fix all local imports to include .js extension
- [ ] Update build tools configuration

### Phase 3: Database Connections
- [ ] Ensure DIRECT_DATABASE_URL is set in .env
- [ ] Update all migration scripts to use direct connection
- [ ] Document force push workflow

### Phase 4: Import Standardization
- [ ] Create import convention documentation
- [ ] Update ESLint rules to enforce patterns
- [ ] Refactor non-compliant imports

## Quick Reference

### Running Scripts
```bash
# With proper module resolution
tsx -r tsconfig-paths/register scripts/my-script.ts

# Direct execution (if imports are fixed)
tsx scripts/my-script.ts
```

### Database Operations
```bash
# Schema changes (use force)
pnpm db:push:force

# Generate migration
cd db && pnpm drizzle-kit generate

# Run migrations
pnpm db:migrate:apply

# Direct SQL changes
tsx scripts/apply-schema-changes.ts
```

### Import Cheatsheet
```typescript
// ✅ Client
import { Component } from '@/components/Component';

// ✅ Server  
import { service } from '@domains/feature/service';

// ✅ Shared (everywhere)
import type { Type } from '@shared/types/type';

// ✅ Database
import { table } from '@schema';

// ❌ Wrong
import { Component } from '../../../components/Component';
import { service } from '@app/domains/feature/service';
```

## Tools & Utilities

### Check Import Issues
```bash
# Find problematic imports
grep -r "from '\.\." --include="*.ts" --include="*.tsx"

# Find missing extensions
grep -r "from '\./[^']*[^s]'" --include="*.ts"
```

### Fix Common Issues
```bash
# Add .js extensions to imports
find . -name "*.ts" -exec sed -i "s/from '\.\//from '.\/\.js/g" {} \;

# Convert require to import
find . -name "*.ts" -exec sed -i "s/const .* = require/import/g" {} \;
```

## Future Improvements

1. **Monorepo Tool**: Consider migrating to Turborepo or Nx
2. **Build System**: Unified build with proper module resolution
3. **Type Generation**: Auto-generate types from database schema
4. **Import Plugin**: Custom ESLint plugin for import rules
5. **Migration Tool**: GUI for database migrations

## Emergency Fixes

If stuck with module resolution:
```bash
# Nuclear option - clear all caches
rm -rf node_modules .pnpm-store
pnpm install

# Reset TypeScript caches
rm -rf dist build *.tsbuildinfo

# Check for circular dependencies
pnpm dlx madge --circular src
```