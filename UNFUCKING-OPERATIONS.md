# 🔥 DEGENTALK UNFUCKING OPERATIONS MANUAL 🔥
## Multi-Agent TypeScript Debt Liquidation Strategy

---

## 📍 CRITICAL PATH RULES FOR ALL AGENTS
- Working directory: `/home/developer/Degentalk-BETA`
- ALWAYS use absolute paths or `cd /home/developer/Degentalk-BETA` before commands
- See `.claude/path-instructions.md` for detailed path guidance

---

## 🚨 CODEBASE LOCKDOWN STATUS: ACTIVE

### Current State: **DISASTER ZONE** 
- **1000+** TypeScript compilation errors
- **Zero** deployable builds  
- **Broken** client-server contracts
- **Months** of accumulated technical debt
- **BLOCKED** on Lucia auth implementation

### Mission Objective: **MAKE IT SHIP**
Transform: `Broken Mess → Working Build → Lucia Implementation → LAUNCH`

---

## 🛡️ THE UNFUCKING RULES

### ✅ What We DO:
- **Fix actual type errors properly**
- **Add missing properties to interfaces**  
- **Correct imports to use right paths**
- **Make types match between client/server**
- **Solve root causes, not symptoms**

### ❌ What We DON'T DO:
- **NO** `@ts-ignore` - We fix, not hide
- **NO** `@ts-nocheck` - Every line gets fixed
- **NO** `as any` casts - Types must be correct
- **NO** sweeping problems under the rug
- **NO** temporary bandaids

### The Proper Fix Approach:
```typescript
// ❌ WRONG - Don't hide the problem
// @ts-ignore
user.displayName 

// ✅ RIGHT - Fix the actual type
// In shared/types/user.types.ts
export interface User {
  // ... existing properties
  displayName?: string;  // Add the missing property
}
```

**We're doing this RIGHT - fixing actual issues so they never come back!**

---

## 🎯 THE SWARM STRATEGY

### Phase 1: War Room Setup (5 minutes)
```bash
# Create the unfucking branch
git checkout -b unfuck/everything

# Document baseline
echo "=== BASELINE ERROR COUNT ===" > unfuck-progress.md
tsc -p tsconfig.build.json 2>&1 | grep -c "error TS" >> unfuck-progress.md
date >> unfuck-progress.md
```

### Phase 2: Deploy Agent Swarm (Parallel Execution)

---

## 📁 CURRENT TYPE ORGANIZATION

```
shared/types/
├── ids.ts                    # All branded IDs (UserId, ThreadId, etc.)
├── user.types.ts            # User entities
├── thread.types.ts          # Thread entities  
├── post.types.ts            # Post entities
├── forum-core.types.ts      # Forum domain types
├── api.types.ts             # API contracts
├── economy*.ts              # Economy-related types (multiple files)
├── cosmetics.types.ts       # Shop/cosmetic types
├── wallet.types.ts          # Wallet/payment types
├── entities/                # Sub-folder for specific entities
│   ├── title.types.ts
│   └── reputation.types.ts
└── *.schema.ts             # Zod schemas for validation
```

---

## 📋 IMPORT RULES (STRICTLY ENFORCED)

```typescript
// ✅ CORRECT - Import from specific files
import { User, UserProfile } from '@shared/types/user.types';
import { UserId, ThreadId, toUserId } from '@shared/types/ids';
import { Thread, ThreadStatus } from '@shared/types/thread.types';
import { ApiResponse, ApiError } from '@shared/types/api.types';

// ✅ SERVER IMPORTS - Use explicit paths
import { logger } from '@core/logger';
import { db } from '@db';
import { users } from '@schema';
import { userService } from '@domains/users/user.service';

// ❌ BANNED - Kill on sight
import { User } from '@/types/user';         // Wrong path
import { db } from '@core/db';               // Deprecated
import { User } from '@server/types';        // Wrong namespace
import anything from '@server/*';            // All @server/* banned
import { logger } from '../src/core/logger'; // Relative paths
```

---

## 🎯 TYPE LOCATION GUIDE

| Type Category | File Location | Examples |
|--------------|--------------|----------|
| **IDs** | `ids.ts` | `UserId`, `ThreadId`, `toUserId()` |
| **User** | `user.types.ts` | `User`, `UserProfile`, `UserStats` |
| **Forum** | `forum-core.types.ts` | `Forum`, `Category`, `Zone` |
| **Thread** | `thread.types.ts` | `Thread`, `ThreadFilters` |
| **Post** | `post.types.ts` | `Post`, `PostContent` |
| **API** | `api.types.ts` | `ApiResponse`, `PaginatedResponse` |
| **Economy** | `economy*.ts` | `Transaction`, `Balance`, `Wallet` |
| **Shop** | `cosmetics.types.ts` | `AvatarFrame`, `Badge`, `Sticker` |
| **Validation** | `*.schema.ts` | Zod schemas for runtime validation |

---

## 🚨 CRITICAL AGENT INSTRUCTIONS

### Before Creating ANY Type:

1. **Check the specific file first**
   ```bash
   # For User types
   grep -n "interface.*User" shared/types/user.types.ts
   
   # For ID types  
   grep -n "type.*Id" shared/types/ids.ts
   
   # For API types
   grep -n "interface.*Response" shared/types/api.types.ts
   ```

2. **Check related files**
   ```bash
   # User-related might be in:
   - user.types.ts
   - forum-core.types.ts (if forum user)
   - economy-core.types.ts (if wallet user)
   ```

3. **Check if it's a schema**
   ```bash
   # Zod schemas are separate
   ls shared/types/*.schema.ts
   ```

---

## 🎛️ COORDINATION PROTOCOL

### Commit Message Format:
```bash
fix(schema): resolve boolean type errors in user table
fix(imports): convert @server/* to @domains/* in auth service  
fix(types): add missing displayName to User interface
fix(api): align user response types between client/server
fix(config): set proper rootDir for monorepo build
```

### Progress Tracking:
```bash
# Every 30 minutes, each agent reports:
echo "Agent X: Fixed Y errors in Z files" >> unfuck-progress.md
tsc -p tsconfig.build.json 2>&1 | grep -c "error TS" >> unfuck-progress.md
```

### Conflict Resolution:
1. **File conflicts**: First agent to touch owns the file
2. **Blocked**: Mark with TODO comment and move on
3. **Cross-dependencies**: Communicate in shared doc

---

## 📊 SUCCESS METRICS

### Phase 1 Targets (2-4 hours):
- [ ] **Schema errors**: 0 (Agent 1)
- [ ] **Import errors**: < 10 (Agent 2) 
- [ ] **Type errors**: < 50 (Agent 3)
- [ ] **API errors**: < 20 (Agent 4)
- [ ] **Build completes**: Yes (Agent 5)

### Phase 2 Targets (Next session):
- [ ] **Total errors**: < 100
- [ ] **Auth flow**: 0 errors
- [ ] **Core pages**: Compile clean
- [ ] **Ready for Lucia**: YES

### Launch Readiness:
- [ ] `pnpm build` exits 0 
- [ ] `pnpm dev` starts without errors
- [ ] Auth pages load without crashes
- [ ] Database queries execute

---

## 🚀 POST-UNFUCKING PLAN

### Immediate Next Steps:
1. **Lucia Implementation** (fresh session)
2. **Deploy staging** (test everything)
3. **Launch preparation** 

### Technical Debt Prevention:
```bash
# Add to CI/CD
npm run typecheck  # Must pass
npm run lint       # Must pass  
npm run build      # Must pass
```

---

## 🔥 BATTLE CRY

**"We're not fixing everything. We're fixing enough to ship Lucia and launch this motherfucker!"**

### Ready for War?
Each subagent gets their specific domain and goes to work. Parallel execution, clear domains, measurable success.

**Time to unfuck this codebase. LET'S GO! 🚀**

---

*This document is the battle plan. Reference it constantly. Every agent must read and follow these rules.*