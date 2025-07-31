# Drizzle ORM Schema Documentation

This directory contains all database schema definitions for the DegenTalk platform using Drizzle ORM.

## Important: TypeScript "Unused Import" Warnings

**⚠️ DO NOT REMOVE IMPORTS THAT APPEAR UNUSED IN SCHEMA FILES ⚠️**

Drizzle ORM uses TypeScript imports in special ways that may appear unused to TypeScript and ESLint, but are actually required for:

1. **Type inference** - Drizzle infers types from imports even if not explicitly used
2. **Relation definitions** - The `relations` function requires imports to establish connections
3. **Schema introspection** - Drizzle CLI needs these imports for migrations and studio
4. **Runtime schema building** - Some imports are used dynamically at runtime

### Imports That Must Stay

```typescript
// These appear unused but MUST NOT be removed:
import { relations } from 'drizzle-orm';
import { index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { many, one } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { primaryKey, unique } from 'drizzle-orm/pg-core';
import { integer, boolean, varchar, text, decimal, timestamp, uuid } from 'drizzle-orm/pg-core';
```

### ESLint Configuration

The root `.eslintrc.cjs` is configured to ignore these patterns in db/schema files:

```javascript
{
  files: ['db/schema/**/*.ts'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { 
      varsIgnorePattern: '^(relations|index|sql|many|one|createInsertSchema|primaryKey|unique|integer|boolean|varchar|text|decimal)$'
    }]
  }
}
```

## Schema Organization

### Directory Structure
```
db/schema/
├── index.ts              # Central export file
├── enums.ts              # Shared enums and types
├── auth/                 # Authentication related schemas
├── cosmetics/            # User cosmetics (themes, frames, titles)
├── forum/                # Forum structure and content
├── gamification/         # Achievements, XP, rewards
├── messaging/            # Direct messaging and chats
├── moderation/           # Content moderation and reports
├── notifications/        # User notifications
├── shop/                 # Shop items and purchases
├── social/               # Social features (follows, relationships)
├── user/                 # User profiles and settings
└── wallet/               # Economy and transactions
```

### Schema Conventions

1. **Table Naming**: Use snake_case plural (e.g., `users`, `forum_posts`)
2. **Column Naming**: Use snake_case (e.g., `created_at`, `user_id`)
3. **Primary Keys**: Always use UUID with default `gen_random_uuid()`
4. **Timestamps**: Include `created_at` and `updated_at` on all tables
5. **Soft Deletes**: Use `deleted_at` timestamp instead of hard deletes
6. **Foreign Keys**: Name as `{table_singular}_id` (e.g., `user_id`, `thread_id`)

### Common Patterns

#### Basic Table Definition
```typescript
export const tableName = pgTable('table_name', {
  id: uuid('id').primaryKey().defaultRandom(),
  // other columns...
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});
```

#### Relations Definition
```typescript
export const tableNameRelations = relations(tableName, ({ one, many }) => ({
  user: one(users, {
    fields: [tableName.userId],
    references: [users.id],
  }),
  items: many(otherTable),
}));
```

#### Indexes
```typescript
export const tableNameIndexes = {
  userIdIdx: index('table_name_user_id_idx').on(tableName.userId),
  createdAtIdx: index('table_name_created_at_idx').on(tableName.createdAt),
};
```

#### Composite Keys
```typescript
export const compositePrimaryKey = primaryKey({
  columns: [table.column1, table.column2],
});
```

## Migration Workflow

1. **Make schema changes** in the appropriate schema file
2. **Generate migration**: `cd db && pnpm drizzle-kit generate`
3. **Review migration**: Check generated SQL in `migrations/postgres/`
4. **Apply migration**: `pnpm db:migrate` (uses DIRECT_DATABASE_URL)

## Common Issues

### "Property does not exist" Errors
- Check if you're using the correct table name in relations
- Verify column names match exactly (case-sensitive)
- Ensure all tables are exported from `index.ts`

### Migration Hanging
- Never use `pnpm db:push` with Neon (it hangs on introspection)
- Use `pnpm db:push:force` or direct SQL scripts instead
- Always use DIRECT_DATABASE_URL for schema operations

### Type Inference Issues
- Make sure all relations are properly defined
- Export both table and relations from each schema file
- Check that circular dependencies are avoided

## Adding New Schemas

1. Create new file in appropriate directory
2. Define table using `pgTable`
3. Define relations using `relations`
4. Add indexes if needed
5. Export from the schema file
6. Add export to `db/schema/index.ts`

Example:
```typescript
// db/schema/feature/new-table.ts
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from '../user/users';

export const newTable = pgTable('new_table', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  userId: uuid('user_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const newTableRelations = relations(newTable, ({ one }) => ({
  user: one(users, {
    fields: [newTable.userId],
    references: [users.id],
  }),
}));

// db/schema/index.ts
export * from './feature/new-table';
```

## Performance Considerations

1. **Always add indexes** for:
   - Foreign key columns
   - Columns used in WHERE clauses
   - Columns used in ORDER BY clauses
   - Columns used in JOIN conditions

2. **Avoid over-indexing**: Each index slows down writes
3. **Use composite indexes** for multi-column queries
4. **Consider partial indexes** for filtered queries

## Security Notes

1. **Never expose** internal IDs in public APIs
2. **Always validate** foreign key relationships
3. **Use Row Level Security (RLS)** where appropriate
4. **Sanitize** all user inputs before storage
5. **Audit sensitive operations** with proper logging