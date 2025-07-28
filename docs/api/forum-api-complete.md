# 🔥 Complete Forum API Reference

> **Status**: ✅ Production Ready - All endpoints tested and operational

## 🏗️ Base URL Structure

```
Base URL: /api/forum
All responses: { success: boolean, data: any, error?: string }
```

---

## 📊 Forum Structure Endpoints

### Get Complete Forum Structure
```http
GET /api/forum/structure
```

**Response Structure:**
```typescript
{
  success: true,
  data: {
    zones: Forum[],           // All forums (legacy compatibility)
    forums: Forum[],          // All forums
    featured: Forum[],        // Featured forums only (5 themed)
    general: Forum[]          // Non-featured forums
  }
}
```

**Forum Object Schema:**
```typescript
interface Forum {
  id: string;                 // UUID
  name: string;              // "The Pit"
  slug: string;              // "the-pit"
  description: string;       // Forum description
  threadCount: number;       // Aggregated count (includes subforums)
  postCount: number;         // Aggregated count (includes subforums)
  lastPostAt: string;        // ISO timestamp
  isFeatured: boolean;       // Featured forum flag
  themePreset: string;       // "theme-pit", "theme-casino", etc.
  color: string;             // Hex color code
  icon: string;              // Emoji or icon
  children: Forum[];         // Nested subforums
  parentId: string | null;   // Parent forum ID
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "featured": [
      {
        "id": "8c3fb0d5-feac-48be-84a1-6bad294976c2",
        "name": "The Pit",
        "slug": "the-pit",
        "description": "Daily war-zone for raw market chatter",
        "threadCount": 3,
        "postCount": 170,
        "lastPostAt": "2025-07-16T09:51:10.993Z",
        "isFeatured": true,
        "themePreset": "theme-pit",
        "color": "#FF4D00",
        "icon": "🔥",
        "children": [
          {
            "id": "8ac1c67a-7dbf-4198-95e5-ac7df286e246",
            "name": "Live-Trade Reacts",
            "slug": "live-trade-reacts",
            "threadCount": 0,
            "postCount": 0,
            "children": []
          }
        ]
      }
    ]
  }
}
```

---

## 🧵 Thread Endpoints

### Get Thread by Slug
```http
GET /api/forum/threads/slug/{slug}
```

**Parameters:**
- `slug` (string): Thread slug with timestamp suffix

**Response:**
```typescript
interface ThreadDetail {
  id: string;
  title: string;
  slug: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  postCount: number;
  isSticky: boolean;
  isLocked: boolean;
  isSolved: boolean;
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
    role: string;
  };
  forum: {
    id: string;
    name: string;
    slug: string;
    colorTheme: string;
  };
  category: {              // Legacy compatibility
    id: string;
    name: string;
    slug: string;
  };
  tags: Array<{
    id: string;
    name: string;
  }>;
}
```

**Example:**
```http
GET /api/forum/threads/slug/-turned-100-into-10k-my-journey-1752704136114
```

### Get All Threads (Paginated)
```http
GET /api/forum/threads?page=1&limit=20
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `forumId` (string, optional): Filter by forum ID
- `sortBy` (string, optional): 'createdAt' | 'updatedAt' | 'postCount' | 'viewCount'
- `sortOrder` (string, optional): 'asc' | 'desc'

**Response:**
```typescript
{
  success: true,
  data: {
    threads: Thread[],
    pagination: {
      page: number;
      limit: number;
      totalThreads: number;
      totalPages: number;
    }
  }
}
```

### Create Thread
```http
POST /api/forum/threads
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```typescript
{
  title: string;           // Thread title
  content: string;         // Thread content
  forumId: string;        // Target forum UUID
  tags?: string[];        // Optional tags
  isSticky?: boolean;     // Mod/Admin only
}
```

**Response:**
```typescript
{
  success: true,
  data: ThreadDetail
}
```

### Update Thread
```http
PUT /api/forum/threads/{threadId}
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```typescript
{
  title?: string;
  content?: string;
  isSticky?: boolean;     // Mod/Admin only
  isLocked?: boolean;     // Mod/Admin only
  isSolved?: boolean;
}
```

### Delete Thread
```http
DELETE /api/forum/threads/{threadId}
Authorization: Bearer {token}
```

---

## 💬 Post Endpoints

### Get Posts for Thread
```http
GET /api/forum/threads/{threadId}/posts?page=1&limit=20
```

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Posts per page
- `sortOrder` (string, optional): 'asc' | 'desc' (default: 'asc')

**Response:**
```typescript
{
  success: true,
  data: {
    posts: Post[],
    pagination: PaginationInfo
  }
}
```

**Post Object Schema:**
```typescript
interface Post {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isHidden: boolean;
  user: {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
    role: string;
    signature?: string;
    isOnline?: boolean;
    forumStats?: {
      level: number;
      posts: number;
      reputation: number;
    };
  };
  thread: {
    id: string;
    title: string;
    slug: string;
  };
}
```

### Create Post
```http
POST /api/forum/posts
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```typescript
{
  threadId: string;       // Target thread UUID
  content: string;        // Post content
  parentPostId?: string;  // For replies/quotes
}
```

### Update Post
```http
PUT /api/forum/posts/{postId}
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```typescript
{
  content: string;
}
```

### Delete Post
```http
DELETE /api/forum/posts/{postId}
Authorization: Bearer {token}
```

---

## 🔍 Search Endpoints

### Search Forums and Threads
```http
GET /api/forum/search?q={query}&type={type}&page=1&limit=20
```

**Query Parameters:**
- `q` (string): Search query
- `type` (string, optional): 'threads' | 'posts' | 'all' (default: 'all')
- `forumId` (string, optional): Limit search to specific forum
- `page` (number, optional): Page number
- `limit` (number, optional): Results per page

---

## 📈 Statistics Endpoints

### Get Forum Statistics
```http
GET /api/forum/stats
```

**Response:**
```typescript
{
  success: true,
  data: {
    totalThreads: number;
    totalPosts: number;
    totalForums: number;
    activeUsers: number;
    popularThreads: Thread[];
    recentActivity: Activity[];
  }
}
```

### Get Hot Threads
```http
GET /api/forum/threads/hot?limit=10
```

**Response:**
```typescript
{
  success: true,
  data: {
    threads: Array<{
      thread_id: string;
      title: string;
      slug: string;
      post_count: number;
      view_count: number;
      hot_score: number;
      category_slug: string;
      username: string;
      created_at: string;
    }>
  }
}
```

---

## 🔐 Authentication & Permissions

### Required Headers
```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

### Permission Levels
- **Guest**: Read-only access to public forums
- **User**: Create threads/posts, edit own content
- **Moderator**: Edit/delete any content, lock threads
- **Admin**: Full access, manage forums

### Error Responses
```typescript
// Unauthorized
{
  success: false,
  error: "Authentication required",
  code: 401
}

// Forbidden
{
  success: false,
  error: "Insufficient permissions",
  code: 403
}

// Not Found
{
  success: false,
  error: "Thread not found",
  code: 404
}

// Validation Error
{
  success: false,
  error: "Invalid input data",
  code: 422,
  details: {
    field: "title",
    message: "Title is required"
  }
}
```

---

## 🚀 Performance & Caching

### Response Times
- **Forum Structure**: ~50ms (cached)
- **Thread List**: ~100ms (paginated)
- **Thread Detail**: ~75ms
- **Post Creation**: ~150ms

### Rate Limits
- **Read Operations**: 1000 requests/hour
- **Write Operations**: 100 requests/hour
- **Search**: 500 requests/hour

### Caching Strategy
- **Forum Structure**: Cached for 5 minutes
- **Thread Lists**: Cached for 1 minute
- **User Permissions**: Cached for 15 minutes

---

## 🧪 Testing Examples

### cURL Examples

**Get Forum Structure:**
```bash
curl -X GET "http://localhost:5001/api/forum/structure" \
  -H "Accept: application/json"
```

**Get Thread by Slug:**
```bash
curl -X GET "http://localhost:5001/api/forum/threads/slug/-turned-100-into-10k-my-journey-1752704136114" \
  -H "Accept: application/json"
```

**Create Thread:**
```bash
curl -X POST "http://localhost:5001/api/forum/threads" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Market Analysis: BTC vs ETH",
    "content": "Here is my analysis...",
    "forumId": "5e88913d-ec51-44f2-aab5-3cc6e9042bbd"
  }'
```

### JavaScript Examples

**Fetch Forum Structure:**
```javascript
const response = await fetch('/api/forum/structure');
const { data } = await response.json();
console.log('Featured Forums:', data.featured);
```

**Create Post:**
```javascript
const response = await fetch('/api/forum/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    threadId: 'thread-uuid',
    content: 'Great analysis! I agree with your points.'
  })
});
```

---

## 🎯 Production Deployment Notes

### Environment Variables
```bash
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
FORUM_CACHE_TTL=300
```

### Health Check
```http
GET /api/forum/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "cache": "active",
    "uptime": "2h 30m"
  }
}
```

---

## 📚 Related Documentation

- **[Complete Forum System](../forum/COMPLETE_FORUM_SYSTEM.md)** - Full system documentation
- **[Database Schema](../schema/forum-schema.md)** - Database structure details
- **[Frontend Integration](../frontend/forum-components.md)** - React component usage

---

*Last Updated: 2025-07-28*  
*Status: ✅ Production Ready*  
*API Version: 2.0*