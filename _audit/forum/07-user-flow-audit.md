## User Flow Audit & Deeper File Analysis (2025-06-15)

This file consolidates audits E → O covering zone, forum, thread pages and interaction components.

### E. Zone Page (`pages/zones/[slug].tsx`)
• Architectural confusion: tries to list threads via non-existent `/api/zones/:slug/threads`.
• Recommendation: remove thread list, focus on child forums.

### F. ForumHeader Component
• Prop refactor to accept `MergedZone | MergedForum`.
• Replace dynamic Tailwind classes with safe map / CSS vars.

### G. Forum Page (`pages/forums/[slug].tsx`)
• Still using direct API; switch to `useForumStructure()`.
• Fix breadcrumbs, posting permissions.

### H. ThreadCard Consolidation Plan
• Keep single canonical component; delete duplicate.

### I. Thread Page (`pages/threads/[thread_slug].tsx`)
• Update to canonical ThreadCard & PostCard.
• Implement post edit/delete, signature sanitisation.

### J. CreateThreadForm
• Critical: determine posting rules via `ForumStructureContext` not static config.

### K. CreatePostForm
• Redundant versus `ReplyForm` and missing rule checks.

### L. ReplyForm
• Parent responsible for permissions and submission logic.

### M. PostCard/PostReply Duplication
• Consolidate to sanitised PostCard; add `onReport`, `onTip` props.

### N. LikeButton
• Presentational; consider size prop.

### O. ReactionTray
• Memoize; confirm single-reaction design. 