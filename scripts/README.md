# ForumFusion Scripts

This directory contains scripts for various operations in the ForumFusion project.

## Directory Structure

- **db/** - Database and schema-related scripts
  - Schema management and migrations
  - Database seeding and initialization
  - Database queries and utilities

- **auth/** - Authentication-related scripts
  - Auth refactoring and standardization
  - Authentication fixes and utilities

- **wallet/** - Wallet and transaction scripts
  - Wallet refactoring and migration
  - Component and import migration utilities

- **forum/** - Forum-related scripts
  - Forum seeding and structure initialization
  - Test data generation

- **testing/** - Test and validation scripts
  - API tests and validation
  - Mock request testing
  - Domain migration validation

- **tools/** - Development tools
  - Directory tree generation
  - Import checking and fixing
  - Code cleanup and file management

- **ops/** - Operational scripts
  - Sprint setup and initialization
  - System setup scripts

- **templates/** - Template files used by other scripts

## Usage Examples

### Database Scripts

```bash
# Initialize the XP system
npm run xp:init
# or
node scripts/db/initialize-xp-system.ts

# Seed forum structure
node scripts/db/seed-forum-structure.ts
```

### Testing Scripts

```bash
# Run API tests
bash scripts/testing/admin-api-tests.sh

# Validate domain migration
bash scripts/testing/validate-domain-migration.sh
```

### Tools

```bash
# Generate directory tree
node scripts/tools/generate-tree.js > directory-tree.md

# Check imports
node scripts/tools/check-imports.ts
```

## Adding New Scripts

When adding new scripts, please:

1. Place them in the appropriate directory based on functionality
2. Use consistent naming conventions (kebab-case recommended)
3. Include proper documentation and usage examples in the script
4. Update this README if adding a new category or important script 