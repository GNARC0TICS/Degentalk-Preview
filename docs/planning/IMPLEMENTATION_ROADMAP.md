# DegenTalk Implementation Roadmap

## 🎯 Overview
This roadmap breaks down the enhanced audit findings into actionable sprints with specific deliverables, following the coding standards and architectural patterns established in the v2 audit.

## 📋 Pre-Implementation Checklist
- [ ] Ensure all developers have access to canonical configs
- [ ] Set up feature flags for new systems
- [ ] Create tracking issues in GitHub for each phase
- [ ] Document API contracts in `/docs/api/`

---

## 🚀 Phase 1: Critical Completes (Week 1-2)
**Goal**: Fix blocking issues and complete core systems

### Sprint 1.1: Mission System Backend
```typescript
// Location: server/src/domains/gamification/services/mission.service.ts
// Priority: CRITICAL
```

**Tasks**:
1. Create `MissionService` class with methods:
   - `getDailyMissions(userId: UserId)`
   - `getWeeklyMissions(userId: UserId)` 
   - `updateProgress(userId: UserId, missionId: string, progress: number)`
   - `claimReward(userId: UserId, missionId: string)`
   - `resetDailyMissions()` (cron job)
   - `resetWeeklyMissions()` (cron job)

2. Implement mission routes:
   ```typescript
   // server/src/domains/gamification/routes/mission.routes.ts
   router.get('/missions', authenticate, getMissions);
   router.get('/missions/daily', authenticate, getDailyMissions);
   router.get('/missions/weekly', authenticate, getWeeklyMissions);
   router.post('/missions/:id/progress', authenticate, validateBody(progressSchema), updateProgress);
   router.post('/missions/:id/claim', authenticate, claimReward);
   ```

3. Create Zod schemas:
   ```typescript
   // shared/schemas/mission.schema.ts
   export const MissionProgressSchema = z.object({
     progress: z.number().min(0),
     metadata: z.record(z.unknown()).optional()
   });
   ```

### Sprint 1.2: XP Cooldown Enforcement
```typescript
// Location: server/src/domains/xp/services/cooldown.service.ts
// Priority: HIGH
```

**Tasks**:
1. Implement `CooldownService`:
   - `checkCooldown(userId: UserId, action: XpAction): Promise<CooldownStatus>`
   - `recordAction(userId: UserId, action: XpAction): Promise<void>`
   - `getRemainingCooldown(userId: UserId, action: XpAction): Promise<number>`

2. Integrate with XP service:
   ```typescript
   // In xp.service.ts
   const cooldownStatus = await cooldownService.checkCooldown(userId, action);
   if (!cooldownStatus.canPerform) {
     throw new CooldownActiveError(cooldownStatus.endsAt);
   }
   ```

3. Add endpoint:
   ```typescript
   router.post('/xp/check-cooldown', authenticate, checkCooldown);
   ```

### Sprint 1.3: Level-Based Forum Access
```typescript
// Location: server/src/domains/forum/services/permissions.service.ts
// Priority: HIGH
```

**Tasks**:
1. Update `canPostInForum()` to handle level requirements:
   ```typescript
   case 'level_10+':
     const userLevel = await levelingService.getUserLevel(user.id);
     return userLevel >= 10;
   ```

2. Add dynamic level checks:
   ```typescript
   // Support level_5+, level_20+, level_50+
   const levelMatch = forum.accessLevel.match(/^level_(\d+)\+$/);
   if (levelMatch) {
     const requiredLevel = parseInt(levelMatch[1]);
     const userLevel = await levelingService.getUserLevel(user.id);
     return userLevel >= requiredLevel;
   }
   ```

### Sprint 1.4: DM Blocking System
```typescript
// Location: server/src/domains/messaging/services/block.service.ts
// Priority: CRITICAL
```

**Tasks**:
1. Create `user_blocks` table migration
2. Implement `BlockService`:
   - `blockUser(userId: UserId, targetId: UserId, reason?: string)`
   - `unblockUser(userId: UserId, targetId: UserId)`
   - `getBlockedUsers(userId: UserId)`
   - `isBlocked(userId: UserId, targetId: UserId)`

3. Update message service to check blocks:
   ```typescript
   // In message.service.ts
   if (await blockService.isBlocked(recipientId, senderId)) {
     throw new UserBlockedError();
   }
   ```

---

## 🔧 Phase 2: Enhanced Systems (Week 3-4)
**Goal**: Add real-time features and improve user experience

### Sprint 2.1: WebSocket Integration
```typescript
// Location: server/src/core/websocket/
// Priority: HIGH
```

**Tasks**:
1. Create WebSocket manager:
   ```typescript
   // websocket.manager.ts
   export class WebSocketManager {
     private io: Server;
     
     async handleConnection(socket: Socket) {
       const userId = await this.authenticateSocket(socket);
       socket.join(`user:${userId}`);
       
       // Subscribe to user-specific events
       this.subscribeToNotifications(userId, socket);
       this.subscribeToDMs(userId, socket);
     }
   }
   ```

2. Integrate with services:
   ```typescript
   // In notification.service.ts
   eventEmitter.on('notification:created', (notification) => {
     wsManager.emitToUser(notification.userId, 'notification:new', notification);
   });
   ```

3. Client-side integration:
   ```typescript
   // client/src/hooks/useWebSocket.ts
   export const useWebSocket = () => {
     const socket = useRef<Socket>();
     
     useEffect(() => {
       socket.current = io(WS_URL, { 
         auth: { token: getAuthToken() }
       });
       
       socket.current.on('notification:new', handleNewNotification);
       socket.current.on('dm:new_message', handleNewMessage);
     }, []);
   };
   ```

### Sprint 2.2: Enhanced Reactions System
```typescript
// Location: server/src/domains/forum/services/reaction.service.ts
// Priority: MEDIUM
```

**Tasks**:
1. Update reaction schema to support emojis:
   ```typescript
   // db/schema/forum/reactions.ts
   export const postReactions = pgTable('post_reactions', {
     // ... existing fields
     reactionType: text('reaction_type').notNull(), // '🔥', '❤️', etc.
   });
   ```

2. Create reaction configuration:
   ```typescript
   // config/reactions.config.ts
   export const ALLOWED_REACTIONS = ['🔥', '❤️', '😂', '🤔', '👎'] as const;
   export const REACTION_LIMITS = {
     perPost: 1,
     dailyLimit: 100
   };
   ```

3. Update API:
   ```typescript
   router.post('/posts/:postId/react', authenticate, validateBody(ReactionSchema), addReaction);
   router.delete('/posts/:postId/react', authenticate, removeReaction);
   router.get('/posts/:postId/reactions', getReactionSummary);
   ```

### Sprint 2.3: Auto-Moderation Engine
```typescript
// Location: server/src/domains/moderation/services/automod.service.ts
// Priority: HIGH
```

**Tasks**:
1. Create `automod_rules` table
2. Implement `AutoModService`:
   ```typescript
   export class AutoModService {
     async scanContent(content: string, context: ModContext): Promise<ModResult> {
       const rules = await this.getActiveRules();
       const violations = [];
       
       for (const rule of rules) {
         if (this.checkRule(content, rule)) {
           violations.push({
             ruleId: rule.id,
             severity: rule.severity,
             action: rule.action
           });
         }
       }
       
       return { violations, suggestedAction: this.determinAction(violations) };
     }
   }
   ```

3. Integrate with content creation:
   ```typescript
   // Middleware: automod.middleware.ts
   export const autoModCheck = async (req, res, next) => {
     const result = await autoModService.scanContent(req.body.content);
     if (result.suggestedAction === 'block') {
       return res.status(400).json({ error: 'Content violates community guidelines' });
     }
     req.autoModResult = result;
     next();
   };
   ```

### Sprint 2.4: Notification Preferences
```typescript
// Location: server/src/domains/notifications/services/preferences.service.ts
// Priority: MEDIUM
```

**Tasks**:
1. Create `notification_preferences` table
2. Implement preference management:
   ```typescript
   router.get('/notifications/preferences', authenticate, getPreferences);
   router.put('/notifications/preferences', authenticate, validateBody(PreferencesSchema), updatePreferences);
   ```

3. Update notification service to respect preferences:
   ```typescript
   const prefs = await preferencesService.getPreferences(userId, notificationType);
   if (prefs.inApp) {
     await this.createNotification(userId, notification);
   }
   if (prefs.email) {
     await emailService.queueNotificationEmail(userId, notification);
   }
   ```

---

## 🛡️ Phase 3: Behavioral Intelligence & Hardening (Week 5-6)
**Goal**: Advanced abuse prevention and analytics

### Sprint 3.1: Behavior Analytics Engine
```typescript
// Location: server/src/domains/analytics/services/behavior.service.ts
// Priority: HIGH
```

**Tasks**:
1. Create `user_behavior_metrics` table
2. Implement behavior tracking:
   ```typescript
   export class BehaviorAnalyticsService {
     async trackMetric(userId: UserId, metric: BehaviorMetric, value: number) {
       await db.insert(userBehaviorMetrics).values({
         userId,
         metric,
         value,
         timestamp: new Date()
       });
       
       // Check for anomalies
       if (await this.isAnomalous(userId, metric, value)) {
         await this.flagForReview(userId, metric);
       }
     }
     
     async detectPatterns(userId: UserId): Promise<BehaviorPattern[]> {
       // ML-lite pattern detection
       const metrics = await this.getRecentMetrics(userId);
       return this.analyzePatterns(metrics);
     }
   }
   ```

3. Integration points:
   - Post creation → track posting frequency
   - Failed logins → track security events
   - Report submissions → track abuse reports

### Sprint 3.2: Content Filtering Service
```typescript
// Location: server/src/domains/moderation/services/content-filter.service.ts
// Priority: CRITICAL
```

**Tasks**:
1. Implement multi-layer filtering:
   ```typescript
   export class ContentFilterService {
     private profanityList: Set<string>;
     private spamPatterns: RegExp[];
     private phishingDomains: Set<string>;
     
     async checkContent(content: string): Promise<FilterResult> {
       const issues = [];
       
       // Layer 1: Profanity
       const profanityMatches = this.checkProfanity(content);
       if (profanityMatches.length > 0) {
         issues.push({ type: 'profanity', severity: 'medium', matches: profanityMatches });
       }
       
       // Layer 2: Spam patterns
       const spamScore = this.calculateSpamScore(content);
       if (spamScore > SPAM_THRESHOLD) {
         issues.push({ type: 'spam', severity: 'high', score: spamScore });
       }
       
       // Layer 3: Phishing/malicious URLs
       const urls = this.extractUrls(content);
       const maliciousUrls = this.checkUrls(urls);
       if (maliciousUrls.length > 0) {
         issues.push({ type: 'phishing', severity: 'critical', urls: maliciousUrls });
       }
       
       return { clean: issues.length === 0, issues };
     }
   }
   ```

2. Create filter management API:
   ```typescript
   router.get('/moderation/filters/words', requireAdmin, getFilteredWords);
   router.post('/moderation/filters/words', requireAdmin, addFilteredWords);
   router.get('/moderation/filters/test', requireModerator, testContent);
   ```

### Sprint 3.3: Advanced Rate Limiting
```typescript
// Location: server/src/core/rate-limiter-v2.ts
// Priority: HIGH
```

**Tasks**:
1. Implement sliding window rate limiter:
   ```typescript
   export class SlidingWindowRateLimiter {
     async checkLimit(key: string, limit: number, window: number): Promise<RateLimitResult> {
       const now = Date.now();
       const windowStart = now - window;
       
       // Use Redis sorted sets for efficiency
       const requests = await redis.zrangebyscore(key, windowStart, now);
       
       if (requests.length >= limit) {
         const oldestRequest = requests[0];
         const resetTime = oldestRequest + window;
         return {
           allowed: false,
           remaining: 0,
           resetAt: new Date(resetTime)
         };
       }
       
       await redis.zadd(key, now, now);
       await redis.expire(key, Math.ceil(window / 1000));
       
       return {
         allowed: true,
         remaining: limit - requests.length - 1,
         resetAt: new Date(now + window)
       };
     }
   }
   ```

2. Dynamic rate limits by user reputation:
   ```typescript
   const getRateLimit = async (userId: UserId): Promise<RateLimitConfig> => {
     const user = await userService.getUserWithStats(userId);
     
     if (user.role === 'admin' || user.role === 'moderator') {
       return { limit: 1000, window: 60000 }; // 1000/min
     }
     
     if (user.level >= 50) {
       return { limit: 100, window: 60000 }; // 100/min
     }
     
     if (user.flags.includes('rate_limit_violation')) {
       return { limit: 10, window: 60000 }; // 10/min (throttled)
     }
     
     return { limit: 60, window: 60000 }; // Default: 60/min
   };
   ```

### Sprint 3.4: IP Management System
```typescript
// Location: server/src/domains/security/services/ip-management.service.ts
// Priority: MEDIUM
```

**Tasks**:
1. Create IP tracking tables:
   - `ip_addresses` - Track all IPs
   - `ip_bans` - Banned IPs with reasons
   - `ip_reputation` - IP scoring system

2. Implement IP management:
   ```typescript
   export class IpManagementService {
     async checkIp(ip: string): Promise<IpStatus> {
       // Check if banned
       const ban = await this.getBan(ip);
       if (ban && ban.isActive) {
         return { status: 'banned', reason: ban.reason };
       }
       
       // Check reputation
       const reputation = await this.getReputation(ip);
       if (reputation.score < SUSPICIOUS_THRESHOLD) {
         return { status: 'suspicious', requiresCaptcha: true };
       }
       
       return { status: 'allowed' };
     }
     
     async banIp(ip: string, reason: string, duration?: number) {
       await db.insert(ipBans).values({
         ip,
         reason,
         bannedUntil: duration ? new Date(Date.now() + duration) : null,
         isActive: true
       });
     }
   }
   ```

---

## 📊 Success Metrics

### Phase 1 Completion Criteria
- [ ] All mission endpoints return data
- [ ] XP cooldowns prevent rapid farming
- [ ] Level-gated forums enforce requirements
- [ ] DM blocking prevents harassment

### Phase 2 Completion Criteria
- [ ] WebSocket delivers notifications in <100ms
- [ ] Reaction system supports all configured emojis
- [ ] AutoMod catches 80%+ of test violations
- [ ] Users can configure notification preferences

### Phase 3 Completion Criteria
- [ ] Behavior analytics flag suspicious accounts
- [ ] Content filter blocks offensive content
- [ ] Rate limiter prevents API abuse
- [ ] IP bans stop repeat offenders

---

## 🚦 Risk Mitigation

1. **Database Performance**
   - Add indexes before deploying each phase
   - Monitor query performance with explain analyze
   - Set up read replicas for analytics queries

2. **Feature Flags**
   - Gate all new features behind flags
   - Gradual rollout: 10% → 50% → 100%
   - Quick rollback capability

3. **Testing Strategy**
   - Unit tests for all new services
   - Integration tests for API endpoints
   - Load testing for WebSocket connections
   - Chaos testing for abuse scenarios

---

## 🎯 Quick Wins (Can do immediately)

1. **Add missing indexes**:
   ```sql
   CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
   CREATE INDEX idx_xp_logs_user_date ON xp_action_logs(user_id, created_at);
   ```

2. **Enable existing features via flags**:
   ```typescript
   // config/featureFlags.ts
   export const features = {
     missions: true, // Was false
     emojiReactions: true, // Was false
     automod: true // Was false
   };
   ```

3. **Quick API additions**:
   - GET /api/stats/platform - Platform-wide statistics
   - GET /api/health/detailed - Detailed health check
   - POST /api/support/ticket - User support tickets

This roadmap provides concrete implementation steps while maintaining DegenTalk's coding standards and architectural patterns.