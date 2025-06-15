### Forum Structure Data Flow Refactor & Integrity Plan (2025-06-15)

**Objective:** Resolve the hierarchical-vs-flat data mismatch and perform an integrity sweep of forum code.

#### Phase 1 – `flattenApiResponse` Shim
1. Implement in `client/src/contexts/ForumStructureContext.tsx`.
2. Flatten `primaryZones` / `categories` → flat list; ensure defaults for missing fields.
3. Pipe result into `mergeStaticAndApiData`.

#### Phase 2 – Integrity Sweep
1. Scan for unused forum files; delete dead code.
2. Align routing helpers and type usage.
3. Flag ambiguous filenames (`categories.ts` schema, etc.).

---

### Immediate Findings & Next Steps

* Delete `client/src/config/zones.config.ts` & `forum-search.tsx`.
* Remove `mapToHierarchicalStructure` helper.
* Fix `rule.versionHash` bug in `rules.routes.ts`.
* Standardise URL generation in `forum-routing-helper.ts`.
* Continue user-flow audit (zone, forum, thread pages). 