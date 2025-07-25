# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL REMINDERS

1. **NEVER run `pnpm db:push`** - It will hang forever with Neon. Use `pnpm db:migrate` instead.
2. **Scripts workspace exists at root** - Don't assume it's deleted if imports fail.
3. **Use migration workflow** for all database schema changes.
4. **TypeScript Hooks are ACTIVE** - Code quality checks run automatically. Use `SKIP_HOOKS=1 git commit` for emergencies.
5. **Repository Pattern is MANDATORY** - All DB queries MUST go through repositories, services MUST NOT contain direct DB calls.
6. **Event-Driven Architecture** - Cross-domain communication ONLY via EventBus, NO direct service imports between domains.
7. **Forum terminology** - Use "forum" not "zone". Legacy "zone" references are being phased out.
8. **Dont create new files unless you request a whitelisting. CCODEBASE IS LOCKED DOWN.**

## Essential Commands

```bash
# Development
pnpm dev                    # Start both client (5173) and server (5001)
pnpm dev:seed              # Start with seeded data (admin user: cryptoadmin)
pnpm dev:client            # Client only
pnpm dev:server            # Server only

# Database
pnpm db:migrate            # Run migrations (NOT db:push!)
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
- **CanonicalUser** is the single source of truth
- Always use `useCanonicalAuth()` hook, never `useAuth()`
- Transform at boundaries: DB → CanonicalUser → API

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
eventBus.emit('user.created', { userId, timestamp });
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

## Common Pitfalls

1. **Import Boundaries**: Client can't import server, server can't import client
2. **Database Access**: Only in repositories, never in services
3. **Forum Config**: Edit `forum-map.config.ts` then sync, don't modify DB directly
4. **User Types**: Use CanonicalUser everywhere, transform legacy data
5. **ID Comparisons**: Use `isValidId()`, not numeric comparisons

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