# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Degentalk is a modern, highly satirical crypto forum platform designed for gamblers, investors, traders, and crypto fanatics across the globe. It aims to be the next viral forum of the century, featuring integrated wallet functionality, a digital goods marketplace, and gamified social features with XP/DGT economy.

## 🚨 SYSTEM-WIDE THREAD ARCHITECTURE (CANONICAL)

**ENFORCED AS OF 2025-01-27 - ALL AGENTS MUST FOLLOW**

### ✅ Unified Thread System

- **ALL frontend thread views MUST use `ThreadDisplay` type** from `@/types/thread.types`
- **ALL API responses include proper `zone` data with `colorTheme`** - DO NOT manually enrich thread data
- **`ThreadList` component is the ONLY standard** across all views - NO custom thread loaders
- **Backend provides zone data automatically** - frontend must not hardcode zones or themes

### ✅ Canonical Seeding

- **`seed-all-comprehensive.ts` is the ONLY valid thread seeder**
- **ALL other thread seeders have been DELETED** (seed-realistic-threads, seedDynamicContent, etc.)
- **Use `npm run seed:all` or `npm run seed:forums:only`** - no other seeding commands
- **Thread objects MUST use `structureId` pointing to canonical forum slugs** from forumMap.config.ts

### ✅ Config-Driven Architecture

- **`forumMap.config.ts`** - forum hierarchy and settings (SINGLE SOURCE OF TRUTH)
- **`thread.config.ts`** - thread form/editor behavior
- **`pagination.config.ts`** - page sizes, infinite scroll, etc.
- **Zones resolved at runtime by backend** using forum structure

### 🔒 ENFORCEMENT

- **Any component/service/test using legacy types or hardcoded thread data is OUT OF SPEC**
- **All routes verified:** ZonePage, ForumPage, TagPage, ProfilePage, Content Feeds
- **ThreadService handles ALL thread queries** for consistency
- **NO freelancing this logic** - ask if unsure but assume new structure is canonical

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

### Enhanced Development Features

#### **🧑‍💼 Realistic Admin User Setup**

```bash
npm run seed:dev-complete       # Complete setup (recommended)
npm run seed:users              # Basic users including cryptoadmin
npm run seed:dev-wallet         # Wallet with crypto balances
npm run seed:dev-subscriptions  # VIP subscription data
```

Creates a production-like development environment:

- **Username**: `cryptoadmin` (auto-login as admin)
- **Wallet**: 500k+ DGT, 10 ETH, 5k USDT, 0.5 BTC
- **VIP Status**: Active lifetime subscription with benefits
- **Profile**: Complete with bio, avatar, social links
- **Stats**: Level 99, 99,999 XP, 10,000 reputation

#### **🎮 Full Platform Testing**

- **ProfileCard widget** - Live user data in left sidebar
- **Real wallet transactions** - Using seeded balances
- **Forum moderation** - Admin tools and privileges
- **Shoutbox chat** - With authenticated user identity
- **Shop purchases** - DGT spending functionality
- **XP system** - Real-time experience point updates

#### **⚡ Development Tools**

- **Role switcher** - Test admin/mod/user permissions (bottom-right corner)
- **Hot reload** - Both frontend and backend with preserved state
- **Automatic port management** - Kills existing processes before starting
- **Mock data** - Realistic content for all platform features

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

## 🔐 Authentication System Architecture

### 🔧 Auth Flow Overview

DegenTalk uses a **unified authentication system** with the following components:

1. **Single QueryClient**: `client/src/providers/root-provider.tsx` contains the ONLY QueryClient instance
2. **Unified Auth Hook**: `client/src/hooks/use-auth.tsx` is the single source of truth for auth state
3. **Header Integration**: `client/src/components/header/HeaderContext.tsx` syncs with auth state
4. **Backend Auth**: Session-based authentication with Passport.js

### 🔗 Critical Auth Components

| Component       | Purpose                                     | Key Features                               |
| --------------- | ------------------------------------------- | ------------------------------------------ |
| `RootProvider`  | Main QueryClient with `on401: 'returnNull'` | Handles 401s gracefully for auth           |
| `AuthProvider`  | Auth state management                       | Real auth validation, cache clearing       |
| `HeaderContext` | UI auth state sync                          | Syncs with `useAuth` via `isAuthenticated` |
| `use-auth.tsx`  | Auth business logic                         | Login/logout, session validation           |

### 🚨 Auth Development Rules

**DO:**

- Use `useAuth()` hook for all auth state
- Use `isAuthenticated` flag from auth context
- Clear auth cache on logout: `queryClient.setQueryData(['/api/auth/user'], null)`
- Use URL-based query keys: `['/api/auth/user']` not `['user']`
- Use `roles` instead of deprecated `userGroups`

**DON'T:**

- Create multiple QueryClient instances
- Use deprecated `userGroups` schema exports
- Bypass auth state with manual user objects
- Use custom 401 handling (QueryClient handles it)
- Import `queryClient` from `@/lib/queryClient` (use provider's instance)

### 🔄 Environment Configuration

```bash
# env.local - Force real authentication
NODE_ENV=development
DEV_FORCE_AUTH=true          # Forces real auth in dev
DEV_BYPASS_PASSWORD=false    # Disables password bypass
VITE_FORCE_AUTH=true         # Frontend auth forcing
```

### 🛠️ Auth Debugging

```javascript
// Browser console - check auth state
console.log('[AUTH] Current state:', {
	isAuthenticated: !!user,
	userState: user ? `${user.username} (${user.id})` : 'null'
});
```

### 🔧 Common Auth Issues

| Issue                                           | Solution                                           |
| ----------------------------------------------- | -------------------------------------------------- |
| "Login button → notifications/wallet instantly" | Cached auth state. Clear browser cache             |
| "Multiple auth providers error"                 | Only use AuthProvider in RootProvider              |
| "QueryClient conflicts"                         | Use only the RootProvider QueryClient              |
| "401 errors not handled"                        | Ensure `on401: 'returnNull'` in QueryClient config |
| "userGroups import errors"                      | Replace with `roles` import                        |

### 🏗️ Auth Architecture Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   RootProvider  │ -> │   AuthProvider   │ -> │  HeaderContext  │
│                 │    │                  │    │                 │
│ • QueryClient   │    │ • useQuery auth  │    │ • UI sync       │
│ • on401: null   │    │ • State mgmt     │    │ • isAuth flag   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         v                        v                        v
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Browser Storage │    │   Auth Session   │    │   UI Elements   │
│                 │    │                  │    │                 │
│ • Clear on init │    │ • Server session │    │ • Login/Logout  │
│ • Cache keys    │    │ • Passport.js    │    │ • User menu     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

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

### Authentication Issues

```bash
# Clear auth cache and reload
# Option 1: Clear browser data (Dev Tools → Application → Storage → Clear storage)
# Option 2: Check auth state in browser console (see Auth Debugging above)
```

**📖 For detailed migration help, see: `docs/AUTH-MIGRATION-GUIDE.md`**

## 💳 DGT Wallet System Integration (COMPLETE)

### Overview

The Degentalk Wallet System provides a complete DGT token economy with CCPayment crypto integration, user transfers, and comprehensive transaction management. This system was fully integrated during the frontend completion phase.

### Frontend Architecture

```
client/src/features/wallet/
├── services/wallet-api.service.ts    # Central API service for all wallet operations
├── hooks/use-wallet.ts               # Main wallet hook with React Query integration
└── README.md                         # Complete API documentation

client/src/components/economy/wallet/
├── wallet-balance-display.tsx        # DGT balance with pending indicators
├── deposit-button.tsx               # CCPayment crypto deposits → DGT conversion
├── withdraw-button.tsx              # Feature-gated withdrawals (crypto/DGT)
├── dgt-transfer.tsx                 # User-to-user DGT transfers
├── transaction-history.tsx          # Enhanced transaction history
├── animated-balance.tsx             # Animated balance changes
├── buy-dgt-button.tsx              # DGT package purchases
└── README.md                        # Component documentation

client/src/pages/wallet.tsx         # Main wallet page with tab interface
```

### Key Features Implemented

1. **Real-time Balance Display**

   - Primary DGT balance with animated changes and visual feedback
   - Secondary crypto balances with auto-conversion information
   - Pending transaction indicators with live count updates
   - Feature gate integration showing disabled functions

2. **CCPayment Crypto Deposits**

   - Live deposit addresses for ETH, BTC, USDT, and other cryptocurrencies
   - Automatic conversion to DGT at $0.10 per token
   - Real-time deposit tracking with webhooks
   - Minimum deposit validation and conversion rate display

3. **User-to-User DGT Transfers**

   - Username validation and user lookup
   - Configurable transfer limits (default: 10,000 DGT max)
   - Optional transfer notes (200 character limit)
   - Real-time balance updates for both sender and recipient

4. **Enhanced Transaction History**

   - DGT-specific transaction types: DEPOSIT_CREDIT, ADMIN_CREDIT, TRANSFER, TIP, RAIN, SHOP
   - Advanced filtering: All, DGT, Crypto, Transfers, Pending
   - Visual indicators for pending transactions with floating animations
   - Detailed metadata display (original crypto amounts, conversion rates, etc.)

5. **Feature Gate System**

   - Admin-configurable wallet features via `/api/wallet/config`
   - `allowCryptoWithdrawals` - Controls crypto withdrawal requests
   - `allowDGTSpending` - Controls DGT conversion to shop credits
   - `allowInternalTransfers` - Controls user-to-user transfers
   - Dynamic UI adaptation with visual disabled states

6. **Pending State Management**

   - Visual indicators for pending transactions (amber glow, pulsing)
   - Real-time pending count display in balance header
   - Separate "Pending" filter tab when transactions exist
   - Floating animations for pending transaction items

7. **Comprehensive Error Handling**
   - Network error recovery with automatic retry
   - Feature disabled messaging with admin explanations
   - Form validation with inline error messages
   - Toast notifications for all user actions

### API Endpoints (Frontend Integration)

| Endpoint                            | Purpose                             | Status        |
| ----------------------------------- | ----------------------------------- | ------------- |
| `GET /api/wallet/balances`          | Real-time DGT and crypto balances   | ✅ Integrated |
| `GET /api/wallet/deposit-addresses` | Live CCPayment crypto addresses     | ✅ Integrated |
| `GET /api/wallet/transactions`      | Transaction history with pagination | ✅ Integrated |
| `POST /api/wallet/transfer-dgt`     | User-to-user DGT transfers          | ✅ Integrated |
| `GET /api/wallet/config`            | Feature gates and configuration     | ✅ Integrated |
| `POST /api/wallet/withdraw`         | Crypto withdrawal requests          | ✅ Integrated |

### Wallet Configuration

The wallet system respects admin configuration through the `/api/wallet/config` endpoint:

```typescript
interface WalletConfig {
	features: {
		allowCryptoWithdrawals: boolean; // Crypto withdrawal feature
		allowDGTSpending: boolean; // DGT to shop credit conversion
		allowInternalTransfers: boolean; // User-to-user transfers
	};
	dgt: {
		usdPrice: number; // Current DGT price ($0.10)
		minDepositUSD: number; // Minimum deposit amount
		maxDGTBalance: number; // Maximum DGT per user
	};
	limits: {
		maxDGTTransfer: number; // Maximum DGT per transfer
	};
}
```

### Usage Patterns

**Basic Wallet Integration:**

```typescript
import { useWallet } from '@/hooks/use-wallet';

function MyComponent() {
  const {
    balance,              // Real-time DGT and crypto balances
    transactions,         // Transaction history with metadata
    walletConfig,         // Feature gates and limits
    transferDgt,          // Transfer function with validation
    isLoadingBalance      // Loading states
  } = useWallet();

  const pendingCount = transactions.filter(tx =>
    tx.status === 'pending' || tx.status === 'processing'
  ).length;

  return (
    <WalletBalanceDisplay
      balance={balance}
      pendingTransactions={pendingCount}
    />
  );
}
```

**DGT Transfer with Validation:**

```typescript
await transferDgt({
	toUserId: 'user123',
	amount: 100.5,
	note: 'Payment for services'
});
// Automatically handles validation, feature gates, and balance updates
```

### Animation & Polish

Enhanced the wallet experience with:

- **Staggered fade-in animations** on page load
- **Balance change highlighting** with color-coded feedback
- **Pending transaction floating effects** with amber glow
- **Button click animations** and hover feedback
- **Smooth loading states** with skeleton placeholders

### Documentation

Complete developer documentation created:

- `/client/src/features/wallet/README.md` - Architecture and API integration
- `/client/src/components/economy/wallet/README.md` - Component library guide
- `/client/src/features/wallet/services/README.md` - API service documentation

### Testing Readiness

The wallet system is production-ready with:
✅ Real CCPayment integration for crypto deposits
✅ Automatic crypto → USDT → DGT conversion flow
✅ Feature gate enforcement with admin configuration
✅ Comprehensive error handling and user feedback
✅ Real-time balance and transaction updates
✅ Pending state management with visual indicators
✅ Type-safe API integration with React Query caching

**Ready for live testing with actual crypto deposits and DGT economy operations.**
