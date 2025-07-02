# Forum Category ➜ Canonical Forum Migration Playbook

**Goal:** Completely remove the legacy `ForumCategory` model and standardise the entire stack on **CanonicalForum** (design-time) and **MergedForum** (runtime).

---
## 📅 Phase 0 — Project-wide awareness (1 day)
1. Post a kick-off message in **#dev-forum** and update Notion:
   * Reason for deprecation
   * Replacement types
   * Hard cut-off date (Q4 2025)
2. Open Jira epic **“ForumCategory sunset”** and add every task below as sub-tickets.
3. Link this file (`docs/FORUM-MUSTDO.md`) in the epic and Confluence.

---
## 🗂 Phase 1 — Inventory & automated guards (1 day)
### 1.1 Ripgrep inventory
```bash
rg -I --files-with-matches -e '\bForumCategory\b|\bForumCategoryWithStats\b' > tmp/category-refs.txt
```
* Label each result: **frontend / backend / test / fixture / dead-code**.

### 1.2 Frontend ESLint guard
* Add rule **`no-forumcategory-import`** to `eslint-plugins/degen`.
  * Fails the build if any file imports / references `ForumCategory*`.

### 1.3 Backend TS guard
* Ensure `tsconfig.base.json` has `"noImplicitOverride": true` so old interfaces can’t secretly extend `ForumCategory`.

---
## 🛠 Phase 2 — Backend migration (3–4 days)
### 2.1 Schema & types
1. Rename or wrap `forum_categories` table/view → `forums`.
2. In `db/schema/forum/structure.ts` replace Drizzle model `ForumCategory` with `ForumBase` (fields mirror `CanonicalForum`).
3. Regenerate types via `npm run db:types`.

### 2.2 Repositories
* `server/src/core/repository/interfaces.ts` – change generics `<ForumCategory>` ➜ `<ForumBase>`.
* Update implementing classes (`forum-repository.ts`, cache services…).

### 2.3 Services & controllers
* All endpoints must emit the flat `{ zones, forums }` payload already expected by the FE.
* DTOs should reference `CanonicalForum` exclusively.

### 2.4 Fixtures & seeders
* Rename `ForumCategoryFactory` ➜ `ForumBaseFactory` and align fields.

### 2.5 Tests
* Refactor e2e / unit tests to target new endpoints and shapes.

---
## 🎨 Phase 3 — Frontend migration (3 days)
### 3.1 Context & hooks
* `ForumStructureContext` currently outputs `MergedForum`. Once API stable, remove fallback builders & `ForumCategoryLite`.

### 3.2 Component props audit
1. Iterate over `tmp/category-refs.txt`.
2. For each component:
   * Accept `MergedForum` or a thin DTO mapped from it.
   * Delete any prop expecting `ForumCategory*`.

### 3.3 Route loaders / pages
* Update `/pages/forums/[slug].tsx`, `/pages/zone/[slug].tsx` to use context only (no `categoryId`).

### 3.4 React-Query keys
* Rename caches from `['forumCategory', id]` ➜ `['forum', id]`.
* Bump cache version to force reload.

### 3.5 Type cleanup
* Delete `ForumCategoryLite` and other legacy aliases in `client/src/types`.

---
## 🔗 Phase 4 — Shared packages & infra (1 day)
### 4.1 Shared libs
* Update helpers in `shared/lib/forum/` & `lib/forum/` to accept `CanonicalForum`.

### 4.2 Config-first validation
* Add Zod schema reflecting `CanonicalZone/Forum/Subforum` and validate `forumMap.config.ts` at build time.

---
## 📝 Phase 5 — Docs & developer tooling (0.5 day)
1. Purge *categories* terminology from all forum docs.
2. Update API references in `docs/api/forum/*`.
3. Create codemod `scripts/refactor/remove-forumcategory.ts` and wire into CI (fails if keyword found).

---
## 🚀 Phase 6 — Progressive rollout & cleanup (2 days)
1. Deploy backend to **staging** behind flag `forumStructure.v2`.
2. Point FE staging → new API. Monitor Sentry for 24 h.
3. If clean:
   * Remove feature flag.
   * Delete fallback builders, shim types, DB views.
4. Final cleanup PR: purge all `ForumCategory*` refs and enforce linter rule.

---
## ⏱ Timeline (ideal)
* **Week 1** – Phases 0-2
* **Week 2** – Phases 3-5
* **Week 3** – Phase 6 + monitoring

---
## ✅ Success criteria
* `rg -w ForumCategory` returns **0 matches**.
* API delivers canonical `{ zones, forums }` with no fallback.
* Components use `CanonicalForum` / `MergedForum` only.
* CI blocks re-introduction of legacy type.
* Docs fully updated.

---
> Keep this playbook updated as tasks close. When every checkbox is done, archive this file under `docs/archive/2025-forum-migration/`.