# ForumFusion Forum System

## Table of Contents

- [Overview](#overview)
- [Primary Zones & Forum Structure](#primary-zones--forum-structure)
- [Backend Logic & API Endpoints](#backend-logic--api-endpoints)
- [Frontend Logic & Components](#frontend-logic--components)
- [Development Environment & Scripts](#development-environment--scripts)
- [Data Flow & Integration](#data-flow--integration)
- [Troubleshooting & Tips](#troubleshooting--tips)
- [Extending the Forum](#extending-the-forum)
- [Current Status & Roadmap](#current-status--roadmap)
- [Vibes & Philosophy](#vibes--philosophy)

---

## Overview

ForumFusion powers a modern, hierarchical forum system for DegenTalk, designed for high engagement, clarity, and extensibility. The forum is organized as:

- **Zones**: Top-level destinations (singular site featured branded forums) (e.g., "The Pit", "Mission Control")
- **Forums**: Sub-containers within Zones (e.g., "Signals & TA" in "Market Moves")
- **Threads**: Individual discussions within Forums
- **Replies**: Messages within Threads

All logic, endpoints, and UI are built around this hierarchy.

---

## Primary Zones & Forum Structure

### Canonical Zones

Primary Zones are the main branded destinations, each with a unique theme and icon:

| Name              | Slug              | Theme          | Description                      |
| ----------------- | ----------------- | -------------- | -------------------------------- |
| The Pit           | the-pit           | theme-pit      | Raw, unfiltered discussions      |
| Mission Control   | mission-control   | theme-mission  | Strategic/alpha/project analysis |
| The Casino Floor  | the-casino-floor  | theme-casino   | Trading, gambling, high-stakes   |
| The Briefing Room | the-briefing-room | theme-briefing | News, announcements, updates     |
| The Archive       | the-archive       | theme-archive  | Historical records, past glories |

### Expandable Categories

Traditional forum categories with sub-forums, e.g.:

- Market Moves
- Alpha & Leaks
- Casino & DeGen
- Builder's Terminal
- Airdrops & Quests
- Web3 Culture & News
- Beginner's Portal
- Shill & Promote
- Marketplace
- Forum HQ

### Data Model

- **Zone**: `isZone: true`, `canonical: true`
- **Forum**: `isZone: false`, may have `parentId`
- **Thread**: Belongs to a forum
- **Reply**: Belongs to a thread

---

## Backend Logic & API Endpoints

### Key Files

- `/server/src/domains/forum/forum.routes.ts` — All forum API endpoints
- `/server/src/domains/forum/forum.controller.ts` — Route handlers
- `/server/src/domains/forum/forum.service.ts` — Business logic

### Core Endpoints

#### Forum Structure

- `GET /api/forum/structure` — Flat array of all zones and forums (with all fields)
- `GET /api/forum/categories` — Categories with thread/post stats
- `GET /api/forum/zones` — All primary zones with stats
- `GET /api/forum/zones/tree` — Hierarchical forum structure

#### Threads & Posts

- `GET /api/forum/threads` — Paginated thread listings (filter/sort/search)
- `GET /api/forum/threads/:id` — Single thread with replies
- `POST /api/forum/threads` — Create a new thread
- `GET /api/forum/threads/:threadId/posts` — Replies for a thread
- `POST /api/forum/posts` — Create a new reply

#### Tags, Prefixes, Bookmarks, Reactions

- `POST /api/forum/threads/:threadId/tags` — Add tag to thread
- `DELETE /api/forum/threads/:threadId/tags/:tagId` — Remove tag
- `GET /api/forum/threads/:threadId/tags` — Get all tags for a thread
- `POST /api/forum/posts/:postId/react` — React to a post (like/helpful)
- `POST /api/forum/bookmarks` — Bookmark a thread
- `DELETE /api/forum/bookmarks/:threadId` — Remove bookmark

#### Solved Threads

- `PUT /api/forum/threads/:threadId/solve` — Mark/unmark thread as solved

### Schema

- All forum entities are defined in `shared/schema.ts`
- Canonical fields: `id`, `name`, `slug`, `isZone`, `canonical`, `colorTheme`, `icon`, `parentId`, `threadsCount`, `postsCount`, `lastThreadId`, etc.

---

## Frontend Logic & Components

### Directory Structure

- `/client/src/features/forum/`
  - `components/` — All forum UI components
  - `hooks/` — Custom React hooks (e.g., `useForumStructure`, `useForumQueries`)
  - `services/` — API service (`forumApi.ts`)

### Key Components

- **ZoneGroup** — Displays a zone and its forums
- **ForumListItem** — Single forum in a list
- **ThreadCard** — Thread summary card
- **PostCard** — Individual reply card
- **ThreadList** — List of threads (with pagination)
- **PostList** — List of replies (with pagination)
- **CreateThreadButton** — Button to create threads
- **CreateThreadForm** — Form for new threads
- **CreatePostForm** — Form for new replies
- **TagInput** — Add/manage tags
- **PrefixBadge**, **SolvedBadge**, **LevelBadge** — Visual indicators

### Hooks

- `useForumStructure` — Fetches and organizes forum data (zones, forums, categories)
- `useForumQueries` — Centralized data fetching for threads, posts, etc.

### Pages

- `/forums/[forum_slug].tsx` — Forum page (threads list)
- `/zones/[zone_slug].tsx` — Zone page (forums list)
- `/threads/[thread_slug].tsx` — Thread page (replies)
- `/home.tsx` — Main landing, shows zones and hot threads

### Data Flow

- All data fetched via `forumApi.ts` using the standardized `apiRequest` pattern
- React Query is used for caching, loading, and error states

---

## Development Environment & Scripts

### Key Commands

- `npm run dev` — Start both frontend and backend
- `npm run dev:quick` — Fast start, skips seeding
- `npm run dev:with-seed` — Full seed and start
- `npm run dev:frontend` — Frontend only
- `npm run dev:backend` — Backend only

### Database

- SQLite for local dev, PostgreSQL for production
- Migrations managed via Drizzle ORM
- Seeding scripts: `seed-canonical-zones.ts`, `seed-threads.ts`, etc.

### Environment

- `.env.local` for local config
- Hot reload for both frontend and backend
- Role switcher for dev (User/Mod/Admin)

---

## Data Flow & Integration

- **Backend**: All forum data is served via RESTful endpoints, with strong typing and schema validation.
- **Frontend**: Data is consumed via hooks and services, with React Query for state management.
- **Canonical data shape**: Always Zone > Forum > Thread > Reply. No legacy "categories" or "sections" in code or UI.

---

## Troubleshooting & Tips

- **"Failed to load forum structure"**: Check backend logs, ensure `/api/forum/structure` returns JSON.
- **"Unexpected token '<'"**: Usually means HTML is returned instead of JSON (check Vite proxy, backend startup order).
- **Database errors**: Re-run seeding scripts, check for schema mismatches.
- **Adding new zones/forums**: Update seeding scripts and re-run, update frontend navigation/components as needed.

---

## Extending the Forum

- **Add new zones**: Update `seed-canonical-zones.ts` and frontend theme files.
- **Add new endpoints**: Define in `forum.routes.ts`, implement in controller/service, update `forumApi.ts` and hooks.
- **Add new UI features**: Create new components in `features/forum/components/`, export via `index.ts`.

---

## Current Status & Roadmap

- **Core structure, endpoints, and UI are live and canonical.**
- **All legacy files and docs have been archived or deleted.**
- **Next up:** Advanced UX (unread indicators, enhanced search, admin tools), reply management, and analytics.

---

## Vibes & Philosophy

ForumFusion is built for:

- **Clarity**: One canonical structure, no legacy confusion
- **Speed**: Fast dev environment, hot reload, clear scripts
- **Extensibility**: Easy to add new zones, forums, features
- **Community**: Designed for high engagement, fun, and growth

**If you're building or maintaining the forum, this is your home base.**

---

**For any changes, always update this README-FORUM.md to keep the team and future devs in sync.**

🚨 **Important:** In ForumFusion, **Zones are visual only**. All posting, tipping, XP, and prefix logic is controlled at the **forum** level via `forumMap.config.ts`. Zones group forums and apply themes/UI — they do not define permissions or reward logic.

## Rule Logic & Enforcement (forumMap.config.ts)

All reward logic, XP, tipping, access control, and prefix behavior is configured in `client/src/config/forumMap.config.ts`.

Each forum contains a `rules` object, which is consumed by backend and frontend logic via utility functions like:

- `getForumRules(forumSlug)`
- `canUserPost(forumSlug, user)`
- `shouldAwardXP(forumSlug)`
- `getAvailablePrefixes(forumSlug)`
- `prefixEngine(forumSlug, threadStats)`

All thread creation, XP awarding, tipping availability, and UI rendering is **driven by this config**, not hardcoded service logic.

🚨 NEVER hardcode forum behavior. Always reference `forumMap.config.ts`.

## Prefix Logic Engine

Prefixes are forum-specific and cosmetic, used to highlight popular or important threads. Prefixes can be:

- Manually selected by users (if available)
- Assigned by mods
- Auto-assigned based on engagement (e.g. `[HOT]` if thread hits 20 replies and 10 likes)

Auto-assignment is defined per forum in `prefixGrantRules`, and handled by a utility function:
```ts
prefixEngine(forumSlug, threadStats) => string[]
```

## LLM & Developer Onboarding

- Always start from `forumMap.config.ts`
- Use `getForumRules()` and other helper functions for any forum-specific logic
- NEVER hardcode reward or access logic in backend services or components
- Zones are UI containers only — logic is defined per-forum

### Common Anti-Patterns
- ❌ Hardcoding XP logic in `forum.service.ts`
- ❌ Creating new seed files for zones/forums manually
- ❌ Relying on `zones` DB table (doesn't exist — config-driven)

### Glossary
- **Zone**: Themed visual grouping of forums
- **Forum**: Logic container — defines rules
- **Thread**: A discussion within a forum
- **Reply**: A comment within a thread
- **Prefix**: A cosmetic badge or label on a thread

## Seeding & Syncing

✅ All zones and forums are now seeded from `forumMap.config.ts` using the `syncForumsToDB.ts` script in `/scripts/dev/`. Do not manually define forums or zones.

# DegenTalk Forum Zone System — Canonical Structure & Setup (2024)

## 1. Forum Architecture Overview

- **Zones**: Visual/thematic groupings of forums. They do **not** drive logic, but provide branding, navigation, and context.
- **Forums**: Logical units where all posting, XP, tipping, and prefix logic lives. Forums are always children of a zone.
- **Config-Driven**: The entire forum structure is defined in a single source of truth: `client/src/config/forumMap.config.ts`.

---

## 2. Canonical Zone & Forum Config

### Zones

- All zones are defined in the `forumMap.zones` array.
- Each **primary zone** now has a canonical theme:
  - `theme.color` (hex)
  - `theme.icon` (emoji)
  - `theme.bannerImage` (string)
  - `theme.landingComponent` (string)
  - `description` (string)
- **Primary zones** (as of this setup):
  - **The Pit**: Raw, unfiltered, and often unhinged. Welcome to the heart of degen discussion.
  - **Mission Control**: Strategic discussions, alpha, and project deep dives. For the serious degen.
  - **The Casino Floor**: Trading, gambling, and high-stakes plays. May the odds be ever in your favor.
  - **The Briefing Room**: News, announcements, and official updates. Stay informed.
  - **The Archive**: Historical records, past glories, and lessons learned. For the degen historian.

- **General zones** (e.g., Market Moves, Airdrops & Quests) are also supported, but may not have full theming.

### Forums

- Each zone contains a `forums` array, with each forum having:
  - `slug`, `name`
  - `rules` (posting, XP, tipping, prefixes, etc.)
  - Optional: `themeOverride` for per-forum theming

---

## 3. Theming & UI Consistency

- **All theming is now canonical and DRY**: The frontend (`ForumZoneCard`, `CanonicalZoneGrid`) relies solely on `zone.theme` and `zone.description`.
- **No more fallback UI**: Every primary zone is guaranteed to have a complete theme and description.
- **Missing zones (e.g., Casino Floor, The Archive)** are auto-injected if not present, ensuring the UI is always complete.

---

## 4. Home Page & Navigation

- The home page pulls all primary zones from `forumMap.zones` and passes their full theme and description to the grid.
- Cards are styled according to their canonical theme (color, icon, etc.).
- Navigation and links are standardized and always reference the config.

---

## 5. How to Add or Update Zones/Forums

- **To add a new zone**: Add an object to the `zones` array in `forumMap.config.ts` and provide a canonical theme if it's primary.
- **To add a new forum**: Add to the `forums` array of the appropriate zone.
- **To update theming**: Edit the `PRIMARY_ZONE_THEMES` object or the zone's `theme` property.

---

## 6. Example: Canonical Zone Config

```
{
  slug: 'the-pit',
  name: 'The Pit',
  type: 'primary',
  description: 'Raw, unfiltered, and often unhinged. Welcome to the heart of degen discussion.',
  theme: {
    icon: '🔥',
    color: '#FF3C3C',
    bannerImage: '/banners/pit.jpg',
    landingComponent: 'PitLanding',
  },
  forums: [
    // ...forums here
  ],
}
```

---

## 7. Key Principles

- **Single Source of Truth**: All forum/zone logic and theming is centralized in `forumMap.config.ts`.
- **No Logic in Zones**: Zones are for grouping and branding only; all logic is in forums.
- **Type-Safe**: All config is strongly typed for safety and editor support.
- **LLM/Automation Safe**: The config is structured for easy programmatic updates and audits.

---

## 8. Migration/Refactor Notes

- All legacy fallback UI and hardcoded theming have been removed.
- All pages/components now reference the config for zone/forum data and theming.
- Any new zones or forums must be added to the config to appear in the UI.

---

## 9. Next Steps for Documentation

- **Update all forum-related docs** to reference this canonical config structure.
- **Onboard contributors** to use `forumMap.config.ts` for all forum/zone changes.
- **Remove any old references** to hardcoded or scattered forum/zone logic.

---

*This document reflects the canonical, config-driven forum structure as of 2024. For further details, see `client/src/config/forumMap.config.ts` or contact the core team.*
