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
8. **CODEBASE IS LOCKED DOWN** - NO new files without explicit approval (see File Creation Whitelisting below).

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

## Common Pitfalls

1. **Import Boundaries**: Client can't import server, server can't import client
2. **Database Access**: Only in repositories, never in services
3. **Forum Config**: Edit `forum-map.config.ts` then sync, don't modify DB directly
4. **User Types**: Use CanonicalUser everywhere, transform legacy data
5. **ID Comparisons**: Use `isValidId()`, not numeric comparisons

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