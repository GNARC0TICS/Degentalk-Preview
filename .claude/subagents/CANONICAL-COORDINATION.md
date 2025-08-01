# 🎛️ CANONICAL COORDINATION PROTOCOL
## Single Source of Truth for Agent Operations

> **⚠️ IMPORTANT**: This is the ONLY coordination document. All other files reference this.

---

## 🚨 PRE-DEPLOYMENT CHECKLIST

### Phase 0: Readiness Verification
Run these steps IN ORDER before deploying any agents:

```bash
# 1. Create unfuck branch
git checkout -b unfuck/everything

# 2. Run lint autofix wave (clears low-hanging fruit)
bash scripts/unfuck-lint-autofix.sh

# 3. Capture enhanced baseline
bash scripts/unfuck-baseline.sh

# 4. Verify readiness
bash scripts/unfuck-status.sh
```

**Only proceed if baseline capture succeeds and no schema drift detected.**

---

## 📊 ENHANCED BASELINE TRACKING

### Multi-Package Error Isolation
Track errors separately to prevent masking:

- **Server TS**: `cd server && npx tsc -p tsconfig.build.json`
- **Client TS**: `cd client && npx tsc --noEmit`  
- **Shared TS**: `cd shared && npx tsc --noEmit`
- **ESLint**: `pnpm lint --format json | jq '.[] | .errorCount'`
- **Schema Drift**: `cd db && npx drizzle-kit generate --name drift-check`

### Time-Boxed Wave Targets
- **Wave 1** (Config+Import): TS errors ≤ 800
- **Wave 2** (Schema+Types): TS errors ≤ 150  
- **Wave 3** (API): TS errors ≤ 50
- **Final**: All builds exit 0

---

## 🛡️ CONCURRENCY PROTECTION

### Build Lock System
**CRITICAL**: Only one build at a time to prevent resource conflicts.

```bash
# All TypeScript operations use this lock
flock -n -w 60 /tmp/degentalk-tsc.lock npx tsc [args]

# Agents check lock status
if [[ -f /tmp/degentalk-tsc.lock ]]; then
  echo "Build locked - waiting..."
fi
```

### Mission Control Build Coordination
- **Agents**: Use `grep_search` for progress tracking
- **Mission Control**: Coordinates `tsc` builds every 30min
- **Build requests**: Agents request through progress file

---

## 🎯 AGENT DEPLOYMENT WAVES

### Wave 1: Critical Path (Parallel)
```bash
# Deploy simultaneously:
/subagent .claude/subagents/config-surgeon.md      # 30 min - UNBLOCKS
/subagent .claude/subagents/import-assassin.md     # 45 min - ENABLES
```

### Wave 2: Foundation (After Wave 1 shows progress)
```bash
# Deploy simultaneously after Wave 1 reduces errors by 50%:
/subagent .claude/subagents/schema-unfucker.md     # 60 min - DATABASE
/subagent .claude/subagents/type-guard.md          # 90 min - TYPES
```

### Wave 3: Integration (After core fixes)
```bash
# Deploy after core systems stable:
/subagent .claude/subagents/api-contract-enforcer.md  # 60 min - CLIENT-SERVER
```

---

## 📋 FILE OWNERSHIP PROTOCOL

### Ownership Tracking
```bash
# Agents declare ownership
echo "$(date '+%H:%M'): Agent-2-Import owns server/src/domains/auth/" >> agent-ownership.md

# Helper function for agents
own() { echo "$(date '+%H:%M'): $1 owns $2" >> agent-ownership.md; }
```

### Conflict Resolution Rules
1. **First Touch**: First agent to edit owns the file
2. **Coordination**: Others request access via progress file
3. **Emergency**: Mission Control can reassign ownership

---

## 📊 PROGRESS REPORTING (Every 30 Minutes)

### Agent Report Template
```markdown
## Agent X Progress - $(date +%H:%M)

### Domain: [specific domain]
### Files Modified: X files  
### Errors Fixed:
- Pattern 1: Before X → After Y
- Pattern 2: Before X → After Y

### Verification Commands:
- grep_search "pattern" "domain" --include="*.ts" | wc -l
- Result: [count]

### Status: [IN_PROGRESS | READY_FOR_BUILD_CHECK | COMPLETE]
### Next: [next focus area]
```

### Progress Verification Commands

**Agent 1 (Schema)**:
```bash
grep_search "error TS2322.*boolean" "db/schema" --include="*.ts" | wc -l
grep_search "does not exist on type" "db/schema" --include="*.ts" | wc -l
```

**Agent 2 (Import)**:
```bash
grep_search "@server/" "server/src" --include="*.ts" | wc -l
grep_search "@core/db" "server/src" --include="*.ts" | wc -l
```

**Agent 3 (Types)**:
```bash
grep_search "Property.*does not exist" "." --include="*.ts" | grep -c "User"
grep_search "Expected.*arguments" "." --include="*.ts" | wc -l
```

**Agent 4 (API)**:
```bash
grep_search "ApiResponse" "client/src" --include="*.ts" | wc -l
grep_search "unknown.*assignable" "client/src" --include="*.ts" | wc -l
```

**Agent 5 (Config)**:
```bash
grep_search "rootDir" "server" --include="*.json"
grep_search "error TS6059" "." --include="*.ts" | wc -l
```

---

## 🚨 MCP COMMAND RESTRICTIONS

### ✅ ALLOWED MCP Commands
- `str_replace_editor` - All file edits
- `read_file` - Reading files
- `list_files` - Directory listings  
- `grep_search` - Pattern searches

### ❌ FORBIDDEN Operations
- `npx tsc` commands (Mission Control only)
- `cat` / `vim` / `nano` (not MCP)
- Direct file writes
- Parallel builds

---

## 🔧 QUALITY-OF-LIFE COMMANDS

### Status Checking
```bash
# Real-time status with emoji progress bar
bash scripts/unfuck-status.sh

# Safe build with concurrency protection
bash scripts/unfuck-build.sh

# Capture new baseline
bash scripts/unfuck-baseline.sh
```

---

## 🚀 SUCCESS CRITERIA

### Exit Criteria (All Must Pass)
- [ ] `pnpm build` exits 0
- [ ] `pnpm typecheck` exits 0  
- [ ] `pnpm test` exits 0 (fast suite)
- [ ] `pnpm lint` exits 0
- [ ] `pnpm dev` starts without crashes

### Emergency Rollback
```bash
# Quick rollback to baseline
baseline_sha=$(grep 'Baseline SHA' unfuck-progress.md | awk '{print $3}')
git reset --hard $baseline_sha
git clean -fd
```

---

## 🎯 LAUNCH SEQUENCE

### Ready to Deploy?
1. ✅ Enhanced baseline captured
2. ✅ Lint autofix completed
3. ✅ Build concurrency protection active
4. ✅ Schema drift check passed
5. ✅ File ownership system ready

### Deploy Command
```bash
# Start Wave 1 (Mission Control executes)
/subagent .claude/subagents/config-surgeon.md
# (In parallel terminal)
/subagent .claude/subagents/import-assassin.md
```

**🚀 READY FOR AGENT DEPLOYMENT!**