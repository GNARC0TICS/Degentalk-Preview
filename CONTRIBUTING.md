# Contributing to Degentalk

## 🚨 Shared-Boundary Rules (CRITICAL)

### The Golden Rule: **Never Cross the Streams**

```
client/     ←→  shared/     ←→  server/
   ↑              ↑              ↑
   │              │              │
   └── Vite ──────┼────── NEVER ─┘
   └── React ─────┼────── NEVER ─┘
   └── @tanstack ─┼────── NEVER ─┘
```

### ❌ **NEVER DO THIS**

```ts
// ❌ DON'T: Import frontend tooling into backend
import { aliases } from '../../../vite.config';
import { QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

// ❌ DON'T: Import backend database into frontend
import { db } from '@db';
import { storage } from '../server/storage';

// ❌ DON'T: Import Vite plugins anywhere in server/
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
```

### ✅ **DO THIS INSTEAD**

```ts
// ✅ DO: Use shared configs for both sides
import { paths } from '@shared/path-config';
import { API_ENDPOINTS } from '@shared/constants';

// ✅ DO: Keep frontend tools in client/ only
// client/src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

// ✅ DO: Keep database tools in server/ only
// server/src/core/db.ts
import { db } from '@db';
```

## 🔧 Import Path Guidelines

### Path Alias Rules

| Alias       | Can Import From          | Cannot Import From                 |
| ----------- | ------------------------ | ---------------------------------- |
| `@shared/*` | `shared/` only           | `client/`, `server/`, `config/`    |
| `@server/*` | `server/`, `shared/`     | `client/`, `config/vite.config.ts` |
| `@/`        | `client/src/`, `shared/` | `server/`, backend configs         |
| `@db`       | `server/` only           | `client/`, `shared/`               |
| `@schema`   | `server/`, `shared/`     | `client/` (use API types instead)  |

### File Organization Rules

```
✅ CORRECT STRUCTURE:
shared/
  ├── types.ts           # API interfaces, common types
  ├── constants.ts       # Shared constants
  ├── validators.ts      # Zod schemas
  └── path-config.ts     # Path aliases (NO Vite deps)

❌ WRONG STRUCTURE:
shared/
  ├── vite-helpers.ts    # 🚨 NO! Vite belongs in config/
  ├── react-utils.ts     # 🚨 NO! React belongs in client/
  └── db-utils.ts        # 🚨 NO! Database belongs in server/
```

## 🔗 API Request & Networking Guidelines

### Unified Request Helper

🚫 **Do NOT** call `fetch()` directly anywhere in `client/`. All HTTP
requests **must** go through the typed helper found in

```ts
// client/src/lib/api-request.ts
apiRequest<T>(config);
```

This ensures:

1.  Automatic credential handling (`credentials: 'include'`)
2.  Consistent error wrapping (`{ status, data, message }`)
3.  XP-gain detection / toast hooks

If you need custom behaviour (e.g. file uploads), extend the helper **once**
and reuse it—never bypass it.

### Server-Side Calls

`apiRequest` is **frontend-only**. Backend code should call service-layer
functions or external SDKs directly, never importing the client helper.

## 🧩 Canonical Type Guidelines

The forum domain is now fully canonicalised. Follow these rules:

| Domain  | Use This          | Avoid                                            |
| ------- | ----------------- | ------------------------------------------------ |
| Threads | `CanonicalThread` | `ThreadWithUser`, `ThreadWithPostsAndUser`, etc. |
| Posts   | `CanonicalPost`   | `PostWithUser`                                   |
| Zones   | `ResolvedZone`    | ad-hoc `{ id,name,slug }` objects                |

Legacy interfaces in `db/types/forum.types.ts` are kept **only** as temporary
aliases with `/** @deprecated */` tags. New code **must not** import them.

## 🛡️ Pre-Commit Validation

**ALWAYS run this before committing:**

```bash
npm run validate-everything
```

This checks:

- ✅ Import boundaries are respected
- ✅ TypeScript compiles without errors
- ✅ No Vite config leaks into server/
- ✅ All path aliases resolve correctly

### Prettier formatting hook

Our pre-commit Git hook automatically runs `npm run format` (Prettier) and restages any modified files. This guarantees consistent code style on every commit.

• To run the formatter manually:

```bash
npm run format   # prettier --write .
```

• To bypass the hook temporarily (avoid on shared branches):

```bash
git commit --no-verify
```

## 🚨 Emergency Recovery

If you accidentally break imports:

```bash
# 1. Run the import validator
npm run check-imports

# 2. Fix automatically where possible
npm run check-imports --fix

# 3. Test backend startup
npm run dev:server

# 4. Test frontend startup
npm run dev:client
```

## 📋 Code Review Checklist

Before approving any PR:

- [ ] No `client/` imports in `server/` files
- [ ] No `server/` imports in `client/` files
- [ ] No Vite config imports in backend code
- [ ] All new files follow path alias conventions
- [ ] `npm run validate-everything` passes

---

## 💀 Hall of Shame (Learn From These)

### The Vite Config Incident

```ts
// server/some-file.ts
import config from '../config/vite.config'; // 💀 KILLED THE BACKEND
```

**Why it broke:** Vite config has top-level `await` that only works in ESM frontend context.

### The Schema Export Massacre

```ts
// shared/types.ts
import { CustomEmoji } from '@schema'; // 💀 Schema not exported properly
```

**Why it broke:** Schema files weren't exporting their types correctly.

---

## 🗄️ Database Migration Guidelines

### Creating Migrations

**For Development:**

```bash
# Generate migration from schema changes
npm run db:migrate

# Apply to development database
npm run db:migrate:apply
```

**For Production:**

```bash
# Use the safe migration template
npm run migration:template your_migration_name

# Output will be a template following all safety rules
```

### Migration Safety Rules

#### ✅ **Safe Operations** (Allowed in Production)

- `ALTER TABLE ADD COLUMN` with defaults
- `CREATE INDEX CONCURRENTLY`
- `INSERT ... ON CONFLICT DO NOTHING`
- Configuration value updates
- Adding new tables

#### ❌ **Destructive Operations** (Blocked in Production)

- `DROP TABLE` or `DROP COLUMN`
- `DELETE FROM` or `TRUNCATE`
- `ALTER COLUMN TYPE` (data loss risk)
- Removing NOT NULL without default
- Any operation that could fail on existing data

### Production Migration Workflow

1. **Name your migration with `_safe.sql` suffix**

   ```
   20240101120000_add_user_preferences_safe.sql
   ```

2. **Include required metadata**

   ```sql
   -- Description: Add user preferences table
   -- Created: 2024-01-01T12:00:00Z
   -- Type: SAFE (No destructive operations)
   -- Rollback: See instructions below
   ```

3. **Validate before commit**

   ```bash
   npm run migration:validate prod
   ```

4. **Push to staging first**
   - Migrations auto-deploy to staging
   - Monitor for issues
   - Then promote to production

### Neon Sync Agent

For real-time development synchronization:

```bash
# Start the sync agent
npm run spawn -- --task neon-sync-agent --env dev --watch

# Monitors:
# - db/schema/ (schema changes)
# - server/src/domains/ (domain logic)
# - env.local (configuration)
```

See `NEON-SYNC.md` for complete documentation.

---

**Remember:** When in doubt, keep it separate. Frontend is frontend, backend is backend, and shared is truly shared (no tooling dependencies).
