# MyBB Deep Dive → DegenTalk Evolution Matrix 2.0

> A strategic blueprint for integrating proven MyBB concepts into DegenTalk’s modern TypeScript-first, Web3-enabled architecture.

---

## 1  Context & Goals

1. Perform a deep comparative analysis of MyBB’s battle-tested forum software.
2. Extract high-value patterns that remain relevant in 2025.
3. Translate those patterns into DegenTalk’s **React + TypeScript + Drizzle + Web3** stack.
4. Produce an actionable roadmap (Phase 4) for the final month of feature work leading to v1 GA.

---

## 2  Legacy Patterns vs Modern Counterparts

| Category | MyBB Observation | Risk / Gap | DegenTalk Modern Strategy |
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
| **Caching / Scale** | File-based or DB cache | Doesn’t scale | L1 memory → L2 Redis → L3 CDN cascade via `ScalableCache` |
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
2. DB sharding prep using Drizzle’s `inSchema` & hash partition helpers.
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

## 10  References

* MyBB Source v1.8.37 – specific commits analysed `#3d2b1e`, `#4fa9c0`.
* DegenTalk rules in `.cursor/rules/**` (see: `schema-consistency.mdc`, `startup-logging.mdc`).
* Research log – `_audit/forum/01-batch-1.md` & `02-batch-2.md`.

---

> _This living document will evolve under `Rule Mutation Protocol @evolveRule`. Submit pull requests referencing **“Evolution Matrix 2.0”** label to update._
