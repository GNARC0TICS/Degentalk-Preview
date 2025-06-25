# XP System API

The XP (Experience Points) system manages user progression, levels, and action-based rewards throughout the DegenTalk platform.

## Base URL

```
/api/xp
```

## Authentication

All XP endpoints require authentication. Users can only access their own XP data unless they have admin privileges.

## Data Models

### XP Action

```typescript
interface XpAction {
  key: string;           // Action identifier (e.g., 'post_created')
  baseValue: number;     // Base XP awarded
  description: string;   // Human-readable description
  maxPerDay?: number;    // Daily limit (optional)
  cooldownSeconds?: number; // Cooldown between awards
  enabled: boolean;      // Whether action is active
}
```

### XP Action Log

```typescript
interface XpActionLog {
  id: number;
  userId: number;
  action: string;        // XP_ACTION enum value
  xpAwarded: number;
  metadata?: any;        // Additional context
  createdAt: Date;
}
```

### User XP Info

```typescript
interface UserXpInfo {
  userId: number;
  currentXp: number;
  currentLevel: number;
  xpForNextLevel: number;
  xpProgress: number;    // Percentage to next level (0-100)
  totalXpEarned: number;
  levelHistory: Array<{
    level: number;
    achievedAt: Date;
  }>;
}
```

## Available XP Actions

| Action | Base XP | Description | Daily Limit | Cooldown |
|--------|---------|-------------|-------------|----------|
| `post_created` | 10 | Created a forum post | 100 posts | None |
| `thread_created` | 30 | Started a new thread | None | None |
| `received_like` | 5 | Received a like on content | 50 likes | None |
| `daily_login` | 5 | Daily login bonus | 1 | 24 hours |
| `user_mentioned` | 2 | Mentioned another user | 20 mentions | None |
| `reply_received` | 3 | Received reply to content | 50 replies | None |
| `profile_completed` | 50 | Completed user profile | 1 | 7 days |
| `frame_equipped` | 5 | Equipped avatar frame | None | None |

## Endpoints

### Award XP for Action

Awards XP to a user for performing a specific action.

```http
POST /api/xp/award-action
```

**Request Body:**

```json
{
  "userId": 123,
  "action": "post_created",
  "entityId": 456
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "xpAwarded": 10,
    "newTotalXp": 1250,
    "leveledUp": false,
    "currentLevel": 5
  }
}
```

**Level Up Response:**

```json
{
  "success": true,
  "data": {
    "xpAwarded": 30,
    "newTotalXp": 1500,
    "leveledUp": true,
    "currentLevel": 6,
    "previousLevel": 5
  }
}
```

### Get User XP Information

Retrieves comprehensive XP information for a user.

```http
GET /api/xp/user/:userId
```

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": 123,
    "currentXp": 1250,
    "currentLevel": 5,
    "xpForNextLevel": 250,
    "xpProgress": 83.3,
    "totalXpEarned": 1250,
    "levelHistory": [
      {
        "level": 1,
        "achievedAt": "2024-01-01T00:00:00Z"
      },
      {
        "level": 5,
        "achievedAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### Get Available XP Actions

Returns all XP actions and their configurations.

```http
GET /api/xp/actions
```

**Response:**

```json
{
  "success": true,
  "data": {
    "actions": [
      "post_created",
      "thread_created",
      "received_like",
      "daily_login",
      "user_mentioned",
      "reply_received",
      "profile_completed",
      "frame_equipped"
    ]
  }
}
```

### Get User XP Logs

Retrieves XP award history for a user with filtering options.

```http
GET /api/xp/logs/:userId?
```

**Query Parameters:**

- `limit` - Number of logs to return (default: 50, max: 100)
- `offset` - Pagination offset (default: 0)
- `action` - Filter by specific action type
- `period` - Filter by time period (`today`, `week`, `month`)
- `startDate` - Filter from date (ISO 8601)
- `endDate` - Filter to date (ISO 8601)

**Examples:**

```http
# Get recent logs for authenticated user
GET /api/xp/logs

# Get logs for specific user (admin only)
GET /api/xp/logs/123

# Filter by action type
GET /api/xp/logs?action=post_created&limit=25

# Filter by time period
GET /api/xp/logs?period=week

# Custom date range
GET /api/xp/logs?startDate=2024-01-01&endDate=2024-01-31
```

**Response:**

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": 1001,
        "userId": 123,
        "action": "post_created",
        "xpAwarded": 10,
        "metadata": {
          "postId": 456,
          "threadId": 789
        },
        "createdAt": "2024-01-15T14:30:00Z"
      }
    ],
    "pagination": {
      "total": 250,
      "limit": 50,
      "offset": 0,
      "hasMore": true
    },
    "filters": {
      "action": "post_created",
      "period": null,
      "startDate": null,
      "endDate": null
    }
  }
}
```

### Award XP (Legacy)

Legacy endpoint for awarding XP. Use `/award-action` for new implementations.

```http
POST /api/xp/award
```

**Request Body:**

```json
{
  "userId": 123,
  "action": "post_created",
  "metadata": {
    "postId": 456
  }
}
```

## Level System

### Level Calculation

XP requirements follow an exponential curve:

```typescript
// Level 1: 0 XP
// Level 2: 100 XP
// Level 3: 250 XP
// Level 4: 450 XP
// Level 5: 700 XP
// etc.

function calculateXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(50 * level * (level - 1));
}
```

### Level Benefits

Higher levels unlock:

- **Level 5**: Custom avatar frames
- **Level 10**: Signature privileges
- **Level 15**: Thread pinning abilities
- **Level 20**: Moderator nomination eligibility
- **Level 25**: Special zone access
- **Level 30**: Custom profile themes

## XP Multipliers

XP can be modified by:

- **Forum multipliers**: Different zones award different XP rates
- **Time bonuses**: Weekend/event multipliers
- **Streak bonuses**: Consecutive daily activity
- **Quality bonuses**: Highly-liked content
- **Community multipliers**: Contributions to specific forums

## Rate Limiting

XP award endpoints have specific rate limits:

- **Award endpoints**: 20 requests/minute per user
- **Query endpoints**: 60 requests/minute per user
- **Admin endpoints**: 100 requests/minute

## Daily Limits

Some actions have daily XP limits to prevent abuse:

- **Post creation**: 100 posts = 1000 XP max/day
- **Received likes**: 50 likes = 250 XP max/day
- **User mentions**: 20 mentions = 40 XP max/day
- **Reply rewards**: 50 replies = 150 XP max/day

## Events and Webhooks

### XP Events

The system emits events for:

- `xp.awarded` - XP granted to user
- `xp.level_up` - User reached new level
- `xp.milestone` - Significant XP milestones

### Webhook Payload

```json
{
  "event": "xp.level_up",
  "userId": 123,
  "data": {
    "previousLevel": 4,
    "newLevel": 5,
    "totalXp": 700,
    "timestamp": "2024-01-15T14:30:00Z"
  }
}
```

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `XP_ACTION_NOT_FOUND` | 400 | Invalid action type |
| `XP_DAILY_LIMIT_REACHED` | 429 | User hit daily XP limit |
| `XP_COOLDOWN_ACTIVE` | 429 | Action on cooldown |
| `XP_ACTION_DISABLED` | 400 | Action temporarily disabled |
| `XP_USER_NOT_FOUND` | 404 | User does not exist |
| `XP_INSUFFICIENT_PERMISSIONS` | 403 | Cannot access other user's data |

## Integration Examples

### Frontend XP Display

```typescript
import { useQuery } from '@tanstack/react-query';

function useUserXp(userId: number) {
  return useQuery({
    queryKey: ['xp', userId],
    queryFn: () => fetch(`/api/xp/user/${userId}`).then(r => r.json()),
    staleTime: 60000 // Cache for 1 minute
  });
}

// Usage
function XpDisplay({ userId }: { userId: number }) {
  const { data: xpInfo } = useUserXp(userId);
  
  return (
    <div>
      <div>Level {xpInfo?.currentLevel}</div>
      <div>XP: {xpInfo?.currentXp}</div>
      <progress value={xpInfo?.xpProgress} max={100} />
    </div>
  );
}
```

### Backend XP Award

```typescript
// Award XP when user creates a post
export async function createPost(postData: CreatePostRequest) {
  // Create the post
  const post = await postsService.create(postData);
  
  // Award XP for the action
  await fetch('/api/xp/award-action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: postData.userId,
      action: 'post_created',
      entityId: post.id
    })
  });
  
  return post;
}
```

## Admin Configuration

Admins can modify XP actions via the admin panel:

```http
# Update XP action (admin only)
PATCH /api/admin/xp/actions/:action

# Bulk update XP settings
POST /api/admin/xp/actions/bulk-update

# View XP analytics
GET /api/admin/xp/analytics
```