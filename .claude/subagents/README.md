# 🤖 DEGENTALK UNFUCKING SUBAGENTS

This directory contains specialized subagents for the TypeScript debt liquidation operation.

## 🚨 USAGE INSTRUCTIONS

### To Deploy a Subagent:
```bash
# Use Claude Code with the /subagent command
/subagent schema-unfucker.md    # Deploy Agent 1: Schema fixes
/subagent import-assassin.md    # Deploy Agent 2: Import path fixes  
/subagent type-guard.md         # Deploy Agent 3: Type safety fixes
/subagent api-contract-enforcer.md  # Deploy Agent 4: API contract alignment
/subagent config-surgeon.md     # Deploy Agent 5: Build configuration
```

### Deployment Order:
1. **config-surgeon** + **import-assassin** (parallel - 30-45 min)
2. **schema-unfucker** + **type-guard** (parallel - 60-90 min)  
3. **api-contract-enforcer** (after core fixes - 60 min)

## 📁 Available Subagents

### 🛠️ Agent 1: Schema Unfucker
- **File**: `schema-unfucker.md`
- **Mission**: Fix all Drizzle schema type errors
- **Domain**: `db/schema/**/*.ts`
- **Duration**: 60-90 minutes
- **Priority**: HIGHEST (foundation)

### 🎯 Agent 2: Import Assassin  
- **File**: `import-assassin.md`
- **Mission**: Eliminate import path errors
- **Domain**: All import statements
- **Duration**: 45-60 minutes
- **Priority**: HIGH (enables others)

### 🛡️ Agent 3: Type Guard
- **File**: `type-guard.md` 
- **Mission**: Fix type mismatches and missing properties
- **Domain**: Type definitions and usages
- **Duration**: 90-120 minutes
- **Priority**: HIGH (type safety)

### ⚖️ Agent 4: API Contract Enforcer
- **File**: `api-contract-enforcer.md`
- **Mission**: Align client-server API contracts
- **Domain**: API routes and client queries
- **Duration**: 60-90 minutes
- **Priority**: HIGH (frontend functionality)

### 🔧 Agent 5: Config Surgeon
- **File**: `config-surgeon.md`
- **Mission**: Fix build configuration
- **Domain**: tsconfig files and build setup
- **Duration**: 30-45 minutes  
- **Priority**: CRITICAL (blocks everything)

### 🎛️ Coordination Protocol
- **File**: `coordination-protocol.md`
- **Mission**: Multi-agent coordination rules
- **Contains**: Progress tracking, conflict resolution, communication

## 🔥 THE UNFUCKING RULES

### ✅ What Subagents DO:
- Fix actual type errors properly
- Add missing properties to interfaces  
- Correct imports to use right paths
- Make types match between client/server
- Solve root causes, not symptoms

### ❌ What Subagents DON'T DO:
- **NO** `@ts-ignore` - We fix, not hide
- **NO** `@ts-nocheck` - Every line gets fixed
- **NO** `as any` casts - Types must be correct
- **NO** sweeping problems under the rug
- **NO** temporary bandaids

## 📊 Success Metrics

### Phase 1 Targets (2-4 hours):
- [ ] **Schema errors**: 0 (Agent 1)
- [ ] **Import errors**: < 10 (Agent 2)
- [ ] **Type errors**: < 50 (Agent 3)  
- [ ] **API errors**: < 20 (Agent 4)
- [ ] **Build completes**: Yes (Agent 5)

### Launch Ready:
- [ ] `pnpm build` exits 0
- [ ] `pnpm dev` starts without errors
- [ ] Auth pages load without crashes
- [ ] Database queries execute

## 🚀 Quick Start

1. **Read the main operation manual**: `../UNFUCKING-OPERATIONS.md`
2. **Choose your agent** based on priority and dependencies
3. **Deploy with**: `/subagent [agent-file].md`
4. **Follow the agent's specific instructions**
5. **Report progress** in shared tracking docs

## 🎯 Remember the Mission

**"We're not fixing everything. We're fixing enough to ship Lucia and launch this motherfucker!"**

Each subagent has a specific domain and clear success criteria. Work in parallel, communicate conflicts, and focus on getting to a working build.

**Time to unfuck this codebase. LET'S GO! 🚀**