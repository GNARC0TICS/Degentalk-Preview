## Batch 4 – Performance & Observability

### Logging & Observability

#### server/src/domains/forum/forum.routes.ts & forum.controller.ts

##### 🔍 Issues
- Multiple `console.log` statements scattered across route handlers (search lines ~1200–1500).
- Leaks request params and potentially sensitive data in production logs.
- Bypasses central `core/logger.ts`, so log level / formatting is inconsistent and not trace-able.

##### ✅ Suggestions
- Replace with `logger.info/debug` and add contextual metadata (requestId).
- Wrap route handlers with `traceMiddleware` to auto-log HTTP lifecycle.
- Add ESLint rule `no-console (error)` in server tsconfig path.

---

### Redundant Hooks / Naming Drift

#### `useForumPrefixes` vs `useThreadPrefixes` (client/src/features/forum/hooks/useForumQueries.ts)

##### 🔍 Issues
- Two hooks return same data with overlapping fetch logic (category/forum slug → prefixes).
- Increases bundle size and cognitive load.

##### ✅ Suggestions
- Merge into single `usePrefixes` with params `{ forumSlug?: string; categoryId?: number }`.
- Alias old names to new hook and mark as deprecated in JSDoc until callers migrate.

---

### Large Thread Pages – Missing Virtualisation

#### client/src/pages/threads/[thread_slug].tsx (not yet refactored)

##### 🔍 Issues
- Renders full post list (potentially hundreds) with `PostCard` components; no windowing.
- Causes long Time-to-Interactive on large threads.

##### ✅ Suggestions
- Integrate `react-virtuoso` or `react-window` list for posts.
- Provide "jump to newest" anchor to improve UX.

---

### Service Layer: Thread Detail Fetch

#### forum.service.ts → `getThreadDetails`

##### 🔍 Issues
- Performs separate query to fetch posts, user, likes per page; can be collapsed into single query with joins + aggregates.
- Uses `limit` default 50, but frontend paginates 20 – waste of DB / bandwidth.

##### ✅ Suggestions
- Accept `limit` from caller with sane cap (100).
- Use Drizzle eager joins to fetch user & reactions in one call.

---

### Config vs Hard-coded Themes

##### 🔍 Issues
- Theme color classes inside components reference Tailwind classes via string interpolation (e.g. `bg-${theme}-700`) which breaks PurgeCSS.

##### ✅ Suggestions
- Move palette to CSS variables (e.g. `--forum-theme-primary`). Components toggle `theme-${key}`.
- Safelist variable list in `tailwind.config.ts` if dynamic.

---

### DB Cascade Rules

##### 🔍 Issues
- Several FK references use `onDelete: set null` but code sometimes joins with `INNER JOIN users`, risking crashes.

##### ✅ Suggestions
- Audit joins to ensure `LEFT JOIN` when FK nullable.
- Add DB constraint tests (`scripts/testing/validate-forum-fks.ts`). 