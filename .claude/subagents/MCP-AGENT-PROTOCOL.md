# 🤖 MCP AGENT COMMAND PROTOCOL

## 📁 MCP File System Commands for Agents

### ✅ CORRECT MCP Usage:
```bash
str_replace_editor    # For all file edits - USE THIS
read_file            # For reading files  
list_files           # For directory listings
grep_search          # For searching patterns
```

### ❌ AVOID These:
```bash
cat                  # Not an MCP command
vim/nano             # Not available
direct file writes   # Use str_replace_editor
tsc/build commands   # Only Mission Control runs these
```

## 📊 Progress Checking Commands (Non-Build)

Each agent should check their progress using these **lightweight commands**:

### Agent 1 (Schema) - Progress Without Building:
```bash
grep_search "error TS2322.*boolean" "db/schema" --include="*.ts"
grep_search "does not exist on type" "db/schema" --include="*.ts"
grep_search "Property.*does not exist" "db/schema" --include="*.ts"

# Count remaining schema issues
grep_search "Type.*is not assignable" "db/schema" --include="*.ts" | wc -l
```

### Agent 2 (Imports) - Count Bad Imports:
```bash
grep_search "@server/" "server/src" --include="*.ts" | wc -l
grep_search "Cannot find module" "server/src" --include="*.ts" | wc -l
grep_search "@core/db" "server/src" --include="*.ts" | wc -l
grep_search "../db" "server/src" --include="*.ts" | wc -l
```

### Agent 3 (Types) - Find Type Mismatches:
```bash
grep_search "Property.*does not exist" "." --include="*.ts" | grep -c "User"
grep_search "Expected.*arguments" "." --include="*.ts" | wc -l
grep_search "Type.*recursively references" "." --include="*.ts" | wc -l
```

### Agent 4 (API) - Check Contract Issues:
```bash
grep_search "ApiResponse" "client/src" --include="*.ts" | wc -l
grep_search "ApiError" "server/src" --include="*.ts" | wc -l
grep_search "unknown.*assignable" "client/src" --include="*.ts" | wc -l
```

### Agent 5 (Config) - Verify Configuration:
```bash
grep_search "rootDir" "server" --include="*.json"
grep_search "Cannot find module.*@" "server/src" --include="*.ts" | wc -l
grep_search "error TS6059" "." --include="*.ts" | wc -l
```

## 🚦 Build Command Protocol

**CRITICAL: Only Mission Control coordinates builds**

### Mission Control Build Checks:
```bash
# Every 30 minutes, Mission Control runs:
echo "=== BUILD CHECK $(date) ===" >> unfuck-progress.md
cd server && timeout 30s npx tsc --noEmit 2>&1 | grep -c "error TS" >> unfuck-progress.md

# Targeted domain checks when agents request:
npx tsc --noEmit server/src/domains/auth/*.ts
npx tsc --noEmit db/schema/admin/*.ts
```

### Agent Build Request Protocol:
```markdown
## Agent X Build Request

**Domain**: server/src/domains/auth/
**Files Modified**: auth.service.ts, auth.controller.ts
**Changes**: Fixed 12 import paths, added missing types
**Ready for**: Targeted type check
**Command Needed**: `npx tsc --noEmit server/src/domains/auth/*.ts`
```

## 🛠️ MCP Best Practices for Agents

### 1. File Editing Pattern:
```python
# Always read first to understand context
content = read_file("server/src/file.ts")

# Make targeted replacements
str_replace_editor(
  path="server/src/file.ts",
  old_str="import { db } from '@core/db';",
  new_str="import { db } from '@db';"
)

# Verify the change
updated = read_file("server/src/file.ts")
```

### 2. Pattern Finding:
```python
# Find all instances before bulk fixing
results = grep_search(
  pattern="@server/",
  path="server/src",
  include="*.ts"
)

# Process results systematically
for file in results:
  # Fix each file individually
```

### 3. Progress Validation:
```python
# Before claiming task complete, verify:
remaining = grep_search(
  pattern="your_target_pattern",
  path="your_domain",
  include="*.ts"
)

if len(remaining) == 0:
  print("✅ Domain clean of target errors")
else:
  print(f"❌ {len(remaining)} errors remaining")
```

## 📈 Efficient Progress Tracking

### Agent Progress Report Template:
```markdown
## Agent X Progress Report - $(date +%H:%M)

### Domain: [your specific domain]
### Files Modified: X files
### Errors Fixed:
- Pattern 1: Before X → After Y  
- Pattern 2: Before X → After Y
- Pattern 3: Before X → After Y

### Verification:
- grep_search results: [counts]
- Files remaining: [list]

### Status: [IN_PROGRESS | READY_FOR_BUILD_CHECK | COMPLETE]
### Next: [next focus area]
```

### Local Progress Tracking:
```bash
# Each agent maintains progress file
echo "Agent 1 Schema Fixes - $(date)" > agent1-progress.txt
echo "boolean errors: 45 → 12" >> agent1-progress.txt
echo "missing properties: 23 → 5" >> agent1-progress.txt
echo "export issues: 18 → 0" >> agent1-progress.txt
```

## 🚨 Resource Management Rules

### DO:
- ✅ Use targeted grep_search on specific domains
- ✅ Read files before editing them
- ✅ Make incremental, verifiable changes
- ✅ Report progress every 30 minutes
- ✅ Request build checks through Mission Control

### DON'T:
- ❌ NO parallel builds (Mission Control only)
- ❌ NO full codebase scans (target specific domains)
- ❌ NO repeated large operations (cache findings)
- ❌ NO editing files other agents own
- ❌ NO skipping verification steps

## 🎯 Agent Coordination Flow

### 1. Agent Startup:
```markdown
1. Read assigned domain documentation
2. Scan domain for target error patterns
3. Create initial progress baseline
4. Begin systematic fixes
```

### 2. Progress Reporting:
```markdown
Every 30 minutes:
1. Run verification grep_search commands
2. Update progress file
3. Report to Mission Control
4. Request build check if domain ready
```

### 3. Domain Completion:
```markdown
1. Verify all target patterns eliminated
2. Request final build check
3. Mark domain complete
4. Hand off to next agent if needed
```

## 🔥 Ready for Deployment

**This protocol ensures:**
- Efficient resource usage
- No agent conflicts  
- Measurable progress
- Coordinated build verification
- Systematic error elimination

**Deploy agents with these protocols and watch the error count drop! 🚀**