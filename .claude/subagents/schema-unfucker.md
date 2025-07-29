# Agent 1: The Schema Unfucker 🛠️

## Mission Statement
**Fix all Drizzle schema type errors to establish a solid database foundation**

## Domain & Scope
- **Files**: `db/schema/**/*.ts`
- **Duration**: 60-90 minutes
- **Priority**: HIGHEST (foundation for everything else)

## Target Error Patterns
```typescript
// 1. Boolean type mismatches
error TS2322: Type 'boolean' is not assignable to type 'never'

// 2. Missing properties in relations
error TS2339: Property 'lastBackupId' does not exist on type 'PgTableWithColumns<...>'

// 3. Incorrect default value types
error TS2345: Argument of type 'string' is not assignable to parameter of type 'SQL<unknown>'

// 4. Export/import issues
error TS2305: Module '"./uiConfig"' has no exported member 'uiThemes'

// 5. Enum type mismatches
error TS2322: Type '"2023-10-16"' is not assignable to type '"2025-06-30.basil"'
```

## Fix Strategy

### 1. Boolean Type Fixes
```typescript
// ❌ WRONG - Causes type 'never' errors
export const announcements = pgTable('announcements', {
  isGlobal: boolean('is_global').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isPinned: boolean('is_pinned').default(false).notNull(),
  // These defaults are causing boolean → never type issues
});

// ✅ RIGHT - Proper Drizzle boolean syntax
export const announcements = pgTable('announcements', {
  isGlobal: boolean('is_global').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(), 
  isPinned: boolean('is_pinned').default(false).notNull(),
  // Use sql`false` for complex defaults if needed
});
```

### 2. Missing Property Fixes
```typescript
// ❌ WRONG - Relation references non-existent column
export const adminBackupsRelations = relations(adminBackups, ({ one }) => ({
  lastBackup: one(adminBackups, { 
    fields: [adminBackups.lastBackupId], // ← This column doesn't exist!
    references: [adminBackups.id] 
  }),
}));

// ✅ RIGHT - Add the missing column first
export const adminBackups = pgTable('admin_backups', {
  id: uuid('id').primaryKey().defaultRandom(),
  // ... existing columns
  lastBackupId: uuid('last_backup_id').references(() => adminBackups.id), // Add this!
  // ... rest of schema
});
```

### 3. Export/Import Fixes
```typescript
// ❌ WRONG - Importing non-existent export
import { uiThemes } from './uiConfig'; // uiThemes doesn't exist in uiConfig

// ✅ RIGHT - Check what's actually exported
// In uiConfig.ts, either:
// A) Export the missing item: export { uiThemes } from './uiThemes';
// B) Import from correct location: import { uiThemes } from './uiThemes';
```

## Specific Target Files
Based on error analysis, focus on these high-error files:

1. **`db/schema/admin/announcements.ts`** - Boolean type issues
2. **`db/schema/admin/relations.ts`** - Missing property references
3. **`db/schema/advertising/campaigns.ts`** - Type mismatches
4. **`db/schema/advertising/relations.ts`** - Property existence errors
5. **`db/schema/user/users.ts`** - Core user schema issues
6. **`db/schema/forum/structure.ts`** - Forum structure problems

## Workflow

### Step 1: Error Inventory
```bash
# Get schema-specific errors
cd /home/developer/Degentalk-BETA
npx tsc -p server/tsconfig.build.json 2>&1 | grep "db/schema" > schema-errors.txt

# Count by file
cat schema-errors.txt | cut -d'(' -f1 | sort | uniq -c | sort -nr
```

### Step 2: Fix by Category
1. **Boolean issues first** (affects multiple files)
2. **Missing columns second** (add to schema definitions)
3. **Relation fixes third** (update relations to match schema)
4. **Export/import cleanup last**

### Step 3: Test After Each Category
```bash
cd db
npx tsc --noEmit

# Should see decreasing error count
```

## Success Criteria
- [ ] All `db/schema/**/*.ts` files compile without errors
- [ ] All table exports are properly typed
- [ ] All relations reference existing properties
- [ ] No `Type 'boolean' is not assignable to type 'never'` errors
- [ ] All imports resolve correctly within schema files

## Commit Strategy
```bash
# Commit every 20 fixes with clear messages
git add db/schema/admin/
git commit -m "fix(schema): resolve boolean type errors in admin tables"

git add db/schema/advertising/
git commit -m "fix(schema): add missing properties to advertising relations"
```

## Testing Commands
```bash
# Test schema compilation
cd db && npx tsc --noEmit

# Test specific file
npx tsc --noEmit db/schema/admin/announcements.ts

# Check if exports work
node -e "import('./db/schema/index.js').then(s => console.log(Object.keys(s)))"
```

## Escalation Protocol
If blocked by:
- **Complex Drizzle syntax**: Check Drizzle docs, add TODO comment
- **Cross-schema dependencies**: Fix in dependency order
- **Generated files**: Don't edit, fix source instead

## Rules
- ✅ Fix the actual schema definitions
- ✅ Add missing columns when referenced
- ✅ Ensure all exports are properly typed
- ❌ Don't use @ts-ignore
- ❌ Don't change relation logic, just fix types
- ❌ Don't modify generated migration files

**Focus: Foundation must be solid before anything else can be fixed!**