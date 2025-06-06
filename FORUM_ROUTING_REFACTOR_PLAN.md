# Degentalk Forum Routing & Structure Refactor Plan

_Last updated: 2025-05-23_

---

## 🚀 Cofounder Critique Integration (2025-05-23)

This plan now incorporates strategic, platform-level enhancements based on cofounder review:
- **Dynamic component mounting** per Primary Zone (config-driven)
- **Thread creation rules** and posting logic per zone/forum
- **Reserved slug/route enforcement** to prevent path/user conflicts
- **/forums index sorting, filtering, and display priority**
- **Role-based access control (RBAC)** per zone/forum
- **Zone metrics, SEO config, admin panel editing, and mobile UX**
- **Expanded registry and actionable checklist**

---

## 🧠 Objective

To consolidate, modernize, and future-proof the Degentalk forum system by splitting forums into **Primary Zones** (feature-rich, top-level) and **General Forums** (classic, grouped), with a unified, registry-driven routing and backend structure.

---

## 📦 Scope

- **Routing:** Refactor all forum-related routes to support Primary Zones at root level and General Forums under `/forum/[slug]`.
- **Backend Schema:** Add zone typing, parent/subforum support, and custom slugs.
- **Registry:** Implement a `primaryZones` registry for config-driven expansion.
- **Migration:** Move/merge legacy forums into new structure, clean up dead files.
- **Optimization:** Remove redundancy, support modular layouts, and enable automations for large-scale changes.
- **Platform Features:** Support dynamic features, RBAC, SEO, metrics, and mobile UX.

---

## 🗺️ Current & Target File/Route Structure

```bash
client/src/pages/
├── index.tsx                        # Homepage
├── forums/                          # Directory page (unified index)
│   └── index.tsx                    # `/forums`
├── forum/                           # General forums
│   └── [slug].tsx                   # `/forum/market-moves`, etc.
├── threads/
│   ├── [thread_slug].tsx            # Thread view
│   └── create.tsx                   # Thread creation
├── [zone_slug]/                     # Primary Zones (top-level)
│   └── index.tsx                    # `/mission-control`, `/the-pit`, etc.
```

---

## ⚔️ Zone Types

### 🔥 Primary Zones

- **Top-level, feature-rich ecosystems** (e.g., `/mission-control`, `/the-pit`, `/the-vault`, `/briefing-room`)
- May include embedded components, unique rules, curated access, and custom layouts.
- **Registry-driven** for easy expansion.
- **Dynamic component mounting** (see below)

### 📁 General Forums

- **Classic forum structure** under `/forum/[slug]`
- May have subforums via `parent_id`
- No special layout logic
- **Thread/posting rules and RBAC** (see below)

---

## 🛠️ Backend Schema Changes

- Add `forum_type: 'primary' | 'general' | 'merged' | 'deprecated'` to forum table (`db/schema/forum/categories.ts`, `shared/schema.ts`)
- Add optional `parent_id` for subforums
- Add optional `slug_override` for custom zone routes (e.g., `mission-control`)
- Add `threadRules`, `accessControl`, `displayPriority`, `seo`, and `components` fields to registry/schema
- Ensure all forum/category records are updated with correct type and slug

---

## 🗃️ Zone Registry Example (**Expanded**)

```ts
// client/src/constants/primaryZones.ts
export const primaryZones = {
  'mission-control': {
    id: 'uuid',
    slug: 'mission-control',
    components: ['BountyBoard', 'Shoutbox', 'XPTracker'],
    threadRules: {
      allowUserPosts: false,
      requireDGT: true,
      allowPolls: false,
      unlockedStyling: false,
    },
    accessControl: {
      canPost: ['admin'],
      canReply: ['mod', 'admin'],
      canView: ['all'],
    },
    displayPriority: 1,
    seo: {
      title: 'Mission Control - Degentalk',
      description: 'Official bounties, tasks, and admin challenges.',
    },
  },
  'the-pit': {
    id: 'uuid',
    slug: 'the-pit',
    components: ['Shoutbox'],
    threadRules: {
      allowUserPosts: true,
      requireDGT: false,
      allowPolls: true,
      unlockedStyling: true,
    },
    accessControl: {
      canPost: ['all'],
      canReply: ['all'],
      canView: ['all'],
    },
    displayPriority: 2,
    seo: {
      title: 'The Pit - Degentalk',
      description: 'Anything-goes discussion chaos.',
    },
  },
  // ...other zones
};
```

---

## 🧩 Dynamic Component Mounting (**New**)

- Each Primary Zone can specify a list of components to render via the `components` array in the registry.
- In `PrimaryZoneLayout`, dynamically render these components:

```tsx
// In PrimaryZoneLayout
{zoneConfig.components.map((Comp) => {
  const ZoneComponent = componentMap[Comp];
  return <ZoneComponent key={Comp} />;
})}
```
- `componentMap` is a mapping of string keys to imported React components.

---

## 📝 Thread Creation Rules (**New**)

- Each zone/forum can define `threadRules` to control posting logic:

```ts
threadRules: {
  allowUserPosts: boolean,
  requireDGT: boolean,
  allowPolls: boolean,
  unlockedStyling: boolean,
}
```
- Use these rules to show/hide post buttons, enforce paid-to-post, allow/disallow polls, etc.

---

## 🛡️ Reserved Slug/Route Enforcement (**New**)

- Maintain a `reservedRoutes.ts` array of all top-level slugs (Primary Zones, system pages, etc):

```ts
export const reservedRoutes = [
  'mission-control', 'the-pit', 'the-vault', 'briefing-room', 'forums', 'forum', 'threads', // etc
];
```
- Enforce slug uniqueness at creation time (admin UI and backend).
- Prevent user registration or forum creation with reserved slugs.

---

## 📊 /forums Index Sorting, Filtering, and Display Priority (**New**)

- Add `displayPriority` or `sortOrder` to registry/DB.
- `/forums/index.tsx` should sort by this, and optionally allow filtering by type (zone/forum), activity, or access.
- Example:

```ts
displayPriority: 1, // lower = higher on list
type: 'primary' | 'general',
```

---

## 🔐 Role-Based Access Control (RBAC) per Zone/Forum (**New**)

- Add an `accessControl` config to each zone/forum:

```ts
accessControl: {
  canPost: ['admin', 'mod'],
  canReply: ['all'],
  canView: ['all'],
}
```
- Use this to control UI (show/hide post/reply buttons) and backend permissions.

---

## 🏆 Platform-Grade Enhancements (**New**)

| System       | Enhancement Needed                        | Solution/Field Example                                 |
| ------------ | ---------------------------------------- | ------------------------------------------------------ |
| Zone Metrics | XP, DGT, thread count per zone           | `/api/zone/:slug/metrics` endpoint, metrics in registry|
| SEO          | Meta title/desc per zone                 | `seo: { title: string, description: string }` in registry|
| Admin Panel  | Zone/forum editor                        | Admin UI for editing type, features, access, SEO, etc. |
| Mobile UX    | Responsive `/forums` and zone layouts    | Sidebar collapse, tabbed subforum nav, mobile-first UI |

---

## 📊 Routing Rules

| URL                   | Type           | Layout/Component           | Source/Registry         |
|-----------------------|----------------|----------------------------|-------------------------|
| `/forums`             | Index          | ForumsIndexPage            | DB/zone registry        |
| `/forum/[slug]`       | General Forum  | GeneralZoneLayout          | forum_type: 'general'   |
| `/[zone_slug]`        | Primary Zone   | PrimaryZoneLayout          | forum_type: 'primary'   |
| `/threads/[slug]`     | Thread         | ThreadPage                 | Shared                  |
| `/threads/create`     | Thread Create  | ThreadCreatePage           | Context-aware           |

**Layout Switch Example:**
```tsx
if (forum_type === 'primary') return <PrimaryZoneLayout />;
else return <GeneralZoneLayout />;
```

---

## 🔀 Migration & Cleanup Plan

### 1. **Consolidate Routing**
- Remove `/forums/[slug].tsx`, `/forum/[id].tsx`, `/forum/[forum_slug].tsx` if redundant.
- All general forums: `/forum/[slug].tsx`
- All primary zones: `/[zone_slug]/index.tsx`
- `/forums/index.tsx`: master index, lists all zones and forums

### 2. **Migrate Forums to Zones**
| Old Forum Path         | New Route/Zone         | Type         | Rationale/Notes                        |
|----------------------- |----------------------- |------------- |---------------------------------------- |
| `/forum/forum-hq`      | `/briefing-room/*`     | Primary      | Platform meta, feedback, bugs           |
| `/forum/marketplace`   | `/the-vault/marketplace` | Primary   | Token-gated, value exchange             |
| `/forum/beginners-portal` | `/forum/getting-started` or `/web3-culture/onboarding` | General or Merge | Only keep if critical onboarding needed |
| `/forum/shill-and-promote` | `/forum/shill-and-promote` | General | Remains as engagement sink              |
| `/forum/airdrops-and-quests` | `/forum/airdrops-and-quests` | General | Remains as is                           |
| `/forum/web3-culture-and-news` | `/forum/web3-culture-and-news` | General | Remains as is                           |

### 3. **Registry & Schema**
- Update DB and registry to reflect new `forum_type` and slugs
- Add/adjust `slug_override` for custom routes

### 4. **Remove Dead Files**
- Delete/merge ambiguous `[slug].tsx`, `[id].tsx`, `[forum_slug].tsx` after migration
- Remove unused forum components/pages

---

## 🧹 Optimizations & Automations

- **Automated File Renaming/Moving:** Use scripts to move/rename files based on new registry and forum_type.
- **Schema Migration Scripts:** Write DB migration scripts to update forum_type, parent_id, and slugs in bulk.
- **Route Generation:** Auto-generate route configs/pages for new Primary Zones from the registry.
- **Component Refactoring:** Use codemods to update imports and layout logic for new zone types.
- **Pre-commit Hooks:** Enforce schema consistency and type safety (see `schema-consistency.mdc`).
- **Registry Sync Checks:** Automated tests to ensure DB and registry are in sync.
- **Slug Reservation Checks:** Automated validation for reserved slugs in user/forum/zone creation.
- **Admin UI Automation:** Tools for editing all registry fields and zone/forum configs.

---

## 🧭 Refined Forum Layout Map

| Type              | Route                        | Description                             |
| ----------------- | ---------------------------- | --------------------------------------- |
| **Primary Zone**  | `/briefing-room`             | All meta, suggestions, platform input   |
| **Primary Zone**  | `/the-vault`                 | Token-gated flex & marketplace features |
| **General Forum** | `/forum/shill-and-promote`   | Open self-promo                         |
| **General Forum** | `/forum/airdrops-and-quests` | External quests, claim links            |
| **Primary Zone**  | `/mission-control`           | Official site tasks, bounties, contests |
| **Primary Zone**  | `/the-pit`                   | User-generated chaos (no filters)       |
| ❓ TBD             | `/forum/getting-started`     | Optional low-level guide zone           |

---

## ✅ Actionable Checklist (**Expanded**)

**HIGH PRIORITY**
- [ ] Add `forum_type`, `parent_id`, `slug_override`, `components`, `threadRules`, `accessControl`, `displayPriority`, `seo` to forum schema (DB + shared/schema.ts)
- [ ] Create/Update `primaryZones` registry file with all new fields
- [ ] Implement dynamic component mounting in `PrimaryZoneLayout`
- [ ] Enforce reserved slugs in `reservedRoutes.ts` and backend
- [ ] Add `/api/zone/:slug/metrics` endpoint
- [ ] Remove/merge redundant `[slug].tsx`, `[id].tsx`, `[forum_slug].tsx` files
- [ ] Refactor `/forums/index.tsx` to be the unified index with sorting/filtering
- [ ] Route `/forum/forum-hq/*` to `/briefing-room/*`
- [ ] Route `/forum/marketplace` to `/the-vault/marketplace`
- [ ] Decide on fate of `/forum/beginners-portal`
- [ ] Update all forum/zone links in navigation, breadcrumbs, etc.

**MEDIUM PRIORITY**
- [ ] Refactor `CanonicalZoneGrid` and related components to support both Primary and General zones
- [ ] Ensure thread creation form is context-aware (zone/forum rules)
- [ ] Audit and clean up unused forum components/pages
- [ ] Extend `/forums/index.tsx` for sorting/filtering by type, priority, access
- [ ] Add admin UI for editing all zone/forum config fields (type, features, access, SEO)

**LOW PRIORITY**
- [ ] Add mobile UX enhancements (sidebar collapse, tabbed nav)
- [ ] Document new config-driven rendering and access patterns
- [ ] Add tests for new routing logic and config-driven features

---

## 🚦 Blockers & Risks

- **Ambiguous Routing:** Multiple `[slug].tsx`/`[id].tsx` files—must be resolved before refactor.
- **Schema Drift:** Ensure all forum/category records have correct `forum_type` and slugs.
- **Component Coupling:** Some components (e.g., `CanonicalZoneGrid`, `ZoneCard`) may assume flat structure—must support both types.
- **Registry Sync:** Zone registry and DB must stay in sync for correct routing.
- **Slug Collisions:** Reserved slugs must be enforced everywhere.
- **RBAC/Thread Rules Drift:** UI and backend must both respect config.

---

## 📝 References

- See `.cursor/rules/schema-consistency.mdc` for schema/type safety enforcement
- See `.cursor/rules/api-client-pattern.mdc` for API usage standardization
- See `OPTIMIZATION_SUMMARY.md` for previous forum system optimizations

---

## 🧩 Future-Proofing

- **Registry-driven expansion:** All new Primary Zones should be added to the registry and routed at the top level.
- **Unified index:** `/forums` should always reflect the current state of both Primary and General zones.
- **Migration logging:** Track all forum/zone migrations in a migration log or refactor-tracker for future reference.
- **Schema consistency:** Enforce with pre-commit/type checks.
- **Admin UI:** Empower non-devs to manage zones, features, and access.
- **Metrics & SEO:** Make every zone measurable and discoverable.

---

> _This document is a living reference. Update as migrations, refactors, and new features are implemented._ 