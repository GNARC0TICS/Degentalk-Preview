# Mentions Index Table (`mentions_index`)

_Last updated: 2025-06-14_

## Purpose
Pre-computed lookup table that powers the "Mentions of Me" inbox and future notification logic. By storing one row per mention **at write-time** we avoid expensive full-text scans during reads.

## Schema Overview
| Column | Type | Description |
|--------|------|-------------|
| `id` | `serial` | Surrogate primary key |
| `source_type` | `mention_source_type` enum | Where the mention occurred: `post`, `thread`, `chat` |
| `source_id` | `integer` | ID of the post / thread / chat message |
| `mentioning_user_id` | `integer` | User who performed the mention (FK → `users.id`) |
| `mentioned_user_id` | `integer` | User being mentioned (FK → `users.id`) |
| `created_at` | `timestamp` | Insert time; used for pagination |

### Indexes
1. `idx_mentions_mentioned_user` – single-column b-tree on `mentioned_user_id` for quick inbox queries.
2. `idx_mentions_unique` – UNIQUE composite on (`source_type`, `source_id`, `mentioned_user_id`) preventing duplicates if the same user is mentioned multiple times in the same source.

### Enum Definition
```sql
CREATE TYPE public.mention_source_type AS ENUM ('post', 'thread', 'chat');
```

## Write Flow Example
```ts
await recordMentions({
  sourceType: 'post',
  sourceId: newPostId,
  mentioningUserId: authorId,
  mentionedUserIds: extractedIds
});
```
The helper performs bulk `INSERT … ON CONFLICT DO NOTHING`, making it idempotent.

## Read Pattern (API)
```sql
SELECT m.*
FROM mentions_index m
WHERE m.mentioned_user_id = $currentUser
ORDER BY m.created_at DESC
LIMIT 20 OFFSET 0;
```
Use cursor-based pagination (`created_at`, `id`) for large offsets.

## Future Extensions
* Add `notification_id` column once mention notifications are linked directly.
* Partition by `mentioned_user_id` if per-user volume grows into millions.
* Extend enum plus logic for shoutbox or other content types. 