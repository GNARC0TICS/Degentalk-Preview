# Degentalk Schema Issues Report

Generated: $(date)

## 1. Drizzle Migration Generation Blocked

**Issue**: Cannot generate new migrations due to duplicate index name warning
```
Warning: We've found duplicated index name across public schema. 
Please rename your index in either the threads table or the table with the duplicated index name
```

**Root Cause**: FOUND - JavaScript (.js) files in db/schema directory contain the same index definitions as TypeScript files

**Confirmed Issue**:
- There are 163 TypeScript (.ts) files in db/schema/
- There are also many JavaScript (.js) files with duplicate index definitions
- Drizzle is reading both file types and seeing duplicate indexes
- Example duplicates found:
  - idx_analytics_events_created_at
  - idx_analytics_events_type
  - idx_analytics_events_user_id
  - And many more...

## 2. New Tables Not Yet Migrated

**Tables Added to Schema**:
- `xp_action_logs` (db/schema/economy/xpActionLogs.ts)
- `xp_action_limits` (db/schema/economy/xpActionLimits.ts)

**Status**: Cannot generate migration due to index name conflict

## 3. Missing Schema Definitions

**Tables Referenced in Server Migrations But Not in Schema**:
- ✅ `xp_action_logs` - Now added
- ✅ `xp_action_limits` - Now added
- ✅ `daily_xp_gained` field - Already exists in users table
- ✅ `last_xp_gain_date` field - Already exists in users table

## 4. TypeScript Build Errors Related to Schema

From the build output:
- Missing exports: `toMessageId`, `AuthorId` from @shared/types/ids
- Missing table fields: `content` on threads table
- Missing `transactionId` field (should be `id`) on transactions table
- Multiple repository pattern violations

## 5. Action Items to Resolve

### Immediate Actions:
1. **Investigate Database State**:
   ```sql
   -- Check existing indexes in database
   SELECT schemaname, tablename, indexname 
   FROM pg_indexes 
   WHERE indexname LIKE '%threads%'
   ORDER BY indexname;
   ```

2. **Check for Conflicting Migrations**:
   - Review all SQL files in db/migrations/postgres/
   - Look for CREATE INDEX statements that might conflict

3. **Clean JavaScript Files** (THIS IS THE SOLUTION):
   ```bash
   find db/schema -name "*.js" -type f -delete
   ```

4. **Try Fresh Generation**:
   ```bash
   cd db
   rm -rf migrations/postgres/meta/0002_snapshot.json  # Remove next snapshot if exists
   pnpm drizzle-kit generate
   ```

### Long-term Solutions:
1. **Standardize Index Naming Convention**:
   - Pattern: `idx_${tableName}_${columnName}`
   - Ensure globally unique names across all tables

2. **Fix TypeScript Errors**:
   - Add missing type exports to shared/types
   - Fix field references in repositories

3. **Migration Strategy**:
   - Once index issue is resolved, generate migration for new XP tables
   - Apply migration to database
   - Remove legacy migration files

## 6. Recommended Next Steps

1. Connect to database and check actual index names
2. Compare database indexes with schema definitions
3. Identify the specific duplicate causing the issue
4. Rename conflicting indexes
5. Generate and apply migration
6. Fix TypeScript build errors

## 7. Files to Review

- `db/schema/forum/threads.ts` - Check index definitions
- `db/migrations/postgres/*.sql` - Look for CREATE INDEX statements
- `db/drizzle.config.ts` - Verify configuration
- All files with "idx_threads" indexes