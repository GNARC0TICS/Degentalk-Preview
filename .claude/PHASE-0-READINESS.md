# 🔍 PHASE-0: PLAYBOOK READINESS CHECKLIST

## 📋 Pre-Deployment Verification

### ✅ Completed Enhancements:
- [ ] Multi-package baseline error counts
- [ ] ESLint error tracking added  
- [ ] Concurrency guard for builds
- [ ] File ownership tracking system
- [ ] Lint autofix wave preparation
- [ ] Database schema sync verification
- [ ] Quality-of-life scripts
- [ ] Documentation consolidation

### 🚨 Critical Fixes Needed:

#### 1. Scope Completeness
**Missing**: Automated DB-schema drift check and lint autofix wave
**Impact**: Agents might fix TypeScript types that don't match DB reality

#### 2. Single Source of Truth  
**Problem**: Three overlapping coordination docs with conflicting instructions
**Fix**: Make `coordination-protocol.md` canonical; others point to it

#### 3. Multi-Package Error Isolation
**Problem**: Hidden errors from one package masking another
**Fix**: Separate baseline counts for server, client, shared

## 🎯 Enhanced Baseline Capture

### Multi-Package Error Counts:
```bash
# Enhanced baseline script
echo "=== ENHANCED BASELINE $(date) ===" > unfuck-progress.md
echo "Baseline SHA: $(git rev-parse HEAD)" >> unfuck-progress.md

# Server errors
echo "Server TS Errors: $(cd server && npx tsc -p tsconfig.build.json 2>&1 | grep -c 'error TS' || echo 'BROKEN')" >> unfuck-progress.md

# Client errors  
echo "Client TS Errors: $(cd client && npx tsc --noEmit 2>&1 | grep -c 'error TS' || echo 'BROKEN')" >> unfuck-progress.md

# Shared errors
echo "Shared TS Errors: $(cd shared && npx tsc --noEmit 2>&1 | grep -c 'error TS' || echo 'BROKEN')" >> unfuck-progress.md

# ESLint errors
echo "ESLint Errors: $(pnpm lint --format json 2>/dev/null | jq -r '.[] | .errorCount' | paste -sd+ | bc || echo 'BROKEN')" >> unfuck-progress.md

echo "===========================================" >> unfuck-progress.md
```

## 🛡️ Concurrency Protection

### Build Lock System:
```bash
# Concurrency guard for all builds
tsc_safe() {
  local config="$1"
  local timeout="${2:-60}"
  
  if ! flock -n -w $timeout /tmp/degentalk-tsc.lock npx tsc -p "$config" 2>&1; then
    echo "❌ Build locked by another process (timeout: ${timeout}s)"
    return 1
  fi
}

# Usage:
tsc_safe "server/tsconfig.build.json" 30
```

## 📊 Enhanced Progress Tracking

### Time-Boxed Targets:
```bash
# Wave 1 (Config+Import): TS errors ≤ 800
# Wave 2 (Schema+Types): TS errors ≤ 150  
# Wave 3 (API): TS errors ≤ 50
# Final: All builds exit 0
```

### Exit Criteria Checklist:
- [ ] `pnpm build` exit 0
- [ ] `pnpm typecheck` exit 0  
- [ ] `pnpm test` exit 0 (fast suite)
- [ ] `pnpm lint` exit 0
- [ ] `pnpm dev` starts without crashes

## 🔧 Missing Work Streams

### 1. Lint Autofix Wave (Pre-Agent):
```bash
# Run before Import-Assassin starts
pnpm lint --fix
git add . && git commit -m "chore: autofix lint issues before unfucking"
```

### 2. Schema Drift Verification:
```bash
# Verify DB schema matches TypeScript types
db_schema_check() {
  echo "Checking schema drift..."
  cd db
  
  # Compare generated SQL to actual migrations
  npx drizzle-kit generate --name "drift-check" 2>&1 | grep -q "No schema changes" || {
    echo "⚠️  Schema drift detected - fix before type fixes"
    return 1
  }
}
```

### 3. Unit Test Sentinel:
```bash
# Quick smoke test for type imports
test_type_imports() {
  node -e "
    try {
      require('@shared/types/user.types');
      require('@shared/types/ids');
      console.log('✅ Core type imports work');
    } catch(e) {
      console.log('❌ Type import broken:', e.message);
      process.exit(1);
    }
  "
}
```

## 📝 Quality-of-Life Scripts

### Package.json additions:
```json
{
  "scripts": {
    "unfuck:status": "bash scripts/unfuck-status.sh",
    "unfuck:build": "bash scripts/unfuck-build.sh", 
    "unfuck:baseline": "bash scripts/unfuck-baseline.sh"
  }
}
```

## 🎛️ File Ownership System

### Simple ownership tracking:
```bash
# Helper function for agents
own() { 
  echo "$(date '+%H:%M'): $1 owns $2" >> agent-ownership.md
}

# Usage by agents:
own "Agent-1-Schema" "db/schema/admin/"
own "Agent-2-Import" "server/src/domains/auth/"
```

## 🚨 Emergency Rollback

### Quick rollback snippet:
```bash
# Emergency rollback to baseline
baseline_sha=$(grep 'Baseline SHA' unfuck-progress.md | awk '{print $3}')
git reset --hard $baseline_sha
git clean -fd
echo "Rolled back to baseline: $baseline_sha"
```

## ✅ Ready for Launch Criteria

All items above must be ✅ before deploying agents:

1. **Enhanced baseline captured** (multi-package + ESLint)
2. **Build concurrency protection** in place
3. **Lint autofix wave** completed
4. **Schema drift check** passed
5. **File ownership system** ready
6. **Emergency rollback** tested

**Status: NEEDS IMPLEMENTATION** 
**Next: Apply all enhancements, then deploy Wave 1**