# Cursor Rules for DegenTalk Development

## Active Rules (Restored & Essential)

### 🚨 **Critical Rules** (Always Applied)
1. **`schema-consistency.mdc`** - Prevents database field errors (CRITICAL)
2. **`import-patterns.mdc`** - Enforces proper import/export patterns
3. **`no-untyped-values.mdc`** - Bans `any` types, enforces TypeScript strict mode

### 📋 **Development Rules** (Context-Specific)
4. **`api-client-pattern.mdc`** - Migration from `api` to `apiRequest` (deadline: end of quarter)
5. **`forum-permission-enforcement.mdc`** - Forum access control patterns
6. **`essential-dev-rules.md`** - Quick reference for daily development

### ⚡ **Cheat Code Rules** (Architectural Wins)
7. **`config-first-architecture.mdc`** - Make everything configurable (extends forumMap pattern)
8. **`composable-domain-architecture.mdc`** - Build reusable, composable components

## Rules Not Restored (Analysis)

### Deprecated/Low Priority
- **`route-deprecation.mdc`** - Likely outdated with current routing
- **`update-history.mdc`** - Historical tracking, not needed for active dev
- **`rule-evolution.mdc`** - Meta-rule about rule changes
- **`riper-5.mdc`** - Unclear context, likely project-specific and outdated

### Context-Specific (Restore If Needed)
- **`breadcrumb-consistency.mdc`** - Only needed when working on navigation
- **`navigation-helper.mdc`** - Only needed for nav components
- **`admin-structure.mdc`** - Only needed for admin panel work
- **`npm-script-safety.mdc`** - Build/script safety rules
- **`id-type-consistency.mdc`** - Database ID type consistency
- **`schema-sync-rules.mdc`** - Database synchronization rules
- **`context-mup-protocol.mdc`** - Unclear context
- **`cheat-codes.mdc`** - Development shortcuts/helpers

## Usage in Cursor

These rules automatically provide context to Cursor AI when working on:
- Database queries and schema changes
- Component imports and architecture
- API client usage and migration
- TypeScript type safety
- Forum permission systems
- **Configuration-driven development** (extending forumMap pattern to everything)
- **Composable component architecture** (building reusable, domain-aware components)

## Rule Priority for Development

1. **ALWAYS CHECK**: `schema-consistency.mdc` before any database work
2. **DAILY USE**: `essential-dev-rules.md` for quick patterns
3. **ARCHITECTURAL WINS**: `config-first-architecture.mdc` + `composable-domain-architecture.mdc` for building new features
4. **MIGRATION WORK**: `api-client-pattern.mdc` when updating API calls
5. **IMPORT ISSUES**: `import-patterns.mdc` for import/export problems
6. **TYPE ERRORS**: `no-untyped-values.mdc` for TypeScript strictness

## Adding New Rules

Only add rules that:
- Solve recurring development problems
- Enforce critical architecture patterns
- Prevent production bugs
- Are actively maintained and relevant

Avoid rules that are:
- Historical/deprecated
- Too specific to rare use cases
- Overlapping with existing tooling (ESLint, TypeScript)
- Not enforced consistently