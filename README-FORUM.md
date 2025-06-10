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

ForumFusion powers a modern, hierarchical forum system for Degentalk™™, designed for high engagement, clarity, and extensibility. The forum is organized as:

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
