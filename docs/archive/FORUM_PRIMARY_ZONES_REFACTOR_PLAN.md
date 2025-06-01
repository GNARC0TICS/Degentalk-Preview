# ForumFusion: Primary Zones & Navigation Refactor Plan

## SCOPE
- **Backend:** `/structure` endpoint, forum structure API, thread/post/forum counts, error handling, API versioning, analytics endpoints
- **Frontend:**
  - Home page (`home.tsx`)
  - Forum page (`forum.tsx`)
  - Navigation (`HierarchicalZoneNav.tsx`)
  - Zone display (`CanonicalZoneGrid.tsx`, `ZoneCard.tsx`)
  - Thread display (`ThreadCard.tsx`)
  - Mobile/responsive layouts
  - Real-time updates (WebSocket or polling)
  - Code splitting and lazy loading for navigation/zone components
- **UI/UX:** Collapsible navigation, data display, theming, accessibility, mobile-first design, skeleton loaders, error boundaries
- **Docs:** `zone-card-design-guidelines.md`, `FORUM_README.md`, code comments, onboarding guides, API docs
- **Testing:** Manual and automated, cross-browser, mobile, accessibility, integration, and regression
- **Imports/Organization:** Canonical paths, barrel exports, archive old files, enforce import zoning, update directory-tree.md
- **Analytics:** Track navigation usage, zone/forum engagement, error rates
- **Developer Experience:** Onboarding, code comments, clear prop types, storybook/demo for components

---

## OBJECTIVE
- Cleanly separate and display **Primary Zones** and **Categories**
- Make navigation modular, collapsible, and data-rich
- Ensure all code, imports, and docs reflect the new architecture
- Build for maintainability, extensibility, and accessibility
- Optimize for performance, real-time data, and developer experience

---

## CHECKLIST & EXECUTION PLAN

### 1. Backend: API & Data Structure
- [ ] Ensure `/structure` endpoint returns:
  - [ ] `primaryZones`: Only top-level, canonical, single-forum zones (no children)
  - [ ] `categories`: Only expandable categories, each with their child forums
  - [ ] Each object includes: `id`, `name`, `slug`, `description`, `icon`, `colorTheme`, `threadCount`, `postCount`, `hasXpBoost`, `isEventActive`, etc.
- [ ] Thread/post/forum counts are accurate and up-to-date
- [ ] Add error handling and clear error messages for all endpoints
- [ ] Consider API versioning for future-proofing
- [ ] Add analytics endpoints for navigation/zone usage
- [ ] Document API response structure in `FORUM_README.md`

### 2. Frontend: Home & Forum Pages
- [x] Home page:
  - [x] Use `<CanonicalZoneGrid zones={primaryZones} />` for main grid
  - [x] Use `<HierarchicalZoneNav />` for navigation, passing both `primaryZones` and `categories`
  - [x] Add skeleton loaders and error boundaries
- [x] Forum page:
  - [x] Render both primary zones and categories, with distinct UI
  - [x] Use `<CanonicalZoneGrid />` for primary zones display
  - [x] Create custom category display with expandable forums
  - [x] Ensure mobile/responsive layout
- [x] Ensure all props are passed correctly and UI matches design
- [ ] Add code splitting/lazy loading for heavy components

### 3. Navigation: Collapsible & Data-Rich
- [x] Refactor `HierarchicalZoneNav`:
  - [x] Make both "Primary Zones" and "Categories" sections collapsible (persist state)
  - [x] Optionally, allow entire navigation to be collapsed/expanded
  - [x] For each category, display:
    - [x] # of forums (child forums count)
    - [x] # of threads (sum of threads in all child forums)
    - [x] # of posts (sum of posts in all child forums)
  - [x] For each primary zone, display:
    - [x] # of threads and # of posts
  - [x] Use accessible, keyboard-navigable toggles
  - [ ] Add analytics tracking for navigation usage
  - [ ] Add real-time updates for counts if possible

### 4. ZoneCard & CanonicalZoneGrid: Theming & Features
- [x] Ensure `ZoneCard` supports all props from `zone-card-design-guidelines.md`
- [x] `CanonicalZoneGrid` only receives and displays primary zones
- [x] Add proper type handling for ZoneCardData
- [ ] Add storybook/demo for ZoneCard and CanonicalZoneGrid

### 5. Imports & File Organization
- [x] Canonicalize all imports (prefer `features/forum/components/`)
- [ ] Remove/archive old/duplicate components in `components/forum/`
- [x] Update all imports in pages/features to new paths
- [ ] Add barrel exports (`index.ts`) where appropriate
- [ ] Enforce import zoning and update `directory-tree.md`

### 6. Documentation & Comments
- [ ] Update `zone-card-design-guidelines.md` if props/usage change
- [ ] Update `FORUM_README.md` (structure, navigation, component usage)
- [x] Add/Update JSDoc comments in all affected components/hooks
- [x] Add TODOs or `@syncSchema` comments for future schema changes
- [ ] Add onboarding guide for new contributors
- [ ] Document API error handling and analytics endpoints

### 7. Testing & Validation
- [ ] Manual QA:
  - [ ] Test home and forum pages in all browsers/screen sizes
  - [x] Test navigation collapse/expand and state persistence
  - [x] Test all counts (forums, threads, posts) for accuracy
  - [ ] Test mobile/responsive UX
- [ ] Automated:
  - [ ] Add/update unit tests for navigation/zone components
  - [ ] Add integration tests for navigation state/data display
  - [ ] Add regression tests for navigation/zone logic
  - [ ] Add accessibility (a11y) tests

### 8. Optional Enhancements
- [ ] Live data for active user/thread/post counts (WebSocket or polling)
- [x] Accessibility improvements (keyboard, ARIA, focus states, color contrast)
- [ ] Performance optimizations (lazy loading, memoization, code splitting)
- [ ] Add analytics for navigation/zone engagement
- [ ] Add developer onboarding docs and storybook demos
- [ ] Add dark/light theme support for navigation and zones

### 9. Migration/Refactor Steps
- [ ] Backend: Confirm `/structure` endpoint
- [x] Frontend: Refactor navigation, zone components, imports
- [ ] Docs: Update all documentation/comments
- [ ] Testing: Validate in browser and with tests
- [ ] Deploy & monitor
- [ ] Update onboarding docs and notify team

### 10. Communication
- [ ] Update changelog/release notes
- [ ] Notify team of new paths, usage, and features
- [ ] Announce new navigation/zone features to users (if public-facing)

---

## POST-COMPLETION REVIEW & FURTHER IMPROVEMENTS
- [ ] Review codebase for any remaining legacy imports or components
- [ ] Audit for DRYness, modularity, and logical flow
- [ ] Solicit user/team feedback on navigation and zone UX
- [ ] Identify further opportunities for modularization or performance
- [ ] Plan next steps (e.g., real-time updates, advanced analytics, more theming, onboarding improvements)
- [ ] Review analytics and error logs for issues or improvement areas

---

## MODULARITY & APP FLOW PRINCIPLES
- Build each component to be reusable and independently testable
- Keep data-fetching logic in hooks/services, not UI components
- Use clear, intent-based naming and prop interfaces
- Document all new/changed APIs and UI patterns
- Prefer composition over inheritance for UI
- Use code splitting and lazy loading for heavy/rarely-used components
- Write onboarding docs and storybook demos for new UI modules

---

**This file is your living checklist and reference for the primary zones & navigation refactor. Update as you go!** 