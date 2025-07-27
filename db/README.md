# DegenTalk Database Layer (`db/`)

## Status: Production Ready | Updated: 2025-07-27

## 📋 Overview

The `db/` directory contains all database schemas, migrations, and types for the DegenTalk platform using Drizzle ORM with PostgreSQL (hosted on Neon).

## 📁 Directory Structure

```
db/
├── schema/              # Database table definitions
│   ├── admin/          # Admin panel tables (themes, settings, etc.)
│   ├── economy/        # Economy & gamification (XP, levels, badges)
│   ├── forum/          # Forum structure & content
│   ├── messaging/      # Chat & messaging systems
│   ├── shop/           # E-commerce & cosmetics
│   ├── social/         # Social features (mentions, follows)
│   ├── system/         # System tables (analytics, notifications)
│   ├── user/           # User accounts & authentication
│   ├── wallet/         # Crypto wallet integration
│   └── index.ts        # Central schema exports
├── migrations/         # Database migrations
│   ├── postgres/       # PostgreSQL migration files
│   └── archive/        # Archived/legacy migrations
├── types/              # TypeScript type definitions
├── enums/              # Shared enum definitions
├── index.ts            # Main database export
├── drizzle.config.ts   # Drizzle ORM configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Package dependencies
```

## 🚀 Quick Start

### Essential Commands

```bash
# Apply pending migrations (REQUIRED: DATABASE_URL)
export DATABASE_URL="postgresql://..." && pnpm db:migrate

# Generate new migration from schema changes
cd db && pnpm drizzle-kit generate

# Open Drizzle Studio (database GUI)
pnpm db:studio

# Sync forum configuration to database
pnpm db:sync:forums
```

### Command Reference

| Command | Description | When to Use |
|---------|-------------|-------------|
| `pnpm db:migrate` | Apply pending migrations | After pulling changes with migrations |
| `pnpm db:studio` | Open visual database browser | To inspect data or test queries |
| `pnpm db:sync:forums` | Sync forum config to DB | After modifying forum-map.config.ts |
| `drizzle-kit generate` | Generate migration from schema | After modifying schema files |

## 📊 Schema Overview

### Core Domains

#### 👤 User System (`schema/user/`)
- **users** - User accounts with XP, wallet, and profile data
- **sessions** - Active user sessions
- **roles** - Role-based permissions
- **preferences** - User settings and preferences
- **relationships** - Friend/follow connections
- **avatarFrames** - Cosmetic profile frames

#### 💬 Forum System (`schema/forum/`)
- **structure** - Hierarchical forum organization
- **threads** - Discussion threads
- **posts** - Individual posts and replies
- **tags** - Content categorization
- **polls** - Voting and surveys
- **prefixes** - Thread categorization

#### 💰 Economy System (`schema/economy/`)
- **wallets** - DGT token wallets
- **transactions** - Transaction history
- **levels** - XP progression system
- **badges** - Achievement system
- **titles** - Displayable user titles
- **xpLogs** - XP gain history

#### 🛍️ Shop System (`schema/shop/`)
- **products** - Virtual goods
- **orders** - Purchase records
- **rarities** - Item tier system
- **animationPacks** - Cosmetic animations
- **cosmeticCategories** - Item organization

#### 📨 Messaging (`schema/messaging/`)
- **conversations** - Private chats
- **messages** - Chat messages
- **shoutboxMessages** - Public chat
- **onlineUsers** - Presence tracking

## 🔄 Migration Workflow

### Types of Migrations

#### 1. Schema Migrations (Drizzle-managed)
For structural changes to tables:

```bash
# Step 1: Modify schema files in db/schema/
# Step 2: Generate migration
cd db && pnpm drizzle-kit generate

# Step 3: Review generated SQL
cat migrations/postgres/0XXX_*.sql

# Step 4: Apply migration
export DATABASE_URL="..." && pnpm db:migrate
```

#### 2. Data Migrations (Custom scripts)
For bulk data updates or transformations:

```bash
# Create script in: server/src/domains/*/migrations/
# Run with: tsx path/to/migration.ts
```

#### 3. Config-to-DB Migrations
For moving static configs to database:

```bash
# Example: Theme consolidation
tsx server/src/domains/themes/migrations/consolidate-themes.ts
```

### Migration Best Practices

✅ **DO:**
- Test migrations locally first
- Review generated SQL before applying
- Use transactions for data integrity
- Check for duplicate fields before generating
- Backup production data before migrations

❌ **DON'T:**
- Use `db:push` (hangs with Neon)
- Modify migration files after applying
- Make direct database changes
- Skip migration testing
- Forget to export DATABASE_URL

### Pre-Migration Checklist

Before generating or applying any migration, run through this checklist:

```bash
# 1. Check for duplicate fields
grep -n "fieldname" db/schema/*/table.ts

# 2. Verify DATABASE_URL is set
echo $DATABASE_URL

# 3. Run TypeScript check
cd db && pnpm tsc --noEmit

# 4. Check current migration status
ls -la db/migrations/postgres/

# 5. Test on local database first (if available)
export DATABASE_URL="postgresql://localhost..." && pnpm db:migrate
```

- [ ] No duplicate fields in schema
- [ ] DATABASE_URL properly configured
- [ ] TypeScript compiles without errors
- [ ] Generated SQL reviewed
- [ ] Production data backed up (if applicable)
- [ ] Migration tested locally

## 🏗️ Architecture Principles

### Repository Pattern
All database access MUST go through repository files:

```typescript
// ✅ CORRECT - In repository
export class UserRepository {
  async findById(id: UserId) {
    return db.query.users.findFirst({
      where: eq(users.id, id)
    });
  }
}

// ❌ WRONG - Direct DB access in service
export class UserService {
  async getUser(id: UserId) {
    // Services should call repositories!
    return db.query.users.findFirst(...);
  }
}
```

### Branded IDs
Type-safe ID handling:

```typescript
import { toUserId, toForumId } from '@shared/utils/id';

// Convert strings to branded types
const userId = toUserId('123');
const forumId = toForumId('456');

// Type checking
if (isValidId(userId)) {
  // Safe to use
}
```

### Schema Conventions

1. **Table Names**: Plural, snake_case (`users`, `forum_threads`)
2. **Column Names**: snake_case in DB, camelCase in TS
3. **Timestamps**: Always include `createdAt`/`updatedAt`
4. **Soft Deletes**: Use `isDeleted` flag
5. **Foreign Keys**: Named as `[table]_id`
6. **UUIDs**: Default for all primary keys

## 🔧 Troubleshooting

### Common Issues & Solutions

**"DATABASE_URL not set" error**
```bash
# Ensure environment variable is exported
export DATABASE_URL="postgresql://..." && pnpm db:migrate
```

**TypeScript compilation errors**
```bash
# db workspace uses standalone tsconfig
cd db && pnpm tsc --noEmit

# Fix import paths if needed
# Use relative imports within db/
```

**"Table already exists" migration error**
```sql
-- Check migration history
SELECT * FROM __drizzle_migrations;

-- May need manual intervention
```

**Migration hangs indefinitely**
```bash
# Never use db:push with Neon!
# Always use db:migrate instead
```

## 🔒 Security Considerations

- **Never commit** database credentials
- **Use connection pooling** for production
- **Enable SSL** for all connections (required by Neon)
- **Regular backups** of production data
- **Least privilege** for database users
- **Audit logging** for sensitive operations

## 📚 Key Configuration Files

### `drizzle.config.ts`
```typescript
// Configures Drizzle Kit
export default {
  dialect: 'postgresql',
  schema: ['./schema/**/*.ts'],
  out: './migrations/postgres',
  dbCredentials: { url: dbUrl }
}
```

### `tsconfig.json`
- Standalone configuration for db workspace
- Uses ESNext modules with bundler resolution
- Minimal path aliases for self-containment

### `package.json`
- Workspace package with database dependencies
- Scripts for migration and studio commands

## 🔗 Related Documentation

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Neon Database Documentation](https://neon.tech/docs)
- [DATABASE_MIGRATION_PLAN.md](/DATABASE_MIGRATION_PLAN.md) - Detailed migration strategy
- [CLAUDE.md](/CLAUDE.md) - Development guidelines

## 💡 Tips & Tricks

### Drizzle Studio
```bash
# Visual database browser
pnpm db:studio

# Useful for:
# - Browsing data
# - Testing queries
# - Checking relationships
```

### Schema IntelliSense
```typescript
// Import all schemas
import * as schema from '@schema';

// Use with db.query for full type safety
const user = await db.query.users.findFirst({
  with: {
    roles: true,
    badges: true
  }
});
```

### Performance Tips
- Create indexes for frequently queried columns
- Use `with` for eager loading relationships
- Batch operations when possible
- Monitor slow queries in production

---

_Last updated: 2025-07-27 | Maintained by DegenTalk Backend Team_