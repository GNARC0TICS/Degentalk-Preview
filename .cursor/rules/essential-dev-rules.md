# Essential Development Rules for DegenTalk

## 🏗️ Architecture Patterns

### Import Rules (CRITICAL)
- **ALWAYS use `@/` alias** for client imports: `import Button from '@/components/ui/button'`
- **Server cannot import client/** - enforced by boundary validation
- **Client cannot import server/** - enforced by boundary validation  
- **Default exports**: `import Component from '@/path'` (most components)
- **Named exports**: `import { utility } from '@/path'` (hooks, utils)

### API Client Pattern (MIGRATING)
- **Prefer `apiRequest`** from `@/lib/queryClient.ts` over legacy `api`
- **Type all responses**: `apiRequest<ResponseType>({ url: '/api/endpoint' })`
- **Deadline**: End of current quarter for full migration

```typescript
// ✅ Preferred
import { apiRequest } from '@/lib/queryClient';
const data = await apiRequest<WalletBalance>({
  url: '/api/wallet/balance',
  method: 'GET'
});

// ❌ Legacy (migrate from)
import { api } from '@/lib/api';
const data = await api.wallet.getBalance();
```

## 🗄️ Database Schema (CRITICAL)

### Schema Consistency Rule
- **All database fields** must exist in PostgreSQL schema for both dev and prod
- **No undefined field references** in queries - will cause runtime errors
- **Explicit null handling** for all fields

```typescript
// ✅ Correct - all fields defined in schema
const categories = await db.select({
  id: forumCategories.id,
  minGroupIdRequired: forumCategories.minGroupIdRequired, // ✅ Exists
  pluginData: forumCategories.pluginData, // ✅ Exists
}).from(forumCategories);

// ❌ Wrong - undefined field reference
const categories = await db.select({
  undefinedField: forumCategories.undefinedField, // ❌ Runtime error
}).from(forumCategories);
```

## 🎯 Code Style (ENFORCED)

### TypeScript Standards
- **Strict mode** - no `any` types
- **No comments** unless explicitly requested
- **Use existing ESLint config** exactly
- **Follow React 18 patterns** with hooks

### Forum Business Logic
- **Forum structure** managed via `forumMap.config.ts`
- **Always run `npm run sync:forums`** after config changes
- **Use existing utilities**: `canUserPost`, `getForumRules`, `shouldAwardXP`

## 🚀 Development Workflow

### Essential Commands
```bash
pnpm dev              # Full development stack
pnpm dev:quick        # Start without seeding
pnpm db:studio        # Database management
pnpm sync:forums      # Sync forum config changes
npm run validate      # Check boundary violations
```

### Pre-commit Requirements
- **Run `npm run lint`** - must pass
- **No boundary violations** - client/server separation
- **Schema consistency** - all fields must exist

## 🛡️ Security & Validation

- **Validate inputs** with Zod schemas
- **Authentication checks** in protected routes
- **Never expose secrets** in client code
- **Follow permission patterns** for admin/mod features

## 📁 File Organization

```
client/src/
├── components/     # UI components by domain
├── pages/         # Route components
├── hooks/         # Custom React hooks
├── config/        # Configuration files
└── lib/           # Utilities and API clients

server/src/domains/
├── forum/         # Forum business logic
├── wallet/        # DGT/wallet system
├── xp/           # Experience points
└── admin/        # Administrative functions
```

Remember: This is a production codebase with strict architectural boundaries. Always maintain existing patterns and domain separation.