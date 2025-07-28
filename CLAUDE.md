# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL REMINDERS

1. **NEVER run `pnpm db:push`** - It will hang forever with Neon. Use `pnpm db:push:force` or direct SQL scripts instead.
2. **Scripts workspace exists at root** - Don't assume it's deleted if imports fail.
3. **Use migration workflow** for all database schema changes.
4. **TypeScript Hooks are ACTIVE** - Code quality checks run automatically. Use `SKIP_HOOKS=1 git commit` for emergencies.
5. **Repository Pattern is MANDATORY** - All DB queries MUST go through repositories, services MUST NOT contain direct DB calls.
6. **Event-Driven Architecture** - Cross-domain communication ONLY via EventBus, NO direct service imports between domains.
7. **Forum terminology** - Use "forum" not "zone". Legacy "zone" references are being phased out.
8. **CODEBASE IS LOCKED DOWN** - NO new files without explicit approval (see File Creation Whitelisting below).
9. **IMPORT ALIASES ARE STANDARDIZED** - Use ONLY approved import aliases (see Import Alias Rules). Old patterns like `@app/` are BANNED.
10. **DATABASE MIGRATIONS** - Must use DIRECT_DATABASE_URL for schema operations. Regular DATABASE_URL uses pooler which times out.

## File Creation Whitelisting Process

The codebase is on LOCKDOWN during refactoring/hardening phase:

1. **Default**: NO new files - use existing components/files only
2. **Exception Request**: If you absolutely need a new file:
   - Ask: "I need to create [filename] because [specific reason]"
   - Explain why existing files won't work
   - Wait for case-by-case approval
3. **Auto-Approved Patterns**:
   - Stub files for missing imports (to unblock development)
   - Critical config files if missing
   - Test files for new features

## Essential Commands

```bash
# Development
pnpm dev                    # Start both client (5173) and server (5001)
pnpm dev:seed              # Start with seeded data (admin user: cryptoadmin)
pnpm dev:client            # Client only
pnpm dev:server            # Server only

# Database
pnpm db:migrate            # Run migrations (NOT db:push!)
pnpm db:push:force         # Force push schema changes (bypasses prompts)
pnpm db:studio             # Open Drizzle Studio
pnpm db:sync:forums        # Sync forum config to database

# Testing & Validation
pnpm typecheck             # Check TypeScript across all workspaces
pnpm lint                  # Lint all workspaces
pnpm validate:boundaries   # Check import boundaries
pnpm test                  # Run all tests

# Seeding
pnpm seed:all              # Seed all data
pnpm seed:enhanced:dev     # Enhanced dev environment with wallet data
```

## Architecture Overview

### Workspace Structure
```
degentalk/
├── client/          # React/Vite frontend (port 5173)
├── server/          # Express backend (port 5001)
├── db/              # Database schemas & migrations
├── shared/          # Shared types & utilities
└── scripts/         # Tooling & maintenance scripts
```

### Import Alias Rules (STRICTLY ENFORCED)
**Client imports:**
- ✅ Use `@/` for all client imports: `import { Button } from '@/components/ui/button'`
- ❌ NEVER use `@app/` (deprecated)
- ❌ NEVER use relative imports except for same-directory files

**Server imports (NO @/ - use explicit paths):**
- ✅ Use `@core/` for core utilities: `import { logger } from '@core/logger'`
- ✅ Use `@domains/` for business logic: `import { userService } from '@domains/users/user.service'`
- ✅ Use `@middleware/` for middleware: `import { authenticate } from '@middleware/auth'`
- ✅ Use `@utils/` for utilities: `import { isDevMode } from '@utils/environment'`
- ✅ Use `@lib/` for lib code: `import { reportError } from '@lib/report-error'`
- ❌ NEVER use `@/` in server code (ambiguous)
- ❌ NEVER use `@api/`, `@server/`, `@server-core/` (all deprecated)

**Shared imports:**
- ✅ Use `@shared/` from any workspace: `import type { UserId } from '@shared/types/ids'`
- ✅ Add `.js` extension in shared files: `import { toId } from './ids.js'`

**Database imports:**
- ✅ Use `@db` for schema: `import { users } from '@db'`
- ✅ Use `@schema` for schema: `import { users } from '@schema'`

**Scripts imports:**
- ✅ Use `@db/` for database: `import { db } from '@db'`
- ✅ Use `@shared/` for shared types: `import { UserId } from '@shared/types/ids'`
- ✅ Use `@server/` for server code: `import { logger } from '@server/src/core/logger'`
- ❌ NEVER use relative paths to reach outside scripts directory

### Domain-Driven Backend (`server/src/domains/`)
Each domain follows strict patterns:
- `*.service.ts` - Business logic (NO database calls)
- `*.repository.ts` - ALL database operations
- `*.controller.ts` - HTTP endpoints
- `*.transformer.ts` - Response shaping
- `index.ts` - Public API exports ONLY

### Forum System Architecture
- **Config-as-Truth**: Forum hierarchy defined in `shared/config/forum-map.config.ts`
- **Sync Pattern**: Config → Database via `pnpm db:sync:forums`
- **Structure**: Featured Forums → Forums → Sub-forums
- **IDs**: Using branded types (ForumId, ThreadId, etc.)

### User Model
- **User from @shared/types/user.types** is the single source of truth
- Always use `useAuth()` hook, never `useCanonicalAuth()`
- CanonicalUser is deprecated and being phased out
- Transform at boundaries: DB → User → API

## TypeScript Hooks System

Automated code quality enforcement:
- Branded ID usage (`isValidId()` not `> 0`)
- Console logging (`logger.*` not `console.*`)
- Import validation (no direct `@db` imports in services)
- Type safety (no `any` except CCPayment API)

Check a file: `node tools/claude-hooks/run-checks.cjs --file <path>`

## Key Technical Decisions

### PostgreSQL with Drizzle ORM
- Neon-hosted PostgreSQL
- Drizzle for type-safe queries
- Repository pattern for data access

### Branded IDs
All IDs use branded types for compile-time safety:
```typescript
type ThreadId = Id<'Thread'>;
const id = toThreadId('123');
```

### Event-Driven Cross-Domain Communication
Domains communicate via EventBus, not direct imports:
```typescript
// Emit an event
eventBus.emit(ForumEvents.THREAD_CREATED, { threadId, forumId, userId });

// Listen for events
eventBus.on(ForumEvents.THREAD_CREATED, async (data) => {
  // Handle the event
  await notificationService.notifySubscribers(data.forumId, data.threadId);
});
```

### Forum Terminology Migration
- "Zone" → "Forum" (ongoing migration)
- Featured Forums = highlighted forum categories
- Forum Structure = hierarchical forum organization

## SSH Development Workflow

When working over SSH:
1. Use tmux for persistent sessions: `tmux attach -t degentalk`
2. Window layout:
   - Window 0: Dev servers
   - Window 1: Database operations
   - Window 2: Testing/type checking
   - Window 3: Git/scripts
3. Hot-reload is automatic (Vite + nodemon)

## Logging System

### Quick Start
```bash
# Normal dev mode (auto-suppresses noisy logs)
pnpm dev

# Verbose logging for debugging
VERBOSE_LOGS=true pnpm dev
```

### Runtime Log Control (Dev Mode)
Access `loggerControl` in the server console:
```javascript
// Show only specific categories
loggerControl.showOnly('AUTH', 'ERROR', 'DATABASE');

// Suppress additional categories
loggerControl.suppress('WebSocket', 'Cache');

// Change minimum log level
loggerControl.setMinLevel('WARN');

// Reset to defaults
loggerControl.reset();
```

### Auto-Suppressed Categories in Dev
- WebSocket connections/disconnections
- Rate limiting status messages
- Cache hit/miss logs
- Environment loading details
- Scheduled task completions
- Dev authentication queries

### Best Practices
1. Use consistent namespaces: `logger.info('MyFeature', 'message')`
2. Include structured data: `logger.error('API', 'Request failed', { userId, error })`
3. Use appropriate levels: DEBUG < INFO < WARN < ERROR < CRITICAL
4. Add new suppressions to `server/src/core/logger-config.ts`

See `docs/LOGGING.md` for complete documentation.

## Type System Rules - ZERO TOLERANCE POLICY

### 🚨 MANDATORY: All Types Come From @shared/types
**This is the ONLY source of truth for all business types. No exceptions.**

```typescript
// ✅ CORRECT - The ONLY way to import types
import type { User } from '@shared/types/user.types';
import type { Thread } from '@shared/types/thread.types';
import type { Post } from '@shared/types/post.types';
import type { Forum } from '@shared/types/forum-core.types';
import type { ApiResponse, ApiSuccess, ApiError } from '@shared/types/api.types';
import type { UserId, ThreadId, PostId } from '@shared/types/ids';
```

### ❌ BANNED: Legacy/Local Type Definitions
```typescript
// NEVER create local versions of shared types
interface User { ... }  // BANNED - use @shared/types/user.types
type Post = { ... }     // BANNED - use @shared/types/post.types

// NEVER import from deprecated locations
import { CanonicalUser } from '@/types/canonical.types';  // DELETED
import { PostWithUser } from '@/types/compat/...';        // DELETED
import { StandardApiResponse } from '...';                // DELETED

// NEVER create "compatibility" or "canonical" types
export type MyCanonicalType = ...  // BANNED
export type CompatUser = User       // BANNED - use User directly
```

### 📋 Type Import Checklist
1. **Need a user type?** → `import type { User } from '@shared/types/user.types'`
2. **Need a thread type?** → `import type { Thread } from '@shared/types/thread.types'`
3. **Need an ID type?** → `import type { UserId, ThreadId } from '@shared/types/ids'`
4. **Type doesn't exist in shared?** → It probably does, check thoroughly
5. **Really doesn't exist?** → Add it to shared/types, never create local versions

### 🎯 API Response Patterns
```typescript
// Use shared API types
import type { ApiResponse } from '@shared/types/api.types';
import { extractApiData } from '@/utils/api-response';

// For endpoints returning extra data beyond base types
interface ProfileResponse {
  user: User;           // Core type from shared
  nextLevelXp: number;  // Extra computed field
  badges: Badge[];      // Related data
}
```

### ⚠️ Zero Tolerance Violations
Creating any of these will fail code review:
- Local type definitions that duplicate shared types
- "Canonical" or "Compat" type names
- Type aliases that just rename shared types
- Import from `/types/canonical.types` or `/types/compat/`

## Common Pitfalls

1. **Import Boundaries**: Client can't import server, server can't import client
2. **Database Access**: Only in repositories, never in services
3. **Forum Config**: Edit `forum-map.config.ts` then sync, don't modify DB directly
4. **User Types**: Use User from @shared/types, not CanonicalUser
5. **ID Comparisons**: Use `isValidId()`, not numeric comparisons
6. **API Types**: Use ApiResponse from @shared/types, not StandardApiResponse

## Database Migration Best Practices

### Migration Types & When to Use

1. **Schema Migrations** (Drizzle)
   - For: Table structure changes, new columns, constraints
   - Command: `export DATABASE_URL="..." && pnpm db:migrate`
   - Location: Auto-generated in `db/migrations/postgres/`

2. **Data Migrations** (Custom Scripts)
   - For: Bulk data updates, transformations, backfills
   - Location: `server/src/domains/*/migrations/` or `scripts/migrations/`
   - Run: `tsx path/to/migration.ts`

3. **Config-to-DB Migrations** (One-time)
   - For: Moving static config to database (like theme migration)
   - Example: `server/src/domains/themes/migrations/consolidate-themes.ts`

### Migration Workflow

```bash
# 1. Make schema changes in db/schema/*.ts
# 2. Generate migration
cd db && pnpm drizzle-kit generate

# 3. Review generated migration
cat migrations/postgres/0XXX_*.sql

# 4. Apply migration
export DATABASE_URL="..." && pnpm db:migrate

# 5. For data migrations
tsx server/src/domains/[domain]/migrations/[migration].ts
```

### Important Notes
- **Always backup** before running migrations in production
- **Test locally** first with a development database
- **Never use db:push** - it bypasses migrations and hangs with Neon
- **Check for duplicates** in schema files before generating migrations

## Neon Database Migration Workflow - CRITICAL

### The Problem
Neon uses connection pooling by default. When Drizzle tries to introspect the schema (especially with 179+ tables), it hangs indefinitely because:
1. The pooler has connection timeouts
2. Drizzle's schema introspection is very slow on large databases
3. Interactive prompts block automated workflows

### The Solution
Use DIRECT_DATABASE_URL (without pooler) for all schema operations:

```bash
# In .env file, you should have:
DATABASE_URL=postgresql://user:pass@host-pooler.neon.tech/db  # For app (pooled)
DIRECT_DATABASE_URL=postgresql://user:pass@host.neon.tech/db   # For migrations (direct)
```

### Recommended Approaches

#### Option 1: Force Push (Quick)
```bash
pnpm db:push:force  # Uses --force flag to skip prompts
```

#### Option 2: Direct SQL Script (Fastest)
```typescript
// scripts/apply-schema-changes.ts
import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DIRECT_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

await client.connect();
await client.query('ALTER TABLE titles ADD COLUMN IF NOT EXISTS ...');
await client.end();
```

#### Option 3: Generate Migration (Safest)
```bash
# Generate migration file
cd db && pnpm drizzle-kit generate

# Apply using direct connection
pnpm db:migrate:apply
```

### What NOT to Do
- ❌ Never use `pnpm db:push` without --force
- ❌ Never use pooled connections for schema changes
- ❌ Never wait for Drizzle to "pull schema" on 179 tables

## Test File Conventions

Tests MUST be placed in proper directories (enforced by hooks):

### Client Tests
- Location: `client/src/__tests__/`
- Structure mirrors source: `__tests__/components/`, `__tests__/features/`, etc.
- Import pattern: Use `@app/*` aliases
- Test files: `*.test.tsx` or `*.spec.tsx`

### Server Tests  
- Location: Either `server/src/**/__tests__/` OR `*.test.ts` alongside source files
- Import pattern: Use relative imports
- Test files: `*.test.ts` or `*.spec.ts`

### E2E Tests
- Location: `tests/e2e/`
- Uses Playwright fixtures

### ❌ NEVER create tests in:
- `client/src/test/` (old location)
- `client/src/components/test/` (old location)
- Random directories without `__tests__`

## Troubleshooting

### Common Issues
1. **Missing imports** → Create stub file to unblock development
2. **Port 5001 conflict** → Kill existing process: `lsof -ti:5001 | xargs kill -9`
3. **DB connection failed** → Check DATABASE_URL in .env
4. **TypeScript errors** → Run `pnpm typecheck` to see all issues
5. **API routes** → Self-documented via TypeScript types - see `/api/*` routes

## Environment Setup
- **Node.js**: 20+ required
- **Package Manager**: pnpm (install via `npm install -g pnpm`)
- **Environment**: Copy `.env.example` to `.env` and configure

## Layout Rules

Pages should NOT import SiteHeader/SiteFooter - RootLayout provides them:
```tsx
// ✅ CORRECT
export default function Page() {
  return <Container className="py-8">Content</Container>;
}

// ❌ WRONG
export default function Page() {
  return (
    <div>
      <SiteHeader />
      <main>Content</main>
      <SiteFooter />
    </div>
  );
}
```