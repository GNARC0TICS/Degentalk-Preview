# Zone → Forum Terminology Migration Guide

## Overview
Update user-facing terminology from "Zones" to "Featured/General Forums" while maintaining internal code structure.

## Implementation Checklist

### 1. Create Terminology Constants
**File**: `client/src/constants/terminology.ts`
```typescript
export const FORUM_TERMINOLOGY = {
  // Display labels
  FEATURED_FORUMS: 'Featured Forums',
  GENERAL_FORUMS: 'General Forums',
  ALL_FORUMS: 'All Forums',
  
  // Descriptions
  FEATURED_DESC: 'Premium forums with unique themes and enhanced features',
  GENERAL_DESC: 'Community forums organized by topic',
  
  // Error messages
  FORUM_NOT_FOUND: 'The forum you're looking for doesn't exist',
  NO_ACCESS: 'You don't have access to this forum'
};
```

### 2. Update UI Components

#### Forums Index Page
**File**: `client/src/pages/forums/index.tsx`
- Line 329: Change "Primary Zones" → "Featured Forums"
- Line 372: Change "All Forums" → "General Forums"
- Line 213: Change "forums" → "subforums" in badge

#### Navigation
**File**: `client/src/components/header/PrimaryNav.tsx`
- Update "Forum" link to "Forums" (plural)

#### Zone Cards
**File**: `client/src/components/zone/ZoneCard.tsx`
- Update hover text to describe as "forum"
- Change "Enter Zone" → "Enter Forum"

#### Homepage Carousel
**File**: `client/src/pages/home.tsx`
- Update section heading to "Featured Forums"
- Update carousel description

### 3. Update Error Messages

**Files to update**:
- `/pages/zones/[slug].tsx` - Line 262: "Zone Not Found" → "Forum Not Found"
- `/components/forum/ForumPage.tsx` - Line 90: Update error message
- Any 404 pages mentioning zones

### 4. Breadcrumb Updates

**File**: `client/src/components/navigation/ForumBreadcrumbs.tsx`
- Remove "Zones" from breadcrumb trail
- Use: Home → Forums → [Forum Name] → [Subforum]

### 5. Meta/SEO Updates

**Files**:
- Page titles: "Zones" → "Forums"
- Meta descriptions: Update terminology
- OpenGraph tags: Update descriptions

## Validation Checklist

- [ ] No user-facing "Zone" text remains
- [ ] Navigation uses "Forums" consistently
- [ ] Error messages updated
- [ ] Breadcrumbs show logical hierarchy
- [ ] Page titles updated
- [ ] Help text uses new terminology

## Notes for Developers

1. **DO NOT** rename internal variables/functions
2. **DO NOT** change API endpoints
3. **DO NOT** modify database fields
4. Only update user-visible strings and labels
5. Use terminology constants where possible

## Testing

1. Navigate to /forums - should see "Featured Forums" and "General Forums"
2. Click through breadcrumbs - no "Zone" text
3. Trigger 404 - should say "forum not found"
4. Check page titles in browser tabs
5. Hover over forum cards - proper descriptions

## Audit Results

### UI Component Updates

*   **File:** `client/src/pages/forums/index.tsx`
    *   **Line 329:** Change "Primary Zones" to "Featured Forums".
    *   **Line 372:** Change "All Forums" to "General Forums".
    *   **Line 213:** Change "forums" to "subforums" in the badge.
*   **File:** `client/src/components/header/PrimaryNav.tsx`
    *   Update the "Forum" link to "Forums".
*   **File:** `client/src/components/zone/ZoneCard.tsx`
    *   Update hover text to describe as "forum".
    *   Change "Enter Zone" to "Enter Forum".
*   **File:** `client/src/pages/home.tsx`
    *   Update the section heading to "Featured Forums".
    *   Update the carousel description.

### Error Message Updates

*   **File:** `client/src/pages/zones/[slug].tsx`
    *   **Line 262:** Change "Zone Not Found" to "Forum Not Found".
*   **File:** `client/src/components/forum/ForumPage.tsx`
    *   **Line 90:** Update the error message to use "forum" instead of "zone".

### Breadcrumb Updates

*   **File:** `client/src/components/navigation/ForumBreadcrumbs.tsx`
    *   Remove "Zones" from the breadcrumb trail. The new structure should be: `Home → Forums → [Forum Name] → [Subforum]`.

### Meta/SEO Updates

*   **Page Titles:** All instances of "Zones" in page titles should be changed to "Forums".
*   **Meta Descriptions:** All meta descriptions should be updated to reflect the new terminology.
*   **OpenGraph Tags:** All OpenGraph tags should be updated with the new terminology.

## Server-Side Analysis (Internal Only)

This section summarizes the internal usage of "zone" and "zones" on the server. As per the migration guide, these internal references **should not be changed**. This information is for planning and context.

*   **Configuration & Typing:**
    *   `server/src/config/forum.config.ts`: Defines `defaultZoneColor`.
    *   `server/src/domains/forum/types/index.ts`: Defines `ZoneId` and includes `zone` objects in data structures.
    *   `shared/config/forum.config.ts`: The `forumMap` export likely contains the core definition of `zones` and their properties.
    *   `server/src/domains/forum/services/config.service.ts`: Contains logic for parsing `Zone` configurations, including a `parseZoneType` function to differentiate between `primary` and `general` zones from `pluginData`.

*   **Core Forum Logic:**
    *   `server/src/domains/forum/services/structure.service.ts`: Central service for the forum hierarchy. It distinguishes between `zone` and `forum` types, aggregates post/thread counts for zones, and contains the primary logic for fetching and structuring forum data.
    *   `server/src/domains/forum/services/thread.service.ts`: Fetches threads and their associated `zoneInfo` for theming and context. Includes an optimized batch-fetching mechanism (`getZoneInfoBatch`).
    *   `server/src/domains/forum/forum.service.ts`: Orchestrates fetching the entire forum structure, including `zones` and their child forums.

*   **API Endpoints & Controllers:**
    *   `server/src/domains/forum/controllers/structure.controller.ts`: Has a `getZoneStats` method.
    *   `server/src/domains/forum/routes/structure.routes.ts`: Exposes the `/zone-stats` endpoint.
    *   `server/src/domains/forum/routes/category.routes.ts`: Handles routes that return a flat payload of `{ zones, forums }`.

*   **Transformers:**
    *   `server/src/domains/forum/transformers/forum.transformer.ts` & `thread.transformer.ts`: Transform database objects into the public-facing API response, which includes a `zone` object containing details like name, slug, and `colorTheme`.

*   **Admin & Permissions:**
    *   `server/src/domains/admin/sub-domains/database/database.service.ts`: Admin panel navigation links point to `/admin/config/zones`.
    *   `server/src/domains/admin/sub-domains/permissions/permissions.service.ts`: Defines zone-specific permissions like `zone.crypto.moderate`.

*   **Testing:**
    *   `server/src/domains/forum/forum.service.test.ts`: Contains numerous tests for identifying primary vs. general zones and handling various `pluginData` configurations.