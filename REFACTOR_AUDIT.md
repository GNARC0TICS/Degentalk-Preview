# Degentalk Monorepo Refactoring: Pre-Flight Audit

This document contains the pre-flight analysis of the Degentalk monorepo to ensure the refactoring plan is precise and accounts for all known edge cases.

## 1. TypeScript Path Alias Inventory

This section inventories all `tsconfig.json` files and their `paths` configurations. This is the "before" state that the codemods will need to transform into the new, unified alias structure.

### `tsconfig.json` (Root)
- **Extends:** None
- **Aliases:**
  - `@/*`: `client/src/*`
  - `@admin/*`: `client/src/features/admin/*`
  - `@server/*`: `server/src/*`
  - `@db`: `db/index.ts`
  - `@schema`: `db/schema/index.ts`
  - `@shared/*`: `shared/*`
  - `@utils/*`: `client/src/utils/*`

### `client/tsconfig.json`
- **Extends:** `../tsconfig.base.json`
- **Aliases:**
  - `@/*`: `src/*`
  - `@shared/*`: `../shared/*`
  - `@assets/*`: `../attached_assets/*`
  - `@db`: `../db/index.ts`
  - `@db_types/*`: `../db/types/*`
  - `@schema`: `../db/schema/index.ts`
  - `@schema/*`: `../db/schema/*`

### `server/tsconfig.json`
- **Extends:** `../tsconfig.json`
- **Aliases:**
  - `@config/*`: `../config/*`
  - `@shared/types`: `../shared/types/index.ts`
  - `@shared/types/ids`: `../shared/types/ids.ts`
  - `@shared/*`: `../shared/*`
  - `@server/*`: `src/*`, `./*`
  - `@server-core/*`: `src/core/*`
  - `@core/*`: `src/core/*`
  - `@server-utils/*`: `src/utils/*`
  - `@server-middleware/*`: `src/middleware/*`
  - `@db`: `../db/index.ts`
  - `@db/schema`: `../db/schema/index.ts`
  - `@schema`: `../db/schema/index.ts`
  - `@schema/*`: `../db/schema/*`
  - `@db_types/*`: `../db/types/*`
  - `@db/types`: `../db/types/index.ts`
  - `@db/types/*`: `../db/types/*`
  - `@db/schema/core/enums`: `../db/schema/core/enums/index.ts`
  - `@degentalk/db/types`: `../db/types/index.ts`
  - `@lib/*`: `../lib/*`
  - `@forum-sdk/*`: `../forum-sdk/*`

### `scripts/tsconfig.json`
- **Extends:** `../tsconfig.base.json`
- **Aliases:**
  - `@degentalk/db`: `../db/index.ts`
  - `@degentalk/shared`: `../shared/index.ts`
  - `@shared/*`: `../shared/*`
  - `@db/*`: `../db/*`
  - `@server/*`: `../server/src/*`
  - `@core/*`: `../server/src/core/*`

### `db/tsconfig.json`
- **Extends:** `../tsconfig.json`
- **Aliases:** None

### `shared/tsconfig.json`
- **Extends:** `../tsconfig.base.json`
- **Aliases:** None

---

## 2. Hardcoded Path Inventory

This section lists all commands, primarily from the root `package.json`, that use hardcoded paths to scripts or directories. These will need to be updated manually during the refactor.

### Root `package.json` Scripts

- `"dev:login": "tsx scripts/dev-login.ts"`
- `"dev:logout": "tsx scripts/dev-logout.ts"`
- `"docker:dev": "./scripts/docker-dev.sh dev"`
- `"docker:claude": "./scripts/docker-dev.sh claude"`
- `"docker:prod": "./scripts/docker-dev.sh prod"`
- `"docker:build": "./scripts/docker-dev.sh build"`
- `"docker:clean": "./scripts/docker-dev.sh clean"`
- `"validate:boundaries": "node scripts/validation/validate-boundaries.cjs"`
- `"validate:dependencies": "node scripts/validation/validate-dependencies.cjs"`
- `"cache:smoke": "FEATURE_CACHING=true tsx scripts/cache-smoke.ts"`
- `"cache:health": "tsx scripts/cache-smoke.ts --health"`
- `"cache:test-decorators": "tsx scripts/cache-decorator-test.ts"`
- `"seed:users:tokens": "tsx scripts/db/seed-users-with-tokens.ts"`
- `"seed:enhanced": "tsx scripts/seed/run-enhanced-seed.ts"`
- `"validate:uuid": "tsx scripts/validation/validate-uuid-migration.ts"`
- `"audit:uuid": "tsx scripts/migration/generate-uuid-audit.ts"`
- `"generate:id-aliases": "tsx scripts/migration/generate-id-aliases.ts"`
- `"codemod:plan": "tsx scripts/codemods/generate-id-codemod-plan.ts"`
- `"codemod:legacy-dry": "tsx scripts/codemods/apply-id-codemod.ts --dry"`
- `"codemod:apply": "tsx scripts/codemods/apply-id-codemod.ts"`
- `"codemod:tsmorph:dry": "tsx scripts/codemods/apply-id-codemod-tsmorph.ts --dry"`
- `"codemod:tsmorph:apply": "tsx scripts/codemods/apply-id-codemod-tsmorph.ts"`
- `"migration:analyze": "tsx scripts/migration/analyze-codebase.ts"`
- `"migration:detect-ids": "tsx scripts/migration/identify-numeric-ids.ts"`
- `"migration:check-ids": "tsx scripts/migration/check-ids-ci.ts"`
- `"migration:update-baseline": "tsx scripts/migration/update-baseline.ts"`
- `"migration:test-baseline": "tsx scripts/migration/test-update-baseline.ts"`
- `"migration:forum-core:dry": "tsx scripts/migration/domain-migrations/forum-core-migration.ts"`
- `"migration:forum-core:live": "tsx scripts/migration/domain-migrations/forum-core-migration.ts --live"`
- `"migration:client-types:dry": "tsx scripts/migration/domain-migrations/client-types-migration.ts"`
- `"migration:client-types:live": "tsx scripts/migration/domain-migrations/client-types-migration.ts --live"`
- `"migration:client-api:dry": "tsx scripts/migration/domain-migrations/client-api-migration.ts"`
- `"migration:client-api:live": "tsx scripts/migration/domain-migrations/client-api-migration.ts --live"`
- `"generate:tree": "node scripts/tools/generate-tree.js"`
- `"db:generate": "drizzle-kit generate --dialect postgresql --schema \"./db/schema/**/*.ts\" --out ./migrations/postgres"`
- `"phase5:validate": "tsx scripts/phase5/validate-phase5.ts"`
- `"phase5:rollback": "tsx scripts/phase5/rollback.ts"`
- `"codemod:console": "tsx scripts/codemods/phase5/console-to-logger.ts"`
- `"codemod:req-user": "tsx scripts/codemods/phase5/req-user-removal.ts"`
- `"codemod:transformers": "tsx scripts/codemods/phase5/enforce-transformers.ts"`
- `"codemod:numeric-ids": "tsx scripts/codemods/phase5/numeric-id-migration.ts"`
- `"codemod:all": "tsx scripts/codemods/phase5/run-all.ts"`
- `"codemod:dry": "tsx scripts/codemods/phase5/run-all.ts --dry-run"`
- `"codemod:test": "tsx scripts/codemods/phase5/test-compilation.ts"`
- `"db:sync:forums": "tsx -r tsconfig-paths/register scripts/db/sync-forum-config.ts"`

### Other Configuration Files
- `eslint-plugin-degen`: `file:./eslint-plugins/degen`

---
