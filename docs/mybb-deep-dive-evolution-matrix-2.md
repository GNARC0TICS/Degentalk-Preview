# MyBB Deep Dive → Degentalk Evolution Matrix 2.0

> A strategic blueprint for integrating proven MyBB concepts into Degentalk's modern TypeScript-first, Web3-enabled architecture.

---

## 1  Context & Goals

1. Perform a deep comparative analysis of MyBB's battle-tested forum software.
2. Extract high-value patterns that remain relevant in 2025.
3. Translate those patterns into Degentalk's **React + TypeScript + Drizzle + Web3** stack.
4. Produce an actionable roadmap (Phase 4) for the final month of feature work leading to v1 GA.

---

## 2  Legacy Patterns vs Modern Counterparts

| Category | MyBB Observation | Risk / Gap | Degentalk Modern Strategy |
| --- | --- | --- | --- |
| **Global State** | Monolithic arrays in `class_core.php` (`$mybb->input`, `$mybb->cookies`, …) | Tight coupling, mutation everywhere | Strictly typed **React Context** hierarchy with granular providers (`AppContext → User / Wallet / Forum / Settings`) |
| **Input Sanitization** | Double-`unset()` globals hack for old PHP | Obsolete & fragile | Centralised **Zod** validation (`schemas/validators/`) and `@segregateLogic` rule enforcement |
| **Debug Mode** | URL param `?debug=1` (public risk) | XSS / Info-leak | Environment-flagged debug + runtime toggle via **Admin Config UI** |
| **Template System** | 3-tier priority (`sid -2/-1/<theme>`) | XML storage, rigid | **Component composition** with theme inheritance (`ThemeManager`) |
| **Plugin Hooks** | `run_hooks("*")` sprayed across core | No type safety, silent failures | **Type-safe HookManager** (`HookRegistry`) w/ priority & error boundaries |
| **Template Versioning** | XML blobs, no migration | Theme lock-in | Component version map (v1/v2/v3) + auto-migration script |
| **Configurability** | 90% UI, 10% code | Hard-coded permissions, schema | Runtime **ConfigService** (DB-backed, hot-reload) covering XP, tipping, moderation, UI |
| **SEO** | Basic `<title>` & meta | Poor social reach | Rich **SEOMetadata** generator, dynamic OG images, JSON-LD |
| **Security** | Session fixation, weak hashing | High | Wallet-aware auth, RBAC/ABAC, rate-limiting, tipping abuse engine |
| **Caching / Scale** | File-based or DB cache | Doesn't scale | L1 memory → L2 Redis → L3 CDN cascade via `ScalableCache` |
| **DB Sharding** | N/A | Single instance | Hash-based user/content sharding + read replicas |

---

## 3  Plugin & Template System – Modern Implementation

### 3.1  Theme Override Hierarchy
```
resolveComponent(name, theme):
  1 Check current theme folder
  2 Traverse `extends` chain (parent themes)
  3 Fallback to core default components
```
*Location*: `client/src/contexts/ThemeManager.tsx` (planned).

### 3.2  Hook Registry
```ts
// example (server/src/core/hooks/registry.ts)
interface HookRegistry {
  'thread:created': { thread: Thread; user: User };
  'dgt:tipped': { amount: number; from: User; to: User; thread: Thread };
  'xp:awarded': { amount: number; user: User; reason: string };
}
```
*Rule linkage*: `@segregateLogic` —

dt Plugin logic lives outside controllers.

---

## 4  Admin Configurability – 90/10 Principle

Never hard-code **business parameters**. Use `ConfigService` → DB → Cache → Live broadcast.

| Domain | Must be dynamic (Phase 4) |
| ------ | -------------------------- |
| XP & Economy | Rewards, multipliers, penalties, thresholds |
| Tipping | Limits, cooldowns, fees, restrictions |
| Moderation | Spam thresholds, escalation paths |
| UI/UX | Themes, widgets, notifications, accessibility |

> **Exception**: Core schemas & security algorithms remain code-level until Phase 5.

---

## 5  SEO & Metadata Modernisation

1. Central meta generator (`client/src/utils/seo.ts`).
2. Supports OpenGraph, Twitter, Discord, JSON-LD.
3. Pluggable image generator (`scripts/og/generate-thread-image.ts`).

---

## 6  Security Hardening

* Wallet security service validates signatures, nonces, AML thresholds.
* Rate-limiting middleware (`server/src/middleware/rateLimiter.ts`) across API & WebSocket.
* Tipping abuse detection leveraging behaviour analytics + Sybil scoring.

> Aligns with **schema-consistency.mdc** to guarantee nullable fields are explicit.

---

## 7  Scale & Performance Blueprint

1. **ScalableCache** → Redis Cluster (`scripts/infra/redis-init.sh`).
2. DB sharding prep using Drizzle's `inSchema` & hash partition helpers.
3. Auto-scaler listens to metrics bus (`server/src/cron/autoScaler.ts`).

---

## 8  Phase 4 – Evolution Priority Matrix (May → June)

| Priority | Deliverable | Owner | Linked Rule |
| -------- | ----------- | ----- | ----------- |
| Critical | HookManager MVP | `core-team` | N/A |
| Critical | Multi-layer cache | `infra-team` | `startup-logging.mdc` |
| Critical | DB sharding PoC | `db-team` | `schema-consistency.mdc` |
| Critical | Wallet security layer | `wallet-team` | `security-rules.mdc` (TBD) |
| Nice-to-Have | Auto-scaler prototype | `infra-team` | N/A |
| Nice-to-Have | SEO meta generator | `frontend-team` | N/A |
| Experimental | Component versioning | `design-guild` | N/A |

---

## 9  Action Items – Next 2 Weeks

- [ ] Scaffold **HookManager** types & runtime (`server/src/core/hooks/`).
- [ ] Implement **ThemeManager** resolver with parent fallback.
- [ ] Create **ConfigService** DB tables & REST endpoints.
- [ ] Draft **SEOMetadata** utility with OG image stub.
- [ ] Write **rateLimiter.ts** integrating Redis.
- [ ] Schedule **infra call** to provision Redis & read replicas.

---

## 10  Detailed Actionable Steps

> This section translates the strategic points from the Evolution Matrix into concrete development tasks mapped to Degentalk's current architecture (React, TypeScript, Express.js, Drizzle ORM, PostgreSQL).

### I. Global State & Context Management (Matrix §2)

*MyBB Observation:* Monolithic global arrays  →  *Degentalk Strategy:* Strictly typed React Context hierarchy.

**Actionable Items**
1. **Audit Existing Contexts**
   - Review all files in `client/src/contexts/`.
   - Identify existing contexts and their scope.
   - **If missing**, scaffold foundational contexts:
     - `client/src/contexts/AppContext.tsx`
     - `client/src/contexts/UserContext.tsx`
     - `client/src/contexts/WalletContext.tsx`
     - `client/src/contexts/ForumContext.tsx`
     - `client/src/contexts/SettingsContext.tsx`
2. **Ensure Granular Providers** – wrap only necessary branches of the tree to minimise re-renders.
3. **Type Safety** – export strict TypeScript interfaces for every context value/updater.

---

### II. Input Sanitization & Validation (Matrix §2)

*MyBB Observation:* `unset()` globals hack  →  *Degentalk Strategy:* Centralised Zod validation.

**Actionable Items**
1. **Standardise Zod Usage**
   - Audit `server/src/domains/**/*.routes.ts` and services.
   - Validate all request bodies / params via schemas in `shared/validators/`.
   - Re-use the same schemas on the client for form validation.
2. **Enforce `@segregateLogic`**
   - Keep validation logic out of UI components; colocate in services or utils.

---

### III. Debug Mode (Matrix §2)

*MyBB Observation:* URL param `?debug=1`  →  *Degentalk Strategy:* ENV-flag + runtime toggle.

**Actionable Items**
1. **Environment Flag** – add conditional logging when `NODE_ENV === 'development'`.
2. **Admin Toggle**
   - Add UI in Admin Panel → System Settings.
   - Backend endpoint `POST /api/admin/settings/debug-mode` writes via `ConfigService`.
   - Expose via `SettingsContext` for client consumption.

---

### IV. Template System & Theming (Matrix §2 & §3.1)

*MyBB Observation:* 3-tier XML templates  →  *Degentalk Strategy:* ThemeManager with inheritance.

**Actionable Items**
1. **Implement `ThemeManager.tsx`**
   - Provide context + provider.
   - Implement `resolveComponent(name, theme)` search chain.
   - Define folder structure `client/src/themes/<theme>/components/`.
2. **Component Composition** – favour reusable, theme-friendly components.

---

### V. Plugin Hooks (Matrix §2 & §3.2)

*MyBB Observation:* Scattered hooks  →  *Degentalk Strategy:* Type-safe `HookManager`.

**Actionable Items**
1. **Scaffold Registry & Manager** in `server/src/core/hooks/`.
2. **Integrate Hooks** – trigger on events like `thread:created`, `dgt:tipped`.
3. **Segregate Plugin Logic** – move reward/XP/tip side-effects into hook callbacks.

---

### VI. Configurability (Matrix §2 & §4)

*MyBB Observation:* 90 % UI configs  →  *Degentalk Strategy:* DB-backed `ConfigService`.

**Actionable Items**
1. **Create Table** `site_settings` via Drizzle.
2. **Implement `ConfigService`** with cache & pub/sub hot reload.
3. **Expose REST** endpoints under `/api/admin/config`.
4. **Refactor Domain Logic** (XP, tipping, moderation, UI) to fetch dynamic values from `ConfigService`.

---

### VII. SEO & Metadata (Matrix §2 & §5)

**Actionable Items**
1. Draft `client/src/utils/seo.ts` – `generateMetadata(pageType, data)`.
2. Add dynamic OG image stub `scripts/og/generate-thread-image.ts`.
3. Inject JSON-LD via React Helmet or Next.js Head.

---

### VIII. Security Hardening (Matrix §2 & §6)

**Actionable Items**
1. Implement **WalletSecurityService** for signature + nonce verification.
2. Build `server/src/middleware/rateLimiter.ts` (Redis-backed).
3. Design tipping-abuse detection service.
4. Audit & strengthen RBAC/ABAC tables + middleware.

---

### IX. Scale & Performance (Matrix §2 & §7)

**Actionable Items**
1. Implement `ScalableCache` service (L1 memory, L2 Redis).
2. Provision Redis locally via `scripts/infra/redis-init.sh`; plan prod cluster.
3. Research Drizzle sharding helpers; produce PoC for `posts` table.
4. Draft `server/src/cron/autoScaler.ts` listening to basic metrics.

---

### X. Component Versioning (Matrix §2 & §8 – Experimental)

**Actionable Items**
1. Design registry for component versions.
2. Prototype migration script for theme component upgrades.

---

## 11  References

* MyBB Source v1.8.37 – specific commits analysed `#3d2b1e`, `#4fa9c0`.
* Degentalk rules in `.cursor/rules/**` (see: `schema-consistency.mdc`, `startup-logging.mdc`).
* Research log – `_audit/forum/01-batch-1.md` & `02-batch-2.md`.

---

> _This living document will evolve under `Rule Mutation Protocol @evolveRule`. Submit pull requests referencing **"Evolution Matrix 2.0"** label to update._
