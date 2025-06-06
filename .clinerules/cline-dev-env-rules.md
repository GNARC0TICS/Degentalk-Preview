---
description: Rules and best practices for the development environment, particularly concerning script execution and tooling.
globs: ["package.json", "scripts/**/*.ts", "scripts/**/*.js"]
alwaysApply: true
---

# Cline Development Environment Rules

## ⚠️ Cursor Rule: Required Alias Loader for `tsx` Scripts

Any script using `tsx` (or similar Node.js execution environments for TypeScript) that relies on path aliases defined in `tsconfig.json` (e.g., `@/components/...`, `@shared/...`) **must** include the `tsconfig-paths/register` module.

This is typically done by prefixing the `tsx` command with `-r tsconfig-paths/register` or `--require tsconfig-paths/register`.

**Example:**

```bash
tsx -r tsconfig-paths/register path/to/your/script.ts
```

Or in `package.json` scripts:

```json
"scripts": {
  "my-script": "tsx -r tsconfig-paths/register path/to/your/script.ts"
}
```

**Rationale:**

`tsconfig-paths/register` hooks into Node.js's module loading system at runtime, enabling it to understand and correctly resolve the custom path aliases defined in your `tsconfig.json`'s `paths` option. Without it, Node.js (and therefore `tsx`) will not be able to find modules imported using these aliases, leading to "Cannot find module" errors.

**Critical Note:**

Do NOT remove `tsconfig-paths/register` from scripts that depend on path alias resolution unless you have confirmed that an alternative mechanism for alias resolution is in place and functioning correctly for that specific execution context. This is crucial for seed scripts, utility scripts, dynamic loaders, analytics scripts, or any other Node.js-based TypeScript execution that uses path aliases.
