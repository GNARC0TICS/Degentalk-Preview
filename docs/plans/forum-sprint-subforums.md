# Forum Sprint: Subforum Implementation Plan

**Objective:** Implement subforum functionality, allowing a Forum (Parent Forum) to contain other Forums (SubForums). This creates a potential three-level content hierarchy: Zone → Parent Forum → SubForum(s) → Threads. The initial focus is on enabling this for General Zones, though the capability should be available for Primary Zones as well for future scalability.

**Target Structure (Decision: 1 Level of Subforums):**

- Level 1: **Zone** (Primary or General, identified by `pluginData.configZoneType`)
- Level 2: **Parent Forum** (Direct child of a Zone. Can contain threads AND child SubForums)
- Level 3: **SubForum** (Child of a Parent Forum. Can contain threads. **Hard limit: No Sub-Sub-Forums.**)
- **URL Structure:** Flat `/forums/[slug]` for all forums and subforums, with globally unique slugs.
- **"Category" Entity:** The `type: 'category'` concept is deprecated. All organizational units below Zones are `type: 'forum'`. A forum that acts as a non-postable container will have `rules.allowPosting = false` (or similar).

---

## Phase 1: Backend & Data Model Foundation

### 1.1. Configuration (`client/src/config/forumMap.config.ts`)

- **Task:** Modify the `Forum` interface to support nesting.
- **Change:**
  ```typescript
  export interface Forum {
  	// ... existing properties (slug, name, description, rules, themeOverride, position, tags)
  	forums?: Forum[]; // ADDED: Represents child forums (subforums)
  }
  ```
- **Action:** Update example configurations in `GENERAL_ZONES` to demonstrate a Parent Forum containing a `forums` array of SubForum objects.
- **Action:** Update example configurations in `GENERAL_ZONES` to demonstrate a Parent Forum containing a `forums` array of SubForum objects.
- **Validation:** Enhance the slug uniqueness validation logic at the end of the file to recursively check slugs of defined subforums (one level deep).
- **Comment:** Add a comment: `// Only one level of subforum nesting is supported. No sub-sub-forums.`

### 1.2. TypeScript Definitions

- **File:** `client/src/contexts/ForumStructureContext.tsx`
  - **Task:** Update `MergedForum` type.
  - **Change:**
    ```typescript
    export interface MergedForum {
    	// ... existing properties (id, slug, name, description, rules, themeOverride, position, tags, stats, parentZone info, etc.)
    	forums?: MergedForum[]; // ADDED: Represents child subforums, populated from API
    }
    ```
- **File:** `db/types/forum.types.ts`
  - **Task:** Ensure `ForumCategoryWithStats` can represent the nested structure if used by the service for this.
  - **Clarification:** The existing `childForums: ForumCategoryWithStats[]` property on `ForumCategoryWithStats` can be leveraged. The service logic will need to ensure that if a `ForumCategoryWithStats` item (where `type === 'forum'`) is a parent, its `childForums` array is populated with its subforums.
  - **Note on `type: 'category'`:** Since this type is deprecated, the service logic should treat all non-zone entities from `forum_categories` as potential forums/subforums.

### 1.3. Database Sync Script (`scripts/seed/syncForumsToDB.ts` or similar)

- **Task:** Adapt the script that processes `forumMap.config.ts` and syncs to the `forum_categories` database table.
- **Logic Change:**
  - The script must recursively traverse the `forums` array within `Zone` objects, and then the nested `forums` array within `Forum` objects (if present).
  - For each SubForum, its `parentId` in the database must be set to the database ID of its Parent Forum.
  - For each Parent Forum, its `parentId` must be set to the database ID of its Zone.
  - All entities defined as forums or subforums in the config should have `type = 'forum'` in the database. The script should no longer create or expect `type = 'category'` entities. Existing `type = 'category'` entities might need a migration or be handled as forums with posting disabled.

### 1.4. Forum Service (`server/src/domains/forum/forum.service.ts`)

- **Task:** Modify `getForumStructure()` to build and return the nested hierarchy.
- **Detailed Changes:**
  1.  **Fetch Flat List:** `getCategoriesWithStats(true)` will fetch all `forum_categories` entries. Ensure it correctly handles entities that were previously `type = 'category'` as `type = 'forum'`.
  2.  **Separate Entities:** Filter into `zoneEntities` and `allForumEntities` (all non-zone items are now considered forums).
  3.  **Build Nested Structure (Max 1 Level of Subforums):**
      - Create `forumMap = new Map<number, ForumCategoryWithStats & { forums?: ForumCategoryWithStats[]; ownThreadCount?: number; ownPostCount?: number; }>()`. Populate with `allForumEntities`, initializing `forums: []`. Store original `threadCount` and `postCount` as `ownThreadCount` and `ownPostCount`.
      - Iterate through `allForumEntities`. For each `potentialSubForum`:
        - If `potentialSubForum.parentId` exists AND `forumMap.has(potentialSubForum.parentId)` (i.e., parent is another forum, not a zone):
          - Add `forumMap.get(potentialSubForum.id)!` to `forumMap.get(potentialSubForum.parentId)!.forums`.
  4.  **Aggregate Stats (Roll-up):**
      - Iterate through `forumMap.values()`. For each `parentForum`:
        - `parentForum.threadCount = parentForum.ownThreadCount + sum(parentForum.forums.map(sf => sf.threadCount))`.
        - `parentForum.postCount = parentForum.ownPostCount + sum(parentForum.forums.map(sf => sf.postCount))`.
        - (Subforum stats are their own direct counts).
  5.  **Assemble Zones:**
      - Map through `zoneEntities`. For each `zone`:
        - Determine `isPrimary`.
        - Top-level forums for this zone are those in `forumMap` whose `parentId` matches `zone.id`.
        - Assign this array of parent forums (now with aggregated stats and populated subforums) to `zone.forums`.
        - Zone stats should also be aggregated from their child parent forums (which already include subforum stats).
  6.  **Return:** `{ zones: structuredZones }`. The API response should clearly distinguish between a forum's own stats and its aggregated stats if both are needed by the frontend. For simplicity, the main `threadCount` and `postCount` on a parent forum should be the rolled-up ones.
- **Impact on Other Methods:**
  - `getCategoryBySlug` (likely renamed to `getForumBySlug` or similar if `type: 'category'` is fully deprecated) should return a forum, and if it's a parent, its `forums` array should contain its subforums. Its `threadCount` and `postCount` should be the rolled-up stats.
  - `debugForumRelationships` will need updating.
  - Methods fetching individual forum details should clearly indicate if stats are direct or aggregated.

---

## Phase 2: Frontend Rendering & Navigation

### 2.1. Forum Index Page (`client/src/pages/forums/index.tsx`)

- **Task:** Display subforums under their parent forums within General Zones.
- **Changes:**
  - The `generalForumZones` data will now contain `MergedZone` objects where each `zone.forums` (parent forums) can have a nested `forum.forums` (subforums).
  - Modify `renderGeneralZone()`:
    - When iterating through `zoneData.forums` (parent forums) and calling `ForumListItem`:
      - Pass the full `MergedForum` object (which includes its subforums) to `ForumListItem`.

### 2.2. Forum List Item (`client/src/features/forum/components/ForumListItem.tsx`)

- **Task:** Adapt to display parent forum information (with rolled-up stats) and its list of subforums.
- **Changes:**
  - Accept `forum: MergedForum` as a prop.
  - Display the parent forum's details (name, description). Its `threadCount` and `postCount` will be the rolled-up stats.
  - Check if `forum.forums && forum.forums.length > 0`.
  - If subforums exist, render a list of them beneath the parent forum's details. This sub-list could:
    - Reuse `ForumListItem` for each subforum. A subforum's `threadCount` and `postCount` will be its own direct stats.
    - Pass a prop like `isSubforum={true}` for distinct styling (e.g., indentation).
  - Ensure links for parent forums and subforums use the flat `/forums/[slug]` structure.

### 2.3. Individual Forum Page (`client/src/pages/forums/[forum_slug].tsx`)

- **Task:** If the viewed forum is a parent forum, list its subforums.
- **Changes:**
  - The `forum: MergedForum` object fetched by `useForumStructure().getForum(forum_slug)` will now contain the `forums` (subforums) array.
  - Add a new UI section on this page (e.g., above the `ThreadList`) to display "Subforums".
  - Iterate through `forum.forums` and render each subforum, likely using the modified `ForumListItem` or a similar component.
  - The `ThreadList` component on this page should only display threads belonging _directly_ to the current `forum_slug` (parent forum). Threads from subforums are accessed by navigating to the subforum's own page.
  - The displayed `threadCount` and `postCount` for the parent forum should be the rolled-up stats. Optionally, display "Direct threads: X, Direct posts: Y" if needed.

### 2.4. Navigation Components

#### A. `client/src/navigation/forumNav.ts` (Function: `buildNavigationTree`)

- **Task:** Modify `buildNavigationTree` to recursively process `MergedForum` objects to include their subforums in the `NavNode` tree.
- **Detailed Change:**
  - Introduce an internal helper function, e.g., `processForumRecursive(forum: MergedForum, parentThemeDetails...): NavNode`.
  - This helper creates a `NavNode` for the input `forum`.
  - It checks if `forum.forums` (subforums array from `MergedForum` type) exists.
  - If subforums exist, it iterates and recursively calls `processForumRecursive` for each subforum, adding results to the parent `NavNode.children` array.
  - The main `buildNavigationTree` function calls this helper for top-level forums under Zones.
  - `NavNode.type` remains `'forum'` for both parent forums and subforums.
  - URL generation via `getForumEntityUrl` (from `utils/forum-routing-helper.ts`) should continue to return flat `/forums/[slug]`.

#### B. `client/src/features/forum/components/HierarchicalZoneNav.tsx`

- **Task:** Modify this component to render the three-level navigation tree (Zone -> Parent Forum -> SubForum).
- **Detailed Changes:**
  1.  **New Sub-Component (e.g., `ExpandableForumNavItem.tsx` within or imported by `HierarchicalZoneNav.tsx`):**
      - **Purpose:** Renders a "Parent Forum" item that can be expanded to show its "SubForums".
      - **Props:** `node: NavNode` (for the Parent Forum), `currentActiveSlug: string`, `depth: number`.
      - **Rendering:**
        - Displays Parent Forum details (name, link, icon, rolled-up stats).
        - If `node.children && node.children.length > 0` (SubForum NavNodes):
          - Renders an expand/collapse indicator.
          - When expanded, maps `node.children` (SubForums) and renders each using the existing `NavItem` component (as SubForums are leaf nodes in this 1-level subforum structure). Apply indentation.
      - Manages its own `isExpanded` state or takes it as a prop.
  2.  **Modify `GeneralCategorySection` (renders General Zones):**
      - It currently maps `categoryNode.children` (Parent Forums) to `NavItem`.
      - Change this to map `categoryNode.children` to the new `ExpandableForumNavItem`.
  3.  **Modify Primary Zone Rendering:**
      - Currently maps `primaryZoneNodes` directly to `NavItem`.
      - Consider refactoring to use a `PrimaryZoneSection` component, similar to `GeneralCategorySection`, which would then use `ExpandableForumNavItem` for its child Parent Forums. This promotes consistency.
  4.  **Active State Logic:** Update to correctly highlight the active path (Zone > Parent Forum > SubForum) based on the current flat URL slug.
  5.  **Expand/Collapse State (`expandedCategories`):** Adapt or extend to manage expansion state for Parent Forums if they become expandable to show SubForums.

#### C. Breadcrumbs (`client/src/components/forum/breadcrumb-nav.tsx` or equivalent)

- **Task:** Update components that display breadcrumbs (e.g., `client/src/pages/forums/[forum_slug].tsx`, `client/src/pages/threads/[thread_slug].tsx`, and potentially a dedicated breadcrumb building hook/service) to correctly build the `BreadcrumbItem[]` array reflecting the `Home > Zone Name > Parent Forum Name > SubForum Name > Thread Name` hierarchy.
- **Detailed Change:**
  - The presentational component `client/src/components/forum/breadcrumb-nav.tsx` itself likely needs no changes.
  - The logic for constructing the `items` prop for `BreadcrumbNav` needs to:
    - Identify the current entity (Zone, Parent Forum, SubForum, or Thread).
    - Use `ForumStructureContext` to trace back parentage:
      - A SubForum's parent is a Parent Forum.
      - A Parent Forum's parent is a Zone.
    - Construct `BreadcrumbItem` objects with correct labels and flat HREFs (`/`, `/zones/[zoneSlug]`, `/forums/[parentForumSlug]`, `/forums/[subForumSlug]`, `/threads/[threadSlug]`).
    - Consider adding a helper function to `ForumStructureContext` like `getForumPath(slug: string): BreadcrumbItem[]` to encapsulate this complex lookup logic, making it easier for page components to generate breadcrumbs.

---

## Phase 3: Supporting Components & Scripts Review

### 3.1. `client/src/components/forum/CanonicalZoneGrid.tsx`

- **Review:** Confirm that if `ZoneCardData`'s `threadCount` and `postCount` are meant to be aggregates including subforums, the data source (ultimately `forum.service.ts`) provides these rolled-up numbers. The component itself likely needs no change for subforum display.

### 3.2. `scripts/db/backfill-configZoneType.ts`

- **Review:** Confirmed no direct changes needed for subforum logic.

### 3.3. `client/src/pages/forums/search.tsx`

- **Consideration:**
  - Backend search (`forumService.searchThreads`) should be updated to correctly index and search threads within subforums.
  - Frontend search results should display the full contextual path (e.g., `Zone > Parent Forum > SubForum > Thread Title`) for clarity. This is a lower priority for the initial subforum rollout but important for UX.
  - URL for search results will remain flat.

---

## Phase 4: Admin Panel (Future Consideration)

- **Outline:**
  - CRUD operations for Zones, Parent Forums, and SubForums.
  - Ability to create a forum as a child of a Zone OR as a child of another Forum.
  - UI for re-parenting forums/subforums (drag-and-drop or selection).
  - Management of rules and themes at each level.

---

## Phase 5: Testing Strategy

- **Backend (`forum.service.ts`):**
  - Unit tests for `getForumStructure` with various nested configurations (no subforums, one level of subforums).
  - Verify correct `parentId` relationships and accurate aggregation of stats if implemented.
- **Frontend:**
  - Component tests for `ForumListItem` rendering parent forums with and without subforums.
  - Page tests for `forums/index.tsx` and `forums/[forum_slug].tsx` to ensure correct display of hierarchy.
  - Test navigation and breadcrumbs with subforums.
- **E2E Tests:**
  - User flow: Navigating from Zone -> Parent Forum -> SubForum -> Thread.
  - Creating a thread in a Parent Forum vs. a SubForum.

---

## Open Questions & Further Discussion Points:

1.  **Depth Limit:** **Decision: 1 level of subforums (Zone → Parent Forum → SubForum). Hard limit for now.** Comments to be added to `forumMap.config.ts` and schema definitions.
2.  **Stats Aggregation:** **Decision: Roll-up stats. Parent Forum's `threadCount` and `postCount` should include counts from their SubForums.** SubForums will display their own direct stats. Zone stats will also be aggregates. The service layer is responsible for these calculations.
3.  **URL Structure for SubForums:** **Decision: Flat URL structure: `/forums/[slug]` for all forums and subforums.** Globally unique slugs are required. Breadcrumbs will convey hierarchy.
4.  **"Category" Entity:** **Decision: Deprecate `type: 'category'`. All are `type: 'forum'`.** A forum that acts as a non-postable container will have `rules.allowPosting = false` (or a new, more specific `rules.allowUserPosts = false` if preferred for clarity). The database sync script and service logic must handle this (e.g., migrate existing 'category' types or treat them as forums with posting disabled).

This detailed plan, incorporating the above decisions, should serve as a good foundation for the `forum-sprint-subforums.md` document.

---

## Appendix A: Deprecation of `type: 'category'`

The decision to deprecate the `type: 'category'` entity has the following implications:

- **`client/src/config/forumMap.config.ts`**:
  - No longer define entities with `type: 'category'`.
  - "Parent Forums" (which are `type: 'forum'`) will serve the organizational role previously envisioned for categories. They can contain threads directly and/or subforums.
  - A forum intended as a non-postable container should be `type: 'forum'` with `rules.allowPosting = false` (or a more specific `rules.allowUserPosts = false` if that rule is introduced).
- **`scripts/seed/seedForumsFromConfig.ts` (and any other seeding/sync scripts):**
  - The script must no longer attempt to create or specifically handle `type: 'category'` entities.
  - All non-zone entities defined in `forumMap.config.ts` (parent forums, subforums) will be seeded into the `forum_categories` table with `type = 'forum'`.
  - If there's any logic to migrate existing `type: 'category'` entries in the database, it should convert them to `type: 'forum'` and potentially set `rules.allowPosting = false` in their `pluginData` or a dedicated column if schema changes.
- **`server/src/domains/forum/forum.service.ts`**:
  - Logic within `getForumStructure` and any helper functions should treat all non-zone entities from the `forum_categories` table as `type: 'forum'`.
  - Any specific code paths or type checks for `type: 'category'` should be removed or refactored. For example, the `categories` array in the old return type of `getForumStructure` is no longer relevant.
- **`client/src/contexts/ForumStructureContext.tsx`**:
  - The `MergedCategory` type and the `categories: Record<string, MergedCategory>` field in `ForumStructureContextType` will likely be removed or significantly refactored.
  - The `processApiData` function, which currently separates API data into zones, categories, and forums, will need to be updated. It will primarily deal with `zones` and a hierarchical structure of `forums` (where some forums are parents containing other forums).
  - Helper functions like `getCategory()` and parts of `getParentZone()` that rely on a distinct category type will need to be adapted or removed.
- **Frontend Components:**
  - Any component that specifically rendered or handled "Categories" as distinct from "Forums" will need to be updated to work with the concept of "Parent Forums."
  - The `type` property in `NavNode` (in `client/src/navigation/forumNav.ts`) might simplify; `generalCategory` might just become `zone` with `isPrimary: false`.

This deprecation simplifies the overall entity model, making "forum" the primary organizational unit under "zone".
