# Canonical Zones Implementation

## Overview

This document outlines the implementation of the canonical zone structure for the Degentalk™™ forum as defined in `docs/forum/implementation-plan-canon-v1.md`. The new structure organizes the forum into Primary Zones (single-forum destinations with distinct visual identities) and Expandable Zones (traditional categories with child forums).

## Database Schema Changes

The following columns have been added to the `forum_categories` table:

- `isZone` (boolean): Indicates if a category is a Primary Zone (true) or a traditional category/forum (false)
- `canonical` (boolean): Indicates if a zone has canonical status (should be prominently displayed)
- `threadsCount` (integer): Count of threads in the zone/category (for performance)
- `postsCount` (integer): Count of posts in the zone/category (for performance)
- `lastThreadId` (text): ID of the most recent thread in the zone/category

Existing columns being used:
- `color`: Used as the `colorTheme` property for Primary Zones
- `icon`: Used for both Primary Zones and categories

## Frontend Components

### New Components

- `CanonicalZoneGrid`: Displays a grid of Primary Zones on the homepage
- `ZoneCard`: Individual card for a Primary Zone with themed styling
- `ForumHeader`: Displays a themed header for Primary Zones and regular headers for forums

### Updated Components

- `HierarchicalForumNav`: Updated to display Primary Zones separately from Expandable Categories
- `ThreadList`: Updated to support themed styling for threads within Primary Zones
- `ThreadCard`: Added Primary Zone styling support for thread cards

### UI Theme System

The `zone-themes.css` file defines themes for each Primary Zone:

- `zone-theme-pit`: Raw, unfiltered discussions
- `zone-theme-mission`: Strategic discussions
- `zone-theme-casino`: Trading and gambling
- `zone-theme-briefing`: News and updates
- `zone-theme-archive`: Historical records

Each theme includes:
- Background gradients
- Border colors
- Hover effects
- Navigation styling
- Thread card styling
- XP boost animations

## Routing Structure

The application now handles three types of forum entities with different routing patterns:

1. **Primary Zones**:
   - URL: `/forums/[slug]`
   - Example: `/forums/the-pit`
   - Serves a single forum destination with themed UI

2. **Expandable Categories**:
   - URL: `/zones/[slug]`
   - Example: `/zones/market-moves`
   - Displays a list of child forums

3. **Child Forums**:
   - URL: `/forums/[slug]`
   - Example: `/forums/altcoins`
   - Regular forum within an Expandable Category

## API Endpoints

New API endpoints have been added to support the canonical zone structure:

- `GET /api/forums/primary-zones`: Returns all Primary Zones
- `GET /api/forums/categories`: Returns all top-level categories (Expandable Zones)
- `GET /api/forums/structure`: Returns the complete forum structure with proper nesting
- `GET /api/forums/:slug`: Returns a specific forum, category, or Primary Zone by slug
- `GET /api/forums/:forumId/threads`: Returns threads for a specific forum entity

## Seeding Data

The `scripts/db/seed-canonical-zones.ts` script seeds the database with:

- 5 Primary Zones (single-forum destinations)
- 10 Expandable Categories with their child forums

## Frontend Data Flow

1. `useForumStructure` hook fetches the forum structure from the API
2. The structure is parsed into Primary Zones and Expandable Categories
3. The homepage displays Primary Zones in the `CanonicalZoneGrid` component
4. The sidebar navigation shows Primary Zones at the top, followed by Expandable Categories

## User Experience

- **Homepage**: 
  - Primary Zones displayed prominently with themed cards
  - Expandable Categories shown below with their child forums

- **Navigation**: 
  - Sidebar shows Primary Zones at the top
  - Expandable Categories below with collapsible child forums

- **Forum Views**:
  - Primary Zones have themed headers and thread styling
  - Regular forums have standard styling
  - Category views list their child forums

## Migration Path

For existing deployments, run:

1. Apply the schema migration: `npm run db:migrate`
2. Run the seeding script: `node scripts/db/seed-canonical-zones.ts`

## Future Enhancements

- **XP Boosts**: Primary Zones can have XP boost events for increased engagement
- **Events**: Support for themed events within Primary Zones
- **Visual Enhancements**: Additional visual treatments for threads in each Primary Zone
- **Analytics**: Zone-specific engagement metrics and dashboards
- **Moderation**: Zone-specific moderation tools and permissions

## Style Guide

For developers adding new Primary Zones, follow these guidelines:

1. Add the zone to the `PRIMARY_ZONES` array in `scripts/db/seed-canonical-zones.ts`
2. Create a theme entry in `client/src/styles/zone-themes.css`
3. Update the `THEME_ICONS` object in `HierarchicalForumNav.tsx` with appropriate icons 