# HANDOFF: Zone Removal Cleanup Task

## Current State
- **Branch**: `feat/remove-zones`
- **Dev Servers**: Running on ports 5173 (client) and 5001 (server)
- **tmux session**: "degentalk" exists and is active

## ✅ Completed Actions
1. **Deleted zone file trees**:
   - `client/src/pages/zones/`
   - `client/src/components/zone/`
   - `client/src/features/_archived_missions/`

2. **Removed ZoneId types**:
   - Deleted from `/shared/types/ids.ts`
   - Removed exports from `/shared/types/index.ts`
   - Removed `toZoneId()` and `toParentZoneId()` from `/shared/utils/id.ts`

3. **Updated CSS variables**:
   - `--zone-accent` → `--forum-accent` (and related)
   - `.zone-card` → `.forum-card`
   - `.zone-glow` → `.forum-glow`
   - `.zone-badge` → `.forum-badge`

4. **Configuration cleanup**:
   - Deleted `/shared/config/zoneThemes.config.ts`
   - Updated imports in `/shared/config/index.ts`
   - Removed from vite.config.ts aliases
   - Removed from shared/package.json exports

5. **Created migration scripts** (NOT YET RUN):
   - `/scripts/db/zones-to-featured-forums-migration.ts`
   - `/scripts/refactor-zones-to-featured-forums.sh`
   - `/scripts/validate-no-zones.sh`

6. **Added stub endpoint**:
   - `/api/preferences` to fix 401 errors

## ⚠️ Breaking Changes Made
1. **TypeScript**: Removed `ZoneId` type - will cause errors
2. **API Types**: Changed `ThreadFeaturedForum.id` from `ZoneId` to `ForumId`
3. **CSS**: All zone-prefixed variables/classes renamed
4. **Config**: zoneThemes.config.ts deleted

## 🎯 Required Next Steps

### 1. Setup Environment
```bash
# Attach to tmux session
tmux attach -t degentalk
# Or create new window
tmux new-window -n cleanup
```

### 2. Run Refactoring Script
```bash
cd /home/developer/Degentalk-BETA
./scripts/refactor-zones-to-featured-forums.sh
```

### 3. Check TypeScript Errors
```bash
pnpm typecheck
# Fix any errors related to missing ZoneId imports
```

### 4. Run Database Migration
```bash
pnpm tsx scripts/db/zones-to-featured-forums-migration.ts
```

### 5. Validate Complete Removal
```bash
./scripts/validate-no-zones.sh
```

### 6. Test Everything
```bash
# In tmux window 2
pnpm test
pnpm test:e2e
```

### 7. Final Commit
```bash
git add -A
git commit -m "feat: complete zone removal, migrate to featured forums

- Convert primary zones to featured forums
- Remove zone type from codebase
- Update all references to use forum terminology
- Migrate CSS variables and classes"
```

## 📋 Key Context
- **Zones → Featured Forums**: Primary zones get `isFeatured: true` flag
- **Zone type**: Being completely removed, not renamed
- **Top-level detection**: Use `parentId === null` instead of `type === 'zone'`
- **Hot reload**: Both servers auto-reload on file changes

## 🔍 What to Watch For
1. **TypeScript errors** from missing ZoneId imports
2. **Frontend components** still using zone terminology
3. **API responses** that might break due to type changes
4. **CSS classes** in TSX files that still use zone-*
5. **Comments/docs** that still reference zones

## 📚 Reference
- See updated CLAUDE.md for SSH workflow details
- Original playbook in chat history for full context
- Database is PostgreSQL with Drizzle ORM