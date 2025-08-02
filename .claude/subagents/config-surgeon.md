# Agent 5: The Config Surgeon 🔧

## Mission Statement
**Fix TypeScript build configuration to enable successful compilation**

## CRITICAL PATH RULES
- Your working directory is: `/home/developer/Degentalk-BETA`
- ALWAYS use absolute paths or `cd /home/developer/Degentalk-BETA` before commands
- The project root is configured in your environment as `$DEGENTALK_ROOT`

## Domain & Scope
- **Files**: `tsconfig*.json`, package.json build scripts, path aliases
- **Duration**: 30-45 minutes
- **Priority**: CRITICAL (blocks everything else)

## Target Error Patterns
```typescript
// 1. RootDir issues
error TS6059: File not under 'rootDir'. 'rootDir' is expected to contain all source files

// 2. Module resolution failures
error TS2742: The inferred type of 'router' cannot be named without a reference to external module

// 3. Path alias resolution in build
error TS2307: Cannot find module '@core/logger' (works in dev, fails in build)

// 4. Cross-workspace import issues
error TS6059: File '../shared/types.ts' is not under 'rootDir'

// 5. Build script configuration
error TS5042: Option 'project' cannot be mixed with source files on a command line
```

## Current Build Configuration Issues

### Problem Analysis
Based on the current errors, the issues are:

1. **rootDir too restrictive** - Can't include cross-workspace files
2. **Module resolution in build** - Path aliases not working
3. **Include/exclude patterns** - Not optimized for monorepo
4. **Output configuration** - Build artifacts in wrong places

## Configuration Fixes

### 1. server/tsconfig.build.json - The Critical Fix
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "rootDir": "..",                    // Allow cross-workspace files
    "outDir": "./dist",                 // Keep output in server/dist
    "noEmit": false,                    // Actually build files
    "declaration": true,                // Generate .d.ts files
    "declarationMap": true,             // Source maps for declarations
    "sourceMap": true,                  // Source maps for debugging
    "composite": false,                 // Disable composite for build
    "tsBuildInfoFile": "./dist/.tsbuildinfo"
  },
  "include": [
    "src/**/*.ts",                      // Server source files
    "../shared/**/*.ts",                // Shared types and utilities
    "../db/**/*.ts"                     // Database schemas
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts",
    "src/test/**/*",
    "../shared/**/*.test.ts",
    "../db/**/*.test.ts",
    "../client/**/*",                   // Exclude client files
    "../scripts/**/*"                   // Exclude scripts
  ]
}
```

### 2. server/tsconfig.json - Development Config
```json
{
  "extends": "../tsconfig.base.json",
  "include": ["src/**/*"],
  "exclude": [
    "../node_modules",
    "build",
    "dist",
    "../client/**/*",
    "**/*.bak.ts",
    "**/*.bak.tsx",
    "../UIVERSE",
    "../archive/**/*",
    "../shared/fixtures/**",
    "../scripts/templates/**",
    "test/**",
    "tests/**",
    "**/*.test.ts",
    "**/*.spec.ts",
    "utils/**",
    "src/domains/_new-wallet/**"
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "composite": true,
    "allowImportingTsExtensions": true,
    "emitDeclarationOnly": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "outDir": "./dist",
    "types": ["node"],
    
    // Path aliases - ensure these work in build
    "paths": {
      // Server-specific paths
      "@core/*": ["src/core/*"],
      "@domains/*": ["src/domains/*"],
      "@middleware/*": ["src/middleware/*"],
      "@utils/*": ["src/utils/*"],
      "@lib/*": ["lib/*"],
      
      // Cross-workspace paths
      "@shared/*": ["../shared/*"],
      "@db": ["../db/index.ts"],
      "@db/*": ["../db/*"],
      "@schema": ["../db/schema/index.ts"],
      "@schema/*": ["../db/schema/*"]
    }
  }
}
```

### 3. Root tsconfig.base.json - Monorepo Base
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "nodenext",
    "baseUrl": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    
    // Global path aliases for all workspaces
    "paths": {
      // Client paths
      "@app/*": ["client/src/*"],
      "@/*": ["client/src/*"],
      
      // Server paths  
      "@core/*": ["server/src/core/*"],
      "@domains/*": ["server/src/domains/*"],
      
      // Shared paths
      "@shared/*": ["shared/*"],
      
      // Database paths
      "@db": ["db/index.ts"],
      "@schema": ["db/schema/index.ts"]
    }
  }
}
```

## Build Script Fixes

### server/package.json
```json
{
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "build:clean": "rm -rf dist && pnpm build",
    "build:check": "tsc -p tsconfig.build.json --noEmit",
    "typecheck": "tsc --noEmit",
    "dev": "tsx --tsconfig ./tsconfig.json index.ts"
  }
}
```

## Module Resolution Fixes

### Ensure Path Aliases Work in Build
The key issue is that path aliases work in development but fail in build. This is because:

1. **Development** uses `moduleResolution: "bundler"` 
2. **Build** needs proper path mapping

Fix by ensuring `tsconfig.build.json` includes all necessary path mappings and files.

### Router Type Inference Fix
The "cannot be named" error is caused by Express types not being properly resolved:

```typescript
// ❌ PROBLEM - Inferred router type fails
const router = express.Router(); // Type inference fails

// ✅ FIX - Explicit typing
import { Router } from 'express';
const router: Router = express.Router();

// OR use type annotation in function signature
export const createRouter = (): Router => {
  return express.Router();
};
```

## Quick Fixes for Immediate Issues

### 1. Fix Package.json Build Command
```bash
# Remove any stray arguments from build command
# Check server/package.json for: "build": "tsc -p tsconfig.build.json"
# NOT: "build": "tsc -p tsconfig.build.json 2" (which caused earlier error)
```

### 2. Verify Path Alias Resolution
```bash
# Test that aliases resolve correctly
npx tsc --showConfig -p server/tsconfig.build.json | grep -A10 "paths"

# Should show all @core/*, @domains/*, @shared/*, etc.
```

### 3. Clean Build Test
```bash
# Test clean build
cd server
rm -rf dist
pnpm build

# Should complete without rootDir errors
```

## Workflow

### Step 1: Fix Build Configuration
```bash
# Update tsconfig.build.json with proper rootDir and includes
# Test: npx tsc -p tsconfig.build.json --noEmit
```

### Step 2: Verify Path Aliases
```bash
# Check aliases resolve in build mode
npx tsc --showConfig -p server/tsconfig.build.json | grep paths

# Test specific alias resolution
npx tsc --noEmit --moduleResolution node server/src/utils/dev-auth-startup.ts
```

### Step 3: Test Cross-Workspace Includes
```bash
# Ensure shared and db files are included properly
npx tsc -p server/tsconfig.build.json --listFiles | grep shared
npx tsc -p server/tsconfig.build.json --listFiles | grep db
```

## Success Criteria
- [ ] `npx tsc -p server/tsconfig.build.json` completes successfully
- [ ] All path aliases resolve correctly in build mode
- [ ] Cross-workspace imports work (`../shared/`, `../db/`)
- [ ] Build output generates in correct location (`server/dist/`)
- [ ] No "rootDir" or "cannot be named" errors
- [ ] Module resolution works for all imports

## Testing Commands
```bash
# Primary test - should exit with code 0
cd /home/developer/Degentalk-BETA/server && npx tsc -p tsconfig.build.json

# Check output structure
cd /home/developer/Degentalk-BETA && ls -la server/dist/

# Verify aliases work
cd /home/developer/Degentalk-BETA/server && npx tsc --showConfig -p tsconfig.build.json | grep -A20 paths

# Test specific problematic files
cd /home/developer/Degentalk-BETA/server && npx tsc --noEmit src/domains/admin/sub-domains/titles/titles.routes.ts
```

## Commit Strategy
```bash
# Single commit for build config
git add server/tsconfig.build.json server/tsconfig.json tsconfig.base.json
git commit -m "fix(config): resolve monorepo build configuration for cross-workspace imports"

# Test build after commit
git commit -m "test: verify build configuration works" --allow-empty
```

## Emergency Rollback Plan
If build breaks worse:

```bash
# Rollback to working dev config
git checkout HEAD~1 -- server/tsconfig.build.json

# Use alternative build command
cd server && npx tsc --outDir dist --rootDir ../
```

## Rules
- ✅ Make minimal changes for maximum impact
- ✅ Test each configuration change immediately
- ✅ Ensure dev and build configs are compatible
- ✅ Keep aliases consistent across all configs
- ❌ Don't change fundamental project structure
- ❌ Don't break existing dev workflow
- ❌ Don't modify generated files

**Mission: Get `pnpm build` to exit with code 0!**