---
title: admin api
status: STABLE
updated: 2025-06-28
---

# Admin API

The Admin system provides modular administrative functionality for managing all aspects of the Degentalk platform through a permission-based, feature-gated architecture.

## Base URL

```
/api/admin
```

## Authentication & Permissions

All admin endpoints require authentication and specific permissions. The system uses a role-based permission model:

### Roles

- **super_admin**: Full system access
- **admin**: Most administrative functions  
- **moderator**: Content moderation and user management
- **user**: No admin access

### Permission Model

```typescript
type AdminPermission = 
  | 'admin.full_access'
  | 'admin.users.manage'
  | 'admin.content.moderate'
  | 'admin.economy.manage'
  | 'admin.settings.configure'
  | 'admin.analytics.view'
  | 'admin.system.maintain';
```

## Modular Architecture

The admin system is built on a modular architecture where each domain has its own sub-module:

### Core Modules

| Module | Route | Permissions | Description |
|--------|--------|------------|-------------|
| **Users** | `/users` | `admin.users.manage` | User management and profiles |
| **Economy** | `/economy` | `admin.economy.manage` | DGT, XP, and financial settings |
| **Forum** | `/forum` | `admin.content.moderate` | Forum categories and moderation |
| **Analytics** | `/analytics` | `admin.analytics.view` | Platform statistics and insights |
| **Settings** | `/settings` | `admin.settings.configure` | System configuration |
| **Wallet** | `/wallet` | `admin.economy.manage` | Crypto and DGT wallet settings |

### Extended Modules

| Module | Route | Description |
|--------|--------|------------|
| **Avatar Frames** | `/avatar-frames` | Manage user avatar decorations |
| **Backup & Restore** | `/backup-restore` | System backup operations |
| **Cache** | `/cache` | Cache management and purging |
| **Clout** | `/clout` | Reputation and influence system |
| **DGT Packages** | `/dgt-packages` | DGT token purchase packages |
| **Email Templates** | `/email-templates` | Notification email management |
| **Feature Flags** | `/feature-flags` | A/B testing and feature toggles |
| **Permissions** | `/permissions` | Fine-grained permission control |
| **Rain** | `/rain` | Community reward distributions |
| **Referrals** | `/referrals` | Referral program management |
| **Treasury** | `/treasury` | Platform financial management |
| **UI Config** | `/ui-config` | Frontend configuration |
| **User Groups** | `/user-groups` | User categorization and bulk actions |
| **XP System** | `/xp-system` | Experience point configuration |

## Module Registry API

### Get Available Modules

Returns modules available to the authenticated admin user.

```http
GET /api/admin/modules
```

**Response:**

```json
{
  "success": true,
  "data": {
    "modules": [
      {
        "id": "users",
        "name": "User Management",
        "description": "Manage user accounts and profiles",
        "route": "/admin/users",
        "icon": "Users",
        "enabled": true,
        "permissions": ["admin.users.manage"],
        "order": 10,
        "subModules": [
          {
            "id": "user-profiles",
            "name": "User Profiles",
            "route": "/admin/users/profiles",
            "enabled": true
          }
        ]
      }
    ],
    "enabledCount": 12,
    "totalCount": 15
  }
}
```

### Get Module Configuration

```http
GET /api/admin/modules/:moduleId
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "feature-flags",
    "name": "Feature Flags",
    "enabled": true,
    "settings": {
      "enableRollouts": true,
      "defaultRolloutPercentage": 0
    },
    "permissions": ["admin.settings.configure"],
    "status": "healthy",
    "lastUsed": "2024-01-15T14:30:00Z"
  }
}
```

### Update Module Settings

```http
PATCH /api/admin/modules/:moduleId
```

**Request Body:**

```json
{
  "enabled": true,
  "settings": {
    "enableRollouts": false,
    "defaultRolloutPercentage": 25
  }
}
```

## User Management API

### Get Users

```http
GET /api/admin/users
```

**Query Parameters:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `search` - Search by username, email, or display name
- `role` - Filter by user role
- `status` - Filter by account status (`active`, `suspended`, `banned`)
- `level` - Filter by minimum XP level
- `joinedAfter` - Filter by registration date
- `sortBy` - Sort field (`username`, `joinedAt`, `lastActive`, `level`)
- `order` - Sort direction (`asc`, `desc`)

**Response:**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 123,
        "username": "cryptotrader",
        "email": "user@example.com",
        "displayName": "Crypto Trader",
        "role": "user",
        "status": "active",
        "level": 15,
        "xp": 12500,
        "joinedAt": "2024-01-01T00:00:00Z",
        "lastActiveAt": "2024-01-15T14:30:00Z",
        "postCount": 45,
        "threadCount": 12,
        "reputation": 890
      }
    ],
    "pagination": {
      "total": 5432,
      "page": 1,
      "limit": 20,
      "totalPages": 272
    }
  }
}
```

### Get User Details

```http
GET /api/admin/users/:userId
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 123,
    "username": "cryptotrader",
    "email": "user@example.com",
    "profile": {
      "displayName": "Crypto Trader",
      "bio": "DeFi enthusiast and trader",
      "location": "United States",
      "website": "https://example.com",
      "avatarUrl": "/avatars/123.jpg"
    },
    "stats": {
      "level": 15,
      "xp": 12500,
      "postCount": 45,
      "threadCount": 12,
      "likeCount": 234,
      "reputation": 890
    },
    "wallet": {
      "dgtBalance": 1250.50,
      "totalDeposited": 500.00,
      "totalWithdrawn": 100.00
    },
    "moderation": {
      "warningCount": 0,
      "isSuspended": false,
      "isBanned": false,
      "notes": []
    },
    "joinedAt": "2024-01-01T00:00:00Z",
    "lastActiveAt": "2024-01-15T14:30:00Z"
  }
}
```

### Update User

```http
PATCH /api/admin/users/:userId
```

**Request Body:**

```json
{
  "role": "moderator",
  "status": "active",
  "profile": {
    "displayName": "New Display Name"
  },
  "notes": "Promoted to moderator"
}
```

### Suspend User

```http
POST /api/admin/users/:userId/suspend
```

**Request Body:**

```json
{
  "duration": 7,
  "reason": "Violation of community guidelines",
  "notes": "Temporary suspension for spam behavior"
}
```

### Ban User

```http
POST /api/admin/users/:userId/ban
```

**Request Body:**

```json
{
  "permanent": false,
  "duration": 30,
  "reason": "Repeated violations",
  "deleteContent": false
}
```

## Economy Management API

### Get Economy Overview

```http
GET /api/admin/economy
```

**Response:**

```json
{
  "success": true,
  "data": {
    "dgt": {
      "totalSupply": 1000000,
      "circulating": 75432.50,
      "price": 0.10,
      "dailyVolume": 5432.10
    },
    "xp": {
      "totalAwarded": 15678901,
      "dailyAverage": 12543,
      "topActions": [
        {"action": "post_created", "count": 2345, "xpAwarded": 23450},
        {"action": "thread_created", "count": 567, "xpAwarded": 17010}
      ]
    },
    "transactions": {
      "totalCount": 45678,
      "totalValue": 123456.78,
      "pendingCount": 23
    }
  }
}
```

### Update XP Action Settings

```http
PATCH /api/admin/economy/xp-actions/:action
```

**Request Body:**

```json
{
  "baseValue": 15,
  "maxPerDay": 150,
  "enabled": true,
  "description": "Updated description"
}
```

### DGT Package Management

#### Get DGT Packages

```http
GET /api/admin/economy/dgt-packages
```

#### Create DGT Package

```http
POST /api/admin/economy/dgt-packages
```

**Request Body:**

```json
{
  "name": "Starter Pack",
  "description": "Perfect for new users",
  "dgtAmount": 100,
  "usdPrice": 10.00,
  "bonusPercentage": 5,
  "enabled": true
}
```

## Feature Flags API

### Get All Feature Flags

```http
GET /api/admin/feature-flags
```

**Response:**

```json
{
  "success": true,
  "data": {
    "flags": [
      {
        "key": "new_ui_design",
        "name": "New UI Design",
        "description": "Enable the new dashboard design",
        "enabled": true,
        "rolloutPercentage": 25,
        "conditions": {
          "userLevel": 10,
          "role": ["moderator", "admin"]
        },
        "createdAt": "2024-01-10T00:00:00Z",
        "updatedAt": "2024-01-15T12:00:00Z"
      }
    ]
  }
}
```

### Update Feature Flag

```http
PATCH /api/admin/feature-flags/:key
```

**Request Body:**

```json
{
  "enabled": true,
  "rolloutPercentage": 50,
  "conditions": {
    "userLevel": 5
  }
}
```

### Test Feature Flag

```http
POST /api/admin/feature-flags/:key/test
```

**Request Body:**

```json
{
  "userId": 123
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "flagKey": "new_ui_design",
    "enabled": true,
    "reason": "User meets rollout percentage",
    "userEligible": true
  }
}
```

## Analytics API

### Get Dashboard Statistics

```http
GET /api/admin/analytics/dashboard
```

**Query Parameters:**

- `period` - Time period (`today`, `week`, `month`, `quarter`, `year`)
- `timezone` - User timezone for date calculations

**Response:**

```json
{
  "success": true,
  "data": {
    "users": {
      "total": 5432,
      "active": 1234,
      "newToday": 45,
      "growthRate": 12.5
    },
    "content": {
      "totalThreads": 12345,
      "totalPosts": 67890,
      "newThreadsToday": 123,
      "newPostsToday": 567
    },
    "economy": {
      "dgtCirculating": 75432.50,
      "dailyTransactions": 234,
      "xpAwarded": 12543
    },
    "engagement": {
      "dailyActiveUsers": 1234,
      "averageSessionTime": 1800,
      "pageViews": 45678
    }
  }
}
```

### Get User Analytics

```http
GET /api/admin/analytics/users
```

**Query Parameters:**

- `metric` - Metric to analyze (`registrations`, `activity`, `retention`)
- `groupBy` - Group data by (`day`, `week`, `month`)
- `startDate` - Analysis start date
- `endDate` - Analysis end date

### Get Content Analytics

```http
GET /api/admin/analytics/content
```

### Get Economy Analytics

```http
GET /api/admin/analytics/economy
```

## System Settings API

### Get System Configuration

```http
GET /api/admin/settings
```

**Response:**

```json
{
  "success": true,
  "data": {
    "platform": {
      "name": "Degentalk",
      "description": "Crypto Forum Platform",
      "maintenanceMode": false,
      "registrationEnabled": true
    },
    "forum": {
      "threadsPerPage": 20,
      "postsPerPage": 15,
      "maxThreadTitleLength": 200,
      "maxPostLength": 50000
    },
    "economy": {
      "dgtPrice": 0.10,
      "maxDGTBalance": 1000000,
      "maxDGTTransfer": 10000
    },
    "security": {
      "sessionTimeout": 3600,
      "maxLoginAttempts": 5,
      "passwordMinLength": 8
    }
  }
}
```

### Update System Settings

```http
PATCH /api/admin/settings
```

**Request Body:**

```json
{
  "platform": {
    "maintenanceMode": true,
    "maintenanceMessage": "Scheduled maintenance in progress"
  },
  "forum": {
    "threadsPerPage": 25
  }
}
```

## Cache Management API

### Get Cache Status

```http
GET /api/admin/cache/status
```

**Response:**

```json
{
  "success": true,
  "data": {
    "caches": [
      {
        "name": "users",
        "size": "15.2 MB",
        "entries": 5432,
        "hitRate": 94.5,
        "lastCleared": "2024-01-15T10:00:00Z"
      },
      {
        "name": "threads",
        "size": "8.7 MB", 
        "entries": 2345,
        "hitRate": 89.2,
        "lastCleared": "2024-01-15T10:00:00Z"
      }
    ],
    "totalSize": "45.8 MB",
    "overallHitRate": 91.8
  }
}
```

### Clear Cache

```http
POST /api/admin/cache/clear
```

**Request Body:**

```json
{
  "caches": ["users", "threads"],
  "pattern": "user:*"
}
```

### Warm Cache

```http
POST /api/admin/cache/warm
```

## Backup & Restore API

### Get Backup Status

```http
GET /api/admin/backup/status
```

### Create Backup

```http
POST /api/admin/backup/create
```

**Request Body:**

```json
{
  "type": "full",
  "includeUploads": true,
  "compression": "gzip"
}
```

### Restore from Backup

```http
POST /api/admin/backup/restore
```

**Request Body:**

```json
{
  "backupId": "backup_2024-01-15_123456",
  "confirmOverwrite": true
}
```

## Audit Logging

All admin actions are automatically logged:

```json
{
  "id": 789,
  "adminUserId": 123,
  "action": "user.suspend",
  "target": "user:456",
  "metadata": {
    "duration": 7,
    "reason": "Spam behavior"
  },
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2024-01-15T14:30:00Z"
}
```

### Get Audit Logs

```http
GET /api/admin/audit/logs
```

**Query Parameters:**

- `adminUserId` - Filter by admin user
- `action` - Filter by action type
- `target` - Filter by target resource
- `startDate` - Date range start
- `endDate` - Date range end

## WebSocket Events

Admin interfaces can subscribe to real-time events:

```javascript
const socket = new WebSocket('ws://localhost:5001/admin');

socket.on('user.registered', (data) => {
  // New user registration
});

socket.on('content.flagged', (data) => {
  // Content reported for moderation
});

socket.on('economy.transaction', (data) => {
  // New DGT transaction
});
```

## Rate Limiting

Admin endpoints have generous rate limits:

- **Read operations**: 120 requests/minute
- **Write operations**: 60 requests/minute  
- **Bulk operations**: 20 requests/minute
- **Analytics queries**: 30 requests/minute

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `ADMIN_PERMISSION_DENIED` | 403 | Insufficient admin permissions |
| `MODULE_NOT_FOUND` | 404 | Admin module does not exist |
| `MODULE_DISABLED` | 403 | Admin module is disabled |
| `INVALID_ADMIN_ACTION` | 400 | Invalid administrative action |
| `USER_NOT_FOUND` | 404 | Target user does not exist |
| `BACKUP_FAILED` | 500 | Backup operation failed |
| `CACHE_ERROR` | 500 | Cache operation failed |

## Security Considerations

- **IP Restrictions**: Admin access can be limited by IP
- **Session Management**: Admin sessions have shorter timeouts
- **Action Confirmation**: Destructive actions require confirmation
- **Audit Trail**: All admin actions are logged and immutable
- **Rate Limiting**: Prevents abuse of admin endpoints
- **Permission Validation**: Every request validates current permissions