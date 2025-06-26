# Forum API

The Forum system manages threads, posts, categories, and user interactions across the Degentalk platform.

## Base URLs

```
/api/forum/threads    # Thread management
/api/forum/posts      # Post operations
/api/forum/categories # Forum categories
/api/forum/bookmarks  # User bookmarks
```

## Authentication

Most forum endpoints are public for reading, but require authentication for creating, editing, or interacting with content.

## Data Models

### Thread

```typescript
interface Thread {
  id: number;
  title: string;
  slug: string;
  content: string;          // OP content
  categoryId: number;
  authorId: number;
  viewCount: number;
  postCount: number;
  isLocked: boolean;
  isPinned: boolean;
  isSolved: boolean;
  solvingPostId?: number;
  hotScore: number;         // Trending algorithm score
  lastPostAt: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  author: User;
  category: Category;
  posts: Post[];
  tags: Tag[];
  prefix?: ThreadPrefix;
}
```

### Post

```typescript
interface Post {
  id: number;
  content: string;
  threadId: number;
  authorId: number;
  parentPostId?: number;    // For nested replies
  likeCount: number;
  isEdited: boolean;
  editReason?: string;
  isHidden: boolean;        // Moderation
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  author: User;
  thread: Thread;
  parentPost?: Post;
  replies: Post[];
  likes: PostLike[];
  hasLiked?: boolean;       // User-specific
}
```

### Category (Forum)

```typescript
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;        // For subcategories
  isPublic: boolean;
  requiredLevel: number;    // Minimum XP level
  threadCount: number;
  postCount: number;
  lastPostAt?: Date;
  colorTheme: string;       // pit, casino, briefing, etc.
  icon?: string;
  order: number;
  
  // Relations
  parent?: Category;
  children: Category[];
  threads: Thread[];
}
```

### User (Forum Context)

```typescript
interface ForumUser {
  id: number;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  isVerified: boolean;
  reputation: number;
  level: number;
  xp: number;
  postCount: number;
  threadCount: number;
  likeCount: number;
  joinedAt: Date;
  lastActiveAt: Date;
  signature?: string;
  customTitle?: string;
  role: 'user' | 'moderator' | 'admin';
}
```

## Thread Endpoints

### Get Threads

Retrieve threads with filtering, sorting, and pagination.

```http
GET /api/forum/threads
```

**Query Parameters:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `categoryId` - Filter by category
- `sortBy` - Sort option (`newest`, `oldest`, `hot`, `trending`, `replies`, `views`)
- `search` - Search term for title/content
- `pinned` - Show only pinned threads (`true`/`false`)
- `solved` - Filter by solved status (`true`/`false`/`unsolved`)
- `tags` - Filter by tags (comma-separated)

**Examples:**

```http
# Latest threads
GET /api/forum/threads?sortBy=newest&limit=25

# Hot threads in specific category
GET /api/forum/threads?categoryId=5&sortBy=hot

# Search with pagination
GET /api/forum/threads?search=bitcoin&page=2&limit=10

# Unsolved questions
GET /api/forum/threads?solved=false&categoryId=1
```

**Response:**

```json
{
  "success": true,
  "data": {
    "threads": [
      {
        "id": 123,
        "title": "Best DeFi strategies for 2024",
        "slug": "best-defi-strategies-2024",
        "categoryId": 5,
        "authorId": 456,
        "viewCount": 1250,
        "postCount": 34,
        "isLocked": false,
        "isPinned": true,
        "isSolved": false,
        "hotScore": 87.5,
        "lastPostAt": "2024-01-15T14:30:00Z",
        "createdAt": "2024-01-10T09:00:00Z",
        "author": {
          "id": 456,
          "username": "cryptoguru",
          "displayName": "Crypto Guru",
          "avatarUrl": "/avatars/456.jpg",
          "isVerified": true,
          "level": 15,
          "reputation": 2840
        },
        "category": {
          "id": 5,
          "name": "DeFi Discussion",
          "slug": "defi-discussion",
          "colorTheme": "pit"
        },
        "tags": ["defi", "strategy", "2024"],
        "engagement": {
          "totalTips": 150.5,
          "uniqueTippers": 12,
          "momentum": "bullish"
        }
      }
    ],
    "total": 1543,
    "totalPages": 78
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1543,
    "totalPages": 78
  }
}
```

### Get Thread by ID

```http
GET /api/forum/threads/:id
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "Best DeFi strategies for 2024",
    "content": "<p>Looking for community insights on...</p>",
    "author": { /* User object */ },
    "category": { /* Category object */ },
    "posts": [
      {
        "id": 789,
        "content": "<p>Great question! I recommend...</p>",
        "authorId": 321,
        "likeCount": 15,
        "hasLiked": false,
        "createdAt": "2024-01-10T10:15:00Z",
        "author": { /* User object */ }
      }
    ],
    "tags": ["defi", "strategy"],
    "viewCount": 1251,
    "postCount": 34
  }
}
```

### Get Thread by Slug

```http
GET /api/forum/threads/slug/:slug
```

Automatically increments view count when accessed.

### Create Thread

```http
POST /api/forum/threads
```

**Request Body:**

```json
{
  "title": "New Thread Title",
  "content": "<p>Thread content in HTML format</p>",
  "categoryId": 5,
  "tags": ["defi", "help"],
  "prefix": "QUESTION"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 124,
    "title": "New Thread Title",
    "slug": "new-thread-title",
    "authorId": 789,
    "categoryId": 5,
    "createdAt": "2024-01-15T16:00:00Z"
  }
}
```

### Update Thread Solution

Mark a thread as solved by specifying which post solved it.

```http
PUT /api/forum/threads/:threadId/solve
```

**Request Body:**

```json
{
  "solvingPostId": 456
}
```

### Thread Tags

#### Add Tags

```http
POST /api/forum/threads/:threadId/tags
```

**Request Body:**

```json
{
  "tags": ["new-tag", "another-tag"]
}
```

#### Get Thread Tags

```http
GET /api/forum/threads/:threadId/tags
```

#### Remove Tag

```http
DELETE /api/forum/threads/:threadId/tags/:tagId
```

### Search Threads

```http
GET /api/forum/threads/search
```

**Query Parameters:**

- `q` - Search query
- `categoryId` - Limit to category
- `authorId` - Limit to author
- `minReplies` - Minimum reply count
- `maxAge` - Maximum age in days
- `tags` - Required tags

## Post Endpoints

### Create Post (Reply)

```http
POST /api/forum/posts
```

**Request Body:**

```json
{
  "threadId": 123,
  "content": "<p>My reply content</p>",
  "replyToPostId": 456,
  "editorState": { /* Rich editor state */ }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 789,
    "content": "<p>My reply content</p>",
    "threadId": 123,
    "authorId": 321,
    "parentPostId": 456,
    "createdAt": "2024-01-15T16:30:00Z"
  }
}
```

### Update Post

```http
PUT /api/forum/posts/:id
```

**Request Body:**

```json
{
  "content": "<p>Updated post content</p>",
  "editReason": "Fixed typo"
}
```

### Delete Post

```http
DELETE /api/forum/posts/:id
```

### React to Post

```http
POST /api/forum/posts/:postId/react
```

**Request Body:**

```json
{
  "reactionType": "like"
}
```

For removing a like, use:

```json
{
  "reactionType": "dislike"
}
```

### Tip Post

```http
POST /api/forum/posts/:postId/tip
```

**Request Body:**

```json
{
  "amount": 10.5
}
```

Sends DGT tokens to the post author.

### Get Post Replies

```http
GET /api/forum/posts/:postId/replies
```

Returns nested replies to a specific post.

## Category Endpoints

### Get All Categories

```http
GET /api/forum/categories
```

**Query Parameters:**

- `includeStats` - Include thread/post counts (`true`/`false`)
- `userLevel` - Filter by user's access level
- `parentId` - Get subcategories only

**Response:**

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "The Pit",
        "slug": "the-pit",
        "description": "Main trading discussions",
        "colorTheme": "pit",
        "icon": "🔥",
        "threadCount": 1543,
        "postCount": 15670,
        "lastPostAt": "2024-01-15T16:30:00Z",
        "requiredLevel": 0,
        "children": [
          {
            "id": 2,
            "name": "Day Trading",
            "slug": "day-trading",
            "parentId": 1
          }
        ]
      }
    ]
  }
}
```

### Get Category by ID

```http
GET /api/forum/categories/:id
```

### Get Category by Slug

```http
GET /api/forum/categories/slug/:slug
```

## Bookmark Endpoints

### Get User Bookmarks

```http
GET /api/forum/bookmarks
```

**Response:**

```json
{
  "success": true,
  "data": {
    "bookmarks": [
      {
        "id": 123,
        "threadId": 456,
        "userId": 789,
        "createdAt": "2024-01-15T16:30:00Z",
        "thread": {
          "id": 456,
          "title": "Bookmarked Thread",
          "slug": "bookmarked-thread"
        }
      }
    ]
  }
}
```

### Add Bookmark

```http
POST /api/forum/bookmarks
```

**Request Body:**

```json
{
  "threadId": 456
}
```

### Remove Bookmark

```http
DELETE /api/forum/bookmarks/:threadId
```

## Forum Features

### Thread Prefixes

Threads can have visual prefixes:

- `QUESTION` - Help requests
- `DISCUSSION` - General discussions
- `GUIDE` - Tutorial content
- `NEWS` - Platform announcements
- `SOLVED` - Resolved questions

### Hot Score Algorithm

Threads are ranked by hot score based on:

- **Recent activity**: New posts boost score
- **Engagement**: Likes, tips, bookmarks
- **View velocity**: Rapid view increases
- **User quality**: High-level user interactions
- **Time decay**: Older threads lose heat

### Thread States

- **Pinned**: Moderator-promoted threads
- **Locked**: No new replies allowed
- **Solved**: Question has been answered
- **Hidden**: Moderator-hidden content

### Access Control

Categories can restrict access by:

- **User level**: Minimum XP level required
- **Role**: Admin/moderator only sections
- **Reputation**: High-reputation user areas

## Sorting Options

### Thread Sorting

| Sort | Description | Algorithm |
|------|-------------|-----------|
| `newest` | Latest created threads | ORDER BY created_at DESC |
| `oldest` | Oldest threads first | ORDER BY created_at ASC |
| `hot` | Trending content | ORDER BY hot_score DESC |
| `trending` | Rising discussions | Custom trending algorithm |
| `replies` | Most replies | ORDER BY post_count DESC |
| `views` | Most viewed | ORDER BY view_count DESC |
| `recent` | Recent activity | ORDER BY last_post_at DESC |

### Post Sorting

- **Chronological**: Default post order
- **Best**: Highest liked posts first
- **Controversial**: Mixed like/dislike ratio

## Moderation Features

### Thread Moderation

- **Lock/Unlock**: Prevent new replies
- **Pin/Unpin**: Promote important content
- **Move**: Transfer to different category
- **Hide/Show**: Moderate inappropriate content

### Post Moderation

- **Hide/Show**: Moderate specific posts
- **Edit**: Admin/moderator corrections
- **Delete**: Remove spam/inappropriate content

## Rate Limiting

Forum endpoints have specific rate limits:

- **Thread creation**: 5 threads/hour per user
- **Post creation**: 30 posts/hour per user
- **Reactions**: 60 reactions/minute per user
- **Search**: 30 searches/minute per user

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `THREAD_NOT_FOUND` | 404 | Thread does not exist |
| `POST_NOT_FOUND` | 404 | Post does not exist |
| `CATEGORY_NOT_FOUND` | 404 | Category does not exist |
| `INSUFFICIENT_LEVEL` | 403 | User level too low for category |
| `THREAD_LOCKED` | 403 | Cannot post to locked thread |
| `RATE_LIMITED` | 429 | Too many requests |
| `CONTENT_TOO_LONG` | 400 | Content exceeds length limits |
| `INVALID_CATEGORY` | 400 | Category not accessible |

## Integration Examples

### Frontend Thread List

```typescript
import { useQuery } from '@tanstack/react-query';

interface ThreadListParams {
  categoryId?: number;
  sortBy?: string;
  page?: number;
}

function useThreads(params: ThreadListParams) {
  return useQuery({
    queryKey: ['threads', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.categoryId) searchParams.set('categoryId', params.categoryId.toString());
      if (params.sortBy) searchParams.set('sortBy', params.sortBy);
      if (params.page) searchParams.set('page', params.page.toString());
      
      const response = await fetch(`/api/forum/threads?${searchParams}`);
      return response.json();
    },
    staleTime: 30000 // Cache for 30 seconds
  });
}
```

### Backend Thread Creation

```typescript
// Create thread with XP reward
export async function createThread(threadData: CreateThreadRequest, userId: number) {
  // Create the thread
  const thread = await threadService.createThread({
    ...threadData,
    authorId: userId
  });
  
  // Award XP for thread creation
  await fetch('/api/xp/award-action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      action: 'thread_created',
      entityId: thread.id
    })
  });
  
  return thread;
}
```

### Real-time Updates

```typescript
// WebSocket integration for live thread updates
const socket = new WebSocket('ws://localhost:5001/forum');

socket.on('thread:new_post', (data) => {
  // Update thread post count
  queryClient.setQueryData(['thread', data.threadId], (old: Thread) => ({
    ...old,
    postCount: old.postCount + 1,
    lastPostAt: data.createdAt
  }));
});
```