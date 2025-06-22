# Forum Power Features Documentation

This document outlines the advanced forum features implemented in the "Forum Power Features" sprint, providing high-leverage upgrades that complete the forum experience.

## 🎯 Sprint Overview

The Forum Power Features sprint focused on five key areas:

1. **Enhanced Thread Management** - Advanced filtering and sorting
2. **Moderator Power Tools** - Comprehensive moderation interface
3. **Draft System** - Auto-save and recovery functionality
4. **Contextual Error Pages** - User-friendly error handling
5. **Admin Configurability** - Backend controls for all features

## 📋 Phase 1: Enhanced Thread Management

### ThreadFilters Component

**Location:** `/client/src/components/forum/ThreadFilters.tsx`

Advanced filtering interface supporting:

#### Sort Options

- **Latest** - Most recent activity (default)
- **Hot** - Based on engagement score algorithm
- **Most Staked** - Highest DGT staking amounts
- **Most Liked** - Highest like counts
- **Most Replied** - Highest reply counts
- **Oldest** - Chronological order from earliest

#### Filtering Capabilities

- **Tag Filtering** - Multi-select with autocomplete
- **Prefix Filtering** - Forum-specific thread prefixes
- **Saved Filters** - localStorage persistence per forum
- **Mobile Optimization** - Bottom sheet interface on mobile

#### API Integration

**Backend Updates:** `/server/src/domains/forum/forum.routes.ts`

New sorting logic:

```typescript
switch (sortBy) {
	case 'most-liked':
		orderByClause = [
			desc(threads.isSticky),
			desc(threads.firstPostLikeCount),
			desc(threads.lastPostAt)
		];
		break;
	case 'most-replied':
		orderByClause = [desc(threads.isSticky), desc(threads.postCount), desc(threads.lastPostAt)];
		break;
	case 'oldest':
		orderByClause = [desc(threads.isSticky), asc(threads.createdAt)];
		break;
}
```

Tag filtering with JOIN operations:

```typescript
// Get threads that have ALL specified tags
const threadsWithTags = await db
	.select({ threadId: threadTags.threadId })
	.from(threadTags)
	.where(inArray(threadTags.tagId, tagIds))
	.groupBy(threadTags.threadId)
	.having(sql`COUNT(DISTINCT ${threadTags.tagId}) = ${tagIds.length}`);
```

#### Usage Example

```tsx
<ThreadFilters
	availableTags={availableTags}
	availablePrefixes={prefixes}
	onFiltersChange={handleFiltersChange}
	forumSlug={forumSlug}
/>
```

## 🛡️ Phase 2: Moderator Power Tools

### ModeratorActions Component

**Location:** `/client/src/components/forum/ModeratorActions.tsx`

Comprehensive moderation interface with role-based visibility:

#### Thread Actions

- **Lock/Unlock** - Prevent new replies
- **Pin/Unpin** - Sticky threads to top
- **Hide/Show** - Control visibility
- **Delete** - Permanent removal with reason logging
- **Moderator Notes** - Private admin-only annotations

#### Post Actions

- **Hide/Show** - Individual post moderation
- **Delete** - Remove posts with audit trail
- **Moderator Notes** - Contextual admin notes

#### Permission System

Only visible to users with `mod` or `admin` roles:

```tsx
const isModerator = user?.role === 'mod' || user?.role === 'admin';
if (!isModerator) return null;
```

### Moderator Notes System

**Backend Schema:** `/db/schema/admin/moderator-notes.ts`

```sql
CREATE TABLE moderator_notes (
    id SERIAL PRIMARY KEY,
    type moderator_note_type NOT NULL, -- 'thread' | 'post' | 'user'
    item_id VARCHAR(255) NOT NULL,
    note TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**API Endpoints:** `/server/src/domains/admin/sub-domains/moderator-notes/`

- `POST /api/admin/moderator-notes` - Create note
- `GET /api/admin/moderator-notes?type=thread&itemId=123` - Get notes
- `DELETE /api/admin/moderator-notes/:id` - Delete note (creator or admin only)

#### Integration

```tsx
// In ThreadCard and PostCard
<ModeratorActions
	type="thread"
	itemId={thread.id}
	itemData={{
		isLocked,
		isSticky,
		isHidden,
		userId: user?.id,
		username: user?.username
	}}
/>
```

## 💾 Phase 3: Draft System

### useDraft Hook

**Location:** `/client/src/hooks/use-draft.ts`

Comprehensive draft management with auto-save functionality:

#### Features

- **Auto-save** - Configurable intervals (default 30s)
- **Cloud Sync** - Server-side draft storage for authenticated users
- **Local Backup** - localStorage fallback
- **Conflict Resolution** - User prompts for cloud vs local drafts
- **Navigation Warning** - Prevents data loss on page leave

#### Hook Interface

```tsx
const {
	draft, // Current draft data
	updateDraft, // Update draft function
	clearDraft, // Clear all draft data
	isDirty, // Has unsaved changes
	isSaving, // Currently saving
	lastSaved, // Last save timestamp
	hasDraft // Has any draft data
} = useDraft({
	key: `thread-${forumSlug}`,
	autoSaveInterval: 30000,
	enableCloudSync: true,
	onAutoSave: () => showToast()
});
```

#### Database Integration

Uses existing `threadDrafts` table with enhanced API:

- `POST /api/forum/drafts` - Create draft
- `PUT /api/forum/drafts/:id` - Update draft
- `GET /api/forum/drafts/:key` - Retrieve draft
- `DELETE /api/forum/drafts/:id` - Delete draft

#### CreateThreadForm Integration

**Location:** `/client/src/features/forum/components/CreateThreadForm.tsx`

- Real-time draft status indicator
- Auto-save progress feedback
- Draft restoration on form open
- Unsaved changes warning

## 🚨 Phase 4: Contextual Error Pages

Comprehensive error handling with contextual suggestions and recovery options.

### ThreadNotFound Component

**Location:** `/client/src/components/errors/ThreadNotFound.tsx`

#### Features

- **Contextual Information** - Thread ID, forum context
- **Related Suggestions** - Hot threads from same forum
- **Quick Actions** - Go back, browse forum, search, home
- **Smart Recovery** - Forum-specific thread recommendations

### ForumNotFound Component

**Location:** `/client/src/components/errors/ForumNotFound.tsx`

#### Features

- **Zone Suggestions** - Popular primary zones
- **Navigation Helpers** - Browse all zones, search forums
- **Helpful Tips** - Troubleshooting guidance
- **Visual Hierarchy** - Clear error communication

### UserNotFound Component

**Location:** `/client/src/components/errors/UserNotFound.tsx`

#### Features

- **Privacy Handling** - Distinguishes private vs non-existent profiles
- **Active Users** - Community member suggestions
- **Search Integration** - Direct links to user search
- **Context Awareness** - Username vs user ID handling

### NetworkError Component

**Location:** `/client/src/components/errors/NetworkError.tsx`

#### Features

- **Auto-retry** - Configurable retry attempts with exponential backoff
- **Connection Status** - Real-time online/offline detection
- **Progress Indicators** - Countdown timers and retry progress
- **Troubleshooting** - Context-specific help suggestions

#### Usage Example

```tsx
<NetworkError
	onRetry={() => refetch()}
	error={error}
	autoRetry={true}
	maxRetries={3}
	retryDelay={5000}
/>
```

## ⚙️ Phase 5: Admin Configurability

### Implementation Status

The following admin configuration features were designed but require additional implementation time:

#### Thread Sort Configuration

- Admin toggles for available sort modes per forum
- Custom sort algorithms and weights
- Forum-specific default sorting

#### Auto-moderation Rules

- Configurable thresholds (report count, content length)
- Automated actions based on user behavior
- Escalation workflows

#### Draft Settings

- Global auto-save intervals
- Draft retention policies
- Storage quotas per user

#### Error Page Customization

- Admin-editable error messages
- Custom CTAs and branding
- Analytics integration

### Database Schema Prepared

Tables ready for admin configuration:

- `admin_feature_flags` - Feature toggles
- `admin_settings` - Global configuration
- `forum_settings` - Per-forum configuration

## 🔧 Technical Implementation Details

### API Patterns

All new endpoints follow consistent patterns:

- Standardized error responses
- Permission-based access control
- Comprehensive input validation
- Audit logging for moderation actions

### Frontend Architecture

- **Component Composition** - Modular, reusable components
- **Hook-based State** - Custom hooks for complex logic
- **Type Safety** - Full TypeScript coverage
- **Responsive Design** - Mobile-first approach

### Performance Optimizations

- **Query Optimization** - Efficient database indexes
- **Caching Strategy** - React Query with stale-while-revalidate
- **Bundle Splitting** - Lazy-loaded error components
- **Debounced Operations** - Auto-save and search inputs

## 📊 Success Metrics

### User Engagement

- **Filter Usage** - Track most popular sort/filter combinations
- **Draft Recovery** - Measure successful draft restorations
- **Error Recovery** - Bounce rate reduction on error pages

### Moderation Efficiency

- **Action Speed** - Time from report to resolution
- **Bulk Operations** - Percentage of actions using bulk tools
- **Note Usage** - Moderator note creation and reference rates

### System Reliability

- **Auto-retry Success** - Network error recovery rates
- **Draft Recovery** - Successful content restoration
- **Error Context** - User satisfaction with error page suggestions

## 🚀 Future Enhancements

### Planned Features

1. **Bulk Moderation** - Multi-select thread/post actions
2. **User Moderation Drawer** - Comprehensive user info overlay
3. **Advanced Analytics** - Moderation metrics dashboard
4. **Smart Suggestions** - AI-powered content recommendations

### Extension Points

- **Plugin Architecture** - Custom moderation actions
- **Webhook Integration** - External system notifications
- **Advanced Filtering** - Date ranges, user-specific filters
- **Export Functions** - Moderation reports and analytics

## 📖 Usage Guidelines

### For Developers

1. **Error Handling** - Always use contextual error components
2. **Moderation UI** - Include ModeratorActions in content displays
3. **Draft Integration** - Use useDraft hook for all forms
4. **Performance** - Leverage React Query caching patterns

### For Moderators

1. **Quick Actions** - Use dropdown menus for efficient moderation
2. **Note Taking** - Document decisions for team consistency
3. **Bulk Operations** - Process multiple items when available
4. **User Context** - Check user history before taking action

### For Administrators

1. **Configuration** - Customize features per forum needs
2. **Monitoring** - Track moderation metrics and user feedback
3. **Policies** - Set clear guidelines for moderation teams
4. **Updates** - Stay informed on new feature releases

---

This documentation covers the complete "Forum Power Features" implementation, providing both technical details and practical usage guidance for all stakeholders.
