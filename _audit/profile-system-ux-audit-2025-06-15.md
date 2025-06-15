# Profile System UX/UI Audit — DegenTalk  
*Date: 2025-06-15*

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

| # | Area | Problem / Gap | Evidence | Impact | Recommendation |
|---|------|---------------|----------|--------|----------------|
| 1 | Own vs Public Profile | Two parallel page implementations: `client/src/pages/profile-page.tsx` (old) **and** `client/src/pages/profile/[username].tsx` (new). They diverge in layout, data sources (mock vs API), and route handling (`useParams` vs hard-coded). | Duplicate files listed; only dynamic page is routed by wouter/Next. | Code bloat, inconsistent experience, maintenance risk; mobile nav may hit wrong page. | **Deprecate** `profile-page.tsx`. Make `[username].tsx` the single canonical profile page. Audit all links (`<Link href="/profile">`) and reroute through `/profile/${currentUser.username}`. |
| 2 | Data Freshness | Current profile queries (`/api/profile/:username`) omit reactive invalidation when preferences/cosmetics change; relies on manual `queryClient.invalidateQueries`. | See `ProfileEditor.tsx` onSuccess invalidating `['profile', username]` only. | Stale data after avatar/banner/title change unless full reload. | Publish **profile mutation event** over WebSocket and use `queryClient.setQueryData` optimistically. |
| 3 | Media Upload | Avatar/Banner upload buttons are **disabled placeholders** (`disabled` attr) in `ProfileEditor.tsx`; no backend route or upload lib wired. | Lines 155-188 in `ProfileEditor`. | Core user expectation broken; first-time users cannot personalise profile. | Implement S3/Supabase upload flow: `<FileDropZone>` → presigned PUT → update `avatarUrl` & `bannerUrl` fields; show progress bar. |
| 4 | Mobile Tab Overflow | On devices < 360 px wide, 5-tab `TabsList` overflows container; triggers horizontal scroll with no cue. | Manual test, CSS grid of 5 cols. | Hidden content → poor discoverability. | Switch to **scrollable TabBar** (`overflow-x-auto flex-nowrap`) with icon-only buttons under 400 px.
| 5 | Stats Accuracy | `totalPosts`, `totalThreads`, `totalLikes` placeholders default to `0` when API fails; no error state surfaced. | `ProfileSidebar` lines 158-185. | Users see «0 posts» despite activity → trust erosion. | Show **skeleton** + `ErrorDisplay` if fetch fails; do not render `0` unless confirmed. |

---

## Medium-Priority Findings (P2 – UX / Maintainability)

1. **Navigation Inconsistency**  
   • Profile header lacks quick-links to Wallet, Shop, Badges, Settings.  
   • Users must use Site Header drop-downs → extra friction.  
   **Upgrade:** Add secondary **profile sub-nav** beneath avatar (pill buttons: Overview · Achievements · Wallet · Shop · Settings). Use router nested routes to lazy-load.

2. **Cosmetic Control Panel Duplication**  
   `CosmeticControlPanel` lives only in *own* profile tab «Cosmetics». Preferences page also exposes avatar/banner text fields.  
   **Recommendation:** Merge into single **Profile Customise** modal; route from both pages, DRY up mutations.

3. **Information Density / Dead Space**  
   • Large banner zone (`background-image` + gradient) consumes 45 vh on desktop; actual content starts far below fold.  
   • Left sidebar card has ~100 px padding top/bottom; wasted vertical space on mobile.  
   **Fix:** Compress banner to 30 vh max or make it user-controlled. Reduce card internal padding on `sm` breakpoints.

4. **Stats Cards Re-flow**  
   `StatCard` grid fixed 2/4 cols; on tablet (∼680 px) cards wrap oddly.  
   **Solution:** Use **CSS Grid auto-fit** (`grid-template-columns: repeat(auto-fit,minmax(140px,1fr))`).

5. **Accessibility (A11y)**  
   • Icon-only buttons (Follow, Whisper) lack `aria-label`.  
   • Colour-only rarity badges fail WCAG contrast (e.g., amber 400 on amber 900).  
   **Action:** Add aria labels, ensure contrast ≥ 4.5:1, or add text.

---

## Low-Priority Findings (P3 – Polish / Future Enhancements)

1. **XP Heatmap / Contribution Graph**  
   Gamified visual (similar to GitHub heatmap) of daily XP gains.
2. **Most Tipped Posts Showcase**  
   Carousel of top 3 tipped posts on profile.
3. **Reputation Spider Web**  
   Radar chart mapping clout, likes, tips, thread views.
4. **Sticky Actions**  
   Floating «Tip» & «Follow» buttons that persist while scrolling long profiles.
5. **Profile Themes**  
   Allow users to select colour palette that skins cards/background overlay (stored in `ui_themes`).

---

## Component-Level Issues & Cleanup

| Component | Issue | Suggested Refactor |
|-----------|-------|--------------------|
| `ProfileContext` | Not used by `[username].tsx`; params hard-coded → dead code. | Remove or integrate context to expose `isOwnProfile`, `viewMode`, `toggleEditMode`. |
| `UserAvatar` | `defaultAvatarPath` string duplicated elsewhere. | Centralise constant in `@/constants/media.ts`. |
| `Username` | Complex colour logic & badges; duplicates rarity enum. | Extract `rarityColor(rarity)` util used by Avatar frame, Title badge.
| `ProfileSkeleton` | Fixed skeleton heights; mismatch with real content heights. | Use `aspect-[2/1]` utilities to adapt to dynamic card heights.

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

* On **mobile**, sidebar collapses below banner, tabs become scrollable **chip bar**.
* Floating **ActionBar** bottom-right (Follow, Whisper, Tip, Share) on mobile.

---

## Next Steps / Implementation Order
1. **Consolidate Profile Pages** (High, 1-2 dev-days).  
2. **Media Upload MVP** (High, 2-3 dev-days incl. backend).  
3. **Responsive Tab/Nav Refactor** (Medium, 1 dev-day).  
4. **Profile Event Bus & Query Sync** (Medium, 1 dev-day).  
5. **Visual Polish & Dead Space Reduction** (Medium, 1 dev-day).  
6. Low-priority enhancements scheduled post-audit sprint.

---

### Must-Have Enhancements (Scoped Addendum — 2025-06-15)

> The following four features were surfaced after the main audit. Each is now fully scoped with implementation details, database impacts, API extensions, and component stacks. These should be considered **Phase-1.5** work items (to be slotted immediately after "Next Steps #3").

#### 6. Flex Bar (Top-of-Profile Showcase)

| Aspect | Detail |
|---|---|
| **Problem** | No immediate visual representation of user status or identity dominance. |
| **Solution** | Insert `FlexBar` component between banner and tab nav. Combines avatar frame, equipped title, custom status line, and optional pinned post preview. |
| **DB Changes** | `ALTER TABLE users ADD COLUMN status_line TEXT;` *(nullable)*.  
— No migration needed for pinned post (use existing `users.pinned_post_id` if available; else add similar nullable FK). |
| **API Changes** | Extend `GET /api/profile/:username` to accept `?include=inventory,activity` and return:  
`statusLine`, `pinnedPost` (summary), `equippedTitle`, `activeFrame`, `activeBadge`. |
| **Components** | `client/src/components/profile/FlexBar.tsx`  
• `UserAvatarWithFrame` (reuse `Avatar`/`FramedAvatar`)  
• `Username` w/ rarity + title  
• `StatusLine` (inline edit if `isOwnProfile`)  
• `PinnedPostPreview` (reuse `PostCard` condensed) |
| **UX Notes** | Desktop: 4-column grid; Mobile: stacked flex with wrap.  
Fade-in cosmetics (`animate-fadeInFast`). |
| **Backend Hooks** | Update `profile.service.ts` to save `status_line` via `/api/profile/update`. |

#### 7. Recent Activity Tab

| Aspect | Detail |
|---|---|
| **Problem** | Users cannot view a timeline of activity for a profile. |
| **Solution** | New `RecentActivityTab` that streams items from `event_logs`. Infinite scroll with TanStack `useInfiniteQuery`. |
| **API** | `GET /api/profile/:username/activity?page=1&type=thread_created,post_created,…` returns paginated `EventLogDTO`.  
Controller re-uses `eventLogService.getUserEventLogs()`. |
| **DB/Service** | Already covered by `event_logs` & service.  
Add compound index `event_logs(user_id, created_at DESC)` (**already exists**). |
| **Components** | `components/profile/RecentActivityTab.tsx` → uses  
`<ActivityItem icon label timestamp link/>`.  
`event_labels.ts` maps types → icon/colour. |
| **Mobile** | Tab sits inside existing Tabs list; consider dynamic badge count for unread events. |

#### 8. Persistent Profile Sub-Navigation

| Aspect | Detail |
|---|---|
| **Problem** | Navigating to Wallet / Shop / Stats leaves profile context. |
| **Solution** | `ProfileNavBar.tsx` sticky under FlexBar; pills link to nested sub-routes. |
| **Routing** | Create directory `pages/profile/[username]/(sub)/` with `overview.tsx`, `posts.tsx`, etc. Use Wouter nested router or upgrade to React Router if needed. |
| **Implementation** | Wrap `[username].tsx` in `<Suspense>`; lazy load sub-routes.  
Keep SEO title updates via `react-helmet-async`. |
| **CSS** | Tailwind **sticky top-[calc(bannerHeight+flexbarHeight)]**; backdrop-blur + gradient border on scroll. |

#### 9. Quick Loadout Bar (Own Profile Only)

| Aspect | Detail |
|---|---|
| **Problem** | Users must open full cosmetic panel for simple swaps. |
| **Solution** | Floating `QuickLoadoutBar.tsx` bottom-right on own profile. Shows equipped frame,title,badge with dropdowns. |
| **Hooks/State** | Reuse `useUserCosmetics()`; local `useState` for open dropdown; mutate via existing equip endpoints. |
| **CTA Logic** | If slot empty, show «Shop» button linking to `/shop?filter=frames`. |
| **Accessibility** | On mobile, converts to bottom sheet (`Dialog`) to avoid finger reach issues. |

#### 10. X Account Linking and Content Sharing

| Aspect | Detail |
|---|---|
| **Problem** | Users cannot link their DegenTalk profiles to X accounts or share content directly to X, missing out on viral growth opportunities. |
| **Solution** | Implement X OAuth 2.0 for account linking and creation, add UI for sharing posts, threads, and referral links to X, and integrate with DegenTalk economy for rewards. |
| **DB Changes** | Extend `users` table with: `xAccountId VARCHAR(255)`, `xAccessToken VARCHAR(512)`, `xRefreshToken VARCHAR(512)`, `xTokenExpiresAt TIMESTAMP`, `xLinkedAt TIMESTAMP`. Create new `xShares` table to track sharing activities for analytics and rewards. |
| **API Changes** | Add endpoints: `GET /api/auth/x/login` and `GET /api/auth/x/callback` for OAuth flow, `POST /api/profile/x/unlink` to unlink accounts, `POST /api/share/x/post` and `POST /api/share/x/referral` for content sharing. |
| **Components** | `client/src/features/auth/components/XLoginButton.tsx` for sign-in, `client/src/features/profile/components/XLinkButton.tsx` for linking, `client/src/features/forum/components/XShareButton.tsx` for sharing content, `client/src/features/referral/components/XReferralShare.tsx` for referral links. |
| **UX Notes** | Display X handle or badge on profiles if linked. Ensure mobile-friendly OAuth flow and compact share buttons. Incentivize sharing with XP/DGT rewards for viral growth. |
| **Backend Hooks** | Update `profile.service.ts` to handle X account data, create `xAuthService.ts` for OAuth flow, and `xShareService.ts` for API interactions. Integrate with `rewardService.ts` for economy rewards. |
| **Scalability** | Implement job queue for X API rate limits, automate token refresh, index database fields for performance, and cache X data to reduce API load. |

#### Database Schema Updates (Applied 2025-06-15)

> **Status:** ✅ *Completed & migrated locally*.  These columns/tables now exist in the source schema and the corresponding SQL migration files (`0008_add_users_profile_fields.sql`, `0009_create_xp_logs_table.sql`) are ready to be applied in staging/production.

| Affected Table | Change | Details |
|----------------|--------|---------|
| `users` | **`status_line TEXT NULL`** | Stores the custom status string surfaced in **Flex Bar**.  Accessible via `profileService.getUserProfile()` under `statusLine`. |
|  | **`pinned_post_id INTEGER`** *(FK → `posts.id`, ON DELETE SET NULL)* | Supports **PinnedPostPreview** in Flex Bar.  API should join `posts` on demand to fetch summary. |
| `xp_logs` | **NEW TABLE** | Tracks per-user daily XP accrual.<br/>Columns: `id SERIAL PK`, `user_id INTEGER NOT NULL` (FK `users.id` ON DELETE CASCADE), `date DATE NOT NULL`, `xp_gained INTEGER DEFAULT 0`, `created_at TIMESTAMPTZ DEFAULT now()`.  Unique constraint `(user_id, date)` + index `(user_id, date)`. |

**Schema Export:** `xpLogs` added to `db/schema/index.ts`; all services can now import via `@schema`.

**Type Generation:** Re-run Drizzle codegen (`pnpm drizzle-kit generate`) to emit updated TS types for `users` & `xpLogs`.

**Immediate Integration Tasks**
1. **Profile API Update** — include `statusLine` & `pinnedPost` in `/api/profile/:username` response.  *(Flex Bar task)*
2. **Event Bus** — when XP is awarded (`handleXpAward`) also `INSERT`/`UPERT` into `xpLogs` for that `user_id` & `date`.
3. **XP Heatmap Feature** — query `xpLogs` roll-ups instead of recalculating from `event_logs`.
4. **Pinned Post CRUD** — allow users to set/unset `pinned_post_id` via `PATCH /api/profile/pin-post` (body: `postId|null`).

---

### Road-Map Adjustments

1. **Insert** FlexBar + Sub-Nav tasks into *Next Steps* as **Step 3A & 3B** before responsive polish.  
2. **Recent Activity Tab** becomes **Step 4** (after Event Bus sync).  
3. **Quick Loadout Bar** slots into **Step 5** alongside visual polish.
4. **X Account Linking** slots into **Step 3C** after "Persistent Profile Sub-Navigation".

---

### Future Bonus Features (Post-MVP)

| # | Feature | Notes |
|---|---------|-------|
| 10 | **Profile XP Heatmap** | Requires daily roll-up job writing to `xp_logs (user_id, date, xp)`; UI via `<XPHeatmap />` (CSS grid). |
| 11 | **Degen Résumé Generator** | SSR route `/profile/:username/resume` pipes React PDF (`@react-pdf/renderer`) or Puppeteer to generate PDF. Caches output in S3 with `Cache-Control: public,max-age=86400`. |

---

*End of Report*
