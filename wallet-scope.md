# Wallet System & CCPayment Integration Scope

This document outlines the files, dependencies, integration points, and testing considerations for the Degentalk™™ wallet system, including CCPayment integration. The goal is to prepare a standalone workspace for focused development and verification.

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
    *   `server/src/utils/wallet-utils.ts`
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

## 2. 🔁 Dependencies & Shared Modules

This section lists modules and files that the wallet system depends on but are not exclusively part of it. These will need to be available or mocked in the standalone workspace.

*   **User System:**
    *   `db/schema/user/users.ts`
    *   `server/src/domains/auth/` (entire domain for auth services and middleware)
    *   `client/src/hooks/use-auth.tsx`
*   **Database & Core Server:**
    *   `server/src/core/db.ts`
    *   `server/src/core/logger.ts`
    *   `server/src/core/errors.ts`
    *   `server/src/core/middleware.ts` (relevant shared middleware)
    *   `drizzle.config.ts`
    *   Relevant migration files from `migrations/`
*   **XP System (as an integration point):**
    *   `db/schema/economy/xpActionSettings.ts`
    *   `db/schema/economy/xpAdjustmentLogs.ts`
    *   `server/src/domains/xp/xp.service.ts`
    *   `server/src/domains/xp/events/xp.events.ts`
*   **Shop System (as an integration point):**
    *   `db/schema/shop/orders.ts`
    *   `db/schema/shop/orderItems.ts`
    *   `server/src/domains/shop/shop.routes.ts` (and its service/controller)
    *   `client/src/hooks/use-shop-items.tsx`
*   **Shared Client Utilities:**
    *   `client/src/core/queryClient.ts` (or `client/src/lib/queryClient.ts`)
    *   `client/src/lib/api.ts` (if still used by any identified wallet files)
    *   `client/src/lib/utils.ts`
    *   `client/src/components/ui/` (relevant common UI components like buttons, modals, inputs)
*   **Shared Server Utilities:**
    *   `server/src/utils/environment.ts`
*   **Shared Types/Constants:**
    *   `shared/constants.ts`
    *   `shared/types.ts`
*   **Environment Variables:**
    *   A `.env.local` file in the new workspace will be needed with:
        *   `DATABASE_URL`
        *   `CCPAYMENT_APP_ID`
        *   `CCPAYMENT_API_KEY` (or `CCPAYMENT_APP_SECRET`)
        *   `CCPAYMENT_WEBHOOK_SECRET`
        *   `JWT_SECRET`
        *   `//TODO: Identify any other critical env vars for wallet/ccpayment during workspace setup.`

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

*   **Directory Structure:** The new workspace should mirror the relevant parts of the Degentalk™™ structure (e.g., `new_workspace/client/src/...`, `new_workspace/server/src/...`).
*   **Environment Variables (`.env.local`):** As listed in Section 2.
*   **Mock Data:**
    *   Mock user accounts.
    *   Mock CCPayment API responses for various scenarios.
    *   Seed data for `dgtPackages`, `economySettings`.
*   **Scripts:**
    *   Database migration/seeding scripts for the test environment.
    *   A simplified server entry point for the standalone wallet API.
    *   A simplified client entry point to render wallet components.

## 6. # Full Integration Plan

This section will detail how the isolated and verified wallet module will be reintegrated or interact with the main Degentalk™™ platform.

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

## 9. //TODO: Missing or Unclear Items

*   `//TODO: Clarify the exact mechanism for DGT purchase (e.g., CCPayment for fiat, then DGT issuance, or direct crypto-to-DGT swap).`
*   `//TODO: Determine if `client/src/lib/wallet-service.ts` is current or legacy; its role alongside `client/src/features/wallet/services/wallet-api.service.ts`. (Based on tree, `client/src/features/wallet/services/wallet-api.service.ts` seems more current and domain-specific).`
*   `//TODO: Confirm the full list of required environment variables beyond the obvious CCPayment and DB vars during workspace setup.`
*   `//TODO: Detail the error handling strategy for CCPayment API failures and webhook issues.`
*   `//TODO: Specify how currency precision and rounding are handled, especially for DGT and USDT.`
*   `//TODO: Document any specific security considerations for handling wallet operations and API keys.`
*   `//TODO: Populate Section 3 (File Role Descriptions) thoroughly.`
