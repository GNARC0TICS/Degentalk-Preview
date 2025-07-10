# _QUICK_REFERENCE.md - DEGENTALK CRITICAL INFO

## 🚨 CURRENT STATE: PRODUCTION BLOCKED

**Main Issues:**
- 29 .bak files being imported (CRITICAL)
- 595 console statements (SECURITY RISK)  
- 93 ESLint errors blocking CI
- Duplicate components everywhere
- Zero API validation

## 🎯 IMMEDIATE ACTIONS REQUIRED

1. **DELETE ALL .bak FILES** (they're being imported!)
2. **RUN PHASE 5 CODEMODS** at `scripts/codemods/phase5/run-all.ts`
3. **DELETE DUPLICATE CONFIGS** in `client/` (use `config/` only)

## 📁 KEY LOCATIONS

```
Codemods: scripts/codemods/phase5/
Configs:  config/ (CANONICAL - use these!)
Rules:    .cursor/rules/
ESLint:   eslint-plugins/degen/
```

## ⚡ QUICK COMMANDS

```bash
# Run all Phase 5 codemods
pnpm tsx scripts/codemods/phase5/run-all.ts

# Check lint status
pnpm lint 2>&1 | grep -E "error|warning" | wc -l

# Find .bak files
find . -name "*.bak" | grep -v node_modules

# Find console statements
grep -r "console\." --include="*.ts" --include="*.tsx" | wc -l
```

## 🔴 NEVER DO:
- Create new files (edit existing)
- Add comments to code
- Skip validation
- Work on multiple phases at once

## ✅ ALWAYS DO:
- Follow _CODEBASE_TRANSFORMATION_PLAN.md
- Run validation after changes
- Use existing codemods
- Backup before deletions

**Full Plan:** See `_CODEBASE_TRANSFORMATION_PLAN.md`