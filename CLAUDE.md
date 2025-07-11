# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workspace Details

- Uses **pnpm workspace architecture** with strict boundaries: `client/`, `server/`, `db/`, `shared/`, `scripts/`
- **PostgreSQL only** with Drizzle ORM (SQLite support completely removed)
- **TypeScript strict mode** enabled across all workspaces
- **Domain-driven backend** architecture with composable components
- **Configuration-first** approach - everything configurable via `*.config.ts` files

## 🧠 MCP Tool Strategy

### Default MCPs (Always Available)
- **eslint** → Code linting and fixing
- **postgres** → Direct database queries and schema inspection
- **filesystem** → Project file operations
- **puppeteer** → Browser automation and UI testing
- **fetch** → External API integration
- **sequential-thinking** → Complex problem analysis
- **context7** → Up-to-date library documentation lookup

### Zen Tools (Explicit Usage Only)
**zen tools are BLOCKED by default**. Use only when:
- User says "think about this with another model"
- User requests "/zen:" commands explicitly  
- User asks for "collaborative analysis" or "consensus"

**Activation phrases:**
- "Use zen to..." → Enable specific zen tool
- "Think deeply about..." → Enable mcp__zen__thinkdeep
- "Get consensus on..." → Enable mcp__zen__consensus
- "Debug this systematically..." → Enable mcp__zen__debug

## 🚨 CRITICAL CURSOR RULES (Always Apply)

### 1. Schema Consistency (.cursor/rules/schema-consistency.mdc)
**MANDATORY**: All database operations must follow these patterns:
- Only use `pgTable()` (never `sqliteTable()`)
- Every field referenced in services MUST exist in `db/schema/`
- Explicit null handling: `.notNull()` or intentional nullable
- UUID primary keys: `uuid('id').primaryKey().defaultRandom()`
- JSONB for structured data, never JSON or TEXT columns

### 2. Branded ID Standard (.cursor/rules/branded-id-standard.mdc)
**MANDATORY**: Type-safe identifiers across entire codebase:
- Import IDs from `@shared/types/ids` ONLY (never `@db/types`)
- Use `UserId`, `ThreadId`, `ForumId`, etc. (never `string` or `number`)
- ESLint enforces: `degen/no-number-id: error`, `degen/no-missing-branded-id-import: error`
- All database IDs are UUIDs, no numeric IDs allowed

### 3. No Untyped Values (.cursor/rules/no-untyped-values.mdc)
**MANDATORY**: Zero tolerance for `any` types:
- Use `unknown` with type guards instead of `any`
- Zod schemas for all external data (JSON, APIs, forms)
- ESLint enforces: `@typescript-eslint/no-explicit-any: error`
- Use `import type` for all type-only imports

### 4. Response Transformers (.cursor/rules/response-transformers.mdc)
**MANDATORY**: All API responses use tiered transformers:
- Never return raw DB objects: `res.json(dbRow)` is FORBIDDEN
- Use `toPublicX()`, `toAuthenticatedX()`, `toAdminX()` functions
- All transformers in `server/src/domains/[domain]/transformers/`
- ESLint enforces: `degen/no-raw-response: error`

### 5. Request User Access (.cursor/rules/request-user-access.mdc)
**MANDATORY**: Never access `req.user` directly:
- Use `getAuthenticatedUser(req)` from `server/src/utils/request-user.ts`
- Pass `viewerUserId` to transformers, not full user objects
- ESLint enforces: `degen/no-direct-req-user: error`

### 6. Logging Standard (.cursor/rules/logging-standard.mdc)
**MANDATORY**: Structured logging only:
- Use `logger` from `server/src/core/logger.ts`, never `console.*`
- No PII in logs (use userIds, not emails/IPs)
- ESLint enforces: `no-console: error` (except in .dev/.test files)

## Core Development Commands

### Development
```bash
pnpm dev                    # Full stack (frontend:5173 + backend:5001)
pnpm dev:seed              # Full stack with database seeding
pnpm dev:quick             # Fast start without seeding
pnpm dev:client            # Frontend only
pnpm dev:server            # Backend only
```

### Database Operations
```bash
pnpm db:migrate            # Generate migrations from schema changes
pnpm db:migrate:apply      # Apply migrations to database
pnpm db:studio             # Open Drizzle Studio GUI
pnpm db:push               # Push schema directly (dev only)
pnpm db:drop               # Drop all tables
pnpm seed:all              # Complete database seeding
pnpm sync:forums           # Sync forumMap.config.ts to database
```

### Code Quality & Validation
```bash
pnpm lint                  # ESLint across all workspaces
pnpm typecheck             # TypeScript type checking
pnpm validate:boundaries   # Check workspace import boundaries
pnpm validate:dependencies # Validate dependency rules
pnpm test                  # Run all tests
pnpm test:e2e              # Playwright end-to-end tests
```

## 🏗️ Architecture Rules

### Configuration-First Architecture (.cursor/rules/config-first-architecture.mdc)
Everything must be configurable:
- Feature flags in `featureFlags.ts`
- Themes in `themes.config.ts`
- Business rules in `business-rules.config.ts`
- Layouts in `layouts.config.ts`
- Component registry in `widgets.config.ts`
- **Never hardcode values** - always use config files

### Composable Domain Architecture (.cursor/rules/composable-domain-architecture.mdc)
Build reusable, composable components:
- **Slot pattern**: Components accept `slots` prop for customization
- **Compound components**: `WalletDashboard.Balance`, `ForumCard.Actions`
- **Provider pattern**: Clean interfaces between domains
- **Domain boundaries**: Use strict interfaces, never tight coupling
- **Transformer gates**: All API responses through tiered transformers

### Forum Permission Enforcement (.cursor/rules/forum-permission-enforcement.mdc)
Forum access control patterns:
- Use `usePermission(forum)` hook from `client/src/hooks/usePermission.ts`
- Check `rules.minXpRequired` vs `user.xp`
- Evaluate `rules.accessLevel` against user role
- Add route guards for protected actions
- Show 🔒 icon and disable buttons when blocked

## 🔧 Import Patterns (.cursor/rules/import-patterns.mdc)

### Path Aliases
- `@/` → `client/src/` (client workspace)
- `@shared/` → `shared/` (cross-workspace shared code)
- `@config/` → `config/` (canonical configurations)

### Import/Export Rules
```typescript
// ✅ Default exports (components)
import ComponentName from '@/components/ui/component';

// ✅ Named exports (utilities, hooks)
import { utilityFunction, CONSTANT } from '@/lib/utils';

// ✅ Type-only imports (MANDATORY for types)
import type { Request, Response } from 'express';

// ❌ NEVER import across workspace boundaries
import { something } from '../../../server/src/...'; // FORBIDDEN

// ✅ Use shared types instead
import type { UserId } from '@shared/types/ids';
```

### Common Import Mistakes
1. Default exports imported as named: `import { Component }` → `import Component`
2. Named exports without braces: `import apiRequest` → `import { apiRequest }`
3. Missing type-only imports: `import { Type }` → `import type { Type }`
4. Cross-workspace imports without `@shared/`

## 📊 Database Patterns

### Schema Structure
```
db/schema/
├── admin/          # Admin-specific tables
├── economy/        # XP, DGT, transactions, levels
├── forum/          # Threads, posts, categories
├── user/           # Users, roles, permissions
├── wallet/         # CCPayment integration
├── messaging/      # Shoutbox, direct messages
└── shop/           # Digital marketplace
```

### Required Schema Pattern
```typescript
// ✅ Correct schema pattern
export const tableName = pgTable('table_name', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'), // Nullable by design
  userId: uuid('user_id').references(() => users.id).notNull(),
  data: jsonb('data').notNull().default('{}'), // JSONB with default
  createdAt: timestamp('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
```

### Service Query Safety
```typescript
// ✅ All fields exist in schema
const data = await db.select({
  id: table.id,
  name: table.name,          // ✅ Exists
  description: table.description, // ✅ Exists (nullable)
}).from(table);

// ❌ Will cause runtime errors
const data = await db.select({
  id: table.id,
  undefinedField: table.undefinedField, // ❌ Doesn't exist
}).from(table);
```

## 🔐 Authentication & Development

### Development User (Pre-seeded)
- **Username**: `cryptoadmin`
- **Password**: `password123`
- **Permissions**: Full admin with 99,999 XP and wallet balances
- **Usage**: Quick testing without manual registration

### Authentication Patterns
```typescript
// ✅ Backend: Get authenticated user
const user = getAuthenticatedUser(req);
if (!user) return res.status(401).json({ error: 'Unauthorized' });

// ✅ Frontend: Check authentication
const { user, isAuthenticated } = useAuth();
if (!isAuthenticated) return <LoginPrompt />;

// ✅ Role-based access
const { hasPermission } = usePermission(forum);
if (!hasPermission('post')) return <RequireUpgrade />;
```

## 🌐 API Architecture

### Domain Structure
```
server/src/domains/
├── admin/          # Administrative functions
├── auth/           # Authentication & authorization
├── forum/          # Forum system (threads, posts, categories)
├── wallet/         # CCPayment integration & DGT system
├── xp/             # Experience points & leveling
├── gamification/   # Achievements, missions, rewards
├── messaging/      # Shoutbox & direct messaging
└── shop/           # Digital marketplace & inventory
```

### Required API Pattern
```typescript
// ✅ Complete API endpoint pattern
router.post('/endpoint', [
  authenticate,                    // Auth middleware
  validateRequest(schema),         // Zod validation
  async (req: Request, res: Response) => {
    try {
      const user = getAuthenticatedUser(req); // ✅ Never req.user
      const data = await service.operation(user.id, req.body);
      const dto = toPublicData(data, user.id); // ✅ Always transform
      res.json(dto);
    } catch (error) {
      logger.error({ error, userId: user?.id }, 'Operation failed');
      res.status(500).json({ error: 'Internal server error' });
    }
  }
]);
```

### Key API Endpoints Reference
```bash
# Forum
GET    /api/forum/threads        # List threads
POST   /api/forum/threads        # Create thread
GET    /api/forum/structure      # Forum hierarchy

# Economy
GET    /api/wallet/balances      # DGT and crypto balances
POST   /api/wallet/transfer-dgt  # Transfer DGT between users
POST   /api/xp/award-action      # Award XP for actions

# Admin
GET    /api/admin/modules        # Admin module registry
GET    /api/admin/users          # User management
```

## 🧪 Testing Strategy

### Test Commands
```bash
pnpm test:unit              # Client unit tests (Vitest)
pnpm test                   # Full test suite
pnpm test:e2e               # Playwright browser tests
```

### Test Structure
- **Unit tests**: `__tests__/` directories
- **E2E tests**: `tests/e2e/`
- **Mocks**: `shared/test-utils/`
- **Factories**: Consistent test data generation

## 🚨 Critical Context Helpers (For Limited Context)

### Essential File Locations (Quick Reference)
```bash
# Core Configuration
client/src/config/featureFlags.ts          # Feature toggles
client/src/config/forumMap.config.ts       # Forum structure
shared/types/ids.ts                        # Branded ID types
server/src/core/logger.ts                  # Structured logger

# Authentication
server/src/utils/request-user.ts           # Get authenticated user
client/src/hooks/useAuth.tsx               # Auth state
client/src/hooks/usePermission.ts          # Permission checks

# Database
db/schema/                                 # All table definitions
server/src/domains/*/transformers/         # Response transformers
server/src/domains/*/services/             # Business logic

# API Patterns
server/src/domains/*/routes/               # Route definitions
server/src/domains/*/controllers/          # Request handlers
server/src/middleware/validate-request.ts  # Zod validation
```

### Common ESLint Errors & Fixes
```typescript
// ❌ degen/no-number-id: error
type UserId = number; 

// ✅ Fix: Use branded string ID
import type { UserId } from '@shared/types/ids';

// ❌ degen/no-direct-req-user: error
const userId = req.user.id;

// ✅ Fix: Use helper function
const user = getAuthenticatedUser(req);
const userId = user?.id;

// ❌ degen/no-raw-response: error
res.json(dbRow);

// ✅ Fix: Use transformer
const dto = toPublicThread(dbRow, viewerUserId);
res.json(dto);

// ❌ no-console: error
console.log('Debug info');

// ✅ Fix: Use structured logger
logger.info({ context: 'debug' }, 'Debug info');
```

### Database Query Patterns
```typescript
// ✅ Safe query with branded IDs
const threads = await db
  .select({
    id: threadsTable.id,
    title: threadsTable.title,
    authorId: threadsTable.authorId,
  })
  .from(threadsTable)
  .where(eq(threadsTable.forumId, forumId as ForumId));

// ✅ Handle nullable fields explicitly
const forums = results.map(row => ({
  ...row,
  description: row.description ?? null,
  pluginData: JSON.parse(row.pluginData || '{}'),
}));
```

### Component Patterns
```typescript
// ✅ Composable component with slots
interface ForumCardProps {
  forum: Forum;
  slots?: {
    header?: React.ReactNode;
    actions?: React.ReactNode;
  };
  variant?: 'compact' | 'detailed';
}

// ✅ Permission-aware component
const CreateThreadButton = ({ forumId }: { forumId: string }) => {
  const { canPost, reason } = usePermission(forum);
  
  if (!canPost) {
    return <Button disabled tooltip={reason}>Create Thread</Button>;
  }
  
  return <Button onClick={handleCreate}>Create Thread</Button>;
};
```

## ⚠️ Common Pitfalls (Context-Limited Development)

### 1. Import Resolution Issues
**Problem**: Not knowing the correct import path
**Solution**: Always check existing imports in similar files
```bash
# Find import patterns
grep -r "import.*ComponentName" client/src/
```

### 2. Schema Field Mismatches
**Problem**: Referencing non-existent database fields
**Solution**: Always check schema first
```bash
# Check field existence
grep -r "fieldName" db/schema/
```

### 3. Transformer Tier Confusion
**Problem**: Not knowing which transformer tier to use
**Solution**: 
- `toPublic*`: Anonymous users, search engines
- `toAuthenticated*`: Logged-in users (default)
- `toAdmin*`: Staff and moderators only

### 4. Permission Check Patterns
**Problem**: Not implementing proper access control
**Solution**: Always use `usePermission` hook for forum access

### 5. Configuration Hardcoding
**Problem**: Adding hardcoded values instead of using configs
**Solution**: Check for existing config files first
```bash
# Find config patterns
find . -name "*.config.ts" | head -10
```

## 🔄 Development Workflow

### Schema Changes
1. Update schema in `db/schema/[domain]/`
2. Generate migration: `pnpm db:migrate`
3. Apply locally: `pnpm db:migrate:apply`
4. Test with data: `pnpm seed:all`
5. Verify no field reference errors

### Feature Development
1. Add feature flag to `featureFlags.ts`
2. Create configuration in appropriate `*.config.ts`
3. Implement using domain-driven structure
4. Add transformers for API responses
5. Implement permission checks
6. Add tests and validate boundaries

### Debugging Workflow
1. **Import errors**: Check path aliases and export patterns
2. **Type errors**: Verify branded ID imports from `@shared/types/ids`
3. **Database errors**: Check schema field existence
4. **Permission errors**: Verify transformer tier and auth checks
5. **Build errors**: Run `pnpm validate:boundaries`

## 🏭 Production Considerations

### Build Process
```bash
pnpm build                 # Build client (server uses tsx runtime)
pnpm start                 # Production server start
```

### Environment Variables
```bash
# Essential variables in env.local
DATABASE_URL               # PostgreSQL connection
NODE_ENV                   # development/production
CCPAYMENT_APP_ID          # Crypto payment integration
CCPAYMENT_APP_SECRET      # Crypto payment secret
```

### Performance Notes
- Server uses **tsx** for runtime TypeScript compilation
- Frontend built with **Vite** for optimal bundling
- Database queries optimized with proper indexing
- Caching layers for frequently accessed data

## 🔧 Troubleshooting

### Port Conflicts
```bash
pnpm kill-ports           # Clear ports 5001 & 5173
```

### Database Issues
```bash
pnpm db:drop && pnpm db:migrate:apply && pnpm seed:all
```

### Type Errors
```bash
# Check branded ID imports
grep -r "from '@db/types'" .
# Should be: from '@shared/types/ids'
```

### Boundary Violations
```bash
pnpm validate:boundaries  # Check workspace imports
```

This codebase emphasizes **type safety**, **domain separation**, **configuration-driven architecture**, and **comprehensive tooling**. Always follow the cursor rules and use the provided patterns for consistent, maintainable code.