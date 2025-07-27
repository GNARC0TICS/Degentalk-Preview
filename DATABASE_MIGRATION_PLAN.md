# Database Migration Workflow Analysis & Fix Plan

## Current Issues Identified

### 1. TypeScript Configuration Scope Problem
**Issue**: The db/tsconfig.json is including files outside its directory scope, causing compilation errors when running migrations.

**Root Cause**: The `extends: "../tsconfig.base.json"` brings in path aliases that reference files outside the db directory, but the db workspace is trying to compile as a standalone unit.

### 2. Duplicate Schema Definitions
**Issue**: The users table had duplicate `reputation` field definitions (lines 77 and 84).

**Status**: Fixed - removed duplicate on line 84.

### 3. Import Extension Issues  
**Issue**: Schema files using `.js` extensions in imports when TypeScript expects no extensions.

**Status**: Fixed - removed `.js` extensions from imports.

### 4. Migration Workflow Confusion
**Issue**: Multiple migration approaches exist:
- `pnpm db:push` - Drizzle push (hangs with Neon)
- `pnpm db:migrate` - Drizzle migrate
- Custom migration scripts in server/src/domains/themes/migrations/

## Proposed Solution

### Phase 1: Fix TypeScript Configuration (Immediate)

1. **Create Standalone db/tsconfig.json**
   - Remove inheritance from base config
   - Define only paths needed within db workspace
   - Use module resolution appropriate for migrations

2. **Create db-specific path mappings**
   - Local schema references only
   - No cross-workspace imports

### Phase 2: Establish Clear Migration Patterns

1. **Schema Changes**: Always use Drizzle migrations
   ```bash
   # Generate migration
   pnpm drizzle-kit generate:pg
   
   # Apply migration
   pnpm db:migrate
   ```

2. **Data Migrations**: Custom scripts in `db/migrations/data/`
   - Use standalone TypeScript execution
   - Import only from db workspace
   - Follow naming convention: `YYYY-MM-DD-description.ts`

3. **Config-to-DB Migrations**: One-time scripts
   - Like the theme consolidation
   - Place in appropriate domain's migration folder
   - Run with tsx directly

### Phase 3: Migration Workflow Documentation

1. **Decision Tree**:
   - Schema change? → Drizzle migration
   - Data transformation? → Data migration script
   - Config consolidation? → Domain migration script

2. **Testing Protocol**:
   - Always test on local database first
   - Verify rollback capability
   - Check for data integrity

## Immediate Action Items

1. Fix db/tsconfig.json to be self-contained
2. Create migration runner script for data migrations
3. Document workflow in CLAUDE.md
4. Run pending migrations
5. Clean up legacy migration files

## Long-term Improvements

1. Add migration validation hooks
2. Create migration templates
3. Implement automated rollback testing
4. Add migration status dashboard

## Migration Commands Reference

```bash
# Schema migrations
pnpm db:generate     # Generate new migration from schema changes
pnpm db:migrate      # Apply pending migrations
pnpm db:studio       # Visual database browser

# Data migrations  
tsx db/migrations/data/[migration-file].ts

# Forum sync (special case)
pnpm db:sync:forums  # Sync forum config to database
```

## Success Criteria

1. ✅ All TypeScript compilation errors resolved
2. ✅ Clear migration workflow documented
3. ✅ Pending migrations successfully applied
4. ✅ Team can confidently make schema changes
5. ✅ No more confusion about which migration approach to use