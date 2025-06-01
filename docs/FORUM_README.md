# ForumFusion Forum System

## Overview

ForumFusion provides a full-featured forum system built with React and Express. The system supports hierarchical forum categories, thread creation, replies, likes, bookmarks, and thread solving.

## Structure

The forum system follows a hierarchical structure:

1. **Zones** - Top-level categories that group related forums together
2. **Forums** - Individual discussion areas within a zone
3. **Threads** - User-created discussions within a forum
4. **Posts** - Individual messages within a thread

## Routes

The forum system uses the following route structure:

- `/forum` - Main forum listing page
- `/forums/:slug` - Individual forum view showing threads
- `/threads/:slug` - Individual thread view showing posts
- `/tags/:slug` - View threads with a specific tag

## Key Components

### Frontend Components

#### Pages
- `ForumPage` (`client/src/pages/forum.tsx`) - Main forum listing
- `ForumBySlugPage` (`client/src/pages/forums/[forum_slug].tsx`) - Individual forum view
- `ThreadPage` (`client/src/pages/threads/[thread_slug].tsx`) - Thread view with posts

#### Feature Components
- `ThreadCard` - Thread preview component
- `PostCard` - Post/reply component
- `ReplyForm` - Form for creating thread replies
- `CreateThreadButton` - Button to create a new thread
- `LikeButton` - Button to like a post
- `ShareButton` - Button to share a thread

### Backend Components

#### Controllers and Services
- `forum.controller.ts` - Request handlers for forum endpoints
- `forum.service.ts` - Business logic for forum operations
- `forum.routes.ts` - Route definitions for forum API

## API Endpoints

### Categories
- `GET /api/forum/categories` - List all categories with stats
- `GET /api/forum/categories/tree` - Get hierarchical category structure
- `GET /api/forum/categories/:slug` - Get a specific category by slug
- `GET /api/forum/category/:id` - Get a specific category by ID
- `GET /api/forum/forums/:slug` - Get a forum by slug
- `GET /api/forum/forums/:slug/topics` - Get a forum with its topics

### Threads
- `GET /api/forum/threads/search` - Search threads with filters
- `GET /api/threads/:id` - Get a thread by ID
- `GET /api/threads/slug/:slug` - Get a thread by slug
- `POST /api/forum/threads` - Create a new thread
- `POST /api/threads/:threadId/solve` - Mark a thread as solved
- `POST /api/threads/:threadId/unsolve` - Mark a thread as unsolved

### Posts
- `GET /api/threads/:threadId/posts` - Get posts for a thread
- `POST /api/forum/posts` - Create a new post
- `PUT /api/forum/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post
- `POST /api/posts/:id/like` - Like a post
- `DELETE /api/posts/:id/like` - Unlike a post
- `POST /api/posts/:id/tip` - Tip a post

### Tags & Prefixes
- `GET /api/forum/tags` - Get all tags
- `POST /api/forum/threads/:threadId/tags` - Add a tag to a thread
- `DELETE /api/forum/threads/:threadId/tags/:tagId` - Remove a tag from a thread
- `GET /api/forum/prefixes` - Get all prefixes (optionally filtered by category)

### Bookmarks
- `POST /api/bookmarks` - Bookmark a thread
- `DELETE /api/bookmarks/:threadId` - Remove a bookmark
- `GET /api/bookmarks` - Get user's bookmarks

## Hooks & Services

### React Query Hooks
The forum system uses React Query hooks in `client/src/features/forum/hooks/useForumQueries.ts`:

- `useCategories` - Fetch all forum categories
- `useFetchForumCategoriesTree` - Fetch hierarchical category tree
- `useCategory` - Fetch a specific category by slug
- `useThreads` - Fetch threads with optional filtering
- `useThread` - Fetch a specific thread
- `usePosts` - Fetch posts for a thread
- And more for mutations...

### API Service
The `forumApi` service provides a unified interface for all forum API operations:

```typescript
import { forumApi } from '@/features/forum/services/forumApi';

// Examples
const categories = await forumApi.getCategories();
const thread = await forumApi.getThread(threadId);
const result = await forumApi.createPost({
  threadId,
  content,
  replyToPostId
});
```

## Features

- Thread creation and replies
- Thread categorization with forums and zones
- Thread tagging and prefixes
- Thread bookmarking
- Post liking and reactions
- Thread solving (marking a post as the solution)
- Thread and post moderation
- Rich text editing
- Mobile-responsive design

## Permissions

- Thread owners can:
  - Edit their threads
  - Mark posts as solutions
  - Delete their threads

- Post owners can:
  - Edit their posts
  - Delete their posts

- Moderators can:
  - Mark any thread as solved/unsolved
  - Edit any thread/post
  - Hide threads/posts

- Admins have all permissions and can also:
  - Delete any thread/post
  - Manage categories and prefixes

## Testing

To test the forum endpoints, run:

```bash
npm run test:forum-endpoints
```

This script verifies that all forum API endpoints are responding correctly. 