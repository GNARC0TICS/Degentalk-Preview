## User Flow Audit & Deeper File Analysis (2025-06-15)

This file consolidates audits E → O covering zone, forum, thread pages and interaction components.

### E. Zone Page (`pages/zones/[slug].tsx`)
- [ ] **Architectural confusion:**
    - [ ] Remove attempt to list threads via non-existent `/api/zones/:slug/threads`.
    - [ ] Refocus page on displaying child forums.

### F. ForumHeader Component
- [ ] Prop refactor to accept `MergedZone | MergedForum`.
- [ ] Replace dynamic Tailwind classes with a safe map or CSS variables for theming.

### G. Forum Page (`pages/forums/[slug].tsx`)
- [ ] Switch from direct API calls to using `useForumStructure()` (or its equivalent from `ForumStructureContext`).
- [ ] Fix breadcrumbs to accurately reflect forum hierarchy.
- [ ] Implement correct posting permissions checks.

### H. ThreadCard Consolidation Plan
- [ ] Ensure only a single canonical `ThreadCard` component is used.
- [ ] Delete any duplicate `ThreadCard` implementations.

### I. Thread Page (`pages/threads/[thread_slug].tsx`)
- [ ] Update to use the canonical `ThreadCard` (if applicable for summaries/related threads).
- [ ] Update to use the canonical, sanitised `PostCard`.
- [ ] Implement post edit functionality.
- [ ] Implement post delete functionality.
- [ ] Ensure signature sanitisation is in place.

### J. CreateThreadForm
- [ ] **Critical:** Modify to determine posting rules via `ForumStructureContext` (or equivalent) instead of static config.

### K. CreatePostForm
- [ ] Address redundancy versus `ReplyForm`.
- [ ] Implement missing rule checks (e.g., posting permissions, content validation).

### L. ReplyForm
- [ ] Ensure the parent component is responsible for permissions checks.
- [ ] Ensure the parent component handles submission logic.

### M. PostCard/PostReply Duplication
- [x] Consolidate into a single, sanitised `PostCard` component.
- [ ] Add `onReport` prop to `PostCard`.
- [ ] Add `onTip` prop to `PostCard`.

### N. LikeButton
- [ ] Make it a presentational component.
- [ ] Consider adding a `size` prop for flexibility.

### O. ReactionTray
- [ ] Memoize the component to prevent unnecessary re-renders.
- [ ] Confirm and adhere to the single-reaction design (if that's the intended UX).
