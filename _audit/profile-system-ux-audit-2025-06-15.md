# Profile System UX/UI Audit — Degentalk

_Date: 2025-06-15_

---

## Scope

This audit covers:

1. Viewing **own profile** (`/profile/{username}` when `username === currentUser.username`).
2. Viewing **other users' profiles** (public mode).
3. **Profile Preferences & Customisation** flows (including cosmetics & editor modal).
4. Related profile-adjacent pages: **wallet, badges, shop, stats, settings/preferences**.
5. **Navigation** between these areas on both **desktop and mobile**.

> Code references are drawn from current workspace snapshot (June 2025).

---

## High-Priority Findings (P1 – Blockers / Critical UX Gaps)

1.  **Own vs Public Profile**

    - **Problem / Gap:** Two parallel page implementations: `client/src/pages/profile-page.tsx` (old) **and** `client/src/pages/profile/[username].tsx` (new). They diverge in layout, data sources (mock vs API), and route handling (`useParams` vs hard-coded).
    - **Evidence:** Duplicate files listed; only dynamic page is routed by wouter/Next.
    - **Impact:** Code bloat, inconsistent experience, maintenance risk; mobile nav may hit wrong page.
    - **Recommendation:**
      - [ ] **Deprecate** `profile-page.tsx`.
      - [ ] Make `[username].tsx` the single canonical profile page.
      - [ ] Audit all links (`<Link href="/profile">`) and reroute through `/profile/${currentUser.username}`.

2.  **Data Freshness**

    - **Problem / Gap:** Current profile queries (`/api/profile/:username`) omit reactive invalidation when preferences/cosmetics change; relies on manual `queryClient.invalidateQueries`.
    - **Evidence:** See `ProfileEditor.tsx` onSuccess invalidating `['profile', username]` only.
    - **Impact:** Stale data after avatar/banner/title change unless full reload.
    - **Recommendation:**
      - [ ] Publish **profile mutation event** over WebSocket.
      - [ ] Use `queryClient.setQueryData` optimistically on profile mutations.

3.  **Media Upload**

    - **Problem / Gap:** Avatar/Banner upload buttons are **disabled placeholders** (`disabled` attr) in `ProfileEditor.tsx`; no backend route or upload lib wired.
    - **Evidence:** Lines 155-188 in `ProfileEditor`.
    - **Impact:** Core user expectation broken; first-time users cannot personalise profile.
    - **Recommendation:**
      - [ ] Implement S3/Supabase upload flow:
        - [ ] Implement `<FileDropZone>` component.
        - [ ] Implement presigned PUT request logic.
        - [ ] Update `avatarUrl` & `bannerUrl` fields in DB upon successful upload.
        - [ ] Show progress bar during upload.

4.  **Mobile Tab Overflow**

    - **Problem / Gap:** On devices < 360 px wide, 5-tab `TabsList` overflows container; triggers horizontal scroll with no cue.
    - **Evidence:** Manual test, CSS grid of 5 cols.
    - **Impact:** Hidden content → poor discoverability.
    - **Recommendation:**
      - [ ] Switch to **scrollable TabBar** (`overflow-x-auto flex-nowrap`).
      - [ ] Use icon-only buttons under 400 px width.

5.  **Stats Accuracy**
    - **Problem / Gap:** `totalPosts`, `totalThreads`, `totalLikes` placeholders default to `0` when API fails; no error state surfaced.
    - **Evidence:** `ProfileSidebar` lines 158-185.
    - **Impact:** Users see «0 posts» despite activity → trust erosion.
    - **Recommendation:**
      - [ ] Show **skeleton** loaders for stats.
      - [ ] Display `ErrorDisplay` component if fetch fails.
      - [ ] Do not render `0` unless confirmed by API.

---

## Medium-Priority Findings (P2 – UX / Maintainability)

1.  **Navigation Inconsistency**

    - **Problem / Gap:** Profile header lacks quick-links to Wallet, Shop, Badges, Settings. Users must use Site Header drop-downs → extra friction.
    - **Upgrade:**
      - [ ] Add secondary **profile sub-nav** beneath avatar (pill buttons: Overview · Achievements · Wallet · Shop · Settings).
      - [ ] Use router nested routes to lazy-load sub-nav content.

2.  **Cosmetic Control Panel Duplication**

    - **Problem / Gap:** `CosmeticControlPanel` lives only in _own_ profile tab «Cosmetics». Preferences page also exposes avatar/banner text fields.
    - **Recommendation:**
      - [ ] Merge into single **Profile Customise** modal.
      - [ ] Route to this modal from both profile cosmetics tab and preferences page.
      - [ ] DRY up mutations for cosmetic changes.

3.  **Information Density / Dead Space**

    - **Problem / Gap:** Large banner zone (`background-image` + gradient) consumes 45 vh on desktop; actual content starts far below fold. Left sidebar card has ~100 px padding top/bottom; wasted vertical space on mobile.
    - **Fix:**
      - [ ] Compress banner to 30 vh max or make it user-controlled.
      - [ ] Reduce card internal padding on `sm` breakpoints.

4.  **Stats Cards Re-flow**

    - **Problem / Gap:** `StatCard` grid fixed 2/4 cols; on tablet (∼680 px) cards wrap oddly.
    - **Solution:**
      - [ ] Use **CSS Grid auto-fit** (`grid-template-columns: repeat(auto-fit,minmax(140px,1fr))`) for `StatCard` grid.

5.  **Accessibility (A11y)**
    - **Problem / Gap:** Icon-only buttons (Follow, Whisper) lack `aria-label`. Colour-only rarity badges fail WCAG contrast (e.g., amber 400 on amber 900).
    - **Action:**
      - [ ] Add `aria-label` to all icon-only buttons.
      - [ ] Ensure contrast ≥ 4.5:1 for rarity badges, or add text equivalents.

---

## Low-Priority Findings (P3 – Polish / Future Enhancements)

1.  - [ ] **XP Heatmap / Contribution Graph**: Gamified visual (similar to GitHub heatmap) of daily XP gains.
2.  - [ ] **Most Tipped Posts Showcase**: Carousel of top 3 tipped posts on profile.
3.  - [ ] **Reputation Spider Web**: Radar chart mapping clout, likes, tips, thread views.
4.  - [ ] **Sticky Actions**: Floating «Tip» & «Follow» buttons that persist while scrolling long profiles.
5.  - [ ] **Profile Themes**: Allow users to select colour palette that skins cards/background overlay (stored in `ui_themes`).

---

## Component-Level Issues & Cleanup

| Component         | Issue                                                        | Suggested Refactor                                                                        |
| ----------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `ProfileContext`  | Not used by `[username].tsx`; params hard-coded → dead code. | - [ ] Remove or integrate context to expose `isOwnProfile`, `viewMode`, `toggleEditMode`. |
| `UserAvatar`      | `defaultAvatarPath` string duplicated elsewhere.             | - [ ] Centralise constant in `@/constants/media.ts`.                                      |
| `Username`        | Complex colour logic & badges; duplicates rarity enum.       | - [ ] Extract `rarityColor(rarity)` util used by Avatar frame, Title badge.               |
| `ProfileSkeleton` | Fixed skeleton heights; mismatch with real content heights.  | - [ ] Use `aspect-[2/1]` utilities or similar to adapt skeleton to dynamic card heights.  |

---

## Proposed Layout Redesign (Wireframe-level)

```
┌──────────────────────────────────────────────────────┐
│                  User Banner (30vh)                 │
│  Avatar ∅ Title ∅ Username ∅ Follow/Tip buttons     │
└──────────────────────────────────────────────────────┘

┌──────────────┬──────────────────────────────────────┐
│ Sidebar (md) │ Main Tabs                            │
│ (stats,      │ ┌───────┬───────┬───────┬───────┬───┐│
│ socials, XP) │ │Overvw │Posts  │Badges │Wallet │… ││
│              │ └───────┴───────┴───────┴───────┴───┘│
│              │ Tab content (virtualised lists, etc.)│
└──────────────┴──────────────────────────────────────┘
```

- [ ] On **mobile**, sidebar collapses below banner, tabs become scrollable **chip bar**.
- [ ] Floating **ActionBar** bottom-right (Follow, Whisper, Tip, Share) on mobile.

---

## Next Steps / Implementation Order

1.  - [ ] **Consolidate Profile Pages** (High, 1-2 dev-days).
2.  - [ ] **Media Upload MVP** (High, 2-3 dev-days incl. backend).
3.  - [ ] **Responsive Tab/Nav Refactor** (Medium, 1 dev-day).
4.  - [ ] **Profile Event Bus & Query Sync** (Medium, 1 dev-day).
5.  - [ ] **Visual Polish & Dead Space Reduction** (Medium, 1 dev-day).
6.  - [ ] Low-priority enhancements scheduled post-audit sprint.

---

### Must-Have Enhancements (Scoped Addendum — 2025-06-15)

> The following four features were surfaced after the main audit. Each is now fully scoped with implementation details, database impacts, API extensions, and component stacks. These should be considered **Phase-1.5** work items (to be slotted immediately after "Next Steps #3").

#### 6. Flex Bar (Top-of-Profile Showcase)

- [ ] **Problem:** No immediate visual representation of user status or identity dominance.
- [ ] **Solution:** Insert `FlexBar` component between banner and tab nav. Combines avatar frame, equipped title, custom status line, and optional pinned post preview.
- [ ] **DB Changes:**
  - [ ] `ALTER TABLE users ADD COLUMN status_line TEXT;` _(nullable)_.
  - [ ] (No migration needed for pinned post - use existing `users.pinned_post_id` or add similar nullable FK if decided).
- [ ] **API Changes:**
  - [ ] Extend `GET /api/profile/:username` to accept `?include=inventory,activity`.
  - [ ] Return `statusLine`, `pinnedPost` (summary), `equippedTitle`, `activeFrame`, `activeBadge`.
- [ ] **Components:** `client/src/components/profile/FlexBar.tsx`
  - [ ] Implement `UserAvatarWithFrame` (reuse `Avatar`/`FramedAvatar`).
  - [ ] Implement `Username` w/ rarity + title.
  - [ ] Implement `StatusLine` (inline edit if `isOwnProfile`).
  - [ ] Implement `PinnedPostPreview` (reuse `PostCard` condensed).
- [ ] **UX Notes:** Desktop: 4-column grid; Mobile: stacked flex with wrap. Fade-in cosmetics (`animate-fadeInFast`).
- [ ] **Backend Hooks:** Update `profile.service.ts` to save `status_line` via `/api/profile/update`.

#### 7. Recent Activity Tab

- [ ] **Problem:** Users cannot view a timeline of activity for a profile.
- [ ] **Solution:** New `RecentActivityTab` that streams items from `event_logs`. Infinite scroll with TanStack `useInfiniteQuery`.
- [ ] **API:**
  - [ ] Create `GET /api/profile/:username/activity?page=1&type=thread_created,post_created,…` returns paginated `EventLogDTO`.
  - [ ] Controller re-uses `eventLogService.getUserEventLogs()`.
- [ ] **DB/Service:**
  - [ ] Already covered by `event_logs` & service.
  - [ ] Ensure compound index `event_logs(user_id, created_at DESC)` exists.
- [ ] **Components:**
  - [ ] Create `components/profile/RecentActivityTab.tsx`.
  - [ ] Create/use `<ActivityItem icon label timestamp link/>`.
  - [ ] Create/use `event_labels.ts` to map event types → icon/colour.
- [ ] **Mobile:** Tab sits inside existing Tabs list; consider dynamic badge count for unread events.

#### 8. Persistent Profile Sub-Navigation

- [ ] **Problem:** Navigating to Wallet / Shop / Stats leaves profile context.
- [ ] **Solution:** `ProfileNavBar.tsx` sticky under FlexBar; pills link to nested sub-routes.
- [ ] **Routing:**
  - [ ] Create directory `pages/profile/[username]/(sub)/` with `overview.tsx`, `posts.tsx`, etc.
  - [ ] Use Wouter nested router or upgrade to React Router if needed.
- [ ] **Implementation:**
  - [ ] Wrap `[username].tsx` in `<Suspense>` for lazy loading sub-routes.
  - [ ] Keep SEO title updates via `react-helmet-async`.
- [ ] **CSS:** Tailwind **sticky top-[calc(bannerHeight+flexbarHeight)]**; backdrop-blur + gradient border on scroll.

#### 9. Quick Loadout Bar (Own Profile Only)

- [ ] **Problem:** Users must open full cosmetic panel for simple swaps.
- [ ] **Solution:** Floating `QuickLoadoutBar.tsx` bottom-right on own profile. Shows equipped frame,title,badge with dropdowns.
- [ ] **Hooks/State:**
  - [ ] Reuse `useUserCosmetics()`.
  - [ ] Use local `useState` for open dropdown.
  - [ ] Mutate via existing equip endpoints.
- [ ] **CTA Logic:** If slot empty, show «Shop» button linking to `/shop?filter=frames`.
- [ ] **Accessibility:** On mobile, converts to bottom sheet (`Dialog`) to avoid finger reach issues.

#### 10. X Account Linking and Content Sharing

- [ ] **Problem:** Users cannot link Degentalk profiles to X accounts or share content, missing viral growth.
- [ ] **Solution:** Implement X OAuth 2.0, UI for sharing, and economy integration.
- [ ] **DB Changes:**
  - [ ] Extend `users` table: `xAccountId VARCHAR(255)`, `xAccessToken VARCHAR(512)`, `xRefreshToken VARCHAR(512)`, `xTokenExpiresAt TIMESTAMP`, `xLinkedAt TIMESTAMP`.
  - [ ] Create new `xShares` table.
- [ ] **API Changes:**
  - [ ] Add `GET /api/auth/x/login`, `GET /api/auth/x/callback`.
  - [ ] Add `POST /api/profile/x/unlink`.
  - [ ] Add `POST /api/share/x/post`, `POST /api/share/x/referral`.
- [ ] **Components:**
  - [ ] `client/src/features/auth/components/XLoginButton.tsx`.
  - [ ] `client/src/features/profile/components/XLinkButton.tsx`.
  - [ ] `client/src/features/forum/components/XShareButton.tsx`.
  - [ ] `client/src/features/referral/components/XReferralShare.tsx`.
- [ ] **UX Notes:** Display X handle/badge. Mobile-friendly OAuth. Incentivize sharing.
- [ ] **Backend Hooks:** Update `profile.service.ts`, create `xAuthService.ts`, `xShareService.ts`. Integrate with `rewardService.ts`.
- [ ] **Scalability:** Job queue for X API. Token refresh. DB indexing. Caching.

#### Database Schema Updates (Applied 2025-06-15)

> **Status:** ✅ _Completed & migrated locally_. These columns/tables now exist in the source schema and the corresponding SQL migration files (`0008_add_users_profile_fields.sql`, `0009_create_xp_logs_table.sql`) are ready to be applied in staging/production.

| Affected Table | Change                                                               | Details                                                                                                                                                                                                                                                                                  |
| -------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users`        | **`status_line TEXT NULL`**                                          | Stores the custom status string surfaced in **Flex Bar**. Accessible via `profileService.getUserProfile()` under `statusLine`.                                                                                                                                                           |
|                | **`pinned_post_id INTEGER`** _(FK → `posts.id`, ON DELETE SET NULL)_ | Supports **PinnedPostPreview** in Flex Bar. API should join `posts` on demand to fetch summary.                                                                                                                                                                                          |
| `xp_logs`      | **NEW TABLE**                                                        | Tracks per-user daily XP accrual.<br/>Columns: `id SERIAL PK`, `user_id INTEGER NOT NULL` (FK `users.id` ON DELETE CASCADE), `date DATE NOT NULL`, `xp_gained INTEGER DEFAULT 0`, `created_at TIMESTAMPTZ DEFAULT now()`. Unique constraint `(user_id, date)` + index `(user_id, date)`. |

**Schema Export:** `xpLogs` added to `db/schema/index.ts`; all services can now import via `@schema`.

**Type Generation:** - [ ] Re-run Drizzle codegen (`pnpm drizzle-kit generate`) to emit updated TS types for `users` & `xpLogs`.

**Immediate Integration Tasks**

1.  - [ ] **Profile API Update** — include `statusLine` & `pinnedPost` in `/api/profile/:username` response. _(Flex Bar task)_
2.  - [ ] **Event Bus** — when XP is awarded (`handleXpAward`) also `INSERT`/`UPERT` into `xpLogs` for that `user_id` & `date`.
3.  - [ ] **XP Heatmap Feature** — query `xpLogs` roll-ups instead of recalculating from `event_logs`.
4.  - [ ] **Pinned Post CRUD** — allow users to set/unset `pinned_post_id` via `PATCH /api/profile/pin-post` (body: `postId|null`).

---

### Road-Map Adjustments

1.  - [ ] **Insert** FlexBar + Sub-Nav tasks into _Next Steps_ as **Step 3A & 3B** before responsive polish.
2.  - [ ] **Recent Activity Tab** becomes **Step 4** (after Event Bus sync).
3.  - [ ] **Quick Loadout Bar** slots into **Step 5** alongside visual polish.
4.  - [ ] **X Account Linking** slots into **Step 3C** after "Persistent Profile Sub-Navigation".

---

### Future Bonus Features (Post-MVP)

| #   | Feature                    | Notes                                                                                                                                                                                        |
| --- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 10  | **Profile XP Heatmap**     | - [ ] Requires daily roll-up job writing to `xp_logs (user_id, date, xp)`. <br> - [ ] UI via `<XPHeatmap />` (CSS grid).                                                                     |
| 11  | **Degen Résumé Generator** | - [ ] SSR route `/profile/:username/resume` pipes React PDF (`@react-pdf/renderer`) or Puppeteer to generate PDF. <br> - [ ] Caches output in S3 with `Cache-Control: public,max-age=86400`. |

---

_End of Report_
