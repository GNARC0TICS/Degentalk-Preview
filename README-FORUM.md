# Degentalk Forum – Canonical Architecture & Developer Guide

> **Status – 2025-06-16**  
> This document is the single source of truth for anything related to the forum
> structure, navigation, business rules, and developer/admin workflows.  
> • If something in code diverges from this README, the code is **wrong**.  
> • If you extend the structure (add zones / categories / forums) you **must**
> update this file in the same pull-request.

---

## 0. TL;DR (For the Impatient 🏃‍♂️)

1. The primary hierarchy is **`Zone → Forum`**. Forums can optionally contain one level of **`SubForums`** (i.e., `Zone → Forum → SubForum`). Threads & replies live **only** inside forums or subforums.
2. **forumMap.config.ts** (frontend) & **forum_categories** table (backend) are
   generated from the **same data** – never diverge, never hand-edit SQL.
3. **All business logic** (posting, tipping, XP, permissions, prefixes…)
   is attached at the **forum or subforum level**. Zones are _purely organisational_.
4. Navigation components (`CanonicalZoneGrid`, `HierarchicalZoneNav`, etc.) read
   the config → no hard-coded slugs anywhere else.
5. Admins create / rename items via the **Config Service** or DB → the UI & API
   update instantly – no redeploy required.

Keep reading for the long version.

---

## 1. URL Structure & Navigation

### 1.1 Clean URL Architecture (2025-01-27 Update)

DegenTalk now uses a clean `/forums/` URL structure that eliminates the zone layer from URLs while preserving the Featured vs General forum distinction:

| URL Pattern                         | Purpose                                 | Example                                            |
| ----------------------------------- | --------------------------------------- | -------------------------------------------------- |
| `/forums`                           | All forums listing (Featured + General) | `/forums`                                          |
| `/forums/{forum}`                   | Direct forum access                     | `/forums/crypto-discussion`                        |
| `/forums/{forum}/{subforum}`        | Subforum access                         | `/forums/crypto-discussion/trading-signals`        |
| `/forums/{forum}/create`            | Create thread in forum                  | `/forums/crypto-discussion/create`                 |
| `/forums/{forum}/{subforum}/create` | Create thread in subforum               | `/forums/crypto-discussion/trading-signals/create` |
| `/threads/{slug}`                   | Individual thread                       | `/threads/bitcoin-price-analysis`                  |

### 1.2 Featured vs General Forums

- **Featured Forums** (`isPrimary: true`): Enhanced theming, prominent placement, 🌟 visual indicators
- **General Forums** (`isPrimary: false`): Standard presentation, organized below Featured Forums
- **Legacy zones** are now represented as Featured Forums for better SEO and user experience

### 1.3 Legacy URL Redirects

All legacy URLs automatically redirect to the new structure:

- `/zones/casino-floor/crypto-discussion` → `/forums/crypto-discussion`
- `/zones/featured/trading-signals` → `/forums/trading-signals`
- `/forum/crypto-discussion` → `/forums/crypto-discussion`

---

## 2. Anatomy of the Forum System

| Level        | Purpose                                                         | Holds Threads? | URL Access                   |
| ------------ | --------------------------------------------------------------- | -------------- | ---------------------------- |
| **Forum**    | Primary unit for rules, posting & XP (Featured or General type) | ✅             | `/forums/{forum}`            |
| **SubForum** | Child forum under a parent forum                                | ✅             | `/forums/{forum}/{subforum}` |
| **Thread**   | Discussion container (belongs to one forum or subforum)         | —              | `/threads/{slug}`            |
| **Reply**    | Message inside a thread                                         | —              | N/A                          |

**Key Changes from Legacy Structure:**

- **Zones** are now represented as **Featured Forums** (`isPrimary: true`) for cleaner URLs
- **Forums** are the primary navigation unit, directly accessible via `/forums/{slug}`
- **SubForums** maintain hierarchical nesting: `/forums/{parent}/{child}`

Important notes:

• The `forum_categories` table stores entities with `type = 'zone'` or `type = 'forum'`. SubForums are also of `type = 'forum'` but have a `parentId` pointing to another forum.
• Zones are distinguished as 'Primary' or 'General' based on `pluginData.configZoneType` (from `forumMap.config.ts`), which translates to an `isPrimary` flag in API/frontend contexts.
• Zones **never** contain threads directly; they host one or more 'Forum' entities.
• Forums are direct children of Zones. Additionally, a Forum can itself contain child Forums (referred to as SubForums), allowing for a `Zone → Forum → SubForum` structure. The concept of a separate 'Category' entity as a distinct mandatory layer between Zone and Forum is not the primary structure implemented by the current `forumMap.config.ts` and sync process, although the database schema and frontend context could potentially support it if the API provided such data.

---

## 3. Canonical Structure (2025-01-27 Update)

### 3.1 Featured Forums (Enhanced Experience, `isPrimary: true`)

Accessible via `/forums/{slug}` with enhanced theming and prominent placement:

| Slug              | Name                 | Quick Description                           | URL                       |
| ----------------- | -------------------- | ------------------------------------------- | ------------------------- |
| `the-pit`         | 🔥 The Pit           | Raw, unfiltered, often unhinged discussion. | `/forums/the-pit`         |
| `mission-control` | 🚀 Mission Control   | Alpha, research & strategic deep dives.     | `/forums/mission-control` |
| `briefing-room`   | 📢 The Briefing Room | Official news & announcements.              | `/forums/briefing-room`   |
| `casino-floor`    | 🎰 The Casino Floor  | Trading, gambling & high-stakes plays.      | `/forums/casino-floor`    |
| `the-archive`     | 📚 The Archive       | Historical records & past glories.          | `/forums/the-archive`     |

Featured Forums carry enhanced theming (color, icon, banners, custom components) and are designed for high-engagement, staff-driven content with unique gamification rules, special XP challenges, and enhanced curation capabilities.

### 3.2 General Forums (Standard Experience, `isPrimary: false`)

Standard forums that appear below Featured Forums on `/forums` page:

| Slug              | Name            | SubForums (examples)                   | URL                       |
| ----------------- | --------------- | -------------------------------------- | ------------------------- |
| `market-analysis` | Market Analysis | `btc-analysis`, `altcoin-analysis`     | `/forums/market-analysis` |
| `defi-lab`        | DeFi Laboratory | `yield-farming`, `protocol-discussion` | `/forums/defi-lab`        |
| `nft-district`    | NFT District    | `nft-calls`, `art-gallery`             | `/forums/nft-district`    |

General Forums provide standard functionality without the enhanced theming and special features of Featured Forums.

### 3.3 SubForum Examples

| SubForum Slug    | Parent Forum    | URL                                   | Key Rules (excerpt)                     |
| ---------------- | --------------- | ------------------------------------- | --------------------------------------- |
| `general-brawls` | the-pit         | `/forums/the-pit/general-brawls`      | posting ✅ · tipping ✅ · XP ✅         |
| `pit-memes`      | the-pit         | `/forums/the-pit/pit-memes`           | XP ❌ · tipping ✅                      |
| `alpha-leaks`    | mission-control | `/forums/mission-control/alpha-leaks` | access `level_10+` · XP ×2              |
| `announcements`  | briefing-room   | `/forums/briefing-room/announcements` | posting ❌ (mods only)                  |
| `signals-ta`     | market-analysis | `/forums/market-analysis/signals-ta`  | posting ✅ · prefixes `[SIGNAL]` `[TA]` |

_Never rely on this table in code – the full, authoritative list lives in `forumMap.config.ts`._

---

## 4. Single-Source-of-Truth Workflow

1. **Edit** `client/src/config/forumMap.config.ts` (or use the forthcoming
   admin UI which writes to the DB).
2. **Run** `npm run sync:forums` (wrapper for
   `/scripts/dev/syncForumsToDB.ts`).
3. Drizzle migrates/patches rows inside `forum_categories` & cascades to any
   FK relations.
4. Types are regenerated via `drizzle-kit`, then re-exported through
   **forum-sdk** so both backend (`@schema`) & frontend (`@db_types`) share the
   identical shapes.

Result:
• No drift between environments.  
• Zero manual SQL.  
• CI fails if the generated types differ from the committed ones.

---

## 5. Navigation & User Experience

### 5.1 First Visit (Unauthenticated)

1. **Home (`/`)** shows:
   - **Hero** & **Announcement Ticker**.
   - **Featured Forums Grid** (primary forums with `isPrimary: true`) → large branded cards.
   - **General Forums** listed just below if present.
   - **Hot Threads**, **Leaderboard**, **Active Users** widgets.
2. Clicking **"Forums"** in navigation goes to `/forums` → shows all forums (Featured + General).
3. Clicking a **Featured Forum card** goes to `/forums/[forumSlug]` → shows the forum with enhanced theme.
4. Clicking a **General Forum** goes to `/forums/[forumSlug]` (same page template, standard styling).
5. **Subforum** clicks navigate to `/forums/[forumSlug]/[subforumSlug]`, where threads can be created.

### 5.2 Returning / Power Users

• **Featured Forum shortcuts** appear prominently with 🌟 indicators for quick access.
• **Forum sidebar navigation** persists expanded state per user via `localStorage`.  
• Deep links (`/threads/[threadSlug]`) hydrate breadcrumbs using `ForumStructureContext` so navigation never breaks even on page refresh.
• **Clean URLs**: `/forums/crypto/trading` instead of `/zones/casino-floor/crypto/trading` for better UX.

### 5.3 Thread / Post Creation Flow

`CreateThreadForm` / `CreatePostForm` take the current `forumSlug` from route
params → fetch **rules** → gate on permissions (`accessLevel`) & features
(XP, tipping, prefixes, etc.).

### 4.4 Configurable Zone Card & Zone Page Design

#### Components & File Map

| UI Piece                     | Path                                                                                             | Responsibility                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| **CanonicalZoneGrid**        | `client/src/components/forum/CanonicalZoneGrid.tsx`                                              | Renders a responsive grid of `ZoneCard`s on **Home** and `/zones` index.                  |
| **ZoneCard**                 | `client/src/components/forum/ZoneCard.tsx`                                                       | Single card with banner, emoji/icon, name & stats.                                        |
| **ZoneLanding** _(per-zone)_ | `client/src/features/forum/pages/ZoneLanding/[zoneSlug].tsx` (code-split via `landingComponent`) | Hero section, banner overlay, category/forum listing, custom sections.                    |
| **useZoneTheme()**           | `contexts/ForumThemeProvider.tsx`                                                                | Exposes the merged theme (`zone.theme` → `PRIMARY_ZONE_THEMES` fallback → dev overrides). |

#### Theme Object (single source)

Each **zone** entry in `forumMap.config.ts` owns a `theme` object:

```
{
  color: "#FF4D00",   // Primary accent – used for gradients & text highlights
  icon: "🔥",          // Emoji or Lucide icon name (string → emoji, component → Lucide)
  bannerImage: "/banners/the-pit.jpg", // 1440×480 hero image
  landingComponent: "PitLanding"        // Dynamic import path (code-split)
}
```

_Optional per-zone overrides_: Pass `themeOverride` when you need seasonal or event skins.

#### Design Tokens in CSS

• `--zone-accent` (→ `theme.color`)  
• `--zone-banner` (→ `bannerImage`)  
• `--zone-icon` (emoji fallback string)

`CanonicalZoneGrid` injects these tokens as inline CSS variables so Tailwind can reference them inside `.zone-card` classes without extra CSS files.

#### Dev-Mode Tweaks (Hot-Reload)

1. **Local Overrides** – create `forumMap.dev.json` at project root with the same shape as `forumMap.config.ts`; when `VITE_ENV === 'dev'` the Provider merges this on top so you can live-edit colours, images, even swap `landingComponent` without touching TS files.
2. **Query-String Override** – append `?zoneSkin=<slug>` while on a zone page; the ThemeProvider will temporarily load `/public/dev-skins/<slug>.json` for quick demos.
3. **Storybook** – run `npm run storybook` to open isolated knobs for `ZoneCard` props (accent colour, banner, icon, rarity badge). Save the chosen JSON back into `forumMap.config.ts` once signed off.

#### Production Admin Overrides

The upcoming **Admin UI → UI Config** surface writes to `ui_themes` DB table. At boot the backend merges DB rows into the config via `mergeConfig()` so prod hot-updates without redeploy. Fields map 1-to-1 with the theme object above.

#### UX Guidelines

• Accent colour must meet WCAG AA contrast against card background.  
• Banner images should be ~150 KB max (lazy-loaded + blur-up placeholder).  
• Keep icon to two glyphs max – emojis render faster than SVG.

> _Reminder:_ Never put permissions or XP logic in a zone or category; themes are **visual only**.

---

## 6. Business Logic – Forums or Bust 🎯

Business logic is primarily attached at the Forum (or SubForum) level. While the `ForumRules` TypeScript type (defined in `forumMap.config.ts` and stored within the `pluginData.rules` field in the database) is the conceptual container for many rules, some core and frequently accessed rules are also available as direct columns on the `forum_categories` database table for performance and easier querying.

| Feature         | Controlled At (Examples)                                                                                      | Notes                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Posting Allowed | `forum_categories.isLocked` (derived from `rules.accessLevel` or direct set), `pluginData.rules.allowPosting` | Zone/category never override                   |
| XP Multiplier   | `forum_categories.xpMultiplier`, `pluginData.rules.xpMultiplier`                                              | Defaults to `1`                                |
| Tipping Enabled | `forum_categories.tippingEnabled`, `pluginData.rules.tippingEnabled`                                          | —                                              |
| Prefixes        | `pluginData.rules.availablePrefixes` / `pluginData.rules.prefixGrantRules`                                    | Auto-assign engine in `/utils/prefixEngine.ts` |
| Access Level    | `pluginData.rules.accessLevel` (influences `isLocked`, `minXp` etc.)                                          | `public`/`registered`/`level_X+`/`mod`/`admin` |
| Min XP Required | `forum_categories.minXp`, `pluginData.rules.minXpRequired`                                                    | Governs access                                 |

**General Guideline:**

- When adding a new rule, extend the `ForumRules` TS type in `forumMap.config.ts`.
- The sync script (`scripts/seed/seedForumsFromConfig.ts`) will populate this into `pluginData.rules`.
- If the rule is core and frequently accessed, consider also adding a direct column to `forum_categories` and ensure the sync script populates it from the `ForumRules` object.
- Update backend validator schemas and services to utilize the new rule from the most appropriate source (direct column or `pluginData.rules`).

---

## 7. Admin & Ops Cheatsheet

• **Add Zone** → config `zones.push(...)` → run sync script → add banner
image in `public/banners/`.  
• **Add General Zone** → `zones.push(...)` with `type: 'general'` & run the
sync script.  
• **Lock Forum** → set `rules.allowPosting = false`.
• **VIP-only Forum** → `accessLevel: 'level_10+'` or `'mod'` etc.
• **Rename Slug** → _don't_ – create a new item & migrate threads via script
(slug changes break SEO & bookmarks).

---

## 8. Edge-Cases & Gotchas ⚠️

1. **Zone without forums** → valid, but it still needs ≥1 forum or the page
   looks empty (CI warns).
2. **Forum orphaned from config** → sync script marks it `is_hidden = true`
   instead of deleting (safety net).
3. **Category slug collision** with zone slug → prohibited; lint rule
   `forum-slug-unique` enforces.
4. **Frontend stale after config change** → Hot-reload covers it, but prod cache
   purge happens via `config.version` bump.
5. **Icon Mismatch** – If the emoji/icon differs between `PRIMARY_ZONE_THEMES`
   and the zone's `theme`, the theme wins (single source rule).

---

## 9. Developer On-Boarding Checklist

1. `npm run dev` ➜ should start backend & Vite with clear prefixed logs.
2. Confirm `/api/forum/structure` returns **200** with canonical JSON.
3. Skim `forumMap.config.ts` – you'll touch this file often.
4. Follow **import rules** (see `.cursor/naming-rules.mdc`).
5. Remove unused imports; run `npm run lint` before commit.

Welcome to the colosseum – now ship something legendary. 🏴‍☠️

---

## 10. Database Guide (Schema & Migrations)

### 10.1 Core Tables

| Table                                                      | Purpose                                                                                                                                                                                     | Relation Keys                                                                      |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `forum_categories`                                         | Single table for **Zones** and **Forums** (distinguished by `type = 'zone'` or `type = 'forum'`). Zones are further distinguished as 'Primary' or 'General' by `pluginData.configZoneType`. | self-FK `parent_id` (forum → zone)                                                 |
| `threads`                                                  | Stores threads.                                                                                                                                                                             | `category_id` → `forum_categories.id` (must point to a row where `type = 'forum'`) |
| `posts`                                                    | Stores replies.                                                                                                                                                                             | `thread_id`, `reply_to_post_id` (self-referencing)                                 |
| `prefixes` / `thread_prefixes`                             | Lookup + FK for visual thread tags.                                                                                                                                                         | —                                                                                  |
| `tags`, `thread_tags`                                      | User-generated labels.                                                                                                                                                                      | —                                                                                  |
| `post_reactions`, `post_likes`, `polls`, `poll_options`, … | Engagement primitives; all FK back to `posts`/`threads`.                                                                                                                                    |

_All tables live under `db/schema/forum/` (Drizzle). Migrations are auto-generated via `npm run db:migrate` and live in `migrations/postgres/*`._

### 10.2 Entity Lifecycle

1. **Config Sync** – `scripts/dev/syncForumsToDB.ts` upserts rows into `forum_categories` based on `forumMap.config.ts`.
2. **Seeding** – Example seeds (`seed-canonical-zones.ts`, `seed-threads.ts`) populate starter content.
3. **Cascade Rules** – `ON DELETE SET NULL` for parent–child to prevent accidental purges; `ON DELETE CASCADE` for content (threads/posts).
4. **Type Generation** – `drizzle-kit` produces TypeScript types into `db/types/generated` used by `forum-sdk`.

### 10.3 Writing a Migration Manually

```bash
npm run db:generate --name add-casino-floor-event-column
# Edit generated .sql if needed
npm run db:push   # applies to local dev DB
```

> **Remember:** If a column touches business rules (tipping/xp) add it to **ForumRules** or a dedicated service instead of sprinkling literals.

---

## 11. Front-End Scope Guide

### 11.1 Feature Domains

| Path                          | Description                                                           |
| ----------------------------- | --------------------------------------------------------------------- |
| `client/src/features/forum`   | All data-heavy logic (hooks/services/components) specific to forum.   |
| `client/src/components/forum` | Re-usable, presentational UI atoms/molecules (ZoneCard, ThreadCard…). |
| `client/src/contexts`         | `ForumStructureContext`, `ForumThemeProvider`, global state.          |
| `client/src/pages`            | Next.js page routes (`/forums/[slug].tsx`, `/zones/[slug].tsx`        |
