# TypeScript Architecture Guide

## Overview

This monorepo uses a production-ready TypeScript configuration architecture designed for:
- **Fast incremental builds** (<5s for typecheck)
- **Zero path confusion** with centralized aliases
- **Full strict mode** across all packages
- **Clear dependency graph** using project references
- **Developer-friendly workflow** with intelligent caching

## Architecture Components

### 1. Configuration Hierarchy

```
tsconfig.base.json          # Shared compiler options (strict mode, etc.)
tsconfig.paths.json         # Centralized path aliases
tsconfig.json               # Root orchestrator with project references
├── shared/tsconfig.json    # Foundation package config
├── db/tsconfig.json        # Database package config
├── server/tsconfig.json    # Server package config
├── client/tsconfig.json    # Client package config
└── scripts/tsconfig.json   # Scripts package config
```

### 2. Key Files

#### `tsconfig.base.json`
- Contains all shared compiler options
- Enforces full strict mode across the monorepo
- Configures ES2022 target with modern features
- Enables incremental compilation by default

#### `tsconfig.paths.json`
- Single source of truth for all path aliases
- Eliminates duplicate path definitions
- Maintains consistency across workspaces
- Easy to update and maintain

#### Root `tsconfig.json`
- Orchestrates the entire build process
- Uses project references for dependency management
- Enables parallel type checking
- No actual source files (pure orchestrator)

### 3. Workspace-Specific Configurations

Each workspace extends both base configs:
```json
{
  "extends": ["../tsconfig.base.json", "../tsconfig.paths.json"],
  // Workspace-specific overrides...
}
```

## Build Performance

### Incremental Builds
- Each workspace maintains its own `.tsbuildinfo` cache
- Stored in `.tscache/` directory (gitignored)
- Enables <5s incremental type checks
- Automatically detects changed files

### Build Commands

```bash
# Fast incremental type check (recommended)
pnpm typecheck

# Full rebuild (clears cache first)
pnpm typecheck:all

# Watch mode for development
pnpm typecheck:watch

# Clean all caches
pnpm typecheck:clean
```

## Path Aliases

All path aliases are defined in `tsconfig.paths.json`:

### Client Aliases
- `@/*` → `client/src/*`
- `@admin/*` → `client/src/features/admin/*`

### Server Aliases
- `@core/*` → `server/src/core/*`
- `@domains/*` → `server/src/domains/*`
- `@middleware/*` → `server/src/middleware/*`
- `@utils/*` → `server/src/utils/*`
- `@lib/*` → `server/lib/*`

### Database Aliases
- `@db` → `db/index.ts`
- `@db/*` → `db/*`
- `@schema` → `db/schema/index.ts`
- `@schema/*` → `db/schema/*`

### Shared Aliases
- `@shared/*` → `shared/*` (available in all workspaces)

### Special Cases
- `@server/*` → Only available in scripts workspace

## Dependency Graph

```
shared (foundation - no dependencies)
  ↑
  ├── db (depends on shared)
  │    ↑
  │    └── server (depends on shared, db)
  │         ↑
  │         └── scripts (depends on all)
  │
  └── client (depends on shared only)
```

## Best Practices

### 1. Always Use Path Aliases
```typescript
// ✅ Good
import { User } from '@shared/types/user.types';
import { logger } from '@core/logger';

// ❌ Bad
import { User } from '../../../shared/types/user.types';
import { logger } from './core/logger';
```

### 2. Respect Workspace Boundaries
- Client cannot import from server
- Server cannot import from client
- Scripts can import from anywhere (for tooling)
- Shared cannot import from any other workspace

### 3. Leverage Incremental Builds
- Run `pnpm typecheck` frequently during development
- Avoid `pnpm typecheck:clean` unless necessary
- Use `pnpm typecheck:watch` for real-time feedback

### 4. Production Builds
Use the optimized build configs:
```bash
# For production builds
tsc -b tsconfig.build.json
```

These configs:
- Disable incremental compilation
- Remove source maps and comments
- Optimize for smallest output

## Troubleshooting

### Slow Type Checking
1. Check if `.tscache/` exists
2. Run `pnpm typecheck:clean` and retry
3. Ensure you're using `pnpm typecheck` not `tsc` directly

### Path Alias Issues
1. Verify the alias exists in `tsconfig.paths.json`
2. Restart your IDE/TypeScript service
3. Check that the target path exists

### Circular Dependencies
1. Check the dependency graph above
2. Move shared types to `@shared/types`
3. Use type-only imports when possible

### Build Errors
1. Run `pnpm typecheck:all` for a full rebuild
2. Check individual workspace errors
3. Verify all workspaces have `composite: true`

## Migration Guide

When adding new workspaces:

1. Create `workspace/tsconfig.json`:
```json
{
  "extends": ["../tsconfig.base.json", "../tsconfig.paths.json"],
  "compilerOptions": {
    "composite": true,
    "incremental": true,
    "tsBuildInfoFile": "./.tscache/workspace.tsbuildinfo"
  },
  "references": [
    // Add references to dependencies
  ]
}
```

2. Add to root `tsconfig.json` references
3. Update dependency graph if needed
4. Test with `pnpm typecheck`

## Performance Metrics

Typical build times on modern hardware:
- Initial build: 15-30s
- Incremental (no changes): <1s
- Incremental (few files): 2-5s
- Full rebuild: 20-40s

Cache sizes:
- `.tscache/`: ~50-100MB total
- Individual `.tsbuildinfo`: 5-20MB each