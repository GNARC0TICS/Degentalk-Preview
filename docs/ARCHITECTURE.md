# Degentalk System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Degentalk Platform                       │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React 18 + Vite)          │  Backend (Node.js/Express) │
│  ┌─────────────────────────────────┐  │  ┌─────────────────────────┐ │
│  │  Client Application (Port 5173) │  │  │  API Server (Port 5001) │ │
│  │  ├── Pages & Components        │  │  │  ├── Domain Services     │ │
│  │  ├── State Management (React   │  │  │  ├── Route Handlers      │ │
│  │  │     Query + Context)        │  │  │  ├── Middleware Layer    │ │
│  │  ├── Styling (Tailwind CSS)    │  │  │  └── WebSocket Server    │ │
│  │  └── Build Pipeline (Vite)     │  │  └─────────────────────────┘ │
│  └─────────────────────────────────┘  └─────────────────────────────┘
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      External Services                          │
├─────────────────────┬─────────────────────┬─────────────────────┤
│   Database Layer    │   File Storage      │   Payment Services  │
│  ┌─────────────────┐│  ┌─────────────────┐│  ┌─────────────────┐│
│  │ PostgreSQL      ││  │ Local Storage   ││  │ CCPayment API   ││
│  │ - User Data     ││  │ - Avatars       ││  │ - Crypto Deposits││
│  │ - Forum Content ││  │ - Attachments   ││  │ - Withdrawals   ││
│  │ - Transactions  ││  │ - Backups       ││  │ - Rate Data     ││
│  │ - Audit Logs    ││  └─────────────────┘│  └─────────────────┘│
│  └─────────────────┘└─────────────────────┴─────────────────────┘
└─────────────────────────────────────────────────────────────────┘
```

## Domain-Driven Architecture

### Core Domains

```
server/src/domains/
├── auth/                    # Authentication & Session Management
│   ├── middleware/          # Auth middleware and guards
│   ├── routes/             # Login, logout, session routes
│   └── services/           # JWT, session, password services
│
├── forum/                  # Forum & Content Management
│   ├── routes/             # Thread, post, category routes
│   ├── services/           # Business logic for forum operations
│   └── middleware/         # Forum-specific middleware
│
├── xp/                     # Experience Points & Leveling
│   ├── xp.controller.ts    # XP award and query endpoints
│   ├── xp.service.ts       # XP calculation and persistence
│   ├── xp-actions.ts       # Action definitions and config
│   └── events/             # XP-related event handlers
│
├── wallet/                 # Cryptocurrency & DGT Management
│   ├── services/           # CCPayment integration services
│   ├── middleware/         # Webhook and security middleware
│   ├── dgt.service.ts      # DGT token operations
│   └── wallet.controller.ts # Wallet API endpoints
│
├── admin/                  # Administrative Functions
│   ├── sub-domains/        # Modular admin functionality
│   │   ├── users/          # User management
│   │   ├── economy/        # Economic controls
│   │   ├── analytics/      # Platform analytics
│   │   ├── feature-flags/  # A/B testing system
│   │   └── settings/       # System configuration
│   └── admin.middleware.ts # Permission and audit middleware
│
├── engagement/             # User Interaction Systems
│   ├── tip/                # User-to-user DGT tipping
│   ├── rain/               # Community reward distributions
│   └── reactions/          # Post likes and reactions
│
└── messaging/              # Communication Systems
    ├── shoutbox/           # Real-time chat system
    ├── notifications/      # User notification system
    └── webhooks/           # External webhook integrations
```

### Database Schema Organization

```
db/schema/
├── index.ts                # Schema export aggregation
├── user/                   # User Management Schema
│   ├── users.ts            # Core user data
│   ├── userProfiles.ts     # Extended profile information
│   ├── userSessions.ts     # Session management
│   └── userPermissions.ts  # Role-based permissions
│
├── forum/                  # Forum Content Schema
│   ├── categories.ts       # Forum categories/zones
│   ├── threads.ts          # Discussion threads
│   ├── posts.ts            # Thread replies and comments
│   ├── postLikes.ts        # Post reaction system
│   └── threadTags.ts       # Thread tagging system
│
├── economy/               # Economic System Schema
│   ├── wallets.ts         # User DGT wallets
│   ├── transactions.ts    # DGT transaction history
│   ├── xpActionLogs.ts    # XP award tracking
│   ├── xpActionSettings.ts # XP action configuration
│   ├── levels.ts          # User level definitions
│   └── postTips.ts        # Tipping transaction records
│
├── shop/                  # Marketplace Schema
│   ├── products.ts        # Digital goods and services
│   ├── inventory.ts       # User-owned items
│   ├── orders.ts          # Purchase transaction records
│   └── dgtPackages.ts     # DGT token purchase packages
│
├── messaging/             # Communication Schema
│   ├── shoutboxMessages.ts # Real-time chat messages
│   ├── notifications.ts   # User notification system
│   └── directMessages.ts  # Private messaging system
│
└── admin/                 # Administrative Schema
    ├── auditLogs.ts       # Admin action tracking
    ├── featureFlags.ts    # A/B testing configuration
    ├── systemSettings.ts  # Platform configuration
    └── backups.ts         # Backup management records
```

## Component Architecture (Frontend)

### Page-Level Components

```
client/src/pages/
├── admin/                  # Administrative Interface
│   ├── admin-layout.tsx    # Shared admin layout
│   ├── dashboard.tsx       # Admin dashboard overview
│   ├── users.tsx           # User management interface
│   ├── economy.tsx         # Economic controls
│   ├── analytics.tsx       # Platform analytics
│   └── settings.tsx        # System configuration
│
├── forum/                  # Forum Pages
│   ├── forum-home.tsx      # Forum landing page
│   ├── category.tsx        # Category thread listing
│   ├── thread.tsx          # Thread view with posts
│   └── create-thread.tsx   # Thread creation form
│
├── wallet.tsx              # Wallet management page
├── profile.tsx             # User profile pages
└── auth.tsx                # Authentication flows
```

### Shared Component Library

```
client/src/components/
├── ui/                     # Base UI Components (shadcn/ui)
│   ├── button.tsx          # Button variants
│   ├── card.tsx            # Card layouts
│   ├── input.tsx           # Form inputs
│   ├── dialog.tsx          # Modal dialogs
│   └── dropdown-menu.tsx   # Dropdown menus
│
├── forum/                  # Forum-Specific Components
│   ├── ThreadCard.tsx      # Thread list item (mobile-optimized)
│   ├── PostCard.tsx        # Post display (responsive)
│   ├── ReplyForm.tsx       # Post creation form
│   ├── ThreadFilters.tsx   # Filter and sort controls
│   └── layouts/            # Responsive forum layouts
│       ├── ResponsiveForumLayout.tsx
│       ├── AdaptiveForumGrid.tsx
│       └── MobileForumNavigation.tsx
│
├── admin/                  # Admin Interface Components
│   ├── ModularAdminSidebar.tsx    # Permission-aware navigation
│   ├── ModularAdminLayout.tsx     # Responsive admin layout
│   ├── AdminDashboard.tsx         # Dashboard with module status
│   ├── FeatureFlagRow.tsx         # Feature flag management
│   └── UserManagementTable.tsx    # User administration
│
├── economy/               # Economic Components
│   ├── wallet/            # DGT and crypto wallet UI
│   │   ├── wallet-balance-display.tsx
│   │   ├── dgt-transfer.tsx
│   │   ├── transaction-history.tsx
│   │   └── tip-button.tsx
│   └── xp/                # XP and leveling UI
│       ├── xp-progress-bar.tsx
│       ├── level-badge.tsx
│       └── xp-action-log.tsx
│
├── widgets/               # Reusable Widget Components
│   └── ProfileCard.tsx    # User profile sidebar widget with live data
│
└── shared/                # Shared Utilities
    ├── navigation/        # Navigation components
    ├── forms/             # Form building blocks
    ├── loading/           # Loading states and skeletons
    └── errors/            # Error boundaries and displays
```

### State Management Architecture

```typescript
// React Query for Server State
client/src/hooks/
├── use-auth.ts            # Authentication state
├── use-wallet.ts          # Wallet data and operations
├── use-forum.ts           # Forum content queries
├── use-admin.ts           # Admin data and actions
└── use-xp.ts              # XP and level information

// Context for Client State
client/src/contexts/
├── AuthContext.tsx        # User authentication state
├── ForumStructureContext.tsx  # Forum navigation data
├── NotificationContext.tsx    # Toast notifications
└── ThemeContext.tsx       # UI theme and preferences
```

## API Architecture

### RESTful API Design

```
/api/
├── auth/                  # Authentication Endpoints
│   ├── POST /login        # User login
│   ├── POST /logout       # User logout
│   ├── POST /register     # User registration
│   └── GET /session       # Current session info
│
├── forum/                 # Forum Content API
│   ├── threads/           # Thread management
│   │   ├── GET /          # List threads with filters
│   │   ├── POST /         # Create new thread
│   │   ├── GET /:id       # Get thread by ID
│   │   └── PUT /:id/solve # Mark thread as solved
│   ├── posts/             # Post management
│   │   ├── POST /         # Create reply
│   │   ├── PUT /:id       # Update post
│   │   ├── DELETE /:id    # Delete post
│   │   └── POST /:id/react # Like/unlike post
│   └── categories/        # Category management
│       ├── GET /          # List all categories
│       └── GET /:id       # Get category details
│
├── xp/                    # Experience Point System
│   ├── POST /award-action # Award XP for user action
│   ├── GET /user/:id      # Get user XP information
│   ├── GET /actions       # List available XP actions
│   └── GET /logs/:id      # Get user XP history
│
├── wallet/                # Wallet & Economy API
│   ├── GET /balances      # DGT and crypto balances
│   ├── GET /deposit-addresses # Crypto deposit addresses
│   ├── POST /transfer-dgt # Transfer DGT between users
│   ├── POST /withdraw     # Request crypto withdrawal
│   ├── GET /transactions  # Transaction history
│   └── GET /config        # Wallet feature configuration
│
└── admin/                 # Administrative API
    ├── modules/           # Module management
    │   ├── GET /          # List available modules
    │   ├── GET /:id       # Get module configuration
    │   └── PATCH /:id     # Update module settings
    ├── users/             # User administration
    │   ├── GET /          # List users with filters
    │   ├── GET /:id       # Get user details
    │   ├── PATCH /:id     # Update user
    │   └── POST /:id/suspend # Suspend user account
    ├── analytics/         # Platform analytics
    │   ├── GET /dashboard # Dashboard statistics
    │   ├── GET /users     # User analytics
    │   └── GET /economy   # Economic analytics
    └── feature-flags/     # Feature flag management
        ├── GET /          # List all feature flags
        ├── PATCH /:key    # Update feature flag
        └── POST /:key/test # Test flag for user
```

### WebSocket Events

```typescript
// Real-time event system
interface WebSocketEvents {
  // Forum events
  'thread:new_post': { threadId: number; post: Post };
  'thread:solved': { threadId: number; solvingPostId: number };
  'post:liked': { postId: number; likeCount: number };
  
  // Economy events
  'xp:awarded': { userId: number; amount: number; action: string };
  'xp:level_up': { userId: number; newLevel: number; previousLevel: number };
  'dgt:transfer': { fromUserId: number; toUserId: number; amount: number };
  
  // Admin events
  'user:suspended': { userId: number; adminId: number; reason: string };
  'feature_flag:updated': { key: string; enabled: boolean };
  
  // Shoutbox events
  'shoutbox:message': { message: ShoutboxMessage };
  'shoutbox:user_joined': { userId: number; username: string };
}
```

## Security Architecture

### Authentication Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Login    │───▶│  Auth Service   │───▶│  Session Store  │
│                 │    │                 │    │                 │
│ • Username/Pass │    │ • Verify Creds  │    │ • JWT Token     │
│ • Remember Me   │    │ • Generate JWT  │    │ • Expiry Time   │
│ • CSRF Token    │    │ • Create Session│    │ • User Context  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Permission System

```typescript
// Role-based permissions
interface PermissionSystem {
  roles: {
    super_admin: ['admin.full_access'];
    admin: [
      'admin.users.manage',
      'admin.content.moderate', 
      'admin.economy.manage',
      'admin.settings.configure'
    ];
    moderator: [
      'admin.content.moderate',
      'admin.users.warn'
    ];
    user: [];
  };
  
  // Module-level permissions
  modules: {
    'feature-flags': ['admin.settings.configure'];
    'user-management': ['admin.users.manage'];
    'economy': ['admin.economy.manage'];
    'analytics': ['admin.analytics.view'];
  };
}
```

### Rate Limiting Strategy

```typescript
// Endpoint-specific rate limits
const rateLimits = {
  // Authentication
  'POST /api/auth/login': '5 requests/minute',
  'POST /api/auth/register': '3 requests/minute',
  
  // Forum operations
  'POST /api/forum/threads': '5 requests/hour',
  'POST /api/forum/posts': '30 requests/hour',
  'POST /api/forum/posts/:id/react': '60 requests/minute',
  
  // Economy operations
  'POST /api/xp/award-action': '20 requests/minute',
  'POST /api/wallet/transfer-dgt': '10 requests/minute',
  'POST /api/wallet/withdraw': '5 requests/minute',
  
  // Admin operations
  'GET /api/admin/*': '120 requests/minute',
  'POST /api/admin/*': '60 requests/minute',
  'PATCH /api/admin/*': '60 requests/minute'
};
```

## Performance Optimizations

### Caching Strategy

```typescript
// Multi-layer caching system
interface CachingLayers {
  // Application-level caching
  memory: {
    'user-sessions': '15 minutes',
    'forum-categories': '1 hour',
    'xp-actions': '1 hour',
    'feature-flags': '5 minutes'
  };
  
  // Database query caching
  database: {
    'thread-lists': '2 minutes',
    'user-profiles': '5 minutes',
    'wallet-balances': '30 seconds'
  };
  
  // CDN/Static asset caching
  static: {
    'avatars': '1 day',
    'attachments': '1 week',
    'css/js': '1 year with versioning'
  };
}
```

### Database Optimizations

```sql
-- Key database indexes for performance
CREATE INDEX CONCURRENTLY idx_threads_category_active 
ON threads(category_id, last_post_at DESC) 
WHERE is_hidden = false;

CREATE INDEX CONCURRENTLY idx_posts_thread_created 
ON posts(thread_id, created_at ASC) 
WHERE is_hidden = false;

CREATE INDEX CONCURRENTLY idx_xp_logs_user_action 
ON xp_action_logs(user_id, action, created_at DESC);

CREATE INDEX CONCURRENTLY idx_transactions_user_type 
ON transactions(user_id, type, created_at DESC);

-- Partial indexes for admin queries
CREATE INDEX CONCURRENTLY idx_users_admin_search 
ON users(username, email, created_at DESC) 
WHERE role IN ('admin', 'moderator');
```

## Deployment Architecture

### Development Environment

```
Local Development Setup:
├── Frontend (Vite Dev Server)     → http://localhost:5173
├── Backend (tsx with hot reload)  → http://localhost:5001
├── PostgreSQL Database            → localhost:5432
├── File Storage                   → ./uploads/
└── Environment                    → env.local
```

### Production Environment

```
Production Deployment:
├── Frontend (Static Files)        → CDN/Nginx
├── Backend (Node.js Cluster)      → Load Balancer → Multiple Instances
├── PostgreSQL (Primary/Replica)   → Database Cluster
├── File Storage                   → S3/Object Storage
├── Caching Layer                  → Redis Cluster
└── Monitoring                     → Logging + Metrics + Alerts
```

### Scalability Considerations

1. **Database Scaling**
   - Read replicas for query distribution
   - Connection pooling for efficient resource usage
   - Query optimization and indexing strategy

2. **Application Scaling**
   - Horizontal scaling via PM2 cluster mode
   - Load balancing with session affinity
   - Stateless application design

3. **Caching Strategy**
   - Redis for session storage and caching
   - CDN for static asset delivery
   - Application-level query caching

4. **Background Processing**
   - Queue system for async operations
   - Webhook processing and retries
   - Batch operations for admin functions

## Monitoring & Observability

### Logging Strategy

```typescript
// Structured logging with correlation IDs
interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  service: string;
  correlationId: string;
  userId?: number;
  action: string;
  metadata: Record<string, any>;
  duration?: number;
  error?: Error;
}
```

### Key Metrics

```typescript
// Application metrics for monitoring
interface PlatformMetrics {
  // User engagement
  dailyActiveUsers: number;
  threadCreationsPerDay: number;
  postCreationsPerDay: number;
  averageSessionDuration: number;
  
  // Economic metrics
  dgtTransactionVolume: number;
  xpAwardedDaily: number;
  walletBalanceDistribution: number[];
  
  // System performance
  apiResponseTimes: { p50: number; p95: number; p99: number };
  databaseConnectionPool: { active: number; idle: number };
  errorRates: { byEndpoint: Record<string, number> };
  
  // Admin operations
  adminActiveUsers: number;
  moderationActionsPerDay: number;
  featureFlagChanges: number;
}
```

This architecture supports Degentalk's requirements for scalability, maintainability, and feature-rich functionality while maintaining security and performance standards.