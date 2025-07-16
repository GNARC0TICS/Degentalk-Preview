# Forum API and Architecture Guide

This guide provides a detailed overview of the forum system's architecture, including API endpoints, data models, and the logic for features like "Hot Topics" and "Trending Threads."

## 1. Main Application Routes & API Endpoints

The core of the forum API is built with Express.js. The main router is located at `/api/forum`, and it delegates requests to more specialized route modules.

### Primary Route Modules:

-   `/api/forum/structure`: Provides the hierarchical structure of the forum (zones and forums).
-   `/api/forum/threads`: Handles all operations related to threads.
-   `/api/forum/posts`: Manages posts within threads.
-   `/api/forum/users/search`: Powers user search and mentions.
-   `/api/forum/tags`: Manages thread tags.
-   `/api/forum/zone-stats`: Provides statistics for forum zones, including trending threads.

### Thread API Endpoints (`/api/forum/threads`)

These are the most relevant endpoints for displaying thread data:

| Method | Path | Description | Authentication |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Searches for threads with various filters | Public |
| `GET` | `/:id` | Retrieves a single thread by its ID. | Public |
| `GET` | `/slug/:slug` | Retrieves a single thread by its slug. | Public |
| `POST` | `/` | Creates a new thread. | User |
| `POST` | `/:threadId/feature` | Marks a thread as "featured." | Admin/Mod |
| `DELETE`| `/:threadId/feature`| Removes a thread's "featured" status. | Admin/Mod |

## 2. "Hot" and "Trending" Logic

The "Hot Topics" and "Trending Threads" features are driven by the `threadService` and the `hotScore` field in the `threads` database table.

-   **`thread.service.ts`**: This service contains the business logic for fetching and manipulating thread data.
    -   The `fetchThreadsByTab` function is the primary method for getting lists of threads for the UI, including a "trending" tab.
    -   When fetching trending threads, the `searchThreads` method is called with `sortBy: 'trending'`.
-   **`hotScore`**: This is a numeric field in the `threads` table that determines a thread's ranking. The service sorts threads in descending order by `hotScore` to get the most popular ones. This score is calculated based on:
    -   **`viewCount`**: The number of views a thread has.
    -   **`postCount`**: The number of replies.
    -   **`firstPostLikeCount`**: The number of likes on the original post.
    -   **Recency**: More recent activity gives a higher score.

## 3. Data Models (Database Schema)

The forum's data is stored in a PostgreSQL database, managed with the Drizzle ORM.

### `threads` Table (`db/schema/forum/threads.ts`)

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary key. |
| `title` | `varchar` | The title of the thread. |
| `slug` | `varchar` | A URL-friendly version of the title. |
| `structureId` | `uuid` | Foreign key to the `forum_structure` table. |
| `userId` | `uuid` | Foreign key to the `users` table (the author). |
| `hotScore` | `real` | **The calculated score used for trending.** |
| `viewCount` | `integer` | Total views. |
| `postCount` | `integer` | Total number of posts (replies). |
| `firstPostLikeCount` | `integer` | Likes on the first post. |
| `isFeatured` | `boolean` | Manually marked as featured by an admin/moderator. |

### `forum_structure` Table (`db/schema/forum/structure.ts`)

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary key. |
| `name` | `text` | The name of the forum or zone. |
| `slug` | `text` | A URL-friendly version of the name. |
| `parentId` | `uuid` | A self-referencing key to create a hierarchy (e.g., a forum inside a zone). |
| `type` | `text` | The type of node, either `'zone'` or `'forum'`. |

## 4. Data Transformers

-   **`ThreadTransformer` (`server/src/domains/forum/transformers/thread.transformer.ts`)**: Shapes thread data for the client, with different methods (`toPublic`, `toAuthenticated`, `toSlim`) for different contexts.

## How to Utilize This Information

Your agent can use this guide to:

1.  **Fetch Trending Threads**: Make a `GET` request to `/api/forum/threads?sortBy=trending`.
2.  **Display Threads**: Use the `GET /api/forum/threads/:id` or `GET /api/forum/threads/slug/:slug` endpoints.
3.  **Understand Forum Structure**: Fetch the forum hierarchy from `/api/forum/structure`.
