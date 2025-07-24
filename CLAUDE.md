# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL REMINDERS

1. **NEVER run `pnpm db:push`** - It will hang forever with Neon. Use `pnpm db:migrate` instead.
2. **Scripts workspace exists at root** - Don't assume it's deleted if imports fail.
3. **Use migration workflow** for all database schema changes.
4. **TypeScript Hooks are ACTIVE** - Code quality checks run automatically. Use `SKIP_HOOKS=1 git commit` for emergencies.
5. **Repository Pattern is MANDATORY** - All DB queries MUST go through repositories, services MUST NOT contain direct DB calls.
6. **Event-Driven Architecture** - Cross-domain communication ONLY via EventBus, NO direct service imports between domains.
7. **Missions System DEPRECATED** - Being removed completely, do not add new mission features.

## Workspace Details

- Uses **pnpm workspace architecture** with strict boundaries: `client/`, `server/`, `db/`, `shared/`, `scripts/`
- **PostgreSQL only** with Drizzle ORM (SQLite support completely removed)
- **TypeScript strict mode** enabled across all workspaces
- **Domain-driven backend** architecture with event-driven communication
- **Repository pattern** for all data access (services → repositories → database)
- **Configuration-first** approach - centralized ConfigService for all settings

## User Model Architecture

### ⚠️ CRITICAL: CanonicalUser is the Single Source of Truth

1. **ALWAYS use CanonicalUser type** for user data across the platform
   - Import from `@shared/types/user` or `@/types/canonical.types`
   - Basic `User` type is deprecated - DO NOT use for new features

2. **Use the enhanced auth hook** for all user data needs:
   ```typescript
   // ❌ OLD - Don't use
   import { useAuth } from '@/hooks/use-auth';
   
   // ✅ NEW - Always use
   import { useCanonicalAuth } from '@/features/auth/useCanonicalAuth';
   ```

3. **User data contract**:
   - Full type definition in `/docs/USER_MODEL_CONTRACT.md`
   - All user fields must match the CanonicalUser interface
   - Transform legacy data using `toCanonicalUser()` utility

4. **API endpoints must return CanonicalUser**:
   - `/api/auth/user` - Current authenticated user
   - `/api/users/:id/profile` - User profile with all fields
   - Use transformers in server to ensure compliance

5. **Type generation**:
   - Run `pnpm codegen` to sync API types with frontend
   - GraphQL/OpenAPI schemas must define CanonicalUser

### Migration Rules

1. **When fixing TypeScript errors**:
   - If error is "User missing properties", use `useCanonicalAuth()` instead
   - If component needs user data, import from `@/features/auth/useCanonicalAuth`
   - Never add optional properties to make errors go away

2. **When creating new features**:
   - Always design with CanonicalUser from the start
   - Include all relevant user fields in API responses
   - Use `UserSummary` type for lists to optimize payload size

3. **Transform at the boundary**:
   - Server: Transform DB user → CanonicalUser in service layer
   - Client: Use `toCanonicalUser()` only for legacy endpoints
   - Goal: Remove all transformers once APIs are updated

4. **Performance considerations**:
   - Cache CanonicalUser with 5min stale time
   - Prefetch on SSR pages
   - Use React Query for all user data fetching

## TypeScript Hooks System ✅ ACTIVE

**Status**: Production-ready, automatically enforcing code quality

### What's Checked
1. **Branded ID Usage**: Prevents `userId > 0`, enforces `isValidId(userId)`
2. **Console Usage**: Blocks `console.*`, enforces `logger.*`
3. **Import Validation**: Blocks `@db/types`, enforces `@shared/types/ids`
4. **Any Types**: Prevents `any`, allows CCPayment API exceptions
5. **Type Conversions**: Enforces `toId()` over type assertions

### Performance
- **~17ms per file** (Target: <2s ✅)
- **~50ms per commit** (Target: <5s ✅)
- **Zero false positives** on clean code

### Commands
```bash
# Check a file
node tools/claude-hooks/run-checks.cjs --file <path> --mode pre-edit

# Emergency bypass
SKIP_HOOKS=1 git commit -m "Emergency fix"
```

### Hook Configuration
- Config: `.claude/hooks/hook-config.json`
- Hooks: `.claude/hooks/{react-app,shared,server}/`
- Patterns: `.claude/hooks/branded-id-patterns.json`

## Domain-Driven Architecture Rules 🏗️

### Domain Structure
```
server/src/domains/[domain-name]/
├── index.ts                    // Public API exports ONLY
├── types.ts                    // Domain-specific types  
├── events.ts                   // Domain event definitions
├── [domain].service.ts         // Business logic (NO db calls)
├── [domain].repository.ts      // Data access (ALL db calls)
├── [domain].controller.ts      // HTTP endpoints
├── [domain].validator.ts       // Zod schemas
├── [domain].transformer.ts     // DTOs & response shaping
├── handlers/                   // Event handlers
│   └── index.ts
├── admin/                      // Admin-specific features
└── __tests__/                  // Domain tests
```

### Architecture Enforcement Rules
1. **Repository Pattern**:
   - ALL database queries MUST be in `*.repository.ts` files
   - Services MUST inject repositories, NO direct DB imports
   - Repositories MUST extend `BaseRepository<T>`
   - Use transactions via `options.tx` parameter

2. **Domain Boundaries**:
   - Domains can ONLY import from their own files or `index.ts` of other domains
   - Cross-domain imports of services/repositories are FORBIDDEN
   - Use EventBus for cross-domain communication
   - Each domain MUST export only through `index.ts`

3. **Event-Driven Communication**:
   - Emit domain events instead of calling other services
   - Listen to events in `handlers/index.ts`
   - Events MUST include metadata (userId, timestamp, correlationId)
   - Use typed events from domain's `events.ts`

4. **Core Infrastructure**:
   - `@core/config` - ConfigService for all env vars & settings
   - `@core/cache` - Unified CacheService with domain-specific keys
   - `@core/auth` - Centralized AuthorizationService
   - `@core/errors` - Standard domain errors (NotFoundError, ValidationError, etc.)
   - `@core/events` - EventBus for domain communication

### Import Rules
```typescript
// ✅ ALLOWED
import { something } from './internal-file';
import { types } from '@shared/types';
import { logger } from '@core/logger';
import { OtherDomainService } from '@domains/other/index';

// ❌ FORBIDDEN
import { service } from '../other-domain/other.service';
import { repo } from '../other-domain/other.repository';
import { db } from '@db';  // Only in repositories!
```

### Error Handling
- Use standard errors from `@core/errors`
- Throw domain errors in services
- Let error middleware handle responses
- Include context in error messages

### Testing Requirements
- Unit tests for services (mock repositories)
- Integration tests for repositories
- Domain isolation tests must pass
- Event flow tests for handlers

## Development Fixes

### PostCSS Configuration Fix
- ✅ Converted postcss.config.js to ES module format
- ✅ Removed duplicate @tailwind directives (kept only in index.css)  
- ✅ Fixed theme() functions → actual color values
- ✅ Removed @layer wrapper from admin-theme.css