## Batch 1

### Duplicate Components & Dead Code

#### client/src/components/forum/SolveBadge.tsx
#### client/src/features/forum/components/SolveBadge.tsx

##### 🔍 Issues
- Two identical `SolveBadge` implementations exist in separate locations, creating bundle bloat and maintenance overhead.
- Unused Lucide imports (`CheckCircle`, etc.) referenced in comments (historical) but not removed.

##### ✅ Suggestions
- Keep a single `SolveBadge` (prefer `client/src/components/forum/SolveBadge.tsx`) and delete the duplicate under `features/forum`.
- Run `ts-prune` or equivalent to verify only one export is referenced; adjust imports accordingly.

---

### Unused Helper Functions

#### server/src/domains/forum/forum.routes.ts (multiple occurrences)

##### 🔍 Issues
- Custom helper `getUserId` defined in multiple files (`forum.routes.ts`, possibly in other routes) duplicates logic present in global auth util.

##### ✅ Suggestions
- Centralise user-ID extraction in a shared auth util (e.g. `@server/utils/auth.ts`) and import where needed.
- Remove legacy copies to avoid divergence.

---

### client/src/components/forum/ZoneCard.tsx

##### 🔍 Issues
- Contains independent badge/XP-boost logic that is **also** recreated inside `client/src/components/forum/CanonicalZoneGrid.tsx`.  Violates DRY.
- Import list includes `Flame`, `Eye`, `MessageSquare`, `Users`, `Clock` — confirm all are utilised; preliminary scan shows some icons unused in render.

##### ✅ Suggestions
- Extract common badge/UI logic into shared sub-components (`ZoneStats.tsx`, `XpBoostBadge.tsx`).
- Remove unused icon imports to reduce bundle size. 