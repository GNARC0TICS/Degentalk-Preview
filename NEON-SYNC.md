# Neon Database Synchronization System

## Overview

The Neon Sync Agent provides a robust, production-ready system for managing database migrations and configuration synchronization across development, staging, and production environments. It includes automated safety checks, required approvals for production deployments, and comprehensive audit trails.

## Key Features

- 🔄 **Real-time synchronization** with intelligent file watching and debouncing
- 🛡️ **Production safety rules** with `*_safe.sql` migration naming enforcement
- 👥 **Required approvals** for production deployments
- 💾 **Automatic backups** using Neon's branching before production changes
- 📋 **Audit trail** for all production deployments with webhook integration
- 🎛️ **Admin UI** for configuration management without DDL operations

## Architecture

### Components

1. **Neon Sync Agent** (`scripts/ops/neon-sync-agent.ts`)

   - File watcher with configurable environments
   - Memory monitoring and crash recovery
   - Graceful shutdown handling
   - Automatic retry with exponential backoff

2. **CI/CD Workflows** (`.github/workflows/`)

   - `migrate.yml` - Automated migration validation and staging deployment
   - `promote-to-prod.yml` - Production deployment with approval gates

3. **Migration Validator** (`scripts/ops/validate-safe-migrations.ts`)

   - Enforces safe migration patterns
   - Blocks destructive operations in production
   - Generates safe migration templates

4. **Admin Interface** (`/admin/database-config`)
   - Configuration management UI
   - Migration status monitoring
   - Real-time sync capabilities

## Usage

### Development Workflow

1. **Start the Neon Sync Agent**

   ```bash
   npm run spawn -- --task neon-sync-agent --env dev --watch
   ```

   This monitors changes in:

   - `db/schema/` - Database schema files
   - `server/src/domains/` - Domain logic
   - `env.local` - Environment configuration

2. **Create Migrations**

   ```bash
   # Generate a new migration
   npm run db:migrate

   # Create a safe migration template
   npm run migration:template add_user_preferences
   ```

3. **Validate Migrations**

   ```bash
   # Validate for development
   npm run migration:validate dev

   # Validate for production (enforces *_safe.sql naming)
   npm run migration:validate prod
   ```

### Staging Deployment

Migrations are automatically deployed to staging when pushed to the `staging` branch:

1. Lints migration files for safety
2. Performs dry-run validation
3. Applies migrations to staging database
4. Syncs forum configuration
5. Runs post-migration tests

### Production Deployment

Production deployments require manual approval through GitHub Actions:

1. **Trigger Deployment**

   - Go to Actions → "Promote to Production"
   - Select staging commit to promote
   - Choose migration type (schema_safe, config_only, data_migration, hotfix)
   - Emergency flag available for critical fixes

2. **Approval Process**

   - Required reviewers configured in GitHub environment
   - Automatic Neon backup created
   - Migration safety validation
   - Audit trail logging

3. **Rollback Procedure**
   - Backups are automatically created as Neon branches
   - Access via Neon console or API
   - Rollback instructions included in migration templates

## Migration Safety Rules

### Production Requirements

1. **Naming Convention**: All production migrations must end with `_safe.sql`
2. **No Destructive Operations**: DROP, DELETE, TRUNCATE are blocked
3. **Safe Operations Only**:
   - ADD COLUMN with defaults
   - CREATE INDEX CONCURRENTLY
   - INSERT with ON CONFLICT DO NOTHING
   - Configuration updates

### Migration Template

```sql
-- Description: [migration description]
-- Created: [timestamp]
-- Type: SAFE (No destructive operations)
-- Rollback: Manual rollback instructions below

-- Migration starts here
ALTER TABLE table_name ADD COLUMN new_column TEXT DEFAULT '';
CREATE INDEX CONCURRENTLY idx_table_column ON table_name(column_name);

-- Rollback instructions:
-- 1. DROP INDEX IF EXISTS idx_table_column;
-- 2. ALTER TABLE table_name DROP COLUMN IF EXISTS new_column;
```

## Configuration Management

### Admin UI Features

Access via `/admin/database-config`:

- **Configuration Tab**: Add/edit configuration values
- **Migrations Tab**: View migration status and safety compliance
- **Sync Tab**: Manual sync triggers for forum configuration

### Configuration Categories

- `forum` - Forum-related settings
- `wallet` - DGT wallet configuration
- `xp` - Experience point settings
- `general` - General platform settings

### Safe Configuration Updates

The system only allows configuration table updates, no DDL operations:

- Update existing configuration values
- Add new configuration entries
- Sync forum structure from `forumMap.config.ts`
- No schema modifications

## Monitoring & Troubleshooting

### Health Checks

The Neon Sync Agent includes:

- Memory usage monitoring (512MB limit)
- Automatic garbage collection
- Process restart limits (5 restarts per minute)
- Graceful shutdown on signals

### Common Issues

1. **Port Already in Use**

   ```bash
   npm run kill-ports
   ```

2. **Migration Validation Failures**

   - Check for destructive operations
   - Ensure `*_safe.sql` naming for production
   - Add rollback instructions

3. **Sync Agent Crashes**
   - Check memory usage
   - Review error logs
   - Verify database connectivity

### Logs & Audit Trail

- **Development**: Console output with prefixed logs
- **Staging**: GitHub Actions logs
- **Production**: Audit webhook + GitHub Actions logs

## Best Practices

1. **Always validate migrations** before deployment
2. **Use the template generator** for new migrations
3. **Test in development** with the sync agent running
4. **Document rollback procedures** in every migration
5. **Monitor the audit trail** for production changes

## Emergency Procedures

### Hotfix Deployment

For critical production fixes:

1. Set `emergency: true` flag in deployment workflow
2. Still requires approval but bypasses some checks
3. Creates backup regardless
4. Logged in audit trail

### Database Recovery

1. Identify the backup branch in Neon console
2. Create new branch from backup
3. Update DATABASE_URL to point to recovered branch
4. Verify data integrity
5. Merge recovery branch back to main

## Security Considerations

- **No credentials in migrations** - Use environment variables
- **Approval gates** - Multiple reviewers required
- **Audit logging** - All changes tracked
- **Backup enforcement** - Automatic before production changes
- **Safe operations only** - Destructive operations blocked

## Related Documentation

- `README.md` - General project documentation
- `CONTRIBUTING.md` - Development guidelines
- `.github/workflows/` - CI/CD workflow definitions
- `scripts/ops/` - Operational scripts
