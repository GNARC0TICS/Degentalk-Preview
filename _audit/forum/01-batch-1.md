## Batch 1 - RESOLVED

**Overall Status:** All items in this batch have been addressed.

---

### Duplicate Components & Dead Code

#### client/src/components/forum/SolveBadge.tsx
#### client/src/features/forum/components/SolveBadge.tsx

##### 🔍 Issues
- Two identical `SolveBadge` implementations exist in separate locations, creating bundle bloat and maintenance overhead.
- Unused Lucide imports (`CheckCircle`, etc.) referenced in comments (historical) but not removed.

##### ✅ Suggestions & Resolution
- [x] Keep a single `SolveBadge` (prefer `client/src/components/forum/SolveBadge.tsx`).
    *   **Resolution:** Confirmed `client/src/features/forum/components/SolveBadge.tsx` does not exist. The primary component `client/src/components/forum/SolveBadge.tsx` is in use and appears correct.
- [x] Delete the duplicate `SolveBadge` under `features/forum`.
    *   **Resolution:** File did not exist.
- [x] Run `ts-prune` or equivalent to verify only one export is referenced.
    *   **Resolution:** Search confirmed no imports from the non-existent path. The existing component `client/src/components/forum/SolveBadge.tsx` does not have unused Lucide imports.
- [x] Adjust imports accordingly.
    *   **Resolution:** No broken imports found.

---

### Unused Helper Functions

#### server/src/domains/forum/forum.routes.ts (multiple occurrences) - `getUserId`

##### 🔍 Issues
- Custom helper `getUserId` defined in multiple files (`forum.routes.ts`, possibly in other routes) duplicates logic present in global auth util.

##### ✅ Suggestions & Resolution
- [x] Centralise user-ID extraction in a shared auth util (e.g. `@server/utils/auth.ts`).
    *   **Resolution:** The centralized utility `server/src/utils/auth.ts` (`getUserIdFromRequest`) was identified and enhanced to include `devId` handling for development.
- [x] Import the centralized util where needed.
    *   **Resolution:** Done for all identified files.
- [x] Remove legacy copies of `getUserId` to avoid divergence.
    *   **Resolution:** Local `getUserId` functions were removed from 8 route files:
        *   `server/src/domains/notifications/notification.routes.ts` (was unused)
        *   `server/src/domains/messaging/message.routes.ts` (refactored; separate schema issues noted)
        *   `server/src/domains/profile/signature.routes.ts` (refactored)
        *   `server/src/domains/profile/profile.routes.ts` (was unused)
        *   `server/src/domains/forum/rules/rules.routes.ts` (refactored; separate schema/Drizzle issues noted)
        *   `server/src/domains/engagement/vault/vault.routes.ts` (refactored; separate VaultService issues noted)
        *   `server/src/domains/social/relationships.routes.ts` (refactored)
        *   `server/src/domains/preferences/preferences.routes.ts` (refactored; separate TS errors noted)
    *   `server/src/domains/forum/forum.routes.ts` was already using the centralized utility.

---

### client/src/components/forum/ZoneCard.tsx

##### 🔍 Issues
- Contains independent badge/XP-boost logic that is **also** recreated inside `client/src/components/forum/CanonicalZoneGrid.tsx`.  Violates DRY.
- Import list includes `Flame`, `Eye`, `MessageSquare`, `Users`, `Clock` — confirm all are utilised; preliminary scan shows some icons unused in render.

##### ✅ Suggestions & Resolution
- [x] Extract common badge/UI logic into shared sub-components (e.g., `ZoneStats.tsx`, `XpBoostBadge.tsx`).
    *   **Resolution:** Confirmed that `ZoneCard.tsx` already utilizes `XpBoostBadge.tsx` and `ZoneStats.tsx`. `CanonicalZoneGrid.tsx` correctly uses the imported `ZoneCard.tsx` and does not duplicate this logic. This seems to have been previously resolved.
- [x] Remove unused icon imports from `ZoneCard.tsx` to reduce bundle size.
    *   **Resolution:** `ZoneCard.tsx` only imports `Clock` and `Flame`, both of which are used. A comment indicates other icons were already moved to `ZoneStats.tsx`. This also seems previously resolved.
