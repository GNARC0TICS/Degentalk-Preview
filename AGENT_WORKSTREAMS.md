# 🚀 DegenTalk Agent Workstreams

**Purpose**: Break down 142 server TODOs into 6 focused workstreams that agents can complete end-to-end. Each workstream ships complete functionality without context-switching.

**Agent Rules:**
- ✅ **Ship working endpoints** - No 404s, always return valid responses
- 🔒 **Security first** - Use `getAuthenticatedUser(req)` pattern, never hardcode IDs
- 📊 **Use transformers** - Always return DTOs via `toPublicX()`, `toAuthenticatedX()`, `toAdminX()`
- 🏗️ **Follow patterns** - Match existing service/controller/route patterns in codebase
- ⚡ **Stub smartly** - Return realistic dummy data that clients can use

---

## Workstream 1: 🔐 Auth & Security Foundation
**Priority: CRITICAL** | **Effort: 2-3 hours** | **Files: 8**

### Scope
Complete authentication security across advertising domain and core middleware.

### Critical Issues
```yaml
Files to fix:
  - server/src/domains/advertising/ad.controller.ts (5 TODOs)
  - server/src/domains/advertising/ad-admin.controller.ts (2 TODOs) 
  - server/src/domains/advertising/ad.routes.ts (4 TODOs)
  - server/src/core/middleware/rate-limit.service.ts (1 TODO)

Security gaps:
  - Hardcoded user IDs: 'user-123', 'admin-123' 
  - Missing JWT authentication middleware
  - No rate limiting on ad serving
  - Missing admin role verification
```

### Goals ✅
- [ ] Zero hardcoded user IDs in advertising domain
- [ ] JWT authentication middleware implemented and applied
- [ ] Rate limiting active on high-traffic endpoints
- [ ] Admin-only routes properly protected

### Implementation Guide

#### Step 1: Authentication Pattern Fix
```typescript
// ❌ BEFORE (everywhere in ad.controller.ts)
const userId = req.body.userId || 'user-123';

// ✅ AFTER 
const user = getAuthenticatedUser(req);
if (!user) {
  return sendErrorResponse(res, 'Authentication required', 401);
}
const userId = user.id;
```

#### Step 2: JWT Middleware Implementation
```typescript
// File: server/src/domains/advertising/ad.routes.ts
// Add to campaign routes (lines 272-278 TODOs)

import { authenticateJWT } from '@server/middleware/authenticate-jwt';
import { requireAdminRole } from '@server/middleware/admin-auth';

// Apply to campaign routes
router.use('/campaigns', authenticateJWT);
router.use('/admin', requireAdminRole);
```

#### Step 3: Rate Limiting
```typescript
// File: server/src/core/middleware/rate-limit.service.ts
// Implement the TODO: Create rate limiting middleware

export const adServingRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute per IP
  message: 'Too many ad requests'
});

// Apply to ad serving endpoint
router.get('/serve', adServingRateLimit, adController.serveAd);
```

### Acceptance Criteria
- All `/api/ads/campaigns/*` routes require valid JWT
- All `/api/ads/admin/*` routes require admin role
- Ad serving endpoint has rate limiting (1000/min)
- No hardcoded user IDs remain in advertising domain

---

## Workstream 2: 🗄️ Database Schema & Migrations  
**Priority: HIGH** | **Effort: 3-4 hours** | **Files: 12**

### Scope
Complete missing database columns and schema updates for missions, social features, and platform functionality.

### Schema Gaps
```yaml
Missing columns:
  - missions table: conditions (TEXT), prerequisites (JSONB)
  - social relationships: status tracking, privacy settings
  - ad_campaigns: targeting_data (JSONB), performance_metrics (JSONB)

Services affected:
  - domains/missions/missions.service.ts (3 TODOs)
  - domains/social/mentions.service.ts (2 TODOs) 
  - domains/advertising/ad-configuration.service.ts (1 TODO)
```

### Goals ✅
- [ ] All missions functionality has proper database backing
- [ ] Social service connects to real tables (not disabled)
- [ ] Ad configuration stores targeting data persistently

### Implementation Guide

#### Step 1: Create Migrations
```bash
# Generate new migration
pnpm db:migrate

# Edit the generated SQL file
```

```sql
-- Example migration for missions
ALTER TABLE missions 
ADD COLUMN conditions TEXT,
ADD COLUMN prerequisites JSONB DEFAULT '{}',
ADD COLUMN completion_tracking JSONB DEFAULT '{}';

-- Example for social relationships  
ALTER TABLE social_relationships
ADD COLUMN status VARCHAR(20) DEFAULT 'active',
ADD COLUMN privacy_level VARCHAR(20) DEFAULT 'public';
```

#### Step 2: Update Schema Files
```typescript
// File: db/schema/missions.ts
export const missions = pgTable('missions', {
  id: uuid('id').primaryKey().defaultRandom(),
  // ... existing columns
  conditions: text('conditions'), // NEW
  prerequisites: jsonb('prerequisites').notNull().default('{}'), // NEW
  completionTracking: jsonb('completion_tracking').notNull().default('{}') // NEW
});
```

#### Step 3: Update Service Methods
```typescript
// File: domains/missions/missions.service.ts
export async function createMission(data: MissionCreateData) {
  return await db.insert(missions).values({
    ...data,
    conditions: data.conditions || null, // Use new column
    prerequisites: data.prerequisites || {},
    completionTracking: {}
  }).returning();
}
```

### Testing
```bash
# Apply migrations
pnpm db:migrate:apply

# Verify schema
pnpm db:studio # Check tables have new columns

# Test service methods
curl -X POST localhost:5001/api/missions -H "Content-Type: application/json" -d '{"title":"Test Mission","conditions":"user.level >= 5"}'
```

---

## Workstream 3: 🚀 Core Feature APIs
**Priority: HIGH** | **Effort: 4-5 hours** | **Files: 15**

### Scope  
Implement missing core features that block user flows: tipping, XP calculations, payment processing, achievement system.

### Feature Gaps
```yaml
Payment flows:
  - CCPayment integration for USDT/DGT (shop.routes.ts)
  - Tip processing with XP rewards (tip.service.ts) 
  - DGT balance validation (wallet.service.ts)

Gamification:
  - Achievement processor logic (achievement-processor.service.ts)
  - XP calculation for posts/tips (post.service.ts)
  - Login streak tracking (gamification/services/analytics.service.ts)

API endpoints missing:
  - POST /api/forum/posts/:id/tip 
  - GET /api/achievements/progress
  - POST /api/wallet/purchase-dgt
```

### Goals ✅
- [ ] Users can tip posts with DGT and earn XP
- [ ] Achievement system processes and grants rewards
- [ ] DGT purchase flow works end-to-end
- [ ] XP calculations work for all user actions

### Implementation Guide

#### Step 1: Tip Processing Flow
```typescript
// File: domains/engagement/tip/tip.service.ts
export async function processTip(tipData: {
  fromUserId: UserId;
  toUserId: UserId; 
  postId: PostId;
  amount: number;
}) {
  // 1. Validate DGT balance
  const balance = await walletService.getDgtBalance(tipData.fromUserId);
  if (balance < tipData.amount) {
    throw new Error('Insufficient DGT balance');
  }

  // 2. Process payment
  await walletService.transferDgt(
    tipData.fromUserId, 
    tipData.toUserId, 
    tipData.amount,
    'tip',
    { postId: tipData.postId }
  );

  // 3. Award XP to recipient  
  await xpService.awardXp(tipData.toUserId, tipData.amount * 0.1, 'received_tip');

  // 4. Check achievements
  await achievementProcessor.checkTipAchievements(tipData);

  return { success: true, tipId: generateId() };
}
```

#### Step 2: Achievement Processing
```typescript
// File: domains/gamification/achievements/achievement-processor.service.ts
export async function processAchievement(userId: UserId, action: string, metadata: any) {
  const templates = await getAchievementTemplates();
  
  for (const template of templates) {
    const progress = await getUserAchievementProgress(userId, template.id);
    
    // Simple condition evaluation
    if (template.trigger === action) {
      progress.current += metadata.amount || 1;
      
      if (progress.current >= template.target) {
        await grantAchievement(userId, template.id);
        await xpService.awardXp(userId, template.xpReward, 'achievement');
      } else {
        await updateAchievementProgress(userId, template.id, progress);
      }
    }
  }
}
```

#### Step 3: API Route Implementation
```typescript
// File: domains/forum/routes/post.routes.ts
router.post('/:postId/tip', authenticateJWT, async (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const { amount } = req.body;
    const postId = req.params.postId as PostId;
    
    // Get post author
    const post = await postService.getPostById(postId);
    
    const result = await tipService.processTip({
      fromUserId: user.id,
      toUserId: post.authorId,
      postId,
      amount
    });
    
    sendSuccessResponse(res, result);
  } catch (error) {
    sendErrorResponse(res, error.message, 400);
  }
});
```

### Testing Flow
```bash
# 1. User has DGT balance
curl -X GET localhost:5001/api/wallet/balance

# 2. Tip a post  
curl -X POST localhost:5001/api/forum/posts/abc123/tip \
  -H "Authorization: Bearer $JWT" \
  -d '{"amount": 10}'

# 3. Check XP increased
curl -X GET localhost:5001/api/users/me/profile

# 4. Check achievement progress  
curl -X GET localhost:5001/api/achievements/progress
```

---

## Workstream 4: 📊 Admin & Analytics Dashboard
**Priority: HIGH** | **Effort: 3-4 hours** | **Files: 10**

### Scope
Complete admin tools for platform management, fraud detection, and analytics reporting.

### Admin Gaps
```yaml
Missing admin features:
  - Fraud detection alerts (ad-admin.controller.ts)
  - Platform revenue reporting (ad-admin.controller.ts)
  - User management bulk actions (admin/users.service.ts)
  - System health monitoring (admin/analytics/)

Dashboard endpoints needed:
  - GET /api/admin/analytics/platform-stats
  - GET /api/admin/fraud/alerts
  - POST /api/admin/users/bulk-action
  - GET /api/admin/reports/revenue
```

### Goals ✅
- [ ] Admin dashboard shows platform health metrics
- [ ] Fraud detection system alerts on suspicious activity
- [ ] Revenue reporting shows DGT/fiat breakdown
- [ ] User management supports bulk operations

### Implementation Guide

#### Step 1: Platform Analytics
```typescript
// File: domains/admin/sub-domains/analytics/system-analytics.service.ts
export async function getPlatformStats(timeRange: { from: Date; to: Date }) {
  const stats = await db.execute(sql`
    SELECT 
      COUNT(DISTINCT users.id) as active_users,
      COUNT(DISTINCT threads.id) as new_threads,
      SUM(dgt_transactions.amount) as dgt_volume,
      AVG(session_logs.duration) as avg_session_time
    FROM users 
    LEFT JOIN threads ON threads.created_at >= ${timeRange.from}
    LEFT JOIN dgt_transactions ON dgt_transactions.created_at >= ${timeRange.from}
    LEFT JOIN session_logs ON session_logs.created_at >= ${timeRange.from}
    WHERE users.created_at >= ${timeRange.from}
  `);

  return {
    activeUsers: stats.rows[0].active_users,
    newThreads: stats.rows[0].new_threads, 
    dgtVolume: stats.rows[0].dgt_volume,
    avgSessionTime: stats.rows[0].avg_session_time,
    generatedAt: new Date()
  };
}
```

#### Step 2: Fraud Detection
```typescript
// File: domains/admin/sub-domains/analytics/fraud-detection.service.ts
export async function detectSuspiciousActivity() {
  // Check for rapid DGT transfers
  const rapidTransfers = await db.execute(sql`
    SELECT user_id, COUNT(*) as transfer_count
    FROM dgt_transactions 
    WHERE created_at >= NOW() - INTERVAL '1 hour'
    GROUP BY user_id
    HAVING COUNT(*) > 50
  `);

  // Check for unusual voting patterns
  const suspiciousVotes = await db.execute(sql`
    SELECT user_id, COUNT(DISTINCT thread_id) as unique_threads
    FROM thread_votes
    WHERE created_at >= NOW() - INTERVAL '10 minutes'
    GROUP BY user_id  
    HAVING COUNT(*) > 100 AND COUNT(DISTINCT thread_id) < 5
  `);

  return {
    rapidTransfers: rapidTransfers.rows.map(row => ({
      userId: row.user_id,
      transferCount: row.transfer_count,
      severity: 'high',
      type: 'rapid_transfers'
    })),
    suspiciousVotes: suspiciousVotes.rows.map(row => ({
      userId: row.user_id,
      voteCount: row.unique_threads, 
      severity: 'medium',
      type: 'vote_manipulation'
    }))
  };
}
```

#### Step 3: Admin API Routes
```typescript
// File: domains/admin/admin.routes.ts
router.get('/analytics/platform-stats', asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const timeRange = {
    from: new Date(from as string),
    to: new Date(to as string)
  };
  
  const stats = await systemAnalyticsService.getPlatformStats(timeRange);
  sendSuccessResponse(res, stats);
}));

router.get('/fraud/alerts', asyncHandler(async (req, res) => {
  const alerts = await fraudDetectionService.detectSuspiciousActivity();
  sendSuccessResponse(res, alerts);
}));
```

### Admin Dashboard Integration
```typescript
// Example frontend usage
const dashboardData = await Promise.all([
  fetch('/api/admin/analytics/platform-stats?from=2025-01-01&to=2025-01-14'),
  fetch('/api/admin/fraud/alerts'),
  fetch('/api/admin/users/recent-signups')
]);
```

---

## Workstream 5: ⚡ Performance & Caching
**Priority: MEDIUM** | **Effort: 2-3 hours** | **Files: 8**

### Scope
Add caching layers, optimize database queries, and implement session tracking for better performance.

### Performance Gaps
```yaml
Caching needed:
  - Ad serving responses (ad-serving.service.ts)
  - Forum thread lists (thread.service.ts)
  - User profile data (profile.service.ts)
  - Analytics dashboard queries

Optimization opportunities:  
  - Drizzle IN-clause support (thread.service.ts)
  - Session retention tracking (analytics.service.ts)
  - Image optimization (storage.service.ts)
```

### Goals ✅
- [ ] Ad serving responses cached for 5 minutes
- [ ] Forum thread lists cached for 1 minute  
- [ ] Analytics queries cached for 15 minutes
- [ ] Session tracking implemented for user retention

### Implementation Guide

#### Step 1: Redis Caching Layer
```typescript
// File: server/src/core/cache/redis.service.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function cacheGet<T>(key: string): Promise<T | null> {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

export async function cacheSet(key: string, value: any, ttlSeconds: number = 300) {
  await redis.setex(key, ttlSeconds, JSON.stringify(value));
}

export function withCache<T>(
  keyFn: (...args: any[]) => string,
  ttlSeconds: number = 300
) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      const cacheKey = keyFn(...args);
      const cached = await cacheGet<T>(cacheKey);
      
      if (cached) {
        return cached;
      }
      
      const result = await originalMethod.apply(this, args);
      await cacheSet(cacheKey, result, ttlSeconds);
      return result;
    };
  };
}
```

#### Step 2: Apply Caching to Services  
```typescript
// File: domains/advertising/ad-serving.service.ts
export class AdServingService {
  @withCache(
    (placement: string, userContext: any) => `ad:${placement}:${userContext.region}`,
    300 // 5 minutes
  )
  async serveAd(adRequest: AdRequest) {
    // Existing logic...
    return adResponse;
  }
}

// File: domains/forum/services/thread.service.ts  
export class ThreadService {
  @withCache(
    (forumId: string, page: number) => `threads:${forumId}:page:${page}`,
    60 // 1 minute
  )
  async getThreads(forumId: ForumId, pagination: PaginationParams) {
    // Existing logic...
    return threads;
  }
}
```

#### Step 3: Session Tracking
```typescript
// File: domains/gamification/services/analytics.service.ts
export async function trackSession(userId: UserId, sessionData: {
  startTime: Date;
  endTime?: Date;
  pageViews: number;
  actionsPerformed: string[];
}) {
  await db.insert(sessionLogs).values({
    userId,
    startTime: sessionData.startTime,
    endTime: sessionData.endTime || new Date(),
    duration: sessionData.endTime 
      ? sessionData.endTime.getTime() - sessionData.startTime.getTime()
      : 0,
    pageViews: sessionData.pageViews,
    actions: sessionData.actionsPerformed
  });

  // Update user retention metrics
  await updateUserRetentionMetrics(userId);
}
```

### Testing Performance
```bash
# Check cache is working
curl -w "%{time_total}" http://localhost:5001/api/ads/serve?placement=header # First call
curl -w "%{time_total}" http://localhost:5001/api/ads/serve?placement=header # Should be faster

# Monitor cache hit rates
redis-cli monitor | grep "GET ad:"
```

---

## Workstream 6: 🧹 Code Quality & Transformers
**Priority: MEDIUM** | **Effort: 2-3 hours** | **Files: 12**

### Scope
Clean up transformer stubs, remove legacy code, and implement proper response transformation patterns.

### Quality Issues
```yaml
Transformer stubs:
  - All transformer files have empty transform() methods
  - Response objects return raw DB data (security risk)
  - No tier-based visibility (public vs authenticated vs admin)

Legacy cleanup:
  - Remove ORIGINAL_*_DEPRECATED flags
  - Clean up commented TODOs
  - Remove unused imports and dead code paths
```

### Goals ✅
- [ ] All API responses use proper transformers
- [ ] Tier-based data visibility implemented
- [ ] Legacy flags and dead code removed
- [ ] Storage service methods implemented

### Implementation Guide

#### Step 1: Implement Transformer Pattern
```typescript
// File: domains/forum/transformers/thread.transformer.ts
export class ThreadTransformer {
  static toPublic(thread: Thread): PublicThreadDTO {
    return {
      id: thread.id,
      title: thread.title,
      createdAt: thread.createdAt,
      authorUsername: thread.authorUsername,
      replyCount: thread.replyCount,
      lastActivity: thread.lastActivity
      // Exclude: authorEmail, ipAddress, internalNotes
    };
  }

  static toAuthenticated(thread: Thread, viewerUserId: UserId): AuthenticatedThreadDTO {
    return {
      ...this.toPublic(thread),
      isFollowing: thread.followers?.includes(viewerUserId) || false,
      canEdit: thread.authorId === viewerUserId,
      viewerVote: thread.votes?.find(v => v.userId === viewerUserId)?.value
      // Exclude: still no email/IP/notes
    };
  }

  static toAdmin(thread: Thread): AdminThreadDTO {
    return {
      ...this.toAuthenticated(thread, '' as UserId),
      authorEmail: thread.authorEmail,
      authorIpAddress: thread.authorIpAddress, 
      moderatorNotes: thread.moderatorNotes,
      flagCount: thread.flagCount
      // Include: everything for admin visibility
    };
  }
}
```

#### Step 2: Apply Transformers in Controllers
```typescript
// File: domains/forum/controllers/thread.controller.ts
export class ThreadController {
  async getThread(req: Request, res: Response) {
    const thread = await threadService.getThreadById(req.params.id as ThreadId);
    const user = getAuthenticatedUser(req);
    
    let transformedThread;
    if (user?.role === 'admin') {
      transformedThread = ThreadTransformer.toAdmin(thread);
    } else if (user) {
      transformedThread = ThreadTransformer.toAuthenticated(thread, user.id);
    } else {
      transformedThread = ThreadTransformer.toPublic(thread);
    }
    
    sendSuccessResponse(res, transformedThread);
  }
}
```

#### Step 3: Storage Service Implementation
```typescript
// File: server/src/core/storage.service.ts
export class StorageService {
  async uploadFile(file: Buffer, filename: string, mimeType: string): Promise<string> {
    // For now, save to local uploads directory
    const uploadPath = path.join(process.cwd(), 'uploads', filename);
    await fs.writeFile(uploadPath, file);
    return `/uploads/${filename}`;
  }

  async generatePresignedUrl(filename: string, expiresIn: number = 3600): Promise<string> {
    // Placeholder - return direct URL for now
    // TODO: Implement actual GCS presigned URLs when GCS is configured
    return `${process.env.BASE_URL}/uploads/${filename}?expires=${Date.now() + expiresIn * 1000}`;
  }

  async deleteFile(filename: string): Promise<void> {
    const filePath = path.join(process.cwd(), 'uploads', filename);
    await fs.unlink(filePath).catch(() => {}); // Ignore if file doesn't exist
  }
}
```

#### Step 4: Legacy Cleanup
```typescript
// Remove from all index.ts files:
export const ORIGINAL_ANNOUNCEMENTS_DEPRECATED = true; // DELETE THIS

// Clean up commented TODOs:
// TODO: This will be implemented later... // DELETE THESE
// FIXME: Legacy code, remove after migration // DELETE THESE

// Remove unused imports:
import { someUnusedService } from './unused'; // DELETE IF NOT USED
```

### Quality Validation
```bash
# Check no raw DB objects in responses
grep -r "res.json.*\." server/src/domains/*/controllers/ # Should be empty

# Verify transformer usage  
grep -r "Transformer\." server/src/domains/*/controllers/ # Should find usage

# Check for remaining legacy flags
grep -r "DEPRECATED" server/src/ # Should be minimal
```

---

## 🎯 Agent Workflow

### For each workstream:

1. **Setup**: Read scope, understand goals, review implementation guide
2. **Implementation**: Follow step-by-step patterns, match existing code style  
3. **Testing**: Use provided testing commands, verify endpoints work
4. **Documentation**: Update checklist, note any deviations from plan
5. **Handoff**: Ensure next workstream can pick up seamlessly

### Success Criteria per Workstream:
- ✅ All endpoints return valid responses (no 404s/500s)
- ✅ Security patterns implemented correctly
- ✅ Database migrations applied and tested
- ✅ Caching/performance improvements active
- ✅ Code quality standards met

**Ready to ship DegenTalk! 🚀**