/**
 * Update the RESTRUCTURE.md file to reflect the progress made on:
 * 1. Wallet domain implementation
 * 2. CCPayment webhook domain
 * 3. Server-side tests
 * 4. Client-side refactoring
 * 5. Engagement domain structure
 * 
 * Also update "next steps" to reflect what remains to be done.
 */

# Degentalk™™ Codebase Restructure Audit & Plan

This document outlines a plan to restructure the Degentalk™™ codebase for improved modularity, maintainability, and developer experience.

## 1. Files to Archive or Remove

These files and directories are identified as deprecated, redundant, or related to the legacy Tron integration and should be moved to an `archive/` directory or deleted if confirmed unused.

**Action:** Create an `archive/legacy-tron/` directory and move Tron-related files there. Create `archive/old-routes/` and `archive/old-scripts-docs/` for others.

**Status: @done**

**Tron Remnants (Move to `archive/legacy-tron/`): @done**
*   `server/services/trongrid-validation.ts`
*   `server/services/tronweb-service.ts`
*   `server/services/tronweb-wallet-service.ts`
*   `server/test/tronweb/` (entire directory)
*   `server/utils/tron-token-utils.ts`
*   `tronwallet.md` (from root)
*   `scripts/archive-tron-integration.sh` (The script itself can be archived after ensuring its purpose is fulfilled or documented elsewhere)

**Redundant/Old Wallet Logic (Move to `archive/old-routes/` or analyze for consolidation): @done**
*   `server/wallet-dgt-routes.ts` @done
*   `server/wallet-routes-updated.ts` @done
*   `server/wallet-routes.ts` @done
*   `server/wallet-tip-routes.ts` @done
*   `server/wallet.ts` (file directly in `server/` - analyze: could be core logic to refactor or old routes) @done
*   `server/services/tip-service.ts` (If `tip-service-ccpayment.ts` is the successor) @done
*   `server/services/wallet-integration.ts` (If `wallet-integration-ccpayment.ts` is the successor) @done

**Potentially Unused/Misplaced Root Files (Review and move to `archive/old-scripts-docs/` or `docs/project-misc/`): @done**
*   `Grafitti.png.PNG` (If unused asset, else move to `client/public/assets/images/`)
*   `projectlaunchplan.md` @done
*   `thread_creation_plan.md` @done
*   `directory-structure.md` (Superseded by this plan and `directory-tree.md`) @done

**Old Test Files (Move to `archive/old-tests/`): @done**
*   `server/test-wallet-endpoints.js` (Review if tests are still relevant for CCPayment; if so, adapt and move to new test structure)

**Note:** Before deleting, ensure no critical information or logic is lost. Archiving is safer initially.

## 2. Suggested Folder Layout

This layout promotes domain-driven design and separates concerns more clearly.

**Key Principles:**
*   Group by feature/domain, not just file type.
*   Clear separation between `client` and `server` logic.
*   Centralized `shared` utilities.
*   Standardized naming conventions (kebab-case for files/folders, PascalCase for React components).

```
ForumFusion/
├── .github/
├── .cursor/
├── archive/
│   ├── legacy-tron/
│   ├── old-routes/
│   ├── old-scripts-docs/
│   └── old-tests/
├── client/
│   ├── public/
│   │   ├── images/
│   │   ├── assets/  // New: for general static assets like fonts, icons not part_of_ui
│   │   └── test-components/ // Review: consider moving to a Storybook setup or co-locating with components
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── core/  // New: for app setup, core API, routing, providers
│   │   │   ├── api.ts
│   │   │   ├── queryClient.ts
│   │   │   ├── router.tsx  // Or keep pages for file-based routing
│   │   │   ├── providers.tsx // Consolidate RootProvider, ShoutboxProvider etc.
│   │   │   └── constants.ts // Global client constants (consider moving some to shared/constants)
│   │   ├── features/  // New: Main application features/domains
│   │   │   ├── auth/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── pages/  // e.g., LoginPage.tsx, RegisterPage.tsx
│   │   │   │   └── services.ts
│   │   │   ├── wallet/
│   │   │   │   ├── components/ // WalletModal, BalanceDisplay, etc.
│   │   │   │   ├── hooks/    // useWalletBalance, useTransactions, etc.
│   │   │   │   ├── pages/    // WalletPage.tsx
│   │   │   │   ├── services.ts // Wallet API calls
│   │   │   │   └── utils.ts  // Wallet-specific client utils
│   │   │   ├── forum/
│   │   │   │   ├── components/ // ThreadView, PostItem, CategoryList
│   │   │   │   ├── hooks/
│   │   │   │   ├── pages/    // ForumHomePage, CategoryPage, ThreadPage
│   │   │   │   └── services.ts
│   │   │   ├── shop/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── pages/
│   │   │   │   └── services.ts
│   │   │   ├── profile/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── pages/
│   │   │   │   └── services.ts
│   │   │   ├── admin/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── pages/    // DashboardPage, UserManagementPage
│   │   │   │   ├── routes.ts // Admin-specific client routes config
│   │   │   │   └── services.ts
│   │   │   ├── xp/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/    // useUserXP, useLevels
│   │   │   │   └── services.ts
│   │   │   ├── shoutbox/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── services.ts
│   │   │   │   └── context.tsx // If shoutbox context is self-contained here
│   │   │   ├── // ... other features like messages, mod, platform-energy, settings ...
│   │   ├── components/ // Renamed from client/src/components
│   │   │   ├── ui/       // Generic, reusable UI elements (Button, Input, Card etc.) - from current client/src/components/ui
│   │   │   ├── layout/   // Global layout components (Navbar, Sidebar, Footer) - from current client/src/components/layout & sidebar
│   │   │   └── ErrorBoundary.tsx
│   │   ├── hooks/      // Truly global custom hooks (useMediaQuery, useDebounce)
│   │   ├── contexts/   // Truly global contexts
│   │   ├── lib/        // Generic utility functions (formatDate, utils.ts) - some might move to shared/utils
│   │   ├── pages/      // Top-level pages if not fully moved into features/ (e.g. HomePage, NotFoundPage)
│   │   │   ├── HomePage.tsx // Consolidate home.tsx and home-page.tsx
│   │   │   ├── NotFoundPage.tsx
│   │   │   └── // ... other top-level unique pages
│   │   ├── config/     // Client-specific configurations (e.g., feature flags client exposure)
│   │   ├── styles/     // Global styles (ticker.css, wallet-animations.css)
│   │   └── payments/   // Keep as is for ccpayment client logic, or integrate into features/wallet/payments
│   │       ├── ccpayment/
│   │       ├── index.ts
│   │       └── shared/
├── docs/
│   ├── project/
│   ├── development/
│   ├── api/
│   └── examples/
├── logs/
├── migrations/         // Drizzle SQL migrations
├── scripts/            // Utility and automation scripts (seed, db-tasks)
│   └── apply-schema-changes.ts // Moved from root
├── server/
│   ├── src/
│   │   ├── core/                 // New: Core server setup
│   │   │   ├── index.ts          // Main server entry point (from server/index.ts)
│   │   │   ├── db.ts             // Database connection (from server/db.ts)
│   │   │   ├── middleware.ts     // Central non-auth middleware (from server/middleware/index.ts, rate-limiter.ts)
│   │   │   └── vite.ts           // Vite HMR setup (from server/vite.ts)
│   │   ├── domains/              // New: Domain-specific modules
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.middleware.ts // from server/middleware/auth.ts
│   │   │   ├── wallet/
│   │   │   │   ├── wallet.routes.ts // Consolidated from various wallet route files
│   │   │   │   ├── wallet.controller.ts
│   │   │   │   ├── wallet.service.ts  // Consolidate logic from server/services/*wallet*, server/utils/*wallet*
│   │   │   │   ├── wallet.validators.ts // from server/middleware/wallet-validators.ts
│   │   │   │   ├── ccpayment.service.ts // from server/services/ccpayment-client.ts
│   │   │   │   └── tip.service.ts     // from server/services/tip-service-ccpayment.ts
│   │   │   ├── forum/
│   │   │   │   ├── forum.routes.ts
│   │   │   │   ├── // ... controllers, services ...
│   │   │   ├── admin/
│   │   │   │   ├── admin.routes.ts // Consolidate all admin-specific routes
│   │   │   │   ├── // ... controllers, services for users, reports, settings, xp, badges, economy ...
│   │   │   ├── xp/
│   │   │   │   ├── xp.routes.ts
│   │   │   │   ├── xp.service.ts // from server/services/xp-service, xp-level-service, xp-clout-service
│   │   │   │   └── // ...
│   │   │   ├── // ... other domains: shop, user, shoutbox, messages, etc.
│   │   ├── routes/               // Main router to aggregate domain routes (from server/routes.ts)
│   │   │   └── index.ts
│   │   ├── services/             // Truly shared server-side services (e.g. EmailService, NotificationService if not domain-specific)
│   │   │   └── rain.service.ts     // Example, if generic enough
│   │   ├── utils/                // Generic server-side utilities (logger.ts, slugify.ts)
│   │   │   └── logger.ts           // from server/utils/log.ts & logger.ts
│   │   ├── errors/               // Custom error classes (wallet-errors.ts)
│   │   └── migrations/           // Programmatic migration scripts (if server/migrations/*.ts are still needed)
│   └── test/                   // Server-side tests (excluding Tron)
├── shared/
│   ├── constants/              // Truly shared constants (e.g. USER_ROLE_ENUM_VALUES)
│   ├── types/                  // Shared TypeScript types and interfaces (from shared/types.ts, schema.ts exports)
│   │   └── schema.ts           // Drizzle schema and Zod schemas (keep as is)
│   ├── utils/                  // Shared utility functions usable by both client and server
│   └── validators/             // Shared Zod validators (if any beyond schema, e.g. admin.ts)
├── tests/ // New top-level test folder
│   ├── client/
│   │   └── // ... structure mirroring client/src/features
│   ├── server/
│   │   └── // ... structure mirroring server/src/domains
│   └── e2e/
│   └── utils/ // Shared test utilities (e.g. from lib/wallet/testUtils.ts)
├── .env
├── .env.example
├── .gitignore
├── drizzle.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## 3. Cleanup Notes

*   **Import Paths:** This is the most critical and time-consuming part of the refactor. Every moved file will require updating all import paths referencing it. Use IDE tools for finding usages and renaming/moving where possible, but manual checks will be essential.
*   **Wallet Logic Consolidation:**
    *   **Server-Side:** The multiple wallet route files (`wallet-routes.ts`, `wallet-dgt-routes.ts`, `wallet-routes-updated.ts`) need to be merged into a single, cohesive routing structure for the `wallet` domain, focusing solely on CCPayment. Business logic should reside in `wallet.service.ts`.
    *   **Client-Side:** Ensure `client/src/features/wallet/` contains all UI, hooks, and services for wallet interactions.
*   **Admin Panel Centralization:** Group all admin components, pages, server routes, and logic under `client/src/features/admin/` and `server/src/domains/admin/` respectively. This includes user management, reports, stats, admin-XP functions, etc.
*   **Forum Structure:**
    *   Client: Consolidate forum pages (categories, threads, posts, rules) under `client/src/features/forum/pages/`. Components under `client/src/features/forum/components/`.
    *   Server: Ensure forum routes, services, and controllers are cleanly organized in `server/src/domains/forum/`.
*   **Shared Logic (`shared/`):**
    *   **Types:** Aggressively move all shared types/interfaces (from `shared/types.ts` and exported types from `shared/schema.ts`) into `shared/types/`. Consider organizing types into domain-specific files within `shared/types/` (e.g., `shared/types/user.types.ts`, `shared/types/forum.types.ts`) if it improves clarity.
    *   **Constants:** Move shared constants to `shared/constants/`.
    *   **Utilities:** Generic utility functions usable on both client and server should go into `shared/utils/`.
*   **Client `lib` vs `core` vs `utils`:**
    *   The proposed `client/src/core/` is for essential app setup (API client, query client, root providers, main router).
    *   `client/src/lib/` can house general-purpose utility functions specific to the client.
    *   Domain-specific utils should go into `client/src/features/<domain>/utils.ts`.
*   **Server `utils` vs Domain Utils:**
    *   `server/src/utils/` for truly generic server utilities (e.g., `logger.ts`).
    *   Domain-specific utilities should be part of the domain module, e.g., `server/src/domains/user/user.utils.ts`.
*   **Environment Variables:** Review usage of `.env` variables. Ensure client-side variables are prefixed (e.g., `VITE_APP_TITLE`) and server-side variables are accessed securely. The current `.env.example` and `env.local` setup is good.
*   **Testing Structure:**
    *   Establish a clear testing strategy. Co-locating tests with feature code (`client/src/features/wallet/__tests__/`) or using a top-level `tests/` directory are both valid. The provided structure suggests a top-level `tests/` dir.
    *   Ensure test utilities (like the one from `lib/wallet/testUtils.ts`) are moved to a shared test utility location.
*   **`schema.ts`:** This file is large. While it's central for Drizzle, consider if generated Zod schemas (`insertUserSchema`, etc.) could be in separate files (e.g., `shared/types/zod-schemas.ts` or per-domain) if it improves maintainability, though Drizzle/Zod patterns often keep them together. For now, keeping it as is is fine.
*   **Naming Conventions:**
    *   Files & Folders: `kebab-case` (e.g., `wallet-modal.tsx`, `user-profile/`).
    *   React Components: `PascalCase` (e.g., `<WalletModal />`).
    *   Types/Interfaces: `PascalCase` (e.g., `interface UserProfile`).
    *   Ensure these are applied consistently during the refactor.

## 4. Anti-Patterns Detected & Addressed by Plan

*   **Domain Blending in `client/src/components/`:** Solved by moving components into `client/src/features/<domain>/components/`.
*   **Fragmented Server Routes (especially for Wallet):** Solved by consolidating routes into `server/src/domains/<domain>/<domain>.routes.ts`.
*   **Orphaned/Misplaced Logic (e.g., Tron, root `lib/`):** Solved by archiving or moving to appropriate structured locations.
*   **Over-reliance on generic `utils.ts` files:** Solved by encouraging domain-specific utils and a clearer `shared/utils` for truly generic code.
*   **Inconsistent Page Naming/Structure:** Addressed by suggestions for `client/src/pages` and feature-based page organization.
*   **Files directly in `server/` root:** Addressed by moving them into `server/src/core/` or `server/src/domains/`.

## 5. Questions to Confirm

*   **`app/dev-tools/page.tsx`:** What is the purpose of this directory and file? It seems like Next.js App Router syntax, but the project uses Vite. Is it for a specific tool or can it be removed/refactored?
*   **`client/public/test-components/`:** Are these for manual testing, Storybook, or something else? Understanding their use can help decide if they should be integrated differently.
*   **`server/migrations/*.ts` files:** The root `migrations/` folder contains SQL files (typical for Drizzle). What is the role of the TypeScript files in `server/migrations/` (e.g., `add-daily-xp-tracking.ts`)? Are they custom programmatic migration scripts, utilities, or can their logic be incorporated into Drizzle's flow or archived if historical?
*   **`lib/` (root level):** Is `lib/wallet/testUtils.ts` the only content? If so, moving it to `tests/utils/` seems appropriate.
*   **`gist/` directory:** Is this user's temporary scratchpad or does it contain project assets/code that need proper integration?
*   **Status of `scripts/archive-tron-integration.sh`:** Has this script been run? Does it comprehensively cover all Tron code, or are there manual steps still needed based on the list in "Files to Archive"?

## 6. Wallet & Engagement System Consolidation Plan (Hybrid DGT/CCPayment)

This section details the refined plan for restructuring the wallet and related engagement features (Tipping, Rain, Airdrop, Vaulting), establishing a hybrid system using CCPayment for real crypto operations and an internal DGT ledger.

**Core Principles for Wallet & Engagement Refactor:**

*   **Single Source of Truth (Crypto):** CCPayment is the source for real crypto balances and transactions. Our server will proxy requests to CCPayment.
*   **DGT Ledger (Internal Token):** DGT is an off-chain token managed in our database. Its transactions are internal.
*   **Unified Services (where sensible):** Server-side services will abstract DGT vs. Crypto complexities for controllers when possible, but underlying services will be distinct (e.g., `dgt.service.ts`, `ccpayment.service.ts`).
*   **Clear Naming:** File and function names will clearly indicate if they relate to DGT, CCPayment, or general operations.
*   **Modular Domains:** Logic will be separated into `wallet` (core balances, DGT/Crypto management), `engagement` (tipping, rain, airdrop, vaulting), and `transactions` (unified query layer).

---

### 6.1. Audit & Analysis of Existing Wallet-Related Files (Summary) @done

*   **Client-Side:**
    *   `client/src/lib/api.ts` (wallet section): Core, to be refactored into `client/src/features/wallet/services/wallet-api.service.ts`. @done
    *   `client/src/payments/ccpayment/*`: Client-side CCPayment SDK likely deprecated/refactored, as secure operations will be backend-brokered.
*   **Server-Side:**
    *   `server/routes/ccpayment-routes.ts` & `server/routes/api/ccpayment/index.ts`: To be refactored. Webhook routes need to be open; user/admin CCPayment routes integrated into respective domains.
    *   `server/services/ccpayment-client.ts`: Core, moves to `server/src/domains/wallet/ccpayment.service.ts`. Will host new CCPayment endpoint methods. @done
    *   `server/services/tip-service-ccpayment.ts`: Core DGT tipping logic moves to `server/src/domains/engagement/tip/tip.service.ts`.
    *   `server/services/tip-service.ts` (Tron-based): Archive. @done
    *   `server/wallet-tip-routes.ts`: Refactor into `server/src/domains/engagement/tip/tip.routes.ts`.
    *   `server/services/rain-service.ts`: Moves to `server/src/domains/engagement/rain/rain.service.ts`.
    *   Legacy wallet routes/utils: Consolidate into new domain-specific services (`dgt.service.ts`, `wallet.service.ts`).

---

### 6.2. Revised Server-Side Module Structure @done

**`server/src/domains/wallet/` (Core Wallet & CCPayment/DGT Management) @done**
*   `wallet.routes.ts` @done
*   `wallet.controller.ts` @done
*   `wallet.service.ts` (Orchestrator for DGT purchase, balance aggregation) @done
*   `ccpayment.service.ts`: `// [REFAC-CCPAYMENT]` `// [MOVED-FROM: server/services/ccpayment-client.ts]` @done
    *   Manages all direct CCPayment API interactions (user wallet creation, deposit addresses, crypto balances, CCPayment transaction history, webhook verification).
    *   Includes methods: `createCcPaymentWalletForUser`, `createDepositAddress`, `getUserCryptoBalances`, `getTransactionHistory` (CCPayment specific).
*   `dgt.service.ts`: `// [REFAC-DGT]` @done
    *   Manages DGT off-chain ledger (balances, grant/deduct, purchase fulfillment, DGT side of engagement features).
*   `wallet.validators.ts` @done
*   `wallet.errors.ts` (Moved from `server/errors/wallet-errors.ts`) @done

**`server/src/domains/engagement/` (New Domain for Interactive Token Features) @in-progress**
*   `tip/` @done
    *   `tip.routes.ts` @done
    *   `tip.controller.ts` @done
    *   `tip.service.ts`: `// [REFAC-TIP]` @done
*   `rain/` @done
    *   `rain.routes.ts` @done
    *   `rain.controller.ts` @done
    *   `rain.service.ts`: `// [REFAC-RAIN]` @done
*   `airdrop/` @done
    *   `airdrop.routes.ts` @done
    *   `airdrop.controller.ts` @done
    *   `airdrop.service.ts`: `// [REFAC-AIRDROP]` @done
*   `vault/` @todo
    *   `vault.routes.ts` @todo
    *   `vault.controller.ts` @todo
    *   `vault.service.ts`: `// [REFAC-VAULT]` @todo
*   `engagement.service.ts`: (Root service orchestrator) @done
    *   *Note: Addressed runtime import errors in analytics controllers (rain, tipping) post-structural migration (May 2025).*

**`server/src/domains/transactions/` (Unified Querying & Shared Logic) @todo**
*   `transaction.routes.ts` @todo
*   `transaction.controller.ts` @todo
*   `transaction.service.ts`: (For querying unified transaction history. Does NOT write transactions). @todo

**`server/src/domains/ccpayment-webhook/` (Secure Webhook Handling) @done**
*   `ccpayment-webhook.routes.ts` (Open endpoint, no user auth middleware). @done
*   `ccpayment-webhook.controller.ts` (Verifies signature, passes to service). @done
*   `ccpayment-webhook.service.ts` (Processes verified webhooks, updates DGT purchases, etc.). @done

---

### 6.3. `schema.ts` Updates & New Tables (Summary) @in-progress

*   **`users` table:**
    *   Add: `ccpaymentAccountId: varchar('ccpayment_account_id', { length: 100 }).nullable()` @done
    *   Deprecate (for direct crypto management): `walletAddress`, `encryptedPrivateKey`. `walletBalanceUsdt` becomes a cached value. @todo
*   **`transactions` table:**
    *   Add: `currency: varchar('currency', { length: 10 }).notNull()` @done
    *   Add: `ccpaymentOrderId: varchar('ccpayment_order_id', { length: 255 }).nullable()` @todo
    *   Add: `source: varchar('source', { length: 50 })` (e.g., 'forum_post', 'shoutbox_rain') @todo
    *   Modify `amount` (bigint): Store consistently in smallest units, consider a `decimalPlaces` column or lookup. @done
    *   `walletId` foreign key to be reviewed/removed if `wallets` table is deprecated. @todo
*   **New Table: `dgt_purchase_orders`** @done
    *   Fields: `id`, `userId`, `dgtAmountRequested`, `cryptoAmountExpected`, `cryptoCurrencyExpected`, `ccpaymentReference`, `status`, `createdAt`, `updatedAt`.
*   **`vaults` table (Existing):**
    *   Add: `currency: varchar('currency', { length: 10 }).notNull()` @done
*   **Review Existing `tipSettings`, `rainSettings`, `user_commands` tables** for alignment with hybrid currency needs. @todo
*   *Note: Clarified `shared/schema.ts` as the active source. Corrected import for `xpAdjustmentLogs` in `xp.service.ts` and updated `drizzle.config.ts` path (May 2025).*

---

### 6.4. Client-Side Structure (`client/src/features/wallet/`) (Summary) @in-progress

*   `components/`: `WalletBalanceDisplay.tsx`, `DepositButton.tsx`, `WithdrawButton.tsx`, `BuyDgtButton.tsx`, `TransactionHistory.tsx` @in-progress
*   `hooks/`: `use-wallet.ts` @done
*   `pages/`: `WalletPage.tsx`. @done
*   `services/`: `wallet-api.service.ts` (replaces `client/src/lib/api.ts` wallet section). @done
*   `utils/`: `wallet-formatters.ts`, `wallet-helpers.ts`. @todo
*   `tests/`: `wallet-api.test.ts` @done

---

## 7. Testing Infrastructure @in-progress

We've established a test infrastructure for the restructured domains:

### 7.1. Server-Side Tests @in-progress

**Wallet Domain Tests: @done**
* `server/test/wallet/dgt-service.test.ts`: Tests for DGT balance operations, transfers, and purchase fulfillment. @done

**CCPayment Webhook Tests: @done**
* `server/test/ccpayment-webhook/webhook.test.ts`: Tests for webhook signature verification and event handling. @done

**Engagement Domain Tests: @in-progress**
* `server/test/engagement/tip.test.ts`: Tests for tipping functionality. @done
* `server/test/engagement/rain.test.ts`: Tests for rain distribution. @done
* `server/test/engagement/airdrop.test.ts`: Tests for airdrop functionality. @todo
* `server/test/engagement/vault.test.ts`: Tests for vault functionality. @todo

### 7.2. Client-Side Tests @in-progress
* `client/src/features/wallet/tests/wallet-api.test.ts`: Tests for wallet API service. @done
* `client/src/features/wallet/tests/use-wallet.test.ts`: Tests for wallet hook. @todo
* `client/src/features/wallet/tests/components/`: Tests for wallet components. @todo

## 8. Final Sprint Plan (May 2025)

The final sprint for the restructuring will focus on completing the remaining tasks and ensuring the system is fully functional with the new architecture.

### 8.1. High-Priority Tasks

1. **Complete Transactions Domain** @high
   * Implement `transactions.service.ts` for unified transaction history querying
   * Build transaction controller and routes
   * Refactor transaction table schema with new fields
   * Update existing code to use the new transaction service

2. **Finish Vault Module in Engagement Domain** @high
   * Implement `vault.service.ts`, `vault.controller.ts`, and `vault.routes.ts`
   * Update existing vault-related code to work with the new domain structure
   * Test vault functionality

3. **Complete Client Feature Migration** @high
   * Finish migrating all wallet components to the features structure
   * Create wallet utils for formatting and validation
   * Update import paths across the codebase
   * Implement client-side tests for wallet features

### 8.2. Medium-Priority Tasks

1. **Schema Refinements** @medium
   * Complete remaining schema updates for transactions table
   * Review and update tipSettings, rainSettings, and user_commands tables
   * Create migration scripts for schema changes

2. **Admin Integration** @medium
   * Ensure admin wallet management interfaces work with new wallet service
   * Update admin dashboard with consolidated transaction data
   * Build admin interfaces for vault management

3. **Documentation Updates** @medium
   * Update API documentation with new endpoints
   * Create architecture diagrams showing the new domain structure
   * Document wallet system interaction patterns for new developers

### 8.3. Lower-Priority Tasks

1. **Client Optimization** @low
   * Implement caching for transaction history and balances
   * Add balance polling for real-time updates
   * Improve error handling and recovery

2. **Additional Test Coverage** @low
   * Add integration tests for wallet and engagement domains
   * Create end-to-end tests for critical wallet operations
   * Implement UI component testing

3. **Performance Monitoring** @low
   * Add logging for key wallet operations
   * Implement transaction performance tracking
   * Create dashboard for monitoring wallet system health

### 8.4. Implementation Plan Timeline

**Week 1 (May 1-7)**
- Complete Transactions domain implementation
- Finish Vault module in Engagement domain
- Update schema for transactions table

**Week 2 (May 8-14)**
- Complete client feature migration
- Update admin interfaces
- Implement core client-side tests

**Week 3 (May 15-21)**
- Finalize all schema migrations
- Update documentation
- Fix any integration issues

**Week 4 (May 22-28)**
- Performance optimization
- Additional test coverage
- Final quality assurance and bug fixes

## 9. Cursor Rules for Development Guidance

To facilitate consistent development practices and ensure all team members follow the restructuring guidelines, we've added the following Cursor rules to the codebase:

### 9.1. Rule Files (in `.cursor/rules/`)

1. **wallet-refactor.mdc** - Guidelines for wallet refactoring:
   - File locations and structure for wallet modules
   - Import reference handling
   - DGT vs CCPayment code organization
   - Key files and documentation references

2. **xp-system.mdc** - Overview of the XP system:
   - Core components and structure
   - Admin interfaces
   - XP source definitions
   - Rewards system architecture
   - Integration with wallet system

3. **import-patterns.mdc** - Best practices for imports:
   - Default vs. named export handling
   - Common import mistakes to avoid
   - Path alias usage
   - Barrel export patterns
   - API service import patterns

4. **admin-structure.mdc** - Admin section organization:
   - Layout patterns and component usage
   - Section organization
   - Data fetching patterns
   - UI component conventions

These rules provide AI-assisted guidance when working in Cursor IDE to maintain code consistency and prevent regressions during the restructuring process.

### 9.2. Usage Guidelines

- Rules are automatically attached to AI conversations in Cursor
- Reference these rules when making changes to related sections of code
- When adding new features, consult the rules for structural guidance
- Update rules as the restructuring progresses or patterns change

The rules complement this document by providing more specific, actionable guidance during daily development.

## 10. Route Migration Progress (May 2025)

### 10.1. Migrated Routes

The following routes have been successfully migrated to the domain-based structure:

1. **Wallet Routes** @done
   * `server/wallet-routes.ts` → `server/src/domains/wallet/wallet.routes.ts`
   * `server/wallet-dgt-routes.ts` → `server/src/domains/wallet/wallet.routes.ts` (consolidated)
   * Legacy files marked with `// ARCHIVED` comment and imports updated in `server/routes.ts`

2. **Tip Routes** @done
   * `server/wallet-tip-routes.ts` → `server/src/domains/engagement/tip/tip.routes.ts`
   * Legacy file marked with `// ARCHIVED` comment and imports updated in `server/routes.ts`

3. **XP Routes** @done
   * `server/xp-routes.ts` → `server/src/domains/xp/xp.routes.ts`
   * Legacy file marked with `// ARCHIVED` comment and imports updated in `server/routes.ts`

4. **Treasury Routes** @done
   * `server/treasury-routes.ts` → `server/src/domains/treasury/treasury.routes.ts`
   * Legacy file marked with `// ARCHIVED` comment and imports updated in `server/routes.ts`

5. **Shoutbox Routes** @done
   * `server/shoutbox-routes.ts` → `server/src/domains/shoutbox/shoutbox.routes.ts`
   * Legacy file marked with `// ARCHIVED` comment and imports updated in `server/routes.ts`

6. **Forum Routes** @done
   * `server/forum-routes.ts` → `server/src/domains/forum/forum.routes.ts`
   * Legacy file marked with `// ARCHIVED` comment and imports updated in `server/routes.ts`
   * Direct route mounting established with `app.use('/api/forum', forumRoutes)`

7. **Editor Routes** @done
   * `server/editor-routes.ts` → `server/src/domains/editor/editor.routes.ts`
   * Legacy file marked with `// ARCHIVED` comment and imports updated in `server/routes.ts`
   * Direct route mounting established with `app.use('/api/editor', editorRoutes)`
   * Added `app.set('storage', storage)` to make storage available to editor routes

8. **Settings Routes** @done
   * `server/settings-routes.ts` → `server/src/domains/settings/settings.routes.ts` 
   * Legacy file marked with `// ARCHIVED` comment and imports updated in `server/routes.ts`
   * Direct route mounting established with `app.use('/api/settings', settingsRoutes)`

9. **Profile Routes** @done
   * `server/profile-routes.ts` → `server/src/domains/profile/profile.routes.ts`
   * Legacy file marked with `// ARCHIVED` comment and imports updated in `server/routes.ts`
   * Direct route mounting established with `app.use('/api/profile', profileRoutes)`

10. **User Relationship Routes** @done
    * `server/user-relationship-routes.ts` → `server/src/domains/social/relationships.routes.ts`
    * Legacy file marked with `// ARCHIVED` comment and imports updated in `server/routes.ts`
    * Direct route mounting established with `app.use('/api/relationships', relationshipsRoutes)`

11. **Message Routes** @done
    * `server/message-routes.ts` → `server/src/domains/messaging/message.routes.ts`
    * Legacy file marked with `// ARCHIVED` comment and imports updated in `server/routes.ts`
    * Direct route mounting established with `app.use('/api/messages', messageRoutes)`

12. **Vault Routes** @done
    * `server/vault-routes.ts` → `server/src/domains/engagement/vault/vault.routes.ts`
    * Legacy file marked with `// ARCHIVED` comment and imports updated in `server/routes.ts`
    * Direct route mounting established with `app.use('/api/vault', vaultRoutes)`

13. **Rain Routes** @done
    * `server/services/rain-service.ts` → `server/src/domains/engagement/rain/rain.service.ts`
    * Legacy file marked with `// ARCHIVED` comment and imports updated in `server/routes.ts`
    * Direct route mounting established with `app.use('/api/engagement/rain', rainRoutes)`
    * Migration included adding rainEvents table to schema and updating shoutbox-routes.ts to use the new service

*Note: Addressed runtime import errors in engagement analytics routes (rain, tipping) post-migration (May 2025).*

### 10.2. Pending Route Migrations (@pending-migration)

The following legacy routes still need to be migrated to the domain-based structure:

1. **Announcement Routes** @pending-migration
   * `server/announcement-routes.ts` → `server/src/domains/admin/sub-domains/announcements/announcements.routes.ts`
   * Currently still using the legacy registerAnnouncementRoutes() pattern

2. **Forum Rules Routes** @pending-migration
   * `server/forum-rules-routes.ts` → `server/src/domains/forum/rules/rules.routes.ts`
   * Currently still using the legacy registerForumRulesRoutes() pattern

3. **Path Routes** @pending-migration
   * `server/path-routes.ts` → `server/src/domains/paths/paths.routes.ts`
   * Currently still using the legacy registerPathRoutes() pattern

4. **DGT Purchase Routes** @pending-migration
   * `server/routes/dgt-purchase-routes.ts` → `server/src/domains/wallet/dgt-purchase/dgt-purchase.routes.ts`
   * Currently still using the legacy registerDgtPurchaseRoutes() pattern

5. **CCPayment Routes** @pending-migration
   * `server/routes/ccpayment-routes.ts` → `server/src/domains/wallet/ccpayment/ccpayment.routes.ts`
   * Currently imported directly rather than using the register pattern

These routes will be migrated after the current launch, but should follow the same pattern as the already migrated routes.

### 10.3. Next Steps

With all primary routes successfully migrated to the domain-based structure, the next steps will be:

1. **Final Testing**
   * Test all migrated routes to ensure they function as expected
   * Verify API documentation is updated to reflect the new route structure

2. **Cleanup**
   * Schedule deletion of all ARCHIVED route files after confirming no imports remain
   * Update any related documentation or comments in the codebase

3. **Admin Routes Consolidation**
   * Review and consolidate any remaining admin-related routes
   * Ensure consistent approach to admin permissions and access control

The route migration has successfully moved all key functionality into a domain-driven design structure, improving code organization and maintainability while preparing for future feature development.

### 10.4. Architectural Improvements

The route migration has introduced several key architectural improvements:

1. **Consistent Module Pattern**
   * All routes now follow the same pattern of exporting a default Router object
   * No more inconsistent `registerXRoutes(app)` functions that mutate the app

2. **Domain-Driven Structure**
   * Routes are organized by domain concern rather than flat files
   * Related functionality is co-located, improving discoverability

3. **Explicit Mounting**
   * All routes are explicitly mounted in server/routes.ts with clear paths
   * No more hidden route registration logic inside module functions

4. **Clear Dependencies**
   * Each route module explicitly imports its dependencies
   * Dependencies between domains are more visible and manageable

These improvements set the foundation for continued refactoring and evolution of the codebase, allowing for better scaling of the application architecture as new features are added.

## 11. Pending Import Fixes (as of May 17, 2025)

The following import errors were identified by `npm run check:imports` and require manual correction:

*   `client/src/components/economy/wallet-modal-v2.tsx:22 - './styles/wallet-animations.css'`
*   `client/src/components/missions/DailyMissions.tsx:22 - '@/hooks/useUser'`
*   `client/src/components/shop/ShopItem.tsx:8 - '@/hooks/useUser'`
*   `client/src/components/shoutbox/ShoutboxContainer.tsx:5 - '@/hooks/useUser'`
*   `client/src/components/xp/XPBarsContainer.tsx:4 - './LevelUpOverlay'`
*   `client/src/features/wallet/components/wallet-balance-display.tsx:3 - './animated-balance'`
*   `client/src/features/wallet/components/wallet-modal-v2.tsx:16 - './deposit-button'`
*   `client/src/features/wallet/components/wallet-modal-v2.tsx:17 - './withdraw-button'`
*   `client/src/features/wallet/components/wallet-modal-v2.tsx:18 - './tip-button'`
*   `client/src/features/wallet/components/wallet-modal-v2.tsx:19 - './rain-button'`
*   `client/src/features/wallet/components/wallet-modal-v2.tsx:20 - './buy-dgt-button'`
*   `client/src/features/wallet/components/wallet-modal-v2.tsx:21 - './transaction-history'`
*   `client/src/hooks/useFeatureGates.ts:3 - '@/hooks/useUser'`
*   `client/src/hooks/useMissions.ts:3 - '@/hooks/useUser'`
*   `client/src/main.tsx:4 - './index.css'`
*   `client/src/pages/admin/reports/index.tsx:3 - '@/components/admin/coming-soon'`
*   `client/src/pages/auth-page.tsx:5 - '@/components/layout/header'`
*   `client/src/pages/forum-rules.tsx:22 - '@/components/ui/spinner'`
*   `client/src/pages/missions/index.tsx:5 - '@/hooks/useUser'`
*   `client/src/providers/app-providers.tsx:2 - '@/components/theme-provider'`
*   `client/src/providers/app-providers.tsx:4 - '@/contexts/auth-context'`
*   `server/src/domains/admin/sub-domains/xp/xp-actions.controller.ts:14 - '@shared/validators/adminXpValidat
ors'`
*   `server/src/domains/admin/sub-domains/xp/xp-actions.controller.ts:16 - './xp-actions.service'`
*   `server/src/domains/engagement/vault/vault.controller.ts:15 - './vault.errors'`
*   `server/src/domains/forum/forum.controller.ts:3 - '@server/src/domains/auth/middleware/auth.middleware'`
*   `server/src/domains/forum/forum.routes.ts:37 - '@server/src/domains/auth/middleware/auth.middleware'`
*   `server/src/domains/missions/missions.admin.controller.ts:9 - './missions.validators'`
*   `server/src/domains/missions/missions.admin.controller.ts:10 - './missions.errors'`
*   `server/src/domains/wallet/dgt.service.ts:31 - './wallet.utils'`
*   `server/src/domains/xp/xp.controller.ts:9 - './xp-action-log.service'`

# Conclusion and Launch Readiness

## Migration Success

The domain-based routing migration has been successfully completed, with all primary routes migrated to the proper domain-based structure. The codebase is now more organized, maintainable, and follows consistent patterns.

### Key Achievements:
- ✅ Migrated 12 main route modules to domain-based architecture
- ✅ Consolidated related functionality into logical domains
- ✅ Established consistent routing patterns
- ✅ Marked legacy files for post-launch cleanup
- ✅ Created validation tools for ongoing quality assurance

### Post-Launch Tasks:
1. Migrate the 5 remaining legacy routes marked as @pending-migration
2. Delete all ARCHIVED route files once all references are confirmed to be updated
3. Fix any remaining TypeScript errors
4. Modernize test suites and improve test coverage
5. Complete the remaining tasks in the wallet refactoring plan

The codebase is now ready for production launch, with a clear path for ongoing improvement and maintenance.

---

_Last updated: May 11, 2025_ 