```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the DegenTalk codebase.

## 🚨 CRITICAL - READ FIRST

### Database Operations
1. **NEVER run `pnpm db:push`** - It will hang forever with Neon. Use `pnpm db:push:force` or direct SQL scripts.
2. **Always use DIRECT_DATABASE_URL** for schema operations (migrations, introspection).
3. **Regular DATABASE_URL uses pooler** - Only for app runtime, NOT schema changes.

### Code Quality Gates (Enforced by Hooks)
1. **Repository Pattern is LAW** - DB queries ONLY in `*.repository.ts` files
2. **Event-Driven Architecture** - Cross-domain communication ONLY via EventBus
3. **Branded IDs Required** - Use `isValidId()`, NEVER numeric comparisons
4. **No Console Logging** - Use `logger.*`, NEVER `console.*`
5. **Import Boundaries** - Client ↔ Server imports are BLOCKED

### File System Lockdown
1. **NO NEW FILES** without explicit approval (see File Creation Rules)
2. **Import aliases are STANDARDIZED** - Old patterns like `@app/` are BANNED
3. **Test files have strict locations** - See Test File Conventions

## 📋 Quick Reference Card

```bash
# Development
pnpm dev                    # Start both client (5173) and server (5001)
pnpm dev:seed              # Start with seeded data (admin: cryptoadmin)
pnpm dev:client            # Client only
pnpm dev:server            # Server only

# Database (USE WITH CAUTION)
pnpm db:migrate            # Run migrations (uses DIRECT_DATABASE_URL)
pnpm db:push:force         # Force push schema (bypasses prompts)
pnpm db:studio             # Open Drizzle Studio
pnpm db:sync:forums        # Sync forum config to database

# Code Quality
pnpm typecheck             # Check TypeScript (MUST be clean)
pnpm lint                  # Lint all workspaces
pnpm validate:boundaries   # Check import boundaries
pnpm test                  # Run all tests

# Emergency Escape Hatches
SKIP_HOOKS=1 git commit    # Bypass hooks (EMERGENCY ONLY)
VERBOSE_LOGS=true pnpm dev # Enable all logging
```

## 🏗️ Architecture Overview

### Workspace Structure
```
degentalk/
├── client/          # React/Vite frontend (port 5173)
│   └── src/         # Use @/ imports here
├── server/          # Express backend (port 5001)
│   └── src/
│       ├── core/    # Use @core/ imports
│       ├── domains/ # Use @domains/ imports
│       └── lib/     # Use @lib/ imports
├── db/              # Database schemas & migrations
├── shared/          # Shared types & utilities (use @shared/)
└── scripts/         # Tooling & maintenance scripts
```

### Import Alias Rules (ZERO TOLERANCE)

#### Client (`@/` prefix ONLY)
```typescript
// ✅ CORRECT
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { ForumCard } from '@/features/forum/components/ForumCard';

// ❌ BANNED
import { Button } from '@app/components/ui/button';  // Old pattern
import { Button } from '../../../components/ui/button';  // Relative paths
```

#### Server (NO `@/` - use explicit domains)
```typescript
// ✅ CORRECT
import { logger } from '@core/logger';
import { userService } from '@domains/users/user.service';
import { authenticate } from '@middleware/auth';
import { isDevMode } from '@utils/environment';
import { reportError } from '@lib/report-error';

// ❌ BANNED
import { logger } from '@/core/logger';  // Never use @/ in server
import { userService } from '@server/domains/users/user.service';  // Deprecated
```

#### Shared (Available everywhere)
```typescript
// ✅ CORRECT - Note the .js extension!
import type { User } from '@shared/types/user.types';
import { toUserId } from '@shared/utils/id-conversions';
import { economy } from '@shared/config/economy.config';

// In shared files, use .js extension for relative imports
import { toId } from './ids.js';  // NOT './ids'
```

## 🎯 Domain-Driven Design Rules

### Each Domain MUST Have
```
domains/[domain]/
├── index.ts              # Public API exports ONLY
├── *.controller.ts       # HTTP endpoints
├── *.service.ts          # Business logic (NO DB!)
├── *.repository.ts       # ALL database operations
├── *.transformer.ts      # Response shaping
├── *.routes.ts          # Route definitions
├── *.validation.ts      # Zod schemas
└── types/               # Domain-specific types
```

### Repository Pattern Example
```typescript
// ❌ WRONG - Direct DB in service
export class UserService {
  async getUser(id: UserId) {
    return await db.select().from(users).where(eq(users.id, id));
  }
}

// ✅ CORRECT - Repository pattern
export class UserService {
  constructor(private userRepo: UserRepository) {}
  
  async getUser(id: UserId) {
    return await this.userRepo.findById(id);
  }
}
```

### Event-Driven Communication
```typescript
// ❌ WRONG - Direct cross-domain import
import { walletService } from '@domains/wallet/wallet.service';
await walletService.creditUser(userId, amount);

// ✅ CORRECT - Event-driven
eventBus.emit(WalletEvents.CREDIT_USER, { userId, amount });
```

## 🔒 Type System - SINGLE SOURCE OF TRUTH

### All Types Come From @shared/types
```typescript
// ✅ THE ONLY WAY
import type { User } from '@shared/types/user.types';
import type { Thread } from '@shared/types/thread.types';
import type { Post } from '@shared/types/post.types';
import type { Forum } from '@shared/types/forum-core.types';
import type { UserId, ThreadId, PostId } from '@shared/types/ids';
import type { ApiResponse, ApiSuccess, ApiError } from '@shared/types/api.types';

// ❌ INSTANT REJECTION
interface User { ... }           // NEVER create local User types
type MyPost = { ... }           // NEVER create local Post types
import { CanonicalUser } from '...';  // DELETED - use User
import { StandardApiResponse } from '...';  // DELETED - use ApiResponse
```

### Branded IDs Are Mandatory
```typescript
// ❌ WRONG
function getUser(id: string) {
  if (id.length > 0) { ... }  // String checks
  if (parseInt(id) > 0) { ... }  // Numeric checks
}

// ✅ CORRECT
function getUser(id: UserId) {
  if (!isValidId(id)) {
    throw new Error('Invalid user ID');
  }
}
```

## 📁 File Creation Whitelisting

### Default: LOCKDOWN MODE
1. **NO new files** - Use existing components/patterns
2. **Need a new file?** Ask first with justification
3. **Auto-approved patterns:**
   - Stub files for missing imports
   - Test files in proper locations
   - Migration scripts
   - Config files (if missing)

### Request Template
```
I need to create: [path/to/file.ts]
Reason: [specific technical requirement]
Alternatives considered: [why existing files won't work]
```

## 🗄️ Database Operations

### Neon Connection Strategy
```bash
# .env structure
DATABASE_URL=postgresql://...@host-pooler.neon.tech/db  # App runtime (pooled)
DIRECT_DATABASE_URL=postgresql://...@host.neon.tech/db   # Schema ops (direct)
```

### Migration Workflow
```bash
# 1. Schema change in db/schema/*.ts
# 2. Generate migration
cd db && pnpm drizzle-kit generate

# 3. Review SQL
cat migrations/postgres/0XXX_*.sql

# 4. Apply (uses DIRECT_DATABASE_URL automatically)
pnpm db:migrate

# 5. For data migrations
tsx scripts/migrations/your-migration.ts
```

### Quick Schema Updates (Dev Only)
```typescript
// scripts/quick-schema-update.ts
import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DIRECT_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

await client.connect();
await client.query(`
  ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS new_field VARCHAR(255)
`);
await client.end();
```

## 🚦 Logging System

### Development Logging
```bash
# Normal (auto-suppresses noise)
pnpm dev

# Debug specific issue
VERBOSE_LOGS=true pnpm dev

# Runtime control (in server console)
loggerControl.showOnly('AUTH', 'ERROR');
loggerControl.suppress('WebSocket');
loggerControl.setMinLevel('WARN');
loggerControl.reset();
```

### Logging Best Practices
```typescript
// ✅ GOOD - Structured, consistent
logger.info('AUTH', 'User logged in', { userId, ip });
logger.error('PAYMENT', 'Transaction failed', { orderId, error });

// ❌ BAD - Unstructured, console
console.log('user logged in');
console.error(error);
```

## 🧪 Test File Conventions

### Proper Test Locations
```
client/src/__tests__/           # Client unit tests
├── components/                 # Component tests
├── features/                   # Feature tests
└── utils/                      # Utility tests

server/src/domains/*/
├── __tests__/                  # Domain unit tests
└── *.test.ts                   # Alongside source

tests/e2e/                      # End-to-end tests
└── *.spec.ts                   # Playwright specs
```

### ❌ BANNED Test Locations
- `client/src/test/` (old pattern)
- `client/src/components/test/` (old pattern)
- Random directories without `__tests__`

## 🚀 SSH Development Tips

### tmux Session Management
```bash
# Attach to existing
tmux attach -t degentalk

# Window layout
# 0: Dev servers (pnpm dev)
# 1: Database ops
# 2: Testing/typecheck
# 3: Git/scripts
```

### Hot Reload Works
- Vite (client) - Instant HMR
- Nodemon (server) - Auto-restart on changes
- No manual restarts needed

## ⚠️ Common Pitfalls & Solutions

| Issue | Wrong Way | Right Way |
|-------|-----------|-----------|
| Import boundaries | `import from '@/components'` in server | Use domain imports |
| Database access | Direct DB calls in services | Use repositories |
| Forum config | Edit database directly | Edit config → sync |
| User types | Use CanonicalUser | Use User from @shared |
| ID validation | `if (id > 0)` | `if (isValidId(id))` |
| Cross-domain | Direct service imports | Use EventBus |
| New files | Create without asking | Request approval first |

## 📊 Performance Considerations

### TypeScript Performance
- 1,400+ TypeScript errors in schema files are EXPECTED (Drizzle ORM patterns)
- Focus on non-schema errors only
- Use `pnpm typecheck 2>&1 | grep -v "db/schema"` to filter

### Database Performance
- Neon pooler has 300s timeout
- Schema operations can take 60s+ on 179 tables
- Always use DIRECT_DATABASE_URL for migrations

## 🔐 Security Reminders

1. **Never commit .env files**
2. **Use branded IDs to prevent injection**
3. **Validate all inputs with Zod**
4. **Transform responses with transformers**
5. **Check permissions in controllers**

## 📚 Additional Resources

- Architecture decisions: `/docs/architecture/`
- API documentation: Self-documenting via TypeScript
- Logging guide: `/docs/LOGGING.md`
- Migration examples: `/scripts/migrations/`

---

**Remember**: When in doubt, check existing patterns. The codebase has examples for almost everything you need to do.
```