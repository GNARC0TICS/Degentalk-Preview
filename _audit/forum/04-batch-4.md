## Batch 4 – Performance & Observability

### Logging & Observability

#### server/src/domains/forum/forum.routes.ts & forum.controller.ts

##### 🔍 Issues
- Multiple `console.log` statements scattered across route handlers (search lines ~1200–1500).
- Leaks request params and potentially sensitive data in production logs.
- Bypasses central `core/logger.ts`, so log level / formatting is inconsistent and not trace-able.

##### ✅ Suggestions
- [x] Replace `console.log` statements with `logger.info/debug` and add contextual metadata (requestId). (Verified `console.error` replaced with `logger.error` in `forum.routes.ts`)
- [x] Wrap route handlers with `traceMiddleware` to auto-log HTTP lifecycle. (Verified `traceMiddleware` is applied globally in `server/index.ts`)
- [x] Add ESLint rule `no-console (error)` in server tsconfig path. (Verified in `.eslintrc.json`)

---

### Redundant Hooks / Naming Drift

#### `useForumPrefixes` vs `useThreadPrefixes` (client/src/features/forum/hooks/useForumQueries.ts)

##### 🔍 Issues
- Two hooks return same data with overlapping fetch logic (category/forum slug → prefixes).
- Increases bundle size and cognitive load.

##### ✅ Suggestions
- [x] Merge into single `usePrefixes` with params `{ forumSlug?: string; categoryId?: number }`. (Completed, TS errors resolved)
- [x] Alias old names to new hook and mark as deprecated in JSDoc until callers migrate. (Completed as part of hook merge)

---

### Large Thread Pages – Missing Virtualisation

#### client/src/pages/threads/[thread_slug].tsx (not yet refactored)

##### 🔍 Issues
- Renders full post list (potentially hundreds) with `PostCard` components; no windowing.
- Causes long Time-to-Interactive on large threads.

##### ✅ Suggestions
- [x] Integrate `react-virtuoso` or `react-window` list for posts. (Completed: `react-window` `FixedSizeList` implemented in `client/src/pages/threads/[thread_slug].tsx` after dependency issues resolved.)
- [x] Provide "jump to newest" anchor to improve UX. (Completed: Added button and `scrollToItem` functionality in `client/src/pages/threads/[thread_slug].tsx`)

---

### Service Layer: Thread Detail Fetch

#### forum.service.ts → `getThreadDetails`

##### 🔍 Issues
- Performs separate query to fetch posts, user, likes per page; can be collapsed into single query with joins + aggregates.
- Uses `limit` default 50, but frontend paginates 20 – waste of DB / bandwidth.

##### ✅ Suggestions
- [x] Accept `limit` from caller with sane cap (100) in `getThreadDetails`. (Implemented: `requestedLimit` capped to `MAX_LIMIT`, default changed to 20)
- [x] Use Drizzle eager joins to fetch user & reactions in one call within `getThreadDetails`. (Implemented: User like status for posts is now fetched using a subquery and included)

---

### Config vs Hard-coded Themes

##### 🔍 Issues
- Theme color classes inside components reference Tailwind classes via string interpolation (e.g. `bg-${theme}-700`) which breaks PurgeCSS.

##### ✅ Suggestions
- [x] Move palette to CSS variables (e.g. `--forum-theme-primary`). Components toggle `theme-${key}`. (Refactored `PrefixBadge`, `AdminPrefixesPage`, `ThreadCard`, and `ForumHeader` to use this pattern).
- [x] Safelist variable list in `tailwind.config.ts` if dynamic. (Addressed by using static utility classes in components that consume CSS variables. User to ensure Tailwind config and CSS variables are correctly set up).

---

### DB Cascade Rules

##### 🔍 Issues
- Several FK references use `onDelete: set null` but code sometimes joins with `INNER JOIN users`, risking crashes.

##### ✅ Suggestions
- [~] Audit joins to ensure `LEFT JOIN` when FK is nullable and uses `onDelete: set null`. (Audit of Drizzle schema for `threads` and `posts` tables, and search in `forum.service.ts` did not find `INNER JOIN`s on `featuredBy`, `threads.deletedBy`, `posts.deletedBy`, `posts.editedBy` which use `onDelete: 'set null'`. Broader codebase audit or specific scenarios might be needed if issues persist.)
- [ ] Add DB constraint tests (e.g., in `scripts/testing/validate-forum-fks.ts`). (This is a development task for future implementation.)
