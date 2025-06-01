# Consolidated Learnings

This file contains curated, summarized, and actionable insights derived from the raw reflection log (`docs/memory-bank/raw_reflection_log.md`). This serves as the primary, refined knowledge base for long-term use.

## General Patterns

### Codebase Analysis from Documentation

*   **Pattern:** Synthesizing codebase state and development progress requires cross-referencing information from multiple documentation sources (READMEs, planning documents, existing knowledge base files, rule definitions).
*   **Rationale:** Different documents provide varying levels of detail and focus (e.g., feature-specific roadmaps vs. overall project status vs. technical constraints), and combining insights provides a more comprehensive and accurate understanding.

### Troubleshooting Drizzle ORM SQL Migration Errors
*   **Context:** Errors encountered during `npx drizzle-kit migrate` or similar Drizzle migration application processes.
*   **Common Errors & Solutions:**
    *   `multiple primary keys for table "X" are not allowed`:
        *   **Cause:** Attempting to `ADD COLUMN ... PRIMARY KEY` when a PK already exists.
        *   **Solution:** Add the new column without `PRIMARY KEY`, then after dropping the old PK column (if applicable), use `ALTER TABLE "X" ADD PRIMARY KEY (new_column_name);`.
    *   `cannot drop type "Y" because other objects depend on it`:
        *   **Cause:** Attempting to `DROP TYPE` for an ENUM used by a table column.
        *   **Solution:** If the ENUM is meant to persist, remove the `DROP TYPE "Y";` statement.
    *   `type "Z" already exists`:
        *   **Cause:** Attempting `CREATE TYPE` for an ENUM that already exists and wasn't dropped.
        *   **Solution:** Remove the redundant `CREATE TYPE "Z";` if the definition is identical.
    *   `type "public.X" does not exist` (when altering column type):
        *   **Cause:** An earlier migration dropped or renamed type "X" (e.g., to "X_enum"), and a later migration uses the old name.
        *   **Solution:** Ensure consistency. If an ENUM was renamed, update subsequent migrations to use the new name. If dropped incorrectly, remove the `DROP TYPE` from the earlier migration.
*   **General Strategy:**
    1.  Examine the specific error message for table and type names.
    2.  Review the failing migration script and preceding scripts to understand the sequence of DDL operations.
    3.  Pay close attention to `CREATE TYPE`, `DROP TYPE`, `ADD PRIMARY KEY`, and `DROP COLUMN` (that might be a PK) statements.
    4.  Ensure that types are not dropped while in use and that primary keys are managed correctly.
    5.  If an ENUM is renamed, ensure all subsequent references use the new name.
    6.  If an ENUM is intended to be used across multiple migrations, ensure it's not dropped prematurely.

### Debugging Silent Node.js Script Exits (e.g., Server Not Staying Alive)
*   **Context:** Particularly relevant for scripts using `async` IIFEs for server startup, where the script exits cleanly (e.g., code 0) but the server doesn't start listening or stay running.
*   **Diagnostic Strategy:**
    1.  **Detailed Logging:** Add `console.log` statements at critical junctures: before the IIFE, upon entering the IIFE, within its `try...catch` block, and around major `await` points or function calls.
    2.  **IIFE Simplification & Isolation:**
        *   Test a basic synchronous IIFE (`(function() { console.log('sync'); })();`) to confirm IIFE execution at that point in the script.
        *   Test a minimal `async` IIFE (`(async function() { console.log('async'); })();`) to check if `async` itself is an issue.
    3.  **Incremental Logic Reintroduction:** Gradually add the original application logic (especially `await` calls, external module initializations, and `server.listen()`) back into a confirmed working `async` IIFE structure, testing after each addition.
    4.  **Robust Error Handling in IIFE:** Ensure the main `try...catch` block within the IIFE re-throws critical errors or calls `process.exit(1)` to provide clear failure signals, rather than silently catching errors and allowing the script to terminate cleanly.
*   **Observation (ForumFusion with Vite):** In a development environment, `await setupVite(app, server)` (Vite HMR setup) can keep the Node.js process alive due to Vite's own server, even before the main application's `server.listen()` is called.

### Robust Database Seed Script Practices
*   **Dependency Management:**
    *   Seed scripts creating records with foreign key dependencies must ensure the referenced records exist first.
    *   **Strategy 1 (Preferred for essential data):** Ensure prerequisite seeders or database migrations populate dependency tables with required default data.
    *   **Strategy 2 (For development seeders):** Conditionally create the dependency within the seeder script itself (e.g., check if `group_id=1` exists in `user_groups`; if not, insert it). Use `ON CONFLICT DO NOTHING` or similar for idempotency.
*   **Schema Awareness:**
    *   When writing raw SQL queries in seeders, always verify actual database column names against the authoritative schema definition (e.g., Drizzle ORM schema file, migration scripts). Assumptions about column names (e.g., `group_name` vs. `name`) can lead to "column does not exist" errors.

## Project-Specific Learnings (ForumFusion)

### Database Schema Management & Key Files
*   **Primary Source of Truth:** Drizzle ORM migration files in the `migrations/` folder define the applied database schema.
*   **Drizzle Kit Configuration (`drizzle.config.ts`):** Currently points to `shared/schema.ts` for schema definitions. This file contains Drizzle ORM TypeScript table objects.
*   **Inconsistency Note:** `shared/schema.ts` is marked as "archived" in some documentation, and `server/src/database.ts` also imports from it. This needs alignment; ideally, `drizzle.config.ts` should point to the active, canonical Drizzle schema definition files if they differ from `shared/schema.ts`. For now, `shared/schema.ts` is the reference for Drizzle table object definitions.
*   **`user_groups` Table:**
    *   The PK column is defined in Drizzle as `id` but maps to `group_id` in the database.
    *   The column for the group's display name is `name`.
*   **`seedDevUser` Script:**
    *   Depends on `group_id=1` existing in the `user_groups` table.
    *   Modified to conditionally create this group if absent, using `name` for the group name column.

### Codebase Structure & Migration
*   **Client:** Actively migrating to a feature-based structure (`client/src/features/`).
*   **Server:** Actively migrating to a domain-driven structure (`server/src/domains/`). Legacy routes in the root `server/` directory need migration.
*   **Actionable Item:** Continue these migration efforts.

### Utility & API Client Consolidation
*   **Insight:** Duplicate implementations exist for common utilities (logging) and API/query clients.
*   **Actionable Item:** Consolidate logging utilities. Standardize client-side API calls to use `apiRequest` from `@/lib/queryClient.ts` (per `.cursor/rules/api-client-pattern.mdc`).

### Express.js Controller Instantiation
*   **Pattern:** When using class methods as Express route handlers, bind the method to an *instance* of the controller, not the class itself, if the method is not static or relies on `this` context.
    *   Correct: `const myController = new MyController(); router.get('/', myController.handleRequest.bind(myController));`
    *   Incorrect (can lead to `TypeError`): `router.get('/', MyController.handleRequest.bind(MyController));`
    *   This was relevant for `CCPaymentWebhookController`.

### Drizzle Kit Migration Generation (Post v0.21.0)
*   **Command:** The command `drizzle-kit generate:<dialect>` (e.g., `drizzle-kit generate:pg`) is deprecated.
*   **New Command:** Use `drizzle-kit generate`. This command reads the `dialect`, `schema` path, and `out` path from `drizzle.config.ts`.
*   **NPM Script:** It's good practice to have an npm script for this, e.g., `"db:migrate": "drizzle-kit generate"` in `package.json`, which can then be run with `npm run db:migrate`.
*   **Troubleshooting `MODULE_NOT_FOUND`:** When migrating to a modular schema structure (e.g., `db/schema/*`), ensure all inter-schema file imports use correct relative paths (e.g., `../user/users.ts` from within another domain like `../core/enums.ts`). Incorrect paths will cause `drizzle-kit generate` to fail with `Error: Cannot find module ...`.
*   **Troubleshooting `ReferenceError: <type> is not defined`:** If a Drizzle type (e.g., `boolean`, `text`) is used in a schema file without being imported from `drizzle-orm/pg-core` (or the relevant core for other dialects), `drizzle-kit generate` will fail with a `ReferenceError`.

---
