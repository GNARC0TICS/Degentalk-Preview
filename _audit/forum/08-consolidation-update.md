## Consolidation Update – 2025-06-15

Duplicate components removed:
1. **ThreadCard** – canonical in `features/forum/components/ThreadCard.tsx`.
2. **CreateThreadButton** – only `/features/` version kept.
3. **Post renderer** – sanitised `PostCard` in `/features/`; unsanitised duplicates removed.

Audit items in Batches 1-3 referencing these duplicates are now closed. 