## Migration Batch PR

### Pre-submission Checklist

- [ ] **Dry-run output committed** to `/scripts/migration/output/`
- [ ] **High-confidence changes only** (confidence ≥0.9 from dry-run)
- [ ] **Manual-review items resolved** or documented as deferred
- [ ] **Migration report regenerated** (`pnpm migration:detect-ids`)
- [ ] **Baseline updated** in `scripts/migration/check-ids-ci.ts`
- [ ] **All tests pass** (`pnpm test`)
- [ ] **Type-checks green** (`pnpm typecheck`)
- [ ] **Lint passes** (`pnpm lint`)

### Migration Details

**Domain:** `<domain-name>`
**Files Modified:** `<count>`
**Issues Fixed:** `<count>`
**Baseline:** `<old-count>` → `<new-count>`
**Batch Template:** See `docs/migration/batch-template.md` for detailed tracking

### Review Guidance

- **Review scope**: Only files listed in the batch's JSON output
- **No unrelated refactors**: Git diff should match migration script output
- **Manual review items**: Check handling of low-confidence changes

### Post-merge Actions

- [ ] Update `BASELINE` in `check-ids-ci.ts` to new count
- [ ] Regenerate `numeric-id-report.json`
- [ ] Plan next migration batch

---

_This PR is part of the systematic numeric-ID to branded-type migration_
