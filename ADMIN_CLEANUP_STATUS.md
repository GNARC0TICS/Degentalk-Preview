# Admin Cleanup Status Report

## 🎯 Goal: Avoid Tech Debt
- **Principle**: Move domain-specific features OUT of admin, keep only core admin tools
- **Method**: Use bridge files for backward compatibility, no breaking changes
- **Architecture**: Maintain strict domain boundaries, repository pattern

## ✅ Completed Moves (Phase 1 & 2)
1. **Deleted** (8 sub-domains):
   - `airdrop`, `animation-packs`, `user-groups`, `forumPrefix`
   - `moderator-notes`, `reports`, `referrals`, `dev`

2. **Renamed**:
   - `clout` → `reputation` (all references updated)

3. **Moved to Proper Domains** (6 sub-domains):
   - `analytics` → `/domains/analytics/admin/` ✅
   - `xp` → `/domains/gamification/admin/` ✅
   - `shop` → `/domains/shop/admin/` ✅
   - `economy` + `treasury` → `/domains/economy/admin/` ✅
   - `titles` → `/domains/gamification/` ✅

## 🔄 Current State
- **Started with**: 33 sub-domains, 162 files
- **Now have**: 26 sub-domains (but 6 are just bridge files)
- **Real remaining**: 20 sub-domains that need decisions

## 📋 Next Tasks (Prioritized to Avoid Debt)

### 1. **Critical Moves** (Domain features that don't belong in admin)
- [ ] `forum` → `/domains/forum/admin/`
- [ ] `announcements` → `/domains/forum/admin/` or create content domain
- [ ] `avatar-frames` → `/domains/shop/` (it's a cosmetic item)
- [ ] `emojis` → `/domains/forum/` (forum customization)
- [ ] `subscriptions` → `/domains/subscriptions/admin/`
- [ ] `email-templates` → Create `/domains/notifications/`
- [ ] `social` → `/domains/users/social/` or create social domain

### 2. **Consolidation** (Reduce complexity)
- [ ] Merge `ui-config` + `brand-config` → `settings`
- [ ] Merge `dgt-packages` → `/domains/wallet/admin/` (it's payment related)
- [ ] Ensure `reputation` moves to `/domains/gamification/`

### 3. **Core Admin** (These STAY in admin)
✅ Keep these as they're true admin functions:
- `users` - User management (bans, roles, etc)
- `roles` - Role definitions
- `permissions` - Permission management
- `settings` - System configuration
- `database` - DB management tools
- `cache` - Cache management
- `backup-restore` - System backups

## 🚨 Tech Debt Prevention Checklist

### Before Moving Each Sub-domain:
1. **Check Dependencies**
   ```bash
   grep -r "sub-domains/[name]" server/src --include="*.ts"
   ```

2. **Verify No Direct Imports**
   - Ensure other domains don't import from admin sub-domains
   - All cross-domain access must go through domain index.ts

3. **Create Bridge File**
   - Maintains `/admin/[feature]` routes
   - Simply re-exports from new location

4. **Update Domain Index**
   - Add exports to target domain's index.ts
   - Maintain public API consistency

### Architecture Rules to Follow:
1. **Repository Pattern**: DB queries only in `.repository.ts` files
2. **Domain Boundaries**: No direct service imports between domains
3. **Error Handling**: Use `@core/errors`, not domain-specific errors
4. **Event Bus**: For cross-domain communication (future)

## 🎮 Next Immediate Actions

1. **Move Forum Features**
   ```bash
   mkdir -p server/src/domains/forum/admin
   mv server/src/domains/admin/sub-domains/forum/* server/src/domains/forum/admin/
   # Create bridge file
   ```

2. **Create Notifications Domain**
   ```bash
   mkdir -p server/src/domains/notifications
   # Move email-templates there
   ```

3. **Move Cosmetics to Shop**
   - avatar-frames → shop domain
   - Keep them organized under cosmetics/

## 📊 Success Metrics
- Admin domain under 50 files (from 162)
- Clear separation: admin tools vs domain features
- No broken imports or circular dependencies
- All routes still work via bridges
- TypeScript compiles without errors

## ⚠️ Danger Zones
1. **Don't Rush**: Each move needs proper bridge files
2. **Test Imports**: Run `pnpm typecheck` after each move
3. **Keep History**: Document what moved where
4. **Client Updates**: Admin UI may need path updates later