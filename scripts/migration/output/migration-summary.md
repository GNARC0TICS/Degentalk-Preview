# Numeric ID Migration Report

Generated: 2025-07-02T06:05:09.710Z

## Summary
- **Total Files**: 1934
- **Total Issues**: 530
- **Critical**: 484
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
- Issues: 53
- Status: ⚠️ Needs migration

Top issues:
- `client/src/components/social/WhaleWatchDashboard.tsx:43` - id: number → check entity context for correct branded type
- `client/src/components/social/FriendsManager.tsx:55` - id: number → check entity context for correct branded type
- `client/src/components/social/FriendsManager.tsx:66` - id: number → check entity context for correct branded type
- `client/src/components/ui/smart-thread-filters.tsx:67` - id: number → check entity context for correct branded type
- `client/src/components/ui/smart-thread-filters.tsx:68` - id: number → check entity context for correct branded type

### client-pages (Priority 5)
- Files: 113
- Issues: 73
- Status: ⚠️ Needs migration

Top issues:
- `client/src/pages/leaderboard.tsx:23` - id: number → check entity context for correct branded type
- `client/src/pages/forum-rules.tsx:27` - id: number → check entity context for correct branded type
- `client/src/pages/forum-rules.tsx:48` - id: number → check entity context for correct branded type
- `client/src/pages/forum-rules.tsx:49` - userId: number → UserId
- `client/src/pages/degen-index.tsx:15` - id: number → check entity context for correct branded type

### client-other (Priority 6)
- Files: 772
- Issues: 184
- Status: ⚠️ Needs migration

Top issues:
- `client/src/pages/leaderboard.tsx:23` - id: number → check entity context for correct branded type
- `client/src/pages/forum-rules.tsx:27` - id: number → check entity context for correct branded type
- `client/src/pages/forum-rules.tsx:48` - id: number → check entity context for correct branded type
- `client/src/pages/forum-rules.tsx:49` - userId: number → UserId
- `client/src/pages/degen-index.tsx:15` - id: number → check entity context for correct branded type

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
- Issues: 220
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
