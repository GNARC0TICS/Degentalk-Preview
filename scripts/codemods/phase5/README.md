# Phase 5 Codemod Suite

A comprehensive set of automated code transformation tools to eliminate technical debt and enforce quality standards across the DegenTalk codebase.

## 🎯 Overview

Phase 5 is the final push to eliminate all legacy patterns and establish bulletproof quality gates. These codemods transform the codebase to follow strict standards that prevent technical debt from accumulating.

## 🛠️ Available Codemods

### 1. Console to Logger (`console-to-logger.ts`)
**Purpose**: Eliminates console.log/info/debug usage in server code

**Transforms**:
- `console.log("msg")` → `logger.info("msg")`
- `console.info("msg")` → `logger.info("msg")`
- `console.debug("msg")` → `logger.debug("msg")`
- `console.trace("msg")` → `logger.debug("msg")`

**Usage**:
```bash
pnpm codemod:console           # Live execution
pnpm codemod:console --dry-run # Preview changes
```

**Auto-creates**: 
- Logger imports where needed
- Auth helper file if missing

**Skips**: Test files, core/logger.ts, scripts/, client/

### 2. req.user Removal (`req-user-removal.ts`)
**Purpose**: Replaces direct req.user access with type-safe helper

**Transforms**:
- `req.user` → `getAuthenticatedUser(req)`
- `const { user } = req` → `const user = getAuthenticatedUser(req)`
- `const user = req.user` → `const user = getAuthenticatedUser(req)`

**Usage**:
```bash
pnpm codemod:req-user           # Live execution
pnpm codemod:req-user --dry-run # Preview changes
```

**Auto-creates**: 
- `server/src/core/utils/auth.helpers.ts`
- Type-safe helper functions
- Import statements

### 3. Transformer Enforcement (`enforce-transformers.ts`)
**Purpose**: Audits and fixes raw res.json() calls

**Features**:
- Detects all raw `res.json()` calls
- Provides domain-specific transformer suggestions
- Auto-fixes simple cases
- Generates detailed violation reports

**Usage**:
```bash
pnpm codemod:transformers --detailed    # Full audit report
pnpm codemod:transformers --fix-simple  # Auto-fix obvious cases
```

**Output Example**:
```
🔍 Violation 1:
   File: server/src/domains/users/user.controller.ts:45:12
   Domain: users
   Suggestion: UserTransformer.toPublicUser(user)
   Auto-fixable: Yes
```

### 4. Numeric ID Migration (`numeric-id-migration.ts`)
**Purpose**: Converts numeric ID types to branded types

**Transforms**:
- `userId: number` → `userId: UserId`
- `threadId: bigint` → `threadId: ThreadId`
- Interface properties, function parameters, variables

**Usage**:
```bash
pnpm codemod:numeric-ids                    # Live execution
pnpm codemod:numeric-ids --dry-run         # Preview changes
pnpm codemod:numeric-ids --remove-bridge   # Delete bridge file
```

**Features**:
- Comprehensive ID type mapping (50+ types)
- Context-aware type inference
- Auto-adds @shared/types imports
- Safe bridge file removal

### 5. Master Runner (`run-all.ts`)
**Purpose**: Orchestrates all codemods with safety checks

**Features**:
- Pre-flight validation
- Git checkpoint creation
- Step-by-step execution
- Automatic rollback on failure
- Post-execution validation

**Usage**:
```bash
pnpm codemod:all           # Full execution
pnpm codemod:dry           # Dry run preview
pnpm codemod:all --rollback # Undo all changes
```

## 📊 Validation & Quality Gates

### Phase 5 Validation (`../phase5/validate-phase5.ts`)
Comprehensive validation suite ensuring Phase 5 standards:

- ✅ No console usage in server code
- ✅ No req.user direct access
- ✅ Transformer usage for responses
- ✅ TypeScript compilation
- ✅ ESLint with zero warnings
- ✅ Bridge file removal
- ✅ Import boundary enforcement

**Usage**:
```bash
pnpm phase5:validate           # Full validation
pnpm phase5:validate --detailed # Detailed error report
pnpm phase5:validate --metrics  # Quality metrics
```

### Rollback System (`../phase5/rollback.ts`)
Safe rollback mechanism with multiple checkpoint options:

**Usage**:
```bash
pnpm phase5:rollback            # Interactive rollback
pnpm phase5:rollback --force    # Skip confirmation
pnpm phase5:rollback --partial  # Select specific changes
pnpm phase5:rollback --dry-run  # Preview rollback
```

## 🚀 Execution Workflow

### Recommended Order

1. **Pre-flight Check**
   ```bash
   git status                    # Ensure clean working directory
   pnpm typecheck               # Verify current state
   pnpm lint                     # Check for existing issues
   ```

2. **Dry Run Preview**
   ```bash
   pnpm codemod:dry             # Preview all changes
   ```

3. **Execute Codemods**
   ```bash
   pnpm codemod:all             # Run all transformations
   ```

4. **Validation**
   ```bash
   pnpm phase5:validate         # Verify success
   ```

5. **Integration**
   ```bash
   pnpm typecheck               # Ensure compilation
   pnpm lint --max-warnings 0   # Verify zero warnings
   pnpm test:unit               # Run tests
   ```

### Safety Features

- **Git Checkpoints**: Automatic tag creation before execution
- **Dry Run Mode**: Preview all changes without modification
- **Atomic Operations**: All-or-nothing transformation
- **Rollback System**: Safe recovery from any point
- **Validation Gates**: Ensure transformation success

## 📈 Quality Metrics

After Phase 5 completion, the codebase achieves:

- **0** console.log statements in server code
- **0** req.user direct access patterns
- **0** raw res.json() calls (except approved patterns)
- **0** ESLint warnings
- **0** TypeScript compilation errors
- **95%+** branded ID type coverage
- **100%** transformer pattern compliance

## ⚡ Performance

Typical execution times:
- Console-to-logger: ~30 seconds (170 files)
- req.user removal: ~15 seconds (14 files)
- Transformer audit: ~10 seconds (94 violations)
- Numeric ID migration: ~45 seconds (server files)
- **Total runtime**: ~2 minutes for full suite

## 🎛️ Configuration

### Customization Options

All codemods support:
- `--dry-run`: Preview without changes
- Custom ignore patterns
- Domain-specific transformations
- Configurable severity levels

### ESLint Integration

New rules enforced post-Phase 5:
```json
{
  "rules": {
    "no-console": ["error", { "allow": ["warn", "error"] }],
    "degen/no-direct-req-user": "error",
    "degen/no-number-id": "error",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

### Pre-commit Hooks

Automatic enforcement:
```json
{
  "pre-commit": "pnpm lint:staged && pnpm typecheck"
}
```

## 🔧 Troubleshooting

### Common Issues

**TypeScript compilation errors after migration**:
```bash
# Check imports
pnpm typecheck
# Fix missing imports
pnpm codemod:numeric-ids --dry-run
```

**ESLint warnings after console removal**:
```bash
# Verify logger imports
grep -r "import.*logger" server/
# Re-run console codemod
pnpm codemod:console
```

**Transformer violations persist**:
```bash
# Get detailed report
pnpm codemod:transformers --detailed
# Manual fixes required for complex cases
```

### Recovery Options

1. **Partial Rollback**:
   ```bash
   pnpm phase5:rollback --partial
   ```

2. **Full Rollback**:
   ```bash
   pnpm phase5:rollback
   ```

3. **Manual Recovery**:
   ```bash
   git tag --list | grep phase5
   git reset --hard <tag-name>
   ```

## 📚 Architecture

### Codemod Structure
```
scripts/codemods/phase5/
├── console-to-logger.ts     # Console elimination
├── req-user-removal.ts     # Auth helper migration  
├── enforce-transformers.ts # Response transformation
├── numeric-id-migration.ts # Type system migration
├── run-all.ts             # Master orchestrator
└── README.md              # This file

scripts/phase5/
├── validate-phase5.ts     # Validation suite
├── rollback.ts           # Rollback system
└── README.md
```

### Dependencies

- **ts-morph**: AST manipulation and type analysis
- **glob**: File pattern matching
- **chalk**: Console output formatting
- **minimist**: CLI argument parsing

### Type Safety

All codemods are fully typed with:
- Comprehensive error handling
- Result validation
- Progress tracking
- Detailed reporting

## 🎯 Success Criteria

Phase 5 is complete when:

- [ ] All codemods execute without errors
- [ ] Phase 5 validation passes 100%
- [ ] CI pipeline enforces zero warnings
- [ ] Bridge file successfully removed
- [ ] Team trained on new patterns

## 🤝 Contributing

When modifying codemods:

1. Test with `--dry-run` first
2. Add comprehensive error handling
3. Update this documentation
4. Verify with validation suite
5. Test rollback scenarios

## 📞 Support

For issues with Phase 5 codemods:

1. Check validation output: `pnpm phase5:validate --detailed`
2. Review rollback options: `pnpm phase5:rollback --dry-run`
3. Consult team lead for complex issues
4. Document learnings for future reference

---

**🔥 Phase 5: The final push to eliminate technical debt forever. 🔥**