# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DegenTalk is a modern, highly satirical crypto forum platform designed for gamblers, investors, traders, and crypto fanatics across the globe. It aims to be the next viral forum of the century, featuring integrated wallet functionality, a digital goods marketplace, and gamified social features with XP/DGT economy.

## Essential Commands

### Development

```bash
# Start full development environment (recommended)
npm run dev                    # Starts both frontend (5173) and backend (5001)
npm run dev:seed              # Start with full database seeding
npm run dev:quick             # Start without seeding (faster)

# Individual services
npm run dev:frontend          # Frontend only (Vite)
npm run dev:backend           # Backend only (tsx with hot reload)

# Port management (automatic port killing before start)
npm run kill-ports            # Clear both development ports
npm run kill-port:5001        # Backend only
npm run kill-port:5173        # Frontend only
```

### Database Management

```bash
# Core database operations
npm run db:migrate            # Generate new migrations
npm run db:migrate:Apply      # Apply migrations to database
npm run db:studio             # Open Drizzle Studio GUI
npm run db:drop               # Drop all tables

# Essential seeding (run in order)
npm run seed:all              # Full seed pipeline
npm run sync:forums           # Sync forumMap.config.ts to database
npm run seed:users            # Create test users
npm run seed:threads          # Realistic forum content
```

### Forum System Management

```bash
# Critical forum operations
npm run sync:forums           # Sync forumMap.config.ts → database (REQUIRED after config changes)
npm run sync:check-forum-config  # Validate forum config sync status
npm run seed:forum:new        # Seed forums from config
```

### Build & Production

```bash
npm run build                 # Build client only (server uses tsx runtime)
npm run start                 # Start production server
npm run lint                  # ESLint both client and server
npm run typecheck             # Skip (disabled during type refactor)
npm run validate              # Comprehensive validation script
```

### Testing

```bash
npm run test:e2e              # Playwright end-to-end tests
npm run test:unit             # Vitest unit tests
npm run test:xp               # XP system validation
npm run test:forum-endpoints  # Forum API validation
```

## Architecture Overview

### Monorepo Structure

- **`client/src/`** - React 18 frontend with Vite
- **`server/src/domains/`** - Domain-driven backend modules
- **`db/schema/`** - Drizzle ORM schemas organized by domain
- **`shared/`** - Shared types and validators
- **`scripts/`** - Build, seed, and utility scripts

### Advanced Forum Features

The forum system includes sophisticated power features documented in `FORUM-POWER-FEATURES.md`:

- **Enhanced Thread Management** - Advanced filtering, sorting, saved preferences
- **Moderator Power Tools** - Comprehensive moderation interface with quick actions
- **Draft System** - Auto-save functionality with cloud sync and recovery
- **Contextual Error Pages** - User-friendly error handling with smart suggestions
- **Network Resilience** - Auto-retry mechanisms with offline detection

### Critical Architecture Patterns

#### 1. Forum System - Single Source of Truth

The forum structure follows a strict canonical pattern:

- **`client/src/config/forumMap.config.ts`** - Master configuration file
- **Zone → Forum → SubForum** hierarchy (max 2 levels)
- **`npm run sync:forums`** syncs config to database
- **Never manually edit forum_categories table**

#### 2. Domain-Driven Backend

```
server/src/domains/
├── forum/          # Forum, threads, posts
├── wallet/         # DGT, USDT, crypto wallets
├── xp/             # Experience points, levels
├── admin/          # Administrative functions
├── engagement/     # Tipping, airdrops, rewards
└── messaging/      # Shoutbox, DMs
```

#### 3. Database Schema Organization

```
db/schema/
├── user/           # Users, roles, permissions
├── forum/          # Categories, threads, posts
├── economy/        # Wallets, XP, transactions
├── shop/           # Products, inventory
├── messaging/      # Chat, notifications
└── admin/          # System administration
```

### API Client Standardization

**Use `apiRequest` from `@/lib/queryClient.ts` for all API calls:**

```typescript
// Preferred pattern
import { apiRequest } from '@/lib/queryClient';

const data = await apiRequest<ResponseType>({
	url: '/api/endpoint',
	method: 'POST',
	data: { key: 'value' }
});

// ❌ Legacy (migrate from)
import { api } from '@/lib/api';
```

**Migration deadline: End of current quarter**

### Import Patterns

- **Use `@/` alias** for all client imports: `import Component from '@/components/ui/button'`
- **Default exports** - Most components: `import Component from '@/path'`
- **Named exports** - Utilities/hooks: `import { useHook } from '@/hooks'`
- **Barrel exports** - Some directories use index.ts re-exports

## Development Environment

### Prerequisites

- Node.js 18+
- PostgreSQL (local or remote)
- Environment file: `env.local` (not `.env`)

### Key Environment Variables

```bash
DATABASE_URL=postgresql://...    # Required PostgreSQL connection
NODE_ENV=development
PORT=5001                       # Backend port
VITE_PORT=5173                  # Frontend port
```

### Development Features

- **No authentication required** in development
- **Role switcher** - Test admin/mod/user permissions (bottom-right corner)
- **Hot reload** on both frontend and backend
- **Automatic port management** - Kills existing processes before starting

## Forum Business Logic

### Core Business Rules (README-FORUM.md compliance)

1. **Zone Types**: Primary zones (featured carousel) vs General zones
2. **Access Levels**: `public` | `registered` | `level_10+` | `mod` | `admin`
3. **XP System**: Forum-specific multipliers, posting requirements
4. **Permissions**: Forum-level posting, tipping, XP rules

### Critical Components

- **`ForumStructureContext`** - Global forum data management
- **`forumMap.config.ts`** - Single source of truth for structure
- **Business logic utilities** in `lib/forum/`:
  - `canUserPost.ts` - Permission checking
  - `getForumRules.ts` - Rule extraction
  - `shouldAwardXP.ts` - XP eligibility

### Theme System

- **CSS variables**: `--zone-accent`, `--zone-banner`, `--zone-icon`
- **Theme inheritance**: Zone → Forum → Component
- **Dynamic theming**: API-driven overrides

## XP & Economy Integration

### XP Rewards Flow

1. User performs action (create thread, post reply)
2. `POST /api/xp/award-action` - Awards XP based on `xpActionSettings`
3. `POST /api/wallet/transactions/create` - Awards DGT tokens
4. Frontend displays toast notifications

### Key Services

- **XP**: `server/src/domains/xp/xp.service.ts`
- **DGT**: `server/src/domains/wallet/dgt.service.ts`
- **Rewards**: Configured in `xpActionSettings` table

## Critical Patterns & Rules

### Schema Consistency (.cursor/rules/schema-consistency.mdc)

- **All database fields** must exist in the PostgreSQL schema for both development and production environments
- **No undefined field references** in queries
- **Explicit null handling** for all fields

### Permission Enforcement

- **Frontend forms** must integrate with `lib/forum/` utilities
- **Route protection** required for admin/mod features
- **Access level enforcement** in thread creation

### Emergency Recovery

If `npm run dev` creates infinite loops:

```bash
# Emergency stop
pkill -f "npm run dev"
killall node
npm run kill-ports
```

## Common Development Tasks

### Adding New Forum Zone/Forum

1. Edit `client/src/config/forumMap.config.ts`
2. Run `npm run sync:forums`
3. Add banner image to `public/banners/`
4. Test navigation components

### Creating New Domain

1. Create `server/src/domains/newdomain/`
2. Add routes, controllers, services
3. Create schema in `db/schema/newdomain/`
4. Export schema in `db/schema/index.ts`
5. Add migration script if needed

### Database Schema Changes

1. Update schema files in `db/schema/`
2. Run `npm run db:migrate` to generate migration
3. Update `scripts/db/create-missing-tables.ts` for dev compatibility
4. Run `npm run db:migrate:Apply`

## Testing Strategy

- **E2E**: Playwright tests in `tests/e2e/`
- **Unit**: Vitest tests in `client/`
- **API**: Domain-specific test scripts in `scripts/testing/`
- **XP System**: `npm run test:xp` validates reward calculations

## Deployment Notes

- **Server build**: Uses `tsx` runtime (no TypeScript compilation)
- **Client build**: Standard Vite production build
- **Database**: PostgreSQL for both dev and production
- **Environment**: All config in `env.local`

## Critical Files to Understand

1. **`README-FORUM.md`** - Forum system canonical specification
2. **`FORUM-POWER-FEATURES.md`** - Advanced forum features documentation
3. **`client/src/config/forumMap.config.ts`** - Forum structure master config
4. **`package.json`** - Essential npm scripts and dependencies
5. **`.cursor/rules/`** - Development rules and patterns
6. **`db/schema/index.ts`** - Complete database schema exports

## Common Issues & Solutions

### Port Conflicts

Run `npm run kill-ports` before starting development

### Database Sync Issues

```bash
npm run sync:check-forum-config  # Check sync status
npm run sync:forums              # Force resync
```

### Type Errors

TypeScript checking is temporarily disabled during major refactor. Use `npm run lint` for code quality.

### Forum Configuration Changes

Always run `npm run sync:forums` after editing `forumMap.config.ts`
