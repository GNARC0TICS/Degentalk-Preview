# Migration Review Guide

## TL;DR
- Review only files listed in batch JSON → cuts noise
- Verify git diff matches migration script output → no surprises  
- Check manual-review items handled properly → safety first

## Review Process

### 1. Scope Verification
**Files to review**: Listed in `scripts/migration/output/<domain>-migration-dryrun-*.json`
```bash
# Quick check: compare git diff vs batch list
git diff --name-only HEAD~1 | sort > actual_files.txt
jq -r '.results[].file' migration-output.json | sort > expected_files.txt
diff actual_files.txt expected_files.txt
```

### 2. Change Quality Check
- **High-confidence changes** (≥0.9): Should be mechanical replacements
  - `id: number` → `id: ThreadId`  
  - `userId: number` → `userId: UserId`
  - Clean, obvious patterns only

- **Manual-review items** (<0.9): Must be explicitly handled
  - Left untouched = documented in PR
  - Modified = human judgment applied
  - No automated changes to these lines

### 3. Red Flags
**Block if you see:**
- Unrelated refactors mixed in
- Runtime behavior changes beyond type annotations
- Files modified that aren't in the batch list
- Manual-review items changed without explanation

### 4. Safety Checks
- CI numeric-ID guard passes
- All tests green
- Type-check successful
- No new lint errors

## Common Patterns

### ✅ Good Changes
```typescript
// Before
interface Thread {
  id: number;
  userId: number;
}

// After  
interface Thread {
  id: ThreadId;
  userId: UserId;
}
```

### ❌ Avoid in Migration PRs
```typescript
// DON'T: Logic changes
if (thread.id > 0) → if (thread.id !== '') 

// DON'T: Unrelated refactors
const threadId = thread.id; → const { id: threadId } = thread;

// DON'T: Manual-review items without explanation
parseInt(thread.id) → thread.id // needs human judgment
```

## Approval Criteria
- [ ] Scope matches batch definition
- [ ] Only high-confidence changes applied
- [ ] Manual items properly handled
- [ ] All safety checks pass
- [ ] Baseline will be updated post-merge

## Escalation
**When to request changes:**
- Any red flags above
- Unclear handling of manual-review items
- Missing post-merge update plan

**When to approve:**
- Mechanical type-only changes
- Clear batch scope adherence
- Proper manual-review documentation