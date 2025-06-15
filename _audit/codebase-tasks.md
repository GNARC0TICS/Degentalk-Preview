# Codebase Tasks Extracted from Audit (2025-06-14)

This document outlines actionable tasks extracted from the initial codebase audit conducted on 2025-06-14. Tasks are organized by priority and domain/subsystem, with a separate section for wallet-related issues as per user guidance. Non-wallet tasks are prioritized based on user-defined immediate priorities focusing on core stability, security, and startup integrity, followed by system safety and developer experience (DX) improvements. Wallet tasks are grouped separately with lower priority, to be addressed pre-launch after other functionalities are resolved.

## Immediate Must-Fix Tasks (Top 6 Blocker-Class Priorities)

These tasks address core stability, security, and startup integrity risks that could silently break production or complicate other features. They are the first to be tackled as per user direction.

### Server Security & Middleware
1.  - [ ] **File: server/src/domains/admin/admin.middleware.ts**
    -   **Issue:** Raw SQL strings embedded in code (Lines 31–47) pose a risk of SQL injection in future modifications.
    -   **Task:** Replace raw SQL with Drizzle query builder calls for ORM consistency and automatic SQL-injection protection.
    -   **Severity:** Critical (Security Risk)
    -   **Impact:** Eliminates SQL injection risk, security-critical.

2.  - [ ] **File: server/src/domains/admin/admin.middleware.ts**
    -   **Issue:** `req.login` callback nested in async function (Lines 50–61) leads to unhandled promise rejections if it throws.
    -   **Task:** Wrap `req.login` in a `promisify` helper or use a Promise-based wrapper to ensure `try/catch` captures errors.
    -   **Severity:** Critical (Error Handling)
    -   **Impact:** Prevents silent auth failures and uncaught promise rejections, ensures auth integrity and session flow safety.

3.  - [ ] **File: server/index.ts**
    -   **Issue:** Sensitive response bodies logged via `capturedJsonResponse` (Lines 169–192) may leak PII in production.
    -   **Task:** Add a `SAFE_LOG_FIELDS` allow-list for logging JSON responses or disable body logging in production.
    -   **Severity:** Critical (Privacy/Security Risk)
    -   **Impact:** Prevents potential PII leaks.

4.  - [ ] **File: server/index.ts**
    -   **Issue:** Startup script awaits seed functions without timeouts (Lines 94–130), risking server boot hangs.
    -   **Task:** Spawn seed scripts in parallel with `Promise.allSettled` after HTTP server is listening, and implement per-seed timeouts.
    -   **Severity:** Critical (Startup Reliability)
    -   **Impact:** Enhances production startup resilience.

5.  - [ ] **File: server/src/middleware/mission-progress.ts**
    -   **Issue:** Monkey-patching `res.send` risks double-send issues if controller mutates `res.send`.
    -   **Task:** Use Express `on-finished` package to safely run post-response hooks without overriding `res.send`.
    -   **Severity:** Critical (Potential Runtime Errors)
    -   **Impact:** Prevents rogue double responses, which are hard to debug.

### Database Schema Safety
6.  - [ ] **Files: migrations/postgres/*.sql (e.g., 0001_orange_norrin_radd.sql, etc.)**
    -   **Issue:** Destructive `DROP TABLE CASCADE` statements without `IF EXISTS` risk CI/CD failures and data loss.
    -   **Task:** Replace drops with `ALTER TABLE RENAME TO <legacy_*>` or use `IF EXISTS` with explicit comments for unavoidable drops.
    -   **Severity:** Critical (Data Loss Risk)
    -   **Impact:** Ensures data safety and CI/CD pipeline stability.

## Phase Two Priorities (Next 6 for System Safety & DX)

These tasks address high-leverage or noisy problem areas with ongoing developer and user experience costs but are not immediate blockers. They follow the must-fix tasks as per user direction.

### Server Security & Middleware
7.  - [ ] **File: server/src/domains/admin/admin.middleware.ts**
    -   **Issue:** Reliance on denormalized `role` column (Lines 70–77) inconsistent with RBAC used elsewhere, risking auth failures.
    -   **Task:** Migrate to proper RBAC check (e.g., `isUserInRole(user.id, 'admin')`) using `roles`/`rolePermissions` tables.
    -   **Severity:** High (Authentication Integrity)
    -   **Impact:** Centralizes and future-proofs access control for long-term permission flexibility.

8.  - [ ] **File: server/index.ts**
    -   **Issue:** Custom JSON-capture logger mutates `res.json` (Lines 60–77), risking middleware conflicts.
    -   **Task:** Replace with a lightweight `morgan`-style logger that does not mutate core methods.
    -   **Severity:** High (Middleware Integrity)
    -   **Impact:** Resolves middleware conflicts.

### Database Schema Safety
9.  - [ ] **File: db/schema/admin/auditLogs.ts**
    -   **Issue:** `before` and `after` JSONB columns lack explicit nullability, causing TypeScript/DB mismatch.
    -   **Task:** Mark `before` and `after` as `.nullable()` and update generated types accordingly.
    -   **Severity:** High (Type Safety)
    -   **Impact:** Ensures type safety across audit logging.

### Forum & Client Components
10. - [ ] **Files: client/src/components/forum/category-card.tsx, forum-category-card.tsx, forum-card.tsx**
    -   **Issue:** Duplicate components with similar data and markup, inconsistent naming, and routing strategies.
    -   **Task:**
        - [ ] Extract into a single `ForumEntityCard` component with a `variant` prop.
        - [ ] Standardize navigation with a `useNavigate()` hook.
        - [ ] Deprecate legacy components.
    -   **Severity:** Medium (Code Duplication, Maintainability)
    -   **Impact:** Enhances DRYness, visual consistency, and easier feature rollout.

11. - [ ] **File: client/src/contexts/ForumStructureContext.tsx & client/src/features/forum/hooks/useForumStructure.ts**
    -   **Issue:** Dual source of truth for forum structure data with duplication, divergent types, and performance issues.
    -   **Task:**
        - [ ] Deprecate legacy hook.
        - [ ] Memoize `mergeStaticAndApiData` with `useMemo`.
        - [ ] Code-split provider logic.
        - [ ] Add ESLint rule for migration.
    -   **Severity:** Medium (Performance, Maintainability)
    -   **Impact:** Simplifies core data flow.

### Server Performance & Structure
12. - [ ] **File: server/storage.ts**
    -   **Issue:** 300-line 'god module' mixing multiple domains (Lines 268–276), violating single-responsibility.
    -   **Task:** Extract domain-specific helpers into smaller services (e.g., `UserStore`, `ForumStore`) and inject where needed.
    -   **Severity:** Medium (Code Organization)
    -   **Impact:** Improves maintainability and reduces cognitive load.

## Medium-Term Tasks (After Above Are Stable)

These tasks can be prioritized based on available frontend/backend bandwidth and are suitable for parallel execution as JIRA-style tasks.

### General Code Quality & Features
13. - [ ] **File: db/schema/admin/auditLogs.ts**
    -   **Issue:** Primary key alias mismatch (`log_id` vs `id`) confuses TypeScript types.
    -   **Task:** Rename PK field to `logId` or `auditLogId` to match DB column and Drizzle model.
    -   **Severity:** High (Type Safety)

14. - [ ] **File: server/src/domains/admin/admin.service.ts**
    -   **Issue:** Expensive `getDashboardStats()` query without caching, hard-to-maintain SQL, and singleton export issues.
    -   **Task:**
        - [ ] Extract metrics to SQL views.
        - [ ] Memoize/cache stats (e.g., Redis 30s TTL).
        - [ ] Instantiate service per-request or use DI.
    -   **Severity:** Medium (Performance, Testability)
    -   **Impact:** Dashboard stats service refactor.

15. - [ ] **File: server/routes.ts**
    -   **Issue:** Hard-coded `hotThreads` JSON (Lines 46-115) bloats bundle and violates DRY.
    -   **Task:** Move hard-coded data to integration test fixtures, not production code.
    -   **Severity:** Medium (Bundle Size, Maintainability)
    -   **Impact:** Replace hotThreads JSON with fixtures.

16. - [ ] **Multiple Files (e.g., client/src/components/layout/announcement-ticker.tsx, etc.)**
    -   **Issue:** Unused icon imports and mixed alias usage causing bundle size and build issues.
    -   **Task:**
        - [ ] Enforce ESLint rules for unused vars.
        - [ ] Add `eslint-plugin-boundaries` for alias groups.
        - [ ] Create `lint:imports` script.
    -   **Severity:** Medium (Build Performance)
    -   **Impact:** Import alias cleanup and ESLint improvements.

### UI & Branding
17. - [ ] **File: Various UI Components**
    -   **Issue:** Branding and UI polish needed.
    -   **Task:** Implement `<BrandLogo />` component for consistent branding.
    -   **Severity:** Medium (User Experience)
    -   **Impact:** Branding polish.

18. - [ ] **File: Homepage Components**
    -   **Issue:** Negative margins and widget system scalability.
    -   **Task:**
        - [ ] Extract `HeroBanner` from negative margins.
        - [ ] Refactor widget system for homepage scalability.
    -   **Severity:** Medium (Scalability, Maintainability)
    -   **Impact:** Homepage scalability and UI consistency.

## Low Priority Tasks (Code Quality & Minor Issues)

### General Code Quality
19. - [ ] **File: scripts/auth/auth-standardize.ts**
    -   **Issue:** Incomplete file scanning (only `.ts`, skips `.tsx`, etc.) and hard-coded `SKIP_FILES` array (Line 23).
    -   **Task:**
        - [ ] Use glob patterns (e.g., `**/*.{ts,tsx,js,jsx}`) with `fast-glob`.
        - [ ] Convert `SKIP_FILES` to CLI arguments.
    -   **Severity:** Low (Audit Accuracy)

20. - [ ] **File: client/src/hooks/use-async-button.tsx**
    -   **Issue:** `handleClick` swallows promise, no cancellation on unmount.
    -   **Task:**
        - [ ] Return internal promise from `handleClick`.
        - [ ] Track `isMounted` via `useRef` or abort signal.
    -   **Severity:** Low (Testing, Minor Memory Leak)

21. - [ ] **File: client/src/lib/utils/api-helpers.ts**
    -   **Issue:** Unused `ensureArray`/`ensureValue` helpers.
    -   **Task:** Delete or integrate into data-fetch hooks.
    -   **Severity:** Low (Dead Code)

### Logging & Documentation
22. - [ ] **File: server/src/core/logger.ts & Related Docs**
    -   **Issue:** Phantom doc references, inconsistent import paths, and missing logger initialization.
    -   **Task:**
        - [ ] Purge outdated doc references.
        - [ ] Create `@logger` alias.
        - [ ] Call `initLogger()` in `server/index.ts`.
        - [ ] Add ESLint rule against `console.*`.
    -   **Severity:** Low (Documentation, Consistency)

## Wallet-Related Tasks (Deferred Until Pre-Launch)

### Wallet Functionality & Security
1.  - [ ] **File: server/src/domains/engagement/vault/vault.routes.ts**
    -   **Issue:** Redundant `getUserId` helper (Lines 26–35), direct SQL bypassing service layer, no DB transaction for admin unlock (Lines 75–132), test endpoint exposure risk, hard-coded Solana wallet address.
    -   **Task:**
        - [ ] Centralize `getUserId` in `src/core/auth/utils.ts`.
        - [ ] Wrap unlock/transaction in a single Drizzle transaction.
        - [ ] Guard test routes with `ENABLE_TEST_ROUTES` flag.
        - [ ] Replace hard-coded address with config constant.
    -   **Severity:** High (Security, Data Integrity) - Deferred

2.  - [ ] **File: server/utils/wallet-utils.ts**
    -   **Issue:** 240-line module mixing formatting and DB mutations, re-implementing functions from `walletEngine.ts`, using manual SQL.
    -   **Task:**
        - [ ] Split into `wallet-format.ts`, `wallet-db.ts`, `wallet-exchange.ts`.
        - [ ] Integrate transactional helpers into WalletService.
        - [ ] Delete `walletEngine.ts` after migration.
    -   **Severity:** Medium (Code Organization, Maintainability) - Deferred

3.  - [ ] **File: client/src/contexts/wallet-context.tsx**
    -   **Issue:** Type mismatch for errors, global event bus memory leak, race condition with operation state.
    -   **Task:**
        - [ ] Update error type to `unknown | null` or custom union.
        - [ ] Replace window events with context dispatch or Zustand.
        - [ ] Initialize state from shared store.
    -   **Severity:** Medium (Type Safety, Memory Leak) - Deferred

4.  - [ ] **File: server/src/middleware/authenticate.ts & server/utils/wallet-utils.ts (Related to getUserId)**
    -   **Issue:** Redundant `getUserId` helpers with different assumptions and error handling.
    -   **Task:** Consolidate into `src/core/auth/request-user.ts` with standardized error handling and ESLint rule to prevent new duplicates.
    -   **Severity:** Medium (Code Duplication) - Deferred

## Pending Audit Areas
The following areas from the audit are yet to be covered and should be addressed in future task lists:
- Legacy `server/services/` directory for redundant business logic.
- `client/src/features/*` bundles for stale endpoints and barrel exports.
- Storybook/test components for production build exclusion.
- Automated test suites for path updates and logger usage.
- CI/GitHub Actions for incorporating lint steps.
- Environment/build config re-audit post-alias changes.
- Seed/migration scripts for schema synchronization.
- Documentation updates to avoid phantom references.

## Next Steps
- [ ] Begin implementation of the Immediate Must-Fix Tasks (Top 6) focusing on security, error handling, and data safety.
- [ ] Plan for Phase Two Priorities to address system safety and developer experience improvements post-must-fix tasks.
- [ ] Schedule Medium-Term Tasks based on team bandwidth for parallel execution.
- [ ] Keep Wallet-Related Tasks deferred until pre-launch phase after other functionalities are stabilized.
