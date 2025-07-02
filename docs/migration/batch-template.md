# Migration Batch Template

Use this template for each domain migration batch.

## Batch: {BATCH_NAME}

**Target**: {DOMAIN_DESCRIPTION}  
**Priority**: {HIGH|MEDIUM|LOW}  
**Risk Level**: {CRITICAL|HIGH|MEDIUM|LOW}  

### Pre-Migration State
- **Issue Count**: {START_COUNT} TypeScript errors
- **Files Affected**: {FILE_COUNT} files
- **Script Path**: `scripts/migration/domain-migrations/{batch-name}-migration.ts`

### Expected Outcome
- **Target Reduction**: {START_COUNT} → {EXPECTED_COUNT} errors
- **Error Reduction**: ~{REDUCTION_COUNT} issues resolved

### Migration Plan

#### Phase 1: Analysis
- [ ] Run dry-run analysis: `pnpm tsx {script-path}`
- [ ] Review output in `scripts/migration/output/{batch-name}-dryrun.log`
- [ ] Generate manual review checklist

#### Phase 2: Automated Changes
- [ ] Apply high-confidence changes (≥0.9 confidence)
- [ ] Add required imports for branded types
- [ ] Verify no build-breaking changes

#### Phase 3: Manual Review
- [ ] Review items with confidence <0.9
- [ ] Handle complex type relationships
- [ ] Verify API boundary compatibility

#### Phase 4: Validation
- [ ] Run full TypeScript check: `pnpm typecheck`
- [ ] Run linting: `pnpm lint`
- [ ] Update CI baseline in `check-ids-ci.ts`

### Manual Review Checklist

{AUTO_GENERATED_FROM_DRY_RUN}

### Common Patterns in This Batch

- **{Pattern 1}**: {description and handling}
- **{Pattern 2}**: {description and handling}
- **{Pattern 3}**: {description and handling}

### Risk Mitigation

- **High-Risk Items**: {list items requiring extra care}
- **Rollback Plan**: All changes backed up to `.backup.{timestamp}` files
- **Testing Strategy**: {describe validation approach}

### Completion Criteria

- [ ] TypeScript error count reduced by ≥{EXPECTED_REDUCTION}%
- [ ] No new build-breaking errors introduced
- [ ] All automated tests passing
- [ ] Manual review items resolved
- [ ] CI baseline updated

### Post-Migration

- [ ] Clean up backup files: `find . -name "*.backup.*" -delete`
- [ ] Update migration summary report
- [ ] Document lessons learned
- [ ] Plan next batch priority

---

**Migration Officer**: {ASSIGNEE}  
**Date Started**: {DATE}  
**Date Completed**: {DATE}  
**Final Error Count**: {FINAL_COUNT}