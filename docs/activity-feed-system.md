# Activity Feed / Event Log System

## Overview

The Activity Feed system provides a comprehensive event tracking infrastructure for Degentalk, enabling user activity streams, notifications, admin monitoring, and analytics. It captures meaningful user-triggered and system-triggered actions across the platform.

## Key Features

- **Universal Event Tracking**: Records user activities like thread creation, post replies, level-ups, badge earnings, etc.
- **Flexible Metadata Storage**: JSONB field allows storing context-specific data with each event
- **User Activity Feeds**: Display personalized activity streams in user profiles
- **Admin Monitoring**: Tools for admins to review user activities and platform events
- **Notification Integration**: Foundation for user notifications about relevant events
- **Analytics Support**: Data for engagement metrics and user behavior analysis

## Architecture

### Database Schema

The system is built on the `event_logs` table with the following structure:

```sql
CREATE TABLE "event_logs" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "event_type" event_type NOT NULL,
    "related_id" uuid,
    "meta" jsonb NOT NULL DEFAULT '{}',
    "created_at" timestamp NOT NULL DEFAULT now()
);
```

Event types are defined as a PostgreSQL enum:

```sql
CREATE TYPE "event_type" AS ENUM (
    'rain_claimed',
    'thread_created',
    'post_created',
    'cosmetic_unlocked',
    'level_up',
    'badge_earned',
    'tip_sent',
    'tip_received',
    'xp_earned',
    'referral_completed',
    'product_purchased',
    'mission_completed',
    'airdrop_claimed'
);
```

### Backend Components

- **Schema**: `db/schema/system/event_logs.ts` - Drizzle ORM schema definition
- **Types**: `db/types/system.types.ts` - TypeScript interfaces for event logs
- **Service**: `server/src/domains/activity/services/event-log.service.ts` - Core CRUD operations
- **Helper Service**: `server/src/domains/activity/services/event-logger.service.ts` - Specialized methods for common events
- **Controller**: `server/src/domains/activity/controllers/event-log.controller.ts` - API endpoints
- **Routes**: `server/src/domains/activity/routes/event-log.routes.ts` - API route definitions

### Frontend Components

- **API Service**: `client/src/features/activity/services/activityApi.ts` - Client-side API integration
- **React Hooks**: `client/src/features/activity/hooks/useActivityFeed.ts` - Data fetching hooks
- **Components**:
  - `client/src/features/activity/components/ActivityFeed.tsx` - Basic activity display
  - `client/src/features/activity/components/PaginatedActivityFeed.tsx` - Advanced with pagination
  - `client/src/features/activity/components/ActivityFeedWidget.tsx` - Compact widget for embedding

### Pages

- **User Profile**: `client/src/pages/profile/activity.tsx` - User's personal activity feed
- **Admin Overview**: `client/src/pages/admin/activity/index.tsx` - All platform activities
- **User-specific Admin**: `client/src/pages/admin/activity/user/[userId].tsx` - Single user activity review

## API Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/api/activity/event-logs/user/:userId` | GET | Get events for a specific user | Yes |
| `/api/activity/event-logs` | GET | Get all events (admin) | Yes (Admin) |
| `/api/activity/event-logs` | POST | Create new event (admin) | Yes (Admin) |
| `/api/activity/event-logs/:id` | GET | Get single event by ID (admin) | Yes (Admin) |
| `/api/activity/event-logs/:id` | DELETE | Delete event by ID (admin) | Yes (Admin) |

## Usage Examples

### Recording Events

```typescript
// Using the specialized helper service
import { eventLogger } from '@/domains/activity/services/event-logger.service';

// When a user creates a thread
await eventLogger.logThreadCreated(userId, threadId, { threadTitle: 'My New Thread' });

// When a user levels up
await eventLogger.logLevelUp(userId, oldLevel, newLevel);

// When a user earns a badge
await eventLogger.logBadgeEarned(userId, badgeId, badgeName);
```

### Displaying Activity Feed

```tsx
// Basic activity feed in a user profile
import { ActivityFeed } from '@/features/activity/components/ActivityFeed';

<ActivityFeed limit={10} />

// Paginated feed with filters
import { PaginatedActivityFeed } from '@/features/activity/components/PaginatedActivityFeed';

<PaginatedActivityFeed initialFilters={{ limit: 15, page: 1 }} />

// Compact widget for dashboard
import { ActivityFeedWidget } from '@/features/activity/components/ActivityFeedWidget';

<ActivityFeedWidget limit={5} showViewAllLink={true} />
```

### Admin Monitoring

```tsx
// In admin dashboard
import { useAdminActivityFeed } from '@/features/activity/hooks/useActivityFeed';

const { activityFeed, isLoading } = useAdminActivityFeed({
  eventType: ['thread_created', 'post_created'],
  limit: 20,
  page: 1
});

// For specific user investigation
import { useUserActivityFeed } from '@/features/activity/hooks/useActivityFeed';

const { activityFeed, isLoading } = useUserActivityFeed(userId, {
  limit: 20,
  page: 1
});
```

## Integration Points

The Activity Feed system integrates with:

1. **Forum System**: Records thread creation and post replies
2. **Economy System**: Tracks tips, rain claims, shop purchases
3. **Gamification**: Logs XP earned, level ups, badges, missions
4. **User Profile**: Displays personalized activity feeds
5. **Admin Tools**: Provides monitoring and audit capabilities

## Future Enhancements

- **Activity Aggregation**: Group similar events for cleaner feeds
- **Smart Notifications**: Use event logs to power intelligent notification system
- **Event Filtering**: Allow users to customize which events appear in their feeds
- **Activity Analytics**: Generate insights from event patterns
- **Social Features**: Allow commenting on or reacting to activity items

## Troubleshooting

### Common Issues

1. **Missing Events**: Check that the appropriate `eventLogger` method is being called in the relevant service
2. **Empty Activity Feeds**: Verify user has activities and permissions are set correctly
3. **Performance Issues**: Check indexes are properly used for large activity volumes

### Logging

Events are logged to the database with timestamps for audit purposes. Admin tools provide visibility into all events. 