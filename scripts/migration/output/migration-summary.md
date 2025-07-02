# Numeric ID Migration Report

Generated: 2025-07-02T08:26:14.012Z

## Summary
- **Total Files**: 1934
- **Total Issues**: 453
- **Critical**: 407
- **High**: 46  
- **Medium**: 0

## Migration Batches (Priority Order)

### client-types (Priority 1)
- Files: 20
- Issues: 0
- Status: ✅ Clean



### client-hooks (Priority 2)
- Files: 55
- Issues: 0
- Status: ✅ Clean



### client-api (Priority 3)
- Files: 6
- Issues: 0
- Status: ✅ Clean



### client-components (Priority 4)
- Files: 414
- Issues: 19
- Status: ⚠️ Needs migration

Top issues:
- `client/src/components/ui/reactions-bar.tsx:21` - postId: number → PostId
- `client/src/components/ui/bookmark-button.tsx:12` - threadId: number → ThreadId
- `client/src/components/profile/XpLogView.tsx:58` - id: number → check entity context for correct branded type
- `client/src/components/forum/ReactionBar.tsx:30` - postId: number → PostId
- `client/src/components/platform-energy/recent-posts/recent-posts-feed.tsx:64` - postId: number → PostId

### client-pages (Priority 5)
- Files: 113
- Issues: 70
- Status: ⚠️ Needs migration

Top issues:
- `client/src/pages/forum-rules.tsx:27` - id: number → check entity context for correct branded type
- `client/src/pages/forum-rules.tsx:48` - id: number → check entity context for correct branded type
- `client/src/pages/shop/avatar-frames.tsx:14` - id: number → check entity context for correct branded type
- `client/src/pages/mod/users.tsx:94` - id: number → check entity context for correct branded type
- `client/src/pages/mod/users.tsx:106` - id: number → check entity context for correct branded type

### client-other (Priority 6)
- Files: 772
- Issues: 146
- Status: ⚠️ Needs migration

Top issues:
- `client/src/pages/forum-rules.tsx:27` - id: number → check entity context for correct branded type
- `client/src/pages/forum-rules.tsx:48` - id: number → check entity context for correct branded type
- `client/src/contexts/ForumStructureContext.tsx:179` - id: number → check entity context for correct branded type
- `client/src/contexts/ForumStructureContext.tsx:209` - id: number → check entity context for correct branded type
- `client/src/contexts/ForumStructureContext.tsx:211` - id: number → check entity context for correct branded type

### server-types (Priority 7)
- Files: 0
- Issues: 0
- Status: ✅ Clean



### server-services (Priority 8)
- Files: 0
- Issues: 0
- Status: ✅ Clean



### server-routes (Priority 9)
- Files: 5
- Issues: 0
- Status: ✅ Clean



### server-repositories (Priority 10)
- Files: 0
- Issues: 0
- Status: ✅ Clean



### server-middleware (Priority 11)
- Files: 8
- Issues: 0
- Status: ✅ Clean



### server-other (Priority 12)
- Files: 384
- Issues: 218
- Status: ⚠️ Needs migration

Top issues:
- `server/src/domains/xp/xp.service.ts:431` - userId: number → UserId
- `server/src/domains/subscriptions/subscription.service.ts:29` - id: number → check entity context for correct branded type
- `server/src/domains/shoutbox/shoutbox.routes.ts:36` - userId: number → UserId
- `server/src/domains/shoutbox/shoutbox.routes.ts:203` - parseInt(req.params.id) → remove parseInt, use branded type
- `server/src/domains/shoutbox/shoutbox.routes.ts:266` - parseInt(req.params.id) → remove parseInt, use branded type

### database (Priority 13)
- Files: 157
- Issues: 0
- Status: ✅ Clean




## Next Steps
1. Start with Priority 1 batches (client-types)
2. Run targeted fix script for each batch
3. Update CI to prevent regressions
4. Validate with type checking and tests

## CI Integration
Add to your CI pipeline:
```bash
npm run migration:check-ids
```
