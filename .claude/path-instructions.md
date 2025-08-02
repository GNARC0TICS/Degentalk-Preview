# DEGENTALK PATH INSTRUCTIONS FOR ALL AGENTS

## CRITICAL: Always Use Absolute Paths

Your working directory is: `/home/developer/Degentalk-BETA`

### Command Patterns

**ALWAYS prefix your commands with the correct path:**

```bash
# ✅ CORRECT - Use absolute path
cd /home/developer/Degentalk-BETA && pnpm typecheck

# ✅ CORRECT - CD first, then command
cd /home/developer/Degentalk-BETA/server && npx tsc -p tsconfig.build.json

# ❌ WRONG - Relative path (will fail)
pnpm typecheck

# ❌ WRONG - Assuming you're in the right directory
cd server && pnpm build
```

### Helper Environment Variable

The project root is available as:
```bash
$DEGENTALK_ROOT  # equals /home/developer/Degentalk-BETA
```

### Common Command Patterns

```bash
# Run from project root
cd $DEGENTALK_ROOT && [command]

# Run from server directory
cd $DEGENTALK_ROOT/server && [command]

# Run from client directory
cd $DEGENTALK_ROOT/client && [command]

# Run from db directory
cd $DEGENTALK_ROOT/db && [command]
```

### Script Execution

All scripts should be run with absolute paths:
```bash
# ✅ CORRECT
cd /home/developer/Degentalk-BETA && bash scripts/unfuck-status.sh

# ❌ WRONG
scripts/unfuck-status.sh
```

### File References

When reading/editing files, use absolute paths:
```bash
# ✅ CORRECT
/home/developer/Degentalk-BETA/server/tsconfig.json

# ❌ WRONG
server/tsconfig.json
```

## Remember: Every Command Must Start With Path Context!