# DegenTalk Client

This folder contains all frontend code for the DegenTalk platform.

## Current Structure
- `src/components/` — Reusable UI and feature components
- `src/pages/` — Page-level components and route entry points
- `src/hooks/` — Custom React hooks for data and state
- `src/lib/` — Utilities, API clients, and helpers
- `src/styles/` — Tailwind and global CSS
- `src/constants/` — App-wide constants and environment variables
- `public/` — Static assets served at root

## Current Conventions
- All files and folders use kebab-case or lowercase
- UI primitives live in `components/ui/`
- All API calls use shared hooks or `/lib/api/`
- Test/dev files go in `/temp/` or `/archive/`

## Restructuring in Progress
**Important:** We are currently migrating to a feature-based structure as defined in `RESTRUCTURE.md`. New components should follow this structure when possible:

```
client/src/features/[feature-name]/
├── components/        # Feature-specific UI components
├── hooks/             # Feature-specific hooks
├── pages/             # Page components related to this feature
├── services.ts        # API services for this feature
└── utils.ts           # Feature-specific utilities
```

## Completed Restructured Areas
- Admin XP system UI
  - `src/pages/admin/xp/adjust.tsx`
  - `src/pages/admin/xp/badges.tsx`
  - `src/pages/admin/xp/titles.tsx`
  - `src/pages/admin/xp/levels.tsx`
  - `src/pages/admin/xp/settings.tsx`

## Import Patterns
When adding new imports, use the following patterns to ensure consistency:
- Default exports: `import ComponentName from '@/path/to/component'`
- Named exports: `import { functionName } from '@/path/to/module'`
- Always use `@/` path alias for imports from the src directory

See `/docs/structure.md` for a full project map and `.cursor/rules/import-patterns.mdc` for detailed examples of proper import usage.
