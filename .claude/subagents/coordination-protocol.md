# 🎛️ AGENT COORDINATION PROTOCOL

## Multi-Agent Deployment Strategy

### Phase 1: War Room Setup (5 minutes)
```bash
# Create the unfucking branch
git checkout -b unfuck/everything

# Initialize progress tracking
cat > unfuck-progress.md << 'EOF'
# DEGENTALK UNFUCKING PROGRESS TRACKER

## Baseline (Start)
Date: $(date)
Initial Error Count: TBD
Status: DISASTER ZONE 🔥

## Agent Status
- Agent 1 (Schema): NOT STARTED
- Agent 2 (Imports): NOT STARTED  
- Agent 3 (Types): NOT STARTED
- Agent 4 (API): NOT STARTED
- Agent 5 (Config): NOT STARTED

## Progress Log
EOF

# Get baseline error count
echo "Getting baseline error count..."
npx tsc -p server/tsconfig.build.json 2>&1 | grep -c "error TS" >> unfuck-progress.md || echo "BUILD_BROKEN" >> unfuck-progress.md
```

### Phase 2: Agent Deployment Order

#### Parallel Wave 1 (Start Immediately)
- **Agent 5 (Config Surgeon)** - 30 minutes - CRITICAL PATH
- **Agent 2 (Import Assassin)** - 45 minutes - ENABLES OTHERS

#### Parallel Wave 2 (After Wave 1 shows progress)  
- **Agent 1 (Schema Unfucker)** - 60 minutes - FOUNDATION
- **Agent 3 (Type Guard)** - 90 minutes - TYPE SAFETY

#### Wave 3 (After core fixes)
- **Agent 4 (API Contract)** - 60 minutes - CLIENT-SERVER ALIGNMENT

## Agent Communication Rules

### File Ownership Protocol
```bash
# First agent to touch a file owns it
# Mark ownership in shared doc:
echo "Agent X: OWNS server/src/domains/auth/" >> agent-ownership.md

# Other agents MUST NOT edit owned files
# If need to edit owned file: coordinate in shared doc
```

### Progress Reporting (Every 30 minutes)
```bash
# Each agent reports progress
echo "$(date): Agent X - Fixed Y errors in Z files" >> unfuck-progress.md

# Update error count
npx tsc -p server/tsconfig.build.json 2>&1 | grep -c "error TS" >> unfuck-progress.md

# Agent status update
sed -i "s/Agent X: NOT STARTED/Agent X: IN_PROGRESS/" unfuck-progress.md
```

### Conflict Resolution

#### File Conflicts
1. **First Touch Rule**: First agent to edit owns the file
2. **Coordinate**: Other agents request access in shared doc
3. **Batch Changes**: Group related changes together

#### Blocked Scenarios
```bash
# If blocked by another agent's work:
echo "BLOCKED: Agent X waiting for Agent Y to fix Z" >> unfuck-progress.md

# Add TODO and move to next file
echo "// TODO: Fix after Agent Y completes schema fixes" >> blocked-file.ts

# Continue with other files in domain
```

#### Cross-Dependencies
```bash
# Schema depends on imports being fixed
# Types depend on schema being stable
# API depends on types being correct

# Communication pattern:
echo "Agent 1: Schema ready for type fixes" >> coordination.md
echo "Agent 3: Need missing User properties from Agent 1" >> coordination.md
```

## Commit Strategy

### Message Format (STRICTLY ENFORCED)
```bash
# Pattern: fix(domain): description
fix(schema): resolve boolean type errors in user table
fix(imports): convert @server/* to @domains/* in auth service  
fix(types): add missing displayName to User interface
fix(api): align user response types between client/server
fix(config): set proper rootDir for monorepo build

# NOT allowed:
"fixes"
"update types"
"various fixes"
```

### Commit Frequency
- **Every 20-50 fixes** depending on agent
- **Before taking breaks**
- **When switching file groups**
- **When reaching milestones**

### Commit Verification
```bash
# Before committing, ensure:
npx tsc --noEmit [changed-files]  # No new errors
git diff --name-only | wc -l      # Reasonable file count
git status                        # Clean working state
```

## Progress Tracking System

### Error Count Tracking
```bash
# Function to track progress
track_progress() {
  local agent_name="$1"
  local description="$2"
  
  echo "$(date '+%H:%M'): $agent_name - $description" >> unfuck-progress.md
  
  # Get current error count
  local error_count=$(npx tsc -p server/tsconfig.build.json 2>&1 | grep -c "error TS" || echo "BROKEN")
  echo "Errors: $error_count" >> unfuck-progress.md
  echo "---" >> unfuck-progress.md
}

# Usage:
track_progress "Agent 1" "Fixed 25 boolean type errors in admin schema"
```

### Milestone Tracking
```bash
# Major milestones to celebrate
milestones = (
  "Config: Build completes without rootDir errors"
  "Imports: Zero 'Cannot find module' errors" 
  "Schema: All db/schema files compile clean"
  "Types: User type has all required properties"
  "API: Auth endpoints have consistent contracts"
  "BUILD: pnpm build exits with code 0"
)

# Mark milestone reached:
echo "🎉 MILESTONE: Build completes without rootDir errors" >> unfuck-progress.md
```

## Success Metrics Dashboard

### Real-Time Status Check
```bash
# Quick status check command
unfuck_status() {
  echo "=== UNFUCKING STATUS ==="
  echo "Branch: $(git branch --show-current)"
  echo "Commits: $(git rev-list --count HEAD^..HEAD)"
  
  # Error counts
  echo "Total TS Errors: $(npx tsc -p server/tsconfig.build.json 2>&1 | grep -c 'error TS' || echo 'BROKEN')"
  echo "Import Errors: $(npx tsc -p server/tsconfig.build.json 2>&1 | grep -c 'Cannot find module')"
  echo "Type Errors: $(npx tsc -p server/tsconfig.build.json 2>&1 | grep -c 'Property.*does not exist')"
  
  # Build status
  if npx tsc -p server/tsconfig.build.json >/dev/null 2>&1; then
    echo "Build Status: ✅ PASSING"
  else
    echo "Build Status: ❌ FAILING"
  fi
  
  echo "======================"
}
```

### Target Metrics by Phase

#### Phase 1 Targets (First 2 hours):
- [ ] **Config**: Build completes (exit code 0)
- [ ] **Imports**: < 50 "Cannot find module" errors  
- [ ] **Schema**: < 100 schema-related errors
- [ ] **Total**: 80%+ error reduction

#### Phase 2 Targets (Next 2 hours):
- [ ] **Types**: User/ID types consistent
- [ ] **API**: Auth flow type-safe
- [ ] **Build**: Produces valid output
- [ ] **Total**: < 100 errors remaining

#### Launch Ready:
- [ ] **Build**: `pnpm build` exits 0
- [ ] **Dev**: `pnpm dev` starts clean  
- [ ] **Core**: Auth pages load
- [ ] **Database**: Queries execute

## Emergency Protocols

### When Everything Breaks
```bash
# Emergency rollback
git stash
git checkout main
git checkout -b unfuck/emergency-$(date +%s)

# Start with config fixes only
# Focus on minimal viable build
```

### When Agents Conflict
```bash
# Merge conflict resolution
git checkout --theirs [file]  # Take their version
git checkout --ours [file]    # Take our version

# Coordinate fix:
echo "CONFLICT: Agent X and Y both modified [file]" >> conflicts.md
echo "Resolution: Agent Y takes ownership, Agent X reverts" >> conflicts.md
```

### When Blocked
```bash
# Agent blocked protocol
echo "BLOCKED: Agent X - describe blocking issue" >> blocked-agents.md
echo "Workaround: Agent X switches to [alternative files]" >> blocked-agents.md

# Continue on non-blocked files
# Report estimated delay
```

## Quality Gates

### Before Merging to Main
- [ ] Build completes successfully
- [ ] Error count < 100 (or agreed target)
- [ ] Auth flow works end-to-end
- [ ] No @ts-ignore or @ts-nocheck added
- [ ] All agents report completion

### Before Lucia Implementation  
- [ ] Core type system stable
- [ ] Database schemas compile
- [ ] API contracts aligned
- [ ] No build-breaking errors

## Communication Channels

### Shared Documents
- `unfuck-progress.md` - Progress tracking
- `agent-ownership.md` - File ownership
- `coordination.md` - Inter-agent communication
- `conflicts.md` - Conflict resolution log

### Status Updates
Each agent updates status every 30 minutes with:
- Files worked on
- Errors fixed
- Blockers encountered  
- Next focus area

**Remember: We're not fixing everything - we're fixing enough to ship!** 🚀