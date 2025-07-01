# Degentalk pnpm Monorepo Migration Plan

## Phase 1: Preparation & Setup

### 1.1 Install pnpm

```bash
npm install -g pnpm@latest
pnpm --version  # Verify installation
```

### 1.2 Create Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'client'
  - 'server'
  - 'shared'
  - 'db'
  - 'scripts'
```

### 1.3 Create Root Package Configuration

```json
{
	"name": "@degentalk/monorepo",
	"version": "1.0.0",
	"private": true,
	"type": "module",
	"packageManager": "pnpm@9.15.0",
	"scripts": {
		"dev": "pnpm -r --parallel dev",
		"build": "pnpm -r build",
		"test": "pnpm -r test",
		"lint": "pnpm -r lint",
		"clean": "pnpm -r clean && rm -rf node_modules"
	},
	"devDependencies": {
		"typescript": "5.6.3",
		"eslint": "^8.57.0",
		"prettier": "^3.5.3",
		"concurrently": "^8.2.2",
		"tsx": "^4.19.4"
	}
}
```

## Phase 2: Package Structure Creation

### 2.1 Client Package

```json
// client/package.json
{
	"name": "@degentalk/client",
	"version": "1.0.0",
	"private": true,
	"type": "module",
	"scripts": {
		"dev": "vite --config ../config/vite.config.ts",
		"build": "vite build --config ../config/vite.config.ts",
		"preview": "vite preview",
		"lint": "eslint . --ext .ts,.tsx",
		"typecheck": "tsc --noEmit"
	},
	"dependencies": {
		"@degentalk/shared": "workspace:*",
		"react": "^18.3.1",
		"react-dom": "^18.3.1"
		// ... other React dependencies
	},
	"devDependencies": {
		"@vitejs/plugin-react": "^4.3.2",
		"vite": "^6.3.5"
		// ... other dev dependencies
	}
}
```

### 2.2 Server Package

```json
// server/package.json
{
	"name": "@degentalk/server",
	"version": "1.0.0",
	"private": true,
	"type": "module",
	"scripts": {
		"dev": "tsx --watch src/app.ts",
		"start": "tsx src/app.ts",
		"build": "tsc",
		"lint": "eslint . --ext .ts"
	},
	"dependencies": {
		"@degentalk/shared": "workspace:*",
		"@degentalk/db": "workspace:*",
		"express": "^4.21.2",
		"cors": "^2.8.5"
		// ... other server dependencies
	}
}
```

### 2.3 Shared Package

```json
// shared/package.json
{
	"name": "@degentalk/shared",
	"version": "1.0.0",
	"type": "module",
	"main": "./index.ts",
	"exports": {
		".": "./index.ts",
		"./types": "./types/index.ts",
		"./config": "./config/index.ts",
		"./validators": "./validators/index.ts"
	},
	"dependencies": {
		"zod": "^3.24.2"
	}
}
```

### 2.4 Database Package

```json
// db/package.json
{
	"name": "@degentalk/db",
	"version": "1.0.0",
	"type": "module",
	"main": "./index.ts",
	"scripts": {
		"generate": "drizzle-kit generate",
		"migrate": "drizzle-kit push",
		"studio": "drizzle-kit studio"
	},
	"dependencies": {
		"@degentalk/shared": "workspace:*",
		"drizzle-orm": "^0.43.1",
		"@neondatabase/serverless": "^0.10.4"
	},
	"devDependencies": {
		"drizzle-kit": "^0.31.4"
	}
}
```

## Phase 3: Dependency Migration

### 3.1 Analyze & Categorize Dependencies

```bash
# Extract dependencies by category
pnpm dlx npm-check-updates --packageFile package.json

# Categories:
# - Shared: TypeScript, validation, utilities
# - Client-only: React, UI libraries, Vite
# - Server-only: Express, auth, database
# - Dev tools: Testing, linting, building
```

### 3.2 Move Dependencies Script

```javascript
// scripts/migrate-dependencies.js
const rootPkg = require('../package.json');

const clientDeps = [
	'@radix-ui/*',
	'react*',
	'framer-motion',
	'@tanstack/*',
	'lucide-react' // etc
];

const serverDeps = [
	'express*',
	'passport*',
	'bcrypt*',
	'cors',
	'helmet' // etc
];

// Script to automatically sort dependencies
```

## Phase 4: Path & Import Updates

### 4.1 Update TypeScript Paths

```json
// tsconfig.json (root)
{
	"compilerOptions": {
		"paths": {
			"@degentalk/shared": ["./shared/index.ts"],
			"@degentalk/shared/*": ["./shared/*"],
			"@degentalk/db": ["./db/index.ts"],
			"@degentalk/db/*": ["./db/*"]
		}
	}
}
```

### 4.2 Update Import Statements

```typescript
// Before:
import { UserType } from '@shared/types';
import { db } from '@db';

// After:
import { UserType } from '@degentalk/shared/types';
import { db } from '@degentalk/db';
```

## Phase 5: Build & Scripts Updates

### 5.1 Update npm Scripts

```json
// Root package.json scripts
{
	"scripts": {
		"dev": "pnpm --filter @degentalk/server dev & pnpm --filter @degentalk/client dev",
		"dev:client": "pnpm --filter @degentalk/client dev",
		"dev:server": "pnpm --filter @degentalk/server dev",
		"build": "pnpm -r build",
		"build:client": "pnpm --filter @degentalk/client build",
		"build:server": "pnpm --filter @degentalk/server build",
		"test": "pnpm -r test",
		"lint": "pnpm -r lint",
		"typecheck": "pnpm -r typecheck",
		"clean": "pnpm -r exec rm -rf node_modules dist build",
		"install:clean": "pnpm clean && pnpm install"
	}
}
```

### 5.2 Update CI/CD Workflows

```yaml
# .github/workflows/ci.yml updates
- name: Install pnpm
  uses: pnpm/action-setup@v2
  with:
    version: 9

- name: Install dependencies
  run: pnpm install --frozen-lockfile

- name: Build packages
  run: pnpm build

- name: Test
  run: pnpm test
```

## Phase 6: Optimization

### 6.1 Merge lib/ into shared/

```bash
# Move lib utilities to shared
mv lib/auth shared/lib/
mv lib/forum shared/lib/
mv lib/wallet shared/lib/
# Update imports accordingly
```

### 6.2 Create Config Package

```json
// packages/config/package.json
{
	"name": "@degentalk/config",
	"exports": {
		"./vite": "./vite.config.ts",
		"./tailwind": "./tailwind.config.ts",
		"./drizzle": "./drizzle.config.ts"
	}
}
```

### 6.3 Extract Type-only Packages

```json
// packages/types/package.json
{
	"name": "@degentalk/types",
	"type": "module",
	"exports": {
		".": "./index.ts",
		"./forum": "./forum.types.ts",
		"./user": "./user.types.ts"
	}
}
```

## Phase 7: Testing & Validation

### 7.1 Test Commands

```bash
# Clean install
pnpm install

# Run development
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Type checking
pnpm typecheck
```

### 7.2 Validate Imports

```bash
# Check for broken imports
pnpm -r exec tsc --noEmit

# Verify workspace links
pnpm list --depth 0
```

## Phase 8: Documentation Updates

### 8.1 Update README.md

- New installation instructions
- pnpm commands reference
- Workspace structure diagram
- Development workflow

### 8.2 Update CONTRIBUTING.md

- pnpm workspace guidelines
- Package development rules
- Dependency management

### 8.3 Create Migration Guide

- Changes for developers
- Common issues & solutions
- Command mappings (npm → pnpm)

## Migration Checklist

- [ ] Install pnpm globally
- [ ] Create pnpm-workspace.yaml
- [ ] Create package.json for each workspace
- [ ] Migrate dependencies to appropriate packages
- [ ] Update all import statements
- [ ] Update TypeScript configurations
- [ ] Update build scripts
- [ ] Update CI/CD pipelines
- [ ] Test all functionality
- [ ] Update documentation
- [ ] Train team on pnpm usage
- [ ] Monitor performance improvements

## Rollback Plan

If issues arise:

1. Git checkout to pre-migration branch
2. Delete pnpm-lock.yaml
3. Run `npm install` with original package.json
4. Restore original scripts

## Success Metrics

- [ ] Install time reduced by >50%
- [ ] Build time reduced by >30%
- [ ] All tests passing
- [ ] CI/CD pipeline working
- [ ] No runtime errors
- [ ] Team comfortable with pnpm

Generated: 2025-06-30T00:00:00Z
