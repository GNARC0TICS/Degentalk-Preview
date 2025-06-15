## Batch 2

### More Duplicate / Divergent Components

#### client/src/features/forum/components/ThreadCard.tsx  
#### client/src/components/forum/thread-card.tsx

##### 🔍 Issues
- Two separate `ThreadCard` versions diverge in props and styling (Next.js `Link` vs Wouter, different tag handling).
- Inconsistent **type sources**: one expects `ThreadWithUserAndCategory`, the other local `ApiThread` interface.
- Risk of developer confusion and inconsistent UX.

##### ✅ Suggestions
- Consolidate into **one** canonical `ThreadCard` (top-level `components/forum`).
- Move route navigation logic behind a prop (`as="next" | "wouter"`) or abstract via `@/lib/Link` wrapper so SSR/CSR libs can swap transparently.
- Convert shared field subset into `ThreadCardProps` type in `@/types/forum`.

---

#### client/src/features/forum/components/CreateThreadButton.tsx  
#### client/src/components/forum/create-thread-button.tsx

##### 🔍 Issues
- Nearly identical but diverging on parameter (`forumSlug` vs `categoryId`).
- Duplicates Lucide `Plus` import and auth redirect logic.

##### ✅ Suggestions
- Extract common behaviour into a **configurable** `CreateThreadButton` with props:
  ```tsx
  type CreateThreadButtonProps = {
    forumSlug?: string;
    categoryId?: number;
    redirectAuth?: boolean; // default true
  } & ButtonProps;
  ```
- Encapsulate auth-guard & URL-builder inside.
- Delete feature-level copy.

---

### Context vs Legacy Hook

#### client/src/features/forum/hooks/useForumStructure.ts

##### 🔍 Issues
- Fetches forum structure via API independently of `ForumStructureContext`; several components (e.g. `HierarchicalZoneNav`) now consume context, but others still import this **stale hook**.
- Duplicates type definitions already declared in `contexts/ForumStructureContext.tsx`.

##### ✅ Suggestions
- Deprecate `useForumStructure` hook; export context selector hooks (`useZones`, `useForums`) from the context file.
- Add ESLint rule to block imports from the legacy hook path.

---

### Backend Data-flow & Performance

#### server/src/domains/forum/forum.service.ts → `getCategoriesWithStats()`

##### 🔍 Issues
- Executes multiple sub-queries per category to compute `threadCount` / `postCount` → classic N+1.
- Complete category list is re-fetched **per request**, no caching.

##### ✅ Suggestions
- Replace with single SQL using `LEFT JOIN LATERAL` aggregates or Drizzle `count(threads.id).over(partition)`.
- Memoise result in in-memory cache (e.g. `node-cache`) for 30 s or expose via `/core/cache` util.
- Expose opt-in `includeCounts` query param so lightweight clients can skip heavy counts when not needed (e.g. mobile nav).

---

### Schema Coherence

##### 🔍 Issues
- `forum_categories` has both `type` column (`zone|category|forum`) **and** boolean flags `isZone`, `canonical`. Redundant truth sources.
- `parentForumSlug` duplicated in `threads` & `forum_categories`; can drift.

##### ✅ Suggestions
- Normalise on single enum `type`; derive booleans in views/queries.
- Remove `parentForumSlug` from `threads`; instead rely on FK join to category → zone.
- Use **generated columns** if quick look-ups by slug are needed.

---

### Frontend Rendering Hotspots

#### client/src/features/forum/components/HotThreads.tsx

##### 🔍 Issues
- Renders entire card list each page change – no virtualization.
- Uses anonymous arrow functions in props → re-render churn.

##### ✅ Suggestions
- Wrap thread card list in `react-window` or `framer-motion` list virtualization.
- Memoize `ThreadCard` and extract `ThreadStats` sub-component. 