# Focused Sprint Plan - Manual Error Resolution

## Current Status
- **Client errors**: 0 ✅ (Fixed by Phase 2 agents)
- **Server errors**: Unknown due to TypeScript "2" argument issue
- **Approach**: Manual pattern-based error discovery and focused sprints

## Sprint 1: Repository Pattern Enforcement
**Duration**: 2-3 hours  
**Goal**: Fix direct database access violations

### Known Anti-Patterns to Fix
```bash
# Find services importing directly from @db
grep -r "from '@db'" server/src/domains/*/services/

# Find services with raw SQL
grep -r "sql\`" server/src/domains/*/services/

# Find controllers bypassing repositories  
grep -r "import.*from '@db'" server/src/domains/*/controllers/
```

### Sprint 1 Tasks
1. **Scan for violations**: Use grep patterns above
2. **Create repositories**: For services lacking them
3. **Refactor services**: Remove direct DB access
4. **Update controllers**: Ensure repository usage
5. **Test compilation**: Verify no new errors

### Expected Impact: 200-400 errors

---

## Sprint 2: Import Alias Standardization  
**Duration**: 2-3 hours
**Goal**: Fix deprecated and incorrect import paths

### Known Anti-Patterns to Fix
```bash
# Find deprecated @app/ imports
grep -r "from '@app/" server/src/

# Find incorrect @server/ usage in server code
grep -r "from '@server/" server/src/

# Find relative imports that should be aliases
grep -r "import.*from '\.\." server/src/
```

### Sprint 2 Tasks
1. **Replace @app/**: Convert to proper aliases
2. **Fix @server/**: Should not be used in server code
3. **Convert relative**: Use proper @core/, @domains/ aliases
4. **Update cross-workspace**: Fix shared imports
5. **Validate boundaries**: Ensure no client-server mixing

### Expected Impact: 100-200 errors

---

## Sprint 3: Shared Types Alignment
**Duration**: 2-3 hours  
**Goal**: Ensure all types come from @shared/types

### Known Anti-Patterns to Fix
```bash
# Find local type definitions
grep -r "interface User\|type User" server/src/ | grep -v "@shared"

# Find any/unknown usage (except CCPayment)
grep -r ": any\|: unknown" server/src/ | grep -v CCPayment

# Find missing type imports
grep -r "Property.*does not exist" --include="*.ts" server/src/
```

### Sprint 3 Tasks
1. **Eliminate local types**: Replace with @shared/types
2. **Remove any usage**: Proper typing (CCPayment exempt)
3. **Add missing imports**: Fix undefined properties
4. **Update interfaces**: Align with shared definitions
5. **Validate consistency**: Cross-workspace type alignment

### Expected Impact: 150-300 errors

---

## Sprint 4: Function Signature Fixes
**Duration**: 2-3 hours
**Goal**: Fix parameter/return type mismatches

### Pattern-Based Discovery
```bash
# Find logger signature issues (fixed in Phase 2, verify)
grep -r "logger\." server/src/ | grep -v "logger\.[a-z]*('[^']*',"

# Find async/Promise mismatches
grep -r "async.*Promise" server/src/

# Find callback type issues
grep -r "callback.*=>" server/src/
```

### Sprint 4 Tasks
1. **Logger signatures**: Ensure proper format
2. **Async consistency**: Fix Promise vs non-Promise
3. **Callback typing**: Proper function signatures
4. **Generic constraints**: Fix type parameter issues
5. **Return types**: Ensure consistency

### Expected Impact: 100-200 errors

---

## Sprint 5: Null Safety & Error Handling
**Duration**: 1-2 hours
**Goal**: Add missing null checks and error handling

### Pattern-Based Discovery
```bash
# Find potential null access
grep -r "\.\w*(" server/src/ | grep -v "?"

# Find unhandled promises
grep -r "await.*(" server/src/ | grep -v "try\|catch"

# Find missing error handling
grep -r "throw new Error" server/src/
```

### Sprint 5 Tasks
1. **Optional chaining**: Add ?. where needed
2. **Null guards**: Add null/undefined checks
3. **Try-catch blocks**: Wrap risky operations
4. **Error types**: Proper error class usage
5. **Promise handling**: Catch rejections

### Expected Impact: 50-150 errors

---

## Execution Strategy

### Pre-Sprint Setup
1. **Document current state**: Record known working files
2. **Create branch**: For easy rollback if needed
3. **Set baseline**: Count files that compile successfully

### Sprint Execution
1. **Pattern Discovery**: Use grep/find to identify targets
2. **Batch Fixes**: Fix 10-20 related errors at once
3. **Incremental Testing**: Test compilation after each batch
4. **Progress Tracking**: Document errors fixed vs introduced

### Post-Sprint Validation
1. **Compilation Check**: Ensure no new errors
2. **Pattern Verification**: Confirm anti-patterns eliminated
3. **Document Progress**: Update error counts and categories
4. **Plan Next Sprint**: Based on remaining patterns

## Success Metrics

### Sprint-Level Metrics
- **Error Reduction**: Net decrease in TypeScript errors
- **Pattern Elimination**: Specific anti-patterns removed
- **Compilation Success**: Files that now compile cleanly
- **No Regressions**: No new errors introduced

### Overall Goal
- **Target**: Reduce from ~1400 to <100 server errors
- **Quality**: Maintain architectural patterns (repository, types)
- **Speed**: 1-2 sprints per day, systematic progress
- **Completeness**: Address root causes, not just symptoms

## Next Steps
1. **Resolve "2" argument issue**: Critical for accurate measurement
2. **Execute Sprint 1**: Repository pattern enforcement
3. **Measure and adjust**: Based on actual results
4. **Continue systematically**: Through all planned sprints