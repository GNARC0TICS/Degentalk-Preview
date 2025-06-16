# MVP Forum Setup Guide

## Quick Start (Fresh Database)

```bash
# 1. Reset database (if needed - WARNING: deletes all data)
npm run db:drop
npm run db:push

# 2. Run migrations
npm run db:migrate:Apply

# 3. Sync forum structure from config
npm run sync:forums

# 4. Seed test data
npm run seed:users      # Create test users
npm run seed:threads    # Create sample threads
npm run seed:xp         # Setup XP system
npm run seed:levels     # Setup level system

# 5. Start development server
npm run dev
```

## Troubleshooting

### "users_username_unique" Error
This means you have duplicate usernames. Solutions:
1. Drop and recreate database: `npm run db:drop && npm run db:push`
2. Or manually fix in database studio: `npm run db:studio`

### "sync:forums" Script Not Found
The script was just added. Run:
```bash
npm run seed:forum:new
```

### Forums Have ID = -1
This means forums aren't synced to database. Run:
```bash
npm run sync:forums
```

### "Forum not found" When Creating Thread
Ensure the forum exists in database with proper ID:
```bash
npm run db:studio
# Check forum_categories table for your forum
```

### Zone Page Shows "Error loading threads"
The zone page is trying to load threads but:
1. No threads exist yet - create some via UI or seed
2. Forum IDs aren't synced - run `npm run sync:forums`

## Testing Forum Flow

1. **Navigate to a zone**: http://localhost:5173/zones/market-moves
2. **Click "New Thread"** button
3. **Fill the form**:
   - Title: "Test Thread"
   - Select a forum from dropdown
   - Content: "This is a test"
4. **Submit** - should create thread successfully

## Database Schema Reference

### forum_categories Table
- `id`: Numeric ID (used for thread creation)
- `slug`: URL-friendly identifier
- `type`: 'zone' | 'category' | 'forum'
- `parent_id`: References parent zone/category

### threads Table
- `category_id`: References forum_categories.id (must be type='forum')
- `user_id`: References users.id
- `title`, `slug`, `content`, etc.

## Common API Endpoints

- `GET /api/forum/structure` - Get forum hierarchy
- `GET /api/forum/threads?categoryId=X` - List threads in forum
- `POST /api/forum/threads` - Create new thread
- `GET /api/forum/categories` - List all categories

## Development Tips

1. **Use db:studio** to inspect data: `npm run db:studio`
2. **Check logs** in terminal for API errors
3. **Browser DevTools** Network tab shows API calls
4. **React Query DevTools** shows cached data

## Next Steps After MVP

1. **Add more forums** in `forumMap.config.ts`
2. **Create admin UI** for forum management
3. **Add moderation tools**
4. **Implement thread features** (sticky, lock, solve)
5. **Add real-time updates** with WebSockets 