## Forum Audit – Consolidated Master Checklist (2025-06-16)

> This file replaces the per-batch audit notes (`00-overview.md` → `08-consolidation-update.md`).
> Those files are kept for historical reference but **no longer maintained**. All new work should
> reference the checklist below.

---

### Progress Snapshot
| Batch / Section | Status | Notes |
|-----------------|--------|-------|
| Batch 1 | ✅ Complete | Duplicate components & dead code removed |
| Batch 2 | ✅ Complete | ThreadCard consolidation, hook deprecation, N+1 query fixes |
| Batch 3 | ⚠️ 1 task open | Backend theming still hard-coded (`ZONE_THEMES`) |
| Batch 4 | ⚠️ DB cascade audit in-progress | All other perf/logging items closed |
| Batch 5 | ⏳ In progress (≈25 %) | Contract enforcement, e2e tests, settings service outstanding |
| Profile Polish (5b) | ⏳ 75 % | Responsive `StatCard` grid still to do |
| Integrity Plan (06) | ⏳ Not started | Flat-hierarchy shim + sweep pending |
| User Flow Audit (07) | ⏳ Early | Only PostCard consolidation completed |

**Overall completion:** ~50 % (estimated 42 / 84 tasks).

---

### Recently Completed Highlights
- Canonical **SolveBadge**, **ThreadCard**, **CreateThreadButton**, and sanitised **PostCard** in place.
- `getCategoriesWithStats` rewritten to a single aggregated query & cached.
- Virtualised post list on thread pages via `react-window`.
- Global `traceMiddleware` & structured logging replace scattered `console.log` calls.
- ESLint `no-console` rule enforced server-side.
- Lucide icon treeshaking enabled; bundle size reduced.

---

### Strategic Outstanding Checklist
The list below merges all remaining open items from Batches 3-7 and the Integrity Plan.  Tackle
items top-down; many unlock (or block) later work.

#### 1. Theming & Config
- [ ] Move `ZONE_THEMES` constants to DB-backed `ui_themes` table; expose via Config Service.
- [ ] Implement live theming override in Admin UI (subscribe via WebSocket).
- [ ] Ensure Tailwind safelist / CSS-var palette aligns with dynamic themes.

#### 2. Cross-Layer Contract & Type Safety (Batch 5)
- [ ] Generate single source of truth types via `drizzle-codegen` → `forum-sdk`.
- [ ] Add CI contract tests (`schemaspec`) to catch drift.
- [ ] Auto-publish OpenAPI docs at `/api/docs` using `express-zod-openapi`.

#### 3. Forum Structure Integrity Plan (06)
- [ ] Build `flattenApiResponse` shim inside `ForumStructureContext`.
- [ ] Flatten `primaryZones`/`categories` with sane defaults.
- [ ] Delete `mapToHierarchicalStructure` helper after migration.
- [ ] Full sweep for unused forum files & ambiguous filenames; rename or remove.

#### 4. Frontend User-Flow Polish (07)
- [ ] Zone page: drop thread listing, focus on child forums.
- [ ] ForumHeader: unify props & theming map.
- [ ] Forum page: use context; fix breadcrumbs; enforce posting perms.
- [ ] Thread page: use canonical components; implement edit/delete; signature sanitisation.
- [ ] CreateThreadForm / CreatePostForm / ReplyForm: centralise rule & permission checks.
- [ ] LikeButton: refactor to presentational component with `size` prop.
- [ ] ReactionTray: memoise & respect single-reaction UX.

#### 5. End-to-End & CI (Batch 5)
- [ ] Playwright: visitor navigation scenario.
- [ ] Playwright: logged-in CRUD scenario (create thread, reply, like, tip, mark solution).
- [ ] Playwright: admin locks forum scenario.
- [ ] Create dedicated `e2e.db` and reset script.

#### 6. Database & Query Integrity
- [ ] Audit all LEFT vs INNER JOIN usage where FK `onDelete: set null` (Batch 4).
- [ ] Add automated FK-orphan test (`validate-forum-fks.ts`) to CI (script exists – wire into CI).

#### 7. Config Service & Caching
- [ ] Route **all** settings through `core/config.ts` service.
- [ ] Redis cache for frequently accessed settings & XP multipliers.

#### 8. UI Polish & Accessibility
- [ ] `StatCard` grid: make responsive with `auto-fit` minmax 140 px.

#### 9. Bundling & Docs
- [ ] Standardise React-Query cache keys in `forum-sdk`.
- [ ] Storybook docs for ZoneCard, ThreadCard, PostCard.

#### 10. Shipping Gate
- [ ] Deduplicate/alias any straggler files.
- [ ] Publish `forum-sdk` locally.
- [ ] `npm run lint --workspace=server` passes.
- [ ] Migrations patched to `IDENTITY`.
- [ ] Playwright suite green.
- [ ] Vite build size diff < 50 KB gzip.
- [ ] README updated.

---

### How to Use This Checklist
1. When closing an item, replace `[ ]` with `[x]` and add a short note (1-2 words) after the task if helpful.
2. Commit the change together with the code that resolves the task.
3. Keep PR titles prefixed with `ForumAudit:` so we can filter the history.

---

*Historical batch files (`00-overview.md`-`08-consolidation-update.md`) are archived but retained for
context; feel free to delete them after this audit fully closes.*
