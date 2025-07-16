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
  FORUM_NOT_FOUND: 'The forum you\'re looking for doesn\'t exist',
  NO_ACCESS: 'You don\'t have access to this forum'
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

---

## Analysis of `forumMap.config.ts`

1.  **`PRIMARY_ZONES` is "Featured Forums"**: The `PRIMARY_ZONES` array contains the zones that are intended to be the "Featured Forums" on the site (e.g., "The Pit", "Mission Control"). These are defined with `type: 'primary'`.

2.  **`GENERAL_ZONE_WRAPPER` is "General Forums"**: There is a special `GENERAL_ZONE_WRAPPER` object that contains all other forums (e.g., "DeFi Laboratory", "NFT District"). This object has `type: 'general'` and its name is "General Forums". The comments confirm it's a structural wrapper and doesn't represent a real page itself.

3.  **Structure is `Zone[]`**: The final export `forumMap.zones` is an array of `Zone` objects. This confirms the top-level organizational unit is the "Zone".

4.  **Clear Separation**: The code explicitly separates `PRIMARY_ZONES` from the `GENERAL_ZONE_WRAPPER`, making the logic for the UI clear. The `getPrimaryZones` and `getGeneralZones` helper methods further confirm this separation.

## Final Hardened Plan

With this final piece of the puzzle, the migration plan is now concrete and low-risk.

**Objective**: Change all user-facing instances of "Zone" to "Forum" terminology, specifically relabeling "Primary Zones" as "Featured Forums" and the general collection as "General Forums".

### Client-Side Changes (User-Facing)

1.  **Create `terminology.ts`**: Create the `client/src/constants/terminology.ts` file as specified in the migration guide to store the new strings ('Featured Forums', 'General Forums', etc.).
2.  **Update Forums Index Page (`client/src/pages/forums/index.tsx`)**:
    *   Use the `getPrimaryZones()` from `forumMap` to render the "Featured Forums" section. The title for this section will come from the new `terminology.ts` file.
    *   Use the `getGeneralZones()` from `forumMap` to render the "General Forums" section. The title will also come from `terminology.ts`.
3.  **Update Components**:
    *   `ZoneCard.tsx`: Change "Enter Zone" to "Enter Forum".
    *   `PrimaryNav.tsx`: Change "Forum" link to "Forums".
    *   `home.tsx`: Update the carousel to use "Featured Forums".
4.  **Update Breadcrumbs (`ForumBreadcrumbs.tsx`)**: Remove "Zones" from the breadcrumb trail.
5.  **Update Error Messages & Page Titles**: Systematically replace "Zone" with "Forum" in all user-visible error messages, page titles, and meta-descriptions.

### Server-Side Changes

*   **None**. All internal logic, variable names (`zone`, `zones`, `categoryId`), API endpoints (`/api/forum/categories`), and database schemas will remain untouched.

### Validation

1.  Run the application and navigate to the `/forums` page. Verify the new "Featured Forums" and "General Forums" headings.
2.  Click into a forum and check that the breadcrumb does not contain "Zones".
3.  Trigger a 404 error for a non-existent forum and verify the error message says "Forum not found".
4.  Check page titles in the browser tab.
5.  Manually search the client-side codebase for any remaining user-facing instances of "Zone" or "Zones".