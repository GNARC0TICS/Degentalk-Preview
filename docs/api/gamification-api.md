---
title: gamification api
status: STABLE
updated: 2025-06-28
---

# Gamification API Documentation

## Overview

The Degentalk Gamification API provides comprehensive endpoints for managing user progression, achievements, missions, and analytics across the platform. This system integrates seamlessly with the existing XP system and DGT economy.

**Base URL**: `/api/gamification`

## Authentication

- **Public endpoints**: Limited read-only access to basic data
- **User endpoints**: Require authentication for personal data
- **Admin endpoints**: Require admin role for management operations

## Rate Limiting

- **Public**: 100 requests per 15 minutes
- **User**: 200 requests per 15 minutes  
- **Admin**: 50 requests per 15 minutes
- **Bulk operations**: 5 per hour
- **Exports**: 5 per hour

## Core Endpoints

### System Health

#### `GET /api/gamification/health`

Check system status and feature availability.

**Response:**
```json
{
  "success": true,
  "service": "gamification",
  "features": {
    "leveling": "active",
    "achievements": "active", 
    "missions": "active",
    "leaderboards": "active",
    "analytics": "active"
  },
  "timestamp": "2025-01-28T10:00:00Z"
}
```

---

## Leveling & Progression

### Get All Levels

#### `GET /api/gamification/levels`

Retrieve all level configurations.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "level": 1,
      "name": "Newcomer",
      "minXp": 0,
      "nextLevelXp": 100,
      "iconUrl": "/icons/level-1.png",
      "rarity": "common",
      "frameUrl": "/frames/bronze.png",
      "colorTheme": "theme-bronze",
      "animationEffect": "glow",
      "unlocks": {
        "titles": [1],
        "features": ["basic_tipping"]
      },
      "rewards": {
        "dgt": 10,
        "titleId": 1,
        "badgeId": null
      }
    }
  ],
  "meta": {
    "count": 100,
    "maxLevel": 100
  }
}
```

### Get Specific Level

#### `GET /api/gamification/levels/:level`

Get detailed information about a specific level.

**Parameters:**
- `level` (integer): Level number (1-1000)

### Get User Progression

#### `GET /api/gamification/progression/me`
#### `GET /api/gamification/progression/:userId`

Get comprehensive user progression data.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": 123,
    "username": "CryptoTrader",
    "currentLevel": 15,
    "currentXp": 5500,
    "totalXp": 5500,
    "xpForNextLevel": 1500,
    "progressPercentage": 78.5,
    "levelInfo": {
      "level": 15,
      "name": "Experienced Trader",
      "rarity": "rare"
    },
    "nextLevelInfo": {
      "level": 16,
      "name": "Expert Trader",
      "minXp": 7000
    },
    "recentLevelUps": 2,
    "weeklyXpGain": 850,
    "rank": 42,
    "achievements": {
      "total": 12,
      "recent": [...]
    },
    "missions": {
      "completed": 8,
      "available": 12,
      "streak": 3
    }
  }
}
```

### Get Leaderboard

#### `GET /api/gamification/leaderboard`

Retrieve leaderboard with various sorting options.

**Query Parameters:**
- `type` (enum): `level`, `xp`, `weekly`, `monthly` (default: `xp`)
- `limit` (integer): Results limit 1-100 (default: 50)
- `offset` (integer): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "userId": 456,
      "username": "TopPlayer",
      "level": 89,
      "totalXp": 125000,
      "weeklyXp": 2500,
      "rank": 1,
      "trend": "up"
    }
  ],
  "meta": {
    "type": "xp",
    "limit": 50,
    "offset": 0,
    "count": 50
  }
}
```

---

## Achievements

### Get All Achievements

#### `GET /api/gamification/achievements`

Retrieve all available achievements.

**Query Parameters:**
- `active` (boolean): Filter active achievements (default: true)

**Response:**
```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "id": 1,
        "name": "First Steps",
        "description": "Create your first post",
        "iconUrl": "/icons/first-post.png",
        "rewardXp": 50,
        "rewardPoints": 10,
        "requirement": {
          "type": "count",
          "action": "posts_created",
          "target": 1
        },
        "isActive": true,
        "rarity": "common",
        "category": "content"
      }
    ],
    "grouped": {
      "content": [...],
      "social": [...],
      "economy": [...],
      "progression": [...]
    },
    "stats": {
      "total": 25,
      "byCategory": {
        "content": 8,
        "social": 6,
        "economy": 5,
        "progression": 4,
        "special": 2
      },
      "byRarity": {
        "common": 12,
        "rare": 8,
        "epic": 3,
        "legendary": 1,
        "mythic": 1
      }
    }
  }
}
```

### Get User Achievement Stats

#### `GET /api/gamification/achievements/my-stats`
#### `GET /api/gamification/achievements/user/:userId`

Get user's achievement statistics and completed achievements.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAchievements": 25,
    "completedAchievements": 12,
    "completionRate": 48.0,
    "totalRewardXp": 850,
    "totalRewardPoints": 200,
    "recentEarned": [
      {
        "achievement": {
          "id": 5,
          "name": "Social Butterfly",
          "description": "Like 50 posts"
        },
        "earnedAt": "2025-01-27T15:30:00Z"
      }
    ],
    "categories": {
      "content": {
        "total": 8,
        "completed": 5,
        "rate": 62.5
      }
    }
  }
}
```

### Get Achievement Progress

#### `GET /api/gamification/achievements/my-progress`
#### `GET /api/gamification/achievements/progress/:userId`

Get detailed progress towards achievements.

**Query Parameters:**
- `achievementIds` (string): Comma-separated achievement IDs to filter

**Response:**
```json
{
  "success": true,
  "data": {
    "all": [
      {
        "userId": 123,
        "achievementId": 1,
        "currentProgress": 1,
        "isCompleted": true,
        "earnedAt": "2025-01-25T10:00:00Z",
        "progressPercentage": 100,
        "achievement": {...}
      },
      {
        "userId": 123,
        "achievementId": 2,
        "currentProgress": 3,
        "isCompleted": false,
        "progressPercentage": 30,
        "achievement": {
          "requirement": {
            "target": 10
          }
        }
      }
    ],
    "completed": [...],
    "inProgress": [...],
    "notStarted": [...],
    "stats": {
      "total": 25,
      "completed": 12,
      "inProgress": 8,
      "completionRate": 48.0
    }
  }
}
```

### Check and Award Achievements

#### `POST /api/gamification/achievements/check`

Check and automatically award achievements for a user action.

**Request Body:**
```json
{
  "userId": 123,
  "actionType": "posts_created",
  "metadata": {
    "postId": 456,
    "forumId": 789
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "awarded": [
      {
        "id": 1,
        "name": "First Steps",
        "rewardXp": 50,
        "rewardPoints": 10
      }
    ],
    "count": 1
  },
  "message": "Awarded 1 achievement(s)"
}
```

---

## Missions

### Get All Missions

#### `GET /api/gamification/missions`

Retrieve all available missions.

**Query Parameters:**
- `userLevel` (integer): Filter by minimum user level
- `activeOnly` (boolean): Show only active missions (default: true)

**Response:**
```json
{
  "success": true,
  "data": {
    "missions": [
      {
        "id": 1,
        "title": "Daily Login",
        "description": "Log in to the forum today",
        "type": "LOGIN",
        "requiredAction": "login",
        "requiredCount": 1,
        "xpReward": 10,
        "dgtReward": null,
        "badgeReward": null,
        "icon": "log-in",
        "isDaily": true,
        "isWeekly": false,
        "isActive": true,
        "minLevel": 1,
        "sortOrder": 0,
        "expiresAt": "2025-01-29T00:00:00Z"
      }
    ],
    "grouped": {
      "daily": [...],
      "weekly": [...],
      "other": [...]
    },
    "stats": {
      "total": 12,
      "daily": 8,
      "weekly": 4,
      "other": 0
    }
  }
}
```

### Get User Mission Progress

#### `GET /api/gamification/missions/my-progress`
#### `GET /api/gamification/missions/user/:userId`

Get user's mission progress and statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "all": [
      {
        "id": 1,
        "userId": 123,
        "missionId": 1,
        "currentCount": 1,
        "isCompleted": true,
        "isRewardClaimed": false,
        "completedAt": "2025-01-28T09:00:00Z",
        "mission": {...}
      }
    ],
    "completed": [...],
    "readyToClaim": [...],
    "inProgress": [...],
    "notStarted": [...],
    "claimed": [...],
    "stats": {
      "total": 12,
      "completed": 3,
      "readyToClaim": 2,
      "inProgress": 5,
      "claimed": 2,
      "completionRate": 25.0,
      "earnedRewards": 150,
      "totalPossibleRewards": 600,
      "rewardEfficiency": 25.0
    }
  }
}
```

### Claim Mission Reward

#### `POST /api/gamification/missions/claim`

Claim reward for a completed mission.

**Request Body:**
```json
{
  "missionId": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "xp": 10,
    "dgt": null,
    "badge": null
  },
  "message": "Mission reward claimed successfully"
}
```

### Update Mission Progress

#### `POST /api/gamification/missions/update-progress`

Update mission progress for a user action.

**Request Body:**
```json
{
  "userId": 123,
  "actionType": "LOGIN",
  "metadata": {
    "timestamp": "2025-01-28T10:00:00Z"
  }
}
```

---

## Analytics

### Get Analytics Dashboard

#### `GET /api/gamification/analytics/dashboard` *(Admin)*

Get comprehensive gamification analytics.

**Query Parameters:**
- `timeframe` (enum): `day`, `week`, `month` (default: `week`)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 1500,
      "activeToday": 250,
      "levelUpsToday": 12,
      "achievementsEarned": 45,
      "missionsCompleted": 180,
      "totalXpAwarded": 15000
    },
    "progression": {
      "period": "week",
      "totalUsers": 1500,
      "activeUsers": 800,
      "avgLevelGain": 0.8,
      "avgXpGain": 125.5,
      "levelUps": 85,
      "topLevelReached": 89,
      "progressionRate": 35.2
    },
    "achievements": {
      "period": "week",
      "totalAchievements": 25,
      "totalCompletions": 320,
      "avgCompletionRate": 18.5,
      "popularAchievements": [...],
      "rareAchievements": [...]
    },
    "missions": {
      "period": "week",
      "totalMissions": 12,
      "totalCompletions": 850,
      "dailyMissionRate": 680,
      "weeklyMissionRate": 170,
      "avgCompletionTime": 0,
      "streakData": {
        "avgStreak": 0,
        "maxStreak": 0,
        "usersWithStreaks": 0
      }
    },
    "engagement": {
      "period": "week",
      "totalEngagements": 1200,
      "uniqueUsers": 400,
      "avgSessionLength": 0,
      "retentionRate": 0,
      "churnRate": 0,
      "powerUsers": 40
    },
    "topPerformers": [...],
    "trends": {
      "xpGrowth": [...],
      "userActivity": [...],
      "completionRates": [...]
    }
  },
  "meta": {
    "timeframe": "week",
    "generatedAt": "2025-01-28T10:00:00Z",
    "version": "1.0.0"
  }
}
```

### Get Analytics Overview

#### `GET /api/gamification/analytics/overview`

Get quick overview statistics for public display.

### Get System Health

#### `GET /api/gamification/analytics/health`

Get real-time system health metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2025-01-28T10:00:00Z",
    "responseTime": 45,
    "errorRate": 0,
    "throughput": 0,
    "memoryUsage": 128.5,
    "alerts": []
  },
  "status": "healthy"
}
```

---

## Admin Endpoints

### Get Admin Overview

#### `GET /api/gamification/admin/overview` *(Admin)*

Get comprehensive admin dashboard.

### Bulk Create Levels

#### `POST /api/gamification/admin/levels/bulk` *(Admin)*

Create multiple levels in one operation.

**Request Body:**
```json
{
  "levels": [
    {
      "level": 1,
      "minXp": 0,
      "name": "Newcomer",
      "rarity": "common",
      "rewardDgt": 10
    }
  ]
}
```

### System Configuration

#### `GET /api/gamification/admin/config` *(Admin)*
#### `PUT /api/gamification/admin/config` *(Admin)*

Get or update system configuration.

### Maintenance Operations

#### `POST /api/gamification/admin/maintenance` *(Admin)*

Perform system maintenance.

**Request Body:**
```json
{
  "operation": "reset-daily-missions"
}
```

**Available Operations:**
- `reset-daily-missions`
- `reset-weekly-missions`
- `recalculate-leaderboards`
- `cleanup-expired-data`
- `rebuild-analytics`

### Seed Default Data

#### `POST /api/gamification/admin/seed-defaults` *(Admin)*

Seed all default achievements, missions, and level curves.

---

## Error Handling

All endpoints return errors in a consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "details": [
    {
      "field": "userId",
      "message": "User ID is required"
    }
  ]
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Integration Examples

### Checking Achievements After User Action

```javascript
// After user creates a post
const response = await fetch('/api/gamification/achievements/check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: currentUser.id,
    actionType: 'posts_created',
    metadata: { postId: newPost.id }
  })
});

const { data } = await response.json();
if (data.awarded.length > 0) {
  showAchievementToast(data.awarded);
}
```

### Updating Mission Progress

```javascript
// After user login
await fetch('/api/gamification/missions/update-progress', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: currentUser.id,
    actionType: 'LOGIN',
    metadata: { timestamp: new Date().toISOString() }
  })
});
```

### Displaying User Progression

```javascript
// Get user's current progression
const response = await fetch('/api/gamification/progression/me');
const { data: progression } = await response.json();

// Display level progress bar
const progressPercentage = progression.progressPercentage;
const nextLevelXp = progression.xpForNextLevel;
```

This API provides a complete gamification system that integrates seamlessly with Degentalk's existing XP economy and user engagement features.