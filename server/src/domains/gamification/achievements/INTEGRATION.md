# Achievement System Integration Guide

## Overview

This document explains how to integrate the enhanced achievement system into the existing Degentalk platform. The system is designed to work seamlessly with the current architecture while providing powerful new functionality.

## Architecture Summary

The achievement system consists of:

1. **Event-Driven Processing** - Real-time achievement tracking via events
2. **Flexible Trigger System** - Support for count, threshold, event, composite, and custom triggers
3. **Degen Culture Evaluators** - Custom logic for crypto-specific achievements
4. **Admin Management** - Full CRUD operations and bulk management
5. **Template System** - Pre-built achievements for quick deployment

## Integration Steps

### 1. Database Migration

```bash
# Apply the enhanced achievements migration
npm run db:migrate:Apply

# Or manually run the SQL file
psql -d your_database -f db/migrations/20250128_enhanced_achievements_system.sql
```

### 2. Add Routes to Main Router

**File: `server/routes.ts`**

```typescript
import { achievementRoutes } from './src/domains/gamification/achievements';

// Add to existing routes
app.use('/api/achievements', achievementRoutes);
```

### 3. Integrate Event Emission

#### Forum Events Integration

**File: `server/src/domains/forum/services/post.service.ts`**

```typescript
import { AchievementEventEmitter } from '../../core/events/achievement-events.service';

export class PostService {
	async createPost(postData: any, userId: string) {
		// ... existing post creation logic

		// Emit achievement event
		await AchievementEventEmitter.emitPostCreated(userId, {
			id: post.id,
			threadId: post.threadId,
			forum: post.forum,
			content: post.content,
			createdAt: post.createdAt
		});

		return post;
	}
}
```

**File: `server/src/domains/forum/services/thread.service.ts`**

```typescript
import { AchievementEventEmitter } from '../../core/events/achievement-events.service';

export class ThreadService {
	async createThread(threadData: any, userId: string) {
		// ... existing thread creation logic

		// Emit achievement event
		await AchievementEventEmitter.emitThreadCreated(userId, {
			id: thread.id,
			forumId: thread.forumId,
			title: thread.title,
			polls: thread.polls,
			tags: thread.tags,
			createdAt: thread.createdAt
		});

		return thread;
	}
}
```

#### Authentication Events

**File: `server/src/middleware/auth.middleware.ts`**

```typescript
import { AchievementEventEmitter } from '../core/events/achievement-events.service';

// Add to successful login handler
await AchievementEventEmitter.emitUserLogin(user.id);
```

#### Wallet/Economy Events

**File: `server/src/domains/wallet/services/wallet.service.ts`**

```typescript
import { AchievementEventEmitter } from '../../core/events/achievement-events.service';

export class WalletService {
	async transferDgt(fromUserId: string, toUserId: string, amount: number, reason?: string) {
		// ... existing transfer logic

		// Emit tip events
		await AchievementEventEmitter.emitTipSent(fromUserId, toUserId, {
			amount,
			currency: 'DGT',
			reason
		});

		return transfer;
	}
}
```

### 4. Add Background Processing

**File: `server/src/core/background-processor.ts`** (create if doesn't exist)

```typescript
import { AchievementProcessorService } from '../domains/gamification/achievements';
import { db } from '@db';
import { eq } from 'drizzle-orm';
import { achievementEvents } from '@schema/gamification/achievementEvents';

export class BackgroundProcessor {
	private processorService = new AchievementProcessorService();

	async processAchievementEvents() {
		// Get pending events
		const pendingEvents = await db
			.select()
			.from(achievementEvents)
			.where(eq(achievementEvents.processingStatus, 'pending'))
			.limit(100);

		// Process each event
		for (const event of pendingEvents) {
			await this.processorService.processEvent(
				event.eventType as any,
				event.userId,
				event.eventData
			);
		}
	}

	start() {
		// Process events every 30 seconds
		setInterval(() => {
			this.processAchievementEvents().catch(console.error);
		}, 30000);
	}
}

// Start processor
if (process.env.NODE_ENV !== 'test') {
	const processor = new BackgroundProcessor();
	processor.start();
}
```

### 5. DGT and Clout Service Integration

**File: `server/src/domains/gamification/achievements/achievement-processor.service.ts`**

Update the `distributeRewards` method to integrate with existing services:

```typescript
// Import existing services
import { DgtService } from '../../wallet/dgt.service';
import { CloutService } from '../../social/clout.service';

export class AchievementProcessorService {
	private dgtService = new DgtService();
	private cloutService = new CloutService();

	private async distributeRewards(userId: string, achievement: Achievement): Promise<void> {
		try {
			// Award XP (already implemented)
			if (achievement.rewardXp > 0) {
				await this.xpService.awardXP(userId, achievement.rewardXp, 'achievement_unlock');
			}

			// Award DGT (integrate with existing service)
			if (achievement.rewardDgt > 0) {
				await this.dgtService.creditUser(userId, achievement.rewardDgt, {
					source: 'achievement_unlock',
					achievementId: achievement.id,
					description: `Achievement: ${achievement.name}`
				});
			}

			// Award Clout (integrate with existing service)
			if (achievement.rewardClout > 0) {
				await this.cloutService.awardClout(userId, achievement.rewardClout, {
					source: 'achievement_unlock',
					achievementId: achievement.id
				});
			}
		} catch (error) {
			logger.error('ACHIEVEMENT_PROCESSOR', 'Failed to distribute rewards', {
				userId,
				achievementId: achievement.id,
				error: error instanceof Error ? error.message : String(error)
			});
		}
	}
}
```

### 6. Frontend Integration

#### Add Achievement API Client

**File: `client/src/lib/api/achievements.ts`**

```typescript
import { apiRequest } from '@/lib/queryClient';

export interface UserAchievement {
	id: number;
	achievementId: number;
	currentProgress: any;
	progressPercentage: string;
	isCompleted: boolean;
	completedAt?: string;
	achievement: {
		id: number;
		key: string;
		name: string;
		description: string;
		category: string;
		tier: string;
		iconUrl?: string;
		iconEmoji?: string;
		rewardXp: number;
		rewardDgt: number;
		rewardClout: number;
		isSecret: boolean;
		unlockMessage?: string;
	};
}

export const achievementApi = {
	getUserAchievements: (userId: string, filters?: any) =>
		apiRequest<UserAchievement[]>({
			url: `/api/achievements/user/${userId}`,
			params: filters
		}),

	getAchievements: (filters?: any) =>
		apiRequest<any>({
			url: '/api/achievements',
			params: filters
		}),

	getAchievementStats: () =>
		apiRequest<any>({
			url: '/api/achievements/stats'
		})
};
```

#### Add Achievement Hook

**File: `client/src/hooks/use-achievements.ts`**

```typescript
import { useQuery } from '@tanstack/react-query';
import { achievementApi } from '@/lib/api/achievements';
import { useAuth } from './use-auth';

export function useUserAchievements(filters?: any) {
	const { user } = useAuth();

	return useQuery({
		queryKey: ['achievements', 'user', user?.id, filters],
		queryFn: () => (user ? achievementApi.getUserAchievements(user.id, filters) : null),
		enabled: !!user
	});
}

export function useAchievements(filters?: any) {
	return useQuery({
		queryKey: ['achievements', 'all', filters],
		queryFn: () => achievementApi.getAchievements(filters)
	});
}

export function useAchievementStats() {
	return useQuery({
		queryKey: ['achievements', 'stats'],
		queryFn: () => achievementApi.getAchievementStats()
	});
}
```

### 7. Environment Configuration

**File: `env.local`**

```bash
# Achievement system configuration
ACHIEVEMENT_PROCESSING_ENABLED=true
ACHIEVEMENT_BATCH_SIZE=100
ACHIEVEMENT_PROCESSING_INTERVAL=30000
```

### 8. Populate Initial Achievements

**File: `scripts/db/seed-achievements.ts`**

```typescript
import { db } from '@db';
import { achievements } from '@schema/gamification/achievements';
import {
	CORE_ACHIEVEMENT_TEMPLATES,
	CULTURAL_ACHIEVEMENT_TEMPLATES
} from '../server/src/domains/gamification/achievements/templates/achievement-templates';

export async function seedAchievements() {
	console.log('Seeding achievements...');

	const allTemplates = [...CORE_ACHIEVEMENT_TEMPLATES, ...CULTURAL_ACHIEVEMENT_TEMPLATES];

	for (const template of allTemplates) {
		const { templateId, templateName, templateDescription, tags, ...achievementData } = template;

		await db.insert(achievements).values(achievementData).onConflictDoNothing();
	}

	console.log(`Seeded ${allTemplates.length} achievements`);
}

// Run seeder
if (require.main === module) {
	seedAchievements()
		.then(() => process.exit(0))
		.catch((error) => {
			console.error('Seeding failed:', error);
			process.exit(1);
		});
}
```

Add to package.json:

```json
{
	"scripts": {
		"seed:achievements": "tsx scripts/db/seed-achievements.ts"
	}
}
```

## Testing the Integration

### 1. Seed Initial Data

```bash
npm run seed:achievements
```

### 2. Test Event Emission

```bash
# Create a test post to trigger events
curl -X POST http://localhost:5001/api/achievements/events/emit \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "post_created",
    "userId": "user-id-here",
    "eventData": {
      "postId": 1,
      "threadId": 1,
      "contentLength": 100
    }
  }'
```

### 3. Check User Achievements

```bash
# Get user achievements
curl http://localhost:5001/api/achievements/user/user-id-here
```

### 4. Admin Panel Testing

```bash
# Get achievement stats
curl http://localhost:5001/api/achievements/stats

# Get achievement templates
curl http://localhost:5001/api/achievements/templates
```

## Performance Considerations

1. **Event Processing** - Events are processed asynchronously to avoid blocking user actions
2. **Batch Processing** - Multiple events can be processed in batches
3. **Caching** - Achievement data should be cached on the frontend
4. **Database Indexing** - Ensure proper indexes on frequently queried fields

## Monitoring and Debugging

1. **Logs** - Achievement events are logged with structured data
2. **Metrics** - Monitor event processing rates and achievement completion rates
3. **Admin Panel** - Use the admin endpoints to monitor system health

## Future Enhancements

1. **Real-time Notifications** - WebSocket integration for achievement unlocks
2. **Leaderboards** - Achievement-based ranking systems
3. **Social Features** - Achievement sharing and comparison
4. **Analytics** - Detailed achievement analytics and insights

## Support

For questions or issues with the achievement system integration, refer to:

1. **Code Documentation** - Inline comments and JSDoc
2. **Database Schema** - Schema files in `db/schema/gamification/`
3. **API Documentation** - Controller and route files
4. **Templates** - Pre-built achievement examples

The achievement system is designed to be self-contained and minimally invasive to the existing codebase while providing powerful new functionality for user engagement and retention.
