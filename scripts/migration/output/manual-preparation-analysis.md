# Manual Preparation Tasks for ID Migration

## Executive Summary

Analysis of the server/src/domains/ directory reveals critical areas requiring manual coordination before automated ID migration. The system has complex cross-service dependencies, transactional operations, and event-driven architecture that could break if not carefully orchestrated.

## Critical Manual Preparation Areas

### 1. Service Method Signatures - Cross-Domain Dependencies

#### Forum → Gamification → Wallet Integration
**Files requiring coordinated updates:**
- `forum/services/thread.service.ts` (ThreadId, PostId, UserId dependencies)
- `forum/services/post.service.ts` (PostId, ThreadId, UserId relationships)
- `gamification/achievement.service.ts` (AchievementId, UserId integration)
- `wallet/wallet.service.ts` (UserId, TransactionId, CoinId relationships)

**Risk:** Methods like `awardAchievement(userId: UserId, achievementId: AchievementId)` must align across services simultaneously.

#### Key Interfaces Requiring Synchronization:
```typescript
// Thread Service
async createThread(input: ThreadCreateInput): Promise<ThreadWithUserAndCategory>
async updatePostCount(threadId: ThreadId): Promise<void>

// Post Service  
async createPost(input: PostCreateInput): Promise<PostWithUser>
async getPostsByThread(params: PostSearchParams): Promise<...>

// Achievement Service
async checkAndAwardAchievements(userId: UserId, actionType: string, metadata?: any)
async awardAchievement(userId: UserId, achievementId: AchievementId)

// Wallet Service
async transferDGT(fromUserId: string, params: {...}): Promise<{...}>
```

### 2. Transaction Operations - Data Integrity Critical

#### Database Transaction Boundaries
**High-risk files:**
- `engagement/tip/tip.service.ts` - DGT transfers with transaction IDs
- `wallet/dgt.service.ts` - Financial transactions (cannot fail mid-stream)
- `gamification/achievement.service.ts` - XP + transaction rewards
- `admin/sub-domains/treasury/treasury.service.ts` - Financial operations

**Example Critical Transaction (tip.service.ts:146-164):**
```typescript
// Record the tip in the tipRecords table
const [tipRecord] = await db
  .insert(tipRecords)
  .values({
    fromUserId,        // UserId type
    toUserId,         // UserId type  
    amount,
    currency,
    // ... transactionIds reference other operations
  })
  .returning();
```

**Manual Coordination Required:**
1. Database transaction integrity across ID type changes
2. Rollback mechanisms if partial migration fails
3. Foreign key constraint updates in specific order

### 3. Event Publishing/Handling with ID Payloads

#### Achievement Event System
**Files with complex event flows:**
- `forum/services/thread.service.ts:732-741` - AchievementEventEmitter
- `forum/services/post.service.ts:187-196` - Achievement events
- `activity/services/event-logger.service.ts` - Event logging
- `notifications/notification.service.ts` - Notification generation

**Event Payload ID Dependencies:**
```typescript
// Thread creation triggers achievement events
await AchievementEventEmitter.emitThreadCreated(userId, {
  id: newThread.id,           // ThreadId
  forumId: newThread.structureId, // StructureId  
  title: newThread.title,
  tags: tagNames || [],
  createdAt: newThread.createdAt
});

// Achievement system processes with various ID types
await this.checkAndAwardAchievements(userId, 'threads_created', {
  threadId,  // Must match event payload structure
  forumId
});
```

**Risk:** Event payload structure changes could break downstream processors.

### 4. API Endpoint Parameter Types - Client Contract Changes

#### Controller Method Signatures
**High-impact controllers:**
- `forum/routes/thread.routes.ts` - ThreadId parameters
- `forum/routes/post.routes.ts` - PostId parameters  
- `gamification/achievement.controller.ts` - AchievementId, UserId
- `wallet/wallet.controller.ts` - Various financial IDs
- `admin/sub-domains/users/users.controller.ts` - UserId operations

**Client-Breaking Changes:**
```typescript
// Current string-based IDs in routes
app.get('/threads/:threadId', ...)     // string → ThreadId
app.get('/posts/:postId', ...)         // string → PostId
app.post('/achievements/:achievementId/award', ...) // string → AchievementId
```

### 5. Business Logic with Complex ID Relationships

#### Forum Hierarchy Navigation
**File:** `forum/services/thread.service.ts:897-958`
```typescript
private async getZoneInfo(structureId: StructureId): Promise<{
  id: StructureId;
  name: string; 
  slug: string;
  colorTheme: string;
} | null> {
  // Traverses hierarchy: StructureId → ParentId → ZoneId
  // Complex parent-child relationships requiring coordinated migration
}
```

#### Achievement Progress Calculation
**File:** `gamification/achievement.service.ts:466-528`
```typescript
private async calculateAchievementProgress(
  userId: UserId,
  requirement: AchievementRequirement
): Promise<number> {
  switch (action) {
    case 'posts_created':
      return await this.countUserPosts(userId, timeFilter); // UserId → PostId joins
    case 'threads_created':  
      return await this.countUserThreads(userId, timeFilter); // UserId → ThreadId joins
    // Multiple cross-table aggregations
  }
}
```

#### User Statistics Aggregation
**File:** `admin/sub-domains/users/users.service.ts:81-99`
```typescript
// Complex join requiring coordinated UserId migration
const userStats = await db
  .select({
    userId: sql`COALESCE(${posts.userId}, ${threads.userId})`.as('userId'),
    postCount: sql`COUNT(DISTINCT ${posts.id})`.as('postCount'),
    threadCount: sql`COUNT(DISTINCT ${threads.id})`.as('threadCount')
  })
  .from(posts)
  .fullJoin(threads, eq(posts.userId, threads.userId))
  .where(sql`COALESCE(${posts.userId}, ${threads.userId}) = ANY(${userIds})`)
  .groupBy(sql`COALESCE(${posts.userId}, ${threads.userId})`);
```

### 6. Financial Operations - Zero-Tolerance for Errors

#### DGT Transfer Operations  
**File:** `engagement/tip/tip.service.ts:124-131`
```typescript
// High-stakes financial operation
const result = await dgtService.transferDGT(fromUserId, toUserId, amount, 'tip', {
  source,
  contextId,  // Could be ThreadId, PostId, etc.
  message
});
transactionIds = [result.senderTransactionId, result.recipientTransactionId];
```

#### Treasury Operations
**File:** `wallet/wallet.service.ts:391-398`
```typescript
await db.insert(transactions).values({
  userId,                    // UserId
  amount: achievementData.rewardPoints,
  type: 'ACHIEVEMENT_REWARD',
  description: `Achievement reward: ${achievementData.name}`,
  metadata: {
    achievementId,          // AchievementId in metadata
    source: 'achievement_reward'
  }
});
```

## Manual Preparation Strategy

### Phase 1: Transaction Boundary Analysis
1. **Map all financial transaction flows** involving multiple ID types
2. **Identify atomic operation boundaries** that cannot be partially migrated
3. **Create transaction rollback scripts** for each critical operation type

### Phase 2: Event System Preparation  
1. **Catalog all event payload structures** containing IDs
2. **Create event versioning strategy** to support both old and new ID formats during transition
3. **Implement event replay capability** for failed events during migration

### Phase 3: Service Interface Coordination
1. **Create interface compatibility layer** for gradual migration
2. **Implement ID conversion utilities** for service boundaries
3. **Establish migration checkpoints** for service-by-service rollout

### Phase 4: Data Integrity Safeguards
1. **Create comprehensive foreign key dependency maps**
2. **Implement referential integrity checks** at each migration step
3. **Establish data validation scripts** for post-migration verification

## Recommended Migration Order

1. **Core User System** (`users`, `admin/sub-domains/users/`)
2. **Forum Structure** (`forum/services/structure.service.ts`, hierarchy tables)
3. **Content Creation** (`forum/services/thread.service.ts`, `forum/services/post.service.ts`) 
4. **Gamification** (`gamification/achievement.service.ts`, `xp/xp.service.ts`)
5. **Financial** (`wallet/`, `engagement/tip/`, `admin/sub-domains/treasury/`)
6. **Supporting Services** (notifications, analytics, social)

## Risk Mitigation Requirements

### Before Automation:
- [ ] Full database backup with point-in-time recovery
- [ ] Service-level feature flags to disable cross-domain operations
- [ ] Event processing pause capability  
- [ ] Transaction log monitoring for financial operations
- [ ] Client API versioning for breaking changes

### During Migration:
- [ ] Real-time referential integrity monitoring
- [ ] Transaction rollback triggers for constraint violations
- [ ] Event replay queues for failed operations
- [ ] Service health checks for cross-domain calls

### Post-Migration:
- [ ] Data consistency validation across all ID relationships
- [ ] Performance benchmarking for complex queries
- [ ] Event processing backlog verification
- [ ] Client compatibility testing for API changes

## Automation Exclusions

These operations **MUST remain manual** due to business logic complexity:

1. **Financial transaction boundary coordination** (tip.service.ts, treasury operations)
2. **Achievement event payload migration** (cross-service event processing)
3. **Forum hierarchy relationship updates** (parent-child structure integrity)
4. **User statistics aggregation queries** (complex multi-table joins)
5. **API contract versioning** (client compatibility requirements)

Automated codemods should **NOT** be applied to these areas without extensive manual review and testing of each change.