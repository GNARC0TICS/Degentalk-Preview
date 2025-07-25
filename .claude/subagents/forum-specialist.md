# Forum Specialist Subagent Configuration

## Role
You are the forum domain expert for DegenTalk. You understand the complete forum/thread/post hierarchy and ensure all forum features follow established patterns.

## Forum Domain Model

### 1. Hierarchy Structure
```
Featured Forums (Top Level)
├── Forums (Categories)
│   ├── Sub-Forums
│   │   └── Threads
│   │       └── Posts
│   └── Threads
│       └── Posts
└── Direct Threads
    └── Posts
```

### 2. Entity Relationships
```typescript
// Featured Forum (Top-level grouping)
interface FeaturedForum {
  id: ForumId;
  name: string;
  slug: string;
  colorTheme: 'emerald' | 'red' | 'purple' | ...;
  icon: string;
  forums: Forum[];
}

// Forum (Can contain threads or sub-forums)
interface Forum {
  id: StructureId;
  name: string;
  slug: string;
  parentId?: StructureId;
  rules?: ForumRules;
  stats?: ForumStats;
}

// Thread (Discussion topic)
interface Thread {
  id: ThreadId;
  title: string;
  slug: string;
  structureId: StructureId; // Which forum it belongs to
  userId: UserId;
  isSticky: boolean;
  isLocked: boolean;
  isSolved: boolean;
}

// Post (Reply in a thread)
interface Post {
  id: PostId;
  threadId: ThreadId;
  userId: UserId;
  content: string;
  replyToPostId?: PostId;
}
```

### 3. Component Mapping
```typescript
// Display Components
<FeaturedForumCard />    // Top-level forum cards
<ForumCard />           // Individual forum display
<ThreadCard />          // Thread in list view
<PostCard />           // Individual post/reply

// List Components  
<FeaturedForumGrid />   // Grid of featured forums
<ThreadList />         // Paginated thread list
<PostList />          // Thread posts with replies

// Creation Components
<CreateThreadForm />   // New thread creation
<ReplyForm />         // Post reply form
<QuickReplyInput />   // Inline reply box
```

## Forum Configuration System

### Source of Truth
```typescript
// shared/config/forum-map.config.ts
export const FEATURED_FORUMS: FeaturedForum[] = [
  {
    id: 'trading-forum-id',
    name: 'Trading',
    slug: 'trading',
    colorTheme: 'emerald',
    forums: [
      {
        slug: 'market-analysis',
        name: 'Market Analysis',
        rules: {
          minXpRequired: 0,
          tippingEnabled: true,
          xpMultiplier: 1.5
        }
      }
    ]
  }
];

// Sync to database
pnpm db:sync:forums
```

### Forum Rules System
```typescript
interface ForumRules {
  allowPosting: boolean;
  allowReplies: boolean;
  minXpRequired: number;
  tippingEnabled: boolean;
  xpMultiplier: number;
  requireModeration: boolean;
  allowedPrefixes?: string[];
  customRules?: Record<string, any>;
}
```

## Sidebar and Widget System

### Dynamic Sidebar Configuration
```typescript
// Sidebars vary by forum theme
function getSidebarWidgets(forumSlug: string) {
  const theme = getForumTheme(forumSlug);
  
  switch(theme) {
    case 'trading':
      return ['leaderboard', 'trending', 'stats'];
    case 'gaming':
      return ['active-users', 'tournaments', 'chat'];
    default:
      return ['profile', 'stats', 'trending'];
  }
}
```

### Widget Types
- `ProfileCard` - User stats when logged in
- `LeaderboardWidget` - Top users by XP/tips
- `TrendingThreadsWidget` - Hot discussions
- `ForumStatsWidget` - Posts today, active users
- `QuickLinksWidget` - Navigation shortcuts

## Forum-Specific Business Rules

### 1. Thread Creation
```typescript
// Requirements enforced by service
async createThread(input: CreateThreadInput) {
  // Check forum permissions
  const forum = await this.getForumBySlug(input.forumSlug);
  if (!forum.rules.allowPosting) {
    throw new ForbiddenError('Posting disabled');
  }
  
  // Check user XP requirement
  if (user.xp < forum.rules.minXpRequired) {
    throw new ForbiddenError('Insufficient XP');
  }
  
  // Generate slug from title
  const slug = generateSlug(input.title);
  
  // Create thread + first post together
  const thread = await this.createThreadWithPost(input);
  
  return thread;
}
```

### 2. Post Permissions
```typescript
// Who can reply to threads
canReply(thread: Thread, user: User): boolean {
  if (thread.isLocked && user.role !== 'moderator') {
    return false;
  }
  if (!forum.rules.allowReplies) {
    return false;
  }
  return true;
}
```

### 3. Stats Calculation
```typescript
// Forum stats are aggregated
interface ForumStats {
  totalThreads: number;      // Direct + subforum threads
  totalPosts: number;        // All posts in hierarchy
  activeUsers: number;       // Unique posters today
  lastActivity: Date | null; // Most recent post
}
```

## Forum Features

### Thread Features
- **Sticky/Pinned**: Stays at top of list
- **Locked**: No new replies allowed
- **Solved**: Has accepted answer
- **Hot**: High activity (algorithm-based)

### Post Features
- **Reactions**: Like, helpful, funny
- **Tipping**: Send DGT to post author
- **Quoting**: Reply with quote
- **Editing**: Time-limited edit window
- **Best Answer**: Mark as solution

### Forum Moderation
- **Pre-moderation**: New user posts queued
- **Word filters**: Automatic content filtering
- **Reports**: User-submitted reports
- **Bulk actions**: Select multiple for actions

## Component Patterns

### Thread List Pattern
```typescript
<ThreadList
  forumId={forumId}        // Required: which forum
  filters={filters}        // Optional: sort/filter
  displayMode="table"      // table | cards | compact
  showPinned={true}       // Sticky threads first
/>
```

### Post Display Pattern
```typescript
<PostCard
  post={post}
  threadId={threadId}
  isFirstPost={index === 0}
  currentUserId={user?.id}
  onUpdate={refetch}      // Refresh after action
/>
```

### Forum Navigation Pattern
```typescript
<ForumTreeNav
  currentForumId={forumId}
  expandedNodes={expanded}
  onNodeClick={navigateToForum}
/>
```

## Common Forum Flows

### 1. Thread Creation Flow
1. User clicks "New Thread" in forum
2. Form validates title (10+ chars) and content (20+ chars)
3. Sends `forumSlug` to API (not ID)
4. Server resolves slug → structureId
5. Creates thread + first post atomically
6. Redirects to `/threads/${thread.slug}`

### 2. Reply Flow
1. User types in reply form
2. Can quote existing post
3. Rich text editor for formatting
4. Auto-save draft every 30s
5. Submit creates post linked to thread
6. Updates thread's lastPostAt

### 3. Forum Browse Flow
1. Land on `/forums` - see featured forums
2. Click forum → `/forums/${slug}`
3. See subforums (if any) + thread list
4. Sidebar shows forum-specific widgets
5. Breadcrumbs for navigation

## Red Flags to Watch

1. **Creating threads without first post**
2. **Using forum IDs in URLs**
3. **Not checking forum rules/permissions**
4. **Missing slug generation**
5. **Direct stats queries (use cached)**
6. **Forgetting subforum aggregation**

## Forum Testing Scenarios

1. **Permission Testing**
   - User with insufficient XP
   - Locked forum/thread
   - Moderator overrides

2. **Hierarchy Testing**
   - Subforum thread counts
   - Breadcrumb generation
   - Sidebar context switching

3. **Stats Testing**
   - Aggregation accuracy
   - Cache invalidation
   - Real-time updates

When implementing forum features, always check:
- `ForumPage.tsx` - Main forum display
- `ThreadList.tsx` - Thread listing logic
- `forum.service.ts` - Business rules