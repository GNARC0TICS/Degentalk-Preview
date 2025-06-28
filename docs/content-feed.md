---
title: content feed
status: STABLE
updated: 2025-06-28
---

# Content Feed System

Tab-based content system for home page and forum views with backend-powered filtering.

## API Endpoint

### `GET /api/content`

Unified endpoint for fetching tab-based thread content.

**Query Parameters:**
- `tab` - Content type: `trending` | `recent` | `following`
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 50)
- `forumId` - Optional forum ID to restrict content to specific forum

**Response:**
```json
{
  "items": [
    {
      "id": 123,
      "title": "Thread title",
      "slug": "thread-slug", 
      "user": { "username": "author", "avatarUrl": "..." },
      "category": { "name": "Forum", "slug": "forum-slug" },
      "postCount": 5,
      "viewCount": 100,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "hasMore": true,
    "total": 150,
    "page": 1
  }
}
```

**Tab Behaviors:**
- `trending` - Hot score algorithm (views*0.3 + posts*0.7) * recency decay
- `recent` - Latest posts, sorted by creation date
- `following` - Content from followed users (requires auth)

## Frontend Components

### `useContent()` Hook

React Query hook for fetching tab content with caching and error handling.

```tsx
import { useContent, useHomeContent, useForumContent } from '@/hooks/use-content';

// Generic usage
const { items, activeTab, switchTab, isLoading } = useContent({
  initialTab: 'trending',
  forumId: 123 // optional
});

// Home page specific
const content = useHomeContent('trending');

// Forum page specific  
const content = useForumContent(forumId, 'recent');
```

### `<ContentArea>` Component

Unified component combining tab switcher and content feed.

```tsx
import { ContentArea, HomeContentArea, ForumContentArea } from '@/components/ui/content-area';

// Generic
<ContentArea forumId={123} initialTab="recent" />

// Pre-configured for home
<HomeContentArea />

// Pre-configured for forums
<ForumContentArea forumId={123} />
```

## Caching Strategy

**Backend (60s TTL):**
- In-memory cache with different TTLs per tab
- `trending`: 60s, `recent`: 30s, `following`: 45s
- Cache keys: `{tab}:{forumId}:{page}:{limit}:{userId}`

**Frontend (React Query):**
- 30s stale time, 1 minute auto-refresh
- Error retry (2x max, no retry for auth errors)
- Query keys: `['content', tab, forumId || 'all']`

## Usage Examples

### Replace existing HotThreads:
```tsx
// Before
<HotThreads variant="feed" limit={5} />

// After  
<HomeContentArea className="mb-8" />
```

### Add to forum pages:
```tsx
<ForumContentArea forumId={forum.id} />
```

### Custom configuration:
```tsx
<ContentArea 
  forumId={123}
  initialTab="following"
  showCategory={false}
  variant="compact"
/>
```