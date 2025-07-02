# Numeric ID Migration Report

Generated: 2025-07-02T02:41:34.411Z

## Summary
- **Total Files**: 1933
- **Total Issues**: 594
- **Critical**: 546
- **High**: 48  
- **Medium**: 0

## Migration Batches (Priority Order)

### client-types (Priority 1)
- Files: 20
- Issues: 0
- Status: ✅ Clean



### client-hooks (Priority 2)
- Files: 55
- Issues: 24
- Status: ⚠️ Needs migration

Top issues:
- `client/src/hooks/useXP.ts:37` - id: number → check entity context for correct branded type
- `client/src/hooks/useXP.ts:47` - id: number → check entity context for correct branded type
- `client/src/hooks/useXP.ts:56` - id: number → check entity context for correct branded type
- `client/src/hooks/useUserXP.ts:6` - userId: number → UserId
- `client/src/hooks/useUserCosmetics.ts:11` - id: number → check entity context for correct branded type

### client-api (Priority 3)
- Files: 6
- Issues: 0
- Status: ✅ Clean



### client-components (Priority 4)
- Files: 414
- Issues: 58
- Status: ⚠️ Needs migration

Top issues:
- `client/src/components/users/UserAvatar.tsx:10` - id: number → check entity context for correct branded type
- `client/src/components/users/ActiveMembersWidget.tsx:19` - id: number → check entity context for correct branded type
- `client/src/components/ui/smart-thread-filters.tsx:67` - id: number → check entity context for correct branded type
- `client/src/components/ui/smart-thread-filters.tsx:68` - id: number → check entity context for correct branded type
- `client/src/components/ui/reactions-bar.tsx:21` - postId: number → PostId

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
- Issues: 213
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
- Issues: 2
- Status: ⚠️ Needs migration

Top issues:
- `server/src/middleware/mission-progress.ts:55` - userId: number → UserId
- `server/src/middleware/authenticate.ts:12` - id: number → check entity context for correct branded type

### server-other (Priority 12)
- Files: 384
- Issues: 222
- Status: ⚠️ Needs migration

Top issues:
- `server/src/middleware/mission-progress.ts:55` - userId: number → UserId
- `server/src/middleware/authenticate.ts:12` - id: number → check entity context for correct branded type
- `server/src/domains/xp/xp.service.ts:431` - userId: number → UserId
- `server/src/domains/subscriptions/subscription.service.ts:29` - id: number → check entity context for correct branded type
- `server/src/domains/social/mentions.types.ts:4` - id: number → check entity context for correct branded type

### database (Priority 13)
- Files: 156
- Issues: 2
- Status: ⚠️ Needs migration

Top issues:
- `db/types/forum.types.ts:50` - id: number → check entity context for correct branded type
- `db/types/announcement.types.ts:2` - id: number → check entity context for correct branded type


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
