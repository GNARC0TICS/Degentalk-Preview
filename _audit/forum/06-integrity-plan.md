### Forum Structure Data Flow Refactor & Integrity Plan (2025-06-15)

**Objective:** Resolve the hierarchical-vs-flat data mismatch and perform an integrity sweep of forum code.

#### Phase 1 – `flattenApiResponse` Shim
1.  - [ ] Implement `flattenApiResponse` shim in `client/src/contexts/ForumStructureContext.tsx`.
2.  - [ ] Flatten `primaryZones` / `categories` into a flat list within the shim.
3.  - [ ] Ensure defaults for missing fields in the flattened list.
4.  - [ ] Pipe the result of the shim into `mergeStaticAndApiData`.

#### Phase 2 – Integrity Sweep
1.  - [ ] Scan for unused forum files.
2.  - [ ] Delete identified dead code.
3.  - [ ] Align routing helpers and type usage across the forum feature.
4.  - [ ] Flag ambiguous filenames (e.g., `categories.ts` schema, etc.) for renaming or clarification.

---

### Immediate Findings & Next Steps

- [ ] Delete `client/src/config/zones.config.ts`.
- [ ] Delete `client/src/pages/forum-search.tsx` (assuming this is the `forum-search.tsx` referred to).
- [ ] Remove `mapToHierarchicalStructure` helper.
- [ ] Fix `rule.versionHash` bug in `server/src/domains/forum/rules/rules.routes.ts` (assuming this is the `rules.routes.ts` referred to).
- [ ] Standardise URL generation in `client/src/utils/forum-routing-helper.ts`.
- [ ] Continue user-flow audit (zone, forum, thread pages).
