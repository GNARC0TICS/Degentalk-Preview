# Community Engagement Features - Implementation Guide

## Overview

The Community Engagement sprint delivers a comprehensive social layer for DegenTalk, transforming it from a simple forum into a dynamic crypto community platform. This document outlines the implemented features, technical architecture, and usage guidelines.

## Features Implemented

### 🏷️ Phase 1: Mentions System

**Purpose**: Enable users to mention each other using @username syntax across the platform

**Components**:
- **Database Schema**: `db/schema/social/mentions.ts`
  - `mentions` table: Tracks all mention instances
  - `userMentionPreferences` table: User notification preferences
- **Backend Service**: `server/src/domains/social/mentions.service.ts`
  - Automatic mention extraction from content
  - Permission checking and privacy controls
  - Notification management
- **Frontend Components**:
  - `client/src/components/mentions/MentionAutocomplete.tsx`: Rich autocomplete with avatars
  - `client/src/components/mentions/MentionRenderer.tsx`: Display mentions in content
  - `client/src/hooks/use-mentions.ts`: React hook for mention functionality

**Integration Points**:
- **Rich Text Editor**: TipTap extension with enhanced mention suggestions
- **Thread/Post Creation**: Automatic mention processing on content submission
- **Shoutbox**: Real-time mention detection and autocomplete
- **Notifications**: Activity feed integration for mention alerts

**Key Features**:
- Real-time autocomplete with user search
- Role-based mention permissions
- Privacy controls (friends-only, followers-only)
- Unread mention tracking
- Context-aware notifications

### 🐋 Phase 2: Whale Watch System

**Purpose**: Enable users to follow high-value community members and track their activity

**Components**:
- **Database Schema**: `db/schema/social/user-follows.ts`
  - `userFollows` table: Follow relationships with notification preferences
  - `userFollowPreferences` table: Privacy and notification settings
  - `followRequests` table: Approval-based following
- **Backend Service**: `server/src/domains/social/follows.service.ts`
  - Follow/unfollow operations
  - Whale detection algorithms
  - Activity feed generation
- **Frontend Dashboard**: `client/src/components/social/WhaleWatchDashboard.tsx`
  - Following/followers management
  - Whale discovery interface
  - User search and follow functionality

**Key Features**:
- **Whale Detection**: Automatic identification based on level, clout, and activity
- **Privacy Controls**: Follow approval requirements, hidden follower counts
- **Notification Preferences**: Granular settings per followed user
- **Search & Discovery**: Find users by username with follow status
- **Activity Tracking**: Monitor followed users' posts and trades

### 👥 Phase 3: Friends System

**Purpose**: Mutual friendship system that controls direct messaging permissions

**Components**:
- **Database Schema**: `db/schema/social/friends.ts`
  - `friendships` table: Mutual friend relationships
  - `userFriendPreferences` table: Friend request settings
  - `friendGroups` table: Organized friend categories
- **Backend Foundation**: Complete schema and type definitions ready for API implementation

**Planned Features**:
- Friend request send/accept/decline workflow
- Mutual DM permissions through existing whispers system
- Friend groups for organization
- Online status indicators
- Friend-only content visibility

### ⚙️ Phase 4: Social Configuration

**Purpose**: Centralized configuration system for all social features

**Components**:
- **Configuration File**: `client/src/config/social.config.ts`
  - Feature toggles and permissions
  - Rate limiting configurations
  - Whale detection thresholds
  - Default privacy settings

**Key Features**:
- **Feature Gates**: Level and role-based access control
- **Rate Limiting**: Prevents spam and abuse
- **Whale Thresholds**: Configurable criteria for whale status
- **Privacy Defaults**: User-friendly default settings

## Technical Architecture

### Backend Structure

```
server/src/domains/social/
├── mentions.service.ts     # Mention processing and notifications
├── mentions.routes.ts      # Mention API endpoints
├── mentions.types.ts       # TypeScript interfaces
├── follows.service.ts      # Follow relationships and whale detection
├── follows.routes.ts       # Follow management API
├── follows.types.ts        # Follow-related types
└── social.routes.ts        # Main social router
```

### Database Schema

```
db/schema/social/
├── mentions.ts            # Mention tracking and preferences
├── user-follows.ts        # Follow relationships and settings
└── friends.ts             # Friendship system (ready for implementation)
```

### Frontend Components

```
client/src/components/
├── mentions/
│   ├── MentionAutocomplete.tsx    # Rich mention suggestions
│   └── MentionRenderer.tsx        # Display mentions in content
├── social/
│   └── WhaleWatchDashboard.tsx    # Following management interface
├── notifications/
│   └── MentionsNotifications.tsx  # Mention notifications UI
└── shoutbox/
    └── ShoutboxInput.tsx          # Enhanced chat input with mentions
```

## API Endpoints

### Mentions API (`/api/social/mentions`)

- `GET /` - Get user's mentions with pagination
- `GET /unread-count` - Get unread mention count
- `POST /mark-read` - Mark mentions as read
- `GET /preferences` - Get user mention preferences
- `PUT /preferences` - Update mention preferences
- `GET /search-users` - Search users for mention autocomplete

### Follows API (`/api/social/follows`)

- `POST /` - Follow a user
- `DELETE /` - Unfollow a user
- `GET /following` - Get following list
- `GET /followers` - Get followers list
- `GET /counts` - Get follow counts
- `GET /check/:userId` - Check follow status
- `GET /requests` - Get follow requests
- `POST /requests/:id/respond` - Respond to follow request
- `GET /whales` - Get whale candidates
- `GET /search` - Search users to follow
- `GET /preferences` - Get follow preferences
- `PUT /preferences` - Update follow preferences

## Usage Guidelines

### For Developers

**Adding Mention Support to New Content Types**:
1. Add mention processing in content creation/update endpoints
2. Use `MentionsService.processMentions()` after content insertion
3. Include mention rendering in display components

**Implementing Whale Detection**:
1. Configure thresholds in `social.config.ts`
2. Use `SocialConfigHelper.isWhale()` for detection
3. Apply whale-specific UI elements (crown badges, etc.)

**Follow System Integration**:
1. Add follow buttons to user profiles and cards
2. Use `FollowsService` for follow operations
3. Implement activity feeds using follow relationships

### For Administrators

**Social Feature Configuration**:
- Modify `social.config.ts` for platform-wide settings
- Adjust whale detection thresholds based on platform metrics
- Configure rate limits to prevent abuse

**Privacy and Moderation**:
- Monitor mention abuse through admin dashboard
- Review follow request patterns for spam detection
- Manage whale status manually if needed

### for Users

**Mention Usage**:
- Type `@username` to mention users in posts, threads, and chat
- Configure notification preferences in user settings
- Use privacy controls to limit who can mention you

**Following Whales**:
- Discover whales through the WhaleWatch dashboard
- Customize notification preferences per followed user
- Use search to find specific users to follow

## Performance Considerations

### Database Optimization

- **Mentions**: Indexed on `mentionedUserId` and `isRead` for fast notification queries
- **Follows**: Indexed on `followerId` and `followedId` for efficient relationship lookups
- **Rate Limiting**: In-memory tracking with Redis fallback for production

### Frontend Optimization

- **Mention Autocomplete**: Debounced search with 300ms delay
- **Activity Feeds**: Paginated with infinite scroll
- **Real-time Updates**: WebSocket integration for instant notifications

### Caching Strategy

- **User Search**: 30-second cache for mention autocomplete
- **Follow Counts**: 5-minute cache for profile display
- **Whale Lists**: 1-hour cache for discovery page

## Security Features

### Privacy Controls

- **Mention Permissions**: Friend-only or follower-only mentions
- **Follow Privacy**: Hidden follower counts and lists
- **Request Approval**: Require approval for follow requests

### Rate Limiting

- **Mentions**: 100 per hour for regular users, higher for mods
- **Follows**: 50 per hour to prevent follow spam
- **Friend Requests**: 20 per day to prevent abuse

### Data Protection

- **Soft Deletes**: Preserve social graph integrity
- **User Blocking**: Prevent unwanted social interactions
- **Admin Override**: Emergency controls for moderation

## Integration with Existing Systems

### XP and Economy

- **Mention Rewards**: Award XP for meaningful mentions
- **Whale Benefits**: Special perks for whale status
- **Social Achievements**: Unlock titles based on follow counts

### Forum System

- **Thread Mentions**: Process mentions in thread creation
- **Post Mentions**: Real-time mention detection in replies
- **Forum-Specific Following**: Follow users within specific forums

### Messaging System

- **Whisper Integration**: Friend status controls DM permissions
- **Mention Notifications**: Direct links to mentioned content
- **Chat Mentions**: Real-time mention highlighting

## Future Enhancements

### Planned Features

1. **Friends System Completion**: Full friend request workflow
2. **Activity Feeds**: Comprehensive social activity streams
3. **Social Analytics**: Detailed social engagement metrics
4. **Group Following**: Follow entire user groups or teams
5. **Social Achievements**: Gamified social interaction rewards

### Technical Improvements

1. **Real-time Notifications**: WebSocket-based instant alerts
2. **Advanced Whale Detection**: Machine learning-based identification
3. **Social Graph Analytics**: Community influence mapping
4. **Cross-Platform Integration**: API for mobile apps

## Testing

### Unit Tests

- Mention extraction and processing
- Follow relationship validation
- Privacy control enforcement

### Integration Tests

- End-to-end mention workflow
- Follow notification delivery
- Social permission enforcement

### Performance Tests

- Mention autocomplete latency
- Follow feed generation speed
- Database query optimization

## Deployment Notes

### Database Migrations

```bash
# Apply social schema migrations
npm run db:migrate:Apply

# Sync forum configuration
npm run sync:forums
```

### Environment Setup

```bash
# Enable social features in development
SOCIAL_FEATURES_ENABLED=true
MENTIONS_ENABLED=true
FOLLOWS_ENABLED=true
```

### Production Considerations

- Monitor mention processing performance
- Set up Redis for rate limiting in production
- Configure proper CORS for social API endpoints
- Enable audit logging for social actions

---

The Community Engagement features represent a significant evolution of DegenTalk's social capabilities, providing the foundation for a vibrant, connected crypto community. The modular architecture ensures easy maintenance and future expansion while maintaining high performance and security standards.