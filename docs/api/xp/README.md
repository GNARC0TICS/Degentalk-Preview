# XP & Gamification API

## Legend
| Symbol | Meaning | | Abbrev | Meaning |
|--------|---------|---|--------|---------|
| → | leads to | | XP | experience points |
| ⭐ | achievement | | lvl | level |
| 🔒 | auth required | | pts | points |
| ⚠️ | admin only | | req | required |

## Overview

Comprehensive gamification system w/ XP rewards, levels, achievements & mission system to drive user engagement.

**Base Path:** `/api/xp` | `/api/gamification`

## XP System

### Award XP for Action 🔒
```http
POST /api/xp/award-action
```

**Headers:** `Cookie: connect.sid=<session>`

**Body:**
```json
{
  "action": "create_thread",
  "targetId": "th_abc123",
  "metadata": {
    "forumId": "bitcoin-discussion",
    "threadTitle": "Bitcoin Analysis"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "xpAwarded": 25,
    "dgtAwarded": 2.50,
    "newXpTotal": 8750,
    "newLevel": 15,
    "levelUp": false,
    "multiplier": 1.0,
    "bonuses": {
      "firstPost": 5,
      "qualityContent": 10
    },
    "achievements": [
      {
        "id": "thread_creator",
        "name": "Thread Creator",
        "description": "Created your first thread",
        "xpBonus": 50
      }
    ]
  }
}
```

### Manual XP Award (Testing) 🔒
```http
POST /api/xp/award
```

**Body:**
```json
{
  "userId": 123,
  "amount": 100,
  "reason": "Community contribution"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": 123,
    "xpAwarded": 100,
    "newXpTotal": 8850,
    "newLevel": 15,
    "levelUp": false,
    "reason": "Community contribution"
  }
}
```

### Get User XP Information 🔒
```http
GET /api/xp/user/:userId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "username": "cryptoking",
      "currentXp": 8750,
      "currentLevel": 15,
      "xpToNextLevel": 250,
      "xpForCurrentLevel": 8500,
      "xpForNextLevel": 9000,
      "levelProgress": 0.5,
      "totalXpEarned": 8750
    },
    "level": {
      "level": 15,
      "name": "Crypto Expert",
      "description": "Seasoned crypto community member",
      "minXp": 8500,
      "maxXp": 8999,
      "rewards": {
        "dgtMultiplier": 1.5,
        "forumPermissions": ["create_polls"],
        "badges": ["expert"]
      },
      "nextLevel": {
        "level": 16,
        "name": "Crypto Master",
        "minXp": 9000,
        "rewards": {
          "dgtMultiplier": 1.6,
          "forumPermissions": ["create_polls", "moderate_posts"]
        }
      }
    },
    "stats": {
      "xpThisWeek": 150,
      "xpThisMonth": 600,
      "rank": 42,
      "totalUsers": 1500
    }
  }
}
```

### Get Available XP Actions
```http
GET /api/xp/actions
```

**Response:**
```json
{
  "success": true,
  "data": {
    "actions": [
      {
        "action": "create_thread",
        "name": "Create Thread",
        "baseXp": 25,
        "dgtReward": 2.50,
        "description": "Create a new forum thread",
        "cooldown": 300,
        "dailyLimit": 10,
        "requirements": {
          "minLevel": 1,
          "forumAccess": true
        },
        "multipliers": {
          "quality": 1.5,
          "trending": 2.0
        }
      },
      {
        "action": "create_post",
        "name": "Create Post",
        "baseXp": 10,
        "dgtReward": 1.00,
        "description": "Reply to a thread",
        "cooldown": 60,
        "dailyLimit": 50,
        "multipliers": {
          "firstReply": 1.5
        }
      },
      {
        "action": "receive_like",
        "name": "Receive Like",
        "baseXp": 2,
        "dgtReward": 0.20,
        "description": "Your content gets liked",
        "cooldown": 0,
        "dailyLimit": 100
      },
      {
        "action": "give_tip",
        "name": "Give Tip",
        "baseXp": 5,
        "dgtReward": 0.00,
        "description": "Tip another user",
        "cooldown": 30,
        "dailyLimit": 20,
        "requirements": {
          "minDgtBalance": 10.0
        }
      }
    ]
  }
}
```

### Get XP Action Logs 🔒
```http
GET /api/xp/logs/:userId?
```

**Query Parameters:**
```
action=create_thread    # Filter by action type
limit=50               # Results per page
offset=0               # Pagination
dateFrom=2025-01-01    # Date range
dateTo=2025-01-31      # Date range
```

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "xp_log_abc123",
        "userId": 123,
        "action": "create_thread",
        "xpAwarded": 25,
        "dgtAwarded": 2.50,
        "multiplier": 1.0,
        "bonuses": {
          "quality": 5
        },
        "metadata": {
          "threadId": "th_abc123",
          "forumId": "bitcoin-discussion"
        },
        "createdAt": "2025-01-01T12:00:00Z"
      }
    ]
  },
  "pagination": {
    "total": 200,
    "limit": 50,
    "offset": 0
  }
}
```

## Level System

### Get Level Information
```http
GET /api/gamification/levels/:level?
```

**Response:**
```json
{
  "success": true,
  "data": {
    "levels": [
      {
        "level": 1,
        "name": "Crypto Newbie",
        "description": "Welcome to the crypto world!",
        "minXp": 0,
        "maxXp": 99,
        "rewards": {
          "dgtMultiplier": 1.0,
          "forumPermissions": ["basic_posting"],
          "badges": ["newcomer"],
          "features": ["basic_wallet"]
        },
        "icon": "🌱"
      },
      {
        "level": 15,
        "name": "Crypto Expert",
        "description": "Seasoned crypto community member",
        "minXp": 8500,
        "maxXp": 8999,
        "rewards": {
          "dgtMultiplier": 1.5,
          "forumPermissions": ["create_polls", "pin_threads"],
          "badges": ["expert"],
          "features": ["advanced_wallet", "priority_support"]
        },
        "icon": "🎯"
      }
    ]
  }
}
```

### Get Level Leaderboard
```http
GET /api/gamification/levels/leaderboard
```

**Query Parameters:**
```
period=all_time     # Time period: all_time|month|week
limit=100          # Results count
includeUser=123    # Include specific user even if outside top N
```

**Response:**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "userId": 456,
        "username": "whaleking",
        "level": 25,
        "xp": 25000,
        "avatar": "https://cdn.degentalk.com/avatars/456.jpg",
        "badges": ["legend", "whale", "og"]
      },
      {
        "rank": 2,
        "userId": 123,
        "username": "cryptoking",
        "level": 15,
        "xp": 8750,
        "avatar": "https://cdn.degentalk.com/avatars/123.jpg",
        "badges": ["expert"]
      }
    ],
    "userRank": {
      "rank": 42,
      "total": 1500
    }
  }
}
```

## Achievement System

### Get User Achievements 🔒
```http
GET /api/gamification/achievements/user/:userId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "id": "thread_creator",
        "name": "Thread Creator",
        "description": "Created your first thread",
        "icon": "📝",
        "category": "forum",
        "rarity": "common",
        "xpReward": 50,
        "dgtReward": 5.00,
        "unlockedAt": "2025-01-01T12:00:00Z",
        "progress": {
          "current": 1,
          "required": 1,
          "completed": true
        }
      },
      {
        "id": "whale_tipper",
        "name": "Whale Tipper",
        "description": "Tip 1000 DGT in total",
        "icon": "🐋",
        "category": "social",
        "rarity": "legendary",
        "xpReward": 500,
        "dgtReward": 50.00,
        "progress": {
          "current": 750.00,
          "required": 1000.00,
          "completed": false
        }
      }
    ],
    "stats": {
      "totalAchievements": 25,
      "unlockedAchievements": 15,
      "completionRate": 0.6,
      "totalXpFromAchievements": 1500,
      "totalDgtFromAchievements": 150.00
    }
  }
}
```

### Get All Achievements
```http
GET /api/gamification/achievements
```

**Query Parameters:**
```
category=forum      # Filter: forum|social|wallet|trading
rarity=rare        # Filter: common|uncommon|rare|epic|legendary
unlocked=false     # Filter by unlock status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "id": "first_thread",
        "name": "First Steps",
        "description": "Create your first thread",
        "icon": "🌟",
        "category": "forum",
        "rarity": "common",
        "xpReward": 25,
        "dgtReward": 2.50,
        "requirements": {
          "action": "create_thread",
          "count": 1
        },
        "hints": ["Start a discussion in any forum"],
        "hiddenUntilUnlocked": false
      },
      {
        "id": "crypto_whale",
        "name": "Crypto Whale",
        "description": "Accumulate 100,000 DGT",
        "icon": "🐋",
        "category": "wallet",
        "rarity": "legendary",
        "xpReward": 1000,
        "dgtReward": 100.00,
        "requirements": {
          "dgtBalance": 100000.00
        },
        "hints": ["Build up your DGT balance through activities"],
        "hiddenUntilUnlocked": true
      }
    ]
  }
}
```

### Achievement Progress 🔒
```http
GET /api/gamification/achievements/:achievementId/progress
```

**Response:**
```json
{
  "success": true,
  "data": {
    "achievement": {
      "id": "whale_tipper",
      "name": "Whale Tipper",
      "description": "Tip 1000 DGT in total"
    },
    "progress": {
      "current": 750.00,
      "required": 1000.00,
      "percentage": 75.0,
      "completed": false,
      "estimatedCompletion": "2025-02-15T00:00:00Z"
    },
    "milestones": [
      {
        "value": 100.00,
        "name": "Generous",
        "completed": true,
        "completedAt": "2024-12-01T00:00:00Z"
      },
      {
        "value": 500.00,
        "name": "Big Tipper",
        "completed": true,
        "completedAt": "2024-12-20T00:00:00Z"
      },
      {
        "value": 1000.00,
        "name": "Whale Tipper",
        "completed": false
      }
    ]
  }
}
```

## Mission System

### Get Daily Missions 🔒
```http
GET /api/gamification/missions/daily
```

**Response:**
```json
{
  "success": true,
  "data": {
    "missions": [
      {
        "id": "daily_poster",
        "name": "Daily Contributor",
        "description": "Create 3 posts today",
        "type": "daily",
        "xpReward": 50,
        "dgtReward": 5.00,
        "requirements": {
          "action": "create_post",
          "count": 3,
          "timeframe": "1d"
        },
        "progress": {
          "current": 1,
          "required": 3,
          "completed": false
        },
        "deadline": "2025-01-02T00:00:00Z",
        "status": "active"
      },
      {
        "id": "daily_socializer",
        "name": "Social Butterfly",
        "description": "Like 10 posts today",
        "type": "daily",
        "xpReward": 25,
        "dgtReward": 2.50,
        "requirements": {
          "action": "give_like",
          "count": 10,
          "timeframe": "1d"
        },
        "progress": {
          "current": 10,
          "required": 10,
          "completed": true
        },
        "completedAt": "2025-01-01T18:30:00Z",
        "status": "completed"
      }
    ],
    "resetTime": "2025-01-02T00:00:00Z",
    "completedToday": 1,
    "totalToday": 3
  }
}
```

### Get Weekly Missions 🔒
```http
GET /api/gamification/missions/weekly
```

**Response:**
```json
{
  "success": true,
  "data": {
    "missions": [
      {
        "id": "weekly_creator",
        "name": "Content Creator",
        "description": "Create 5 quality threads this week",
        "type": "weekly",
        "xpReward": 200,
        "dgtReward": 20.00,
        "requirements": {
          "action": "create_thread",
          "count": 5,
          "qualityThreshold": 0.7,
          "timeframe": "7d"
        },
        "progress": {
          "current": 2,
          "required": 5,
          "completed": false
        },
        "deadline": "2025-01-07T00:00:00Z",
        "status": "active"
      }
    ],
    "resetTime": "2025-01-07T00:00:00Z"
  }
}
```

### Complete Mission 🔒
```http
POST /api/gamification/missions/:missionId/complete
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mission": {
      "id": "daily_poster",
      "name": "Daily Contributor",
      "completed": true
    },
    "rewards": {
      "xpAwarded": 50,
      "dgtAwarded": 5.00,
      "achievements": []
    },
    "completedAt": "2025-01-01T20:00:00Z"
  }
}
```

## Analytics & Statistics

### Get User Analytics 🔒
```http
GET /api/gamification/analytics/user/:userId
```

**Query Parameters:**
```
period=30d          # Period: 7d|30d|90d|all
includeComparison=true  # Include comparison data
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "username": "cryptoking",
      "joinedAt": "2024-01-01T00:00:00Z"
    },
    "period": {
      "start": "2024-12-01T00:00:00Z",
      "end": "2025-01-01T00:00:00Z"
    },
    "xp": {
      "total": 8750,
      "gained": 600,
      "dailyAverage": 20.0,
      "trend": "increasing"
    },
    "activities": {
      "threadsCreated": 12,
      "postsCreated": 45,
      "likesGiven": 89,
      "likesReceived": 67,
      "tipsGiven": 15,
      "tipsReceived": 23
    },
    "achievements": {
      "unlocked": 3,
      "progress": [
        {
          "id": "whale_tipper",
          "progress": 0.75
        }
      ]
    },
    "missions": {
      "dailyCompleted": 25,
      "weeklyCompleted": 8,
      "completionRate": 0.83
    },
    "comparison": {
      "rank": 42,
      "percentile": 95.5,
      "averageUser": {
        "xpGained": 300,
        "activitiesCount": 50
      }
    }
  }
}
```

### Get Platform Analytics
```http
GET /api/gamification/analytics/platform
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1500,
      "active30d": 450,
      "averageLevel": 8.5,
      "averageXp": 2500
    },
    "xp": {
      "totalAwarded": 3750000,
      "awarded30d": 125000,
      "topActions": [
        {
          "action": "create_post",
          "count": 15000,
          "xpTotal": 150000
        }
      ]
    },
    "achievements": {
      "totalUnlocked": 5420,
      "averagePerUser": 3.6,
      "popularAchievements": [
        {
          "id": "first_thread",
          "unlockRate": 0.85
        }
      ]
    },
    "missions": {
      "dailyCompletionRate": 0.65,
      "weeklyCompletionRate": 0.45
    }
  }
}
```

## Admin Features ⚠️

### XP Management
```http
POST /api/gamification/admin/xp/bulk-award
```

**Body:**
```json
{
  "userIds": [123, 456, 789],
  "amount": 100,
  "reason": "Event participation bonus"
}
```

### Achievement Management
```http
POST /api/gamification/admin/achievements
PATCH /api/gamification/admin/achievements/:id
DELETE /api/gamification/admin/achievements/:id
```

### Mission Management
```http
POST /api/gamification/admin/missions
PATCH /api/gamification/admin/missions/:id
```

## Rate Limiting & Security

### Rate Limits
- **XP award requests:** 60 per minute per user
- **Progress checks:** 300 per minute per user
- **Mission completions:** 100 per hour per user
- **Achievement checks:** 200 per minute per user

### Security Features
- **Anti-gaming measures** prevent XP exploitation
- **Cooldown enforcement** prevents spam
- **Quality thresholds** ensure meaningful content
- **Admin oversight** for suspicious patterns

### Validation
- **XP amounts:** Positive values only
- **Action validation:** Must exist in system
- **User verification:** Must be authenticated
- **Rate limiting:** Per-action cooldowns

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| `XP_001` | Invalid action | Unknown XP action type |
| `XP_002` | Cooldown active | Action still on cooldown |
| `XP_003` | Daily limit reached | User hit daily XP limit |
| `XP_004` | Insufficient level | User level too low |
| `XP_005` | Achievement locked | Prerequisites not met |
| `XP_006` | Mission expired | Mission deadline passed |
| `XP_007` | Invalid amount | XP amount validation failed |
| `XP_008` | User not found | Invalid user ID |

## Integration Examples

### React Hook
```typescript
import { useXp } from '@/hooks/use-xp';

function XpDisplay() {
  const { userXp, awardXp, achievements } = useXp();

  const handleAction = async (action: string) => {
    try {
      const result = await awardXp({
        action,
        targetId: 'th_123'
      });
      
      if (result.levelUp) {
        showLevelUpModal(result.newLevel);
      }
      
      if (result.achievements.length > 0) {
        showAchievementModal(result.achievements);
      }
    } catch (error) {
      console.error('XP award failed:', error);
    }
  };

  return (
    <div>
      <div>Level {userXp.currentLevel}</div>
      <div>XP: {userXp.currentXp}</div>
      <ProgressBar 
        value={userXp.levelProgress} 
        max={1} 
      />
    </div>
  );
}
```

### XP Integration
```typescript
// Award XP after forum actions
const createThread = async (threadData: CreateThreadData) => {
  const thread = await api.createThread(threadData);
  
  // Award XP automatically
  await api.awardXp({
    action: 'create_thread',
    targetId: thread.id,
    metadata: {
      forumId: threadData.forumId,
      threadTitle: threadData.title
    }
  });
  
  return thread;
};
```

---

**📚 Documentation:** `/docs/api/xp/README.md`

**Related:**
- [Forum Integration](../forum/README.md)
- [Wallet Integration](../wallet/README.md)
- [Admin XP Management](../admin/gamification.md)