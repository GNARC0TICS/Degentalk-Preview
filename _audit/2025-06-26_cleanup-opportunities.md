# DegenTalk Codebase ‑ Cleanup Opportunities (2025-06-26)

> This document captures all identified cleanup and refactoring opportunities discovered from a quick automated scan and manual review of the current repository state. It should serve as the master checklist before any large-scale cleanup PRs.

---

## 1. ESLint / Style Issues

- [ ] **`container mx-auto` rule violations** – Replace 20+ raw occurrences with a `Container` layout component. (See `client/src/pages/threads/create.tsx`, `auth-page.tsx`, etc.)
- [ ] Update any lingering `/* eslint-disable */` blocks to comply with project rules or justify them.

## 2. Dead / Legacy Code

- [ ] Remove `legacy/client/` tree once feature parity is confirmed.
- [ ] Delete `.DS_Store`, backup files (e.g. `env.local.backup*`, old `vite.config.ts.timestamp-*`).
- [ ] Prune generated `meta/_snapshot.json` versions older than latest N to shrink repo size.

## 3. Documentation Gaps

- [ ] Add `README.md` for top-level packages missing it (e.g. `client/src/features`, `server/src/domains/*` sub-folders).
- [ ] Keep `README-FORUM.md` updated when forum-related changes occur.

## 4. TODO / FIXME Backlog

Quick grep found 150+ TODO markers. High-priority areas:

- [ ] **Forum Thread & Post routes** – permission checks, tag CRUD, tipping logic.
- [ ] **Wallet / CCPayment integration** – complete deposit/withdraw/swap logic & schema updates.
- [ ] **XP & Clout services** – level-up checks, notifications.
- [ ] **Admin pages** – bulk actions, pagination components, toast notifications.
- [ ] **Profile pages** – real data hooks for stats, friend requests, achievements.

## 5. Import Hygiene

- [ ] Fix default vs. named import mismatches flagged by lint (see `AdminLayout` example).
- [ ] Ensure every TS file uses `import type` for type-only imports per project convention.

## 6. Config-First Enforcement

- [ ] Extract hard-coded colours / strings in components into `*.config.ts` files.
- [ ] Add Zod validation schemas where missing (themes, layouts, business rules).

## 7. Schema / Types Alignment

- [ ] Fill `@syncSchema` items (e.g. `siteSettings.updatedBy`, `featureFlags.rolloutPercentage`).
- [ ] Resolve TODO foreign keys (self-ref `users.referrerId`, wallet columns, etc.).
- [ ] Regenerate Drizzle types and move schema-dependent types to `db/types/`.

## 8. Tests & Coverage

- [ ] Increase Jest/Vitest coverage in `server/src/domains/*`, particularly wallet & forum services.
- [ ] Add e2e tests for new admin XP pages.

## 9. Build / Tooling

- [ ] Replace `npm` scripts that call non-existent package.json in sub-dirs (see workspace rule 5).
- [ ] Remove obsolete ts-node/tsx entry guards; use ESM-safe patterns in config files.

## 10. Miscellaneous

- [ ] Consolidate duplicate Profile components (e.g. `UserAvatar` vs. `user-avatar`).
- [ ] Finish component merge under `scripts/refactor/component-merge/*`.
- [ ] Remove legacy wrapper `site-layout-wrapper.tsx` after Phase 3 migration.

---

### Next Steps

1. Groom this checklist – triage items into sprint-sized tasks.
2. Open GitHub issues and label by domain (frontend, backend, docs, infra).
3. Tackle high-impact/low-risk items first (lint violations, dead files).
