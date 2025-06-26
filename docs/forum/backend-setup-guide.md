# Backend Setup Guide for Canonical Zones

## Overview

This guide covers how to set up the backend to support the new canonical zone structure for Degentalk forums. Follow these steps to ensure your backend can serve the new frontend components.

## Prerequisites

Ensure you have:

- Node.js v16+ installed
- Access to your database
- Proper environment variables set up

## Database Migration

1. **Apply the Schema Changes**

   First, run the database migration to add the necessary fields to the `forum_categories` table:

   ```bash
   npm run db:migrate
   ```

   This will add the following fields:
   - `isZone` (boolean): Indicates if this is a Primary Zone
   - `canonical` (boolean): Identifies canonical zones for special UI
   - `threadsCount`, `postsCount`: Performance optimized counters
   - `lastThreadId`: Reference to most recent thread

2. **Seed the Canonical Zones**

   Next, populate the database with the predefined canonical zone structure:

   ```bash
   npx tsx scripts/db/seed-canonical-zones.ts
   ```

   Or run both steps at once with:

   ```bash
   npm run setup:canonical-zones
   ```

## API Endpoints

The following API endpoints have been implemented to support the new structure:

- `GET /api/forums/primary-zones`: Returns all Primary Zones
- `GET /api/forums/categories`: Returns all top-level categories
- `GET /api/forums/structure`: Returns complete forum structure
- `GET /api/forums/:slug`: Returns specific forum/zone/category
- `GET /api/forums/:forumId/threads`: Returns threads for a specific forum

Ensure your server has these routes properly registered at `server/src/domains/forum/routes.ts`.

## Schema Field Usage

When returning forum entities to the frontend:

- `isZone`: Must be set to `true` for Primary Zones
- `canonical`: Must be set to `true` for canonical zones to be displayed prominently
- `colorTheme`/`color`: Used for styling Primary Zones
- `icon`: Used to display an icon in the zone card/header

## Updating Existing Data

If you have existing forum categories, you can manually update them using:

```sql
-- Convert a category to a Primary Zone
UPDATE forum_categories
SET is_zone = true, canonical = true, color = 'mission'
WHERE slug = 'your-category-slug';
```

## Performance Considerations

The new schema includes counter fields to avoid expensive JOIN operations:

- Update `threadsCount` and `postsCount` whenever a thread or post is created/deleted
- Set `lastThreadId` whenever a new thread is created in a forum

Example trigger:

```sql
CREATE OR REPLACE FUNCTION update_forum_thread_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_categories
    SET threads_count = threads_count + 1,
        last_thread_id = NEW.id::text
    WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_categories
    SET threads_count = threads_count - 1
    WHERE id = OLD.category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER thread_count_trigger
AFTER INSERT OR DELETE ON threads
FOR EACH ROW EXECUTE FUNCTION update_forum_thread_count();
```

## Troubleshooting

**Issue**: Zone colors not displaying
- Ensure the `color` field is populated with valid theme names: 'pit', 'mission', 'casino', 'briefing', 'archive'

**Issue**: Zones not showing on homepage
- Verify both `isZone` AND `canonical` are set to true

**Issue**: Child forums not appearing under categories
- Check that `parentId` correctly links to the parent category
- Ensure the API is responding with nested structure

## Extending the Structure

To add new Primary Zones:

1. Add the zone details to the `PRIMARY_ZONES` array in `scripts/db/seed-canonical-zones.ts`
2. Add the corresponding styling in `client/src/styles/zone-themes.css`
3. Re-run the seeding script 