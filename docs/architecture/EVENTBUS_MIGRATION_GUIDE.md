# EventBus Migration Guide
## Eliminating 78+ Domain Boundary Violations

**Author**: Agent 2 - EventBus Architecture Specialist  
**Version**: 1.0  
**Status**: Ready for Implementation  
**Impact**: Architectural decoupling of 14 domains

---

## 🎯 Migration Overview

This guide provides systematic migration patterns to eliminate **78+ cross-domain imports** through event-driven architecture. Each pattern includes before/after examples, rollback strategies, and validation steps.

### Migration Statistics
- **Total Violations**: 78+ cross-domain imports using `../../` patterns
- **Events Defined**: 20+ typed events with Zod validation
- **Domains Affected**: 14 domains require migration
- **Priority Levels**: CRITICAL (5), HIGH (8), MEDIUM (7)

---

## 🔥 Priority 1: Wallet Domain Violations (15 files)

### Current Violation Pattern
```typescript
// ❌ BEFORE: Direct import in admin/database/backup.service.ts
import { WalletService } from '../../wallet/services/wallet.service';
import { dgtService } from '../../wallet/services/dgtService';

class BackupService {
  async backupUserData(userId: UserId): Promise<UserBackup> {
    // Direct service call creates tight coupling
    const balance = await this.walletService.getBalance(userId);
    const transactions = await this.walletService.getUserTransactions(userId);
    
    return {
      userId,
      balance,
      transactions,
      timestamp: Date.now()
    };
  }
}
```

### EventBus Migration Pattern
```typescript
// ✅ AFTER: Event-driven communication
import { eventRequester } from '@core/events/event-handler-registry';
import type { DomainEventPayload } from '@shared/events/domain-event-catalog';

class BackupService {
  async backupUserData(userId: UserId): Promise<UserBackup> {
    // Request-response event pattern
    const walletData = await eventRequester.request('wallet.balance.requested', {
      userId,
      correlationId: generateId(),
      requestedBy: 'admin.backup.service',
      includeDetails: true,
      timestamp: Date.now()
    });
    
    return {
      userId,
      balance: walletData.balance,
      available: walletData.available,
      timestamp: Date.now()
    };
  }
}
```

### Wallet Event Handler Setup
```typescript
// wallet/services/wallet.service.ts - Add event handlers
import { eventRegistry } from '@core/events/event-handler-registry';

class WalletService {
  constructor() {
    this.registerEventHandlers();
  }

  private registerEventHandlers(): void {
    eventRegistry.register('wallet.balance.requested', async (payload) => {
      const balance = await this.getBalance(payload.userId);
      const available = await this.getAvailableBalance(payload.userId);
      
      return {
        balance,
        currency: 'DGT' as const,
        available,
        timestamp: Date.now()
      };
    }, { 
      domain: 'wallet', 
      description: 'Handle balance requests from other domains' 
    });
  }
}
```

---

## ⚡ Priority 2: XP Domain Violations (18 files)

### Current Violation Pattern
```typescript
// ❌ BEFORE: Direct XP service usage in forum/services/post.service.ts
import { XPService } from '../../xp/xp.service';
import { XP_ACTIONS } from '../../xp/xp-actions';

class PostService {
  async createPost(data: CreatePostDTO): Promise<Post> {
    // Create post first
    const post = await this.repository.create(data);
    
    // Direct XP award - tightly coupled
    await this.xpService.awardXP(data.userId, XP_ACTIONS.POST_CREATED, {
      postId: post.id,
      forumId: data.forumId
    });
    
    return post;
  }
}
```

### EventBus Migration Pattern
```typescript
// ✅ AFTER: Fire-and-forget event
import { EventBus } from '@core/events/event-bus';

class PostService {
  constructor(
    private repository: PostRepository,
    private eventBus: EventBus
  ) {}

  async createPost(data: CreatePostDTO): Promise<Post> {
    // Create post first
    const post = await this.repository.create(data);
    
    // Fire XP award event - loosely coupled
    await this.eventBus.emit({
      type: 'xp.award.requested',
      payload: {
        userId: data.userId,
        action: 'post.created',
        amount: 10, // Or let XP service calculate
        metadata: {
          postId: post.id,
          threadId: data.threadId,
          forumId: data.forumId
        },
        timestamp: Date.now()
      },
      metadata: {
        timestamp: new Date(),
        correlationId: generateId(),
        version: 1
      }
    });
    
    return post;
  }
}
```

### XP Event Handler Setup
```typescript
// xp/xp.service.ts - Add event handlers
import { eventRegistry } from '@core/events/event-handler-registry';

class XPService {
  constructor() {
    this.registerEventHandlers();
  }

  private registerEventHandlers(): void {
    eventRegistry.register('xp.award.requested', async (payload) => {
      const awarded = await this.calculateXP(payload.action, payload.amount);
      const result = await this.awardXP(payload.userId, awarded, payload.metadata);
      
      // Emit level up event if needed
      if (result.levelUp) {
        await this.eventBus.emit({
          type: 'xp.level.changed',
          payload: {
            userId: payload.userId,
            oldLevel: result.oldLevel,
            newLevel: result.newLevel,
            totalXp: result.newTotal,
            rewards: result.rewards,
            timestamp: Date.now()
          }
        });
      }
      
      return {
        awarded,
        newTotal: result.newTotal,
        levelUp: result.levelUp,
        newLevel: result.newLevel,
        rewards: result.rewards
      };
    }, { 
      domain: 'xp', 
      description: 'Award XP for user actions' 
    });
  }
}
```

---

## 🏛️ Priority 3: Admin Infrastructure Violations (25 files)

### Current Violation Pattern
```typescript
// ❌ BEFORE: Shared admin utilities imported everywhere
import { AdminError } from '../../admin/admin.errors';
import { asyncHandler } from '../../admin/admin.middleware';
import { validateRequestBody } from '../../admin/admin.validation';

// Multiple domains importing admin utilities
class GamificationController {
  @asyncHandler
  async updateXPSettings(req: Request, res: Response) {
    validateRequestBody(req, updateXPSchema);
    // ... logic
  }
}
```

### EventBus Migration Pattern
```typescript
// ✅ AFTER: Extract shared utilities to @core, use events for admin actions
import { asyncHandler } from '@core/middleware'; // Moved to shared location
import { validateRequest } from '@core/validation'; // Extracted utility

class GamificationController {
  @asyncHandler
  async updateXPSettings(req: Request, res: Response) {
    const validated = validateRequest(req, updateXPSchema);
    
    // Emit admin action event for audit logging
    await this.eventBus.emit({
      type: 'admin.setting.changed',
      payload: {
        adminId: req.user.id,
        setting: 'xp.multiplier',
        oldValue: currentSettings.multiplier,
        newValue: validated.multiplier,
        category: 'gamification',
        timestamp: Date.now()
      }
    });
    
    // Continue with business logic...
  }
}
```

### Admin Event Handler Setup
```typescript
// admin/services/audit.service.ts - Centralized audit logging
import { eventRegistry } from '@core/events/event-handler-registry';

class AdminAuditService {
  constructor() {
    this.registerEventHandlers();
  }

  private registerEventHandlers(): void {
    // Listen to all admin events for audit logging
    eventRegistry.registerDomain('admin', {
      'admin.user.action': async (payload) => {
        await this.logAdminAction({
          type: 'user_action',
          adminId: payload.adminId,
          targetId: payload.targetUserId,
          action: payload.action,
          reason: payload.reason,
          timestamp: payload.timestamp
        });
      },

      'admin.setting.changed': async (payload) => {
        await this.logSettingChange({
          adminId: payload.adminId,
          setting: payload.setting,
          oldValue: payload.oldValue,
          newValue: payload.newValue,
          category: payload.category,
          timestamp: payload.timestamp
        });
      }
    });
  }
}
```

---

## 🗨️ Priority 4: Forum Domain Violations (10 files)

### Current Violation Pattern
```typescript
// ❌ BEFORE: Direct forum service imports
import { ThreadService } from '../../forum/services/thread.service';
import { PostService } from '../../forum/services/post.service';

class AnalyticsService {
  async getForumStats(forumId: ForumId): Promise<ForumStats> {
    // Direct service calls
    const threads = await this.threadService.getThreadCount(forumId);
    const posts = await this.postService.getPostCount(forumId);
    
    return { threads, posts };
  }
}
```

### EventBus Migration Pattern
```typescript
// ✅ AFTER: Event-driven forum data requests
import { eventRequester } from '@core/events/event-handler-registry';

class AnalyticsService {
  async getForumStats(forumId: ForumId): Promise<ForumStats> {
    // Request forum statistics via events
    const stats = await eventRequester.request('forum.thread.stats.requested', {
      threadId: forumId, // Will be enhanced to support forum-level stats
      correlationId: generateId(),
      includeMetrics: true
    });
    
    return {
      threads: stats.replies, // Temporary mapping
      engagement: stats.engagement,
      lastActivity: stats.lastActivity
    };
  }
}
```

---

## 🔄 Migration Implementation Strategy

### Phase 1: Foundation (Week 1)
1. **Deploy Event Catalog** - Add `shared/events/domain-event-catalog.ts`
2. **Setup Handler Registry** - Initialize `event-handler-registry.ts`
3. **Update Core EventBus** - Add type safety and validation
4. **Create Testing Utils** - Event mocking and validation

### Phase 2: Critical Migration (Week 2)
1. **Wallet Events** (15 violations) - Start with balance requests
2. **XP Events** (18 violations) - Focus on award patterns
3. **Forum Events** (10 violations) - Post/thread creation events

### Phase 3: Infrastructure Migration (Week 3)
1. **Admin Events** (25 violations) - Extract shared utilities first
2. **Social Events** (4 violations) - Follow/activity patterns  
3. **Notification Events** (3 violations) - Lowest priority

---

## 📋 Migration Checklist

### Pre-Migration Validation
- [ ] Event catalog deployed and importable
- [ ] Handler registry initialized in application startup
- [ ] Existing EventBus enhanced with type safety
- [ ] Test utilities available for event mocking

### Per-Domain Migration
- [ ] Identify all boundary violations in domain
- [ ] Map violations to appropriate events
- [ ] Create event handlers in target domain
- [ ] Replace direct imports with event emissions
- [ ] Update tests to use event mocks
- [ ] Validate no functionality regression

### Post-Migration Validation
- [ ] All imports use approved alias patterns
- [ ] No `../../` patterns remain in domain
- [ ] Event handlers registered and responding
- [ ] Performance metrics within acceptable range
- [ ] Integration tests passing

---

## 🛠️ Rollback Strategy

### Emergency Rollback
If critical issues arise during migration:

1. **Feature Flag Approach**
```typescript
// Use feature flags to toggle between direct and event patterns
const USE_EVENTS = process.env.FEATURE_EVENTBUS_MIGRATION === 'true';

async function requestWalletBalance(userId: UserId) {
  if (USE_EVENTS) {
    return await eventRequester.request('wallet.balance.requested', { userId });
  } else {
    return await walletService.getBalance(userId); // Fallback
  }
}
```

2. **Gradual Rollout**
- Migrate one domain at a time
- Keep original services available during transition
- Monitor error rates and performance metrics
- Roll back individual domains if needed

### Validation Commands
```bash
# Verify no boundary violations remain
pnpm run validate:boundaries

# Check event handler registration
pnpm run validate:events

# Performance regression test
pnpm run test:performance

# Integration test suite
pnpm run test:integration
```

---

## 📊 Success Metrics

### Technical Metrics
- **Boundary Violations**: 0 (down from 78+)
- **Event Coverage**: 100% of cross-domain calls via events
- **Type Safety**: Full Zod validation on all events
- **Performance**: <5ms additional latency per event

### Business Metrics
- **System Stability**: No functionality regression
- **Development Velocity**: Faster feature development
- **Testing**: Easier to mock cross-domain dependencies
- **Maintenance**: Clearer domain boundaries

---

## 🚀 Getting Started

### 1. Deploy Event Infrastructure
```bash
# Add event catalog to shared
git add shared/events/domain-event-catalog.ts

# Add handler registry to core
git add server/src/core/events/event-handler-registry.ts

# Commit foundation
git commit -m "feat: add EventBus infrastructure for domain decoupling"
```

### 2. Start with High-Priority Domain
```typescript
// Begin with wallet domain (15 violations)
import { eventRegistry } from '@core/events/event-handler-registry';

// Register wallet event handlers
eventRegistry.registerDomain('wallet', {
  'wallet.balance.requested': walletBalanceHandler,
  'wallet.dgt.credited': walletCreditHandler,
  'wallet.transaction.completed': transactionHandler
});
```

### 3. Migrate One Violation at a Time
- Replace direct import with event emission
- Test functionality preservation
- Update related tests
- Validate no regressions

---

**Ready to eliminate architectural coupling? Start with Priority 1: Wallet Domain! 🎯**