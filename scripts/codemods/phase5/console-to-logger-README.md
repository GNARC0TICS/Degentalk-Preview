# Console to Logger Codemod

## Overview
This codemod transforms console.log/warn/error/info/debug/trace statements into appropriate logger calls for both client and server code.

## Features

### Client-side Transformations
- `console.log("msg")` → `logger.info('ComponentName', "msg")`
- `console.error("msg", err)` → `logger.error('ComponentName', "msg", err)`
- Automatically derives component name from file path
- Imports from `@/lib/logger`

### Server-side Transformations  
- `console.log("msg")` → `logger.info("msg")`
- `console.error("msg", err)` → `logger.error(LogAction.SYSTEM_ERROR, "msg", err)`
- Imports from relative path to `server/src/core/logger`
- Adds LogAction enum for error/warn calls

### Smart Features
- Handles multiple arguments appropriately
- Preserves existing logger imports
- Skips logger files themselves
- Skips test files
- Optional shared file handling (experimental)

## Usage

```bash
# Dry run to see what would change
pnpm codemod:console --dry-run

# Execute the transformation
pnpm codemod:console

# Include shared files (experimental)
pnpm codemod:console --include-shared
```

## Files Ignored
- `**/*.test.ts`, `**/*.spec.ts` - Test files
- `client/src/lib/logger.ts` - Client logger itself
- `server/src/core/logger.ts` - Server logger itself
- `server/utils/**` - Wallet CLI utilities
- `shared/types/ids.ts` - Security warnings should remain as console.error
- `node_modules/**` - Dependencies
- `**/*.d.ts` - Type definitions

## Component Name Derivation
For client files, component names are derived from file paths:
- `use-admin-modules.ts` → `useAdminModules`
- `ui-config.tsx` → `UIConfig`
- `ThreadList.tsx` → `ThreadList`

## Current Statistics
- 116 console calls found in 54 client files
- 0 console calls in server files (excluding test files)
- Ready for transformation