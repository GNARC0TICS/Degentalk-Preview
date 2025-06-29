# Admin Panel API

## Legend
| Symbol | Meaning | | Abbrev | Meaning |
|--------|---------|---|--------|---------|
| → | leads to | | API | application programming interface |
| ⚠️ | admin only | | Auth | authentication |
| 🔒 | auth required | | mod | moderator |
| 📊 | analytics | | mgmt | management |

## Overview

Comprehensive administrative interface w/ user management, content moderation, analytics & system configuration.

**Base Path:** `/api/admin`
**Permissions:** All endpoints require admin role unless specified

## User Management

### Get All Users ⚠️
```http
GET /api/admin/users
```

**Query Parameters:**
```
limit=50              # Results per page (max 500)
offset=0              # Pagination offset
search=crypto         # Search username/email
role=user            # Filter by role: user|moderator|admin
status=active        # Filter by status: active|suspended|banned
level=15             # Filter by level
sort=created_desc    # Sort: created_asc|created_desc|level_desc|xp_desc
dateFrom=2025-01-01  # Registration date filter
dateTo=2025-01-31    # Registration date filter
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
        "email": "king@crypto.com",
        "displayName": "Crypto King",
        "roles": ["user"],
        "status": "active",
        "level": 15,
        "xp": 8750,
        "dgtBalance": 1500.50,
        "reputation": 450,
        "stats": {
          "totalThreads": 45,
          "totalPosts": 234,
          "totalLikes": 567,
          "totalTips": 89.50
        },
        "profile": {
          "avatar": "https://cdn.degentalk.com/avatars/123.jpg",
          "bio": "Crypto enthusiast since 2017",
          "location": "Moon",
          "website": "https://cryptoking.io",
          "emailVerified": true,
          "twoFactorEnabled": false
        },
        "activity": {
          "lastLogin": "2025-01-01T12:00:00Z",
          "lastPost": "2025-01-01T11:30:00Z",
          "createdAt": "2024-01-01T00:00:00Z",
          "loginStreak": 15,
          "isOnline": true
        },
        "moderation": {
          "warnings": 0,
          "suspensions": 0,
          "totalReports": 2,
          "reportedBy": 1
        }
      }
    ]
  },
  "pagination": {
    "total": 1500,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  },
  "summary": {
    "totalUsers": 1500,
    "activeUsers": 450,
    "newUsersToday": 12,
    "suspendedUsers": 5,
    "bannedUsers": 2
  }
}
```

### Get User Details ⚠️
```http
GET /api/admin/users/:userId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "username": "cryptoking",
      "email": "king@crypto.com",
      "roles": ["user"],
      "status": "active",
      "profile": {
        "displayName": "Crypto King",
        "avatar": "https://cdn.degentalk.com/avatars/123.jpg",
        "bio": "Crypto enthusiast since 2017",
        "location": "Moon",
        "website": "https://cryptoking.io",
        "socialLinks": {
          "twitter": "@cryptoking",
          "telegram": "cryptoking_tg"
        }
      },
      "gamification": {
        "level": 15,
        "xp": 8750,
        "xpToNextLevel": 250,
        "achievements": 15,
        "badges": ["whale", "og", "expert"]
      },
      "wallet": {
        "dgtBalance": 1500.50,
        "cryptoBalances": {
          "BTC": 0.00125,
          "ETH": 0.025,
          "USDT": 250.00
        },
        "totalDeposits": 5000.00,
        "totalWithdrawals": 500.00,
        "pendingTransactions": 0
      },
      "activity": {
        "totalThreads": 45,
        "totalPosts": 234,
        "totalLikes": 567,
        "averagePostsPerDay": 15.5,
        "favoriteForums": [
          {
            "forumId": "bitcoin-discussion",
            "postCount": 123
          }
        ],
        "lastLogin": "2025-01-01T12:00:00Z",
        "loginStreak": 15,
        "totalLoginDays": 200
      },
      "moderation": {
        "warnings": 0,
        "suspensions": 0,
        "bans": 0,
        "totalReports": 2,
        "reportedBy": 1,
        "moderationNotes": [
          {
            "id": "note_abc123",
            "content": "User reported for spam but no action needed",
            "createdBy": "mod_username",
            "createdAt": "2024-12-15T10:00:00Z"
          }
        ]
      },
      "security": {
        "emailVerified": true,
        "twoFactorEnabled": false,
        "lastPasswordChange": "2024-06-01T00:00:00Z",
        "loginAttempts": 0,
        "ipAddresses": [
          {
            "ip": "192.168.1.100",
            "lastUsed": "2025-01-01T12:00:00Z",
            "location": "United States"
          }
        ]
      }
    }
  }
}
```

### Update User ⚠️
```http
PATCH /api/admin/users/:userId
```

**Body:**
```json
{
  "status": "suspended",
  "roles": ["user", "moderator"],
  "profile": {
    "displayName": "Updated Name",
    "bio": "Updated bio"
  },
  "wallet": {
    "dgtBalance": 2000.00
  },
  "moderation": {
    "reason": "Spam violation",
    "duration": 86400,
    "note": "Temporary suspension for review"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": 123,
    "changes": {
      "status": {
        "old": "active",
        "new": "suspended"
      },
      "roles": {
        "old": ["user"],
        "new": ["user", "moderator"]
      }
    },
    "auditLog": {
      "action": "user_updated",
      "adminId": 1,
      "reason": "Spam violation",
      "timestamp": "2025-01-01T12:00:00Z"
    }
  }
}
```

### Delete User ⚠️
```http
DELETE /api/admin/users/:userId
```

**Body:**
```json
{
  "reason": "GDPR deletion request",
  "anonymizeContent": true,
  "transferDgt": true,
  "targetUserId": 456
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": 123,
    "deleted": true,
    "contentAnonymized": true,
    "dgtTransferred": 1500.50,
    "targetUserId": 456,
    "deletedAt": "2025-01-01T12:00:00Z"
  }
}
```

## Content Moderation

### Get Reported Content ⚠️
```http
GET /api/admin/reports
```

**Query Parameters:**
```
status=pending       # Filter: pending|reviewed|resolved|dismissed
type=thread         # Content type: thread|post|message|user
priority=high       # Priority: low|medium|high|critical
assignedTo=mod123   # Filter by assigned moderator
limit=50            # Results per page
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "report_abc123",
        "type": "thread",
        "contentId": "th_def456",
        "status": "pending",
        "priority": "high",
        "reason": "spam",
        "description": "User posting promotional content repeatedly",
        "reporter": {
          "id": 789,
          "username": "reporter_user",
          "reputation": 250
        },
        "reported": {
          "id": 123,
          "username": "cryptoking",
          "level": 15
        },
        "content": {
          "title": "Buy My Course!",
          "excerpt": "Learn crypto trading secrets...",
          "url": "/zones/primary/bitcoin-discussion/th_def456"
        },
        "assignedTo": {
          "id": 5,
          "username": "mod_alice"
        },
        "createdAt": "2025-01-01T10:00:00Z",
        "updatedAt": "2025-01-01T11:00:00Z"
      }
    ]
  },
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0
  },
  "summary": {
    "pending": 15,
    "inReview": 5,
    "resolved": 150,
    "dismissed": 30
  }
}
```

### Process Report ⚠️
```http
PATCH /api/admin/reports/:reportId
```

**Body:**
```json
{
  "status": "resolved",
  "action": "content_hidden",
  "reason": "Content violates community guidelines",
  "note": "User warned, content hidden",
  "notifyReporter": true,
  "notifyReported": true
}
```

**Actions:** `no_action`, `content_hidden`, `content_deleted`, `user_warned`, `user_suspended`, `user_banned`

### Bulk Content Action ⚠️
```http
POST /api/admin/content/bulk-action
```

**Body:**
```json
{
  "action": "hide",
  "contentType": "thread",
  "contentIds": ["th_abc123", "th_def456", "th_ghi789"],
  "reason": "Spam cleanup",
  "notifyUsers": false
}
```

## Analytics & Statistics

### Platform Overview 📊 ⚠️
```http
GET /api/admin/analytics/overview
```

**Query Parameters:**
```
period=30d          # Period: 7d|30d|90d|1y|all
timezone=UTC        # Timezone for date calculations
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-12-01T00:00:00Z",
      "end": "2025-01-01T00:00:00Z"
    },
    "users": {
      "total": 1500,
      "new": 120,
      "active": 450,
      "retention": {
        "day1": 0.85,
        "day7": 0.65,
        "day30": 0.45
      },
      "growth": {
        "rate": 0.08,
        "trend": "increasing"
      }
    },
    "content": {
      "threads": {
        "total": 15420,
        "new": 1200,
        "averagePerDay": 40.0
      },
      "posts": {
        "total": 89543,
        "new": 7500,
        "averagePerDay": 250.0
      },
      "engagement": {
        "likes": 45000,
        "tips": 2500,
        "shares": 890
      }
    },
    "economy": {
      "dgt": {
        "totalSupply": 5000000.00,
        "circulating": 1250000.00,
        "burned": 50000.00
      },
      "transactions": {
        "total": 25000,
        "volume": 250000.00,
        "averageAmount": 10.00
      },
      "revenue": {
        "subscriptions": 15000.00,
        "shop": 5000.00,
        "fees": 2500.00
      }
    },
    "performance": {
      "uptime": 99.95,
      "averageResponseTime": 250,
      "errorRate": 0.01
    }
  }
}
```

### User Analytics 📊 ⚠️
```http
GET /api/admin/analytics/users
```

**Response:**
```json
{
  "success": true,
  "data": {
    "demographics": {
      "byLevel": {
        "1-5": 750,
        "6-10": 450,
        "11-15": 200,
        "16-20": 75,
        "21+": 25
      },
      "byJoinDate": {
        "thisMonth": 120,
        "lastMonth": 95,
        "last3Months": 280
      },
      "byActivity": {
        "daily": 150,
        "weekly": 200,
        "monthly": 100,
        "inactive": 1050
      }
    },
    "engagement": {
      "topContributors": [
        {
          "userId": 123,
          "username": "cryptoking",
          "posts": 234,
          "xp": 8750
        }
      ],
      "moderationStats": {
        "reportedUsers": 25,
        "suspendedUsers": 5,
        "bannedUsers": 2
      }
    },
    "retention": {
      "newUserActivity": {
        "day1": 0.85,
        "day7": 0.65,
        "day30": 0.45
      },
      "churnRisk": {
        "high": 50,
        "medium": 100,
        "low": 300
      }
    }
  }
}
```

### Financial Analytics 📊 ⚠️
```http
GET /api/admin/analytics/financial
```

**Response:**
```json
{
  "success": true,
  "data": {
    "dgt": {
      "totalSupply": 5000000.00,
      "circulating": 1250000.00,
      "locked": 3750000.00,
      "burned": 50000.00,
      "dailyMinted": 10000.00,
      "marketCap": 500000.00
    },
    "transactions": {
      "deposits": {
        "count": 1500,
        "volume": 125000.00,
        "averageAmount": 83.33
      },
      "withdrawals": {
        "count": 250,
        "volume": 25000.00,
        "averageAmount": 100.00
      },
      "transfers": {
        "count": 5000,
        "volume": 100000.00,
        "averageAmount": 20.00
      },
      "tips": {
        "count": 2500,
        "volume": 50000.00,
        "averageAmount": 20.00
      }
    },
    "revenue": {
      "subscriptions": {
        "monthly": 15000.00,
        "annual": 50000.00
      },
      "shop": {
        "sales": 5000.00,
        "items": 150
      },
      "fees": {
        "withdrawal": 2500.00,
        "transaction": 500.00
      }
    },
    "risks": {
      "largeWithdrawals": 5,
      "suspiciousActivity": 2,
      "complianceAlerts": 0
    }
  }
}
```

## System Configuration

### Get System Settings ⚠️
```http
GET /api/admin/settings
```

**Response:**
```json
{
  "success": true,
  "data": {
    "platform": {
      "siteName": "Degentalk",
      "siteDescription": "The satirical crypto forum",
      "maintenanceMode": false,
      "registrationEnabled": true,
      "emailVerificationRequired": true
    },
    "forum": {
      "maxThreadsPerDay": 10,
      "maxPostsPerDay": 50,
      "allowGuestViewing": true,
      "moderationMode": "reactive",
      "autoLockThreads": false
    },
    "wallet": {
      "allowCryptoDeposits": true,
      "allowCryptoWithdrawals": true,
      "allowInternalTransfers": true,
      "dgtUsdPrice": 0.10,
      "minDepositUsd": 10.00,
      "maxDgtBalance": 1000000.00
    },
    "gamification": {
      "xpEnabled": true,
      "achievementsEnabled": true,
      "missionsEnabled": true,
      "leaderboardsEnabled": true
    },
    "security": {
      "rateLimitEnabled": true,
      "csrfProtectionEnabled": true,
      "sessionTimeout": 604800,
      "maxLoginAttempts": 5
    },
    "notifications": {
      "emailEnabled": true,
      "webhooksEnabled": true,
      "discordIntegration": false
    }
  }
}
```

### Update System Settings ⚠️
```http
PATCH /api/admin/settings
```

**Body:**
```json
{
  "platform": {
    "maintenanceMode": true,
    "maintenanceMessage": "System maintenance in progress"
  },
  "wallet": {
    "allowCryptoWithdrawals": false,
    "dgtUsdPrice": 0.12
  }
}
```

### Get Feature Flags ⚠️
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
        "name": "new_chat_ui",
        "description": "Enable new chat interface",
        "enabled": true,
        "rolloutPercentage": 50,
        "targetUsers": ["beta_testers"],
        "environment": ["development", "staging"]
      },
      {
        "name": "advanced_trading",
        "description": "Advanced trading features",
        "enabled": false,
        "rolloutPercentage": 0,
        "targetUsers": [],
        "environment": ["production"]
      }
    ]
  }
}
```

## Audit & Logs

### Get Audit Logs ⚠️
```http
GET /api/admin/audit-logs
```

**Query Parameters:**
```
action=user_updated  # Filter by action type
userId=123          # Filter by target user
adminId=5           # Filter by admin user
dateFrom=2025-01-01 # Date range
dateTo=2025-01-31   # Date range
limit=100           # Results per page
```

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "audit_abc123",
        "action": "user_suspended",
        "adminUser": {
          "id": 5,
          "username": "admin_alice"
        },
        "targetUser": {
          "id": 123,
          "username": "cryptoking"
        },
        "details": {
          "reason": "Spam violation",
          "duration": 86400,
          "previousStatus": "active",
          "newStatus": "suspended"
        },
        "metadata": {
          "ipAddress": "192.168.1.100",
          "userAgent": "Mozilla/5.0...",
          "sessionId": "sess_def456"
        },
        "createdAt": "2025-01-01T12:00:00Z"
      }
    ]
  },
  "pagination": {
    "total": 500,
    "limit": 100,
    "offset": 0
  }
}
```

### Get System Logs ⚠️
```http
GET /api/admin/system-logs
```

**Query Parameters:**
```
level=error         # Log level: debug|info|warn|error|fatal
source=auth        # Log source: auth|forum|wallet|chat
dateFrom=2025-01-01 # Date range
limit=200          # Results per page
```

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log_abc123",
        "level": "error",
        "source": "wallet",
        "message": "Failed to process withdrawal",
        "details": {
          "userId": 123,
          "withdrawalId": "wd_def456",
          "error": "Insufficient balance",
          "stackTrace": "Error: Insufficient balance..."
        },
        "timestamp": "2025-01-01T12:00:00Z"
      }
    ]
  }
}
```

## Backup & Maintenance

### Create System Backup ⚠️
```http
POST /api/admin/backup
```

**Body:**
```json
{
  "type": "full",
  "includeUserData": true,
  "includeUploads": true,
  "compression": "gzip"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "backupId": "backup_abc123",
    "type": "full",
    "status": "in_progress",
    "estimatedCompletion": "2025-01-01T13:00:00Z",
    "createdAt": "2025-01-01T12:00:00Z"
  }
}
```

### Get Backup Status ⚠️
```http
GET /api/admin/backup/:backupId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "backup": {
      "id": "backup_abc123",
      "type": "full",
      "status": "completed",
      "size": 2048576000,
      "downloadUrl": "https://backups.degentalk.com/backup_abc123.tar.gz",
      "expiresAt": "2025-01-08T12:00:00Z",
      "createdAt": "2025-01-01T12:00:00Z",
      "completedAt": "2025-01-01T12:45:00Z"
    }
  }
}
```

## Rate Limiting & Security

### Rate Limits
- **Admin endpoints:** 1000 requests/hour per admin
- **Bulk operations:** 10 per hour per admin
- **System changes:** 100 per hour per admin
- **Analytics queries:** 500 per hour per admin

### Security Features
- **Admin session logging** tracks all administrative actions
- **IP whitelisting** for sensitive operations
- **Two-factor authentication** required for admin accounts
- **Audit trails** for all data modifications

### Validation
- **Role verification** on all endpoints
- **Input sanitization** prevents injection attacks
- **Permission checks** for specific admin actions
- **Backup encryption** for sensitive data

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| `ADMIN_001` | Access denied | Insufficient admin permissions |
| `ADMIN_002` | User not found | Invalid user ID |
| `ADMIN_003` | Invalid action | Unknown administrative action |
| `ADMIN_004` | Operation locked | Action temporarily unavailable |
| `ADMIN_005` | Backup failed | System backup error |
| `ADMIN_006` | Settings invalid | Configuration validation failed |
| `ADMIN_007` | Audit log error | Logging system failure |
| `ADMIN_008` | Bulk limit exceeded | Too many items in bulk operation |

## Integration Examples

### Admin Dashboard
```typescript
import { useAdminData } from '@/hooks/use-admin';

function AdminDashboard() {
  const {
    users,
    reports,
    analytics,
    updateUser,
    processReport
  } = useAdminData();

  const handleUserAction = async (userId: number, action: string) => {
    try {
      await updateUser(userId, { status: action });
      toast.success(`User ${action} successfully`);
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  return (
    <div>
      <UserManagement users={users} onAction={handleUserAction} />
      <ReportQueue reports={reports} onProcess={processReport} />
      <AnalyticsDashboard data={analytics} />
    </div>
  );
}
```

### Bulk User Management
```typescript
const bulkUpdateUsers = async (userIds: number[], updates: UserUpdate) => {
  const promises = userIds.map(userId => 
    api.updateUser(userId, updates)
  );
  
  const results = await Promise.allSettled(promises);
  
  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  console.log(`Updated ${successful} users, ${failed} failed`);
};
```

---

**📚 Documentation:** `/docs/api/admin/README.md`

**Related:**
- [User Management](./users.md)
- [Content Moderation](./moderation.md)
- [System Analytics](./analytics.md)
- [Security Configuration](./security.md)