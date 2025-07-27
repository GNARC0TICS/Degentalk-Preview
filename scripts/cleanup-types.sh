#!/bin/bash
# Type System Cleanup Script
# Run with: bash scripts/cleanup-types.sh

echo "🧹 Starting Type System Cleanup..."

# Phase 1: Flatten the structure
echo "📁 Phase 1: Flattening structure..."

# Move forum.types.ts out of core/
if [ -f "shared/types/core/forum.types.ts" ]; then
    mv shared/types/core/forum.types.ts shared/types/forum.types.ts
    echo "✅ Moved forum.types.ts to root"
fi

# Move cosmetics and economy out of core/
if [ -f "shared/types/core/cosmetics.types.ts" ]; then
    mv shared/types/core/cosmetics.types.ts shared/types/cosmetics.types.ts
    echo "✅ Moved cosmetics.types.ts to root"
fi

if [ -f "shared/types/core/economy.types.ts" ]; then
    mv shared/types/core/economy.types.ts shared/types/economy.types.ts
    echo "✅ Moved economy.types.ts to root"
fi

# Check if role.types.ts already exists at root (it does!)
if [ -f "shared/types/role.types.ts" ]; then
    echo "⚠️  role.types.ts already exists at root - will need to merge with entities/role.types.ts"
fi

# Phase 2: Create post.types.ts
echo "📝 Phase 2: Creating post.types.ts..."

cat > shared/types/post.types.ts << 'EOF'
import type { PostId, ThreadId, UserId } from './ids.js';

/**
 * THE Post Type
 * One type. Everywhere. No exceptions.
 */
export interface Post {
  id: PostId;
  threadId: ThreadId;
  userId: UserId;
  content: string;
  
  // Relations
  user: PostAuthor;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
  
  // Stats
  likeCount: number;
  tipCount?: number;
  replyCount?: number;
  
  // Status
  isDeleted: boolean;
  isHidden: boolean;
  isPinned?: boolean;
  isSolution?: boolean;
  
  // Relations
  replyToPostId?: PostId;
  quotedPostId?: PostId;
  
  // User context (when authenticated)
  hasLiked?: boolean;
  hasTipped?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canModerate?: boolean;
}

export interface PostAuthor {
  id: UserId;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  level: number;
  role: 'user' | 'moderator' | 'admin' | 'owner';
  isVerified?: boolean;
  isBanned?: boolean;
}

// Input types
export interface CreatePostInput {
  threadId: ThreadId;
  content: string;
  replyToPostId?: PostId;
}

export interface UpdatePostInput {
  content: string;
}

// List types
export type PostListItem = Pick<Post, 
  | 'id' 
  | 'content' 
  | 'createdAt' 
  | 'user' 
  | 'likeCount'
  | 'hasLiked'
>;

// That's it. No more types.
EOF

echo "✅ Created post.types.ts"

# Phase 3: Fix the critical import in db/types/forum.types.ts
echo "🔧 Phase 3: Fixing critical imports..."

# Create a fixed version
cat > db/types/forum.types.ts.fixed << 'EOF'
import type { ForumStructureNode } from '../schema/forum/structure';
import type { threadPrefixes } from '../schema';
import type { TagId } from '@shared/types/ids';

// Fixed imports - no more cross-workspace violations!
import type { Thread } from '@shared/types/thread.types';
import type { Post } from '@shared/types/post.types';

/**
 * DEPRECATION NOTICE
 * These aliases exist only for backward compatibility.
 * Use Thread and Post directly from @shared/types
 */

/** @deprecated Use Thread from @shared/types/thread.types */
export type ThreadWithUser = Thread;
export type CanonicalThread = Thread;

/** @deprecated Use Post from @shared/types/post.types */
export type PostWithUser = Post;
export type CanonicalPost = Post;

/** @deprecated Use Thread */
export type ThreadWithUserAndCategory = Thread;
export type ThreadWithUserAndStructure = Thread;

/** @deprecated Use Thread & Post[] */
export interface ThreadWithPostsAndUser {
  thread: Thread;
  posts: Post[];
  pagination: PaginationInfo;
}

/** @deprecated */
export interface ThreadWithPostsAndUserStructure extends ThreadWithPostsAndUser {}

// Keep these for now - they're actually used
export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ForumTag {
  id: TagId;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: Date;
}

// Rest of the file remains the same...
export interface ForumCategoryWithStats extends ForumStructureNode {
  threadCount: number;
  postCount: number;
  lastThread?: Thread;
  parentId: string | null;
  pluginData: Record<string, unknown>;
  minXp: number;
  type: string;
  colorTheme: string | null;
  icon: string;
  isHidden: boolean;
  canHaveThreads: boolean;
  childForums?: ForumCategoryWithStats[];
}

export interface ForumStructureWithStats extends ForumStructureNode {
  threadCount: number;
  postCount: number;
  lastThread?: Thread;
  canHaveThreads: boolean;
  childStructures?: ForumStructureWithStats[];
}

export type ThreadPrefix = typeof threadPrefixes.$inferSelect;

export const __ensureModule = true;
EOF

echo "✅ Created fixed version of db/types/forum.types.ts"

# Phase 4: Update shared/types/index.ts
echo "📦 Phase 4: Updating index exports..."

cat > shared/types/index.ts.new << 'EOF'
// Core types - flat and simple
export * from './ids.js';
export * from './user.types.js';
export * from './thread.types.js';
export * from './post.types.js';
export * from './forum.types.js';
export * from './role.types.js';
export * from './wallet.types.js';
export * from './api.types.js';
export * from './theme.types.js';

// Re-export specific types for convenience
export type { User, UserSummary, PublicUser } from './user.types.js';
export type { Thread, ThreadUser, ThreadListItem, CreateThreadInput } from './thread.types.js';
export type { Post, PostAuthor, CreatePostInput } from './post.types.js';

// For backward compatibility (temporary)
export type { User as AuthenticatedUser } from './user.types.js';
EOF

echo "✅ Created new index.ts"

echo "
🎉 Cleanup script complete!

Next manual steps:
1. Review and apply the changes:
   - mv db/types/forum.types.ts.fixed db/types/forum.types.ts
   - mv shared/types/index.ts.new shared/types/index.ts

2. Clean up empty directories:
   - rmdir shared/types/core (after checking it's empty)
   - rmdir shared/types/entities (after merging role types)

3. Run validation:
   - pnpm typecheck
   - pnpm build

4. Fix remaining imports in client files

5. Delete deprecated files once everything works
"