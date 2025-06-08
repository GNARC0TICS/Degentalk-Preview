# Forum Structure Setup Guide

This guide provides step-by-step instructions for setting up the Degentalk™™ forum structure.

## Prerequisites

- Node.js installed
- SQLite database configured
- Environment variables set up (.env file)

## Quick Setup

Run the following command to set up the entire forum structure:

```bash
npm run seed:forum:setup
```

This command will:
1. Create all missing database tables
2. Add the `colorTheme` field to forum_categories
3. Seed all canonical zones and categories
4. Verify the setup

## Manual Setup Steps

If you prefer to run each step manually:

### 1. Create Database Tables

```bash
npm run db:create-tables
```

### 2. Add ColorTheme Field

```bash
tsx scripts/db/add-color-theme-field.ts
```

### 3. Seed Forum Structure

```bash
npm run seed:forum
```

### 4. Seed Sample Threads (Optional)

```bash
npm run seed:threads
```

## Testing the API

After setup, test that the forum API is working:

```bash
tsx scripts/test-forum-api.ts
```

This will test:
- `/api/forum/structure` - Returns all zones and categories
- `/api/forum/categories` - Returns categories with stats
- `/api/forum/threads` - Returns thread listings

## Forum Structure Overview

### Primary Zones (Canonical)
These are the main branded forum destinations:

1. **The Pit** (`the-pit`) - Theme: `theme-pit`
   - Raw, unfiltered discussions
   
2. **Mission Control** (`mission-control`) - Theme: `theme-mission`
   - Strategic discussions and project analysis
   
3. **The Casino Floor** (`the-casino-floor`) - Theme: `theme-casino`
   - Trading and gambling discussions
   
4. **The Briefing Room** (`the-briefing-room`) - Theme: `theme-briefing`
   - News and announcements
   
5. **The Archive** (`the-archive`) - Theme: `theme-archive`
   - Historical records and past discussions

### Expandable Categories
These are traditional forum categories with sub-forums:

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

## Troubleshooting

### "Failed to load forum structure" Error

If you see this error in the frontend:

1. Check the server is running: `npm run dev`
2. Verify the database has been seeded: `npm run seed:forum:setup`
3. Test the API endpoint: `curl http://localhost:5001/api/forum/structure`

### "Unexpected token '<'" Error

This usually means the API is returning HTML instead of JSON:

1. Check that the route is properly registered in the server
2. Verify the endpoint URL is correct
3. Check server logs for any errors

### Database Errors

If you get database-related errors:

1. Delete the SQLite database file: `rm sqlite:db/forum.db`
2. Re-run the setup: `npm run seed:forum:setup`

## Development Tips

### Adding New Zones/Categories

1. Update `scripts/db/seed-canonical-zones.ts`
2. Add to either `PRIMARY_ZONES_DATA` or `EXPANDABLE_ZONES_DATA`
3. Re-run the seeding script

### Modifying Schema

1. Update `shared/schema.ts`
2. Create a migration script in `scripts/db/`
3. Update `create-missing-tables.ts` for SQLite
4. Re-run setup

### Testing Changes

Always test your changes:

```bash
# Test API endpoints
tsx scripts/test-forum-api.ts

# Check database content
sqlite3 sqlite:db/forum.db "SELECT name, slug, is_zone, canonical, color_theme FROM forum_categories WHERE is_zone = 1;"
```

## API Endpoints

### GET /api/forum/structure
Returns all forum zones and categories in a flat array.

**Response:**
```json
[
  {
    "id": 1,
    "name": "The Pit",
    "slug": "the-pit",
    "description": "...",
    "isZone": true,
    "canonical": true,
    "colorTheme": "theme-pit",
    ...
  }
]
```

### GET /api/forum/threads
Returns paginated thread listings with filtering options.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 25)
- `categoryId` - Filter by category
- `sort` - Sort by: latest, hot, staked
- `q` - Search query

### GET /api/forum/categories
Returns categories with thread/post statistics.

## Frontend Integration

The frontend uses the `useForumStructure` hook to fetch and organize forum data:

```typescript
import { useForumStructure } from '@/features/forum/hooks/useForumStructure';

function MyComponent() {
  const { primaryZones, categories, isLoading, error } = useForumStructure();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading forum structure</div>;
  
  // Use primaryZones and categories
}
```

## Maintenance

### Regular Tasks

1. **Monitor Performance**: Check query performance as data grows
2. **Backup Database**: Regular SQLite backups
3. **Update Seeds**: Keep seed data relevant and fresh
4. **Clean Old Data**: Archive old threads periodically

### Health Checks

Add these to your monitoring:

- `/api/forum/structure` returns 200 OK
- Database connection is active
- Response times are under 500ms

## Support

If you encounter issues:

1. Check this guide first
2. Review server logs
3. Check the `docs/forum/` directory for additional documentation
4. Create an issue with detailed error information 