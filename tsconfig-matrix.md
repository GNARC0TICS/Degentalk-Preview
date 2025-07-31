# Monorepo TypeScript Config Matrix

_Generated: 2025-07-30T07:33:39.948Z_

## 📊 Summary

- **Total Workspaces:** 7
- **Workspaces with tsconfig.json:** 6
- **Workspaces without tsconfig.json:** 1

## 🔗 Extends Chain Analysis

- **@degentalk/client** → `../tsconfig.base.json, ../tsconfig.paths.json`
- **@degentalk/db** → `../tsconfig.base.json, ../tsconfig.paths.json`
- **@degentalk/scripts** → `../tsconfig.base.json, ../tsconfig.paths.json`
- **@degentalk/server** → `../tsconfig.base.json, ../tsconfig.paths.json`
- **@degentalk/shared** → `../tsconfig.base.json, ../tsconfig.paths.json`
- **eslint-plugin-degen** → `../../../../tsconfig.base.json`


## 📦 Module Resolution Analysis

- **@degentalk/client** → `bundler`
- **@degentalk/db** → `bundler`
- **@degentalk/scripts** → `bundler`
- **@degentalk/server** → `bundler`
- **@degentalk/shared** → `bundler`
- **eslint-plugin-degen** → `node`


## 🔒 Strict Settings Analysis

- **@degentalk/db** → `true`
- **eslint-plugin-degen** → `true`


## 🧩 Composite Projects

- **@degentalk/client**
- **@degentalk/db**
- **@degentalk/scripts**
- **@degentalk/server**
- **@degentalk/shared**
- **eslint-plugin-degen**


## 🛣️ Path Alias Analysis


### `@/*`
- **@degentalk/client** → `src/*`

### `@admin/*`
- **@degentalk/client** → `src/features/admin/*`

### `@shared/*`
- **@degentalk/client** → `../shared/*`
- **@degentalk/scripts** → `../shared/*`
- **@degentalk/server** → `../shared/*`

### `@db`
- **@degentalk/scripts** → `../db/index.ts`
- **@degentalk/server** → `../db/index.ts`

### `@db/*`
- **@degentalk/scripts** → `../db/*`
- **@degentalk/server** → `../db/*`

### `@schema`
- **@degentalk/scripts** → `../db/schema/index.ts`
- **@degentalk/server** → `../db/schema/index.ts`

### `@schema/*`
- **@degentalk/scripts** → `../db/schema/*`
- **@degentalk/server** → `../db/schema/*`

### `@server/*`
- **@degentalk/scripts** → `../server/src/*`

### `@core/*`
- **@degentalk/server** → `src/core/*`

### `@domains/*`
- **@degentalk/server** → `src/domains/*`

### `@middleware/*`
- **@degentalk/server** → `src/middleware/*`

### `@utils/*`
- **@degentalk/server** → `src/utils/*`

### `@lib/*`
- **@degentalk/server** → `lib/*`

## 🔗 Project References

- **@degentalk/client** → ../shared/tsconfig.json
- **@degentalk/db** → ../shared/tsconfig.json
- **@degentalk/scripts** → ../shared/tsconfig.json, ../db/tsconfig.json, ../server/tsconfig.json
- **@degentalk/server** → ../shared/tsconfig.json, ../db/tsconfig.json


---
## @degentalk/monorepo

_No tsconfig.json located_

## @degentalk/client

**Path:** `client/tsconfig.json`

### Configuration Details
- **Extends:** `../tsconfig.base.json, ../tsconfig.paths.json`
- **Module Resolution:** `bundler`
- **Module:** `ESNext`
- **Composite:** `true`
- **Base URL:** `.`
- **Include:** `src/**/*, src/**/*.tsx, src/**/*.ts, src/**/*.jsx, src/**/*.js`
- **Exclude:** `node_modules, dist, build, **/*.test.ts, **/*.test.tsx, **/*.spec.ts, **/*.spec.tsx, .tscache`
- **References:** ../shared/tsconfig.json

### Full Configuration
```json
{
  "extends": ["../tsconfig.base.json", "../tsconfig.paths.json"],
  "compilerOptions": {
    "composite": true,
    "incremental": true,
    "tsBuildInfoFile": "./.tscache/client.tsbuildinfo",
    "noEmit": true,
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "types": ["node", "vite/client"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@admin/*": ["src/features/admin/*"],
      "@shared/*": ["../shared/*"]
    }
  },
  "include": [
    "src/**/*",
    "src/**/*.tsx",
    "src/**/*.ts",
    "src/**/*.jsx",
    "src/**/*.js"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    ".tscache"
  ],
  "references": [
    {
      "path": "../shared/tsconfig.json"
    }
  ]
}

```


## @degentalk/db

**Path:** `db/tsconfig.json`

### Configuration Details
- **Extends:** `../tsconfig.base.json, ../tsconfig.paths.json`
- **Module Resolution:** `bundler`
- **Module:** `ESNext`
- **Strict:** `true`
- **Composite:** `true`
- **Base URL:** `.`
- **Include:** `**/*.ts`
- **Exclude:** `node_modules, dist, **/*.test.ts, **/*.spec.ts, .tscache, migrations`
- **References:** ../shared/tsconfig.json

### Full Configuration
```json
{
  "extends": ["../tsconfig.base.json", "../tsconfig.paths.json"],
  "compilerOptions": {
    "composite": true,
    "incremental": true,
    "tsBuildInfoFile": "./.tscache/db.tsbuildinfo",
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "outDir": "./dist",
    "rootDir": ".",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "types": ["node"],
    "baseUrl": "."
  },
  "include": ["**/*.ts"],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts",
    ".tscache",
    "migrations"
  ],
  "references": [
    {
      "path": "../shared/tsconfig.json"
    }
  ]
}

```


## @degentalk/scripts

**Path:** `scripts/tsconfig.json`

### Configuration Details
- **Extends:** `../tsconfig.base.json, ../tsconfig.paths.json`
- **Module Resolution:** `bundler`
- **Module:** `ESNext`
- **Composite:** `true`
- **Base URL:** `.`
- **Include:** `**/*.ts`
- **Exclude:** `node_modules, dist, **/*.test.ts, **/*.spec.ts, .tscache`
- **References:** ../shared/tsconfig.json, ../db/tsconfig.json, ../server/tsconfig.json

### Full Configuration
```json
{
  "extends": ["../tsconfig.base.json", "../tsconfig.paths.json"],
  "compilerOptions": {
    "composite": true,
    "incremental": true,
    "tsBuildInfoFile": "./.tscache/scripts.tsbuildinfo",
    "noEmit": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "types": ["node"],
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["../shared/*"],
      "@db": ["../db/index.ts"],
      "@db/*": ["../db/*"],
      "@schema": ["../db/schema/index.ts"],
      "@schema/*": ["../db/schema/*"],
      "@server/*": ["../server/src/*"]
    }
  },
  "include": ["**/*.ts"],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts",
    ".tscache"
  ],
  "references": [
    {
      "path": "../shared/tsconfig.json"
    },
    {
      "path": "../db/tsconfig.json"
    },
    {
      "path": "../server/tsconfig.json"
    }
  ]
}

```


## @degentalk/server

**Path:** `server/tsconfig.json`

### Configuration Details
- **Extends:** `../tsconfig.base.json, ../tsconfig.paths.json`
- **Module Resolution:** `bundler`
- **Module:** `ESNext`
- **Composite:** `true`
- **Base URL:** `.`
- **Include:** `src/**/*, lib/**/*, index.ts, register-path-aliases.ts, routes.ts`
- **Exclude:** `node_modules, dist, build, **/*.test.ts, **/*.spec.ts, **/*.bak.ts, .tscache, src/domains/_new-wallet/**`
- **References:** ../shared/tsconfig.json, ../db/tsconfig.json

### Full Configuration
```json
{
  "extends": ["../tsconfig.base.json", "../tsconfig.paths.json"],
  "compilerOptions": {
    "composite": true,
    "incremental": true,
    "tsBuildInfoFile": "./.tscache/server.tsbuildinfo",
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": false,
    "outDir": "./dist",
    "rootDir": ".",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "types": ["node"],
    "baseUrl": ".",
    "paths": {
      "@core/*": ["src/core/*"],
      "@domains/*": ["src/domains/*"],
      "@middleware/*": ["src/middleware/*"],
      "@utils/*": ["src/utils/*"],
      "@lib/*": ["lib/*"],
      "@shared/*": ["../shared/*"],
      "@db": ["../db/index.ts"],
      "@db/*": ["../db/*"],
      "@schema": ["../db/schema/index.ts"],
      "@schema/*": ["../db/schema/*"]
    }
  },
  "include": [
    "src/**/*",
    "lib/**/*",
    "index.ts",
    "register-path-aliases.ts",
    "routes.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build",
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/*.bak.ts",
    ".tscache",
    "src/domains/_new-wallet/**"
  ],
  "references": [
    {
      "path": "../shared/tsconfig.json"
    },
    {
      "path": "../db/tsconfig.json"
    }
  ]
}

```


## @degentalk/shared

**Path:** `shared/tsconfig.json`

### Configuration Details
- **Extends:** `../tsconfig.base.json, ../tsconfig.paths.json`
- **Module Resolution:** `bundler`
- **Module:** `ESNext`
- **Composite:** `true`
- **Base URL:** `.`
- **Include:** `**/*.ts, **/*.tsx`
- **Exclude:** `node_modules, dist, **/*.test.ts, **/*.spec.ts, .tscache`

### Full Configuration
```json
{
  "extends": ["../tsconfig.base.json", "../tsconfig.paths.json"],
  "compilerOptions": {
    "composite": true,
    "incremental": true,
    "tsBuildInfoFile": "./.tscache/shared.tsbuildinfo",
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "outDir": "./dist",
    "rootDir": ".",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["node"],
    "baseUrl": "."
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts",
    ".tscache"
  ]
}

```


## eslint-plugin-degen

**Path:** `tools/eslint/plugins/degen/tsconfig.json`

### Configuration Details
- **Extends:** `../../../../tsconfig.base.json`
- **Module Resolution:** `node`
- **Target:** `ES2022`
- **Module:** `CommonJS`
- **Strict:** `true`
- **Composite:** `true`
- **Base URL:** `.`
- **Include:** `./**/*.js, ./**/*.cjs, ./index.js`
- **Exclude:** `node_modules, dist`

### Full Configuration
```json
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "module": "CommonJS",
    "target": "ES2022",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "composite": true,
    "outDir": "./dist",
    "baseUrl": "."
  },
  "include": ["./**/*.js", "./**/*.cjs", "./index.js"],
  "exclude": ["node_modules", "dist"]
}

```


---
## 🚨 Warnings & Issues

- **@degentalk/monorepo** → _no tsconfig.json found_
- Path alias **@shared/*** used by 3 packages: @degentalk/client, @degentalk/scripts, @degentalk/server
- Path alias **@db** used by 2 packages: @degentalk/scripts, @degentalk/server
- Path alias **@db/*** used by 2 packages: @degentalk/scripts, @degentalk/server
- Path alias **@schema** used by 2 packages: @degentalk/scripts, @degentalk/server
- Path alias **@schema/*** used by 2 packages: @degentalk/scripts, @degentalk/server
