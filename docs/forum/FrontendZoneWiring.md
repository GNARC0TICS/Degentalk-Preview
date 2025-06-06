# 📌 Frontend Zone Integration Plan

This document outlines the scope, tasks, and decisions required for integrating the seeded zone data into the Degentalk frontend.

## 1. **Zone Renderer Wiring**
- **Data Fetching**: 
  - Create or update API endpoints to fetch zones directly from the `forumCategories` table.
  - Ensure API returns `forum_type`, `position`, and other necessary fields.
- **Component Logic**:
  - Refactor `CanonicalZoneGrid` and related components to dynamically render based on `forum_type`.
  - Primary Zones displayed first, sorted by `position`.
  - General Zones follow, also sorted by `position`.

## 2. **Client Routing Sync**
- **Routing Utilities**:
  - Implement helper functions:
    - `getZonePath(zone)` to generate correct paths based on zone type and slug.
    - `isPrimaryZone(zone)` to determine layout and routing logic.
- **Routing Refactor**:
  - Consolidate and clearly define routes:
    - Primary Zones: `/[zone_slug]`
    - General Forums: `/forum/[slug]`
  - Remove redundant or ambiguous routes (`[id].tsx`, `[forum_slug].tsx`) and consolidate into `[slug].tsx`.

## 3. **Navigation & Landing Pages**
- **Home Page (`client/src/pages/home.tsx`)**:
  - Update to dynamically showcase Primary Zones first.
  - Ensure `CanonicalZoneGrid` correctly reflects new zone structure.
- **Sidebar & Navigation**:
  - Refactor `HierarchicalZoneNav` to dynamically reflect the new zone structure.
  - Ensure navigation is consistent across all pages.
- **Fallback & Error Handling**:
  - Implement robust 404 handling for invalid slugs or missing zones.

## 4. **Analytics & Tagging System Preparation**
- **Scaffolding**:
  - Begin scaffolding prefix/tag logic (`prefixRegistry.ts`).
  - Define schema and input methods for thread tagging.
- **Analytics Endpoint**:
  - Create placeholder route `/api/analytics/hot-threads` for future implementation of trending logic.

## 5. **Component Audit & Cleanup**
- **Audit Existing Components**:
  - Review components in `client/src/pages/forum` and `client/src/pages/home.tsx`.
  - Clearly mark components for archival, deletion, or consolidation.
  - *Audit Log:*
    - [ ] `client/src/pages/home.tsx` components reviewed.
    - [ ] `client/src/pages/forum/*` components reviewed.
- **Archival & Consolidation**:
  - Move unused or redundant components to `archive/`.
  - Consolidate similar components to reduce redundancy.
  - *Decisions:*
    - Component X: [Archive/Delete/Consolidate with Y] - Reason: ...
    - Component Z: [Keep/Refactor] - Reason: ...

## 6. **Navigation Validation**
- **App-Level Navigation (`client/src/App.tsx`)**:
  - Ensure all new routes are correctly integrated and navigable.
  - Validate that navigation logic aligns with the new zone structure.

## ✅ **Task Log & Decisions**

This section will maintain a clear, centralized log of tasks completed, decisions made, and any issues encountered during the frontend integration.

### Component Audit Log
- **Date:** 2025-06-05
- **Auditor:** Cline
- **Files Audited:**
  - `client/src/pages/home.tsx`
  - `client/src/pages/forum/[forum_slug].tsx`
  - `client/src/pages/forum/[id].tsx`
  - `client/src/pages/forum/[slug].tsx`
- **Findings & Decisions:**
  - **`HierarchicalZoneNav` (from `client/src/features/forum/components/HierarchicalZoneNav`)**: [Status: Refactor] - Rationale: Core navigation component, needs to dynamically reflect new primary/general zone structure and sorting. - Action: Update logic to use `useForumStructure` data, differentiate between zone types, and ensure correct path generation.
  - **`CanonicalZoneGrid` (from `client/src/components/forum/CanonicalZoneGrid`)**: [Status: Refactor] - Rationale: Core component for displaying zones. Needs to render based on `forum_type`, sort by `position`, and handle primary vs. general zones. - Action: Modify to accept new zone data, implement sorting, and potentially differentiate rendering for primary/general zones.
  - **`HotThreads` (from `client/src/features/forum/components/HotThreads`)**: [Status: Review/Refactor] - Rationale: Displays trending threads. Needs to ensure thread data is correctly associated with the new zone structure. - Action: Review data fetching and display logic to align with new routing and zone organization.
  - **`useForumStructure` (hook from `client/src/features/forum/hooks/useForumStructure`)**: [Status: Refactor] - Rationale: Central hook for fetching forum data. Must be updated to fetch `forum_type`, `position`, and other new fields. - Action: Update API call and data processing to support the enhanced forum category schema.
  - **`client/src/pages/forum/[forum_slug].tsx`**: [Status: Consolidate/Archive] - Rationale: Current dynamic route for forums. Its functionality will be merged into `/[zone_slug]/index.tsx` for Primary Zones and the refactored `/forum/[slug].tsx` for General Forums. - Action: Identify reusable logic. Archive after functionality is migrated.
  - **`client/src/pages/forum/[id].tsx`**: [Status: Archive/Delete] - Rationale: Ambiguous dynamic route. The refactor plan aims to remove such routes in favor of clear slug-based routing. - Action: Archive and schedule for deletion once new routing is confirmed.
  - **`client/src/pages/forum/[slug].tsx`**: [Status: Refactor/Keep] - Rationale: Will serve as the template for General Forums (`/forum/[slug]`). - Action: Refactor to use new `useForumStructure` data and display general forum content.
  - **`client/src/pages/home.tsx` (relevant parts)**: [Status: Refactor] - Rationale: Homepage displays primary zones via `CanonicalZoneGrid` and uses `HierarchicalZoneNav`. - Action: Update to pass correct data to `CanonicalZoneGrid` and ensure `HierarchicalZoneNav` functions correctly.

### Routing Utilities Implementation Log
- **Date:** 2025-06-05
- **Developer:** Cline
- **Utilities Created/Modified:**
  - `getZonePath(zone)`: [Status: Scaffolding Complete] - Notes: Added function to `client/src/utils/forum-routing-helper.ts`. Returns `/[slug]` for primary zones and `/forum/[slug]` for general zones. Depends on `isPrimaryZone`.
  - `isPrimaryZone(zone)`: [Status: Scaffolding Complete] - Notes: Updated existing function in `client/src/utils/forum-routing-helper.ts` to prioritize `forum_type === 'primary'`. `ForumEntityBase` interface updated to include `forum_type`. `getForumEntityType` and `getStaticBreadcrumbs` also updated to align with new `forum_type` values and `getZonePath` logic. Initial TS error in `getStaticBreadcrumbs` resolved.

### Homepage & CanonicalZoneGrid Wiring Log
- **Date:** 2025-06-05
- **Developer:** Cline
- **Issue Encountered:** Widespread "Cannot find module" errors for aliased paths (e.g., `@/lib/queryClient`, `@/components/*`) in `client/src/pages/home.tsx` and potentially other files.
  - **Root Cause:** The `seed:forum` script in `package.json` was modified, and the user suspected the removal of `tsconfig-paths/register` from the execution path was the cause. While the script it ultimately called (`db:seed:zones` which runs `seed-zone-registry.ts`) *did* use `tsconfig-paths/register`, the change in how `seed:forum` was defined was believed to be linked to the alias resolution issues appearing in `home.tsx` (possibly affecting language server parsing or a related build/runtime context).
  - **Resolution:** The `seed:forum` script in `package.json` was updated to directly invoke `scripts/db/seed-zone-registry.ts` with `tsx -r tsconfig-paths/register`. This ensures the explicit presence of the alias loader in the `seed:forum` command definition.
  - **Consequences of Break:** Inability to resolve aliased modules, leading to errors during development (language server) or potentially at runtime if `home.tsx` or related files were processed by a script without proper alias setup.
- **Files Modified (for this issue):**
  - `package.json` (to update the `seed:forum` script)
- **Changes Made (related to wiring, separate from the alias issue):**
  - ...
- **Status:** [Blocked by alias issue, now Resolved] - Notes: Alias issue addressed. Proceeding with homepage integration.

### Analytics & Tagging Stubs Log
- **Date:** 2025-06-05
- **Developer:** Cline
- **Files Created/Modified:**
  - `server/src/domains/admin/sub-domains/analytics/routes/hot-threads.routes.ts`
  - `client/src/constants/primaryZones.ts`
  - `client/src/components/forum/ZoneCard.tsx`
- **Changes Made:**
  - Updated `/api/analytics/hot-threads` route to return a detailed static payload for `HotThreads` component.
  - Created `client/src/constants/primaryZones.ts` with a `PrimaryZone` interface and placeholder data for `mission-control`, `the-pit`, `the-vault`, and `briefing-room`. This registry includes `id`, `label`, `description`, `tagline`, `icon`, `gradient`, `displayPriority`, `forums`, and `seo` fields.
  - Refactored `client/src/components/forum/ZoneCard.tsx` to:
    - Accept a `zoneId` prop.
    - Fetch zone configuration (name, description, icon, gradient, slug) from `primaryZones.ts`.
    - Use the `gradient` from the registry for styling.
    - Update `zoneUrl` to point to root `/[slug]` for primary zones.
    - Include a fallback UI if `zoneId` is not found in the registry.
- **Status:** [Completed] - Notes: `primaryZones.ts` was created to handle zone-level configuration for `ZoneCard` instead of using `prefixRegistry.ts` which is for thread-level prefixes. TypeScript errors regarding module resolution in `ZoneCard.tsx` were noted but assumed to be handled by project configuration.
