### 2025-06-14 — Initial Codebase Audit

---

#### server/src/domains/admin/admin.middleware.ts

##### 🔍 Issues
- **Lines 31–47:** Raw SQL strings are embedded directly in the code. Even though the queries currently use static values (`'DevUser'`), this pattern encourages future copy-paste of unsafe, non-parameterized SQL that could be vulnerable to injection.
- **Lines 50–61:** `req.login` is called with a callback nested inside an `async` function. If `req.login` throws, the surrounding `try/catch` will not capture it, leading to unhandled promise rejections.
- **Lines 70–77:** The middleware relies on a denormalised `role` column on the `users` table. The rest of the codebase uses role-to-permissions tables; this inconsistency can cause silent auth failures in production.
- Multiple `console.log/console.warn` statements will leak internal details in production if `NODE_ENV` is misconfigured.

##### ✅ Suggestions
- Replace raw SQL with Drizzle query builder calls to keep ORM consistency and gain automatic SQL-injection protection.
- Wrap `req.login` in a `promisify` helper or manually `await` a Promise-based wrapper so the surrounding `try/catch` is effective.
- Migrate to a proper RBAC check (e.g. `isUserInRole(user.id, 'admin')`) that consults the `roles`/`rolePermissions` tables.
- Guard all dev-only `console.*` statements behind a strict `process.env.NODE_ENV === 'development'` check.

---

#### scripts/auth/auth-standardize.ts

##### 🔍 Issues
- **Line 23:** `relativePath.startsWith(skip)` will ignore any file inside a directory that merely *contains* the skip token. This may exclude legitimate files from analysis.
- The script scans only `.ts` files but skips `.tsx`, `.js`, and `.jsx`, missing many potential auth issues.
- The hard-coded `SKIP_FILES` array will drift over time and requires manual maintenance.

##### ✅ Suggestions
- Use glob patterns (e.g. `**/*.{ts,tsx,js,jsx}`) with a library like `fast-glob` for more robust file selection.
- Convert `SKIP_FILES` into configurable CLI arguments so future audits don't require code changes.

---

#### server/storage.ts

##### 🔍 Issues
- **Lines 268–276:** A direct SQL fallback is executed in development. Although the template literal uses Drizzle's `sql` tag, the pattern bypasses the schema layer and could diverge from production behaviour.
- The file is a 300-line, multi-domain 'god module' that mixes user lookup, forum utilities, and misc helpers—violating single-responsibility.

##### ✅ Suggestions
- Extract domain-specific helpers into smaller services (e.g. `UserStore`, `ForumStore`) and inject them where needed.
- Remove or feature-flag the dev-only SQL fallback to avoid accidental usage in production.

---

#### db/schema/admin/auditLogs.ts

##### 🔍 Issues
- The primary key is declared as `serial('log_id')` but is aliased to `id` in the column map. This can confuse downstream TypeScript types (`auditLogs.id` ≠ `audit_logs.log_id`).
- `before` and `after` JSONB columns have no `notNull()` declaration but also no explicit `.nullable()`. Drizzle will treat them as required in TypeScript while the DB allows NULL.
- The import path `../user/users` crosses domain boundaries—violating the `@zoneImports` rule.

##### ✅ Suggestions
- Rename the PK field to `logId` (camelCase) or `auditLogId` to match the DB column and Drizzle model.
- Explicitly mark `before` and `after` as `.nullable()` and reflect that in generated types.
- Create a shared `references.ts` barrel in `db/schema` for cross-domain FK imports to keep domain isolation.

---

### 2025-06-14 — Batch 2

---

#### server/index.ts

##### 🔍 Issues
- **Lines 87–143:** `registerRoutes(app)` returns an `http.Server`, but the return type is not enforced (no generics). If the implementation of `registerRoutes` changes and stops returning the server, TypeScript will not alert callers.
- **Lines 94–130:** Startup script unconditionally awaits multiple seed functions. Any of them can hang and block the entire server from booting (launch-blocking). There is no per-seed timeout or circuit-breaker.
- **Lines 60–77:** The custom JSON-capture logger mutates `res.json`, which can break downstream middleware and complicate debugging. Mutating Express internals is an anti-pattern.
- **Lines 169–192:** `server.on('error', …); server.on('listening', …); server.listen();` — the `listen` call occurs *after* the `error`/`listening` event handlers are attached, but there is no `.once('error')` safety; repeated errors could crash.
- Sensitive response bodies are logged (`capturedJsonResponse`). In production this may leak PII.

##### ✅ Suggestions
- Strong-type the return of `registerRoutes` and add a compile-time assertion.
- Spawn seed scripts in parallel with `Promise.allSettled` **after** the HTTP server is already listening, to avoid blocking critical path.
- Replace the `res.json` monkey-patch with a lightweight `morgan`-style logger that does not mutate core methods.
- Add a `SAFE_LOG_FIELDS` allow-list when logging JSON responses, or disable body logging in production.
- Implement seed-script timeouts and surface failures via alerts instead of hanging startup.

---

#### server/routes.ts

##### 🔍 Issues
- Hard-coded `hotThreads` JSON (Lines 46-115) violates DRY and will drift from real data; also bloats bundle.
- Multiple utility imports (`awardPathXp`, platform-energy helpers) are referenced *before* they have been migrated to domain services, creating tight coupling between legacy util code and the new router.
- Uses both relative paths (`./utils/platform-energy`) and alias paths (`@shared/path-config`) in the same file, breaking import grouping rules (@zoneImports).
- WebSocket server initialisation logic is buried inside route registration, violating separation of concerns.
- TODO comments (`@routeDeprecation`, etc.) span >6 months; indicates tech debt left unaddressed.

##### ✅ Suggestions
- Move sample/hard-coded thread data into an integration test fixture, not production code.
- Split WebSocket setup into `src/core/websocket.ts` and import from `index.ts`.
- Enforce import groups and migrate remaining util functions into proper domain layer.
- Convert TODOs into tracker tickets and remove stale comments.

---

#### server/src/domains/engagement/vault/vault.routes.ts

##### 🔍 Issues
- **Lines 26–35:** `getUserId` helper is re-implemented here but exists in multiple other files → redundancy.
- Direct SQL in admin endpoints bypasses service layer & Drizzle models, contradicting domain-driven pattern.
- **Lines 75–132:** Admin unlock mutates vault and inserts a transaction in two separate calls → no DB transaction; risk of partial state if the second query fails.
- Test endpoint `/test-status` is conditionally exposed in non-production but relies only on `NODE_ENV` — misconfigurations could leak sensitive data.
- Hard-coded fallback Solana wallet address; should be config-driven.

##### ✅ Suggestions
- Centralise `getUserId` in `src/core/auth/utils.ts` and import everywhere.
- Wrap the unlock + transaction insert in a single Drizzle transaction.
- Guard dev-only routes behind an explicit `ENABLE_TEST_ROUTES` env flag in addition to `NODE_ENV`.
- Replace hard-coded wallet address with a constant in `config/test.constants.ts`.

---

#### server/src/domains/admin/admin.service.ts

##### 🔍 Issues
- Relies on `console.error` for logging while the rest of the domain uses `logger` util — inconsistent.
- `getDashboardStats()` builds complex SQL with inline `COUNT(CASE WHEN ...)` expressions; hard to maintain and DB-portable.
- No caching layer; dashboard calls this expensive query every request.
- Singleton export `adminService` makes unit testing harder (state leakage across tests).

##### ✅ Suggestions
- Inject a logger dependency and unify logging strategy.
- Extract metrics computation into SQL views or materialised views; query them for O(1) dashboard reads.
- Memoise or cache the dashboard stats for short TTL (e.g., Redis 30 s).
- Export the class and instantiate per-request in controllers, or use DI container (e.g., `tsyringe`).

---

### 2025-06-14 — Batch 3 (Client Components & Hooks)

---

#### Duplicate Forum Category Components

Files:
- `client/src/components/forum/category-card.tsx` (148 lines)
- `client/src/components/forum/forum-category-card.tsx` (92 lines)
- `client/src/components/forum/forum-card.tsx` (138 lines)

##### 🔍 Issues
- All three components present extremely similar data (name, description, thread/post counts, last activity) with near-identical markup and Lucide icons.
- Inconsistent naming (`CategoryCard`, `ForumCategoryCard`, `ForumCard`) makes feature-wide search difficult.
- Visual variants are implemented via copy-paste tweaks (background shades, badge placements) → future design changes will require editing three files.
- Two routing strategies are used: `useLocation` from `wouter` and plain anchor `<Link>`; risk of inconsistent SPA navigation.

##### ✅ Suggestions
- Extract a single parametric component `ForumEntityCard` with a `variant` prop (e.g., `forum` | `category`) and pass in counts/flags via props.
- Standardise navigation via a custom `useNavigate()` hook that wraps `wouter` (or React Router) to enable easy migration later.
- Co-locate style tokens (e.g., badge colours) in `forum-card.styles.ts` to enforce design consistency.
- Deprecate legacy card components; add TODO banner comment and create refactor ticket.

---

#### Redundant `getUserId` Helpers

Found in:
- `server/src/domains/engagement/vault/vault.routes.ts`
- `server/utils/wallet-utils.ts` (indirect usage)
- `server/src/middleware/authenticate.ts` (embedded logic)

##### 🔍 Issues
- Each copy makes slightly different assumptions about `req.user` shape (`id` vs `user_id`).
- Divergent error handling (console.error vs silent fallback) leads to inconsistent 500/401 responses.

##### ✅ Suggestions
- Create `src/core/auth/request-user.ts` with a single `getUserId(req)` util returning `number | undefined` and throwing typed `AuthError` if missing.
- Replace all inline helpers; add ESLint rule to forbid new `function getUserId` declarations.

---

#### UI Hook `useAsyncButton`

File: `client/src/hooks/use-async-button.tsx`

##### 🔍 Issues
- `handleClick` swallows returned promise — caller cannot `await` for result (makes unit testing harder).
- No automatic cancellation; if the component unmounts while promise is pending, the state update in `.finally` will warn.

##### ✅ Suggestions
- Return the internal promise from `handleClick` so callers can chain.
- Track `isMounted` via `useRef` or abort signal to prevent setState on unmounted component.

---

### 2025-06-14 — Batch 4 (React Contexts & Data Hooks)

---

#### Forum Structure – Dual Source of Truth

Files involved:
- `client/src/contexts/ForumStructureContext.tsx` (536 LOC, heavy provider + hook)
- `client/src/features/forum/hooks/useForumStructure.ts` (41 LOC, legacy TanStack query hook)
- Numerous consumers still import the *old* hook (e.g. `sidebar.tsx`, `ForumListItem.tsx`).

##### 🔍 Issues
- **Duplication:** Two independent implementations fetch/shape the same forum-structure data.
- **Divergent Types:** `ForumStructureContext` uses advanced merged types (`MergedZone`, `MergedForum`) while the legacy hook returns `ForumCategoryWithStats`; consumers expect different shapes → runtime mismatches.
- **Performance:** The context provider runs a large `mergeStaticAndApiData` transformation on every render because its result is not memoised with proper deps.
- **Bundle Size:** 536 LOC provider is always imported by pages that wrap children in `ForumStructureProvider`, inflating initial bundle even on pages that do not need forum data.

##### ✅ Suggestions
- Deprecate `features/forum/hooks/useForumStructure.ts`; add export alias for backward-compat (`export { useForumStructure } from '@/contexts/ForumStructureContext'`).
- Memoise `mergeStaticAndApiData` result via `useMemo([apiCategories, staticZonesConfig])` to avoid recalculations.
- Code-split provider: move heavy merge logic into a separate util that can be tree-shaken.
- Add ESLint forbidden import rule for old path to enforce migration.

---

#### WalletContext – Type & Memory Safety

File: `client/src/contexts/wallet-context.tsx`

##### 🔍 Issues
- **Type Mismatch:** `balanceError` / `transactionsError` typed `unknown` but default value is `null`; with `strictNullChecks` this is invalid.
- **Global Event Bus:** Uses `window.addEventListener('wallet:operation:start')`; leaks if multiple React roots mount (e.g., micro-frontends).
- **Race Condition:** If `wallet:operation:end` fires before the provider is mounted, `isProcessingOperation` remains `false`; consumers miss spinner toggle.

##### ✅ Suggestions
- Change error type to `unknown | null` or introduce custom `WalletError` union.
- Replace window events with React context dispatch (`useReducer`) or Zustand store; expose imperative `startOperation()` / `endOperation()` helpers.
- Initialise `isProcessingOperation` from a shared store so late mounts get correct state.

---

#### ProfileContext – Routing Coupling

File: `client/src/contexts/profile-context.tsx`

##### 🔍 Issues
- Mixes `wouter` `useParams` with NextJS dynamic route `[username].tsx` pages; if routing lib changes, context breaks all profile pages.
- Fallback to `user?.username` when query param missing means navigating to `/profile` without slug silently shows *own profile* – security/privacy risk.

##### ✅ Suggestions
- Decouple route param extraction: implement `getCurrentProfileSlug(router)` util with explicit precedence order.
- Throw explicit 404 if `viewedUsername` cannot be resolved.

---

#### Mock & Real Shoutbox Contexts

Files:
- `client/src/contexts/mock-shoutbox-context.tsx`
- `client/src/contexts/shoutbox-context.tsx`

##### 🔍 Issues
- Two contexts export the same hook names; accidental mix-imports will compile but trigger runtime errors (e.g., provider mismatch).
- Mock context never logs a warning when used in production build – could ship mocks to prod unnoticed.

##### ✅ Suggestions
- Gate mock context export behind `if (import.meta.env.MODE === 'development')` and re-export real context in production.
- Add `__DEV__` runtime assertion to warn if mock provider detected in prod.

---

#### Misc Hook – `useThreadZone`

File: `client/src/hooks/useThreadZone.ts`

##### 🔍 Issues
- Combines data from `useForumStructure` with thread fetch; duplicates selector logic already present in `ForumStructureContext`.
- Returns `getZoneByForumSlug` yet context already exposes same function; consolidation needed.

##### ✅ Suggestions
- Convert to thin wrapper around `useForumStructure` or remove.

---

### 2025-06-14 — Batch 5 (Utility Kitchens – "Gordon Ramsay" Edition)

---

#### Cosmetic Chaos – Two **applyPluginRewards** Implementations

Files:
- `client/src/lib/utils/applyPluginRewards.ts` (163 LOC, TypeScript)
- `client/src/lib/utils/cosmeticsUtils.tsx` (174 LOC, TSX)

##### 🔍 Issues
- You've cooked the **same damn recipe twice**! Two separate `applyPluginRewards` functions do 95 % identical work, but with subtly different shapes (`UserInventoryWithProduct` vs inline interface). This is a nightmare waiting to happen — one fix will inevitably miss the other.
- The TSX version even re-exports an *identically named* function, guaranteeing import collisions.
- One uses system-role colour override logic, the other doesn't — perfect recipe for inconsistent UI seasoning.

##### ✅ Ramsay-Approved Fix
- Throw both into a blender: create single source `cosmetics/applyPluginRewards.ts` and export typed helpers (`getSystemRoleColor`, `applyPluginRewards`).
- Delete the duplicate, leave a re-export stub with deprecation comment so TS screams if anyone tries the old import.
- Add unit tests: same input inventory must yield identical output across role permutations (admin, mod, pleb).

---

#### Category Colour Factory – **getCategoryColor** If-Else Lasagna

File: `client/src/lib/utils/category.ts`

##### 🔍 Issues
- 9-level if-else spaghetti. Every new category = another `if` layer. This is how scalability dies.

##### ✅ Suggestions
- Replace with **map-lookup table**: `{ keyRegex: /(trading|analysis)/, color: 'from-blue-500...' }`. Iterate once; O(n) maintainability drops to O(1).
- Extract to `category-colors.ts` so design can tweak without code deploy.

---

#### Wallet Utils – 240 Lines of Swiss-Army Chaos

File: `server/utils/wallet-utils.ts`

##### 🔍 Issues
- Mixes formatting helpers **and** high-stakes DB mutations. That's like storing raw chicken next to pastry — cross-contamination guaranteed.
- Re-implements `calculateDgtFromUsdt`, `confirmDeposit`, `processWithdrawal` that are *also* present inside `walletEngine.ts` and domain services.
- Uses manual SQL for treasury updates instead of Drizzle models — one typo and you're shouting "WHERE'S THE LAMB SAUCE" at prod data.

##### ✅ Suggestions
- Carve into modules:
  1. `wallet-format.ts` (pure functions, no DB)
  2. `wallet-db.ts` (Drizzle powered, transactional)
  3. `wallet-exchange.ts` (rate logic, cached)
- Bolt transactional helpers onto WalletService domain, not global util dir.
- Delete `walletEngine.ts` (776 LOC!) after migrating essential bits into typed services.

---

#### `platform-energy.ts`, `shop-utils.ts`, `path-utils.ts` – Leftover Side-Dish Scripts

- These utils are imported directly by **server/routes.ts**, bypassing domain boundaries. That's like serving appetizers in the dessert station.
- TODO comments from *January* still present — means nobody is cleaning the kitchen.

##### ✅ Suggestions
- Promote each util into its respective domain (`engagement/platform-energy`, `shop/shop.utils.ts`, `paths/path.utils.ts`).
- Drop imports from central router; controllers should own their condiments.

---

#### API Helpers – `ensureArray` / `ensureValue`

File: `client/src/lib/utils/api-helpers.ts`

##### 🔍 Issues
- Tiny but fine — yet **unused** in  search across `client/src` (0 hits). Dead code = rotten ingredients.

##### ✅ Suggestions
- Either delete or actually roll into data-fetch hooks.

---

### 2025-06-14 — Batch 6 (Middleware Mayhem)

---

#### Validation Middleware – **Two functions doing the same damn job**

Files:
1. `server/src/middleware/validate.ts` (66 LOC)
2. `server/src/middleware/validate-request.ts` (17 LOC)

##### 🔍 Issues
- Duplicate responsibility: both parse Zod schemas against request objects.
- One validates body *only* (plus query/params individually), the other validates a composite object ⇒ inconsistent error formats.
- Neither exports a consistent `ValidationError` type; controllers must pattern-match every snowflake.

##### 🔥 Ramsay-Style Verdict
"Why have two dull knives when you can have ONE sharp chef's knife?"

##### ✅ Refactor Recipe
- Create a unified `validateRequest(schema, options)` util that supports selective segments via options `{ body?: true, query?: true, params?: true }`.
- Deprecate both old files; leave re-export stubs yelling deprecation warnings.
- Ensure consistent 422 status + JSON error envelope `{ message, errors: ZodIssue[] }`.

---

#### Auth Middleware Salad – `authenticate.ts` vs `auth.ts`

Files:
- `server/src/middleware/authenticate.ts` (76 LOC)
- `server/src/middleware/auth.ts` (49 LOC wrapper)

##### 🔍 Issues
- `auth.ts` simply re-exports `authenticate` and adds *extra* role checks (`requireAdmin`, `requireModerator`). This wrapper then gets ignored by many domains that import `authenticate` *directly* – inconsistent role enforcement.
- Callback hell: role check middlewares call `authenticate` **inside their own function each request**, causing double JWT verify on success routes.
- Types missing – `any` req/res params in `requireAdmin` etc.

##### ✅ Ramsay Fix
- Promote a dedicated RBAC middleware factory: `requireRole('admin' | 'moderator' | ['admin','mod'])` returning an Express handler.
- Export single entry `auth/index.ts` with `authenticate`, `requireRole`, `getUserId` helpers.
- Remove duplicate wrapper file.

---

#### Mission Progress Middleware – Sneaky Side-Effects

File: `server/src/middleware/mission-progress.ts`

##### 🔍 Issues
- Monkey-patches `res.send` to insert side-effect after response; risks double-send if controller already mutated `res.send`.
- Skips awaiting `updateMissionProgress` but swallows errors; silent mission tracking failures.
- Relies on `missionsService` global singleton – no DI, hard to test.

##### ✅ Suggestions
- Swap to Express `on-finished` npm package to safely run post-response hooks without overriding `res.send`.
- Return a Promise and attach `.catch(logger.error)` at call site; avoid hidden async.
- Accept `missionsService` via closure param for testability.

---

#### Inconsistent Error-Handling Strategy

Observation:
- Some middlewares return `res.status(400).json(error)` (raw Zod error), others wrap in `{ error: '...' }`.
- Global error handler in `server/index.ts` standardises to `{ message }`, but many middlewares short-circuit before it.

##### ✅ Action Plan
- Enforce single `next(new HttpError(status, message, details))` pattern; let central handler craft response.
- Add ESLint rule: "no direct res.status in middleware except 5xx fallback".

---

### 2025-06-14 — Batch 7 (Logging Layer)

---

#### Centralised Logger Status

Canonical file: `server/src/core/logger.ts` (265 LOC) – robust, supports levels, actions, file rotation.

Search results show **~35** imports of `../core/logger`, indicating the team has largely standardised—good.

##### Remaining Gaps & Risks
1. **Phantom Docs:** `docs/launch-readiness-audit-may-2025.md` still references `server/utils/logger.ts` & `server/utils/log.ts`, but those files no longer exist. Could mislead new devs.
2. **Path Hell:** Import paths vary (`'../../../core/logger'`, `'@server/src/core/logger'`, `'../../core/logger'`). Easy to mistype.
3. **Fallback Console.***  Many legacy files (e.g., `wallet-utils.ts`, `vault.routes.ts`) still spray `console.error` directly— bypassing structured logs.
4. **initLogger** is exported but **never called** outside the file; production may lack file logging.
5. **Missing HTTP Request Logger**: No middleware pipes Express request/response into logger; scattered manual logs instead.

##### ✅ Action Items
- Purge outdated doc references; update onboarding docs to point at `core/logger.ts`.
- Create **alias path** `@logger` in tsconfig paths → `src/core/logger.ts`. Import via `@logger` everywhere; add ESLint rule to forbid relative `../../core/logger`.
- Add Express `pino-http` or simple middleware to log every request through the logger.
- Call `initLogger()` in `server/index.ts` before anything else.
- Add ESLint rule banning raw `console.*` in server code (auto-fix to `logger.*`).

---

### 2025-06-14 — Batch 8 (Import Hygiene & Vite Build Readiness)

---

#### Global Observation – Import Drift

Context provided: recent clone failed to boot Vite due to **unused hero-icons and non-standard import paths**. A manual hot-fix was applied, but root causes remain.

##### Key Findings
1. **Mixed Alias Usage**  
   * Client uses both `@/` (configured in `vite.config.ts`) and relative `../../` paths.  
   * Server sometimes imports via `@server/src/**`, sometimes deep relative.  
   * ESLint does not currently enforce alias groups – leads to path typos that only surface at runtime.
2. **Unused Icon Imports**  
   * Quick grep shows ~40 heroicons imports (`import { XIcon } from '@heroicons/react/outline'`) where the icon is never rendered.  
   * These inflate bundle size and can break Tree-shaking when names are misspelled.
3. **Dead CSS/Image Imports**  
   * `client/src/styles/animations.css` imported in one abandoned component; removed component, file still referenced in `main.tsx` comment block.
4. **Vite Path Case-Sensitivity**  
   * `import Logo from '@/public/images/Dgen.png';` fails on Linux due to case mismatch vs `Dgen.PNG`.
5. **Path Alias Resolution in IDE vs Vite**  
   * Some TS files rely on `@db` alias that is configured only for ts-node on the server; Vite client build chokes when such imports accidentally land in shared code.

##### ✅ Remediation Checklist
- Enforce ESLint rule `no-unused-vars` with `args: 'after-used', ignoreRestSiblings: false` + `@typescript-eslint/no-unused-vars`. Turn on `import/no-unused-modules` plugin.
- Add `eslint-plugin-boundaries` to mandate alias groups (`@/`, `@server/`, relative) per layer.
- Introduce **`yarn lint:imports`** script running `ts-prune` + `eslint --rule 'import/no-unused-modules:error'`.
- Run `vite build --mode production` in CI to catch case-sensitive path issues on Linux runners.
- Add `icon-linter.ts` script (simple AST scan) to fail build if an imported hero|lucide icon identifier is unused in JSX return.
- Document alias matrix in README; ensure both `tsconfig.json` and `vite.config.ts` share the same `paths` config.

---

#### Sample Offenders (to prioritise)
- `client/src/components/layout/announcement-ticker.tsx` – imports 5 heroicons, renders 1.  
- `client/src/pages/profile/xp-demo.tsx` – imports Lucide `TrendingUp`, never used.
- `client/src/components/ui/avatar.tsx` – imports Tailwind mascot SVG but uses `<img>` path instead.

---

### 2025-06-14 — Batch 9 (Migration Scripts & DB Safety)

---

#### Destructive `DROP TABLE` Statements Without Guards

Example files:
- `migrations/postgres/0001_orange_norrin_radd.sql`
- `migrations/postgres/0002_broken_viper.sql`
- `migrations/postgres/0003_faulty_blink.sql`
- `migrations/postgres/0007_wooden_emma_frost.sql`

##### 🔍 Issues
- Multiple `DROP TABLE <name> CASCADE;` statements with no `IF EXISTS`, risking CI/CD failures if the migration is re-run or applied out-of-order.
- Use of `CASCADE` will silently nuke FK-dependent tables; extremely dangerous for prod rollbacks.
- Statement ordering relies on implicit Postgres dependency resolution; one change in earlier migration could break later scripts.
- No prerequisite checks (e.g., confirm app is in maintenance mode) before destructive ops.

##### ✅ Recommendations
1. Replace destructive drops with **`ALTER TABLE RENAME TO <legacy_*>`** and mark as deprecated; keep data for rollback.
2. If drop is unavoidable, use:
   ```sql
   DO $$ BEGIN
     DROP TABLE IF EXISTS public.stickers CASCADE;
   END $$;
   ```
3. Introduce *safe-guard migrations* that check `current_schema_migrations.version` before running heavy ops.
4. Add lint step (`sql-lint` or custom script) in CI to reject any `DROP TABLE` without `IF EXISTS` or `CASCADE` without explicit comment.

---

#### Hard-Coded Serial PKs and No Defaults

- Many `serial` columns (`id serial PRIMARY KEY NOT NULL`) without `DEFAULT`.  PostgreSQL 15 deprecates `serial`; migrate to `generated always as identity`.
- Some migrations add FK columns but forget to back-fill existing rows, leading to immediate NOT NULL violations on deploy.

---

#### Mixed Timestamp Conventions

- Some tables use `timestamp DEFAULT now()`, others `timestamptz NOT NULL` with code-side default. Inconsistent time-zone handling.

##### ✅ Suggestions
- Standardise on `timestamptz` (`TIMESTAMP WITH TIME ZONE`) with default `now()` for created/updated columns.

---

#### Statement-Breakpoints Bloom

- Each SQL statement ends with `--> statement-breakpoint`. Good for drizzle-kit diffing but leaves noise when scripts are run via `psql` directly.
- Provide alternative migration bundle without comments for manual ops.

---

#### Organisational Note

Migrations are sprinkled across:
1. `migrations/postgres/*.sql` (hand-written)  
2. `server/migrations/*.ts` (Drizzle programmatic)  
3. `migrations/meta/*.json` snapshots.

This split complicates drift tracking. Suggest consolidating into **single source** (Drizzle migrations) and archiving raw SQL into `/archive/legacy-sql/`.

---

<small>Next batch will review `server/services` legacy directory for redundant business logic.</small>

### Pending Coverage Map (to finish full audit)

The following areas remain **unfinished** and should be prioritised in subsequent batches:

1. **Legacy `server/services/` Directory**  
   • Identify redundant business logic duplicated in domain services.  
   • Ensure TronWeb / wallet-integration services align with new wallet domain.
2. **`client/src/features/*` Bundles**  
   • Forum, Wallet, Admin sub-features: check hooks & services for stale endpoints.  
   • Confirm feature barrels export only canonical modules.
3. **Storybook / Test Components**  
   • `client/public/test-components/`, `docs/examples/` – verify they're excluded from prod build.
4. **Automated Test Suites**  
   • `server/test/*`, `scripts/testing/*` – ensure tests reflect refactored paths & use logger.
5. **CI / GitHub Actions**  
   • `.github/workflows/validate-codebase.yml` – incorporate lint steps proposed in batches 5-8.
6. **Environment & Build Config**  
   • Re-audit `vite.config.ts`, `tailwind.config.ts`, `tsconfig.json` after alias/path changes.
7. **Seed & Migration Scripts (SQLite)**  
   • `scripts/db/*` seeding utilities – ensure they sync with newer schema after Drizzle migrations.
8. **Documentation Sync**  
   • Update README, onboarding docs once code changes are applied to avoid phantom references.

> Mark each segment complete in this file after auditing to maintain progress transparency. 