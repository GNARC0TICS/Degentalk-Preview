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

**Remember:** When in doubt, keep it separate. Frontend is frontend, backend is backend, and shared is truly shared (no tooling dependencies).
