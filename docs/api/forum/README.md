# Forum System API

## Legend
| Symbol | Meaning | | Abbrev | Meaning |
|--------|---------|---|--------|---------|
| → | leads to | | API | application programming interface |
| 🔓 | public | | Auth | authentication |
| 🔒 | auth required | | XP | experience points |
| ⚠️ | admin/mod only | | DGT | Degentalk Token |

## Overview

Comprehensive forum system w/ hierarchical structure, threads, posts & advanced moderation features.

**Base Path:** `/api/forum`

## Forum Structure

### Get Forum Structure
```http
GET /api/forum/structure
```

**Response:**
```json
{
  "success": true,
  "data": {
    "zones": [
      {
        "id": "primary",
        "name": "Primary Discussion",
        "description": "Main crypto discussions",
        "colorTheme": "blue",
        "isPrimary": true,
        "forums": [
          {
            "id": "bitcoin-discussion",
            "name": "Bitcoin Discussion",
            "description": "All things Bitcoin",
            "threadCount": 1234,
            "postCount": 5678,
            "lastActivity": "2025-01-01T12:00:00Z",
            "accessLevel": "public"
          }
        ]
      }
    ]
  }
}
```

### Get Zone Statistics
```http
GET /api/forum/zone-stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalThreads": 15420,
    "totalPosts": 89543,
    "activeUsers24h": 342,
    "topForums": [
      {
        "forumId": "bitcoin-discussion",
        "name": "Bitcoin Discussion",
        "activity": 145
      }
    ]
  }
}
```

## Thread Management

### List Threads
```http
GET /api/forum/threads
```

**Query Parameters:**
```
limit=20          # Results per page (max 100)
offset=0          # Pagination offset
sort=latest       # Sort: latest|popular|oldest|replies
forumId=bitcoin   # Filter by forum
zoneId=primary    # Filter by zone
userId=123        # Filter by author
tag=analysis      # Filter by tag
prefix=GUIDE      # Filter by prefix
status=active     # Filter by status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "threads": [
      {
        "id": "th_abc123",
        "title": "Bitcoin Price Analysis Q1 2025",
        "content": "Detailed analysis...",
        "author": {
          "id": 123,
          "username": "cryptoking",
          "level": 15,
          "avatar": "https://cdn.degentalk.com/avatars/123.jpg"
        },
        "forum": {
          "id": "bitcoin-discussion",
          "name": "Bitcoin Discussion",
          "zone": {
            "id": "primary",
            "name": "Primary Discussion",
            "colorTheme": "blue"
          }
        },
        "stats": {
          "views": 1234,
          "replies": 45,
          "likes": 23,
          "tipAmount": 150.50
        },
        "tags": ["analysis", "bitcoin", "Q1"],
        "prefix": "ANALYSIS",
        "isPinned": false,
        "isLocked": false,
        "createdAt": "2025-01-01T00:00:00Z",
        "lastActivity": "2025-01-01T12:00:00Z"
      }
    ]
  },
  "pagination": {
    "total": 1500,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### Get Single Thread
```http
GET /api/forum/threads/:threadId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "thread": {
      "id": "th_abc123",
      "title": "Bitcoin Price Analysis Q1 2025",
      "content": "Detailed analysis of market trends...",
      "contentHtml": "<p>Detailed analysis of market trends...</p>",
      "author": {
        "id": 123,
        "username": "cryptoking",
        "level": 15,
        "reputation": 450,
        "avatar": "https://cdn.degentalk.com/avatars/123.jpg",
        "badges": ["whale", "analyst"]
      },
      "forum": {
        "id": "bitcoin-discussion",
        "name": "Bitcoin Discussion",
        "rules": ["Be respectful", "No spam"],
        "canPost": true,
        "zone": {
          "id": "primary",
          "name": "Primary Discussion",
          "colorTheme": "blue"
        }
      },
      "stats": {
        "views": 1234,
        "replies": 45,
        "likes": 23,
        "dislikes": 2,
        "tipAmount": 150.50,
        "uniqueViewers": 234
      },
      "userInteraction": {
        "hasLiked": false,
        "hasBookmarked": true,
        "hasTipped": false
      },
      "tags": ["analysis", "bitcoin", "Q1"],
      "prefix": "ANALYSIS",
      "isPinned": false,
      "isLocked": false,
      "createdAt": "2025-01-01T00:00:00Z",
      "lastActivity": "2025-01-01T12:00:00Z"
    },
    "posts": [
      {
        "id": "post_def456",
        "content": "Great analysis! I agree with your points...",
        "contentHtml": "<p>Great analysis! I agree with your points...</p>",
        "author": {
          "id": 456,
          "username": "trader99",
          "level": 8,
          "avatar": "https://cdn.degentalk.com/avatars/456.jpg"
        },
        "stats": {
          "likes": 12,
          "tipAmount": 25.00
        },
        "userInteraction": {
          "hasLiked": true,
          "hasTipped": false
        },
        "createdAt": "2025-01-01T01:00:00Z",
        "editedAt": null,
        "parentId": null,
        "depth": 0
      }
    ]
  },
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### Create Thread 🔒
```http
POST /api/forum/threads
```

**Headers:** `Cookie: connect.sid=<session>`

**Body:**
```json
{
  "title": "Bitcoin Price Analysis Q1 2025",
  "content": "Market analysis content here...",
  "forumId": "bitcoin-discussion",
  "tags": ["analysis", "bitcoin"],
  "prefix": "ANALYSIS",
  "isPinned": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "threadId": "th_abc123",
    "title": "Bitcoin Price Analysis Q1 2025",
    "slug": "bitcoin-price-analysis-q1-2025",
    "url": "/zones/primary/bitcoin-discussion/th_abc123",
    "xpAwarded": 25,
    "dgtAwarded": 2.50
  }
}
```

**XP Rewards:**
- Thread creation: 25 XP
- DGT bonus: 10% of XP value

### Update Thread 🔒
```http
PATCH /api/forum/threads/:threadId
```

**Headers:** `Cookie: connect.sid=<session>`

**Body:**
```json
{
  "title": "Updated Bitcoin Analysis Q1 2025",
  "content": "Updated analysis...",
  "tags": ["analysis", "bitcoin", "updated"],
  "prefix": "ANALYSIS"
}
```

**Permissions:** Thread author or moderator+

### Delete Thread ⚠️
```http
DELETE /api/forum/threads/:threadId
```

**Headers:** `Cookie: connect.sid=<session>`

**Permissions:** Thread author (within 1 hour) or moderator+

## Post Management

### Create Post 🔒
```http
POST /api/forum/posts
```

**Headers:** `Cookie: connect.sid=<session>`

**Body:**
```json
{
  "threadId": "th_abc123",
  "content": "Great analysis! I think Bitcoin will...",
  "parentId": null,
  "mentionedUsers": ["@cryptoking", "@trader99"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "postId": "post_def456",
    "threadId": "th_abc123",
    "url": "/zones/primary/bitcoin-discussion/th_abc123#post_def456",
    "xpAwarded": 10,
    "dgtAwarded": 1.00,
    "mentionNotifications": 2
  }
}
```

**XP Rewards:**
- Post creation: 10 XP
- First post in thread: +5 XP bonus

### Update Post 🔒
```http
PATCH /api/forum/posts/:postId
```

**Body:**
```json
{
  "content": "Updated post content..."
}
```

**Permissions:** Post author (within 24 hours) or moderator+

### Delete Post 🔒
```http
DELETE /api/forum/posts/:postId
```

**Permissions:** Post author (within 1 hour) or moderator+

## Interactions

### Like/Unlike Thread or Post 🔒
```http
POST /api/forum/:type/:id/like
DELETE /api/forum/:type/:id/like
```

**Path Parameters:**
- `type`: `threads` or `posts`
- `id`: Thread or post ID

**Response:**
```json
{
  "success": true,
  "data": {
    "liked": true,
    "totalLikes": 24,
    "xpAwarded": 1,
    "authorXpAwarded": 2
  }
}
```

**XP Rewards:**
- Like action: 1 XP
- Receiving like: 2 XP

### Tip User 🔒
```http
POST /api/forum/:type/:id/tip
```

**Body:**
```json
{
  "amount": 50.00,
  "message": "Great analysis!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tipId": "tip_ghi789",
    "amount": 50.00,
    "recipientId": 123,
    "message": "Great analysis!",
    "xpAwarded": 5,
    "recipientXpAwarded": 10
  }
}
```

### Bookmark Thread 🔒
```http
POST /api/forum/bookmarks
DELETE /api/forum/bookmarks/:threadId
```

**Body (POST):**
```json
{
  "threadId": "th_abc123",
  "note": "Important analysis to review"
}
```

### Get User Bookmarks 🔒
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
        "id": "bm_jkl012",
        "thread": {
          "id": "th_abc123",
          "title": "Bitcoin Analysis",
          "forum": "bitcoin-discussion"
        },
        "note": "Important analysis",
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ]
  }
}
```

## Search & Discovery

### Search Content
```http
GET /api/forum/search
```

**Query Parameters:**
```
q=bitcoin analysis        # Search query
type=threads             # Content type: threads|posts|users
forumId=bitcoin          # Filter by forum
userId=123               # Filter by author
dateFrom=2025-01-01      # Date range
dateTo=2025-01-31        # Date range
sort=relevance           # Sort: relevance|date|popularity
limit=20                 # Results per page
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "type": "thread",
        "id": "th_abc123",
        "title": "Bitcoin Price Analysis Q1 2025",
        "snippet": "...detailed analysis of market trends...",
        "relevanceScore": 0.95,
        "author": "cryptoking",
        "forum": "bitcoin-discussion",
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ],
    "facets": {
      "forums": {
        "bitcoin-discussion": 15,
        "altcoin-discussion": 8
      },
      "authors": {
        "cryptoking": 5,
        "trader99": 3
      }
    }
  },
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0
  }
}
```

### Get Trending Content
```http
GET /api/forum/trending
```

**Query Parameters:**
```
period=24h          # Time period: 1h|24h|7d|30d
type=threads        # Content type
limit=10            # Number of results
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trending": [
      {
        "id": "th_abc123",
        "title": "Bitcoin Analysis",
        "score": 250.5,
        "stats": {
          "views": 1234,
          "replies": 45,
          "likes": 23
        },
        "trendReason": "High engagement rate"
      }
    ]
  }
}
```

## Moderation Features ⚠️

### Pin/Unpin Thread
```http
PATCH /api/forum/threads/:threadId/pin
PATCH /api/forum/threads/:threadId/unpin
```

**Permissions:** Moderator+

### Lock/Unlock Thread
```http
PATCH /api/forum/threads/:threadId/lock
PATCH /api/forum/threads/:threadId/unlock
```

**Body:**
```json
{
  "reason": "Off-topic discussion"
}
```

### Move Thread
```http
PATCH /api/forum/threads/:threadId/move
```

**Body:**
```json
{
  "targetForumId": "general-discussion",
  "reason": "Better suited for general discussion"
}
```

### Hide/Show Content
```http
PATCH /api/forum/:type/:id/hide
PATCH /api/forum/:type/:id/show
```

**Body:**
```json
{
  "reason": "Violates community guidelines",
  "notifyAuthor": true
}
```

## User Management Features

### Get User Profile
```http
GET /api/forum/users/:userId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "username": "cryptoking",
      "displayName": "Crypto King",
      "avatar": "https://cdn.degentalk.com/avatars/123.jpg",
      "level": 15,
      "xp": 8750,
      "reputation": 450,
      "badges": ["whale", "analyst", "early-adopter"],
      "stats": {
        "totalThreads": 45,
        "totalPosts": 234,
        "totalLikes": 567,
        "joinDate": "2024-01-01T00:00:00Z",
        "lastActivity": "2025-01-01T12:00:00Z"
      },
      "forumActivity": {
        "favoriteForums": [
          {
            "forumId": "bitcoin-discussion",
            "postCount": 123
          }
        ],
        "recentThreads": [
          {
            "id": "th_abc123",
            "title": "Bitcoin Analysis",
            "createdAt": "2025-01-01T00:00:00Z"
          }
        ]
      }
    }
  }
}
```

### Search Users
```http
GET /api/forum/users/search
```

**Query Parameters:**
```
q=crypto              # Username search
limit=10              # Results limit
includeStats=true     # Include user stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 123,
        "username": "cryptoking",
        "avatar": "https://cdn.degentalk.com/avatars/123.jpg",
        "level": 15,
        "reputation": 450,
        "lastActivity": "2025-01-01T12:00:00Z"
      }
    ]
  }
}
```

## Forum Configuration

### Get Available Tags
```http
GET /api/forum/tags
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tags": [
      {
        "name": "analysis",
        "count": 234,
        "trending": true
      },
      {
        "name": "bitcoin",
        "count": 567,
        "trending": false
      }
    ]
  }
}
```

### Get Thread Prefixes
```http
GET /api/forum/prefixes
```

**Response:**
```json
{
  "success": true,
  "data": {
    "prefixes": [
      {
        "code": "ANALYSIS",
        "label": "Analysis",
        "color": "#0066cc",
        "forumRestrictions": ["bitcoin-discussion"]
      },
      {
        "code": "GUIDE",
        "label": "Guide",
        "color": "#009900",
        "forumRestrictions": []
      }
    ]
  }
}
```

## Rate Limiting & Security

### Rate Limits
- **Thread creation:** 5 per hour per user
- **Post creation:** 30 per hour per user
- **Likes:** 100 per hour per user
- **Search:** 60 per minute per IP

### Content Validation
- **Thread titles:** 5-200 characters
- **Post content:** 1-50,000 characters
- **Tags:** Max 5 per thread, 3-20 chars each
- **Mentions:** Max 10 per post

### Security Features
- **Content sanitization** prevents XSS
- **Rate limiting** prevents spam
- **Permission checks** on all operations
- **Audit logging** for moderation actions

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| `FORUM_001` | Forum not found | Invalid forum ID |
| `FORUM_002` | Thread not found | Invalid thread ID |
| `FORUM_003` | Post not found | Invalid post ID |
| `FORUM_004` | Access denied | Insufficient permissions |
| `FORUM_005` | Content too long | Exceeds character limit |
| `FORUM_006` | Rate limit exceeded | Too many operations |
| `FORUM_007` | Thread locked | Cannot post to locked thread |
| `FORUM_008` | Invalid tags | Tag validation failed |

---

**📚 Documentation:** `/docs/api/forum/README.md`

**Related:**
- [XP System API](../xp/README.md)
- [Moderation Tools](../admin/moderation.md)
- [Content Management](../admin/content.md)