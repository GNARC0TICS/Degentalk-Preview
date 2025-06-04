# Wallet System & CCPayment Integration Scope - Workspace Edition

**Workspace Objective:** This document outlines the files, dependencies, and setup for the `Wallet-Workspace`. The primary goal is to create a high-fidelity, isolated testbed for developing and verifying DegenTalk's wallet system. This workspace will strictly mirror the main DegenTalk project's structure and file naming conventions to ensure seamless reintegration.

**Initial Focus:**
1.  **Automatic Wallet Creation:** Implement and test the automatic creation of a user wallet immediately upon successful account registration.
2.  **Wallet Display & Interaction:** Set up UI components for displaying wallet balances, transaction history, and user inventory.
3.  **Admin Treasury:** Replicate UI and backend logic for treasury management.
4.  **Supporting Infrastructure:** Copy and configure relevant backend services, routes, utilities, hooks, and context providers.

**Authentication System Replication:**
The workspace will replicate the main DegenTalk authentication system:
*   **Mechanism:** Username/Password login managed by Passport.js (LocalStrategy).
*   **Session Management:** `express-session` middleware with sessions stored in the workspace's PostgreSQL test database via `connect-pg-simple` (configured in `Wallet-Workspace/server/storage.ts`).
*   **Core Setup:** The `setupAuthPassport()` function (from the copied `server/src/domains/auth/auth.routes.ts`) will configure Passport strategies and session settings. The `Wallet-Workspace/server/index.ts` will initialize this.

**Wallet Creation on Signup - Integration Point:**
*   Automatic wallet creation will be triggered within the `register` function of the copied `server/src/domains/auth/controllers/auth.controller.ts`.
*   After a new user is successfully created via `storage.createUser(...)`, a call will be made to `walletService.createInitialWallet(newUser.id)` (from the copied `server/src/domains/wallet/services/wallet.service.ts`).

---

This document outlines the files, dependencies, integration points, and testing considerations for the DegenTalk wallet system, including CCPayment integration. The goal is to prepare a standalone workspace for focused development and verification.

## 1. ✅ Core Wallet & CCPayment Files

This section lists all primary files directly involved in wallet operations, DGT management, and CCPayment processing.

### 1.1. Client-Side Files

*   **Wallet UI Components & Logic:**
    *   `client/src/components/economy/wallet/TransactionSheet.tsx`
    *   `client/src/components/economy/wallet/WalletSheet.tsx`
    *   `client/src/components/economy/wallet/animated-balance.tsx`
    *   `client/src/components/economy/wallet/buy-dgt-button.tsx`
    *   `client/src/components/economy/wallet/deposit-button.tsx`
    *   `client/src/components/economy/wallet/rain-button.tsx`
    *   `client/src/components/economy/wallet/tip-button.tsx`
    *   `client/src/components/economy/wallet/transaction-history.tsx`
    *   `client/src/components/economy/wallet/wallet-address-display.tsx`
    *   `client/src/components/economy/wallet/wallet-balance-display.tsx`
    *   `client/src/components/economy/wallet/wallet-balance.tsx`
    *   `client/src/components/economy/wallet/wallet-modal-v2.tsx`
    *   `client/src/components/economy/wallet/withdraw-button.tsx`
    *   `client/src/components/economy/wallet-display.tsx`
    *   `client/src/components/economy/styles/wallet-animations.css`
    *   `client/src/components/sidebar/wallet-summary-widget.tsx`
*   **Wallet Context & Hooks:**
    *   `client/src/contexts/wallet-context.tsx`
    *   `client/src/features/wallet/hooks/use-wallet.ts`
    *   `client/src/features/wallet/hooks/use-wallet-modal.ts`
    *   `client/src/hooks/use-tip.ts`
    *   `client/src/hooks/use-rain.ts`
    *   `client/src/hooks/useDgtPurchase.ts`
*   **Wallet Pages & Services (Client-Features):**
    *   `client/src/features/wallet/pages/WalletPage.tsx`
    *   `client/src/features/wallet/services/wallet-api.service.ts`
    *   `client/src/pages/wallet.tsx`
*   **CCPayment Client-Side Integration:**
    *   `client/src/payments/ccpayment/ccpayment-client.ts`
    *   `client/src/payments/ccpayment/deposit.ts`
    *   `client/src/payments/ccpayment/withdraw.ts`
    *   `client/src/payments/ccpayment/swap.ts`
    *   `client/src/payments/ccpayment/types.ts`
    *   `client/src/payments/ccpayment/utils.ts`
    *   `client/src/payments/ccpayment/index.ts`
*   **General Payment Components:**
    *   `client/src/components/payment/PaymentForm.tsx`
*   **Type Definitions:**
    *   `client/src/types/wallet.ts`

### 1.2. Server-Side Files

*   **Core Wallet Domain:**
    *   `server/src/domains/wallet/wallet.service.ts`
    *   `server/src/domains/wallet/wallet.controller.ts`
    *   `server/src/domains/wallet/wallet.routes.ts`
    *   `server/src/domains/wallet/wallet.validators.ts`
    *   `server/src/domains/wallet/wallet.constants.ts`
    *   `server/src/domains/wallet/dgt.service.ts`
*   **CCPayment Server-Side Integration:**
    *   `server/src/domains/wallet/ccpayment.service.ts`
    *   `server/src/domains/ccpayment/services/ccpayment-client.ts`
    *   `server/src/domains/ccpayment/routes/ccpayment/deposit.ts`
    *   `server/src/domains/ccpayment/routes/ccpayment/withdraw.ts`
    *   `server/src/domains/ccpayment/routes/ccpayment/webhook.ts`
    *   `server/src/domains/ccpayment-webhook/ccpayment-webhook.service.ts`
    *   `server/src/domains/ccpayment-webhook/ccpayment-webhook.controller.ts`
    *   `server/src/domains/ccpayment-webhook/ccpayment-webhook.routes.ts`
    *   `server/src/domains/ccpayment/types.ts`
*   **Engagement Features (Tipping, Rain, Airdrop):**
    *   `server/src/domains/engagement/tip/tip.service.ts`
    *   `server/src/domains/engagement/tip/tip.controller.ts`
    *   `server/src/domains/engagement/tip/tip.routes.ts`
    *   `server/src/domains/tipping/services/tip-service-ccpayment.ts`
    *   `server/src/domains/engagement/rain/rain.service.ts`
    *   `server/src/domains/engagement/rain/rain.controller.ts`
    *   `server/src/domains/engagement/rain/rain.routes.ts`
    *   `server/src/domains/engagement/airdrop/airdrop.service.ts`
    *   `server/src/domains/engagement/airdrop/airdrop.controller.ts`
    *   `server/src/domains/engagement/airdrop/airdrop.routes.ts`
*   **Treasury Management:**
    *   `server/src/domains/admin/sub-domains/treasury/treasury.service.ts`
    *   `server/src/domains/admin/sub-domains/treasury/treasury.controller.ts`
    *   `server/src/domains/admin/sub-domains/treasury/treasury.routes.ts`
    *   `server/src/domains/admin/sub-domains/treasury/treasury.validators.ts`
*   **Server-Side Utilities & Validators:**
    *   `server/src/utils/walletEngine.ts`
    *   `server/src/core/wallet-validators.ts`

### 1.3. Database Schema Files

*   `db/schema/economy/wallets.ts`
*   `db/schema/economy/transactions.ts`
*   `db/schema/economy/dgtPackages.ts`
*   `db/schema/economy/dgtPurchaseOrders.ts`
*   `db/schema/economy/withdrawalRequests.ts`
*   `db/schema/economy/postTips.ts`
*   `db/schema/economy/rainEvents.ts`
*   `db/schema/economy/airdropRecords.ts`
*   `db/schema/economy/airdropSettings.ts`
*   `db/schema/economy/treasurySettings.ts`
*   `db/schema/economy/settings.ts`

### 1.4. Admin Interface Files (Client-Side)

*   `client/src/pages/admin/wallets/index.tsx`
*   `client/src/pages/admin/transactions/index.tsx`
*   `client/src/pages/admin/dgt-packages.tsx`
*   `client/src/pages/admin/treasury.tsx`
*   `client/src/pages/admin/tip-rain-settings.tsx`
*   `client/src/pages/admin/airdrop.tsx`
*   `client/src/components/admin/wallet/mock-webhook-trigger.tsx`

### 1.5. Testing Files

*   `client/src/features/wallet/tests/wallet-api.test.ts`
*   `server/src/test/ccpayment-webhook/webhook.test.ts`
*   `server/src/test/engagement/tip.test.ts`
*   `server/src/test/wallet/dgt-service.test.ts`
*   `lib/wallet/testUtils.ts`

### 1.6. Documentation

*   `docs/CCPAYMENT.md`
*   `docs/wallet-system.md`
*   `docs/dgt-token-management-plan.md`

## 2. Phase 1 Dependency Map

This section details the dependencies identified from analyzing key wallet system files.

### 2.1. External NPM Package Dependencies:

*   **`@neondatabase/serverless`**: Used by `server/src/core/db.ts` for Neon database connection.
*   **`@tanstack/react-query`**: Used by `client/src/lib/queryClient.ts` for client-side state management.
*   **`axios`**: Used by `client/src/payments/ccpayment/ccpayment-client.ts`, `server/src/domains/wallet/ccpayment.service.ts`, and potentially by `client/src/lib/queryClient.ts` (legacy `api` instance).
*   **`drizzle-orm`** (and `drizzle-orm/neon-serverless`): Used by server-side services (`wallet.service.ts`, `dgt.service.ts`) and `server/src/core/db.ts` for database interactions.
*   **`express`**: Types used in `server/src/core/errors.ts`. Full package likely needed if setting up a minimal Express server in the workspace.
*   **`uuid`**: Used by server-side services (`wallet.service.ts`, `dgt.service.ts`) for generating unique identifiers.
*   **`ws`**: Used by `server/src/core/db.ts` as WebSocket constructor for Neon.
*   **`crypto`** (Node.js built-in): Used by `server/src/domains/wallet/ccpayment.service.ts` for creating signatures.
*   **`fs`** (Node.js built-in): Used by `server/src/core/logger.ts` for file system operations (logging to file).
*   **`path`** (Node.js built-in): Used by `server/src/core/logger.ts` for path manipulation.

### 2.2. Internal Shared Module Dependencies & Status:

*   **`Wallet-Workspace/server/src/core/logger.ts`** (imported by `wallet.service.ts`, `dgt.service.ts`, `ccpayment.service.ts`, `db.ts` as `../../core/logger` or `./logger`)
    *   Status: ✅ **Already copied.**
    *   Role: Provides logging capabilities for the server-side services.
*   **Database Instance (`@db`)** (imported by `wallet.service.ts`, `dgt.service.ts`, `ccpayment.service.ts`)
    *   Resolves to `Wallet-Workspace/server/src/core/db.ts`.
    *   Status: ✅ **Already copied.**
    *   Role: Provides the configured Drizzle ORM database instance for queries.
*   **`Wallet-Workspace/server/src/core/errors.ts`** (imported by `wallet.service.ts`, `dgt.service.ts`, `ccpayment.service.ts` as `../../core/errors`)
    *   Status: ✅ **Already copied.**
    *   Role: Defines custom error classes (`WalletError`) and error codes (`ErrorCodes`) for consistent error handling.
*   **`Wallet-Workspace/client/src/lib/queryClient.ts`** (imported by `wallet-api.service.ts` as `@/lib/queryClient`)
    *   Status: ✅ **Already copied.**
    *   Role: Provides the `apiRequest` function (using `fetch`), `QueryClient` instance for `@tanstack/react-query`, and client-side XP gain event handling.
*   **Schema Files (`@schema`)** (imported by `wallet.service.ts`, `dgt.service.ts`, `ccpayment.service.ts`)
    *   Resolves to files within `Wallet-Workspace/db/schema/`.
    *   Status: ✅ **Already copied.**
    *   Role: Provides Drizzle schema definitions.
*   **Local Wallet Domain Services & Constants (Server-Side):**
    *   `Wallet-Workspace/server/src/domains/wallet/dgt.service.js` (imported by `wallet.service.ts`)
        *   Status: ✅ **Already copied.**
    *   `Wallet-Workspace/server/src/domains/wallet/ccpayment.service.js` (imported by `wallet.service.ts`)
        *   Status: ✅ **Already copied.**
    *   `Wallet-Workspace/server/src/domains/wallet/wallet.constants.ts` (imported by `dgt.service.ts`, `ccpayment.service.ts`)
        *   Status: ✅ **Already copied.**
*   **Local CCPayment Client Utilities (Client-Side):**
    *   `Wallet-Workspace/client/src/payments/ccpayment/utils.ts` (imported by `ccpayment-client.ts`)
        *   Status: ✅ **Already copied.**
    *   `Wallet-Workspace/client/src/payments/ccpayment/types.ts` (imported by `ccpayment-client.ts`)
        *   Status: ✅ **Already copied.**

### 2.3. Environment Variable References:

*   **Server-Side (`process.env`):**
    *   `DATABASE_URL` (implicitly by `@db` setup)
    *   `CCPAYMENT_API_URL` (used in `ccpayment.service.ts`)
    *   `CCPAYMENT_APP_ID` (used in `ccpayment.service.ts`)
    *   `CCPAYMENT_APP_SECRET` (used in `ccpayment.service.ts`)
    *   `CCPAYMENT_NOTIFICATION_URL` (used in `ccpayment.service.ts`)
    *   `CCPAYMENT_WEBHOOK_URL` (mentioned in `ccpayment.service.ts`, likely used by webhook handler)
    *   `JWT_SECRET` (likely for auth middleware if protecting wallet routes)
*   **Client-Side (Vite `import.meta.env`):**
    *   `VITE_CCPAYMENT_API_URL` (used in `ccpayment-client.ts`)
    *   `VITE_CCPAYMENT_APP_ID` (used in `ccpayment-client.ts`)
    *   `VITE_CCPAYMENT_APP_SECRET` (used in `ccpayment-client.ts`)
    *   `VITE_API_URL` (used in `queryClient.ts` for the `axios` instance `api`)

### 2.4. Interactions with XP, Shop, User Balance (from analyzed files):

*   **User Balances:**
    *   `wallet.service.ts`: Orchestrates DGT and crypto balance display.
    *   `dgt.service.ts`: Directly manages `users.dgtWalletBalance` and records DGT `transactions`.
    *   `ccpayment.service.ts` (server): Interacts with external CCPayment for crypto movements; webhook processing (placeholder) would trigger internal balance updates.
    *   `wallet-api.service.ts` (client): Interface for all balance-related operations.
    *   `ccpayment-client.ts` (client): Initiates crypto deposit/withdrawal with CCPayment.
*   **XP System:**
    *   `queryClient.ts` (client): Contains significant client-side logic (`checkForXpGain`, `setupXpGainListener`, `setupLevelUpListener`) to detect XP/level-up data in API responses and dispatch DOM events for UI updates (toasts, modals). This implies backend API responses for various actions (including wallet actions) are expected to carry XP-related fields.
    *   `dgt.service.ts` (server): No direct XP calls, but actions like `fulfillDgtPurchase` or `transferDgt` are candidates for triggering XP events on the backend, which would then be reflected in API responses picked up by `queryClient.ts`.
*   **Shop/Purchase Logic:**
    *   `dgt.service.ts` (server): `fulfillDgtPurchase` method is central to DGT purchases, updating `dgtPurchaseOrders`.
    *   `wallet-api.service.ts` (client): `createDgtPurchase()` method initiates DGT purchases.
*   **Treasury System:**
    *   `dgt.service.ts` (server): `transferDgt` method calculates transaction fees and credits them to `DGT_TREASURY_USER_ID`.

## 3. 💡 File Role Descriptions

*(This section is to be populated with brief descriptions of each file's purpose from Section 1 during the workspace setup and documentation phase. Example: `client/src/components/economy/wallet/WalletSheet.tsx`: Provides the main user interface for viewing balances, transaction history, and initiating wallet actions like deposit/withdraw/tip.)*

## 4. 🧩 Coupling Notes & Potential Challenges

*   **XP Hooks:** Wallet actions (e.g., tipping, DGT purchase, first deposit) might trigger XP gains. The `server/src/domains/xp/events/xp.events.ts` and `xp.service.ts` will need careful consideration. For the standalone workspace, these might be stubbed or disabled.
*   **Shop Purchases:** If DGT is a payment method in the shop, `server/src/domains/shop/` logic will interact with the wallet service to debit DGT. This coupling needs to be managed.
*   **User Authentication:** All wallet operations are user-specific, requiring robust auth integration.
*   **Admin Controls:** Admin actions (e.g., manual balance adjustments, viewing user wallets) are tightly coupled.
*   **Database Transactions:** Ensuring atomicity for operations involving multiple table updates (e.g., a DGT purchase updating `wallets`, `transactions`, and `dgtPurchaseOrders`) is critical.
*   **CCPayment Webhook Reliability:** The webhook handler (`server/src/domains/ccpayment-webhook/`) is critical for updating transaction statuses. Testing this in isolation will require a way to simulate webhook calls.
*   **Configuration Management:** Settings from `db/schema/economy/settings.ts`, `db/schema/economy/treasurySettings.ts`, etc., will influence wallet behavior. These need to be configurable in the test environment.

## 5. Workspace Preparation Notes

*   **Directory Structure:** The new workspace should mirror the relevant parts of the DegenTalk structure (e.g., `new_workspace/client/src/...`, `new_workspace/server/src/...`).
*   **Environment Variables (`.env.local`):** As listed in Section 2.
*   **Mock Data:**
    *   Mock user accounts.
    *   Mock CCPayment API responses for various scenarios.
    *   Seed data for `dgtPackages`, `economySettings`.
*   **Scripts:**
    *   Database migration/seeding scripts for the test environment.
*   A simplified server entry point for the standalone wallet API.
*   A simplified client entry point to render wallet components.
*   **Environment Variable Loading:** Ensure `server/index.ts` explicitly loads `.env.local` (e.g., using `dotenv.config({ path: path.resolve(__dirname, '../.env.local') });`) if environment variables are not automatically picked up by the execution environment (like `tsx`).

### 5.1. Drizzle ORM & Schema Setup Notes
*   **Dependencies:** Ensure `drizzle-orm`, `drizzle-kit`, and `drizzle-zod` (if used for schema validation) are installed as project dependencies. Verify compatibility between these versions and with related packages like `@neondatabase/serverless`. Update them as needed (e.g., `npm install drizzle-orm@latest @neondatabase/serverless@latest drizzle-kit@latest drizzle-zod@latest`).
*   **Schema Barrel File (`db/schema/index.ts`):**
    *   This file must export all schema definitions (tables, enums) that Drizzle Kit needs to process.
    *   The order of exports is critical. Files defining tables or enums must be exported *before* files that depend on them. For example:
        1.  Core enums (`core/enums.ts`).
        2.  Tables referenced by `users` (e.g., `economy/titles.ts`, `economy/badges.ts`, `user/avatarFrames.ts`, `user/userGroups.ts`).
        3.  The `users` table itself (`user/users.ts`).
        4.  Tables that reference `users` (e.g., `economy/wallets.ts`, then `economy/transactions.ts`).
*   **Out-of-Scope Foreign Keys:** For tables included in the workspace schema that reference tables *not* included (e.g., `post_tips` referencing a `posts` table from a forum domain), the foreign key definition in the schema file (e.g., in `postTips.ts`) should be commented out or removed to prevent "relation does not exist" errors during `drizzle-kit push`. The corresponding import for the out-of-scope table should also be commented out.
*   **Running Drizzle Kit Commands:**
    *   It might be necessary to prefix `drizzle-kit` commands (like `push` or `generate`) with the database URL environment variable if `dotenv/config` within `drizzle.config.ts` is not reliably picked up by all `drizzle-kit` execution contexts. Example: `TEST_DATABASE_URL="your_db_url" npx drizzle-kit push`.
    *   Use `npx drizzle-kit push` (or the dialect-specific variant if preferred, like `push:pg`, though `push` is generally recommended with modern Drizzle Kit if the dialect is in `drizzle.config.ts`).

## 6. # Full Integration Plan

This section will detail how the isolated and verified wallet module will be reintegrated or interact with the main DegenTalk platform.

### 6.1. API Endpoints & Hooks

*   **User Routes (`/api/user`):**
    *   User profile endpoints might fetch wallet summaries.
    *   User registration could trigger initial wallet creation.
*   **XP / Rewards Logic:**
    *   The `XPEvents` system (`server/src/domains/xp/events/xp.events.ts`) will listen for wallet-related events.
    *   Wallet service methods will need to emit these events.
*   **Shop Purchase Logic (`/api/shop`):**
    *   If DGT is used for payment, the shop service will call the wallet service to check balance and debit DGT.
*   **Admin Wallet Controls (`/api/admin/wallet`):**
    *   Admin APIs will directly call wallet and economy services.
    *   Client-side admin pages will consume these admin APIs.
*   **Profile + Settings UIs (Client-Side):**
    *   User profile pages will display wallet balances/history using `use-wallet` hook.
    *   User settings might include wallet-related notification preferences.

### 6.2. Data Flow

*   Wallet data managed by `WalletService`, stored in `wallets` table.
*   Transactions recorded in `transactions` table.
*   CCPayment interactions via `CCPaymentService`, statuses updated via webhooks.
*   Client UI fetches data via `wallet-api.service.ts`, updates via `WalletContext` and `use-wallet`.

## 7. 💼 CCPayment Notes

*   **SDK/API Files Used:**
    *   Client: `client/src/payments/ccpayment/ccpayment-client.ts`
    *   Server: `server/src/domains/ccpayment/services/ccpayment-client.ts`, `server/src/domains/wallet/ccpayment.service.ts`.
*   **Key CCPayment Functions Mapping:**
    *   **Deposit:** Client initiates -> Server creates CCPayment order -> Webhook updates status.
    *   **Withdrawal:** Client initiates -> Server validates & calls CCPayment API -> Webhook/polling for status.
        *   `//TODO: Clarify if withdrawals are fully API-driven or require manual approval on CCPayment dashboard initially.`
    *   **Tip / DGT Transfer (Internal):** Primarily internal balance updates; `tip-service-ccpayment.ts` if off-platform currency movement is involved.
*   **Expected Outputs from CCPayment:**
    *   Deposit: Order ID, payment address, QR data, status.
    *   Withdrawal: Transaction ID, status.
    *   Balance Checks: `//TODO: Confirm if platform needs to query its own CCPayment balances.`
*   **Assumptions:**
    *   Secure storage of CCPayment API keys.
    *   Publicly accessible and secured webhook endpoint.
    *   Primary use of USDT for deposits/withdrawals via CCPayment.
    *   Initial withdrawal processing might involve manual steps, aiming for automation.
    *   Currency conversion rates handled externally or by fixed rates (out of current scope).

## 8. 🧪 Testing Plan Outline

*   **Unit Tests:** For services, validators, utility functions.
*   **Integration Tests:** For flows like deposit, withdrawal, DGT purchase, tipping, rain; interaction between services; database interactions.
*   **API Endpoint Tests:** For all wallet and CCPayment related API routes.
*   **Client-Side Component Tests:** For rendering and user interactions in wallet components.
*   **End-to-End (E2E) Tests (Simplified for standalone workspace):**
    *   Simulate full user flows: register (mocked), deposit, check balance, tip, withdraw.
    *   `//TODO: Define specific E2E scenarios for the standalone workspace.`

### 8.1. Frontend Testing Environment & Tools
The Wallet-Workspace frontend (client/) is built with Vite and React. To create a comprehensive testing ground for all frontend features, consider leveraging the following tools and approaches:
*   **Vitest:** Already included in `devDependencies`. Use for unit and integration testing of React components, hooks, utility functions, and services (e.g., `wallet-api.service.ts`). Write tests to ensure individual pieces of logic behave as expected.
*   **React Testing Library (@testing-library/react):** Works seamlessly with Vitest. Use it to test components from a user's perspective, focusing on interactions and rendered output rather than implementation details. This helps ensure components are accessible and function correctly.
*   **Playwright or Cypress:** For End-to-End (E2E) tests. These tools automate browser interactions, allowing you to test complete user flows through the UI (e.g., logging in, navigating to the wallet page, performing a deposit, verifying balance updates). Playwright is often well-regarded in Vite projects.
*   **Storybook:** For developing and showcasing UI components in isolation. This allows you to build and test components with various props and states without needing to run the full application. It's excellent for visual regression testing and ensuring component reusability.
*   **Mock Service Worker (MSW) or similar:** To mock API responses during frontend testing. This allows you to test UI interactions with the backend in a controlled manner without relying on a live server, making tests faster and more reliable.

The goal is to establish a robust testing environment that covers different levels (unit, integration, E2E) and aspects (logic, rendering, user flows) of the frontend wallet features.

## 9. //TODO: Missing or Unclear Items

*   `//TODO: Clarify the exact mechanism for DGT purchase (e.g., CCPayment for fiat, then DGT issuance, or direct crypto-to-DGT swap).`
*   `//TODO: Determine if `client/src/lib/wallet-service.ts` is current or legacy; its role alongside `client/src/features/wallet/services/wallet-api.service.ts`. (Based on tree, `client/src/features/wallet/services/wallet-api.service.ts` seems more current and domain-specific).`
*   `//TODO: Confirm the full list of required environment variables beyond the obvious CCPayment and DB vars during workspace setup.`
*   `//TODO: Detail the error handling strategy for CCPayment API failures and webhook issues.`
*   `//TODO: Specify how currency precision and rounding are handled, especially for DGT and USDT.`
*   `//TODO: Document any specific security considerations for handling wallet operations and API keys.`
*   `//TODO: Populate Section 3 (File Role Descriptions) thoroughly.`
