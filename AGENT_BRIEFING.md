# 🚀 DEGENTALK UNFUCKING AGENTS - MISSION BRIEFING

## 📊 BASELINE ESTABLISHED

### Current Error Count: **1000+ TypeScript Errors**
- **Build Status**: ❌ FAILING
- **Error Types**: Import/Export, Schema, Logger, Type mismatches
- **Complexity**: Massive - spanning all domains

### Repository Structure Confirmed
```
/home/developer/Degentalk-BETA/
├── client/          # React frontend (port 5173)
├── server/          # Express backend (port 5001) 
├── db/              # Database schemas & migrations
├── shared/          # Shared types & utilities
└── scripts/         # Tooling & maintenance
```

## 🎯 CORRECTED COMMANDS & PROCEDURES

### ✅ Working Build Commands
```bash
# ✅ CORRECT - Build from root (works)
cd /home/developer/Degentalk-BETA && pnpm build

# ✅ CORRECT - Build server directly
cd /home/developer/Degentalk-BETA/server && pnpm build

# ✅ CORRECT - Check errors with proper path
cd /home/developer/Degentalk-BETA && npx tsc --build server/tsconfig.build.json 2>&1 | head -20
```

### ❌ Commands That Failed (DON'T USE)
```bash
# ❌ WRONG - TypeScript gets confused about paths
npx tsc -p server/tsconfig.build.json

# ❌ WRONG - Missing workspace context
cd server && pnpm build
```

### 📏 Error Counting & Progress Tracking
```bash
# ✅ BASELINE ERROR COUNT (use this exact command)
cd /home/developer/Degentalk-BETA/server && pnpm build 2>&1 | grep -c "error TS"

# Result: 1000+ errors confirmed
```

## 🎯 TOP ERROR PATTERNS IDENTIFIED

### 1. Missing Schema Exports (HIGH PRIORITY)
```typescript
// ❌ FAILING
src/utils/dev-auth-startup.ts(5,10): error TS2305: Module '"@schema"' has no exported member 'users'.

// ✅ FIX - Add to db/schema/index.ts
export * from './user/users';
export * from './system/economyConfigOverrides';
```

### 2. Missing DB Exports (HIGH PRIORITY)
```typescript
// ❌ FAILING  
src/utils/dgt-treasury-init.ts(1,10): error TS2305: Module '"@db"' has no exported member 'db'.

// ✅ FIX - Add to db/index.ts
export { db } from './db-connection'; // or wherever db is defined
```

### 3. Logger Import Chaos (HIGH PRIORITY)
```typescript
// ❌ FAILING
canonical-zones-schema-update.ts(3,24): error TS2307: Cannot find module '../../server/src/core/logger'

// ✅ FIX - Convert to alias
import { logger } from '@core/logger';
```

### 4. Schema Type Mismatches (MEDIUM PRIORITY)  
```typescript
// ❌ FAILING
announcements.ts(52,11): error TS2322: Type 'boolean' is not assignable to type 'never'.

// ✅ FIX - Fix schema definition
```

### 5. Duplicate Object Properties (MEDIUM PRIORITY)
```typescript
// ❌ FAILING
schema.snapshot.ts(2300,2): error TS1117: An object literal cannot have multiple properties with the same name.

// ✅ FIX - Remove duplicate keys
```

## 🚨 AGENT-SPECIFIC INSTRUCTIONS

### Agent 5 (Config Surgeon) - DEPLOY FIRST
**CRITICAL**: Build works but has 1000+ errors to process
- Fix `db/index.ts` - add missing `db` export
- Fix `db/schema/index.ts` - add missing schema exports
- Focus on module resolution before touching tsconfig

### Agent 2 (Import Assassin) - DEPLOY PARALLEL  
**TARGET**: ~200 import/export errors identified
- Convert `../../server/src/core/logger` → `@core/logger`
- Fix schema import paths: `@schema` missing exports
- Kill all `@server/*` imports (confirmed present)

### Agent 1 (Schema Unfucker) - DEPLOY WAVE 2
**TARGET**: ~300 schema-related errors
- Fix boolean type assignments in announcements
- Remove duplicate properties in schema.snapshot  
- Fix relations missing properties
- Clean up schema circular references

### Agent 3 (Type Guard) - DEPLOY WAVE 2
**TARGET**: ~400 type mismatch errors
- Fix logger argument types (object → string)
- Fix user ID type consistency
- Add missing User interface properties
- Fix API response type alignments

### Agent 4 (API Contract) - DEPLOY WAVE 3
**TARGET**: ~100 API contract errors
- Align client-server response types
- Fix authentication flow types
- Ensure consistent data transfer objects

## 📋 SHARED PROGRESS TRACKING

### Error Counting Protocol
```bash
# Standard progress check (all agents use this)
echo "$(date '+%H:%M'): Agent [X] - [Description]" >> unfuck-progress.md
cd /home/developer/Degentalk-BETA/server && pnpm build 2>&1 | grep -c "error TS" >> unfuck-progress.md
echo "---" >> unfuck-progress.md
```

### File Ownership Rules
1. **First Touch Owns**: First agent to edit a file owns it
2. **Mark Ownership**: `echo "Agent X: OWNS path/to/file" >> agent-ownership.md`
3. **Conflict Resolution**: Coordinate in shared docs before editing owned files

### Success Metrics (Revised)
- **Phase 1 Target**: < 500 errors (50% reduction)
- **Phase 2 Target**: < 100 errors (90% reduction)  
- **Launch Ready**: `pnpm build` exits 0

## 🔥 MISSION-CRITICAL REMINDERS

### ✅ What Agents MUST Do
- Use EXACT commands provided above
- Work from `/home/developer/Degentalk-BETA` directory
- Track progress every 30 minutes
- Fix root causes, not symptoms
- Test changes immediately

### ❌ What Agents MUST NOT Do  
- Use `@ts-ignore` or `@ts-nocheck`
- Use `as any` casts
- Work from wrong directory
- Assume commands work without testing
- Batch commit 100+ files without testing

## 🎯 DEPLOYMENT READINESS

**Mission-Control has established**:
- ✅ Baseline error count (1000+)
- ✅ Working build commands
- ✅ Error pattern analysis
- ✅ Agent target assignments
- ✅ Progress tracking protocols

**Agents are cleared for deployment with accurate intelligence.**

**Time to unfuck this codebase. EXECUTE! 🚀**