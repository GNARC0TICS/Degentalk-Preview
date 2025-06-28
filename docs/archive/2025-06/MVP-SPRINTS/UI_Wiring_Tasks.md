## ✅ Completed Wiring Tasks

### Global UI Fixes
- ✅ `Card` component confirmed exported correctly — no changes needed.
- ✅ Added `TooltipProvider` to `client/src/pages/_app.tsx` for global tooltip support.
- ✅ Fixed "Sign In" toast link in `bookmark-button.tsx` from `/login` to `/auth`.
- ✅ Fixed both desktop and mobile "Log In" buttons in `site-header.tsx` to point to `/auth`.
- ✅ Resolved TypeScript error by changing `logoutMutation.mutate()` to `logoutMutation.mutate(undefined)` in `site-header.tsx`.

### Admin Page Routing
- ✅ Routed `client/src/pages/admin/edit-user.tsx` → `/admin/users/:id` in `App.tsx`.
- ✅ Routed XP Management Pages:
  - `/admin/xp/adjust` → `adjust.tsx`
  - `/admin/xp/badges` → `badges.tsx`
  - `/admin/xp/levels` → `levels.tsx`
  - `/admin/xp/settings` → `settings.tsx`
  - `/admin/xp/titles` → `titles.tsx`
- ✅ Updated links in `admin-layout.tsx` for XP sections, including new "Titles" link.
- ✅ Fixed missing icon error by importing `BadgeIcon` from `lucide-react`.

### Cleanup
- ✅ Deleted unused duplicate file `client/src/pages/threads/[id].tsx` after confirming `/threads/:id` is handled by `[thread_slug].tsx`.

---

## 🔧 Remaining UI Wiring Tasks

## Task 7: Implement Functional `useToast` Hook

*   **Audit Report Reference**: Section 2.1 (Component Audit - `useToast`), Section 3 (Features to Wire Up - Toast Notifications)
*   **Problem**: `client/src/hooks/use-toast.ts` is a mock implementation that only logs to console. Visual toast components (`client/src/components/ui/toast.tsx` using Radix UI) and the `Toaster` component (`client/src/components/ui/toaster.tsx` which includes `ToastProvider` and `ToastViewport`) are in place but ineffective due to the mock hook.
*   **Solution**:
    1.  Rewrite `client/src/hooks/use-toast.ts` to:
        *   Manage an internal state (e.g., `React.useState([])`) for an array of toast objects. Each object should contain properties like `id`, `title`, `description`, `variant`, `action`, `open`, etc.
        *   Provide a `toast` function that:
            *   Accepts toast properties (title, description, variant, etc.).
            *   Generates a unique `id` for the new toast.
            *   Adds the new toast object to the state array.
            *   Optionally, sets a timeout to remove the toast from the array after a certain duration (e.g., 5 seconds), effectively closing it.
        *   Return the `toasts` array and the `toast` function.
    2.  The `Toaster` component in `client/src/components/ui/toaster.tsx` already consumes `useToast().toasts` and renders them. This part should work once `useToast` provides actual toast data.
    3.  Ensure toast variants (`default`, `destructive`, `success`, etc.) defined in `client/src/components/ui/toast.tsx` can be triggered via the `useToast` hook and are styled correctly.
*   **Files to Modify**:
    *   `client/src/hooks/use-toast.ts`
*   **Effort Estimate**: Medium to High (requires careful state management and understanding of the Radix UI toast component API if more advanced features like actions are needed).

## Task 9: Address Other Unrouted Admin Pages

*   **Audit Report Reference**: Sections 1.2, 1.4, 3.2, 4.1
*   **Problem**: Various other admin pages are unrouted:
    *   `client/src/pages/admin/badges.tsx` (top-level, distinct from `xp/badges.tsx` - needs clarification if it's a duplicate or different feature)
    *   `client/src/pages/admin/tags.tsx`
    *   `client/src/pages/admin/airdrop.tsx`
    *   `client/src/pages/admin/announcements/create.tsx`
    *   `client/src/pages/admin/announcements/edit.tsx`
    *   `client/src/pages/admin/features/index.tsx`
    *   `client/src/pages/admin/missions/index.tsx`
*   **Solution**:
    1.  For each page:
        *   Clarify its purpose and if it's still relevant.
        *   If relevant, determine the route path.
        *   Import the page component in `client/src/App.tsx`.
        *   Add a new `<Route>` definition.
        *   Add a corresponding link in `client/src/pages/admin/admin-layout.tsx`.
    2.  For `admin/badges.tsx` (top-level): Investigate if it's a duplicate of `xp/badges.tsx` or serves a different purpose. If duplicate, remove. Otherwise, route.
*   **Files to Modify**:
    *   `client/src/App.tsx`
    *   `client/src/pages/admin/admin-layout.tsx`
    *   Potentially delete `client/src/pages/admin/badges.tsx` if duplicate.
*   **Effort Estimate**: Medium to High (requires clarification for some pages before routing)

## Task 10: Address Unrouted General Pages

*   **Audit Report Reference**: Sections 1.1, 1.4, 4.1
*   **Problem**: Numerous general (non-admin) pages are unrouted.
    *   `auth-page.tsx`
    *   `forum-rules.tsx`
    *   `profile-page.tsx` (Potentially superseded by `profile/[username].tsx`)
    *   `thread-page.tsx` (This was Task 6, likely superseded)
    *   `zones/index.tsx`
    *   `categories/[slug].tsx`
    *   `forum/[slug].tsx` (Potentially superseded by `forums/[forum_slug].tsx`)
    *   `missions/index.tsx`
    *   `profile/xp-demo.tsx`
    *   `profile/xp.tsx`
    *   `tags/[tagSlug].tsx`
    *   `topics/[topic_slug].tsx`
*   **Solution**:
    1.  Systematically review each unrouted page.
    2.  Decide if it's:
        *   **Needed**: Add a route in `client/src/App.tsx` and ensure it's linked from relevant navigation or pages.
        *   **Obsolete/Superseded**: Delete the file.
        *   **Work-in-Progress**: Keep, but track for future routing.
*   **Files to Modify**:
    *   `client/src/App.tsx`
    *   Potentially delete obsolete page files.
*   **Effort Estimate**: High (requires careful review and decision for each page)

## Task 11: Fix Moderator Sidebar Dead Links

*   **Audit Report Reference**: Section 3.3 (Mod Features/Panels), Section 2.3 (`client/src/components/mod/mod-sidebar.tsx`)
*   **Problem**: `client/src/components/mod/mod-sidebar.tsx` contains hardcoded links to several pages that are neither routed nor have existing page files (e.g., `/mod/activity`, `/mod/threads`, `/mod/reports`).
*   **Solution**:
    1.  For each dead link in `client/src/components/mod/mod-sidebar.tsx`:
        *   Decide if the feature is intended.
        *   If yes: Create the page component under `client/src/pages/mod/`, import it in `client/src/App.tsx`, and add a route definition (wrapped in `ModLayout` and `RequireMod`).
        *   If no: Remove the link from the `Accordion` in `mod-sidebar.tsx`.
*   **Files to Modify**:
    *   `client/src/components/mod/mod-sidebar.tsx`
    *   `client/src/App.tsx` (if adding routes)
    *   Potentially create new page files under `client/src/pages/mod/`.
*   **Effort Estimate**: Medium to High (depends on how many mod pages need to be created vs. links removed)

## Task 12: Ensure `candlestick-menu.tsx` CSS is Loaded

*   **Audit Report Reference**: Section 2.1 (`client/src/components/ui/candlestick-menu.tsx`)
*   **Problem**: The `ChartMenu` component relies entirely on external CSS classes for its animations and visual transformations. Without these styles, it's visually broken.
*   **Solution**:
    1.  Investigate where the CSS for `chart-menu`, `is-active`, `pattern-*`, `line`, `wick`, etc., is defined or supposed to be defined (likely `client/src/styles/globals.css` or a dedicated component CSS file).
    2.  Ensure these styles are present and correctly imported/applied globally or scoped to the component.
    3.  If the styles are missing, they need to be recreated based on the "gist-clone version" mentioned in the component's comments or a new design.
*   **Files to Modify**:
    *   Potentially `client/src/styles/globals.css` or another CSS file.
    *   Possibly `client/src/components/ui/candlestick-menu.tsx` if CSS modules or a direct import is preferred.
*   **Effort Estimate**: Medium (if styles need to be found/debugged) to High (if styles need to be recreated).

- [ ] Batch validation of all admin routes (headless test).
